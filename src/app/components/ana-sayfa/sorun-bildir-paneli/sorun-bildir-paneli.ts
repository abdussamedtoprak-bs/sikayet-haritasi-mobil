import { Component, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

/**
 * @description Kullanıcının kampüs sorunlarını bildirebildiği panel bileşenidir.
 * Konum, kategori, açıklama ve fotoğraf alanlarından oluşan bir form sunar.
 * Firebase entegrasyonuna kadar veriler konsola yazdırılmaktadır.
 */
@Component({
  selector: 'app-sorun-bildirme-paneli',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sorun-bildir-paneli.html',
  styleUrl: './sorun-bildir-paneli.css',
})
export class SorunBildirmePaneli {

  /** @description Paneli kapatmak için üst bileşene event fırlatır */
  @Output() panelKapat = new EventEmitter<void>();

  /** @description Form verilerini tutan nesne */
  reportData = {
    konum: 'Mevcut konumunuz',
    kategori: 'cevre',
    aciklama: ''
  };

  /** @description Seçilebilir kategori listesi */
  categories = [
    { id: 'cevre', name: 'Çevre', icon: '🍃' },
    { id: 'aydinlatma', name: 'Aydınlatma', icon: '💡' },
    { id: 'cop', name: 'Çöp', icon: '🗑️' },
    { id: 'diger', name: 'Diğer', icon: '⋯' }
  ];

  /**
   * @description Yüklenen fotoğrafların base64 listesi.
   * Signal olarak tutulur; FileReader gibi Angular'ın izlemediği
   * async callback'ler içinde bile arayüzün anında güncellenmesini sağlar.
   */
  fotograflar = signal<string[]>([]);

  /**
   * @description Seçilen kategoriyi aktif hale getirir.
   * @param {string} id - Seçilen kategorinin id'si
   */
  kategoriSec(id: string): void {
    this.reportData.kategori = id;
  }

  /**
   * @description Dosya seçici üzerinden fotoğraf yükler.
   * Maksimum 3 fotoğraf yüklenebilir.
   * @param {any} event - Dosya input change eventi
   */
  fotografSec(event: any): void {
    const files = event.target.files;
    if (files) {
      for (let i = 0; i < files.length; i++) {
        if (this.fotograflar().length >= 3) break;
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.fotograflar.update(list => [...list, e.target.result]);
        };
        reader.readAsDataURL(files[i]);
      }
    }
  }

  /**
   * @description Yüklenen fotoğrafı listeden kaldırır.
   * @param {number} index - Silinecek fotoğrafın indeksi
   */
  fotografSil(index: number): void {
    this.fotograflar.update(list => list.filter((_, i) => i !== index));
  }

  /**
   * @description Formu gönderir ve paneli kapatır.
   * Firebase entegrasyonunda Firestore'a kaydedilecektir.
   */
  gonder(): void {
    console.log('Gönderilen Veriler:', {
      ...this.reportData,
      fotograflar: this.fotograflar()
    });
    alert('Sorunuz başarıyla bildirildi!');
    this.panelKapat.emit();
  }
}