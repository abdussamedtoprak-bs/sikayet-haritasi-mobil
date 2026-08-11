import { AfterViewInit, Component } from '@angular/core';

@Component({
  selector: 'app-harita-alani',
  standalone: true,
  imports: [],
  templateUrl: './harita-alani.html',
  styleUrl: './harita-alani.css'
})
export class HaritaAlani implements AfterViewInit {

  private map: any;

  async ngAfterViewInit(): Promise<void> {

    const L = await import('leaflet');

    this.map = L.map('map', {
      minZoom: 15,
      maxZoom: 19,
      zoomControl: true
    }).setView(
      [38.8847, 40.4939],
      19
    );

 L.tileLayer('http://{s}.google.com/vt/lyrs=y&x={x}&y={y}&z={z}', {
    maxZoom: 21, // Yakınlaştırma sınırını 21'e kadar çıkarıyoruz (Çok daha detaylı)
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    attribution: '© Google Maps'
}).addTo(this.map); // 'this.map'
  }
}