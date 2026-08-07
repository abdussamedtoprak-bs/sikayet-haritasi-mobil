import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

interface SSSItem {
  id: number;
  soru: string;
  cevap: string;
  acik: boolean;
}

@Component({
  selector: 'app-destek',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './destek.html',
  styleUrl: './destek.css'
})
export class DestekComponent {

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
      cevap: 'Şikayetiniz ilgili birime iletildikten sonra en geç 7 iş günü içinde değerlendirilir. Durum güncellemelerini bildirimler sayfasından takip edebilirsiniz.',
      acik: false
    },
    {
      id: 3,
      soru: 'Şikayetimi nasıl takip ederim?',
      cevap: 'Ana sayfadaki haritada şikayetinizin durumunu renkli pinler üzerinden görebilirsiniz. Ayrıca bildirimler sayfasından anlık güncellemeleri takip edebilirsiniz.',
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

  toggleSSS(id: number): void {
    this.sssList.update(liste =>
      liste.map(item =>
        item.id === id ? { ...item, acik: !item.acik } : item
      )
    );
  }

  geriDon(): void {
    this.router.navigate(['/anasayfa']);
  }
}