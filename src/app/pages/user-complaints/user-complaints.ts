import { Component, OnInit, effect, inject, ChangeDetectorRef } from '@angular/core'; // ChangeDetectorRef eklendi
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ComplaintService } from '../../services/complaint';
import { Complaint } from '../../models/complaint';
import { AuthService } from '../../services/auth.service';

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
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef); // Angular'ı uyandırmak için servisi çağırdık!

  constructor() {
    effect(() => {
      const user = this.authService.currentUser();
      const userId = user ? user.uid : null;

      if (userId) {
        this.complaintService.getMyComplaints(userId).subscribe({
          next: (data: Complaint[]) => {
            this.tumSikayetler = data;
            this.istatistikleriHesapla();
            this.filtrele(this.aktifSekme);
            
            // ANGULAR'I DÜRTÜYORUZ: "Veriler geldi, ekranı yenile!"
            this.cdr.detectChanges(); 
          },
          error: (err) => {
            console.error("Şikayetler çekilirken hata oluştu:", err);
          }
        });
      }
    });
  }

  ngOnInit() {}

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