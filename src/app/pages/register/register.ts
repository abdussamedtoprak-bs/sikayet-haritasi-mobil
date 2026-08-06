import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule], // RouterModule yönlendirmeler için kritik
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class RegisterComponent {
  adSoyad = '';
  email = '';
  sifre = '';
  sifreTekrar = '';
  hataMesaji = '';

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  kayitOl(): void {
    this.hataMesaji = '';

    // 1. Boş Alan Kontrolü
    if (!this.adSoyad || !this.email || !this.sifre || !this.sifreTekrar) {
      this.hataMesaji = 'Lütfen tüm alanları doldurun.';
      return;
    }

    // 2. Domain (Uzantı) Kontrolü
    if (!this.email.endsWith('@bingol.edu.tr')) {
      this.hataMesaji = 'Sadece @bingol.edu.tr uzantılı e-posta adresleri kayıt olabilir.';
      return;
    }

    // 3. Şifre Eşleşme Kontrolü
    if (this.sifre !== this.sifreTekrar) {
      this.hataMesaji = 'Şifreler eşleşmiyor.';
      return;
    }

    // 4. Şifre Uzunluk Kontrolü (Güvenlik standardı)
    if (this.sifre.length < 6) {
      this.hataMesaji = 'Şifre en az 6 karakter olmalıdır.';
      return;
    }

    // Kontrollerden geçerse servise gönder
    const basarili = this.authService.register(this.adSoyad, this.email, this.sifre);
    if (basarili) {
      this.router.navigate(['/anasayfa']);
    }
  }
}