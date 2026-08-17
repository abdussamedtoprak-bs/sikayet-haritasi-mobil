import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { NotificationItemComponent } from '../../components/notifications/notification-item/notification-item';
import { Bildirim } from '../../models/bildirim';
import { Baslik } from '../../components/baslik/baslik';
import { AuthService } from '../../services/auth.service';
import { BildirimlerService } from '../../services/bildirimler';

@Component({
  selector: 'app-bildirimler',
  standalone: true,
  imports: [CommonModule, RouterModule, NotificationItemComponent, Baslik],
  templateUrl: './bildirimler.html',
  styleUrl: './bildirimler.css'
})
export class BildirimlerComponent implements OnInit {

  // Sinyali doğrudan servisten okuyacak şekilde bağlıyoruz
  get bildirimler() {
    return this.bildirimService.bildirimler;
  }

  constructor(
    private router: Router,
    private authService: AuthService,
    private bildirimService: BildirimlerService
  ) {}

  ngOnInit(): void {
    if (this.bildirimService.bildirimler().length === 0) {
      if (this.authService.isAdmin()) {
        this.bildirimService.bildirimler.set([
          { id: 1, tip: 'yeni', baslik: 'Sisteme Yeni Şikayet Eklendi', mesaj: 'Kütüphane önünde yeni şikayet bildirildi.', zaman: '10 dakika önce', okundu: false, yonlendirme: '/guncel-sikayetler' },
          { id: 2, tip: 'destek', baslik: 'Destek Eşiği Aşıldı', mesaj: 'Kırık cam şikayeti 20 destek aldı, önceliği yükseldi.', zaman: '1 saat önce', okundu: false, yonlendirme: '/sikayet-detay/1' },
          { id: 3, tip: 'uyari', baslik: 'Bekleyen Şikayet Uyarısı', mesaj: '3 şikayet 7 günden uzun süre beklemede.', zaman: '3 saat önce', okundu: true, yonlendirme: '/guncel-sikayetler' }
        ]);
      } else {
        this.bildirimService.bildirimler.set([
          { id: 1, tip: 'guncelleme', baslik: 'Şikayetiniz Güncellendi', mesaj: 'Çukurlu yol şikayetiniz "İnceleniyor" durumuna geçti.', zaman: '2 saat önce', okundu: false, yonlendirme: '/sikayet-detay/1' },
          { id: 2, tip: 'cozuldu', baslik: 'Şikayetiniz Güncellendi', mesaj: 'Kırık kaldırım şikayetiniz belediye tarafından çözülmüştür.', zaman: '1 gün önce', okundu: false, yonlendirme: '/sikayet-detay/2' },
          { id: 3, tip: 'yakin', baslik: 'Yeni şikayet yakınınızda', mesaj: 'Bölgenizde 3 yeni şikayet bildirildi.', zaman: '2 gün önce', okundu: true, yonlendirme: '/guncel-sikayetler' }
        ]);
      }
    }
  }

  okunduIsaretle(id: number): void {
    this.bildirimService.bildirimler.update(liste =>
      liste.map(b => b.id === id ? { ...b, okundu: true } : b)
    );
  }

  tumunuOku(): void {
    this.bildirimService.bildirimler.update(liste =>
      liste.map(b => ({ ...b, okundu: true }))
    );
  }

  okunmamisSayisi(): number {
    return this.bildirimService.bildirimler().filter(b => !b.okundu).length;
  }

  geriDon(): void {
    this.router.navigate(['/anasayfa']);
  }

  bildirimeTikla(bildirim: Bildirim): void {
    this.okunduIsaretle(bildirim.id);
    const hazirSayfalar = ['/ayarlar', '/bildirimler', '/guncel-sikayetler'];
    
    if (hazirSayfalar.includes(bildirim.yonlendirme) || bildirim.yonlendirme.startsWith('/sikayet-detay')) {
      this.router.navigate([bildirim.yonlendirme]);
    } else {
      alert('Bu sayfa yakında eklenecek: ' + bildirim.yonlendirme);
    }
  }
}