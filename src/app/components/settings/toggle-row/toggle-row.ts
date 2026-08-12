import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * @description Ayarlar sayfasındaki açma/kapama (toggle) satırlarını temsil eden
 * yeniden kullanılabilir sunum bileşenidir.
 * Bildirimler, konum ve karanlık mod toggle'ları bu bileşen ile gösterilir.
 */
@Component({
  selector: 'app-toggle-row',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toggle-row.html',
  styleUrl: './toggle-row.css'
})
export class ToggleRowComponent {

  /** @description Toggle satırında gösterilecek ikon (emoji) */
  @Input() ikon: string = '';

  /** @description Toggle satırının başlık metni */
  @Input() baslik: string = '';

  /** @description Toggle satırının açıklama metni */
  @Input() aciklama: string = '';

  /** @description Toggle'ın mevcut açık/kapalı durumu */
  @Input() aktif: boolean = false;

  /** @description Toggle durumu değiştiğinde yeni değeri üst bileşene iletir */
  @Output() toggleChanged = new EventEmitter<boolean>();

  /**
   * @description Toggle butonuna tıklandığında mevcut durumu tersine çevirir
   * ve yeni değeri üst bileşene emit eder.
   */
  toggle(): void {
    this.toggleChanged.emit(!this.aktif);
  }
}