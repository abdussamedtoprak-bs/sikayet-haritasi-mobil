import type { CapacitorConfig } from '@capacitor/cli';

/**
 * Capacitor yapılandırması.
 *
 * webDir, Angular'ın ürettiği statik çıktıyı gösterir. Capacitor bu klasörü
 * olduğu gibi APK'nın içine kopyalar; uygulama açıldığında dosyalar ağdan
 * değil, cihazın kendi diskinden okunur.
 */
const config: CapacitorConfig = {
  appId: 'tr.edu.bingol.sikayetharitasi',
  appName: 'Şikayet Haritası',
  webDir: 'dist/sikayet-haritasi/browser',

  android: {
    // Karışık içerik (https sayfada http kaynak) kapalı kalsın.
    allowMixedContent: false
  }
};

export default config;
