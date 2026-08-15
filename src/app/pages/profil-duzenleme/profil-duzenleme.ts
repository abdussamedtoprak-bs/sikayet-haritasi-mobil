import { Component, ChangeDetectorRef } from '@angular/core';
import { CommonModule, Location } from '@angular/common'; 

@Component({
  selector: 'app-profil-duzenleme',
  standalone: true, 
  imports: [CommonModule], 
  templateUrl: './profil-duzenleme.html', 
  styleUrls: ['./profil-duzenleme.css'] 
})
export class ProfilDuzenleme {
  
  secilenFotograf: string | ArrayBuffer | null = null;

  constructor(
    private location: Location,
    private cdr: ChangeDetectorRef
  ) {}

  geriDon() {
    this.location.back();
  }

  fotografSec(event: any) {
    const dosya = event.target.files[0]; 
    
    if (dosya) {
      const okuyucu = new FileReader(); 
      
      okuyucu.onload = (e) => {
        this.secilenFotograf = e.target?.result as string; 
        this.cdr.detectChanges(); // Arayüzün anında güncellenmesini sağlar 
      };
      
      okuyucu.readAsDataURL(dosya); 
    }
  }
}