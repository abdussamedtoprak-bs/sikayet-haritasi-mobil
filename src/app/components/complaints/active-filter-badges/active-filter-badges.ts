import { Component,Output, EventEmitter,Input } from '@angular/core';

@Component({
  selector: 'app-active-filter-badges',
  imports: [],
  templateUrl: './active-filter-badges.html',
  styleUrl: './active-filter-badges.css',
})

/**
 * @description Kullanıcının seçmiş olduğu aktif filtreleri (Kategori, Durum, Tarih) 
 * etiket (badge) formatında gösteren bilgi bileşenidir. 
 * Aynı zamanda konteynere tıklandığında detaylı filtreleme panelinin açılmasını tetikler.
 */

export class ActiveFilterBadges {

  /**
   * @description Kullanıcı filtre etiketlerinin bulunduğu alana tıkladığında çalışır 
   * ve ana filtre panelinin açılması için üst bileşene (parent) sinyal gönderir.
   * @event openFilter
   * @type {EventEmitter<void>}
   */
  @Output() openFilter = new EventEmitter<void>();
  
  /**
   * @description Üst bileşenden (parent) gelen güncel filtre seçim durumlarını tutar.
   * Herhangi bir filtre seçilmediğinde varsayılan olarak tüm alanlarda 'Tümü' değerini gösterir.
   * @param {Object} filters - Kategori, durum ve tarih değerlerini barındıran veri nesnesi.
   */

  @Input() filters = {
    category: 'Tümü',
    status: 'Tümü',
    date: 'Tümü'
  };

}

