import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-nav-row',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './nav-row.html',
  styleUrl: './nav-row.css'
})
export class NavRowComponent {
  @Input() ikon: string = '';
  @Input() baslik: string = '';
  @Output() satirTiklandi = new EventEmitter<void>();

  tiklandi(): void {
    this.satirTiklandi.emit();
  }
}