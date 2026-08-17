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

  /**
   * @description Kullanıcı oturumunu sonlandırır ve giriş sayfasına yönlendirir.
   */
  async logout(): Promise<void> {
    await this.authService.logout();
    this.router.navigate(['/login']);
  }
}