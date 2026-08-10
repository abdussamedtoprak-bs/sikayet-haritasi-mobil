import { Component,EventEmitter,Output } from '@angular/core';

@Component({
  selector: 'app-tab-filter',
  imports: [],
  templateUrl: './tab-filter.html',
  styleUrl: './tab-filter.css',
})
export class TabFilter {

  //dışarıya seçilen sekmeyi haber verecek olan olay(event) tanımlıyoruz.
  @Output() tabSelected=new EventEmitter<string>();

  //sayfa ilk açıldığında varsayılan olarak 'tumu' sekmesi seçili olacak
  activeTab:string='Tümü';

  //HTML de butona tıklanınca burası çalışacak ve activeTab değişkenini güncelleyecek
  onTabClick(tabName:string){
    this.activeTab=tabName;//tıklanan butonu aktif yap renklendirme için
    this.tabSelected.emit(tabName);//hangi butona tıklandığını ana bileşene gönder
  }
}
