<<<<<<< HEAD
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { YanMenu } from '../yan-menu/yan-menu';
=======
import { Component,Input } from '@angular/core';
import { CommonModule,Location} from '@angular/common';
import { YanMenu } from '../ana-sayfa/yan-menu/yan-menu';
>>>>>>> origin/develop


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
  //dışarıdan alınacak ayarlar
  @Input() title: string='';
  @Input() showBackBtn: boolean= false;


  menuAcik =false;

  //geri gitmek için servisi tanımlıyoruz
  constructor(private location: Location){}

  //sol oka basıldığında çalışacak fonksiyon
  goBack(){
    this.location.back();
  }

  profilAc() {

  }

  menuAc() {
    
  }

}