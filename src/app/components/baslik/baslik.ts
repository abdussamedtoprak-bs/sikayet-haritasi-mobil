import { Component, Input } from '@angular/core';
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

  menuAcik = false;

  constructor(private location: Location) {}

  goBack() {
    this.location.back();
  }

  profilAc() {}

  menuAc() {}
}