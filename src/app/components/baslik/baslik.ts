import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { YanMenu } from '../yan-menu/yan-menu';


@Component({
  selector: 'app-baslik',
  standalone: true,
  imports: [
    CommonModule,
    YanMenu
  ],
  templateUrl: './baslik.html',
  styleUrl: './baslik.css'
})
export class Baslik {
  @Input() title: string = '';
  @Input() showBackBtn: boolean = false;

  /** @description Yan-menü her açıldığında (kapanışta değil) üst bileşene haber verir. Örn. ana-sayfa bunu dinleyip açık olan başka bir paneli kapatabilir. */
  @Output() menuAcildi = new EventEmitter<void>();

  menuAcik = false;

  constructor(private location: Location) {}

  goBack() {
    this.location.back();
  }

  profilAc() {}

  /** @description Yan-menüyü açar/kapatır. Sadece açılış anında menuAcildi event'ini fırlatır. */
  menuAc() {
    this.menuAcik = !this.menuAcik;
    if (this.menuAcik) {
      this.menuAcildi.emit();
    }
  }
}