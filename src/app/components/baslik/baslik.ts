import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { YanMenuComponent } from '../ana-sayfa/yan-menu/yan-menu.component';


@Component({
  selector: 'app-baslik',
  standalone: true,
  imports: [CommonModule, YanMenuComponent],
  templateUrl: './baslik.html',
  styleUrl: './baslik.css'
})
export class Baslik {

  menuAcik =false;
  profilAc() {

  }

  menuAc() {
    
  }

}