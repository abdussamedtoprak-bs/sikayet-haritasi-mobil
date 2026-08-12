import { Component,EventEmitter,Output,Input } from '@angular/core';

@Component({
  selector: 'app-tab-filter',
  imports: [],
  templateUrl: './tab-filter.html',
  styleUrl: './tab-filter.css',
})

/**
 * @description Kullanıcıların şikayetleri öncelik durumlarına (Tümü, Acil, Orta, Düşük) göre 
 * hızlıca filtrelemesini sağlayan, aynı zamanda her kategorideki güncel şikayet sayısını 
 * dinamik olarak gösteren sekme (tab) bileşenidir.
 */
export class TabFilter {

  /**
   * @description Üst bileşenden (parent) gelen ve her bir öncelik kategorisine ait şikayet sayılarını 
   * (tumu, acil, orta, dusuk) anlık olarak tutan veri nesnesi.
   * @type {Object}
   */
  @Input() counts: any = { tumu: 0, acil: 0, orta: 0, dusuk: 0 };
  

  /**
   * @description Kullanıcı farklı bir öncelik sekmesine tıkladığında çalışır ve 
   * seçilen sekmenin adını verileri filtrelemesi için üst bileşene iletir.
   * @event onFilterChange
   * @type {EventEmitter<string>}
   */
  @Output() onFilterChange=new EventEmitter<string>();


  /**
   * @description Arayüzde (UI) o an hangi sekmenin aktif (renkli) olduğunu takip eder. 
   * Bileşen ilk yüklendiğinde varsayılan olarak 'Tümü' seçilidir.
   * @type {string}
   */
  activeTab:string='Tümü';


  /**
   * @description Kullanıcı herhangi bir sekmeye tıkladığında tetiklenir. 
   * Tıklanan sekmeyi aktif hale getirir (arayüzü günceller) ve seçilen yeni filtre değerini dışarı fırlatır.
   * @param {string} tabName - Tıklanan sekmenin adı ('Tümü', 'Acil', 'Orta', 'Düşük').
   */
  onTabClick(tabName:string){
    this.activeTab=tabName;//tıklanan butonu aktif yap renklendirme için
    this.onFilterChange.emit(tabName);//hangi butona tıklandığını ana bileşene gönder
  }
}
