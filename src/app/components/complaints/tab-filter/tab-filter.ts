import { Component } from '@angular/core';

@Component({
  selector: 'app-tab-filter',
  imports: [],
  templateUrl: './tab-filter.html',
  styleUrl: './tab-filter.css',
})
export class TabFilter {
  //varsayılan olarak 'tumu' sekmesi seçili olacak
  activeTab:string='tumu';

  //HTML de butona tıklanınca burası çalışacak ve activeTab değişkenini güncelleyecek
  selectTab(tabName:string){
    this.activeTab=tabName;
  }
}
