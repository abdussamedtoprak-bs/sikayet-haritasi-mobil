import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

import { ComplaintService } from '../../services/complaint'; 
import { Complaint } from '../../models/complaint';
import { AuthService } from '../../services/auth.service'; // AuthService Eklendi

@Component({
  selector: 'app-user-complaints',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-complaints.html',
  styleUrls: ['./user-complaints.css']
})
export class UserComplaintsComponent implements OnInit {

  tumSikayetler: Complaint[] = [];
  gosterilenSikayetler: Complaint[] = [];
  secilenSikayet: Complaint | null = null;

  aktifSekme: string = 'Tümü';

  bekleyenSayisi: number = 0;
  incelenenSayisi: number = 0;
  cozulenSayisi: number = 0;

  private router = inject(Router);
  private complaintService = inject(ComplaintService);
  private authService = inject(AuthService); // AuthService Inject Edildi

  ngOnInit() {
    // 1. Giriş yapan kullanıcının kimliğini alıyoruz
    const currentUser = this.authService.currentUser();

    if (currentUser && currentUser.uid) {
      // 2. SADECE BU KULLANICIYA AİT şikayetleri çeken servisi çağırıyoruz
      this.complaintService.getMyComplaints(currentUser.uid).subscribe((data: Complaint[]) => {
        this.tumSikayetler = data;
        this.gosterilenSikayetler = data; 
        this.istatistikleriHesapla();
      });
    } else {
      console.warn("Kullanıcı oturumu bulunamadı, şikayetler çekilemiyor.");
    }
  }

  istatistikleriHesapla() {
    this.bekleyenSayisi =
      this.tumSikayetler.filter(s => s.status === 'Beklemede').length;

    this.incelenenSayisi =
      this.tumSikayetler.filter(s => s.status === 'İnceleniyor').length;

    this.cozulenSayisi =
      this.tumSikayetler.filter(s => s.status === 'Çözüldü').length;
  }

  filtrele(durum: string) {
    this.aktifSekme = durum;

    if (durum === 'Tümü') {
      this.gosterilenSikayetler = this.tumSikayetler;
    } else {
      this.gosterilenSikayetler =
        this.tumSikayetler.filter(s => s.status === durum);
    }
  }

  geriDon() {
    this.router.navigate(['/anasayfa']);
  }

  sikayetBildir() {
    this.router.navigate(['/anasayfa']);
  }

  detayAc(sikayet: Complaint) {
    this.secilenSikayet = sikayet;
  }

  detayKapat() {
    this.secilenSikayet = null;
  }
}