import { Component,EventEmitter,Output } from '@angular/core';
import{CommonModule} from '@angular/common';
import{FormsModule} from '@angular/forms';

@Component({
  selector: 'app-search-bar',
  imports: [CommonModule,FormsModule],
  templateUrl: './search-bar.html',
  styleUrl: './search-bar.css',
})
export class SearchBar {

  searchText:string='';

  //yazılan metni üst bileşene kullanıldığı sayfaya fırlatır
  @Output() searchChanged= new EventEmitter<string>();

  //input alanına her harf  girildiğinde tetiklenir
  onSearchChange(){
    this.searchChanged.emit(this.searchText);
  }

  //çarpı ikonuna basıldığında metni temizler
  clearSearch(){
    this.searchText='';
    this.searchChanged.emit(this.searchText);
  }

}
