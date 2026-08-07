export interface Bildirim {
  id: number;
  tip: 'guncelleme' | 'cozuldu' | 'yakin' | 'acil';
  baslik: string;
  mesaj: string;
  zaman: string;
  okundu: boolean;
  yonlendirme: string;
}