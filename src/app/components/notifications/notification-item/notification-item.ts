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
      guncelleme: '👤',
      cozuldu: '✅',
      yakin: '📍',
      acil: '👤'
    };
    return ikonlar[tip] || '🔔';
  }
}