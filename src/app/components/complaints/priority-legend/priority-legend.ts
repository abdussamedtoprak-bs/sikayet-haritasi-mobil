import { Component } from '@angular/core';

/**
 * @description Şikayet haritası ve listelerinde, şikayetlerin öncelik durumlarını 
 * (Kritik, Orta, Düşük) kullanıcılara renk kodlarıyla gösteren görsel bilgilendirme (legend) bileşenidir.
 * 
 * Sadece görsel bir sunum katmanı (presentation component) olarak görev yapar, 
 * dışarıdan veri almaz (@Input) veya dışarıya olay fırlatmaz (@Output).
 */

@Component({
  selector: 'app-priority-legend',
  imports: [],
  templateUrl: './priority-legend.html',
  styleUrl: './priority-legend.css',
})
export class PriorityLegend {}
