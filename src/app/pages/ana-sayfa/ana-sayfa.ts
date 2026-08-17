import { Component,ChangeDetectorRef,OnInit } from '@angular/core';
import { Baslik } from '../../components/baslik/baslik';
import { KonumButonu } from '../../components/ana-sayfa/konum-butonu/konum-butonu';
import { SorunBildirmePaneli} from '../../components/ana-sayfa/sorun-bildir-paneli/sorun-bildir-paneli';
import { HaritaAlani } from '../../components/ana-sayfa/harita-alani/harita-alani';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-ana-sayfa',
  standalone: true,
  imports: [
  Baslik,
  HaritaAlani,
  KonumButonu,
  SorunBildirmePaneli,
],
  templateUrl: './ana-sayfa.html',
  styleUrl: './ana-sayfa.css',
})
export class AnaSayfa implements OnInit {
panelAcik = false;
  secilenKonum: any = null;

  // 1. Sınıfın içine değişkenimizi ekliyoruz:
  currentUserRole: any = null;

  constructor(private cdr: ChangeDetectorRef,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
  this.currentUserRole = this.authService.role();
}

  paneliAc() {
    setTimeout(() => {
      this.panelAcik = true;
      this.cdr.detectChanges();
    }, 1000);
  }

  /** @description Yan-menü açıldığında Sorun Bildir panelini kapatır, ikisinin aynı anda görünmesini engeller. */
  paneliKapat(){
    this.panelAcik = false;
  }
}