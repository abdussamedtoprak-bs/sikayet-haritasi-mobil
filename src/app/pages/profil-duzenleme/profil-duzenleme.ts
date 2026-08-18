import { Component, ChangeDetectorRef, OnInit, inject } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormsModule } from '@angular/forms'; 

// Servisimizi ve modelimizi içeri aktarıyoruz
import { UserService, KullaniciProfili } from '../../services/user-service';

@Component({
  selector: 'app-profil-duzenleme',
  standalone: true, 
  imports: [CommonModule, FormsModule], 
  templateUrl: './profil-duzenleme.html', 
  styleUrls: ['./profil-duzenleme.css'] 
})
export class ProfilDuzenleme implements OnInit {
  
  // Servisi bileşenimize enjekte (dahil) ediyoruz
  private userService: UserService = inject(UserService);

  mevcutKullaniciId: string | null = null;
  secilenFotograf: string | ArrayBuffer | null = null;
  yuklenecekDosya: File | null = null; 

  kullanici: KullaniciProfili = {
    ad: '',
    soyad: '',
    eposta: '', 
    dogumTarihi: '',
    cinsiyet: 'Erkek',
    fotoUrl: ''
  };

  constructor(
    private location: Location,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // Servisteki getKullaniciDurumu() fonksiyonunu kullanarak veriyi çekiyoruz
    this.userService.getKullaniciDurumu().subscribe(async (user: any) => {
      if (user) {
        this.mevcutKullaniciId = user.uid;
        this.kullanici.eposta = user.email || ''; 
        this.kullanici.fotoUrl = user.photoURL || ''; 
        
        // Servisteki profilGetir() fonksiyonu ile Firestore verisini çekiyoruz
        const veri = await this.userService.profilGetir(user.uid);
        if (veri) {
          this.kullanici = { ...this.kullanici, ...veri }; 
          this.cdr.detectChanges(); 
        }
      }
    });
  }

  fotografSec(event: any) {
    const dosya = event.target.files[0]; 
    if (dosya) {
      this.yuklenecekDosya = dosya; 
      const okuyucu = new FileReader(); 
      okuyucu.onload = (e) => {
        this.secilenFotograf = e.target?.result as string; 
        this.cdr.detectChanges(); 
      };
      okuyucu.readAsDataURL(dosya); 
    }
  }

  async kaydet() {
    if (!this.mevcutKullaniciId) {
      alert('Lütfen önce Google ile giriş yapın.');
      return;
    }

    try {
      if (this.yuklenecekDosya) {
        // Servisteki fotografYukle() fonksiyonuna dosyayı gönderiyoruz
        const link = await this.userService.fotografYukle(this.mevcutKullaniciId, this.yuklenecekDosya);
        this.kullanici.fotoUrl = link; 
      }

      // Servisteki profilKaydet() fonksiyonu ile verileri yolluyoruz
      await this.userService.profilKaydet(this.mevcutKullaniciId, this.kullanici);

      alert('Profil bilgileriniz başarıyla kaydedildi!');
    } catch (error) {
      console.error('Kaydetme hatası:', error);
      alert('Kaydedilirken bir hata oluştu.');
    }
  }

  geriDon() {
    this.location.back();
  }
}