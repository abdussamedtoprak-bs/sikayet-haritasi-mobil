import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PriorityLegend } from '../../components/complaints/priority-legend/priority-legend';
import{ActiveFilterBadges} from '../../components/complaints/active-filter-badges/active-filter-badges';
import{FilterPanel} from '../../components/complaints/filter-panel/filter-panel';
import { TabFilter } from '../../components/complaints/tab-filter/tab-filter';
import { ComplaintCard } from '../../components/complaints/complaint-card/complaint-card';
import { ComplaintDetailSheet } from '../../components/complaints/complaint-detail-sheet/complaint-detail-sheet';
import { Baslik } from '../../components/baslik/baslik';
import { SearchBar } from '../../components/search-bar/search-bar';
@Component({
  selector: 'app-complaints',
  imports: [PriorityLegend, ActiveFilterBadges, FilterPanel, TabFilter,ComplaintCard,ComplaintDetailSheet,Baslik,SearchBar],
  templateUrl: './complaints.html',
  styleUrl: './complaints.css',
})
export class Complaints {
  // Panelin açık/kapalı durumunu tutan değişken:
  isFilterModalOpen = false;

  // Seçilen filtreleri burada tutacağız
  currentFilters = {
    category: 'Tümü',
    status: 'Tümü',
    date: 'Tümü'
  };

  //arayüzdeki kartlar
  complaintList=[
    {
      title:'Kırık Cam Tehlikesi',
      supportCount:55,
      description:'Kütüphane önünde yaklaşık 2 metre...',
      metaInfo: 'Güvenlik . 31.07.2026',
      status:'İnceleniyor',
      priority:'Acil'
    },
    {
      title: 'Kırık Yönlendirme Levhası',
      supportCount:45,
      description:'Kampüs Haritasını Gösteren levha...',
      metaInfo:'Güvenlik . 31.07.2026',
      status:'İnceleniyor',
      priority:'Acil'
    },
    {
      title:'Yabani Ot Temizliği',
      supportCount:25,
      description:'Yürüyüş yollarının kenarındaki ot ...',
      metaInfo:'Çevre . 31.07.2026 - 04.08.2026',
      status:'Çözüldü',
      priority:'Düşük'
    },
    {
      title: 'Hasarlı Bank',
      supportCount: 20,
      description: 'Kampüs bahçesindeki bankın otur ...',
      metaInfo: 'Çevre . 31.07.2026',
      status: 'Beklemede',
      priority: 'Düşük'
    }
  ];

  // 1. O an seçili olan sekmeyi tutacak değişken (Sayfa açıldığında 'Tümü' aktif olsun)
  currentFilter: string='Tümü';

  // Arama çubuğuna yazılan metni tutacak değişken
  searchText: string = '';

  //2.Tab bileşeninden tıklama gelince bu fonksiyon çalışacak ve seçimi güncelleyecek
  onFilterChange(selectedTab:string){
    this.currentFilter=selectedTab;
  }
  //3. HTML'e tüm listeyi değil, sadece seçilen filtreye uyanları gönderen dinamik liste
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

  // Temizle butonuna basıldığında filtreleri sıfırlayacak fonksiyon
  clearAllFilters() {
    this.currentFilters = {
      category: 'Tümü',
      status: 'Tümü',
      date: 'Tümü'
    };
  }

  //Hangi şikayete tıklandığını ve panelin açık/kapalı durumunu tutacak değişkenler
  selectedComplaint:any=null;
  isSheetOpen:boolean=false;

  //karta tıklandığında çalışacak fonksiyon
  openDetail(complaint:any){
    this.selectedComplaint=complaint;
    this.isSheetOpen=true;
  }

  //panrldeki 'x' butonuna basıldığında çalışacak fonksiyon
  closeDetail(){
    this.isSheetOpen=false;
    this.selectedComplaint=null;
  }

  // Modaldan seçimler gelince bu fonksiyon çalışacak
  updateFilters(newFilters: any) {
    this.currentFilters = newFilters;
  }

  // Sonraki şikayete geç
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

  // Önceki şikayete dön
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

  // Arama çubuğuna her harf girildiğinde veya silindiğinde bu fonksiyon çalışacak
  onSearch(arananKelime: string) {
  // Gelen metni küçük harfe çevirip başındaki/sonundaki boşlukları siliyoruz (daha sağlıklı arama için)
  this.searchText = arananKelime.toLowerCase().trim();
}

}

