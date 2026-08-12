import { Component ,Input} from '@angular/core';
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
export class ComplaintCard {
  
  /**
   * @description Üst bileşenden (liste veya kapsayıcı) gelen tekil şikayet nesnesidir. 
   * Kartın içerisindeki tüm dinamik veriler ve renk (durum/öncelik) atamaları bu nesne üzerinden beslenir.
   * @type {Complaint}
   */
  @Input() complaint!: Complaint;
}
