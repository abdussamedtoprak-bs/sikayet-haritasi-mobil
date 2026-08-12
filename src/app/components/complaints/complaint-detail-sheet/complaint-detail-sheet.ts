import { Component,Input,Output,EventEmitter} from '@angular/core';
import { CommonModule } from '@angular/common';

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
export class ComplaintDetailSheet {

  /**
   * @description Detayları gösterilecek olan aktif şikayet nesnesidir. 
   * Üst bileşen tarafından (kullanıcının tıkladığı şikayet verisi) buraya aktarılır.
   * @type {any} // (Not: Modeller oluşturulduğunda 'Complaint' interface'i ile güncellenecektir.)
   */
  @Input() complaint: any;

  /**
   * @description Kullanıcı paneli kapatmak istediğinde (çarpı butonuna basıldığında) 
   * ana bileşene paneli gizlemesi için sinyal gönderir.
   * @event close
   * @type {EventEmitter<void>}
   */
  @Output() close=new EventEmitter<void>();

  /**
   * @description Sağ ok (ileri) tuşuna basıldığında tetiklenir ve 
   * listedeki bir sonraki şikayetin verisini getirmesi için üst bileşene haber verir.
   * @event next
   * @type {EventEmitter<void>}
   */
  @Output() next = new EventEmitter<void>(); 

  /**
   * @description Sol ok (geri) tuşuna basıldığında tetiklenir ve 
   * listedeki bir önceki şikayetin verisini getirmesi için üst bileşene haber verir.
   * @event prev
   * @type {EventEmitter<void>}
   */
  @Output() prev = new EventEmitter<void>();  

  
  
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
  closeSheet(){
    this.close.emit(); // ana sayfaya "kapat" sinyali gönderir  
  }
}
