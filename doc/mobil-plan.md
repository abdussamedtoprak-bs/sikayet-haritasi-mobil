# Mobil Dönüşüm Planı

Bu belge, Şikayet Haritası web uygulamasının Android uygulamasına
dönüştürülme sürecini tanımlar.

## Karar özeti

| Konu | Karar | Gerekçe |
|---|---|---|
| Yaklaşım | Capacitor + saf Angular | Mevcut Angular kodunun tamamı korunur, sonunda gerçek bir APK çıkar. Ionic eklemek bütün şablon ve CSS dosyalarının yeniden yazılmasını gerektirirdi. |
| Platform | Yalnızca Android | iOS derlemesi Mac ve Xcode gerektirir. Ders teslimi için Android yeterlidir. |
| Depo | Ayrı GitHub deposu | Web projesinin deposu takım tarafından kullanılmaya devam ediyor. Ayrı depo, iki çalışmanın birbirine karışmasını engeller. |
| Kapsam | Native eklentiler + push bildirim + arayüz revizyonu | Dersin beklediği native yetenekleri kapsar. |

## Başlangıç durumu

Proje web sürümünün birebir kopyasıdır:

- Angular 22, standalone bileşenler, signal tabanlı durum yönetimi
- Sunucu tarafı render (SSR) açık — Express sunucusu ile
- Firebase: Authentication (Google ile giriş), Firestore, Realtime Database
- Leaflet haritası, FontAwesome ikonları
- 9 sayfa, 15 bileşen, 7 servis

Mobilde sorun çıkaracak noktalar:

| # | Konu | Neden sorun |
|---|---|---|
| 1 | SSR açık | Capacitor statik bir build klasörü bekler, Express sunucusu çalıştıramaz |
| 2 | `signInWithPopup` | WebView içinde açılır pencere çalışmaz, giriş hiç olmaz |
| 3 | `navigator.geolocation` | Android izin akışı yönetilmediği için sessizce başarısız olur |
| 4 | `<input type="file">` | Kamerayı doğrudan açmaz, kullanıcıyı dosya gezginine düşürür |
| 5 | `localStorage` | WebView depolaması sistem tarafından temizlenebilir |
| 6 | `navigator.onLine` | Mobil ağ geçişlerini (wifi ↔ veri) güvenilir bildirmez |
| 7 | Bildirimler | Yalnızca uygulama açıkken Firestore dinleyicisinden gelir |
| 8 | Arayüz | Projede tek bir media query var; çentik, alt menü, dokunma hedefi yok |

---

## Aşamalar

### Aşama 0 — Geliştirme ortamı ✅

Android Studio kurulumu, SDK Manager üzerinden Platform-Tools ve bir Android
API seviyesi. `JAVA_HOME` ve `ANDROID_HOME` ortam değişkenlerinin tanımlanması.

JDK 21 ve Node.js makinede hazır.

### Aşama 1 — Depo ayrımı ✅

Mobil klasörün git bağlantısı web deposundan koparıldı:

- `origin` → `abdussamedtoprak-bs/sikayet-haritasi-mobil`
- `upstream` → web deposu, push adresi kazara gönderime karşı geçersiz bırakıldı
- `master` dalı `develop` ile eşitlendi (fast-forward, geçmiş korundu)
- `package.json` adı ve README güncellendi

Web projesinin 186 commit'lik geçmişi korunmuştur.

### Aşama 2 — SSR sökümü ✅

Silinecek dosyalar:

- `src/server.ts`
- `src/main.server.ts`
- `src/app/app.config.server.ts`
- `src/app/app.routes.server.ts`

Değişecekler:

- `angular.json` → `server`, `ssr`, `outputMode` alanları kaldırılır
- `package.json` → `@angular/ssr`, `@angular/platform-server`, `express`,
  `@types/express` bağımlılıkları ve `serve:ssr:*` betiği kaldırılır
- `app.config.ts` → `provideClientHydration()` çıkarılır

Çıktı `dist/sikayet-haritasi/browser` altında statik dosyalar olur.
Capacitor'ın okuyabileceği biçim budur.

Servislerdeki `isPlatformBrowser` kontrolleri bu aşamada korunur; artık
gereksizdirler ama zarar vermezler ve ileride web sürümüyle kod paylaşımı
kolaylaşır.

**Uygulama sonucu:** Çıktı `dist/sikayet-haritasi/browser` altında oluşuyor,
sunucu dosyası üretilmiyor. Uygulama tarayıcıda sorunsuz açıldı, konsolda hata yok.

Planda olmayan iki ek değişiklik gerekti:

- `@angular/fire` kaldırıldı. Projede hiç kullanılmıyordu — tüm Firebase
  erişimi ham SDK ile yapılıyor — ve Angular 20 istediği için Angular 22 ile
  kurulumu engelliyordu. Eski kilit dosyası bu çakışmayı gizliyormuş.
- Üretim boyut limitleri yükseltildi (ilk paket 2MB uyarı / 4MB hata, bileşen
  CSS'i 12kB / 24kB). Varsayılan limitler web'de ağdan indirme süresi içindir;
  mobilde paket APK içinde gelir, cihazın diskinden açılır.

### Aşama 3 — Capacitor kabuğu ✅

```
@capacitor/core  @capacitor/cli  @capacitor/android
```

`capacitor.config.ts`:

- `appId`: `tr.edu.bingol.sikayetharitasi`
- `appName`: Şikayet Haritası
- `webDir`: `dist/sikayet-haritasi/browser`

`npx cap add android` ile Android projesi oluşturulur.
`AndroidManifest.xml` izinleri: `INTERNET`, `ACCESS_FINE_LOCATION`,
`ACCESS_COARSE_LOCATION`, `CAMERA`, `READ_MEDIA_IMAGES`.

Aşama sonunda uygulama cihazda açılmalı ve giriş ekranı görünmelidir
(giriş henüz çalışmayacaktır — Aşama 5).

**Uygulama sonucu:** Capacitor 8.5.3 kuruldu (`@capacitor/core`, `@capacitor/cli`,
`@capacitor/android`), `npx cap add android` ile `android/` klasörü oluşturuldu.

- `capacitor.config.ts` → appId `tr.edu.bingol.sikayetharitasi`,
  appName "Şikayet Haritası", webDir `dist/sikayet-haritasi/browser`
- Manifest izinleri eklendi: `INTERNET`, `ACCESS_NETWORK_STATE`,
  `ACCESS_COARSE_LOCATION`, `ACCESS_FINE_LOCATION`, `CAMERA`,
  `READ_MEDIA_IMAGES`, `READ_EXTERNAL_STORAGE` (maxSdk 32).
  GPS ve kamera `required="false"` işaretlendi — donanımı olmayan cihazlar da
  uygulamayı kurabilsin, konum alınamazsa haritadan seçme akışı zaten var.
- `android/.gitignore` içinde imzalama anahtarları (`*.jks`, `*.keystore`)
  yorum satırından çıkarıldı. Aşama 9'da üretilecek anahtar kazara depoya
  girerse uygulamanın imzası ele geçer; bu yüzden şimdiden kapatıldı.
- `npm run build:android` (derle + Android'e kopyala) ve `npm run open:android`
  betikleri eklendi.
- `android/local.properties` SDK yolunu gösterir, depoya girmez.

Kurulu SDK'da yalnızca API 37 platformu vardı; Gradle eksik olan Platform 36 ve
Build-Tools 35 bileşenlerini ilk derlemede kendisi indirdi.

### Aşama 4 — Native eklentiler

| Eklenti | Dokunulacak yer |
|---|---|
| `@capacitor/geolocation` | `components/ana-sayfa/konum-butonu` |
| `@capacitor/camera` | `components/ana-sayfa/sorun-bildir-paneli`, `services/media.service` |
| `@capacitor/network` | `services/connection.service` |
| `@capacitor/preferences` | `services/theme.service` |

Dikkat edilecek noktalar:

- Kamera eklentisi `File` değil URI veya base64 döndürür.
  `MediaService.resizeImage()` girdi tipi buna göre değişir.
- `Preferences` API'si asenkrondur. `ThemeService` şu an senkron
  `localStorage` kullanıyor; tema okuma akışı yeniden kurgulanır.
- Konum izni reddedilirse mevcut "haritadan seç" yönlendirmesi korunur.

### Aşama 5 — Google girişinin native'e taşınması

En kritik aşama. `signInWithPopup` WebView'de çalışmadığı için
`@capacitor-firebase/authentication` ile native Google Sign-In akışına
geçilir, dönen kimlik bilgisi `signInWithCredential` ile Firebase'e verilir.

Gereken hazırlıklar:

1. Firebase Console'da Android uygulaması kaydı
2. İmzalama anahtarının **SHA-1** parmak izinin Console'a eklenmesi
3. `google-services.json` dosyasının `android/app/` altına konması

`AuthService.signInWithGoogle()` platform ayrımıyla yazılır: native tarafta
eklenti, web tarafta mevcut popup akışı çalışır. `allowedEmailDomain`
(`bingol.edu.tr`) kısıtı her iki yolda da korunur.

### Aşama 6 — Uygulama kimliği

- `@capacitor/assets` ile `public/logo.png` üzerinden ikon ve açılış ekranı üretimi
- `@capacitor/status-bar` — durum çubuğu renginin karanlık/aydınlık temayla uyumu
- `@capacitor/splash-screen` — açılış ekranının kontrollü kapatılması
- Çentikli ekranlar için `env(safe-area-inset-*)` CSS desteği

### Aşama 7 — Mobil arayüz revizyonu

En uzun aşama. Sayfa sayfa ilerlenir.

- Alt gezinme çubuğu: Ana sayfa / Şikayetler / Bildirimler / Profil
- Yan menünün alt çubukla ilişkisinin yeniden kurulması
- Dokunma hedeflerinin en az 44×44 piksele çıkarılması
- `:hover` davranışına bağımlı etkileşimlerin kaldırılması
- Harita ve sorun bildirme panelinin tam ekran telefon yerleşimine uyarlanması
- Geri tuşu davranışı (`@capacitor/app` ile donanım geri tuşunun yönetimi)

### Aşama 8 — Push bildirim

Mevcut bildirim akışı Firestore `onSnapshot` dinleyicisine dayanır ve
yalnızca uygulama açıkken çalışır.

**Karar noktası —** bu aşamaya gelindiğinde iki yoldan biri seçilecektir:

| Yol | Gereken | Sonuç |
|---|---|---|
| Gerçek push (FCM) | Cloud Functions → Firebase **Blaze planı** (kredi kartı) | Uygulama kapalıyken de bildirim düşer |
| Yerel bildirim | `@capacitor/local-notifications`, ek maliyet yok | Uygulama açık veya arka plandayken bildirim düşer |

### Aşama 9 — APK

Önce debug APK ile cihaz testi, ardından imzalama anahtarı üretilip
imzalı release APK alınır. Kurulum ve çalıştırma adımları README'ye eklenir.

---

## Sıralama

Aşama 1 → 2 → 3 zorunlu sırayla ilerler; Capacitor, SSR sökülmeden
kurulamaz. Aşama 4–7 arası esnektir. Aşama 5 kendi başına test
edilebilir olduğu için erken ele alınması önerilir — giriş çalışmadan
diğer sayfalar cihazda denenemez.
