import {
  Component,
  Output,
  EventEmitter,
  signal,
  Input,
  OnInit,
  inject,
  HostListener
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Complaint } from '../../../models/complaint';
import { ComplaintService } from '../../../services/complaint';
import { AuthService } from '../../../services/auth.service';

import { MediaService } from '../../../services/media.service';
import { ConnectionService } from '../../../services/connection.service';

/**
 * Kullanıcının kampüs sorunlarını bildirebildiği panel bileşenidir.
 * Konum, kategori, açıklama ve fotoğraf alanlarından oluşan bir form sunar.
 */
@Component({
  selector: 'app-sorun-bildirme-paneli',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sorun-bildir-paneli.html',
  styleUrl: './sorun-bildir-paneli.css'
})
export class SorunBildirmePaneli implements OnInit {

  /**
   * Haritadan gelen anlık koordinat bilgisini karşılar.
   */
  @Input() gelenKonum: { lat: number; lng: number } | null = null;

  /**
   * Üst bileşene paneli kapatma eventi gönderir.
   */
  @Output() panelKapat = new EventEmitter<void>();

  /**
   * Servisler
   */
  private readonly authService = inject(AuthService);
  private readonly complaintService = inject(ComplaintService);
  
    private readonly mediaService = inject(MediaService);

  /** @description Bağlantı durumu. Şablonda okunduğu için public. */
  readonly baglantiService = inject(ConnectionService);

  /**
   * @description Bu gönderim için üretilen belge kimliği.
   *
   * Zaman aşımına uğrayan bir gönderim tekrar denendiğinde aynı kimlik
   * kullanılır. Böylece ilk deneme sonradan sunucuya ulaşsa bile ikinci
   * bir şikayet kaydı oluşmaz.
   */
  private belgeId: string | null = null;

  /**
   * @description Bu gönderimde yüklenmiş fotoğrafların kimlikleri.
   *
   * Tekrar denemede fotoğraflar yeniden yüklenmez; aksi halde her
   * denemede veritabanında sahipsiz kopyalar birikirdi.
   */
  private yuklenenMediaIds: string[] | null = null;

  /**
   * Form verilerini tutan nesne.
   */
  reportData = {
    konum: 'Mevcut konumunuz',
    kategori: 'cevre',
    aciklama: ''
  };

  /**
   * Seçilebilir kategori listesi.
   */
  categories = [
    { id: 'cevre', name: 'Çevre', icon: '🍃' },
    { id: 'aydinlatma', name: 'Aydınlatma', icon: '💡' },
    { id: 'cop', name: 'Çöp', icon: '🗑️' },
    { id: 'diger', name: 'Diğer', icon: '⋯' }
  ];

  /**
   * Yüklenen fotoğrafların Base64 listesi.
   */
  fotograflar = signal<string[]>([]);
    /** @description Fotoğraf küçültülürken true olur, arayüz bekleme gösterir. */
  fotografIsleniyor = signal<boolean>(false);

  /** @description Şikayet gönderilirken true olur, mükerrer gönderimi engeller. */
  gonderiliyor = signal<boolean>(false);

  ngOnInit(): void {
    if (this.gelenKonum) {
      this.reportData.konum =
        `${this.gelenKonum.lat.toFixed(4)}, ${this.gelenKonum.lng.toFixed(4)}`;
    }
  }

  /**
   * @description Panelde kaydedilmemiş bir içerik var mı?
   * Açıklama yazılmışsa veya fotoğraf eklenmişse true döner.
   *
   * @returns {boolean} Form doluysa true
   */
  private dolduMu(): boolean {
    return this.reportData.aciklama.trim().length > 0
        || this.fotograflar().length > 0;
  }

  /**
   * @description Paneli kapatır.
   *
   * Gönderim sürerken kapatma çalışmaz; yarıda kesilen bir kayıt,
   * veritabanında sahipsiz fotoğraf bırakır.
   *
   * Formda yazılmış bir şey varsa kullanıcıya sorulur. Uzun bir açıklama
   * yazıp üç fotoğraf yüklemiş bir kullanıcının emeği tek dokunuşla
   * silinmemelidir.
   */
  kapat(): void {
    if (this.gonderiliyor()) return;

    if (this.dolduMu()) {
      const onay = confirm('Yazdıklarınız kaybolacak. Paneli kapatmak istiyor musunuz?');

      if (!onay) return;
    }

    this.panelKapat.emit();
  }

  /**
   * @description ESC tuşuna basıldığında paneli kapatır.
   * Klavye kullanan kullanıcılar için beklenen davranıştır.
   */
  @HostListener('document:keydown.escape')
  escBasildi(): void {
    this.kapat();
  }




  /**
   * Kategori seçimini gerçekleştirir.
   */
  kategoriSec(id: string): void {
    this.reportData.kategori = id;
  }

  
    /**
   * @description Seçilen fotoğrafları küçültüp önizleme listesine ekler.
   *
   * Fotoğraflar seçildiği anda küçültülür; böylece hem önizleme hafif olur
   * hem de gönderim sırasında ek bir işlem beklemeye gerek kalmaz.
   * En fazla 3 fotoğraf eklenebilir.
   *
   * @param {any} event - Dosya seçme alanının change olayı
   */
  async fotografSec(event: any): Promise<void> {
    const files: FileList = event.target.files;

    if (!files || files.length === 0) return;

    this.fotografIsleniyor.set(true);

    try {
      for (let i = 0; i < files.length; i++) {

        if (this.fotograflar().length >= 3) break;

        const kucultulmusFotograf = await this.mediaService.resizeImage(files[i]);

        this.fotograflar.update(list => [...list, kucultulmusFotograf]);
      }
    } catch (error) {
      console.error('Fotoğraf işlenirken hata oluştu:', error);
      alert('Fotoğraf işlenemedi. Lütfen başka bir dosya deneyin.');
    } finally {
      this.fotografIsleniyor.set(false);

      // Aynı dosyanın silinip tekrar seçilebilmesi için alanı sıfırla
      event.target.value = '';
    }
  }

  /**
   * Seçilen fotoğrafı siler.
   */
  fotografSil(index: number): void {
    this.fotograflar.update(
      list => list.filter((_, i) => i !== index)
    );
  }

   /**
   * @description Formu doğrular, fotoğrafları yükler ve şikayeti veritabanına kaydeder.
   *
   * Fotoğraflar şikayetten önce yüklenir; her fotoğraf için bir medya kimliği
   * üretilir ve bu kimlikler şikayet kaydına eklenir. Fotoğrafın kendisi
   * şikayet dokümanında tutulmaz, ayrı bir veritabanında saklanır.
   */
  async gonder(): Promise<void> {

    // Butona üst üste basılmasını engelle
    if (this.gonderiliyor()) return;

    const currentUser = this.authService.currentUser();

    if (!currentUser) {
      alert('Şikayet bildirmek için oturum açmalısınız!');
      return;
    }

       if (!this.reportData.aciklama.trim()) {
      alert('Lütfen şikayetiniz için bir açıklama yazın.');
      return;
    }

    // Konumsuz şikayet kaydedilemez.
    // Aksi halde koordinat 0,0 olarak yazılır ve şikayet haritada
    // kampüs sınırlarının dışında, görünmez bir noktaya düşer.
    const konum = this.gelenKonum;

        if (!konum) {
      alert('Şikayetin konumu belirlenemedi. Lütfen haritadan bir nokta seçin.');
      return;
    }

    // Çevrimdışıyken gönderim hiç denenmez.
    // Firestore yazmaları sunucu onayı beklediği için bağlantı yokken
    // sonuçlanmaz ve kullanıcı sonsuza kadar bekler.
    if (this.baglantiService.cevrimdisi()) {
      alert('İnternet bağlantınız yok. Bağlantı sağlandığında tekrar deneyin.');
      return;
    }

    // Tekrar denemede aynı kimlik kullanılsın diye yalnızca ilk seferde üretilir
    if (!this.belgeId) {
      this.belgeId = crypto.randomUUID();
    }

    this.gonderiliyor.set(true);

    try {
            // 1. Fotoğrafları yükle, kimliklerini al.
      //    Daha önce yüklendiyse tekrar yüklenmez.
      if (!this.yuklenenMediaIds) {
        this.yuklenenMediaIds = this.fotograflar().length > 0
          ? await this.baglantiService.zamanAsimiIle(
              this.mediaService.uploadImages(this.fotograflar(), currentUser.uid)
            )
          : [];
      }

      const mediaIds = this.yuklenenMediaIds;

            // 2. Koordinat doğrudan seçilen noktadan alınır.
      //    Metin alanından ayrıştırmak güvenilir değildi: kullanıcı metni
      //    değiştirebiliyor, konum alınamadığında da yer tutucu yazı kalıyordu.
      const enlem = konum.lat;
      const boylam = konum.lng;

      const baslangicDestek = 1;

      // 3. Şikayet nesnesini hazırla
      const yeniSikayet: Complaint = {
        userId: currentUser.uid,
        title: 'Yeni Bildirim: ' + this.reportData.kategori.toUpperCase(),
        supportCount: baslangicDestek,
        description: this.reportData.aciklama,
                // Kategori adı seçilen değerden okunur; daha önce sabit "Genel" yazılıyor
        // ve kullanıcının seçimi hiçbir ekranda görünmüyordu.
        metaInfo: (this.categories.find(k => k.id === this.reportData.kategori)?.name ?? 'Genel')
                  + ' - ' + new Date().toLocaleDateString('tr-TR'),
        status: 'Beklemede',
        priority: this.complaintService.hesaplaOncelik(baslangicDestek),
        location: this.reportData.konum,
        lat: enlem,
        lng: boylam,
        category: this.reportData.kategori,
        mediaIds: mediaIds
      };

      // 4. Veritabanına kaydet
      await this.baglantiService.zamanAsimiIle(
        this.complaintService.addComplaint(yeniSikayet, this.belgeId)
      );

      alert('Şikayetiniz başarıyla kaydedildi!');
      this.panelKapat.emit();

        } catch (error) {
      console.error('Şikayet kaydedilirken hata oluştu:', error);

      if (this.baglantiService.zamanAsimiMi(error)) {
        alert('Şikayet gönderilemedi. Bağlantınız kesilmiş veya çok yavaş olabilir. Lütfen tekrar deneyin.');
      } else {
        alert('Kaydedilirken bir hata oluştu. Lütfen tekrar deneyin.');
      }
    } finally {
      this.gonderiliyor.set(false);
    }
  }
}