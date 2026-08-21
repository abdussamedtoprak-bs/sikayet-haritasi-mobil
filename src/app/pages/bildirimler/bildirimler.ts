import { Component, OnInit,OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { NotificationItemComponent } from '../../components/notifications/notification-item/notification-item';
import { Bildirim } from '../../models/bildirim';
import { Baslik } from '../../components/baslik/baslik';
import { AuthService } from '../../services/auth.service';
import { BildirimlerService } from '../../services/bildirimler';
import { ComplaintService } from '../../services/complaint';
import { filter } from 'rxjs';

@Component({
  selector: 'app-bildirimler',
  standalone: true,
  imports: [CommonModule, RouterModule, NotificationItemComponent, Baslik],
  templateUrl: './bildirimler.html',
  styleUrl: './bildirimler.css'
})
export class BildirimlerComponent implements OnInit {
  // Sinyali doğrudan servisten okuyacak şekilde bağlıyoruz
  get bildirimler() {
    return this.bildirimService.bildirimler;
  }
  constructor(
    private router: Router,
    private authService: AuthService,
    private bildirimService: BildirimlerService,
    private complaintService: ComplaintService
  ) {}
  ngOnInit(): void {
    /**@description sayfa açıldığında firebase'den canlı dinlemeyi başlatıyoruz*/
    this.bildirimService.dinlemeyiBaslat();
    // Sadece yönetici giriş yaptıysa bekleyen şikayet kontrolünü tetikle
    if (this.authService.isAdmin()) {
      this.complaintService.checkPendingComplaints();
    }
  }
  ngOnDestroy():void{
    /**@description Sayfadan çıkıldığında gereksiz bellek tüketimini önlemek için dinlemeyi durdur */
    this.bildirimService.dinlemeyiDurdur();
  }
  okunduIsaretle(id: string): void {
    this.bildirimService.bildirimiOkunduYap(id);
  }
  tumunuOku(): void {
    this.bildirimService.tumunuOkunduYap();
  }
  okunmamisSayisi(): number {
    return this.bildirimService.bildirimler().filter(b=>!b.okundu).length;
  }
  geriDon(): void {
    this.router.navigate(['/anasayfa']);
  }
  bildirimeTikla(bildirim: Bildirim): void {
    // Bildirime tıklandığında Firebase'de okundu olarak işaretle
    if (bildirim.id) {
      this.okunduIsaretle(bildirim.id);
    }

    const hazirSayfalar = ['/ayarlar', '/bildirimler', '/complaints' , '/user-complaints'];
    if (hazirSayfalar.includes(bildirim.yonlendirme) || bildirim.yonlendirme.startsWith('/sikayet-detay')) {
      this.router.navigate([bildirim.yonlendirme]);
    } else {
      alert('Bu sayfa yakında eklenecek: ' + bildirim.yonlendirme);
    }
  }
}