import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { Complaints } from './pages/complaints/complaints';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet,Complaints],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('sikayet-haritasi');
}
