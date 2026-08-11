import { Component } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule, NgTemplateOutlet } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, NgTemplateOutlet],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class LoginComponent {
  yoneticiModu = false;
  email = '';
  sifre = '';
  hataMesaji = '';

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  outlookGiris(): void {
    this.router.navigate(['/anasayfa']);
  }

  yoneticiGirisAc(): void {
    this.yoneticiModu = true;
  }

  yoneticiGirisYap(): void {
    const basarili = this.authService.login(this.email, this.sifre);
    if (basarili) {
      this.router.navigate(['/anasayfa']);
    } else {
      this.hataMesaji = 'E-posta veya şifre hatalı.';
    }
  }

  geri(): void {
    this.yoneticiModu = false;
    this.hataMesaji = '';
  }
}