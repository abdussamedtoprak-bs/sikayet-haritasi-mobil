import { Component,Output, EventEmitter,Input } from '@angular/core';

@Component({
  selector: 'app-active-filter-badges',
  imports: [],
  templateUrl: './active-filter-badges.html',
  styleUrl: './active-filter-badges.css',
})
export class ActiveFilterBadges {
  @Output() openFilter = new EventEmitter<void>();
  // Dışarıdan gelecek olan filtre bilgileri

  @Input() filters = {
    category: 'Tümü',
    status: 'Tümü',
    date: 'Tümü'
  };

}

