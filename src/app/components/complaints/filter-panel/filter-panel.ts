import { Component, Input, Output, EventEmitter } from '@angular/core';
import { FormsModule } from '@angular/forms'; // İki yönlü veri bağlama için
@Component({
  selector: 'app-filter-panel',
  imports: [FormsModule],
  templateUrl: './filter-panel.html',
  styleUrl: './filter-panel.css',
})
export class FilterPanel {
  @Input() isOpen: boolean = false; // Varsayılan olarak kapalı
  @Output() closePanel = new EventEmitter<void>();

  // Seçimleri tutacağımız nesne (Dışarıya bunu fırlatacağız)
  @Output() applyFilters = new EventEmitter<{category: string, status: string, date: string}>();
  @Output() clearFilters = new EventEmitter<void>();

  // Modal içindeki anlık seçimler (Varsayılan olarak "Tümü")
  selectedCategory: string = 'Tümü';
  selectedStatus: string = 'Tümü';
  selectedDate: string = 'Tümü';

  close() {
    this.closePanel.emit();
  }

  onFilterClick() {
    // Filtrele butonuna basıldığında seçimleri dışarı yolla
    this.applyFilters.emit({
      category: this.selectedCategory,
      status: this.selectedStatus,
      date: this.selectedDate
    });
    this.close(); // Ve paneli kapat
  }

  onClearClick() {
  // 1. Önce panelin kendi içindeki seçimleri varsayılana döndürüyoruz
  this.selectedCategory = 'Tümü';
  this.selectedStatus = 'Tümü';
  this.selectedDate = 'Tümü';

  // 2. Ana bileşene "Filtreleri Temizle" haberini fırlatıyoruz
  this.clearFilters.emit();
  
  // 3. İsteğe bağlı: Temizledikten sonra paneli kapat
  this.close(); 
}
}
