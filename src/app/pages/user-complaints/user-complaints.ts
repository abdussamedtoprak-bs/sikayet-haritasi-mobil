import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

// 1. DÜZELTME: Dosya adı complaint.service değilse, sadece complaint olarak değiştirin.
// (Eğer dosyanız models klasöründeyse yolu '../../models/complaint' olarak güncelleyin)
import { ComplaintService } from '../../services/complaint'; 
import { Complaint } from '../../models/complaint';

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

  ngOnInit() {
    // 2. DÜZELTME: Gelen data'nın tipini "Complaint[]" olarak açıkça belirttik
    this.complaintService.getComplaints().subscribe((data: Complaint[]) => {
      this.tumSikayetler = data;
      this.gosterilenSikayetler = data; 
      this.istatistikleriHesapla();
    });
  }

  istatistikleriHesapla() {
    this.bekleyenSayisi = this.tumSikayetler.filter(s => s.status === 'Beklemede').length;
    this.incelenenSayisi = this.tumSikayetler.filter(s => s.status === 'İnceleniyor').length;
    this.cozulenSayisi = this.tumSikayetler.filter(s => s.status === 'Çözüldü').length;
  }

  filtrele(durum: string) {
    this.aktifSekme = durum;
    
    if (durum === 'Tümü') {
      this.gosterilenSikayetler = this.tumSikayetler;
    } else {
      this.gosterilenSikayetler = this.tumSikayetler.filter(s => s.status === durum);
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