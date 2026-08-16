import { Component, Input, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

/**
 * @description Uygulamanın yan navigasyon menüsüdür.
 * Sayfalar arası geçiş bağlantılarını ve oturum kapatma işlemini barındırır.
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

  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  /**
   * @description Kullanıcı oturumunu sonlandırır ve giriş sayfasına yönlendirir.
   */
  async logout(): Promise<void> {
    await this.authService.logout();
    this.router.navigate(['/login']);
  }
}