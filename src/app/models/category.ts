/**
 * @description Şikayet kategorisini temsil eder.
 */
export interface SikayetKategorisi {

  /** @description Veritabanına yazılan değer. */
  id: string;

  /** @description Ekranda gösterilen ad. */
  name: string;

  /** @description Adın yanında gösterilen simge. */
  icon: string;
}

/**
 * @description Seçilebilir şikayet kategorileri.
 *
 * Tek kaynak burasıdır: hem şikayet bildirme paneli hem düzenleme formu
 * bu listeden beslenir. Yeni kategori eklemek için yalnızca bu dizi
 * güncellenir.
 */
export const SIKAYET_KATEGORILERI: SikayetKategorisi[] = [
  { id: 'cevre',      name: 'Çevre',      icon: '🍃' },
  { id: 'aydinlatma', name: 'Aydınlatma', icon: '💡' },
  { id: 'cop',        name: 'Çöp',        icon: '🗑️' },
  { id: 'diger',      name: 'Diğer',      icon: '⋯'  }
];

/**
 * @description Kategori kimliğinden ekranda gösterilecek adı bulur.
 *
 * @param {string | undefined} id - Kategori kimliği
 * @returns {string} Kategori adı, bulunamazsa 'Genel'
 */
export function kategoriAdi(id?: string): string {
  return SIKAYET_KATEGORILERI.find(kategori => kategori.id === id)?.name ?? 'Genel';
}