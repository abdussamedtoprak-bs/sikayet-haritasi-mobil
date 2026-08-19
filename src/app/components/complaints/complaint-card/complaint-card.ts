import { Component ,Input,OnInit} from '@angular/core';
import { Complaint } from '../../../models/complaint';
import { ComplaintService } from '../../../services/complaint';

@Component({
  selector: 'app-complaint-card',
  imports: [],
  templateUrl: './complaint-card.html',
  styleUrl: './complaint-card.css',
})

/**
 * @description Tek bir şikayet kaydının (başlık, açıklama, destek sayısı, tarih, durum ve öncelik) 
 * detaylarını ekranda kullanıcı dostu bir kart tasarımıyla (UI Card) göstermek için kullanılan bileşendir.
 * Öncelik ve durum bilgilerine göre dinamik CSS sınıfları uygulayarak renk kodlaması yapar.
 */
export class ComplaintCard implements OnInit {
  /**
   * @description Üst bileşenden (liste veya kapsayıcı) gelen tekil şikayet nesnesidir. 
   * Kartın içerisindeki tüm dinamik veriler ve renk (durum/öncelik) atamaları bu nesne üzerinden beslenir.
   * @type {Complaint}
   */
  @Input() complaint!: Complaint;
  currentUserRole: any = 'admin'; // null yerine doğrudan 'admin' yazıyoruz
  //  Modal görünürlüğü ve seçilen yeni durumu tutmak için
  showConfirmModal: boolean = false;
  pendingStatus: string = '';
  constructor(
    private complaintService: ComplaintService
  ){}
  ngOnInit(): void{
    // this.currentUserRole = this.authService.role();
  }
  durumGuncelle(yeniDurum: string, event: Event) {
    event.stopPropagation();
    event.stopImmediatePropagation();
    this.pendingStatus = yeniDurum; // Hangi duruma geçilmek istendiğini hafızaya al
    this.showConfirmModal = true;   // Uyarı kutusunu (modal) ekranda göster
  }
  // 2. Modaldaki "Kaydet" butonuna basılırsa çalışacak fonksiyon
// Fonksiyonu async yapıyoruz çünkü veritabanı işleminin bitmesini bekleyeceğiz
async onaylaGuncelleme(event: Event) {
  event.stopPropagation();
  event.stopImmediatePropagation();
  if (this.complaint.id && this.pendingStatus) {
    try {
      // 1. Firebase'deki asıl veriyi güncelliyoruz (BİLDİRİM BURADA TETİKLENECEK!)
      await this.complaintService.updateStatus(this.complaint.id, this.pendingStatus); 
      // 2. Ekranda anında değişmesi için lokal veriyi de güncelliyoruz
      this.complaint.status = this.pendingStatus; 
      console.log(`Şikayet durumu Firebase'de güncellendi: ${this.pendingStatus}`); 
      // 3. Modalı kapat
      this.showConfirmModal = false; 
    } catch (error) {
      console.error("Durum güncellenirken Firebase hatası:", error);
    }
  }
}
  // 3. Modaldaki "İptal" butonuna basılırsa çalışacak fonksiyon
  iptalGuncelleme(event: Event) {
    event.stopPropagation();
    event.stopImmediatePropagation();
    this.showConfirmModal = false; // İşlem yapmadan sadece modalı kapat
  }
}
