import { Component, OnInit, effect, inject, ChangeDetectorRef } from '@angular/core'; // ChangeDetectorRef eklendi
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ComplaintService } from '../../services/complaint';
import { Complaint } from '../../models/complaint';
import { AuthService } from '../../services/auth.service';
import { MediaService } from '../../services/media.service';

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
  private mediaService = inject(MediaService);

  /**
   * @description Yüklenen fotoğrafların önbelleği (medya kimliği → base64).
   * Aynı fotoğrafın tekrar tekrar indirilmesini önler.
   */
  fotografCache: Record<string, string> = {};

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

                        // Fotoğrafları arka planda yükle, liste beklemesin
            this.fotograflariYukle();
          },
          error: (err) => {
            console.error("Şikayetler çekilirken hata oluştu:", err);
          }
        });
      }
    });
  }

  ngOnInit() {}

  /**
   * @description Listedeki şikayetlerin fotoğraflarını veritabanından çeker.
   *
   * Fotoğraflar şikayet kaydının içinde tutulmadığı için ayrıca istenir.
   * Daha önce indirilenler önbellekten kullanılır, tekrar indirilmez.
   */
  private async fotograflariYukle(): Promise<void> {
    const yeniIdler = this.tumSikayetler
      .map(sikayet => sikayet.mediaIds?.[0])
      .filter((id): id is string => !!id && !this.fotografCache[id]);

    for (const id of yeniIdler) {
      try {
        const veri = await this.mediaService.getImageData(id);

        if (veri) {
          this.fotografCache[id] = veri;
        }
      } catch (error) {
        console.error('Fotoğraf yüklenemedi:', id, error);
      }
    }

    this.cdr.detectChanges();
  }

  /**
   * @description Bir şikayetin ilk fotoğrafını döndürür.
   * Fotoğraf yoksa veya henüz yüklenmediyse null döner.
   *
   * @param {Complaint} sikayet - Fotoğrafı istenen şikayet
   * @returns {string | null} Fotoğrafın base64 hali veya null
   */
  sikayetFotografi(sikayet: Complaint | null): string | null {
    const id = sikayet?.mediaIds?.[0];

    return id ? (this.fotografCache[id] ?? null) : null;
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