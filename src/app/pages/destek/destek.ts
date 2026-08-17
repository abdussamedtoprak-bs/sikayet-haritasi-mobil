import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FaqItemComponent } from '../../components/notifications/faq-item/faq-item';
import { SSSItem } from '../../models/sss-item';
import { Baslik } from '../../components/baslik/baslik';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-destek',
  standalone: true,
  imports: [CommonModule, RouterModule, FaqItemComponent, Baslik],
  templateUrl: './destek.html',
  styleUrl: './destek.css'
})
export class DestekComponent implements OnInit {

  isAdmin: boolean = false;

  // Öğrenciler için SSS listesi (Fatma'nın mevcut listesi)
  private ogrenciSSS: SSSItem[] = [
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
  ];

  // Yöneticiler için Yönetici Kılavuzu listesi
  private yoneticiSSS: SSSItem[] = [
    {
      id: 1,
      soru: 'Şikayet durumu nasıl değiştirilir?',
      cevap: 'Güncel Şikayetler sayfasındaki şikayet kartlarının altında yer alan "Beklemede", "İnceleniyor" veya "Çözüldü" butonlarına basarak durumu güncelleyebilirsiniz.',
      acik: true
    },
    {
      id: 2,
      soru: 'Öncelik renkleri ne anlama gelir?',
      cevap: 'Kırmızı: Acil/Kritik müdahale gerektiren, Mavi: Orta seviye, Sarı: Düşük öncelikli şikayetleri ifade eder. Destek sayısı arttıkça öncelik seviyesi otomatik olarak yükselebilir.',
      acik: false
    },
    {
      id: 3,
      soru: 'Arşivlenen şikayetler nereye gider?',
      cevap: 'Çözülen veya arşive alınan şikayetler veritabanında saklanmaya devam eder ancak harita ve aktif liste üzerinde kalabalık oluşturmaması için filtrelenir.',
      acik: false
    },
    {
      id: 4,
      soru: 'Öğrenci kimliklerini neden göremiyorum?',
      cevap: 'Sistem KVKK ve gizlilik standartları gereği öğrencilerin şikayet bildirimlerini anonim olarak yöneticilere iletir.',
      acik: false
    }
  ];

  // Ekranda gösterilecek aktif sinyal listesi
  sssList = signal<SSSItem[]>([]);

  constructor(
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {

    // HTML'de kullanabilmek için rolü değişkene atıyoruz
    this.isAdmin = this.authService.isAdmin();
    // Kullanıcı yönetici ise yönetici kılavuzunu, öğrenci ise öğrenci SSS listesini yükle
    if (this.authService.isAdmin()) {
      this.sssList.set(this.yoneticiSSS);
    } else {
      this.sssList.set(this.ogrenciSSS);
    }
  }

  toggleSSS(id: number): void {
    this.sssList.update(liste =>
      liste.map(item =>
        item.id === id ? { ...item, acik: !item.acik } : item
      )
    );
  }

  geridon(): void {
    this.router.navigate(['/anasayfa']);
  }
}