import { Component, Output, EventEmitter, NgZone } from '@angular/core'; // NgZone eklendi

@Component({
  selector: 'app-konum-butonu',
  standalone: true,
  imports: [],
  templateUrl: './konum-butonu.html',
  styleUrl: './konum-butonu.css'
})
export class KonumButonu {
  
  @Output() konumAlindi = new EventEmitter<{lat: number, lng: number} | null>();

  // Angular'ın değişim algılayıcısını (Zone) kurucu metoda (constructor) ekliyoruz
  constructor(private zone: NgZone) {}

  butonaBas() {
    console.log('1. ADIM: Butona tıklandı (konum-butonu.ts)');

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // Angular'ı zorla uyandırıyoruz (zone.run)
          this.zone.run(() => {
            console.log('Konum bulundu! Haritaya fırlatılıyor...');
            this.konumAlindi.emit({ 
              lat: position.coords.latitude, 
              lng: position.coords.longitude 
            });
          });
        },
        (error) => {
          this.zone.run(() => {
            console.warn('Konum izni reddedildi, null fırlatılıyor...');
            this.konumAlindi.emit(null);
          });
        }
      );
    } else {
      this.konumAlindi.emit(null);
    }
  }
}