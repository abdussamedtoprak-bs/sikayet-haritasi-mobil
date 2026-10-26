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
| Native kabuk | Capacitor 8 — Android |
| Veritabanı | Firebase Firestore + Realtime Database |
| Kimlik | Firebase Authentication (Google ile giriş) |
| Harita | Leaflet + OpenStreetMap |

## Dönüşüm durumu

| Aşama | İş | Durum |
|---|---|---|
| 0 | Geliştirme ortamı (Android Studio, SDK) | ✅ |
| 1 | Depo ayrımı | ✅ |
| 2 | SSR sökümü, statik build | ✅ |
| 3 | Capacitor kabuğu + Android platformu | ✅ |
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

### Tarayıcı

```bash
npm install
npm start
```

Uygulama `http://localhost:4200/` adresinde açılır.

### Android

Web çıktısını derleyip Android projesine kopyalar:

```bash
npm run build:android
```

Android Studio'da açar:

```bash
npm run open:android
```

Komut satırından debug APK alır:

```bash
cd android
./gradlew assembleDebug
```

APK şurada oluşur: `android/app/build/outputs/apk/debug/app-debug.apk`

> `android/local.properties` dosyası SDK yolunu tutar ve depoya girmez.
> Android Studio projeyi ilk açışında bu dosyayı kendisi oluşturur; elle
> oluşturmak gerekirse içeriği tek satırdır:
> `sdk.dir=C:/Users/<kullanıcı>/AppData/Local/Android/Sdk`

## Testler

```bash
npm test
```

> Not: Test takımı şu an derlenmiyor. Angular CLI'ın otomatik ürettiği spec
> dosyaları gerçekte var olmayan sınıf adlarını import ediyor (`Ayarlar`
> yerine `AyarlarComponent` gibi). Bu sorun web sürümünden devralınmıştır ve
> Aşama 7'de bileşenler elden geçerken giderilecektir.

## Depo yapısı

Bu depoda iki uzak bağlantı tanımlıdır:

- `origin` → bu depo (mobil çalışma buraya gider)
- `upstream` → web deposu, **yalnızca okuma**. Web tarafındaki değişiklikleri
  almak için `git fetch upstream` kullanılabilir. Kazara gönderim yapılmasın
  diye push adresi bilerek geçersiz bırakılmıştır.

Çalışma dalı `develop`'tır.
