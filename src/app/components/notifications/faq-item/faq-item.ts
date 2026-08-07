import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SSSItem } from '../../models/sss-item';

@Component({
  selector: 'app-faq-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './faq-item.html',
  styleUrl: './faq-item.css'
})
export class FaqItemComponent {
  @Input() item!: SSSItem;
  @Output() toggleTiklandi = new EventEmitter<number>();

  toggle(): void {
    this.toggleTiklandi.emit(this.item.id);
  }
}