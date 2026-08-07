import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-toggle-row',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toggle-row.html',
  styleUrl: './toggle-row.css'
})
export class ToggleRowComponent {
  @Input() ikon: string = '';
  @Input() baslik: string = '';
  @Input() aciklama: string = '';
  @Input() aktif: boolean = false;
  @Output() toggleChanged = new EventEmitter<boolean>();

  toggle(): void {
    this.toggleChanged.emit(!this.aktif);
  }
}