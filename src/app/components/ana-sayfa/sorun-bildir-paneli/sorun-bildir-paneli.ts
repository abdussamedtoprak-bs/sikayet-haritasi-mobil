import {
  Component,
  Output,
  EventEmitter,
  signal,
  Input,
  OnInit,
  inject
} from '@angular/core';

import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Complaint } from '../../../models/complaint';
import { ComplaintService } from '../../../services/complaint';
import { AuthService } from '../../../services/auth.service';

import { MediaService } from '../../../services/media.service';

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

    this.gonderiliyor.set(true);

    try {
      // 1. Fotoğrafları yükle, kimliklerini al
      let mediaIds: string[] = [];

      if (this.fotograflar().length > 0) {
        mediaIds = await this.mediaService.uploadImages(
          this.fotograflar(),
          currentUser.uid
        );
      }

      // 2. Konum bilgisini enlem ve boylam olarak ayır
      const konumParcalari = this.reportData.konum.split(',');

      const enlem = konumParcalari.length > 1
        ? parseFloat(konumParcalari[0].trim())
        : 0;

      const boylam = konumParcalari.length > 1
        ? parseFloat(konumParcalari[1].trim())
        : 0;

      const baslangicDestek = 1;

      // 3. Şikayet nesnesini hazırla
      const yeniSikayet: Complaint = {
        userId: currentUser.uid,
        title: 'Yeni Bildirim: ' + this.reportData.kategori.toUpperCase(),
        supportCount: baslangicDestek,
        description: this.reportData.aciklama,
        metaInfo: 'Genel - ' + new Date().toLocaleDateString('tr-TR'),
        status: 'Beklemede',
        priority: this.complaintService.hesaplaOncelik(baslangicDestek),
        location: this.reportData.konum,
        lat: enlem,
        lng: boylam,
        category: this.reportData.kategori,
        mediaIds: mediaIds
      };

      // 4. Veritabanına kaydet
      await this.complaintService.addComplaint(yeniSikayet);

      alert('Şikayetiniz başarıyla kaydedildi!');
      this.panelKapat.emit();

    } catch (error) {
      console.error('Şikayet kaydedilirken hata oluştu:', error);
      alert('Kaydedilirken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      this.gonderiliyor.set(false);
    }
  }
}