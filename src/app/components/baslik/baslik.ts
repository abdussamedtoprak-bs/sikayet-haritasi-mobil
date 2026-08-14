import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { YanMenu } from '../yan-menu/yan-menu';
import { Router } from '@angular/router';

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

  constructor(
    private location: Location,
    private router: Router
  ) {}

  goBack() {
    this.location.back();
  }

  profilGit() {
    this.router.navigate(['/profil']);
  }

  /** @description Yan-menüyü açar/kapatır. Sadece açılış anında menuAcildi event'ini fırlatır. */
  menuAc() {
    this.menuAcik = !this.menuAcik;
    if (this.menuAcik) {
      this.menuAcildi.emit();
    }
  }
}