import { Component, inject, effect } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { environment } from '../../../environments/environment';

/**
 * @description Kullanıcı giriş sayfası bileşenidir.
 *
 * Google hesabı ile tek butonlu giriş sunar. Ayrı bir kayıt adımı yoktur;
 * kullanıcının ilk girişi otomatik olarak kayıt yerine geçer.
 *
 * Yönetici için ayrı bir giriş kapısı bulunmaz. Yönetici de aynı butondan
 * giriş yapar, rolü Firestore'dan okunarak belirlenir.
 */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {

  private readonly router = inject(Router);

  /**
   * @description Şablonda doğrudan kullanılabilmesi için public tanımlanmıştır.
   * Yükleniyor durumu ve hata mesajı bu servisten okunur.
   */
  readonly authService = inject(AuthService);

  /**
   * @description Giriş yapabilecek e-posta domaini.
   * null ise kısıt yoktur ve bilgi metni gösterilmez.
   */
  readonly allowedDomain = environment.allowedEmailDomain;

  constructor() {
    // Oturum açıldığı anda kullanıcıyı ana sayfaya yönlendirir.
    // Hem yeni girişte hem de zaten oturumu açık olan birinin
    // login sayfasına gelmesi durumunda çalışır.
    effect(() => {
      if (this.authService.isLoggedIn()) {
        this.router.navigate(['/anasayfa']);
      }
    });
  }

  /**
   * @description Google ile giriş penceresini açar.
   * Hata yönetimi ve kullanıcı kaydı AuthService tarafında yapılır.
   */
  async signIn(): Promise<void> {
    await this.authService.signInWithGoogle();
  }
}