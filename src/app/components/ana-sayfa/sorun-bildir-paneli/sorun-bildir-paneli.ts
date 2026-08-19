import { Component, Output, EventEmitter, signal,Input,OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Complaint } from '../../../models/complaint';
import { ComplaintService } from '../../../services/complaint';
import { AuthService } from '../../../services/auth.service';

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
export class SorunBildirmePaneli implements OnInit{

  /**
   * @description haritadan gelen anlık koordinat bilgisini karşılar
   * 
   */
  @Input() gelenKonum:{lat:number,lng:number}|null=null;
  

  constructor(private complaintService:ComplaintService,
    private authService: AuthService
  ){}

  ngOnInit(): void {
    if (this.gelenKonum) {
      // DİKKAT: Sağ ve soldaki işaretler normal tırnak değil, ters tırnaktır (backtick)
      this.reportData.konum = `${this.gelenKonum.lat.toFixed(4)}, ${this.gelenKonum.lng.toFixed(4)}`;
    }
  } 


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
  gonder() {
    // 1. Konum string'ini ("38.9052, 40.4824") parçalayıp enlem ve boylam (number) olarak ayırıyoruz
    const konumParcalari = this.reportData.konum.split(',');
    const enlem = parseFloat(konumParcalari[0].trim());
    const boylam = parseFloat(konumParcalari[1].trim());

    const baslangicDestek=1;
    // 2. Servisin beklediği Complaint (Şikayet) yapısını oluşturuyoruz
    const yeniSikayet: Complaint = {
      userId: this.authService.currentUser()?.uid || '',
      title: 'Yeni Bildirim: ' + this.reportData.kategori.toUpperCase(), 
      supportCount: baslangicDestek, // İlk destekleyeni kullanıcının kendisi sayıyoruz
      description: this.reportData.aciklama,
      metaInfo: 'Genel - ' + new Date().toLocaleDateString('tr-TR'),
      status: 'İnceleniyor', 
      // ÖNCELİK ARTIK SERVİSTEKİ KURALA GÖRE OTOMATİK BELİRLENİYOR
      priority: this.complaintService.hesaplaOncelik(baslangicDestek),
      location: 'Haritadan Bildirildi',
      lat: enlem,
      lng: boylam
    };

    // 3. Veriyi servisteki havuza gönderiyoruz
    this.complaintService.addComplaint(yeniSikayet);

    // 4. Kullanıcıya bilgi verip paneli kapatıyoruz
    alert('Sorunuz başarıyla bildirildi ve sisteme kaydedildi!');
    this.panelKapat.emit(); // Modalı kapatma sinyali
  }
}