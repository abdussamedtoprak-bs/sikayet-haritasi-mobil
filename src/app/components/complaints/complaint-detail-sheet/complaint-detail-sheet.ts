import { Component, Input, Output, EventEmitter, inject, signal, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Complaint } from '../../../models/complaint';
import { MediaService } from '../../../services/media.service';

@Component({
  selector: 'app-complaint-detail-sheet',
  imports: [CommonModule],
  templateUrl: './complaint-detail-sheet.html',
  styleUrl: './complaint-detail-sheet.css',
})
/**
 * @description Harita veya liste üzerinden seçilen spesifik bir şikayetin tüm detaylarını
 * (görsel, kategori, tarih, tam açıklama) ekranın altında açılan bir panel (bottom sheet) olarak gösterir.
 * İçerisindeki ok butonları sayesinde şikayetler arasında dinamik ileri/geri navigasyon yapılmasını sağlar.
 */
export class ComplaintDetailSheet implements OnChanges {

  private readonly mediaService = inject(MediaService);

  /**
   * @description Detayları gösterilecek olan aktif şikayet nesnesidir.
   * Üst bileşen tarafından (kullanıcının tıkladığı şikayet verisi) buraya aktarılır.
   * @type {Complaint}
   */
  @Input() complaint!: Complaint;

  /**
   * @description Şikayete ait fotoğrafların base64 verileri.
   * Fotoğraflar liste sorgusuyla birlikte inmez; yalnızca bu panel
   * açıldığında Realtime Database'den çekilir.
   */
  readonly images = signal<string[]>([]);

  /** @description Fotoğraflar yükleniyor mu? */
  readonly imagesLoading = signal<boolean>(false);

  /**
   * @description Kullanıcı paneli kapatmak istediğinde (çarpı butonuna basıldığında)
   * ana bileşene paneli gizlemesi için sinyal gönderir.
   */
  @Output() close = new EventEmitter<void>();

  /**
   * @description Sağ ok (ileri) tuşuna basıldığında tetiklenir.
   */
  @Output() next = new EventEmitter<void>();

  /**
   * @description Sol ok (geri) tuşuna basıldığında tetiklenir.
   */
  @Output() prev = new EventEmitter<void>();

  /**
   * @description Gösterilen şikayet değiştiğinde fotoğrafları yeniden yükler.
   * Şikayetler arasında ileri/geri gezinirken de çalışır.
   */
  async ngOnChanges(changes: SimpleChanges): Promise<void> {
    if (changes['complaint']) {
      await this.loadImages();
    }
  }

  /**
   * @description Şikayete ait fotoğrafları veritabanından çeker.
   * Fotoğrafı olmayan şikayetlerde hiçbir istek yapılmaz.
   */
  private async loadImages(): Promise<void> {
    this.images.set([]);

    const ids = this.complaint?.mediaIds;

    if (!ids || ids.length === 0) return;

    this.imagesLoading.set(true);

    try {
      const data = await this.mediaService.getImages(ids);
      this.images.set(data);
    } catch (error) {
      console.error('Şikayet fotoğrafları yüklenemedi:', error);
    } finally {
      this.imagesLoading.set(false);
    }
  }

  /**
   * @description İleri navigasyon tuşuna tıklanma olayını yakalar ve `next` event'ini fırlatır.
   */
  onNext() {
    this.next.emit();
  }

  /**
   * @description Geri navigasyon tuşuna tıklanma olayını yakalar ve `prev` event'ini fırlatır.
   */
  onPrev() {
    this.prev.emit();
  }

  /**
   * @description Kapatma (X) ikonuna tıklanma olayını yakalar ve `close` event'ini fırlatarak paneli sonlandırır.
   */
  closeSheet() {
    this.close.emit();
  }
}