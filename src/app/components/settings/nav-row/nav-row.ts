import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * @description Ayarlar sayfasındaki ok işaretli navigasyon satırlarını temsil eden
 * yeniden kullanılabilir sunum bileşenidir.
 * Güvenlik Politikası, Kullanım Koşulları ve Uygulama Hakkında satırları
 * bu bileşen ile gösterilir.
 */
@Component({
  selector: 'app-nav-row',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './nav-row.html',
  styleUrl: './nav-row.css'
})
export class NavRowComponent {

  /** @description Navigasyon satırında gösterilecek ikon (emoji) */
  @Input() ikon: string = '';

  /** @description Navigasyon satırının başlık metni */
  @Input() baslik: string = '';

  /** @description Satıra tıklandığında üst bileşeni bilgilendirir */
  @Output() satirTiklandi = new EventEmitter<void>();

  /**
   * @description Satıra tıklandığında üst bileşene event fırlatır.
   */
  tiklandi(): void {
    this.satirTiklandi.emit();
  }
}