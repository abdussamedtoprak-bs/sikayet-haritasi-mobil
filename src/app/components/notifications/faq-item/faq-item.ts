import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SSSItem } from '../../../models/sss-item';

/**
 * @description Destek sayfasındaki her bir SSS (Sıkça Sorulan Soru) öğesini
 * temsil eden yeniden kullanılabilir sunum bileşenidir.
 * Accordion yapısında soru-cevap çiftini gösterir, tıklamada açılıp kapanır.
 */
@Component({
  selector: 'app-faq-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './faq-item.html',
  styleUrl: './faq-item.css'
})
export class FaqItemComponent {

  /** @description Gösterilecek SSS öğesi (soru, cevap ve açık/kapalı durumu) */
  @Input() item!: SSSItem;

  /** @description Toggle tıklandığında öğenin id'sini üst bileşene iletir */
  @Output() toggleTiklandi = new EventEmitter<number>();

  /**
   * @description SSS öğesine tıklandığında öğenin id'sini üst bileşene emit eder.
   * Üst bileşen bu id ile ilgili öğenin açık/kapalı durumunu günceller.
   */
  toggle(): void {
    this.toggleTiklandi.emit(this.item.id);
  }
}