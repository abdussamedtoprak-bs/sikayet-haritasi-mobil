import { Component, Output, EventEmitter, signal } from '@angular/core';

/**
 * @description Konum alınamama sebepleri.
 * Her sebep kullanıcıya farklı bir yönlendirme gerektirdiği için ayrı tutulur.
 */
export type KonumHataSebebi =
  | 'desteklenmiyor'
  | 'izin-yok'
  | 'bulunamadi'
  | 'zaman-asimi';

/**
 * @description Konum alma denemesinin sonucu.
 * Başarılıysa koordinatı, başarısızsa sebebini taşır.
 */
export type KonumSonucu =
  | { basarili: true; lat: number; lng: number }
  | { basarili: false; sebep: KonumHataSebebi };

@Component({
  selector: 'app-konum-butonu',
  standalone: true,
  imports: [],
  templateUrl: './konum-butonu.html',
  styleUrl: './konum-butonu.css'
})
/**
 * @description Kullanıcının cihaz konumunu isteyen butondur.
 *
 * Sonucu her durumda üst bileşene bildirir. Konum alınamadığında sessiz
 * kalmaz; sebebi ayrıştırarak iletir, çünkü izin reddi ile sinyal
 * bulunamaması kullanıcıya farklı şeyler söylemeyi gerektirir.
 */
export class KonumButonu {

  /** @description Konum alma denemesinin sonucunu üst bileşene iletir. */
  @Output() konumSonucu = new EventEmitter<KonumSonucu>();

  /**
   * @description Konum alınıyor mu?
   * Butonun tekrar tekrar basılmasını engeller ve kullanıcıya bekleme gösterir.
   */
  readonly aliniyor = signal<boolean>(false);

  /**
   * @description Konum isteği ayarları.
   *
   * timeout verilmezse tarayıcının varsayılanı sonsuzdur; kapalı ortamda
   * buton hiç cevap vermez ve kullanıcı uygulamanın donduğunu sanır.
   * maximumAge sayesinde son bir dakikada alınmış konum yeniden ölçülmeden
   * kullanılır, bu hem hızlıdır hem pil tüketimini azaltır.
   */
  private static readonly SECENEKLER: PositionOptions = {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 60000
  };

  /**
   * @description Butona basıldığında cihaz konumunu ister.
   */
  butonaBas(): void {
    if (this.aliniyor()) return;

    if (!navigator.geolocation) {
      this.konumSonucu.emit({ basarili: false, sebep: 'desteklenmiyor' });
      return;
    }

    this.aliniyor.set(true);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.aliniyor.set(false);

        this.konumSonucu.emit({
          basarili: true,
          lat: position.coords.latitude,
          lng: position.coords.longitude
        });
      },
      (error) => {
        this.aliniyor.set(false);

        this.konumSonucu.emit({
          basarili: false,
          sebep: this.hataSebebi(error)
        });
      },
      KonumButonu.SECENEKLER
    );
  }

  /**
   * @description Tarayıcının döndürdüğü hata kodunu anlamlı bir sebebe çevirir.
   *
   * @param {GeolocationPositionError} error - Tarayıcı hatası
   * @returns {KonumHataSebebi} Kullanıcıya anlatılabilir sebep
   */
  private hataSebebi(error: GeolocationPositionError): KonumHataSebebi {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        return 'izin-yok';
      case error.POSITION_UNAVAILABLE:
        return 'bulunamadi';
      case error.TIMEOUT:
        return 'zaman-asimi';
      default:
        return 'bulunamadi';
    }
  }
}