import { Injectable, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import {
  getFirestore,
  collection,
  doc,
  setDoc,
  serverTimestamp
} from 'firebase/firestore';
import { getDatabase, ref, set, get } from 'firebase/database';

/**
 * @description Şikayet fotoğraflarının yüklenmesi ve okunmasından sorumlu servistir.
 *
 * Veriler iki ayrı yerde tutulur:
 * - Firestore `medias/{mediaId}`  → fotoğrafın bilgileri (sahibi, tarihi, türü, durumu)
 * - Realtime Database `medias/{mediaId}/data` → fotoğrafın kendisi (base64 metin)
 *
 * Bu ayrımın sebebi: Firestore'da doküman başına 1 MB sınırı vardır ve şikayet
 * listesi çekilirken fotoğrafların da inmesi listeyi yavaşlatır. Fotoğraf ayrı
 * yerde tutulunca liste hafif kalır, fotoğraf yalnızca detay açıldığında indirilir.
 */
@Injectable({
  providedIn: 'root'
})
export class MediaService {

  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  private readonly db = getFirestore();
  private readonly rtdb = getDatabase();

  /** @description Küçültme sonrası fotoğrafın en fazla genişliği (piksel). */
  private static readonly MAX_WIDTH = 1024;

  /** @description JPEG sıkıştırma kalitesi (0-1 arası). */
  private static readonly QUALITY = 0.7;

  /**
   * @description Seçilen fotoğrafı tarayıcıda küçültüp base64 metne çevirir.
   *
   * Telefon fotoğrafları 3-5 MB boyutundadır ve base64'e çevrildiğinde
   * yaklaşık üçte bir oranında daha da büyür. Küçültme yapılmazsa
   * veritabanı kotası kısa sürede dolar ve yükleme çok yavaş olur.
   *
   * @param {File} file - Kullanıcının seçtiği dosya
   * @returns {Promise<string>} Küçültülmüş fotoğrafın base64 karşılığı
   */
  resizeImage(file: File): Promise<string> {
    return new Promise((resolve, reject) => {

      const reader = new FileReader();

      reader.onload = (event: any) => {
        const img = new Image();

        img.onload = () => {
          let width = img.width;
          let height = img.height;

          // Oranı bozmadan genişliği sınırla
          if (width > MediaService.MAX_WIDTH) {
            height = Math.round((height * MediaService.MAX_WIDTH) / width);
            width = MediaService.MAX_WIDTH;
          }

          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext('2d');

          if (!ctx) {
            reject(new Error('Fotoğraf işlenemedi.'));
            return;
          }

                    // JPEG şeffaflığı desteklemez; şeffaf alanlar siyaha döner.
          // Bu yüzden çizimden önce zemini beyaza boyuyoruz.
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, width, height);

          ctx.drawImage(img, 0, 0, width, height);

          resolve(canvas.toDataURL('image/jpeg', MediaService.QUALITY));
        };

        img.onerror = () => reject(new Error('Fotoğraf okunamadı.'));
        img.src = event.target.result;
      };

      reader.onerror = () => reject(new Error('Dosya okunamadı.'));
      reader.readAsDataURL(file);
    });
  }

  /**
   * @description Küçültülmüş fotoğrafı veritabanına kaydeder.
   *
   * İşlem üç aşamalıdır:
   * 1. Firestore'a bilgi kaydı açılır (durum: yükleniyor)
   * 2. Realtime Database'e fotoğraf verisi yazılır
   * 3. Firestore kaydı hazır olarak işaretlenir
   *
   * Bu sıralama sayesinde, yükleme yarıda kalırsa kayıt "yükleniyor"
   * durumunda kalır ve sonradan tespit edilip temizlenebilir.
   *
   * @param {string} base64Data - Küçültülmüş fotoğrafın base64 hali
   * @param {string} userId - Fotoğrafı yükleyen kullanıcının kimliği
   * @returns {Promise<string>} Oluşturulan medya kimliği
   */
  async uploadImage(base64Data: string, userId: string): Promise<string> {
    if (!this.isBrowser) {
      throw new Error('Fotoğraf yükleme yalnızca tarayıcıda yapılabilir.');
    }

    // Firestore'un ürettiği benzersiz kimliği kullanıyoruz
    const mediaId = doc(collection(this.db, 'medias')).id;
    const metaRef = doc(this.db, 'medias', mediaId);

    // 1. Bilgi kaydını aç
    await setDoc(metaRef, {
      uid: userId,
      createdAt: serverTimestamp(),
      mimeType: 'image/jpeg',
      status: 'uploading'
    });

    // 2. Fotoğraf verisini yaz
    await set(ref(this.rtdb, `medias/${mediaId}`), {
      data: base64Data
    });

    // 3. Hazır olarak işaretle
    await setDoc(metaRef, { status: 'ready' }, { merge: true });

    return mediaId;
  }

  /**
   * @description Birden fazla fotoğrafı sırayla yükler.
   *
   * @param {string[]} base64List - Küçültülmüş fotoğrafların listesi
   * @param {string} userId - Yükleyen kullanıcının kimliği
   * @returns {Promise<string[]>} Oluşturulan medya kimlikleri
   */
  async uploadImages(base64List: string[], userId: string): Promise<string[]> {
    const mediaIds: string[] = [];

    for (const base64 of base64List) {
      const id = await this.uploadImage(base64, userId);
      mediaIds.push(id);
    }

    return mediaIds;
  }

  /**
   * @description Bir fotoğrafın verisini Realtime Database'den okur.
   *
   * @param {string} mediaId - Medya kimliği
   * @returns {Promise<string | null>} Fotoğrafın base64 hali, bulunamazsa null
   */
  async getImageData(mediaId: string): Promise<string | null> {
    if (!this.isBrowser) return null;

    const snapshot = await get(ref(this.rtdb, `medias/${mediaId}/data`));

    return snapshot.exists() ? snapshot.val() : null;
  }

  /**
   * @description Birden fazla fotoğrafı okur.
   *
   * @param {string[]} mediaIds - Medya kimlikleri
   * @returns {Promise<string[]>} Okunabilen fotoğrafların base64 listesi
   */
  async getImages(mediaIds: string[]): Promise<string[]> {
    if (!this.isBrowser || !mediaIds?.length) return [];

    const results = await Promise.all(
      mediaIds.map(id => this.getImageData(id))
    );

    return results.filter((data): data is string => data !== null);
  }
}