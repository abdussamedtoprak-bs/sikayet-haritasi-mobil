export const environment = {
  production: true,

  firebase: {
    apiKey: "AIzaSyCdGmSdbeJXYhtWOaKCshkx9bQAo0Tj3lg",
    authDomain: "sikayet-haritasi-29b30.firebaseapp.com",
    projectId: "sikayet-haritasi-29b30",
    storageBucket: "sikayet-haritasi-29b30.firebasestorage.app",
    messagingSenderId: "311604387531",
    appId: "1:311604387531:web:32c77a1a52ccb4fd09854e"
  },

  /**
   * Giriş yapabilecek e-posta domaini.
   * null  → kısıt yok (demo/sunum)
   * 'bingol.edu.tr' → sadece kurumsal hesaplar
   */
  allowedEmailDomain: 'bingol.edu.tr' as string | null
};