import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule, NgTemplateOutlet } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

/**
 * @description Kullanıcı giriş sayfası bileşenidir.
 * Outlook ile giriş ve yönetici girişi olmak üzere iki farklı giriş modu sunar.
 * Firebase entegrasyonuna kadar mock data ile çalışmaktadır.
 */
@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NgTemplateOutlet],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {

  /** @description Yönetici giriş formunun görünürlük durumu */
  yoneticiModu = false;

  /** @description Giriş formundaki e-posta değeri */
  email = '';

  /** @description Giriş formundaki şifre değeri */
  sifre = '';

  /** @description Hatalı giriş durumunda gösterilecek mesaj */
  hataMesaji = '';

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  /**
   * @description Outlook ile giriş butonuna tıklandığında çalışır.
   * Firebase entegrasyonuna kadar direkt ana sayfaya yönlendirir.
   */
  outlookGiris(): void {
    this.router.navigate(['/anasayfa']);
  }

  /**
   * @description Yönetici girişi butonuna tıklandığında giriş formunu açar.
   */
  yoneticiGirisAc(): void {
    this.yoneticiModu = true;
  }

  /**
   * @description Yönetici giriş formunu gönderir.
   * AuthService üzerinden Observable ile doğrulama yapar.
   */
  yoneticiGirisYap(): void {
    this.authService.login(this.email, this.sifre).subscribe({
      next: (basarili) => {
        if (basarili) {
          this.router.navigate(['/anasayfa']);
        } else {
          this.hataMesaji = 'E-posta veya şifre hatalı.';
        }
      },
      error: (err) => {
        console.error('Giriş hatası:', err);
        this.hataMesaji = 'Bir hata oluştu, lütfen tekrar deneyin.';
      }
    });
  }

  /**
   * @description Yönetici giriş formunu kapatır ve hata mesajını temizler.
   */
  geri(): void {
    this.yoneticiModu = false;
    this.hataMesaji = '';
  }
}