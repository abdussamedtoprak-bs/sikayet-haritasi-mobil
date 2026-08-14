import { Component,ChangeDetectorRef } from '@angular/core';
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
  panelAcik= false;
  secilenKonum: any = null;

  constructor(private cdr: ChangeDetectorRef) {}

  paneliAc() {
  // Uçuş animasyonu (flyTo) için zaman tanıyalım
  setTimeout(() => {
    this.panelAcik = true;
    //aşağıdaki satır ekranı zorla güncelleyecek
    this.cdr.detectChanges();
  }, 1000); // 1 saniye sonra paneli aç
}
}