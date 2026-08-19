import { Injectable, signal, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/**
 * @description Uygulamanın görünüm temasını (aydınlık / karanlık) yöneten servistir.
 *
 * Tema tercihi tarayıcıda saklanır, böylece kullanıcı sayfayı yenilediğinde
 * veya uygulamayı tekrar açtığında seçimi korunur.
 *
 * Tema, body etiketine 'karanlik' sınıfı eklenerek uygulanır. Renkler CSS
 * değişkenleri üzerinden tanımlandığı için bu tek sınıf tüm uygulamayı etkiler.
 */
@Injectable({
  providedIn: 'root'
})
export class ThemeService {

  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  /** @description Tema tercihinin tarayıcıda saklandığı anahtar. */
  private static readonly STORAGE_KEY = 'tema-tercihi';

  /** @description Body etiketine eklenen sınıf adı. */
  private static readonly DARK_CLASS = 'karanlik';

  private readonly darkModeSignal = signal<boolean>(false);

  /** @description Karanlık mod açık mı? (salt okunur) */
  readonly isDarkMode = this.darkModeSignal.asReadonly();

  constructor() {
    // Sunucu tarafında (SSR) tarayıcı API'leri kullanılamaz
    if (!this.isBrowser) return;

    const stored = localStorage.getItem(ThemeService.STORAGE_KEY);

    if (stored !== null) {
      this.darkModeSignal.set(stored === 'karanlik');
    }

    this.applyTheme();
  }

  /**
   * @description Temayı aydınlık ve karanlık arasında değiştirir.
   */
  toggle(): void {
    this.setDarkMode(!this.darkModeSignal());
  }

  /**
   * @description Temayı doğrudan belirtilen değere ayarlar.
   * @param {boolean} isDark - true ise karanlık, false ise aydınlık tema
   */
  setDarkMode(isDark: boolean): void {
    this.darkModeSignal.set(isDark);

    if (!this.isBrowser) return;

    localStorage.setItem(
      ThemeService.STORAGE_KEY,
      isDark ? 'karanlik' : 'aydinlik'
    );

    this.applyTheme();
  }

  /**
   * @description Mevcut tema durumunu body etiketine yansıtır.
   */
  private applyTheme(): void {
    if (!this.isBrowser) return;

    const body = document.body;

    if (this.darkModeSignal()) {
      body.classList.add(ThemeService.DARK_CLASS);
    } else {
      body.classList.remove(ThemeService.DARK_CLASS);
    }
  }
}