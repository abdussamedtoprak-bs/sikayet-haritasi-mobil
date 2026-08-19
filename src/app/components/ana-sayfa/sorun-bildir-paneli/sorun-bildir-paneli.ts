import { Component, Output, EventEmitter, signal, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Complaint } from '../../../models/complaint';
import { ComplaintService } from '../../../services/complaint';
import { AuthService } from '../../../services/auth.service';

/**
 * @description Kullanıcının kampüs sorunlarını bildirebildiği panel bileşenidir.
 * Konum, kategori, açıklama ve fotoğraf alanlarından oluşan bir form sunar.
 */
@Component({
  selector: 'app-sorun-bildirme-paneli',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sorun-bildir-paneli.html',
  styleUrl: './sorun-bildir-paneli.css',
})
export class SorunBildirmePaneli implements OnInit{

  /** @description haritadan gelen anlık koordinat bilgisini karşılar */
  @Input() gelenKonum:{lat:number,lng:number}|null=null;
  
  // AuthService Inject Edildiz
  private readonly authService = inject(AuthService); 

  constructor(private complaintService:ComplaintService){}

  ngOnInit(): void {
    if (this.gelenKonum) {
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

  /** @description Yüklenen fotoğrafların base64 listesi. */
  fotograflar = signal<string[]>([]);

  kategoriSec(id: string): void {
    this.reportData.kategori = id;
  }

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

  fotografSil(index: number): void {
    this.fotograflar.update(list => list.filter((_, i) => i !== index));
  }

  /**
   * @description Formu gönderir ve paneli kapatır.
   */
  async gonder() {
    console.log("ADIM 1: Gönder butonuna tıklandı! Fonksiyon çalıştı.");

    try {
      const currentUser = this.authService.currentUser();
      console.log("ADIM 2: Kullanıcı kimliği alındı:", currentUser ? currentUser.uid : "Oturum Yok!");

      if (!currentUser) {
        alert('Şikayet bildirmek için oturum açmalısınız!');
        return;
      }

      if (!this.reportData.aciklama.trim()) {
        alert('Lütfen şikayetiniz için bir açıklama yazın.');
        return;
      }

      console.log("ADIM 3: Veriler Firebase için hazırlanıyor...");
      
      const konumParcalari = this.reportData.konum.split(',');
      const enlem = konumParcalari.length > 1 ? parseFloat(konumParcalari[0].trim()) : 0;
      const boylam = konumParcalari.length > 1 ? parseFloat(konumParcalari[1].trim()) : 0;

      const baslangicDestek = 1;

      const yeniSikayet: Complaint = {
        userId: currentUser.uid,
        title: 'Yeni Bildirim: ' + this.reportData.kategori.toUpperCase(), 
        supportCount: baslangicDestek,
        description: this.reportData.aciklama,
        metaInfo: 'Genel - ' + new Date().toLocaleDateString('tr-TR'),
        status: 'Beklemede', 
        priority: this.complaintService.hesaplaOncelik(baslangicDestek),
        location: this.reportData.konum, // Konum metnini direkt kaydediyoruz
        lat: enlem,
        lng: boylam,
        category: this.reportData.kategori
      };

      console.log("ADIM 4: Hazırlanan Şikayet Paketi:", yeniSikayet);
      console.log("ADIM 5: Firebase'e gönderiliyor... (Lütfen Bekleyin)");

      await this.complaintService.addComplaint(yeniSikayet);

      console.log("ADIM 6: BİNGO! 🚀 Firebase veriyi başarıyla kaydetti!");
      alert('Şikayetiniz başarıyla kaydedildi!');
      this.panelKapat.emit(); 

    } catch (error) {
      console.error('💥 ADIM X: HATA OLUŞTU!', error);
      alert('Kaydedilirken hata oluştu. Konsola bakın.');
    }
  }
}