import { Component } from '@angular/core';
import { PriorityLegend } from '../../../components/complaints/priority-legend/priority-legend';
import{ActiveFilterBadges} from '../../../components/complaints/active-filter-badges/active-filter-badges';
import{FilterPanel} from '../../../components/complaints/filter-panel/filter-panel';

@Component({
  selector: 'app-complaints',
  imports: [PriorityLegend, ActiveFilterBadges, FilterPanel],
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

  // Modaldan seçimler gelince bu fonksiyon çalışacak
  updateFilters(newFilters: any) {
    this.currentFilters = newFilters;
  }
}
