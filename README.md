# Şikayet Haritası — Mobil

Bingöl Üniversitesi kampüsündeki sorunların harita üzerinden bildirildiği
uygulamanın **Android sürümü**.

Proje, aynı uygulamanın web sürümünden türetilmiştir. Angular kodu ortaktır;
üzerine [Capacitor](https://capacitorjs.com/) kabuğu geçirilerek native bir
Android uygulamasına dönüştürülmektedir.

- Web sürümü: https://github.com/minesalbas2598/sikayet-haritasi
- Bu depo: mobil dönüşüm çalışması

## Teknoloji

| Katman | Kullanılan |
|---|---|
| Arayüz | Angular 22 (standalone bileşenler, signal tabanlı durum) |
| Native kabuk | Capacitor 7 — Android |
| Veritabanı | Firebase Firestore + Realtime Database |
| Kimlik | Firebase Authentication (Google ile giriş) |
| Harita | Leaflet + OpenStreetMap |

## Dönüşüm durumu

| Aşama | İş | Durum |
|---|---|---|
| 0 | Geliştirme ortamı (Android Studio, SDK) | ⏳ |
| 1 | Depo ayrımı | ✅ |
| 2 | SSR sökümü, statik build | ⏳ |
| 3 | Capacitor kabuğu + Android platformu | ⏳ |
| 4 | Native eklentiler (konum, kamera, ağ, depolama) | ⏳ |
| 5 | Google girişinin native'e taşınması | ⏳ |
| 6 | Uygulama ikonu, açılış ekranı, tema | ⏳ |
| 7 | Mobil arayüz revizyonu | ⏳ |
| 8 | Push bildirim | ⏳ |
| 9 | İmzalı APK | ⏳ |

Ayrıntılı plan: [doc/mobil-plan.md](doc/mobil-plan.md)

## Gereksinimler

- Node.js 20+
- JDK 21
- Android Studio (Android SDK + Platform-Tools)

## Geliştirme

Tarayıcıda çalıştırmak için:

```bash
npm install
npm start
```

Uygulama `http://localhost:4200/` adresinde açılır.

Android tarafı Aşama 3'te kurulacaktır; komutlar o aşamada bu belgeye eklenecektir.

## Testler

```bash
npm test
```

## Depo yapısı

Bu depoda iki uzak bağlantı tanımlıdır:

- `origin` → bu depo (mobil çalışma buraya gider)
- `upstream` → web deposu, **yalnızca okuma**. Web tarafındaki değişiklikleri
  almak için `git fetch upstream` kullanılabilir. Kazara gönderim yapılmasın
  diye push adresi bilerek geçersiz bırakılmıştır.
