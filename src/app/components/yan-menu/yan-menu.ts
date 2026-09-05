import { Component, Input, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

/**
 * @description Uygulamanın yan navigasyon menüsüdür.
 *
 * Menü öğeleri kullanıcının rolüne göre şekillenir:
 * - Yönetici → "Güncel Şikayetler" (tüm şikayetlerin yönetimi)
 * - Öğrenci  → "Şikayetlerim" (yalnızca kendi şikayetleri)
 *
 * NOT: Menüde bir öğenin gizlenmesi güvenlik sağlamaz, yalnızca kullanıcı
 * deneyimi içindir. Sayfa erişimi roleGuard ile, veri erişimi ise
 * Firestore Security Rules ile korunmaktadır.
 */
@Component({
  selector: 'app-yan-menu',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './yan-menu.html',
  styleUrl: './yan-menu.css'
})
export class YanMenu {

  /** @description Menünün açık/kapalı durumu. Üst bileşen tarafından yönetilir. */
  @Input() menuAcik: boolean = false;

  /**
   * @description Şablonda rol kontrolü yapılabilmesi için public tanımlanmıştır.
   * Signal olarak okunduğu için rol değiştiğinde menü kendiliğinden güncellenir.
   */
  readonly authService = inject(AuthService);

    private readonly router = inject(Router);

  /** @description Çıkış onay penceresi açık mı? */
  cikisOnayiAcik: boolean = false;

  /**
   * @description Çıkış işlemi sürüyor mu?
   * Butona arka arkaya basılmasını ve mükerrer isteği önler.
   */
  cikisYapiliyor: boolean = false;

  /**
   * @description Çıkış onay penceresini açar.
   *
   * Oturumu kapatmak geri alınamayan bir işlemdir; yanlışlıkla dokunan
   * kullanıcının doğrudan atılmaması için önce onay istenir.
   */
  cikisiSor(): void {
    this.cikisOnayiAcik = true;
  }

  /**
   * @description Onay penceresini kapatır, oturum açık kalır.
   */
  cikisiIptalEt(): void {
    this.cikisOnayiAcik = false;
  }

  /**
   * @description Kullanıcı onay verdikten sonra oturumu sonlandırır ve
   * giriş sayfasına yönlendirir.
   *
   * Çıkış başarısız olursa kullanıcı bilgilendirilir ve sayfada kalır.
   * Sessizce başarısız olan bir çıkış butonu, kullanıcının çıktığını
   * sanmasına yol açar.
   */
  async logout(): Promise<void> {
    if (this.cikisYapiliyor) return;

    this.cikisYapiliyor = true;

    try {
      await this.authService.logout();

      this.cikisOnayiAcik = false;

      await this.router.navigate(['/login']);
    } catch (error) {
      console.error('Çıkış yapılamadı:', error);
      alert('Çıkış yapılamadı. Lütfen tekrar deneyin.');
    } finally {
      this.cikisYapiliyor = false;
    }
  }
}