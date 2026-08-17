import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-complaints',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-complaints.html', 
  styleUrls: ['./user-complaints.css']
})
export class UserComplaintsComponent {
  
  // Şikayetler dizisi: Boşken boş durum, veri olunca liste görünür.
  sikayetler: any[] = [
    {
      id: 1,
      baslik: 'Kırık Cam Tehlikesi',
      kategori: 'Güvenlik',
      tarih: '31.07.2026',
      durum: 'Beklemede',
      aciklama: 'Kütüphane önü: Girişte yaklaşık 2 m² alana yayılmış cam kırıkları tehlike oluşturuyor.',
      resim: 'assets/cam-kirigi.jpg'
    }
  ];

  secilenSikayet: any = null;

  constructor(private router: Router) {}

  geriDon() {
    this.router.navigate(['/profil']);
  }

  sikayetBildir() {
    this.router.navigate(['/sikayet-olustur']);
  }

  detayAc(sikayet: any) {
    this.secilenSikayet = sikayet;
  }

  detayKapat() {
    this.secilenSikayet = null;
  }
}