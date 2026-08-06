import { Component ,Input} from '@angular/core';

@Component({
  selector: 'app-complaint-card',
  imports: [],
  templateUrl: './complaint-card.html',
  styleUrl: './complaint-card.css',
})
export class ComplaintCard {
  // @Input sayesinde bu kart, parent (complaints) sayfasından veri alabilir hale geldi
  @Input() complaint: any;
}
