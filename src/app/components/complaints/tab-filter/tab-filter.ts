import { Component,EventEmitter,Output,Input } from '@angular/core';

@Component({
  selector: 'app-tab-filter',
  imports: [],
  templateUrl: './tab-filter.html',
  styleUrl: './tab-filter.css',
})
export class TabFilter {

  // Dışarıdan gelecek dinamik sayılar
  @Input() counts: any = { tumu: 0, acil: 0, orta: 0, dusuk: 0 };

  //dışarıya seçilen sekmeyi haber verecek olan olay(event) tanımlıyoruz.
  @Output() onFilterChange=new EventEmitter<string>();

  //sayfa ilk açıldığında varsayılan olarak 'tumu' sekmesi seçili olacak
  activeTab:string='Tümü';

  //HTML de butona tıklanınca burası çalışacak ve activeTab değişkenini güncelleyecek
  onTabClick(tabName:string){
    this.activeTab=tabName;//tıklanan butonu aktif yap renklendirme için
    this.onFilterChange.emit(tabName);//hangi butona tıklandığını ana bileşene gönder
  }
}
