import { Component, OnInit, OnDestroy, effect, inject, ChangeDetectorRef } from '@angular/core'; // ChangeDetectorRef eklendi
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ComplaintService } from '../../services/complaint';
import { Complaint } from '../../models/complaint';
import { AuthService } from '../../services/auth.service';
import { MediaService } from '../../services/media.service';
import { ConnectionService } from '../../services/connection.service';
import { SIKAYET_KATEGORILERI, SikayetKategorisi } from '../../models/category';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-user-complaints',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './user-complaints.html',
  styleUrls: ['./user-complaints.css']
})
export class UserComplaintsComponent implements OnInit, OnDestroy {
  tumSikayetler: Complaint[] = [];
  gosterilenSikayetler: Complaint[] = [];
  secilenSikayet: Complaint | null = null;

  aktifSekme: string = 'Tümü';

  bekleyenSayisi: number = 0;
  incelenenSayisi: number = 0;
  cozulenSayisi: number = 0;
  geriCekilenSayisi: number = 0;

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

  /** @description Şikayet akışına ait abonelik. Kullanıcı değişince yenilenir. */
  private sikayetAboneligi?: Subscription;

  
  private connectionService = inject(ConnectionService);

  /** @description Seçilebilir kategoriler. Düzenleme formunda kullanılır. */
  readonly kategoriler: SikayetKategorisi[] = SIKAYET_KATEGORILERI;

  /** @description Detay penceresi düzenleme modunda mı? */
  duzenlemeModu: boolean = false;

  /** @description Düzenleme formundaki açıklama metni. */
  duzenlenenAciklama: string = '';

  /** @description Düzenleme formunda seçili kategori. */
  duzenlenenKategori: string = '';

  /** @description Düzenleme formunda duran fotoğraf kimlikleri. */
  duzenlenenMediaIds: string[] = [];

  /**
   * @description Düzenleme sırasında listeden çıkarılan fotoğrafların kimlikleri.
   * Kaydet'e basılınca "kaldırıldı" olarak işaretlenirler; silinmezler.
   */
  private kaldirilanMediaIds: string[] = [];

  /** @description Düzenleme kaydediliyor mu? */
  kaydediliyor: boolean = false;

  /** @description Geri çekme onayı bekleniyor mu? */
  geriCekmeOnayi: boolean = false;

  /** @description Geri çekme işlemi sürüyor mu? */
  geriCekiliyor: boolean = false;


    constructor() {
    effect(() => {
      const user = this.authService.currentUser();
      const userId = user ? user.uid : null;

      // Önceki aboneliği kapat, birden fazla akış birikmesin
      this.sikayetAboneligi?.unsubscribe();

      // Çıkış yapıldıysa ekranda ve bellekte kişisel veri bırakma
      if (!userId) {
        this.tumSikayetler = [];
        this.gosterilenSikayetler = [];
        this.secilenSikayet = null;
        this.fotografCache = {};
        this.istatistikleriHesapla();
        return;
      }

      this.sikayetAboneligi = this.complaintService.getMyComplaints(userId).subscribe({
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
    });
  }

  ngOnInit() {}

  /**
   * @description Sayfadan ayrılırken canlı akışı kapatır ve fotoğraf
   * önbelleğini boşaltır. Fotoğraflar base64 olarak tutulduğu için
   * bellekte gereksiz yer kaplarlar; ayrıca kişisel veridirler.
   */
  ngOnDestroy(): void {
    this.sikayetAboneligi?.unsubscribe();
    this.fotografCache = {};
  }

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

    // Geri çekilenler ayrı sayılır; aksi halde toplam diğerlerinin
    // toplamını tutmaz ve ekrandaki sayılar tutarsız görünür.
    this.geriCekilenSayisi =
      this.tumSikayetler.filter(s => s.status === 'Geri Çekildi').length;
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
    this.duzenlemeyiSifirla();

    this.detayFotograflariniYukle(sikayet);
  }

  detayKapat() {
    this.secilenSikayet = null;
    this.tamEkranAcik = false;
    this.duzenlemeyiSifirla();
  }

  /** @description Düzenleme ve geri çekme durumunu başlangıca döndürür. */
  private duzenlemeyiSifirla(): void {
    this.duzenlemeModu = false;
    this.kaydediliyor = false;
    this.geriCekmeOnayi = false;
    this.geriCekiliyor = false;
    this.kaldirilanMediaIds = [];
  }

    /**
   * @description Seçili şikayet düzenlenebilir mi?
   * Kural servis katmanında tanımlıdır, ekran onu okur.
   */
  duzenlenebilirMi(): boolean {
    if (!this.secilenSikayet) return false;

    return this.complaintService.canEditComplaint(this.secilenSikayet);
  }

  /**
   * @description Seçili şikayet geri çekilebilir mi?
   * Düzenlemeden daha geniştir; incelemeye alınmış şikayet de geri çekilebilir.
   */
  geriCekilebilirMi(): boolean {
    if (!this.secilenSikayet) return false;

    return this.complaintService.canWithdrawComplaint(this.secilenSikayet);
  }

  /**
   * @description Şikayete başkalarından gelen destek sayısı.
   * Kullanıcının kendi desteği (kayıt anındaki 1) sayılmaz.
   *
   * @returns {number} Başkalarının verdiği destek sayısı
   */
  private baskaDestekSayisi(): number {
    return (this.secilenSikayet?.supportCount ?? 1) - 1;
  }

  /**
   * @description Düzenleme formunda gösterilecek destek uyarısı.
   * Destek yoksa boş döner.
   */
  duzenlemeDestekUyarisi(): string {
    const destek = this.baskaDestekSayisi();

    if (destek <= 0) return '';

    return `Bu şikayet ${destek} kişi tarafından desteklendi. `
         + 'Düzenlerseniz şikayetiniz "düzenlendi" olarak işaretlenecek.';
  }

  /**
   * @description Geri çekme onayında gösterilecek destek uyarısı.
   * Destek yoksa boş döner.
   */
  geriCekmeDestekUyarisi(): string {
    const destek = this.baskaDestekSayisi();

    if (destek <= 0) return '';

    return `Bu şikayet ${destek} kişi tarafından desteklendi. `
         + 'Geri çekerseniz verdikleri destek de geçersiz olacak.';
  }

  /**
   * @description Düzenleme kapalıysa sebebini, açıksa hatırlatma metnini döndürür.
   *
   * Soluk bir butonun yanında sebep yazmıyorsa kullanıcı neyin yanlış
   * gittiğini anlamaz; sadece uygulamanın bozuk olduğunu düşünür.
   *
   * @returns {string} Ekranda gösterilecek açıklama
   */
    duzenlemeAciklamasi(): string {
    const sikayet = this.secilenSikayet;

    if (!sikayet) return '';

    if (sikayet.status === 'Geri Çekildi') {
      return 'Bu şikayeti geri çektiniz. Üzerinde değişiklik yapılamaz.';
    }

    if (sikayet.status === 'Çözüldü') {
      return 'Şikayetiniz çözüldü. Kayıt olduğu gibi kalır, düzenlenemez veya geri çekilemez.';
    }

    if (sikayet.status === 'İnceleniyor') {
      return 'Şikayetiniz incelemeye alındı. İçeriği artık düzenlenemez, '
           + 'ancak isterseniz geri çekebilirsiniz.';
    }

    return 'Şikayetinizi düzenleyebilir veya geri çekebilirsiniz. '
         + 'Düzenleme, şikayetiniz incelemeye alındığında kapanır.';
  }

  /** @description Düzenleme formunu açar ve mevcut değerleri forma doldurur. */
  duzenlemeyiAc(): void {
    if (!this.secilenSikayet || !this.duzenlenebilirMi()) return;

    this.duzenlenenAciklama = this.secilenSikayet.description ?? '';
    this.duzenlenenKategori = this.secilenSikayet.category ?? 'diger';
    this.duzenlenenMediaIds = [...(this.secilenSikayet.mediaIds ?? [])];
    this.kaldirilanMediaIds = [];
    this.duzenlemeModu = true;
  }

  /** @description Düzenlemeden vazgeçer, hiçbir değişiklik kaydedilmez. */
  duzenlemeyiIptalEt(): void {
    this.duzenlemeModu = false;
    this.kaldirilanMediaIds = [];
  }

  /**
   * @description Düzenleme formunda kategori seçer.
   * @param {string} id - Kategori kimliği
   */
  duzenlemeKategoriSec(id: string): void {
    this.duzenlenenKategori = id;
  }

  /**
   * @description Düzenleme formunda bir fotoğrafı listeden çıkarır.
   * Fotoğraf burada silinmez, yalnızca listeden düşer; kaydedilince
   * "kaldırıldı" olarak işaretlenir.
   *
   * @param {number} index - Çıkarılacak fotoğrafın sırası
   */
  duzenlemeFotografKaldir(index: number): void {
    const id = this.duzenlenenMediaIds[index];

    if (!id) return;

    this.kaldirilanMediaIds.push(id);
    this.duzenlenenMediaIds.splice(index, 1);
  }

  /**
   * @description Düzenleme formundaki fotoğrafların verilerini döndürür.
   * @returns {string[]} Base64 fotoğraf listesi
   */
  duzenlemeFotograflari(): string[] {
    return this.duzenlenenMediaIds
      .map(id => this.fotografCache[id])
      .filter((veri): veri is string => !!veri);
  }

  /** @description Düzenlemeyi veritabanına kaydeder. */
  async duzenlemeyiKaydet(): Promise<void> {
    const sikayet = this.secilenSikayet;

    if (!sikayet?.id || this.kaydediliyor) return;

    if (!this.duzenlenenAciklama.trim()) {
      alert('Açıklama boş bırakılamaz.');
      return;
    }

    if (this.connectionService.cevrimdisi()) {
      alert('İnternet bağlantınız yok. Bağlantı sağlandığında tekrar deneyin.');
      return;
    }

    this.kaydediliyor = true;

    try {
      await this.connectionService.zamanAsimiIle(
        this.complaintService.updateComplaint(sikayet.id, {
          description: this.duzenlenenAciklama.trim(),
          category: this.duzenlenenKategori,
          mediaIds: this.duzenlenenMediaIds
        })
      );

      // Listeden çıkarılan fotoğraflar silinmez, işaretlenir
      for (const id of this.kaldirilanMediaIds) {
        try {
          await this.mediaService.markAsRemoved(id);
        } catch (error) {
          console.error('Fotoğraf işaretlenemedi:', id, error);
        }
      }

      this.duzenlemeModu = false;
      this.kaldirilanMediaIds = [];

    } catch (error) {
      console.error('Şikayet güncellenemedi:', error);

      if (error instanceof Error && error.message === 'DUZENLENEMEZ') {
        alert('Bu şikayet artık düzenlenemez. Destek almış veya incelemeye alınmış olabilir.');
        this.duzenlemeModu = false;
      } else if (this.connectionService.zamanAsimiMi(error)) {
        alert('Değişiklik kaydedilemedi. Bağlantınız kesilmiş olabilir, tekrar deneyin.');
      } else {
        alert('Değişiklik kaydedilemedi. Lütfen tekrar deneyin.');
      }
    } finally {
      this.kaydediliyor = false;
      this.cdr.detectChanges();
    }
  }

  /** @description Geri çekme onayını açar. */
    geriCekmeyiSor(): void {
    if (!this.geriCekilebilirMi()) return;

    this.geriCekmeOnayi = true;
  }

  /** @description Geri çekmeden vazgeçer. */
  geriCekmeyiIptalEt(): void {
    this.geriCekmeOnayi = false;
  }

  /** @description Şikayeti geri çeker. Kayıt silinmez, durumu değişir. */
  async geriCekmeyiOnayla(): Promise<void> {
    const sikayet = this.secilenSikayet;

    if (!sikayet?.id || this.geriCekiliyor) return;

    if (this.connectionService.cevrimdisi()) {
      alert('İnternet bağlantınız yok. Bağlantı sağlandığında tekrar deneyin.');
      return;
    }

    this.geriCekiliyor = true;

    try {
      await this.connectionService.zamanAsimiIle(
        this.complaintService.withdrawComplaint(sikayet.id)
      );

      this.detayKapat();

    } catch (error) {
      console.error('Şikayet geri çekilemedi:', error);

      if (error instanceof Error && error.message === 'GERI_CEKILEMEZ') {
        alert('Bu şikayet artık geri çekilemez. Destek almış veya incelemeye alınmış olabilir.');
        this.geriCekmeOnayi = false;
      } else if (this.connectionService.zamanAsimiMi(error)) {
        alert('İşlem tamamlanamadı. Bağlantınız kesilmiş olabilir, tekrar deneyin.');
      } else {
        alert('İşlem tamamlanamadı. Lütfen tekrar deneyin.');
      }
    } finally {
      this.geriCekiliyor = false;
      this.cdr.detectChanges();
    }
  }
}