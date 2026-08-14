import { Component } from '@angular/core';
import { Baslik } from '../../components/baslik/baslik';
import { KonumButonu } from '../../components/ana-sayfa/konum-butonu/konum-butonu';
import { SorunBildirmePaneli} from '../../components/ana-sayfa/sorun-bildir-paneli/sorun-bildir-paneli';
import { HaritaAlani } from '../../components/ana-sayfa/harita-alani/harita-alani';

@Component({
  selector: 'app-ana-sayfa',
  standalone: true,
  imports: [
  Baslik,
  HaritaAlani,
  KonumButonu,
  SorunBildirmePaneli
],
  templateUrl: './ana-sayfa.html',
  styleUrl: './ana-sayfa.css',
})
export class AnaSayfa {
  panelAcik = false;

  paneliAcKapat(){
    this.panelAcik = !this.panelAcik;
  }

  /** @description Yan-menü açıldığında Sorun Bildir panelini kapatır, ikisinin aynı anda görünmesini engeller. */
  paneliKapat(){
    this.panelAcik = false;
  }
}