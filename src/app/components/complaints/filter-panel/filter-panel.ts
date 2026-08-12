import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms'; // İki yönlü veri bağlama için
@Component({
  selector: 'app-filter-panel',
  imports: [FormsModule],
  templateUrl: './filter-panel.html',
  styleUrl: './filter-panel.css',
})

/**
 * @description Şikayetleri kategori, öncelik durumu ve tarih aralığına göre daraltmak için kullanılan 
 * detaylı filtreleme (modal) bileşenidir. Kullanıcının yerel seçimlerini tutar ve onaylandığında ana bileşene iletir.
 */

export class FilterPanel {

  /**
   * @description Filtreleme panelinin görünürlük durumunu (açık/kapalı) dışarıdan kontrol eder.
   * @type {boolean}
   */
  @Input() isOpen: boolean = false; 

  /**
   * @description Panel kapatılmak istendiğinde (çarpıya, arka plana tıklama vb.) üst bileşeni uyarır.
   * @event closePanel
   * @type {EventEmitter<void>}
   */
  @Output() closePanel = new EventEmitter<void>();

  /**
   * @description "Filtrele" butonuna basıldığında kullanıcının seçtiği güncel filtre parametrelerini dışarı fırlatır.
   * @event applyFilters
   * @type {EventEmitter<{category: string, status: string, date: string}>}
   */
  @Output() applyFilters = new EventEmitter<{category: string, status: string, date: string}>();


  /**
   * @description "Temizle" butonuna basıldığında filtrelerin sıfırlanması için üst bileşene sinyal gönderir.
   * @event clearFilters
   * @type {EventEmitter<void>}
   */
  @Output() clearFilters = new EventEmitter<void>();

  // Modal içindeki anlık seçimler (Varsayılan olarak "Tümü")
  selectedCategory: string = 'Tümü';
  selectedStatus: string = 'Tümü';
  selectedDate: string = 'Tümü';



  /**
   * @description Paneli kapatmak için closePanel olayını tetikler.
   */
  close() {
    this.closePanel.emit();
  }



  /**
   * @description Kullanıcının modal içindeki seçimlerini alır, `applyFilters` aracılığıyla 
   * ana bileşene gönderir ve başarılı işlemin ardından paneli kapatır.
   */
  onFilterClick() {
    // Filtrele butonuna basıldığında seçimleri dışarı yolla
    this.applyFilters.emit({
      category: this.selectedCategory,
      status: this.selectedStatus,
      date: this.selectedDate
    });
    this.close(); // Ve paneli kapat
  }


  /**
   * @description Panel içerisindeki yerel seçim durumlarını (kategori, durum, tarih) 
   * varsayılan 'Tümü' değerine çeker ve `clearFilters` olayını tetikler.
   */
  onClearClick() {
  // 1. Önce panelin kendi içindeki seçimleri varsayılana döndürüyoruz
  this.selectedCategory = 'Tümü';
  this.selectedStatus = 'Tümü';
  this.selectedDate = 'Tümü';

  // 2. Ana bileşene "Filtreleri Temizle" haberini fırlatıyoruz
  this.clearFilters.emit();
  
  
}
}
