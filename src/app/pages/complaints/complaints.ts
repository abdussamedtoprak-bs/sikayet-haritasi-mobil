import { Component } from '@angular/core';
import { PriorityLegend } from '../../components/complaints/priority-legend/priority-legend';
import{ActiveFilterBadges} from '../../components/complaints/active-filter-badges/active-filter-badges';
import{FilterPanel} from '../../components/complaints/filter-panel/filter-panel';
import { TabFilter } from '../../components/complaints/tab-filter/tab-filter';
import { ComplaintCard } from '../../components/complaints/complaint-card/complaint-card';

@Component({
  selector: 'app-complaints',
  imports: [PriorityLegend, ActiveFilterBadges, FilterPanel, TabFilter,ComplaintCard],
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

  //arayüzdeki kartlar
  complaintList=[
    {
      title:'Kırık Cam Tehlikesi',
      supportCount:55,
      description:'Kütüphane önünde yaklaşık 2 metre...',
      metaInfo: 'Güvenlik . 31.07.2026',
      status:'İnceleniyor',
      priority:'Acil'
    },
    {
      title: 'Kırık Yönlendirme Levhası',
      supportCount:45,
      description:'Kampüs Haritasını Gösteren levha...',
      metaInfo:'Güvenlik . 31.07.2026',
      status:'İnceleniyor',
      priority:'Acil'
    },
    {
      title:'Yabani Ot Temizliği',
      supportCount:25,
      description:'Yürüyüş yollarının kenarındaki ot ...',
      metaInfo:'Çevre . 31.07.2026 - 04.08.2026',
      status:'Çözüldü',
      priority:'Düşük'
    },
    {
      title: 'Hasarlı Bank',
      supportCount: 20,
      description: 'Kampüs bahçesindeki bankın otur ...',
      metaInfo: 'Çevre . 31.07.2026',
      status: 'Beklemede',
      priority: 'Düşük'
    }
  ];

  // Modaldan seçimler gelince bu fonksiyon çalışacak
  updateFilters(newFilters: any) {
    this.currentFilters = newFilters;
  }

}
