---
id: f-03
tur: ders
baslik: "Android statik analiz: JADX ve MobSF ile kodu okumak"
sure: 8
hedefler:
  - JADX ile bir APK'yı okunur koda çevirip gömülü sırları aramak
  - MobSF raporunu OWASP MASVS başlıklarıyla yorumlamak
gorseller:
  - id: f-03-a
    tur: ai
    karakter: leman
    alt: "Lehimci Leman büyüteçli gözlüğüyle açılmış bir saat mekanizmasına benzeyen uygulamanın dişlileri arasına bantlanmış minik altın anahtarı buluyor"
    prompt: "A smartphone app drawn as an opened pocket-watch mechanism lying on a workbench, its gears and springs glowing faintly green. The villain leans in close with her magnifier goggles down, tweezers in one hand, triumphantly lifting a tiny golden key that had been taped between two gears, the key tag showing an abstract symbol. Her tiny drone shines a spotlight on the hidden spot."
  - id: f-03-b
    tur: ekran
    alt: "MobSF'in kasıtlı olarak zafiyetli DIVA uygulaması için ürettiği statik analiz özet ekranı; güvenlik puanı ve Manifest bulguları işaretli"
    nasil: "Laboratuvar VM'inde MobSF'i Docker ile çalıştır, DIVA APK'sını yükle. Özet sayfasında güvenlik puanını ve 'Manifest Analysis' bölümünü kehribar (#C9953B) dikdörtgenle işaretle. Yalnızca rapor alanını kırp; tarayıcı sekmeleri, kullanıcı adı ve yerel dosya yolları görünmesin, gerekirse bulanıklaştır. 1600×900, koyu tema."
---

# Android statik analiz: JADX ve MobSF ile kodu okumak

> Statik analiz (static analysis), uygulamayı **çalıştırmadan** okumaktır. Geliştiricinin unuttuğu her şey kodda durur.
> 🔧 **Devre 3:** Leman'ın uygulamasında bir anahtar saklı. Telefonda değil, kodun içinde.

![Lehimci Leman büyüteçli gözlüğüyle açılmış bir saat mekanizmasına benzeyen uygulamanın dişlileri arasına bantlanmış minik altın anahtarı buluyor](../../gorseller/f-03-a.webp)

## Ölçüt: OWASP MASVS ve MASTG

**MASVS** (Mobile Application Security Verification Standard) "ne olmalı?" der: depolama, kripto, ağ, kod kalitesi…
**MASTG** (Mobile Application Security Testing Guide) "nasıl test edilir?" sorusunu cevaplar. Bulgunu bu başlıklara bağla.

## JADX: dex'ten okunur koda

```bash
jadx -d diva-kod/ diva-beta.apk
grep -rniE "api_?key|secret|password|token|http://" diva-kod/
```

Aranacaklar:

- Koda gömülü (hardcoded) anahtar, parola, URL
- Zayıf kripto: `MD5`, `DES`, `AES/ECB`, sabit IV
- `Log.d(...)` ile hassas veri yazmak
- `WebView` içinde `setJavaScriptEnabled(true)` + `addJavascriptInterface`

## MobSF: otomatik ilk tarama

```bash
docker run -it --rm -p 8000:8000 opensecurity/mobile-security-framework-mobsf:latest
```

Tarayıcıda `http://localhost:8000` aç, APK'yı yükle. Rapor Manifest ayarlarını, izinleri, gömülü sırları ve sertifikayı listeler.

![MobSF'in kasıtlı olarak zafiyetli DIVA uygulaması için ürettiği statik analiz özet ekranı; güvenlik puanı ve Manifest bulguları işaretli](../../gorseller/f-03-b.webp)

**Dikkat:** MobSF bir başlangıçtır. Her bulguyu JADX'te kendi gözünle doğrula; yanlış pozitifler çoktur.

## Bulgu nasıl yazılır?

| Alan | Örnek |
|---|---|
| Başlık | Koda gömülü bulut API anahtarı |
| Kanıt | Sınıf adı + satır, `grep` çıktısı |
| Eşleşme | MASVS-CRYPTO (anahtar yönetimi) |
| Öneri | Anahtarı iptal et, sunucu tarafı kimlik doğrulamaya geç |

## Kural

Yalnızca kasıtlı olarak zafiyetli eğitim uygulamaları (DIVA, InsecureBankv2, MASTG test uygulamaları) ya da **kendi** uygulaman.
Başkasının uygulamasını tersine çevirip yayımlamak lisans ve yasa sorunudur.

## 🧪 Dene (5 dk)

DIVA'yı JADX ile aç. "Hardcoding Issues – Part 1" ekranının sınıfını bul ve kodda gömülü değeri tespit et.
Ardından bunu MASVS'nin hangi başlığına (STORAGE, CRYPTO, CODE…) bağlayacağını yaz.

## ✅ Akılda kalsın

- APK'daki her sabit, herkesin okuyabileceği bir sabittir.
- MobSF hızlı başlatır, JADX doğrular.
- Bulgular MASVS başlıklarıyla raporlanır.
