import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ThemeService } from './services/theme.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('sikayet-haritasi');

  /**
   * @description Tema servisi burada çağrılır ki uygulama açılır açılmaz oluşsun.
   *
   * Angular servisleri ilk kullanıldıkları anda oluşturulur. Servis yalnızca
   * Ayarlar sayfasında kullanılsaydı, kayıtlı tema ancak o sayfaya girildiğinde
   * uygulanır; sayfa yenilendiğinde uygulama aydınlık açılırdı.
   */
  private readonly themeService = inject(ThemeService);
}