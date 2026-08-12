import { Component,OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PriorityLegend } from '../../components/complaints/priority-legend/priority-legend';
import{ActiveFilterBadges} from '../../components/complaints/active-filter-badges/active-filter-badges';
import{FilterPanel} from '../../components/complaints/filter-panel/filter-panel';
import { TabFilter } from '../../components/complaints/tab-filter/tab-filter';
import { ComplaintCard } from '../../components/complaints/complaint-card/complaint-card';
import { ComplaintDetailSheet } from '../../components/complaints/complaint-detail-sheet/complaint-detail-sheet';
import { Baslik } from '../../components/baslik/baslik';
import { SearchBar } from '../../components/search-bar/search-bar';
import { Complaint } from '../../models/complaint';
import { ComplaintService } from '../../services/complaint';

@Component({
  selector: 'app-complaints',
  imports: [PriorityLegend, ActiveFilterBadges, FilterPanel, TabFilter,ComplaintCard,ComplaintDetailSheet,Baslik,SearchBar],
  templateUrl: './complaints.html',
  styleUrl: './complaints.css',
})



/**
 * @description "Güncel Şikayetler" sayfasının ana (container) bileşenidir. 
 * Harita, arama çubuğu, filtreleme modülleri ve şikayet listesi gibi tüm alt bileşenleri orkestre eder. 
 * Şikayet verilerini tutar ve kullanıcı etkileşimlerine göre (arama, sekme değişimi, detaylı filtreleme) 
 * listeyi dinamik olarak günceller.
 */
export class Complaints implements OnInit {


  /**
   * @description Detaylı filtreleme modalının (panelinin) açık veya kapalı olma durumunu yönetir.
   * @type {boolean}
   */
  isFilterModalOpen = false;

  

  /**
   * @description Modal üzerinden seçilen aktif filtre kriterlerini (Kategori, Durum, Tarih) tutar.
   * @type {Object}
   */
  currentFilters = {
    category: 'Tümü',
    status: 'Tümü',
    date: 'Tümü'
  };

  /**
   * @description ComplaintService'i sayfaya dahil ediyoruz.
   */
  constructor(private complaintService: ComplaintService) {}

  /**
   * @description Bileşen ekrana basıldığı anda otomatik olarak tetiklenir ve verileri yükler.
   */
  ngOnInit(): void {
    this.loadComplaints();
  }


  /**
   * @description Şikayet servisi üzerinden asenkron veri akışına abone olur (subscribe) 
   * ve gelen verileri yerel `complaintList` dizisine aktarır.
   */
  loadComplaints(): void {
    this.complaintService.getComplaints().subscribe({
      next: (data) => {
        // Servisten gelen tertemiz veriyi sayfamızdaki listeye aktardık
        this.complaintList = data; 
      },
      error: (err) => {
        console.error('Şikayetler yüklenirken bir hata oluştu:', err);
      }
    });
  }

  /**
   * @description Veritabanından (veya servisten) gelen tüm şikayetlerin tutulduğu veri listesi.
   * İçini boşalttık, artık veriler servisten asenkron olarak dolacak.
   * @type {Complaint[]} 
   */
  complaintList:Complaint[]=[];

  
  
  /**
   * @description Sekme (tab) üzerinden seçilen öncelik filtresini (örn: 'Tümü', 'Acil', 'Orta') tutar.
   * @type {string}
   */
  currentFilter: string='Tümü';

  

  /**
   * @description Arama çubuğuna kullanıcı tarafından girilen metni tutar.
   * @type {string}
   */
  searchText: string = '';

  

  /**
   * @description Mevcut şikayet listesi üzerinden (complaintList) her bir öncelik durumunun 
   * (Tümü, Acil, Orta, Düşük) toplam sayısını hesaplar ve sekmeler bileşenine dinamik veri sağlar.
   * @returns {Object} Öncelik durumlarına göre şikayet sayılarını içeren nesne.
   */
  get tabCounts() {
    return {
      tumu: this.complaintList.length,
      acil: this.complaintList.filter(c => c.priority === 'Acil').length,
      orta: this.complaintList.filter(c => c.priority === 'Orta').length,
      dusuk: this.complaintList.filter(c => c.priority === 'Düşük').length
    };
  }

  /**
   * @description Sekme (tab) bileşeninden tıklama geldiğinde çalışır. Yeni seçim değerini alarak 
   * `currentFilter` değişkenini günceller.
   * @param {string} selectedTab - Seçilen sekmenin adı (örn: 'Acil').
   */
  onFilterChange(selectedTab:string){
    this.currentFilter=selectedTab;
  }
  
  


  /**
   * @description Ham şikayet listesini (complaintList) sırasıyla sekme filtresi, detaylı modal filtreleri 
   * ve arama çubuğu metnine göre süzerek (filter) ekranda gösterilecek nihai dinamik listeyi oluşturur.
   * @returns {Array<any>} Tüm filtrelerin uygulandığı nihai şikayet dizisi.
   */
  get filteredComplaints() {
    let result = this.complaintList;

    // 1. Sekme (Tab) Filtresi (Tümü, Acil, Orta vb.)
    if (this.currentFilter && this.currentFilter !== 'Tümü') {
      result = result.filter(complaint => complaint.priority === this.currentFilter);
    }

    // 2. Üst Panel (Modal) Filtreleri
    if (this.currentFilters) {
      
      // Kategori (aslında Öncelik) Filtresi
      if (this.currentFilters.category && this.currentFilters.category !== 'Tümü') {
        let aranacakDeger = this.currentFilters.category.trim(); // Boşlukları temizle
        
        // Modaldaki 'Kritik' kelimesini verilerimizdeki 'Acil' ile eşleştir
        if (aranacakDeger === 'Kritik') {
          aranacakDeger = 'Acil'; 
        }
        
        result = result.filter(c => c.priority.trim() === aranacakDeger);
      }

      // Durum Filtresi (Çözüldü, Beklemede vb.)
      if (this.currentFilters.status && this.currentFilters.status !== 'Tümü') {
        result = result.filter(c => c.status.trim() === this.currentFilters.status.trim());
      }

      // Tarih Filtresi
      if (this.currentFilters.date && this.currentFilters.date !== 'Tümü') {
        result = result.filter(c => c.metaInfo.includes(this.currentFilters.date.trim()));
      }

      // YENİ EKLENEN: Arama Çubuğu Filtresi
      if (this.searchText) {
        result = result.filter(c => 
          c.title.toLowerCase().includes(this.searchText) || 
          c.description.toLowerCase().includes(this.searchText)
        );
      }
    }

    return result; // Son listeyi ekrana gönder
  }

  /**
   * @description "Temizle" butonuna tıklandığında detaylı filtre panelindeki tüm seçimleri varsayılan 
   * 'Tümü' durumuna sıfırlar.
   */
  clearAllFilters() {
    this.currentFilters = {
      category: 'Tümü',
      status: 'Tümü',
      date: 'Tümü'
    };
  }



  /**
   * @description Detay paneli (bottom sheet) açıldığında görüntülenecek olan seçili şikayet nesnesini tutar.
   * Henüz bir kart seçilmediğinde veya panel kapatıldığında null değerini alır.
   * @type {Complaint | null}
   */
  selectedComplaint:Complaint | null = null;



  /**
   * @description Detay panelinin görünürlük durumunu kontrol eder.
   * @type {boolean}
   */
  isSheetOpen:boolean=false;

  
  
  /**
   * @description Listedeki bir şikayet kartına tıklandığında çalışır. Seçilen şikayeti 
   * `selectedComplaint` değişkenine atar ve detay panelini görünür hale getirir.
   * @param {Complaint} complaint - Tıklanan şikayet nesnesi.
   */
  openDetail(complaint:Complaint){
    this.selectedComplaint=complaint;
    this.isSheetOpen=true;
  }

  /**
   * @description Detay panelindeki 'x' (kapat) butonuna tıklandığında paneli gizler ve seçili şikayeti sıfırlar.
   */
  closeDetail(){
    this.isSheetOpen=false;
    this.selectedComplaint=null;
  }

  /**
   * @description Detay panelindeki 'x' (kapat) butonuna tıklandığında paneli gizler ve seçili şikayeti sıfırlar.
   */
  updateFilters(newFilters: any) {
    this.currentFilters = newFilters;
  }

  /**
   * @description Detay panelinde sağ ok (ileri) tuşuna basıldığında çalışır.
   * Mevcut filtrelenmiş listedeki bir sonraki şikayeti bulur. Listenin sonundaysa en başa döner.
   */
  goToNextComplaint() {
    // Şu an açık olan şikayetin listedeki sırasını (index) bul
    const currentIndex = this.filteredComplaints.findIndex(c => c === this.selectedComplaint);
    
    // Eğer son şikayette değilsek, bir sonrakine geç
    if (currentIndex !== -1 && currentIndex < this.filteredComplaints.length - 1) {
      this.selectedComplaint = this.filteredComplaints[currentIndex + 1];
    } else {
      // Eğer listedeki son şikayetteysek, en başa (ilk şikayete) dön
      this.selectedComplaint = this.filteredComplaints[0];
    }
  }

  /**
   * @description Detay panelinde sol ok (geri) tuşuna basıldığında çalışır.
   * Mevcut filtrelenmiş listedeki bir önceki şikayeti bulur. Listenin başındaysa en sona gider.
   */
  goToPrevComplaint() {
    const currentIndex = this.filteredComplaints.findIndex(c => c === this.selectedComplaint);
    
    // Eğer ilk şikayette değilsek, bir öncekine geç
    if (currentIndex > 0) {
      this.selectedComplaint = this.filteredComplaints[currentIndex - 1];
    } else {
      // Eğer en baştaysak, en sondaki şikayete git
      this.selectedComplaint = this.filteredComplaints[this.filteredComplaints.length - 1];
    }
  }

  /**
   * @description Arama çubuğuna her harf girildiğinde çalışır. Gelen metni küçük harfe çevirir, 
   * başındaki ve sonundaki boşlukları temizleyerek (trim) daha sağlıklı bir arama verisi oluşturur.
   * @param {string} arananKelime - Kullanıcının girdiği ham arama metni.
   */
  onSearch(arananKelime: string) {
  this.searchText = arananKelime.toLowerCase().trim();
}

}

