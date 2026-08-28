import { toObservable } from '@angular/core/rxjs-interop';
import { filter, firstValueFrom } from 'rxjs';
import { Injectable, signal, computed, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {
  Auth,
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import {
  Firestore,
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  serverTimestamp
} from 'firebase/firestore';

import { User, UserRole } from '../models/user';
import { environment } from '../../environments/environment';

/**
 * @description Kimlik doğrulama (Authentication) ve yetkilendirme (Authorization)
 * işlemlerini yöneten merkezi servis katmanıdır.
 *
 * Sorumluluk ayrımı:
 * - Firebase Authentication  → "Sen kimsin?"  (Google hesabı ile kimlik doğrulama)
 * - Firestore users/{uid}    → "Ne yapabilirsin?" (rol bilgisi)
 *
 * Google kimliği bize kullanıcının kim olduğunu söyler ancak rolünü bilmez.
 * Rol daima Firestore'daki `users` koleksiyonundan okunur ve Security Rules
 * ile istemci yazımına kapatılmıştır.
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {

  /**
   * @description Uygulamanın tarayıcıda mı yoksa sunucuda (SSR) mı çalıştığını belirler.
   * Firebase Authentication yalnızca tarayıcı ortamında çalıştırılır.
   */
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  /** @description Firebase Authentication örneği. Sunucu tarafında null'dır. */
  private auth: Auth | null = null;

  /** @description Firestore veritabanı örneği. Sunucu tarafında null'dır. */
  private db: Firestore | null = null;

  // ─────────────────────────────────────────────────────────────
  // DURUM (STATE)
  // ─────────────────────────────────────────────────────────────

  /**
   * @description Giriş yapmış kullanıcının Firestore'daki kaydını tutar.
   * Oturum yoksa null'dır.
   */
  private readonly currentUserSignal = signal<User | null>(null);

  /**
   * @description Firebase'in oturum durumunu ilk kez bildirip bildirmediğini gösterir.
   *
   * ÖNEMLİ: Firebase, sayfa yüklendiğinde oturum bilgisini anında vermez.
   * Bu bayrak false iken hiçbir yönlendirme kararı verilmemelidir; aksi halde
   * giriş yapmış kullanıcı sayfayı yenilediğinde bir anlığına "oturum yok"
   * sanılıp login sayfasına atılır. Route guard'ları bu bayrağı bekler.
   */
  private readonly authResolvedSignal = signal<boolean>(false);

  /**
   * @description Giriş sırasında oluşan ve kullanıcıya gösterilecek hata mesajı.
   * Başarılı girişte veya yeni denemede temizlenir.
   */
  private readonly authErrorSignal = signal<string | null>(null);

  /**
   * @description Giriş işleminin devam edip etmediğini belirtir.
   * Login sayfası bu değere bakarak butonu kilitler.
   */
  private readonly loadingSignal = signal<boolean>(false);

  // ─────────────────────────────────────────────────────────────
  // DIŞARIYA AÇIK (READONLY) DURUM
  // ─────────────────────────────────────────────────────────────

  /** @description Giriş yapmış kullanıcının bilgileri (salt okunur). */
  readonly currentUser = this.currentUserSignal.asReadonly();

  /** @description Oturum durumunun çözümlenip çözümlenmediği (salt okunur). */
  readonly authResolved = this.authResolvedSignal.asReadonly();

    /**
   * @description `authResolvedSignal` değerinin Observable karşılığı.
   * Guard'ların oturum çözümlenene kadar beklemesi için kullanılır.
   */
  private readonly authResolved$ = toObservable(this.authResolvedSignal);

  /** @description Son giriş hatası (salt okunur). */
  readonly authError = this.authErrorSignal.asReadonly();

  /** @description Giriş işlemi sürüyor mu (salt okunur). */
  readonly loading = this.loadingSignal.asReadonly();

  /** @description Kullanıcının oturumu açık mı? */
  readonly isLoggedIn = computed<boolean>(() => this.currentUserSignal() !== null);

  /** @description Giriş yapmış kullanıcının rolü. Oturum yoksa null. */
  readonly role = computed<UserRole | null>(() => this.currentUserSignal()?.role ?? null);

  /** @description Giriş yapan kişi yönetici mi? */
  readonly isAdmin = computed<boolean>(() => this.role() === 'admin');

  /** @description Giriş yapan kişi öğrenci mi? */
  readonly isStudent = computed<boolean>(() => this.role() === 'student');

  // ─────────────────────────────────────────────────────────────
  // KURULUM
  // ─────────────────────────────────────────────────────────────

  constructor() {
    if (this.isBrowser) {
      this.auth = getAuth();
      this.db = getFirestore();
      this.initAuthListener();
    } else {
      // Sunucu tarafında oturum kavramı yoktur.
      // Guard'ların sonsuza kadar beklememesi için çözümlendi olarak işaretlenir.
      this.authResolvedSignal.set(true);
    }
  }

  /**
   * @description Firebase oturum durumunu sürekli dinler.
   * Sayfa yenilendiğinde oturumun geri yüklenmesi de bu dinleyici sayesinde olur.
   *
   * Kullanıcı doğrulandığında sırasıyla:
   * 1. E-posta domaini kontrol edilir
   * 2. Firestore kaydı hazırlanır (yoksa oluşturulur)
   * 3. Hesabın aktif olup olmadığı kontrol edilir
   */
  private initAuthListener(): void {
    if (!this.auth) return;

    onAuthStateChanged(this.auth, async (firebaseUser: FirebaseUser | null) => {

      // Oturum kapalı
      if (!firebaseUser) {
        this.currentUserSignal.set(null);
        this.authResolvedSignal.set(true);
        return;
      }

      try {
        // 1. Domain kontrolü
        if (!this.isDomainAllowed(firebaseUser.email)) {
          await this.logout();
          this.authErrorSignal.set(
            `Yalnızca @${environment.allowedEmailDomain} uzantılı hesaplar giriş yapabilir.`
          );
          this.authResolvedSignal.set(true);
          return;
        }

        // 2. Firestore kaydını hazırla
        const user = await this.ensureUserDocument(firebaseUser);

        // 3. Hesap askıya alınmış mı?
        if (!user.isActive) {
          await this.logout();
          this.authErrorSignal.set(
            'Hesabınız askıya alınmış. Lütfen yönetici ile iletişime geçin.'
          );
          this.authResolvedSignal.set(true);
          return;
        }

        this.currentUserSignal.set(user);
        this.authErrorSignal.set(null);

      } catch (error) {
        console.error('Oturum işlenirken hata oluştu:', error);
        this.authErrorSignal.set('Kullanıcı bilgileri yüklenemedi. Lütfen tekrar deneyin.');
        this.currentUserSignal.set(null);
      } finally {
        this.authResolvedSignal.set(true);
      }
    });
  }

  // ─────────────────────────────────────────────────────────────
  // GİRİŞ / ÇIKIŞ
  // ─────────────────────────────────────────────────────────────

  /**
   * @description Google hesabı ile giriş penceresini açar.
   *
   * Bu metot yalnızca kimlik doğrulama penceresini açmaktan sorumludur.
   * Kullanıcı kaydının oluşturulması, domain ve aktiflik kontrolü
   * `initAuthListener` içinde otomatik olarak yapılır.
   *
   * @returns {Promise<void>} İşlem tamamlandığında çözülür.
   */
  async signInWithGoogle(): Promise<void> {
    if (!this.auth) return;

    this.authErrorSignal.set(null);
    this.loadingSignal.set(true);

    try {
      const provider = new GoogleAuthProvider();

      // Kullanıcı her seferinde hesap seçebilsin (ortak bilgisayarlar için önemli)
      provider.setCustomParameters({
        prompt: 'select_account',
        // Kurumsal domain kısıtı aktifse Google hesap listesini de filtreler.
        // Bu yalnızca bir kolaylıktır; asıl kontrol isDomainAllowed ile yapılır.
        ...(environment.allowedEmailDomain ? { hd: environment.allowedEmailDomain } : {})
      });

      await signInWithPopup(this.auth, provider);

    } catch (error: any) {
      this.authErrorSignal.set(this.translateErrorMessage(error?.code));
    } finally {
      this.loadingSignal.set(false);
    }
  }

  /**
   * @description Kullanıcı oturumunu sonlandırır ve yerel durumu temizler.
   * @returns {Promise<void>}
   */
  async logout(): Promise<void> {
    if (!this.auth) return;

    await signOut(this.auth);
    this.currentUserSignal.set(null);
  }

  // ─────────────────────────────────────────────────────────────
  // FIRESTORE İŞLEMLERİ
  // ─────────────────────────────────────────────────────────────

  /**
   * @description Kullanıcının Firestore kaydını hazırlar.
   *
   * Kayıt yoksa oluşturur (ilk giriş = kayıt mantığı), varsa son giriş
   * zamanını günceller. Yeni kayıtlar daima 'ogrenci' rolü ile başlar;
   * yönetici yetkisi yalnızca Firebase Console üzerinden elle verilir.
   *
   * @param {FirebaseUser} firebaseUser - Google'dan dönen kimlik bilgisi
   * @returns {Promise<User>} Firestore'daki güncel kullanıcı kaydı
   */
  private async ensureUserDocument(firebaseUser: FirebaseUser): Promise<User> {
    if (!this.db) {
      throw new Error('Firestore başlatılmamış.');
    }

    const userRef = doc(this.db, 'users', firebaseUser.uid);
    const snapshot = await getDoc(userRef);

    // ── İLK GİRİŞ: yeni kayıt oluştur ──
    if (!snapshot.exists()) {
           await setDoc(userRef, {
        uid: firebaseUser.uid,
        email: firebaseUser.email ?? '',
        fullName: firebaseUser.displayName ?? 'İsimsiz Kullanıcı',
        photoUrl: firebaseUser.photoURL ?? null,
        role: 'student' as UserRole,
        department: null,
        isActive: true,
        createdAt: serverTimestamp(),
        lastLoginAt: serverTimestamp()
      });

      // serverTimestamp() değerleri yazma anında henüz çözülmediği için
      // kaydı sunucudan tekrar okuyoruz.
      const createdSnapshot = await getDoc(userRef);
      return createdSnapshot.data() as User;
    }

    // ── TEKRAR GİRİŞ: son giriş zamanını güncelle ──
    await updateDoc(userRef, {
      lastLoginAt: serverTimestamp()
    });

    return snapshot.data() as User;
  }

  // ─────────────────────────────────────────────────────────────
  // YARDIMCI METOTLAR
  // ─────────────────────────────────────────────────────────────

  /**
   * @description E-posta adresinin izin verilen domaine ait olup olmadığını denetler.
   *
   * `environment.allowedEmailDomain` null ise kısıt uygulanmaz
   * (geliştirme ve demo ortamı için).
   *
   * NOT: Bu kontrol yalnızca kullanıcı deneyimi içindir. Asıl domain
   * güvenliği Firestore Security Rules tarafında sağlanır.
   *
   * @param {string | null} email - Denetlenecek e-posta adresi
   * @returns {boolean} Domain uygunsa true
   */
  private isDomainAllowed(email: string | null): boolean {
    const allowedDomain = environment.allowedEmailDomain;

    if (!allowedDomain) return true;
    if (!email) return false;

    return email.toLowerCase().endsWith('@' + allowedDomain.toLowerCase());
  }

  /**
   * @description Firebase hata kodlarını kullanıcının anlayacağı Türkçe
   * mesajlara çevirir.
   *
   * @param {string | undefined} code - Firebase hata kodu (örn. 'auth/popup-closed-by-user')
   * @returns {string} Kullanıcıya gösterilecek mesaj
   */
  private translateErrorMessage(code?: string): string {
    switch (code) {
      case 'auth/popup-closed-by-user':
        return 'Giriş penceresi kapatıldı. Tekrar deneyebilirsiniz.';

      case 'auth/cancelled-popup-request':
        return 'Önceki giriş denemesi iptal edildi.';

      case 'auth/popup-blocked':
        return 'Tarayıcınız giriş penceresini engelledi. Lütfen izin verin.';

      case 'auth/network-request-failed':
        return 'İnternet bağlantısı kurulamadı. Bağlantınızı kontrol edin.';

      case 'auth/too-many-requests':
        return 'Çok fazla deneme yapıldı. Lütfen bir süre sonra tekrar deneyin.';

      default:
        return 'Giriş yapılamadı. Lütfen tekrar deneyin.';
    }
  }




    /**
   * @description Giriş yapmış kullanıcının profil bilgilerini günceller.
   *
   * Yalnızca kullanıcının değiştirmesine izin verilen alanlar güncellenebilir.
   * E-posta, rol ve hesap durumu gibi alanlar bu metotla değiştirilemez;
   * bunlar Firestore Security Rules tarafından da korunmaktadır.
   *
   * Güncelleme sonrası yerel oturum bilgisi de tazelenir, böylece arayüz
   * yeniden yükleme gerekmeden güncel değeri gösterir.
   *
   * @param {object} changes - Güncellenecek alanlar
   * @returns {Promise<void>}
   */
  async updateProfile(changes: { fullName?: string }): Promise<void> {
    const user = this.currentUserSignal();

    if (!user || !this.db) {
      throw new Error('Oturum açık değil.');
    }

    const updates: Record<string, unknown> = {};

    if (changes.fullName !== undefined) {
      const trimmed = changes.fullName.trim();

      if (!trimmed) {
        throw new Error('Ad soyad boş bırakılamaz.');
      }

      updates['fullName'] = trimmed;
    }

    // Değişiklik yoksa gereksiz yazma yapma
    if (Object.keys(updates).length === 0) return;

    const userRef = doc(this.db, 'users', user.uid);
    await updateDoc(userRef, updates);

    this.currentUserSignal.set({ ...user, ...updates } as User);
  }

    /**
   * @description Firebase'in oturum durumunu bildirmesini bekler.
   *
   * Route guard'ları bu metodu çağırarak, oturum bilgisi hazır olmadan
   * yönlendirme kararı vermelerini engeller. Aksi halde giriş yapmış bir
   * kullanıcı sayfayı yenilediğinde login sayfasına atılır.
   *
   * Oturum durumu zaten çözümlenmişse anında döner.
   *
   * @returns {Promise<void>} Oturum durumu belirlendiğinde çözülür.
   */
  async waitForAuthResolved(): Promise<void> {
    if (this.authResolvedSignal()) return;

    await firstValueFrom(this.authResolved$.pipe(filter(Boolean)));
  }


    /**
   * @description Kullanıcı adlarının önbelleği (uid → ad soyad).
   * Aynı kullanıcının adı tekrar tekrar sorgulanmasın diye tutulur.
   */
  private readonly userNameCache = new Map<string, string>();

  /**
   * @description Verilen kimliğe sahip kullanıcının adını getirir.
   *
   * Arşivleme gibi işlemlerde "bu işlemi kim yaptı?" bilgisini göstermek
   * için kullanılır. Sonuç önbelleğe alınır, aynı kullanıcı için tekrar
   * veritabanına gidilmez.
   *
   * @param {string} uid - Kullanıcı kimliği
   * @returns {Promise<string>} Kullanıcının adı, bulunamazsa 'Bilinmiyor'
   */
  async getUserName(uid: string): Promise<string> {
    if (!uid || !this.db) return 'Bilinmiyor';

    const cached = this.userNameCache.get(uid);
    if (cached) return cached;

    try {
      const snapshot = await getDoc(doc(this.db, 'users', uid));

      const name = snapshot.exists()
        ? ((snapshot.data() as User).fullName ?? 'Bilinmiyor')
        : 'Bilinmiyor';

      this.userNameCache.set(uid, name);
      return name;

    } catch (error) {
      console.error('Kullanıcı adı okunamadı:', error);
      return 'Bilinmiyor';
    }
  }
}