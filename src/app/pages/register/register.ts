import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

/**
 * @description Yeni kullanıcı kayıt sayfası bileşenidir.
 * Yalnızca @bingol.edu.tr uzantılı e-posta adresleri ile kayıt yapılabilir.
 * Firebase entegrasyonuna kadar mock data ile çalışmaktadır.
 */
@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class RegisterComponent {

  /** @description Kayıt formundaki ad soyad değeri */
  adSoyad = '';

  /** @description Kayıt formundaki e-posta değeri */
  email = '';

  /** @description Kayıt formundaki şifre değeri */
  sifre = '';

  /** @description Kayıt formundaki şifre tekrar değeri */
  sifreTekrar = '';

  /** @description Hatalı kayıt durumunda gösterilecek mesaj */
  hataMesaji = '';

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  /**
   * @description Kayıt formunu doğrular ve AuthService üzerinden
   * Observable ile kayıt işlemini gerçekleştirir.
   * Boş alan, domain, şifre eşleşme ve uzunluk kontrolleri yapar.
   */
  kayitOl(): void {
    this.hataMesaji = '';

    // 1. Boş Alan Kontrolü
    if (!this.adSoyad || !this.email || !this.sifre || !this.sifreTekrar) {
      this.hataMesaji = 'Lütfen tüm alanları doldurun.';
      return;
    }

    // 2. Domain Kontrolü
    if (!this.email.endsWith('@bingol.edu.tr')) {
      this.hataMesaji = 'Sadece @bingol.edu.tr uzantılı e-posta adresleri kayıt olabilir.';
      return;
    }

    // 3. Şifre Eşleşme Kontrolü
    if (this.sifre !== this.sifreTekrar) {
      this.hataMesaji = 'Şifreler eşleşmiyor.';
      return;
    }

    // 4. Şifre Uzunluk Kontrolü
    if (this.sifre.length < 6) {
      this.hataMesaji = 'Şifre en az 6 karakter olmalıdır.';
      return;
    }

    // Kontrollerden geçince servise gönder
    this.authService.register(this.adSoyad, this.email, this.sifre).subscribe({
      next: (basarili) => {
        if (basarili) {
          this.router.navigate(['/anasayfa']);
        }
      },
      error: (err) => {
        console.error('Kayıt hatası:', err);
        this.hataMesaji = 'Bir hata oluştu, lütfen tekrar deneyin.';
      }
    });
  }
}