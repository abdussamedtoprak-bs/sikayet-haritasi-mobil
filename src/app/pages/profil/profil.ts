import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router'; // Router eklendi!
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './profil.html',
  styleUrl: './profil.css',
})
export class Profil {
  
  private readonly router = inject(Router);
  readonly authService = inject(AuthService);

  geriDon() {
    this.router.navigate(['/anasayfa']);
  }

  kisiselBilgiler() {
    console.log('Kişisel bilgiler sayfasına gidiliyor...');
    this.router.navigate(['/profil-duzenleme']);
  } 
}