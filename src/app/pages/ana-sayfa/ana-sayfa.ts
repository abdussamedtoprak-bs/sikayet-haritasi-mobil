import { Component } from '@angular/core';
import { Baslik } from '../../components/baslik/baslik';
import { KonumButonu } from '../../components/ana-sayfa/konum-butonu/konum-butonu';
import { SorunBildirmePaneli} from '../../components/ana-sayfa/sorun-bildir-paneli/sorun-bildir-paneli';

@Component({
  selector: 'app-ana-sayfa',
  standalone: true,
  imports: [Baslik, KonumButonu, SorunBildirmePaneli],
  templateUrl: './ana-sayfa.html',
  styleUrl: './ana-sayfa.css',
})
export class AnaSayfa {
  panelAcik= false;

  paneliAcKapat(){
    this.panelAcik =!this.panelAcik;
  }
}