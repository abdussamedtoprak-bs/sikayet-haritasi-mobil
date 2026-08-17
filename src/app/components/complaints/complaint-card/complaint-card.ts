import { Component ,Input,OnInit} from '@angular/core';
import { Complaint } from '../../../models/complaint';

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
  onaylaGuncelleme(event: Event) {
    event.stopPropagation();
    event.stopImmediatePropagation();

    this.complaint.status = this.pendingStatus; // Hafızadaki durumu kalıcı olarak uygula
    console.log(`Şikayet durumu güncellendi: ${this.pendingStatus}`);
    
    this.showConfirmModal = false; // Modalı kapat
  }

  // 3. Modaldaki "İptal" butonuna basılırsa çalışacak fonksiyon
  iptalGuncelleme(event: Event) {
    event.stopPropagation();
    event.stopImmediatePropagation();

    this.showConfirmModal = false; // İşlem yapmadan sadece modalı kapat
  }
}
