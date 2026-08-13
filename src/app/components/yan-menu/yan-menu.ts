import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-yan-menu',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './yan-menu.html',
  styleUrl: './yan-menu.css'
})
export class YanMenu {

  @Input() menuAcik: boolean = false;

}