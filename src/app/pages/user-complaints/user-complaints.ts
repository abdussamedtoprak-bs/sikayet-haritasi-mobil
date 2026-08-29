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

  /**
   * @description Detay penceresindeki fotoğraf şeridinde o an görünen fotoğrafın sırası.
   * Şeridin altındaki nokta göstergesini sürer.
   */
  aktifFotograf: number = 0;

  /** @description Tam ekran fotoğraf görüntüleyici açık mı? */
  tamEkranAcik: boolean = false;

  /** @description Tam ekranda gösterilen fotoğrafın sırası. */
  tamEkranIndex: number = 0;

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
   * @description Listedeki şikayetlerin kapak fotoğraflarını veritabanından çeker.
   *
   * Liste hızlı açılsın diye her şikayetin yalnızca ilk fotoğrafı indirilir;
   * kalan fotoğraflar detay penceresi açıldığında yüklenir.
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
   * @description Detayı açılan şikayetin bütün fotoğraflarını indirir.
   * Kapak fotoğrafı zaten önbellekte olduğu için yalnızca eksikler istenir.
   *
   * @param {Complaint} sikayet - Detay penceresi açılan şikayet
   */
  private async detayFotograflariniYukle(sikayet: Complaint): Promise<void> {
    const eksikIdler = (sikayet.mediaIds ?? [])
      .filter(id => !this.fotografCache[id]);

    for (const id of eksikIdler) {
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
   * @description Bir şikayetin kapak (ilk) fotoğrafını döndürür.
   * Fotoğraf yoksa veya henüz yüklenmediyse null döner.
   *
   * @param {Complaint} sikayet - Fotoğrafı istenen şikayet
   * @returns {string | null} Fotoğrafın base64 hali veya null
   */
  sikayetFotografi(sikayet: Complaint | null): string | null {
    const id = sikayet?.mediaIds?.[0];

    return id ? (this.fotografCache[id] ?? null) : null;
  }

  /**
   * @description Bir şikayetin indirilmiş bütün fotoğraflarını sırasıyla döndürür.
   * Henüz inmemiş fotoğraflar listeye girmez.
   *
   * @param {Complaint} sikayet - Fotoğrafları istenen şikayet
   * @returns {string[]} Fotoğrafların base64 listesi
   */
  sikayetFotograflari(sikayet: Complaint | null): string[] {
    return (sikayet?.mediaIds ?? [])
      .map(id => this.fotografCache[id])
      .filter((veri): veri is string => !!veri);
  }

  /**
   * @description Bir şikayete yüklenmiş toplam fotoğraf sayısını döndürür.
   * Liste kartındaki "+2" rozeti bu sayıdan hesaplanır.
   *
   * @param {Complaint} sikayet - Sayısı istenen şikayet
   * @returns {number} Fotoğraf sayısı
   */
  fotografSayisi(sikayet: Complaint | null): number {
    return sikayet?.mediaIds?.length ?? 0;
  }

  /**
   * @description Fotoğraf şeridi kaydırıldığında görünen fotoğrafın sırasını hesaplar.
   * Şeritteki her fotoğraf tam genişlikte olduğu için, kaydırma miktarının
   * şerit genişliğine bölümü doğrudan sıra numarasını verir.
   *
   * @param {Event} olay - Şeridin kaydırma olayı
   */
  seritKaydirildi(olay: Event): void {
    const serit = olay.target as HTMLElement;

    if (serit.clientWidth === 0) return;

    this.aktifFotograf = Math.round(serit.scrollLeft / serit.clientWidth);
  }

  /**
   * @description Tıklanan fotoğrafı tam ekranda açar.
   * @param {number} index - Açılacak fotoğrafın sırası
   */
  tamEkranAc(index: number): void {
    this.tamEkranIndex = index;
    this.tamEkranAcik = true;
  }

  /** @description Tam ekran görüntüleyiciyi kapatır. */
  tamEkranKapat(): void {
    this.tamEkranAcik = false;
  }

  /**
   * @description Tam ekranda bir sonraki fotoğrafa geçer.
   * Son fotoğraftan sonra başa döner.
   */
  sonrakiFotograf(): void {
    const toplam = this.sikayetFotograflari(this.secilenSikayet).length;

    if (toplam === 0) return;

    this.tamEkranIndex = (this.tamEkranIndex + 1) % toplam;
  }

  /**
   * @description Tam ekranda bir önceki fotoğrafa geçer.
   * İlk fotoğraftan önce sona döner.
   */
  oncekiFotograf(): void {
    const toplam = this.sikayetFotograflari(this.secilenSikayet).length;

    if (toplam === 0) return;

    this.tamEkranIndex = (this.tamEkranIndex - 1 + toplam) % toplam;
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
    this.aktifFotograf = 0;
    this.tamEkranAcik = false;

    this.detayFotograflariniYukle(sikayet);
  }

  detayKapat() {
    this.secilenSikayet = null;
    this.tamEkranAcik = false;
  }
}