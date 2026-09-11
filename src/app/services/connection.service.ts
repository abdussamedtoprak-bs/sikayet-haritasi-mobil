import { Injectable, signal, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

/**
 * @description Cihazın internet bağlantısını izleyen ve uzun süren
 * işlemleri süre sınırıyla çalıştıran servistir.
 *
 * Firestore'un yazma işlemleri sunucu onayı bekler; bağlantı yoksa
 * ne çözülür ne hata verir, sonsuza kadar askıda kalır. Bu servis
 * o durumu iki şekilde karşılar: bağlantının kesildiğini önceden
 * bildirir ve askıda kalan işlemleri belli bir süre sonra keser.
 */
@Injectable({
  providedIn: 'root'
})
export class ConnectionService {

  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  /** @description Yazma işlemleri için varsayılan süre sınırı (saniye). */
  private static readonly VARSAYILAN_SURE = 15;

  private readonly cevrimdisiSignal = signal<boolean>(false);

  /** @description Cihaz çevrimdışı mı? (salt okunur) */
  readonly cevrimdisi = this.cevrimdisiSignal.asReadonly();

  constructor() {
    // Sunucu tarafında (SSR) tarayıcı API'leri kullanılamaz
    if (!this.isBrowser) return;

    this.cevrimdisiSignal.set(!navigator.onLine);

    window.addEventListener('online', () => this.cevrimdisiSignal.set(false));
    window.addEventListener('offline', () => this.cevrimdisiSignal.set(true));
  }

  /**
   * @description Bir işlemi süre sınırıyla çalıştırır.
   * Süre dolarsa 'ZAMAN_ASIMI' mesajlı bir hata fırlatır.
   *
   * Bu kontrol `navigator.onLine` değerine güvenmez. Cihaz bir ağa bağlı
   * olduğu halde internet çalışmıyor olabilir (modem çökmesi, otel wifi
   * giriş sayfası gibi). O durumda tarayıcı "çevrimiçiyim" der ama işlem
   * yine askıda kalır; asıl güvence bu süre sınırıdır.
   *
   * NOT: Süre dolduğunda işlem iptal edilmez, yalnızca beklenmesi
   * bırakılır. Firestore yazmayı bellekte tutmaya devam eder ve bağlantı
   * gelince gönderebilir. Bu yüzden tekrar denenen kayıtlarda sabit belge
   * kimliği kullanılır; aksi halde iki kayıt oluşurdu.
   *
   * @param {Promise<T>} islem - Beklenecek işlem
   * @param {number} saniye - Süre sınırı, varsayılan 15 saniye
   * @returns {Promise<T>} İşlemin sonucu
   */
  async zamanAsimiIle<T>(
    islem: Promise<T>,
    saniye: number = ConnectionService.VARSAYILAN_SURE
  ): Promise<T> {
    let zamanlayici: any;

    const zamanAsimi = new Promise<never>((_, reddet) => {
      zamanlayici = setTimeout(
        () => reddet(new Error('ZAMAN_ASIMI')),
        saniye * 1000
      );
    });

    try {
      return await Promise.race([islem, zamanAsimi]);
    } finally {
      clearTimeout(zamanlayici);
    }
  }

  /**
   * @description Hatanın süre aşımından mı kaynaklandığını söyler.
   *
   * @param {unknown} hata - Yakalanan hata
   * @returns {boolean} Süre aşımıysa true
   */
  zamanAsimiMi(hata: unknown): boolean {
    return hata instanceof Error && hata.message === 'ZAMAN_ASIMI';
  }
}