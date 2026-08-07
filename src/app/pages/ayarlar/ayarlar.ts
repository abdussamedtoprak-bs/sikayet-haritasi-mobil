import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ToggleRowComponent } from '../../components/settings/toggle-row/toggle-row';
import { NavRowComponent } from '../../components/settings/nav-row/nav-row';
import { SettingsSectionComponent } from '../../components/settings/settings-section/settings-section';

@Component({
  selector: 'app-ayarlar',
  standalone: true,
  imports: [CommonModule, RouterModule, ToggleRowComponent, NavRowComponent, SettingsSectionComponent],
  templateUrl: './ayarlar.html',
  styleUrl: './ayarlar.css'
})
export class AyarlarComponent {

  bildirimAcik = signal(true);
  konumAcik = signal(true);
  karanlikMod = signal(false);

  constructor(private router: Router) {}

  toggleBildirim(): void {
    this.bildirimAcik.set(!this.bildirimAcik());
  }

  toggleKonum(): void {
    this.konumAcik.set(!this.konumAcik());
  }

  toggleKaranlikMod(): void {
    this.karanlikMod.set(!this.karanlikMod());
    if (this.karanlikMod()) {
      document.body.classList.add('karanlik');
    } else {
      document.body.classList.remove('karanlik');
    }
  }

  geriDon(): void {
    this.router.navigate(['/anasayfa']);
  }

  sayfaAc(sayfa: string): void {
    const mesajlar: Record<string, string> = {
      guvenlik: 'Güvenlik Politikası sayfası yakında eklenecek.',
      kullanim: 'Kullanım Koşulları sayfası yakında eklenecek.',
      hakkinda: 'Şikayet Haritası v1.0.0 - Bingöl Üniversitesi'
    };
    alert(mesajlar[sayfa]);
  }
}