import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { NotificationItemComponent } from '../../components/notifications/notification-item/notification-item';
import { Bildirim } from '../../models/bildirim';

@Component({
  selector: 'app-bildirimler',
  standalone: true,
  imports: [CommonModule, RouterModule, NotificationItemComponent],
  templateUrl: './bildirimler.html',
  styleUrl: './bildirimler.css'
})
export class BildirimlerComponent {

  bildirimler = signal<Bildirim[]>([
    {
      id: 1,
      tip: 'guncelleme',
      baslik: 'Şikayetiniz Güncellendi',
      mesaj: 'Çukurlu yol şikayetiniz "İnceleniyor" durumuna geçti.',
      zaman: '2 saat önce',
      okundu: false,
      yonlendirme: '/sikayet-detay/1'
    },
    {
      id: 2,
      tip: 'cozuldu',
      baslik: 'Şikayetiniz Güncellendi',
      mesaj: 'Kırık kaldırım şikayetiniz belediye tarafından çözülmüştür.',
      zaman: '1 gün önce',
      okundu: false,
      yonlendirme: '/sikayet-detay/2'
    },
    {
      id: 3,
      tip: 'yakin',
      baslik: 'Yeni şikayet yakınınızda',
      mesaj: 'Bölgenizde 3 yeni şikayet bildirildi.',
      zaman: '2 gün önce',
      okundu: true,
      yonlendirme: '/guncel-sikayetler'
    },
    {
      id: 4,
      tip: 'acil',
      baslik: 'Şikayetiniz Acil Olarak İşaretlendi.',
      mesaj: 'Su Kaçağı şikayetiniz acil öncelik seviyesine alındı.',
      zaman: '2 gün önce',
      okundu: true,
      yonlendirme: '/sikayet-detay/4'
    }
  ]);

  constructor(private router: Router) {}

  okunduIsaretle(id: number): void {
    this.bildirimler.update(liste =>
      liste.map(b => b.id === id ? { ...b, okundu: true } : b)
    );
  }

  tumunuOku(): void {
    this.bildirimler.update(liste =>
      liste.map(b => ({ ...b, okundu: true }))
    );
  }

  okunmamisSayisi(): number {
    return this.bildirimler().filter(b => !b.okundu).length;
  }

  geriDon(): void {
    this.router.navigate(['/anasayfa']);
  }

 bildirimeTikla(bildirim: Bildirim): void {
  this.okunduIsaretle(bildirim.id);

  const hazirSayfalar = ['/ayarlar', '/bildirimler'];

  if (hazirSayfalar.includes(bildirim.yonlendirme)) {
    this.router.navigate([bildirim.yonlendirme]);
  } else {
    alert('Bu sayfa yakında eklenecek: ' + bildirim.yonlendirme);
  }
}
}