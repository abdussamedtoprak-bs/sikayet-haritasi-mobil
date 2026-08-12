import { Component,EventEmitter,Output } from '@angular/core';
import{CommonModule} from '@angular/common';
import{FormsModule} from '@angular/forms';

/**
 * @description Kullanıcının şikayetler içerisinde metin tabanlı arama yapmasını sağlayan arama çubuğu bileşenidir.
 * Girilen metni anlık olarak dinler ve üst bileşenlere (parent components) iletir.
 */

@Component({
  selector: 'app-search-bar',
  imports: [CommonModule,FormsModule],
  templateUrl: './search-bar.html',
  styleUrl: './search-bar.css',
})
export class SearchBar {

  searchText:string='';

  /**
   * @description Arama kutusuna girilen metin her değiştiğinde tetiklenir ve güncel metni dışarı fırlatır.
   * @event searchChanged
   * @type {EventEmitter<string>}
   */
  @Output() searchChanged= new EventEmitter<string>();

  /**
   * @description Input alanındaki metin model (`ngModel`) üzerinden her güncellendiğinde çalışır 
   * ve yeni değeri EventEmitter aracılığıyla yayınlar.
   */
  onSearchChange(){
    this.searchChanged.emit(this.searchText);
  }

  /**
   * @description Arama kutusundaki çarpı (x) butonuna tıklandığında çalışır.
   * Arama metnini sıfırlar ve temizlenmiş (boş) durumu üst bileşene iletir.
   */
  clearSearch(){
    this.searchText='';
    this.searchChanged.emit(this.searchText);
  }

}
