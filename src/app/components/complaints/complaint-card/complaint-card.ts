import { Component ,Input,OnInit} from '@angular/core';
import { Complaint } from '../../../models/complaint';
import { AuthService } from '../../../services/auth.service';

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

  // 1. Rolü tutacağımız değişkeni ekliyoruz
  currentUserRole: any = null;

  // 2. AuthService'i constructor ile içeri alıyoruz
  constructor(private authService: AuthService) {}

  // 3. Kart ekrana çizilirken rolü servisten okuyoruz
  ngOnInit(): void {
    this.currentUserRole = this.authService.role();
  }
  
  // Yönetici butonlara tıkladığında çalışacak fonksiyon
  durumGuncelle(yeniDurum: string) {
    // Şimdilik sadece ekrandaki (arayüzdeki) durumu anlık değiştirelim.
    // Bir sonraki adımda bunu Firebase veritabanına kalıcı olarak yazacağız!
    this.complaint.status = yeniDurum;
    console.log(`Şikayet durumu güncellendi: ${yeniDurum}`);
  }

}
