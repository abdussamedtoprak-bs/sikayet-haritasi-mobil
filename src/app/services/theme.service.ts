import { Injectable, signal, inject, effect, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { AuthService } from './auth.service';

/**
 * @description Uygulamanın görünüm temasını (aydınlık / karanlık) yöneten servistir.
 *
 * Tema tercihi cihaza değil kullanıcı hesabına aittir. Giriş yapıldığında
 * hesabın tercihi uygulanır, çıkış yapıldığında işletim sisteminin tercihine
 * dönülür. Böylece ortak kullanılan bir cihazda bir kullanıcının tercihi
 * diğerine geçmez.
 *
 * Tarayıcıda saklanan değer yalnızca bir açılış ipucudur: sayfa yenilendiğinde
 * oturumun doğrulanması birkaç yüz milisaniye sürer ve bu sürede ekranın renk
 * değiştirmesini önler. Çıkışta bu ipucu da silinir.
 *
 * Tema, body etiketine 'karanlik' sınıfı eklenerek uygulanır. Renkler CSS
 * değişkenleri üzerinden tanımlandığı için bu tek sınıf tüm uygulamayı etkiler.
 */
@Injectable({
  providedIn: 'root'
})
export class ThemeService {

  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  private readonly authService = inject(AuthService);

  /** @description Açılış ipucunun tarayıcıda saklandığı anahtar. */
  private static readonly STORAGE_KEY = 'tema-tercihi';

  /** @description Body etiketine eklenen sınıf adı. */
  private static readonly DARK_CLASS = 'karanlik';

  private readonly darkModeSignal = signal<boolean>(false);

  /** @description Karanlık mod açık mı? (salt okunur) */
  readonly isDarkMode = this.darkModeSignal.asReadonly();

  constructor() {
    // Sunucu tarafında (SSR) tarayıcı API'leri kullanılamaz
    if (!this.isBrowser) return;

    // 1. Açılış: son bilinen tema hemen uygulanır, ekran yanıp sönmesin
    const ipucu = localStorage.getItem(ThemeService.STORAGE_KEY);

    this.applyTheme(
      ipucu !== null ? ipucu === 'karanlik' : this.systemPrefersDark()
    );

    // 2. Oturum netleştiğinde gerçek tercih devreye girer
    effect(() => {
      // Oturum henüz çözülmediyse ipucuyla devam et
      if (!this.authService.authResolved()) return;

      const user = this.authService.currentUser();

      if (user) {
        this.applyTheme(user.darkMode ?? this.systemPrefersDark());
        this.saveHint(this.darkModeSignal());
      } else {
        // Çıkış yapıldı: kişisel tercih cihazda bırakılmaz
        localStorage.removeItem(ThemeService.STORAGE_KEY);
        this.applyTheme(this.systemPrefersDark());
      }
    });
  }

  /**
   * @description Temayı aydınlık ve karanlık arasında değiştirir.
   * @returns {Promise<void>}
   */
  async toggle(): Promise<void> {
    await this.setDarkMode(!this.darkModeSignal());
  }

  /**
   * @description Temayı belirtilen değere ayarlar ve kullanıcı hesabına kaydeder.
   *
   * Tema önce ekrana uygulanır, kayıt işlemi arka planda yapılır.
   * Böylece kullanıcı veritabanı yanıtını beklemez.
   *
   * @param {boolean} isDark - true ise karanlık, false ise aydınlık tema
   * @returns {Promise<void>}
   */
  async setDarkMode(isDark: boolean): Promise<void> {
    this.applyTheme(isDark);

    if (!this.isBrowser) return;

    this.saveHint(isDark);

    // Giriş yapılmamışsa kaydedilecek bir hesap yoktur
    if (!this.authService.isLoggedIn()) return;

    try {
      await this.authService.updateDarkMode(isDark);
    } catch (error) {
      // Tema görsel bir tercih olduğu için hata kullanıcıya yansıtılmaz,
      // ekrandaki seçim korunur; yalnızca kaydedilememiş olur.
      console.error('Tema tercihi kaydedilemedi:', error);
    }
  }

  /**
   * @description İşletim sisteminin karanlık tema tercihini okur.
   * @returns {boolean} Sistem karanlık tema istiyorsa true
   */
  private systemPrefersDark(): boolean {
    if (!this.isBrowser) return false;

    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  }

  /**
   * @description Açılışta kullanılmak üzere temayı tarayıcıya not eder.
   * @param {boolean} isDark - Kaydedilecek tema
   */
  private saveHint(isDark: boolean): void {
    localStorage.setItem(
      ThemeService.STORAGE_KEY,
      isDark ? 'karanlik' : 'aydinlik'
    );
  }

  /**
   * @description Verilen temayı hem uygulama durumuna hem body etiketine yansıtır.
   * @param {boolean} isDark - Uygulanacak tema
   */
  private applyTheme(isDark: boolean): void {
    this.darkModeSignal.set(isDark);

    if (!this.isBrowser) return;

    document.body.classList.toggle(ThemeService.DARK_CLASS, isDark);
  }
}