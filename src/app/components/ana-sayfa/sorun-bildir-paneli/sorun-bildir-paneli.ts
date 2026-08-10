import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-sorun-bildirme-paneli',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sorun-bildir-paneli.html',
  styleUrl: './sorun-bildir-paneli.css',
})
export class SorunBildirmePaneli {
  
  reportData = {
    konum: 'Mevcut konumunuz',
    kategori: 'cevre',
    aciklama: ''
  };

  categories = [
    { id: 'cevre', name: 'Çevre', icon: '🍃' },
    { id: 'aydinlatma', name: 'Aydınlatma', icon: '💡' },
    { id: 'cop', name: 'Çöp', icon: '🗑️' },
    { id: 'diger', name: 'Diğer', icon: '⋯' }
  ];

  fotograflar: string[] = [];

  kategoriSec(id: string) {
    this.reportData.kategori = id;
  }

  fotografSec(event: any) {
    const files = event.target.files;
    if (files) {
      for (let i = 0; i < files.length; i++) {
        if (this.fotograflar.length >= 3) break; // Maksimum 3 fotoğraf sınırı
        
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.fotograflar.push(e.target.result);
        };
        reader.readAsDataURL(files[i]);
      }
    }
  }

  fotografSil(index: number) {
    this.fotograflar.splice(index, 1);
  }

  gonder() {
    console.log('Gönderilen Veriler:', {
      ...this.reportData,
      fotograflar: this.fotograflar
    });
    alert('Sorunuz başarıyla bildirildi!');
  }
}