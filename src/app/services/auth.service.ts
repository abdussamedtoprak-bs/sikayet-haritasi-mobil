import { Injectable, signal } from '@angular/core';
import { Observable, of } from 'rxjs';
import { User } from '../models/user';

/**
 * @description Kullanıcı kimlik doğrulama işlemlerini yöneten servis katmanıdır.
 * Login, register, logout gibi tüm auth işlemleri bu servis üzerinden yapılır.
 * Firebase entegrasyonuna kadar mock data kullanılmaktadır.
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private currentUserSignal = signal<User | null>(null);
  currentUser = this.currentUserSignal.asReadonly();

  /**
   * @description Firebase entegrasyonuna kadar kullanılan geçici (mock) kullanıcı listesi.
   * Her kullanıcı User modeline ek olarak şifre alanı içerir.
   */
  private mockUsers: Array<User & { sifre: string }> = [
    {
      id: '1',
      adSoyad: 'Ahmet Yılmaz',
      email: 'ogrenci@bingol.edu.tr',
      sifre: '123456',
      rol: 'ogrenci',
      createdAt: new Date()
    },
    {
      id: '2',
      adSoyad: 'Mehmet Demir',
      email: 'yonetici@bingol.edu.tr',
      sifre: '123456',
      rol: 'yonetici',
      createdAt: new Date()
    }
  ];

  /**
   * @description Kullanıcı girişini doğrular ve oturum bilgisini kaydeder.
   * Firebase entegrasyonunda bu metod Firebase Auth ile çalışacaktır.
   * @param {string} email - Kullanıcının e-posta adresi
   * @param {string} sifre - Kullanıcının şifresi
   * @returns {Observable<boolean>} Giriş başarılıysa true, değilse false döner
   */
  login(email: string, sifre: string): Observable<boolean> {
    const kullanici = this.mockUsers.find(
      u => u.email === email && u.sifre === sifre
    );

    if (kullanici) {
      const { sifre: _, ...userWithoutPassword } = kullanici;
      this.currentUserSignal.set(userWithoutPassword);
      localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
      return of(true);
    }

    return of(false);
  }

  /**
   * @description Yeni kullanıcı kaydı oluşturur ve oturumu başlatır.
   * Firebase entegrasyonunda bu metod Firebase Auth ile çalışacaktır.
   * @param {string} adSoyad - Kullanıcının adı ve soyadı
   * @param {string} email - Kullanıcının e-posta adresi (@bingol.edu.tr zorunlu)
   * @param {string} sifre - Kullanıcının şifresi (min 6 karakter)
   * @returns {Observable<boolean>} Kayıt başarılıysa true döner
   */
  register(adSoyad: string, email: string, sifre: string): Observable<boolean> {
    const yeniKullanici = {
      id: Math.random().toString(36).substring(2, 9),
      adSoyad,
      email,
      sifre,
      rol: 'ogrenci' as const,
      createdAt: new Date()
    };

    this.mockUsers.push(yeniKullanici);
    const { sifre: _, ...userWithoutPassword } = yeniKullanici;
    this.currentUserSignal.set(userWithoutPassword);
    localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
    return of(true);
  }

  /**
   * @description Kullanıcı oturumunu sonlandırır ve oturum bilgilerini temizler.
   */
  logout(): void {
    this.currentUserSignal.set(null);
    localStorage.removeItem('currentUser');
  }

  /**
   * @description Kullanıcının oturum açıp açmadığını kontrol eder.
   * @returns {Observable<boolean>} Oturum açıksa true, değilse false döner
   */
  isLoggedIn(): Observable<boolean> {
    return of(this.currentUserSignal() !== null);
  }

  /**
   * @description Giriş yapmış kullanıcının rolünü döndürür.
   * @returns {Observable<string | null>} Kullanıcı rolü (ogrenci/yonetici) veya null
   */
  getRole(): Observable<string | null> {
    return of(this.currentUserSignal()?.rol ?? null);
  }

  /**
   * @description Sayfa yenilendiğinde localStorage'dan oturum bilgisini geri yükler.
   */
  restoreSession(): void {
    const stored = localStorage.getItem('currentUser');
    if (stored) {
      this.currentUserSignal.set(JSON.parse(stored));
    }
  }
}