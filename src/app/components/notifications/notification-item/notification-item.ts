import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Bildirim } from '../../../models/bildirim';

@Component({
  selector: 'app-notification-item',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notification-item.html',
  styleUrl: './notification-item.css'
})
export class NotificationItemComponent {
  @Input() bildirim!: Bildirim;
  @Output() itemTiklandi = new EventEmitter<Bildirim>();

  tiklandi(): void {
    this.itemTiklandi.emit(this.bildirim);
  }

  ikonGetir(tip: string): string {
    const ikonlar: Record<string, string> = {
      guncelleme: '👤',
      cozuldu: '✅',
      yakin: '📍',
      acil: '👤'
    };
    return ikonlar[tip] || '🔔';
  }
}