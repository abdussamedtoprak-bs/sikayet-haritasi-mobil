/**
 * @description Destek sayfasındaki Sıkça Sorulan Sorular (SSS) bölümünde
 * her bir soru-cevap çiftini temsil eden veri modelidir.
 */
export interface SSSItem {
  /** @description Sorunun benzersiz kimlik numarası */
  id: number;

  /** @description Sıkça sorulan sorunun metni */
  soru: string;

  /** @description Soruya verilen cevabın metni */
  cevap: string;

  /** @description Accordion yapısında sorunun açık/kapalı durumu */
  acik: boolean;
}