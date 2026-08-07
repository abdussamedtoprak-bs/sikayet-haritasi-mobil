import { Component,Input,Output,EventEmitter} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-complaint-detail-sheet',
  imports: [CommonModule],
  templateUrl: './complaint-detail-sheet.html',
  styleUrl: './complaint-detail-sheet.css',
})
export class ComplaintDetailSheet {

  //Tıklanan şikayetin tüm detaylarını bu input üzerinden alacağız
  @Input() complaint: any;

  //kapatma işlemi için bir event(olay)fırlatıcı tanımlıyoruz
  @Output() close=new EventEmitter<void>();

  closeSheet(){
    this.close.emit(); // ana sayfaya "kapat" sinyali gönderir  
  }
}
