import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ToggleRowComponent } from '../../components/settings/toggle-row/toggle-row';
import { NavRowComponent } from '../../components/settings/nav-row/nav-row';
import { SettingsSectionComponent } from '../../components/settings/settings-section/settings-section';
import { Baslik } from '../../components/baslik/baslik';

/**
 * @description Kullanıcı tercihlerinin ve uygulama ayarlarının yönetildiği sayfa bileşenidir.
 * Bildirim, konum ve karanlık mod toggle'ları Signal ile yönetilir.
 */
@Component({
  selector: 'app-ayarlar',
  standalone: true,
  imports: [CommonModule, RouterModule, ToggleRowComponent, NavRowComponent, SettingsSectionComponent, Baslik],
  templateUrl: './ayarlar.html',
  styleUrl: './ayarlar.css'
})
export class AyarlarComponent {

  /** @description Bildirim toggle'ının açık/kapalı durumu */
  bildirimAcik = signal(true);

  /** @description Konum toggle'ının açık/kapalı durumu */
  konumAcik = signal(true);

  /** @description Karanlık mod toggle'ının açık/kapalı durumu */
  karanlikMod = signal(false);

  constructor(private router: Router) {}

  /**
   * @description Bildirim toggle'ına tıklandığında durumu tersine çevirir.
   */
  toggleBildirim(): void {
    this.bildirimAcik.set(!this.bildirimAcik());
  }

  /**
   * @description Konum toggle'ına tıklandığında durumu tersine çevirir.
   */
  toggleKonum(): void {
    this.konumAcik.set(!this.konumAcik());
  }

  /**
   * @description Karanlık mod toggle'ına tıklandığında durumu tersine çevirir.
   * Aktif olduğunda body'ye 'karanlik' class'ı ekler, pasif olduğunda kaldırır.
   */
  toggleKaranlikMod(): void {
    this.karanlikMod.set(!this.karanlikMod());
    if (this.karanlikMod()) {
      document.body.classList.add('karanlik');
    } else {
      document.body.classList.remove('karanlik');
    }
  }

  /**
   * @description Ana sayfaya geri yönlendirir.
   */
  geriDon(): void {
    this.router.navigate(['/anasayfa']);
  }

  /**
   * @description Uygulama bölümündeki navigasyon satırlarına tıklandığında
   * ilgili sayfanın bilgilendirme mesajını gösterir.
   * Firebase entegrasyonunda gerçek sayfalara yönlendirilecektir.
   * @param {string} sayfa - Açılacak sayfanın anahtarı (guvenlik/kullanim/hakkinda)
   */
  sayfaAc(sayfa: string): void {
    const mesajlar: Record<string, string> = {
      guvenlik: 'Güvenlik Politikası sayfası yakında eklenecek.',
      kullanim: 'Kullanım Koşulları sayfası yakında eklenecek.',
      hakkinda: 'Şikayet Haritası v1.0.0 - Bingöl Üniversitesi'
    };
    alert(mesajlar[sayfa]);
  }
}