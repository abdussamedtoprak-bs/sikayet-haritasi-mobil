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
}
