---
id: f-06
tur: ders
baslik: "iOS güvenliğine giriş: Keychain, entitlements ve sandbox"
sure: 7
hedefler:
  - iOS'un kod imzalama, sandbox ve Keychain katmanlarını açıklamak
  - Info.plist ve entitlements içindeki riskli ayarları tanımak
gorseller:
  - id: f-06-b
    tur: ai
    alt: "İç içe surlarla çevrili bir kale gibi telefon: dış sur, iç sur ve en ortada anahtarların saklandığı kasa"
    prompt: "A smartphone drawn as a castle with concentric walls: an outer wall with a gate, an inner wall with guards, and at the very center a small vault where keys are stored, glowing softly."
---

# iOS güvenliğine giriş: Keychain, entitlements ve sandbox

> iOS yüksek duvarlı bir bahçedir. Ama bahçedeki her evin penceresini **geliştirici** kapatır.
> 🔧 **Devre 6:** Leman'ın kilit uygulamasının iPhone sürümü de var. Duvar sağlam; pencere açık mı?

::cizgi[f-06-sahne]

## Katmanlar

![İç içe surlarla çevrili bir kale gibi telefon: dış sur, iç sur ve en ortada anahtarların saklandığı kasa](../../gorseller/f-06-b.webp)

| Katman | Ne yapar? |
|---|---|
| **Kod imzalama** (code signing) | Yalnızca imzalı kod çalışır |
| **Sandbox** | Her uygulama kendi kapsayıcısında |
| **Data Protection** | Dosyalar cihaz kilitliyken şifreli |
| **Keychain** | Parola ve anahtarlar için şifreli kasa |
| **Secure Enclave** | Biyometri ve anahtarlar ayrı bir çipte |

## Entitlements: yetki beyanları

Entitlements, uygulamanın imzasına gömülü **yetki listesidir**: Keychain paylaşım grubu, bildirimler, App Groups, HealthKit…
Gereğinden fazla entitlement, gereğinden fazla izin gibidir.

## Info.plist kırmızı bayrakları

```xml
<key>NSAppTransportSecurity</key>
<dict>
  <key>NSAllowsArbitraryLoads</key><true/>    <!-- ATS kapalı: şifresiz HTTP serbest -->
</dict>
<key>NSCameraUsageDescription</key>
<string>Kapıyı açmak için</string>             <!-- kilit uygulaması neden kamera istiyor? -->
```

- **ATS** (App Transport Security) varsayılan olarak HTTPS ister; kapatmak bir gerekçe ister.
- Keychain kaydında erişim sınıfı önemlidir: `kSecAttrAccessibleWhenUnlockedThisDeviceOnly` gibi sıkı bir sınıf, kaydı yedeklerle başka cihaza taşımaz.

## İnceleme

Bir IPA da bir zip dosyasıdır; içinde `Info.plist`, çalıştırılabilir dosya ve imza bulunur. Kendi derlediğin uygulamanın
yetkilerini macOS'ta şöyle görürsün:

```bash
codesign -d --entitlements - KampusKilit.app
```

## Jailbreak

Jailbreak duvarları kaldırır; test için yalnızca kulübün ayrı test cihazında yapılır, kişisel telefonda asla.

## 🧪 Dene (3 dk)

iPhone'un varsa: **Ayarlar → Gizlilik ve Güvenlik → Uygulama Gizlilik Raporu**'nu aç ve hangi uygulamanın konum, kamera
veya mikrofona en son ne zaman eriştiğine bak. Yoksa: yukarıdaki Info.plist parçasındaki iki sorunu düzelt.

## ✅ Akılda kalsın

- iOS'ta duvarı imza ve sandbox örer, pencereyi geliştirici kapatır.
- Sırlar Keychain'de, sıkı erişim sınıfıyla saklanır.
- `NSAllowsArbitraryLoads` ve gereksiz entitlement kırmızı bayraktır.
