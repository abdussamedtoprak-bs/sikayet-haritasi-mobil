import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { YanMenu } from '../ana-sayfa/yan-menu/yan-menu';


@Component({
  selector: 'app-baslik',
  standalone: true,
  imports: [CommonModule, YanMenu],
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