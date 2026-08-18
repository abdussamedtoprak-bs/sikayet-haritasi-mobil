import { Injectable, inject } from '@angular/core';
import { Auth, authState } from '@angular/fire/auth';
import { Firestore, doc, getDoc, setDoc } from '@angular/fire/firestore';
import { Storage, ref, uploadBytes, getDownloadURL } from '@angular/fire/storage';
import { Observable } from 'rxjs';

// Kullanıcı modelimizi artık burada tanımlıyoruz ki her sayfadan ulaşılabilsin
export interface KullaniciProfili {
  ad: string;
  soyad: string;
  eposta: string;
  dogumTarihi: string;
  cinsiyet: string;
  fotoUrl?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  
  // Firebase bağlantılarını burada yapıyoruz
  private auth: Auth = inject(Auth);
  private firestore: Firestore = inject(Firestore);
  private storage: Storage = inject(Storage);

  constructor() { }

  // 1. Google ile giriş yapan kullanıcıyı dinleme fonksiyonu
  getKullaniciDurumu(): Observable<any> {
    return authState(this.auth);
  }

  // 2. Kullanıcının ekstra verilerini Firestore'dan çekme fonksiyonu
  async profilGetir(uid: string): Promise<KullaniciProfili | null> {
    const userDocRef = doc(this.firestore, `kullanicilar/${uid}`);
    const docSnap = await getDoc(userDocRef);
    
    if (docSnap.exists()) {
      return docSnap.data() as KullaniciProfili;
    }
    return null;
  }

  // 3. Kullanıcı bilgilerini Firestore'a kaydetme fonksiyonu
  async profilKaydet(uid: string, profilVerisi: KullaniciProfili): Promise<void> {
    const userDocRef = doc(this.firestore, `kullanicilar/${uid}`);
    await setDoc(userDocRef, profilVerisi, { merge: true });
  }

  // 4. Fotoğrafı Storage'a yükleyip linkini geri döndürme fonksiyonu
  async fotografYukle(uid: string, dosya: File): Promise<string> {
    const dosyaYolu = `profil_fotograflari/${uid}`;
    const storageRef = ref(this.storage, dosyaYolu);
    await uploadBytes(storageRef, dosya);
    return await getDownloadURL(storageRef);
  }
}