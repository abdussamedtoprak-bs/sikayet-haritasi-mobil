import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-settings-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './settings-section.html',
  styleUrl: './settings-section.css'
})
export class SettingsSectionComponent {
  @Input() baslik: string = '';
}