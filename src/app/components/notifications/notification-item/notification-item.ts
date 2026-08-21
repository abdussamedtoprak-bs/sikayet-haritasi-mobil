import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Bildirim } from '../../../models/bildirim';

/**
 * @description Bildirimler sayfasındaki her bir bildirim satırını temsil eden
 * yeniden kullanılabilir sunum bileşenidir.
 * Okunmuş/okunmamış durumunu görsel olarak belirtir ve tıklama olayını üst bileşene iletir.
 */
@Component({
  selector: 'app-notification-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification-item.html',
  styleUrl: './notification-item.css'
})
export class NotificationItemComponent {

  /** @description Gösterilecek bildirim nesnesi */
  @Input() bildirim!: Bildirim;

  /** @description Bildirime tıklandığında bildirim nesnesini üst bileşene iletir */
  @Output() itemTiklandi = new EventEmitter<Bildirim>();

  /**
   * @description Bildirim satırına tıklandığında üst bileşene event fırlatır.
   */
  tiklandi(): void {
    this.itemTiklandi.emit(this.bildirim);
  }

  /**
   * @description Bildirim tipine göre uygun ikonu döndürür.
   * @param {string} tip - Bildirim tipi (guncelleme/cozuldu/yakin/acil)
   * @returns {string} İlgili emoji ikonu
   */
ikonGetir(tip: string): string {
  const ikonlar: Record<string, string> = {
    guncelleme: 'fa-solid fa-user-clock',
    cozuldu: 'fa-solid fa-circle-check',
    yakin: 'fa-solid fa-location-dot',
    acil: 'fa-solid fa-user-clock'
  };

  return ikonlar[tip] || 'fa-solid fa-bell';
}
// ZAMAN HESAPLAMA FONKSİYONU
  zamanHesapla(zaman: any): string {
    // Firebase sunucu saati o an hesaplanıyorsa (milisaniyelik gecikme)
    if (!zaman) return 'Az önce'; 

    // Firebase Timestamp ise JS Date nesnesine çeviriyoruz
    const tarih = zaman.toDate ? zaman.toDate() : new Date(zaman);
    const simdi = new Date();
    
    // Geçen zamanı saniye cinsinden buluyoruz
    const farkSaniye = Math.floor((simdi.getTime() - tarih.getTime()) / 1000);

    if (farkSaniye < 60) return 'Az önce';
    
    const farkDakika = Math.floor(farkSaniye / 60);
    if (farkDakika < 60) return `${farkDakika} dakika önce`;

    const farkSaat = Math.floor(farkDakika / 60);
    if (farkSaat < 24) return `${farkSaat} saat önce`;

    const farkGun = Math.floor(farkSaat / 24);
    if (farkGun < 30) return `${farkGun} gün önce`;

    const farkAy = Math.floor(farkGun / 30);
    if (farkAy < 12) return `${farkAy} ay önce`;

    return `${Math.floor(farkAy / 12)} yıl önce`;
  }
}