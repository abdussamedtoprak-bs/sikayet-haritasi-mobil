/**
 * @description Kullanıcıya gönderilen bildirimleri temsil eden veri modelidir.
 * Şikayet durumu güncellemeleri, çözüm bildirimleri ve yakın şikayet uyarıları
 * bu model üzerinden yönetilir.
 */
export interface Bildirim {
  /** @description Bildirimin benzersiz kimlik numarası */
  id?: string;
  /** @description Bildirimin türü — güncelleme, çözüldü, yakın şikayet veya acil */
  tip: 'guncelleme' | 'cozuldu' | 'yakin' | 'acil'| 'yeni' | 'destek' | 'uyari';
  /** @description Bildirim başlığı */
  baslik: string;
  /** @description Bildirimin detay mesajı */
  mesaj: string;
  /** @description Bildirimin oluşturulma zamanı (örn: "2 saat önce") */
  zaman: string;
  /**@description firebase timestamp kayıt zamanını net tutmak için*/
  createdAt?:any;
  /** @description Bildirimin okunup okunmadığını belirtir */
  okundu: boolean;
  /** @description Bildirime tıklandığında yönlendirilecek sayfa yolu */
  yonlendirme: string;
  /** bu bildirim tüm yöneticilere mi gidecek yoksa sadece spesifik bir kullanıcıya mı gidecek*/
  targetRole?:'admin'|'student';
  userId?:string;
}