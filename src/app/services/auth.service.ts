import { Injectable, signal } from '@angular/core';
import { User } from '../models/user';

interface MockUser extends User {
  sifre: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private currentUserSignal = signal<User | null>(null);
  currentUser = this.currentUserSignal.asReadonly();

  private mockUsers: MockUser[] = [
    {
      id: '1',
      adSoyad: 'Ahmet Yılmaz',
      email: 'ogrenci@bingol.edu.tr',
      sifre: '123456',
      rol: 'ogrenci',
      createdAt: new Date()
    },
    {
      id: '2',
      adSoyad: 'Mehmet Demir',
      email: 'yonetici@bingol.edu.tr',
      sifre: '123456',
      rol: 'yonetici',
      createdAt: new Date()
    }
  ];

  login(email: string, sifre: string): boolean {
    const kullanici = this.mockUsers.find(
      u => u.email === email && u.sifre === sifre
    );

    if (kullanici) {
      const { sifre: _, ...userWithoutPassword } = kullanici;
      this.currentUserSignal.set(userWithoutPassword);
      localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
      return true;
    }

    return false;
  }

  register(adSoyad: string, email: string, sifre: string): boolean {
    // Yeni kullanıcı objesi güncel modele göre oluşturuluyor
    const yeniKullanici: MockUser = {
      id: Math.random().toString(36).substring(2, 9),
      adSoyad: adSoyad,
      email: email,
      sifre: sifre, 
      rol: 'ogrenci', // Yeni kayıt olanlar varsayılan olarak öğrencidir
      createdAt: new Date()
    };
    
    this.mockUsers.push(yeniKullanici);
    
    const { sifre: _, ...userWithoutPassword } = yeniKullanici;
    this.currentUserSignal.set(userWithoutPassword);
    localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
    
    return true;
  }

  logout(): void {
    this.currentUserSignal.set(null);
    localStorage.removeItem('currentUser');
  }

  isLoggedIn(): boolean {
    return this.currentUserSignal() !== null;
  }

  getRole(): string | null {
    return this.currentUserSignal()?.rol ?? null;
  }

  restoreSession(): void {
    const stored = localStorage.getItem('currentUser');
    if (stored) {
      this.currentUserSignal.set(JSON.parse(stored));
    }
  }
}