import { AfterViewInit, Component, Inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-harita-alani',
  standalone: true,
  imports: [],
  templateUrl: './harita-alani.html',
  styleUrl: './harita-alani.css'
})
export class HaritaAlani implements AfterViewInit {

  private map: any;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  async ngAfterViewInit(): Promise<void> {
    // Sadece tarayıcı ortamında çalışmasını sağlıyoruz (SSR hatasını önler)
    if (isPlatformBrowser(this.platformId)) {
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
        maxZoom: 21,
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
        attribution: '© Google Maps'
      }).addTo(this.map);
    }
  }
}