import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-konum-butonu',
  standalone: true,
  imports: [],
  templateUrl: './konum-butonu.html',
  styleUrl: './konum-butonu.css'
})
export class KonumButonu {

  @Output() tiklandi = new EventEmitter<void>();

  butonaBas() {
    this.tiklandi.emit();
  }

}