export interface User {
  id: string;
  adSoyad: string;
  email: string; // Sadece @bingol.edu.tr uzantılı olacak
  rol: 'ogrenci' | 'yonetici';
  createdAt: Date;
}