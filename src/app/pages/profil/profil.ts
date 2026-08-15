import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  imports: [],
  templateUrl: './profil.html',
  styleUrl: './profil.css',
})
export class Profil {

  constructor(private router: Router) {}

  geriDon() {
    this.router.navigate(['/anasayfa']);
  }

  kisiselBilgiler() {
    console.log('Kişisel bilgiler');
    this.router.navigate(['/profil-duzenleme']);
  }

  sifreDegistir() {
    console.log('Şifre değiştir');
  }

  bildirimTercihleri() {
    console.log('Bildirim tercihleri');
  }

  yardimDestek() {
    console.log('Yardım ve destek');
  }

}