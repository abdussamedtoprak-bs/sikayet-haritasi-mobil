import { AfterViewInit, Component, Inject, Input, Output, EventEmitter, PLATFORM_ID, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../../services/auth.service';
import { ComplaintService } from '../../../services/complaint';
import { Complaint } from '../../../models/complaint';

@Component({
  selector: 'app-harita-alani',
  standalone: true,
  imports: [],
  templateUrl: './harita-alani.html',
  styleUrl: './harita-alani.css'
})
export class HaritaAlani implements OnInit, AfterViewInit,OnDestroy{
    private map: any;

  /** @description Leaflet kütüphanesi. Dinamik yüklendiği için saklanır. */
  private leaflet: any;

  /** @description Şikayet pinlerini besleyen canlı akışın aboneliği. */
  private complaintsSubscription?: Subscription;

  /** @description Kullanıcının haritadan seçtiği noktayı gösteren işaretçi. */
  private secimIsaretcisi: any = null;

  currentUserRole: any = null;

  /**
   * @description Haritaya tıklayarak konum seçilebilsin mi?
   *
   * Yalnızca ana sayfada açıktır. Yönetici sayfasındaki harita salt
   * görüntüleme amaçlıdır, orada tıklama bir şey yapmaz.
   */
  @Input() konumSecmeAktif: boolean = false;

  /** @description Kullanıcı haritada bir noktaya tıkladığında yayınlanır. */
  @Output() konumSecildi = new EventEmitter<{ lat: number; lng: number }>();

  /**
   * @description Kampüsün coğrafi sınırları.
   *
   * Hem haritanın gezinme alanını hem de seçilen konumun geçerliliğini
   * belirler. Tek yerde tanımlanır ki iki kontrol birbirinden ayrılmasın.
   */
  private static readonly KAMPUS_SINIRLARI = {
    minLat: 38.8920,
    minLng: 40.4750,
    maxLat: 38.9080,
    maxLng: 40.5000
  };

  /**
   * @description Verilen koordinatın kampüs sınırları içinde olup olmadığını söyler.
   *
   * @param {number} lat - Enlem
   * @param {number} lng - Boylam
   * @returns {boolean} Kampüs içindeyse true
   */
  kampusIcindeMi(lat: number, lng: number): boolean {
    const sinir = HaritaAlani.KAMPUS_SINIRLARI;

    return lat >= sinir.minLat && lat <= sinir.maxLat
        && lng >= sinir.minLng && lng <= sinir.maxLng;
  }

  /**
   * @description Cihazdan alınan konuma uçar ve orayı işaretler.
   *
   * @param {{lat: number, lng: number} | null} koordinat - Gidilecek nokta
   */
  onKonumGeldi(koordinat: { lat: number, lng: number } | null): void {
    if (!koordinat || !this.map) return;

    this.map.flyTo([koordinat.lat, koordinat.lng], 18, { animate: true, duration: 1.5 });
    this.konumIsaretle(koordinat.lat, koordinat.lng);
  }

  /**
   * @description Seçilen konumu haritada geçici bir işaretçi ile gösterir.
   * Yeni bir nokta seçilince önceki işaretçi kaldırılır.
   *
   * @param {number} lat - Enlem
   * @param {number} lng - Boylam
   */
  private konumIsaretle(lat: number, lng: number): void {
    if (!this.map || !this.leaflet) return;

    this.secimiTemizle();

    const isaret = this.leaflet.divIcon({
      className: 'secim-isaretcisi',
      html: `<div style="
        width: 20px;
        height: 20px;
        background-color: #1a73e8;
        border: 3px solid #ffffff;
        border-radius: 50%;
        box-shadow: 0 0 0 3px rgba(26, 115, 232, 0.35);
      "></div>`,
      iconSize: [20, 20],
      iconAnchor: [10, 10]
    });

    this.secimIsaretcisi = this.leaflet.marker([lat, lng], { icon: isaret }).addTo(this.map);
  }

  /**
   * @description Haritadaki seçim işaretçisini kaldırır.
   * Şikayet paneli kapatıldığında çağrılır.
   */
  secimiTemizle(): void {
    if (this.secimIsaretcisi && this.map) {
      this.map.removeLayer(this.secimIsaretcisi);
      this.secimIsaretcisi = null;
    }
  }

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private authService:AuthService,
    private router:Router,
    private complaintService:ComplaintService,
    ) {}
    ngOnInit():void{
      //uygulama açılır açılmaz servisten rolü dinleyip değişkene atıyoruz
      this.currentUserRole = this.authService.role();
    }
async ngAfterViewInit(): Promise<void> {
    if (isPlatformBrowser(this.platformId)) {
      const L = await import('leaflet');
      this.leaflet = L;
      // 1. GÜVENLİK KONTROLÜ: Harita daha önce çizilmişse temizle
      if (this.map) {
        this.map.off(); // Tüm event listener'ları kaldırır
        this.map.remove();
      }
      if (this.map) {
        this.map.remove();
      }
      // 1. KAMPÜS SINIRLARI (Orijinal ayarların korundu)
            const sinir = HaritaAlani.KAMPUS_SINIRLARI;

      const kampusSinirlari = L.latLngBounds(
        [sinir.minLat, sinir.minLng],
        [sinir.maxLat, sinir.maxLng]
      );
      // Haritanın bağlı olduğu HTML elementini zorla temizleme (Leaflet'in inatçılığına karşı)
      let mapContainer = document.getElementById('map');
      if (mapContainer && mapContainer.innerHTML) {
          mapContainer.innerHTML = '';
      }
      // 2. HARİTA AYARLARI
      this.map = L.map('map', {
        maxBounds: kampusSinirlari, 
        maxBoundsViscosity: 1.0,    
        minZoom: 16,                
        maxZoom: 19,                
        zoomControl: true
      }).setView([38.900023, 40.487786], 17); 
      // 3. TERTEMİZ UYDU KATMANI (Etiketler silindi -> lyrs=s yapıldı)
      L.tileLayer('https://{s}.google.com/vt/lyrs=s&x={x}&y={y}&z={z}', {
        maxZoom: 19,       
        maxNativeZoom: 19, 
        subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
        attribution: '© Google Maps'
      }).addTo(this.map);
      
      // Haritaya tıklayarak konum seçme.
      // Konum izni olmayan kullanıcının da şikayet bildirebilmesini sağlar.
      if (this.konumSecmeAktif) {
        this.map.on('click', (e: any) => {
          this.konumIsaretle(e.latlng.lat, e.latlng.lng);
          this.konumSecildi.emit({ lat: e.latlng.lat, lng: e.latlng.lng });
        });
      }
      
      
      // 4. KAMPÜS BİNALARI KIRMIZI ETİKETLER
      const kampusBinalari = [
        { isim: 'Sosyal Bilimler enstitüsü', lat: 38.89634450658831, lng: 40.490836804153126}, 
        { isim: 'Sağlık Bilimleri enstitüsü', lat: 38.89653238298186, lng: 40.490788570992265},
        { isim: 'Fen Bilimleri enstitüsü', lat: 38.896542820544724, lng:  40.49045361848605},
        { isim: 'Kuran-ı Kerim Araştırmaları ve Kıraat İlmi enstitüsü', lat: 38.896342419070024, lng: 40.490458977726135},
        { isim: 'Yaşayan Diller enstitüsü', lat: 38.89643844484722, lng: 40.49065191036972},
        { isim: 'İdari Bilimler', lat: 38.896533320356056, lng: 40.48958624290281},
        { isim: 'Aile Sağlığı Merkezi', lat: 38.89649574511758, lng: 40.48909855205379}, 
        { isim: 'Rektörlük', lat: 38.89633291885456, lng: 40.48936919367878},
        { isim: 'PİKOM(Pilot Üniversite Koordinasyon Merkez Birimi)', lat: 38.89620923543007, lng: 40.488176671286865},
        { isim: 'Arı Ürünleri Tanıtım Ofisi', lat: 38.89665345938104, lng: 40.48292997506638},
        { isim: 'Kongre Merkezi', lat: 38.897776530558026, lng: 40.4902260458129},
        { isim: 'Merkezi Kafeterya', lat: 38.89794937360231, lng: 40.4887522546221},
        { isim: 'Yaşam Merkezi', lat: 38.89856726235078, lng: 40.48843605945625},
        { isim: 'Fen Edebiyat Fakültesi', lat: 38.898050407181174, lng: 40.486948334535626},
        { isim: 'Yabancı Diller Yüksekokulu', lat: 38.897215415032186, lng: 40.486916179095},
        { isim: 'Sağlık Bilimleri Fakültesi', lat: 38.897662137053146, lng: 40.486348099644516},
        { isim: 'Kütüphane', lat: 38.89838690626708, lng: 40.48569105693924},
        { isim: 'Spor Bilimleri Fakültesi', lat: 38.89949408602979, lng: 40.491213218395224},
        { isim: 'Halı Saha', lat: 38.90050272309844, lng: 40.49055831935323},
        { isim: 'Veterinerlik Fakültesi', lat: 38.89991323971254, lng: 40.48831601349208},
        { isim: 'Ziraat Fakültesi', lat: 38.899842267623534, lng: 40.48779080796237},
        { isim: 'Gıda,Tarım Ve Hayvancılık Meslek Yüksekokulu', lat: 38.89992993901729, lng: 40.48728703939303},     
        { isim: 'Merkezi Laboratuvar', lat: 38.900729829357196, lng: 40.48849040709915},
        { isim: 'Spor Salonu', lat: 38.90082584920162, lng: 40.486511775752746},
        { isim: 'Cami', lat: 38.90085340278742, lng: 40.485715392477736},
        { isim: 'İktisadi Ve İdari Bilimler Fakültesi', lat: 38.90018961103181, lng: 40.485302730990114},
        { isim: 'Mühendislik Fakültesi', lat: 38.89930872056724, lng: 40.48476144774014},
        { isim: 'Kız Öğrenci Yurdu', lat: 38.900757382852845, lng: 40.48397256761392},
        { isim: 'Fizik Tedavi Ve Rehabilitasyon Fakültesi', lat: 38.90011028958935, lng: 40.481092511199634},
        { isim: 'İlahiyat', lat: 38.899676107492226, lng: 40.48116218132091},
        { isim: 'Sosyal Bilimler Meslek Yüksekokulu', lat: 38.90547514193316, lng: 40.48265186743765},
        { isim: 'Bilişim Teknolojileri Meslek Yüksekokulu', lat: 38.90526641664374, lng: 40.48257147883616},
        { isim: 'Sağlık Hizmetleri Meslek Yüksekokulu', lat: 38.90464441164206, lng: 40.48247769213443},
        { isim: 'Teknik Bilimler Meslek Yüksekokulu', lat: 38.904960424120034, lng: 40.48197258733189},
        { isim: 'Diş Hekimliği Fakültesi', lat: 38.904312531903805, lng: 40.482527804148205},
        { isim: 'Teknoloji Transfer Ofisi', lat: 38.90030483426649, lng: 40.475981474857804},
        { isim: 'Diş Hekimliği Fakültesi Hastanesi', lat: 38.90244230156532, lng: 40.47629231078352},
        { isim: 'Erkek Öğrenci Yurdu', lat: 38.89677954321722, lng: 40.49553627071994},
        { isim: 'Konuk Evi', lat: 38.897338992476165, lng: 40.49401424653182},  
      ];
      // 5. HD KIRMIZI PİN TASARIMI
      const redPinSVG = `
        <svg width="28" height="40" viewBox="0 0 24 36" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 0C5.373 0 0 5.373 0 12c0 7.5 12 24 12 24s12-16.5 12-24C24 5.373 18.627 0 12 0zm0 17.5c-3.038 0-5.5-2.462-5.5-5.5S8.962 6.5 12 6.5s5.5 2.462 5.5 5.5-2.462 5.5-5.5 5.5z" 
                fill="#e60000" stroke="#ffffff" stroke-width="2" drop-shadow="0px 3px 3px rgba(0,0,0,0.3)"/>
        </svg>`;
      const customRedIcon = L.divIcon({
        className: 'custom-map-pin',
        html: redPinSVG,
        iconSize: [28, 40],
        iconAnchor: [14, 40], 
        popupAnchor: [0, -40] 
      });
      // 6. PİNLERİ HARİTAYA YERLEŞTİRME
      // PİNLERE HOVER (ÜZERİNE GELİNCE) AÇILAN SİYAH ETİKET EKLEME
      kampusBinalari.forEach(bina => {
        L.marker([bina.lat, bina.lng], { icon: customRedIcon })
          .addTo(this.map)
          .bindTooltip(bina.isim, {
            permanent: false,      // Sürekli açık olmaz, sadece üzerine gelince görünür
            direction: 'right',    // Pinin sağ tarafında açılır
            offset: [0, -20],      // Konum ayarı
            className: 'siyah-kampus-tooltip' // Tasarım için özel sınıfımız
          });
      });
    // YENİ KOD: Bina pinleri eklendikten sonra şikayet pinlerini ekle
    this.addComplaintPins(L);
    }
  }
// 'L' parametresini Leaflet instance'ı olarak alıyoruz
  addComplaintPins(L: any) {
        this.complaintsSubscription = this.complaintService.getComplaints().subscribe((complaints) => {
      complaints.forEach((complaint: Complaint) => {
        // 1. Önceliğe göre pin rengini belirle
        let pinColor = '#eab308'; // Varsayılan: Sarı (Düşük)
        // (Eski verilerde Acil kalmış olma ihtimaline karşı onu da Kırmızı yapıyoruz)
        if (complaint.priority === 'Kritik' || complaint.priority === 'Acil') pinColor = '#ef4444'; // Kırmızı
        if (complaint.priority === 'Orta') pinColor = '#3b82f6'; // Mavi
        // 2. Binalarla karışmaması için şık, yuvarlak bir nokta (dot) oluştur
        const dotIcon = L.divIcon({
          className: 'complaint-dot-icon',
          html: `<div style="
            background-color: ${pinColor}; 
            width: 18px; 
            height: 18px; 
            border-radius: 50%; 
            border: 3px solid white; 
            box-shadow: 0 0 6px rgba(0,0,0,0.6);">
          </div>`,
          iconSize: [18, 18],
          iconAnchor: [9, 9] // Pinin merkez noktasını koordinata tam oturtur
        });  
        // 3. Pini haritaya ekle ve tıklama olayını bağla
        if (this.map) {
          const marker = L.marker([complaint.lat, complaint.lng], { icon: dotIcon }).addTo(this.map);
          // Pine tıklandığında marker ve şikayet objesini gönderiyoruz
          marker.on('click', () => {
            this.onPinClick(complaint, marker);
          });
        }
      });
    });
  }
  /**
   * @description Haritadaki renkli şikayet pinlerine tıklandığında tetiklenir.
   *
   * Yönetici ve öğrenci için farklı davranır:
   * - Yönetici → Güncel Şikayetler sayfasına filtrelenmiş olarak yönlendirilir
   * - Öğrenci  → Konum bilgisi ve destek butonu içeren baloncuk açılır
   *
   * @param {Complaint} complaint - Tıklanan pine ait şikayet kaydı
   * @param {any} marker - Leaflet marker nesnesi
   */
async onPinClick(complaint:Complaint,marker:any):Promise<void>{
  //Yönetici senaryosu:şikayetler sayfasına yönlendir
  if(this.authService.isAdmin()){
    this.router.navigate(['/complaints'],{
      queryParams:{
        priority:complaint.priority,
        location:complaint.location
      }
    });
    return;
  }
  //öğrenci senaryosu: baloncuk popup aç ve destek durumunu kontrol et
  //aktif kullanıcının id sini al
  const user=this.authService.currentUser();
  const userId=user?user.uid:null;
  //kullanıcı bu şikayeti daha önce destekledi mi diye veritabanına sor
  let isSupported=false;
  if(userId&&complaint.id){
    isSupported=await this.complaintService.checkUserSupport(complaint.id,userId)
  }
  //gelen cevaba göre butonun rengini metnini ve tıklanabilirliğini hazırla
  const butonMetni=isSupported? 'Desteklendi ✔' : '+ Destekle';
  const butonRengi = isSupported ? '#10b981' : '#3b82f6';
  const butonKursoru = isSupported ? 'default' : 'pointer';
  const disabledOzelligi = isSupported ? 'disabled="true"' : '';
  //HTML içine dinamik veri göm
  const popupHTML = `
      <div style="text-align: center; padding: 5px; min-width: 150px; font-family: sans-serif;">
        <h4 style="margin: 0 0 8px 0; font-size: 14px; color: #1f2937;">📍 ${complaint.location}</h4>
        
        <!-- ŞİKAYET İÇERİĞİ -->
        <p style="margin: 0 0 8px 0; font-size: 13px; color: #4b5563; text-align: left; font-style: italic;">
          "${complaint.description}"
        </p>
        
        <p style="margin: 0 0 12px 0; font-size: 13px; color: #4b5563;">
          👥 Destekçi: <strong id="destek-sayisi" style="color: #3b82f6; font-size: 16px;">${complaint.supportCount}</strong>
        </p>
        
        <button id="destek-butonu" ${disabledOzelligi} style="background-color: ${butonRengi}; color: white; border: none; padding: 8px 12px; border-radius: 6px; cursor: ${butonKursoru}; font-weight: bold; width: 100%; transition: 0.2s;">
          ${butonMetni}
        </button>
      </div>
    `;
    // 1. Sadece popup'ı bağla (henüz açma)
    marker.bindPopup(popupHTML);

    // 2. Popup EKRANA ÇİZİLDİĞİ ANDA (popupopen) butonları yakala
    marker.on('popupopen', () => {
      if (!isSupported) {
        const destekButonu = document.getElementById('destek-butonu');
        const destekSayisiMetni = document.getElementById('destek-sayisi');
        
        if (destekButonu && destekSayisiMetni) {
          // Önceki tıklama olaylarını temizle (Çift tıklama bug'ını önler)
          destekButonu.onclick = null; 
          
          destekButonu.onclick = async () => {
            // Arayüzü hemen güncelle
            complaint.supportCount = (complaint.supportCount || 0) + 1;
            destekSayisiMetni.innerText = complaint.supportCount.toString();
            destekButonu.innerText = 'Desteklendi ✔';
            destekButonu.style.backgroundColor = '#10b981';
            destekButonu.setAttribute('disabled', 'true');
            destekButonu.style.cursor = 'default';
            
            // Veriyi Firebase'e gönder
            try {
              if (userId && complaint.id) {
                await this.complaintService.supportComplaint(complaint.id, userId);
              } else {
                console.warn('Kullanıcı ID veya Şikayet ID bulunamadı!');
              }
            } catch (error) {
              console.error('Destek kaydedilirken hata oluştu: ', error);
            }
          };
        }
      }
    });

    // 3. Olay dinleyiciyi ekledikten sonra popup'ı aç
    marker.openPopup();
}
// 2. TEMİZLİK: Bileşen ekrandan ayrılırken haritayı ve canlı dinleyiciyi kapat
ngOnDestroy(): void {
  // Şikayet akışı kapatılmazsa harita yok olsa bile veri gelmeye devam eder
  this.complaintsSubscription?.unsubscribe();

  if (this.map) {
    this.map.off();
    this.map.remove();
    this.map = undefined;
  }
}    
}
