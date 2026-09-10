import { Component, ChangeDetectorRef, OnInit, ViewChild } from '@angular/core';
import { Baslik } from '../../components/baslik/baslik';
import { KonumButonu, KonumSonucu, KonumHataSebebi } from '../../components/ana-sayfa/konum-butonu/konum-butonu';
import { SorunBildirmePaneli } from '../../components/ana-sayfa/sorun-bildir-paneli/sorun-bildir-paneli';
import { HaritaAlani } from '../../components/ana-sayfa/harita-alani/harita-alani';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-ana-sayfa',
  standalone: true,
  imports: [
    Baslik,
    HaritaAlani,
    KonumButonu,
    SorunBildirmePaneli,
  ],
  templateUrl: './ana-sayfa.html',
  styleUrl: './ana-sayfa.css',
})
/**
 * @description Haritanın ve şikayet bildirme akışının yönetildiği ana sayfadır.
 *
 * Konum, şikayet bildirmek için bir kolaylıktır; zorunluluk değildir.
 * Cihaz konumu alınamadığında kullanıcı haritadan elle nokta seçerek
 * şikayetini bildirebilir.
 */
export class AnaSayfa implements OnInit {

  panelAcik = false;

  /** @description Şikayetin bildirileceği nokta. Panel bu bilgi olmadan açılmaz. */
  secilenKonum: { lat: number; lng: number } | null = null;

  currentUserRole: any = null;

  /** @description Konum alınamadığında gösterilen bilgilendirme metni. */
  konumUyarisi: string | null = null;

  /** @description Harita bileşenine erişim (uçuş, işaretleme, sınır kontrolü için). */
  @ViewChild('haritaBileseni') haritaBileseni!: HaritaAlani;

  constructor(
    private cdr: ChangeDetectorRef,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.currentUserRole = this.authService.role();
  }

  /**
   * @description Konum butonundan gelen sonucu değerlendirir.
   *
   * Başarılıysa harita o noktaya uçar ve şikayet paneli açılır.
   * Başarısızsa sebebe uygun bir mesaj gösterilir; panel açılmaz.
   * Panelin konumsuz açılması, koordinatı 0,0 olan geçersiz şikayetlere
   * yol açtığı için engellenmiştir.
   *
   * @param {KonumSonucu} sonuc - Konum butonunun sonucu
   */
  konumSonucuGeldi(sonuc: KonumSonucu): void {
    if (!sonuc.basarili) {
      this.uyariGoster(this.uyariMetni(sonuc.sebep));
      return;
    }

    if (!this.haritaBileseni.kampusIcindeMi(sonuc.lat, sonuc.lng)) {
      this.uyariGoster(
        'Kampüs dışında görünüyorsunuz. Şikayet bildirmek için haritadan bir nokta seçin.'
      );
      return;
    }

    this.konumUyarisi = null;
    this.secilenKonum = { lat: sonuc.lat, lng: sonuc.lng };

    this.haritaBileseni.onKonumGeldi(this.secilenKonum);

    // Harita uçuşu bitsin, panel sonra açılsın
    this.paneliAc(1000);
  }

  /**
   * @description Haritadan elle seçilen noktayı alır ve paneli açar.
   *
   * @param {{lat: number, lng: number}} konum - Tıklanan nokta
   */
  haritadanKonumSecildi(konum: { lat: number; lng: number }): void {
    if (!this.haritaBileseni.kampusIcindeMi(konum.lat, konum.lng)) {
      this.uyariGoster('Seçtiğiniz nokta kampüs sınırlarının dışında.');
      return;
    }

    this.konumUyarisi = null;
    this.secilenKonum = konum;

    this.paneliAc();
  }

  /**
   * @description Hata sebebine uygun, kullanıcıya yol gösteren metni üretir.
   *
   * @param {KonumHataSebebi} sebep - Konum alınamama sebebi
   * @returns {string} Ekranda gösterilecek metin
   */
  private uyariMetni(sebep: KonumHataSebebi): string {
    switch (sebep) {
      case 'izin-yok':
        return 'Konum izni verilmedi. Tarayıcı ayarlarından izin verebilir veya haritadan bir nokta seçebilirsiniz.';
      case 'bulunamadi':
        return 'Konumunuz bulunamadı. Bina içindeyseniz dışarı çıkın veya haritadan bir nokta seçin.';
      case 'zaman-asimi':
        return 'Konum alınamadı. Tekrar deneyebilir veya haritadan bir nokta seçebilirsiniz.';
      case 'desteklenmiyor':
        return 'Cihazınız konum servisini desteklemiyor. Haritadan bir nokta seçebilirsiniz.';
    }
  }

  /**
   * @description Bilgilendirme şeridini gösterir.
   * @param {string} metin - Gösterilecek mesaj
   */
  private uyariGoster(metin: string): void {
    this.konumUyarisi = metin;
    this.cdr.detectChanges();
  }

  /** @description Bilgilendirme şeridini kapatır. */
  uyariyiKapat(): void {
    this.konumUyarisi = null;
  }

  /**
   * @description Şikayet panelini açar.
   *
   * @param {number} gecikmeMs - Harita uçuşunun bitmesi için beklenecek süre
   */
  paneliAc(gecikmeMs: number = 0): void {
    if (gecikmeMs === 0) {
      this.panelAcik = true;
      this.cdr.detectChanges();
      return;
    }

    setTimeout(() => {
      this.panelAcik = true;
      this.cdr.detectChanges();
    }, gecikmeMs);
  }

  /**
   * @description Şikayet panelini kapatır ve haritadaki seçim işaretini siler.
   * Yan menü açıldığında da çağrılır, ikisi aynı anda görünmesin.
   */
  paneliKapat(): void {
    this.panelAcik = false;
    this.secilenKonum = null;
    this.haritaBileseni?.secimiTemizle();
  }
}