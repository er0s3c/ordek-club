---
id: f-01
tur: ders
baslik: "Mobil güvenlik mimarisi: sandbox, izinler ve güvenli depolama"
sure: 7
hedefler:
  - Android ve iOS'ta uygulama yalıtımının (sandbox) nasıl çalıştığını açıklamak
  - Bir uygulamanın istediği izinlerin işleviyle uyumlu olup olmadığını değerlendirmek
gorseller:
  - id: f-01-a
    tur: ai
    karakter: leman
    alt: "Lehimci Leman, odaları ayrı ayrı parlayan dev bir telefon-apartmanının merdiveninde; bir odanın kapısını aralık tutan izin fişine havyasıyla dokunuyor"
    prompt: "A giant smartphone drawn as a tall apartment building at night, each floor a separate glowing room with its own sealed door, one small app living in each room. The villain stands on a rolling ladder outside one room whose door is propped open by an oversized permission slip marked with an abstract stamp symbol, and she peeks inside with her magnifier goggles down, her tiny drone hovering nearby holding a flashlight."
---

# Mobil güvenlik mimarisi: sandbox, izinler ve güvenli depolama

> Telefonundaki her uygulama kendi odasında yaşar. Kapıyı açan tek kişi sensin: **"İzin ver"** dediğinde.
> 🔧 **Devre 1:** Kampüsün akıllı kilit uygulaması kamera, rehber ve SMS izni istiyor. Bir kapı kilidi neden rehberini okusun?

![Lehimci Leman, odaları ayrı ayrı parlayan dev bir telefon-apartmanının merdiveninde; bir odanın kapısını aralık tutan izin fişine havyasıyla dokunuyor](../../gorseller/f-01-a.webp)

## Yalıtım: her uygulama ayrı oda

- **Android:** her uygulama kendi Linux kullanıcı kimliğiyle (UID) çalışır; dosyaları `/data/data/<paket>/` altında, başkası okuyamaz. SELinux ek bir duvar örer.
- **iOS:** her uygulama kendi kapsayıcısında (container) çalışır; yalnızca Apple'ın imzaladığı kod yüklenir.
- Yalıtım (sandbox), bir uygulama ele geçirilse bile **diğerlerine geçişi** zorlaştırır.

## İzinler: kapının anahtarı

| İzin türü | Örnek | Nasıl verilir? |
|---|---|---|
| Normal | İnternet | Kurulumda, sormadan |
| Tehlikeli (runtime) | Kamera, konum, mikrofon, rehber | Kullanıcıya sorulur, geri alınabilir |
| Özel | Erişilebilirlik, bildirim okuma | Ayarlar'dan elle |

Kural basit: **izin, işlevle uyumlu olmalı.** El feneri uygulaması rehber istiyorsa soru işareti büyüktür.

## Güvenli depolama

- Parola ve token düz dosyada değil, donanım destekli kasada durur: **Android Keystore**, **iOS Keychain**.
- Hassas veri cihaz yedeğine ve ekran görüntüsüne düşmemeli.
- Uygulama imzası, güncellemenin aynı geliştiriciden geldiğini kanıtlar.

## Kırılan yerler

Mimari sağlamdır; sorunları çoğu zaman uygulamalar yaratır: gereksiz izin, düz metin saklanan token,
dışa açık bırakılmış bileşen. Root/jailbreak ise duvarları bilerek yıkmaktır; bankacılık uygulamaları bu yüzden kontrol eder.

## 🧪 Dene (4 dk)

Kendi telefonunda **Ayarlar → Gizlilik → İzin yöneticisi** (iOS: **Ayarlar → Gizlilik ve Güvenlik**) bölümünü aç.
Kamera, mikrofon ve konum izni olan uygulamaları say. İşleviyle uyuşmayan birinin iznini kaldır.

## ✅ Akılda kalsın

- Her uygulama kendi sandbox'ında; duvarı delen çoğu zaman uygulamanın kendi hatasıdır.
- İzin işlevle uyumlu değilse kırmızı bayraktır.
- Sırlar Keystore/Keychain'de saklanır, düz dosyada değil.
