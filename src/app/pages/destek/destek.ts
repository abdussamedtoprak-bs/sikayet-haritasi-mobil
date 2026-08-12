import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FaqItemComponent } from '../../components/notifications/faq-item/faq-item';
import { SSSItem } from '../../models/sss-item';
import { Baslik } from '../../components/baslik/baslik';

/**
 * @description Kullanıcıların destek alabildiği sayfa bileşenidir.
 * İletişim bilgileri ve sıkça sorulan sorular (SSS) accordion yapısında sunulur.
 */
@Component({
  selector: 'app-destek',
  standalone: true,
  imports: [CommonModule, RouterModule, FaqItemComponent, Baslik],
  templateUrl: './destek.html',
  styleUrl: './destek.css'
})
export class DestekComponent {

  /**
   * @description Firebase entegrasyonuna kadar kullanılan geçici SSS listesi.
   * Firebase gelince bu liste Firestore'dan asenkron olarak çekilecektir.
   */
  sssList = signal<SSSItem[]>([
    {
      id: 1,
      soru: 'Nasıl şikayet bildirebilirim?',
      cevap: 'Haritada şikayet bildirmek istediğiniz konuma uzun basın veya "Konumumu Kullan" butonuna tıklayarak mevcut konumunuzu seçin.',
      acik: true
    },
    {
      id: 2,
      soru: 'Şikayetim ne zaman çözülür?',
      cevap: 'Şikayetiniz ilgili birime iletildikten sonra en geç 7 iş günü içinde değerlendirilir.',
      acik: false
    },
    {
      id: 3,
      soru: 'Şikayetimi nasıl takip ederim?',
      cevap: 'Ana sayfadaki haritada şikayetinizin durumunu renkli pinler üzerinden görebilirsiniz.',
      acik: false
    },
    {
      id: 4,
      soru: 'Kimler şikayet bildirebilir?',
      cevap: 'Bingöl Üniversitesi öğrenci ve personeli @bingol.edu.tr uzantılı e-posta adresiyle kayıt olarak şikayet bildirebilir.',
      acik: false
    }
  ]);

  constructor(private router: Router) {}

  /**
   * @description SSS accordion öğesine tıklandığında açık/kapalı durumunu tersine çevirir.
   * @param {number} id - Durumu değiştirilecek SSS öğesinin id'si
   */
  toggleSSS(id: number): void {
    this.sssList.update(liste =>
      liste.map(item =>
        item.id === id ? { ...item, acik: !item.acik } : item
      )
    );
  }

  /**
   * @description Ana sayfaya geri yönlendirir.
   */
  geriDon(): void {
    this.router.navigate(['/anasayfa']);
  }
}