import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * @description Ayarlar sayfasındaki bölüm başlıklarını temsil eden
 * yeniden kullanılabilir sunum bileşenidir.
 * "TERCİHLER" ve "UYGULAMA" gibi bölüm ayırıcıları bu bileşen ile gösterilir.
 */
@Component({
  selector: 'app-settings-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './settings-section.html',
  styleUrl: './settings-section.css'
})
export class SettingsSectionComponent {

  /** @description Bölüm başlığı metni (örn: "TERCİHLER", "UYGULAMA") */
  @Input() baslik: string = '';
}