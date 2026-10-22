---
id: a-01
tur: ders
baslik: "Web laboratuvarı: isteği yakala, değiştir, tekrar gönder"
sure: 8
hedefler:
  - Intercepting proxy'nin ne işe yaradığını açıklamak
  - Burp Suite ile bir isteği yakalayıp değiştirerek tekrar göndermek
animasyonlar: [http-request]
gorseller:
  - id: a-01-a
    tur: ai
    karakter: jasmine
    alt: "Tek Tırnak Jasmine eski bir santral masasında, tarayıcıyla sunucu arasında uçan zarfları yakalayıp kalemiyle değiştiriyor"
    prompt: "An old telephone switchboard desk stands between a giant browser window on the left and a server tower on the right, with glowing envelopes flying between them along cables. The villain sits at the switchboard catching an envelope mid-flight, unsealing it with the tip of her fountain pen, altering one line inside and sending it on with a calm smile."
  - id: a-01-b
    tur: ekran
    alt: Burp Suite Proxy → HTTP history sekmesinde yerel Juice Shop'a giden istekler ve seçili bir isteğin ayrıntısı
    nasil: "Burp Suite Community'yi açın, Proxy → Open browser ile Burp tarayıcısında http://127.0.0.1:3000 (yerel Juice Shop) adresine gidin ve birkaç sayfa gezin. Proxy → HTTP history sekmesinde bir isteği seçin; alttaki Request/Response panelleri görünsün. Liste ile Request panelini kehribar (#C9953B) çerçeveyle işaretleyin. Çerez ve token değerlerini bulanıklaştırın."
---

# Web laboratuvarı: isteği yakala, değiştir, tekrar gönder

> Tarayıcı sana yalnızca sonucu gösterir. Jasmine ise **aradaki mektubu** okur — önce senin de okuyabilmen gerekiyor.
> 🗂️ **Çekmece 1:** Kampüs Portalı'nın laboratuvar kopyası hazır. Test iznin imzalı, kapsamın yazılı.

![Tek Tırnak Jasmine eski bir santral masasında, tarayıcıyla sunucu arasında uçan zarfları yakalayıp kalemiyle değiştiriyor](../../gorseller/a-01-a.webp)

## Proxy: araya giren postacı

Tarayıcı ile sunucu arasına bir **intercepting proxy** koyarsın. Her istek önce ona uğrar:
okursun, değiştirirsin, yeniden gönderirsin. Tarayıcının arayüzde gizlediği her alan burada görünür.

::animasyon[http-request]

## Laboratuvarı kur (bir kez)

1. Eğitim hedefi: Ördek Lab'deki portal kopyası ya da yerelde **OWASP Juice Shop**:

```bash
docker run --rm -p 127.0.0.1:3000:3000 bkimminich/juice-shop
```

2. **Burp Suite Community**'yi kur (ücretsiz) → *Proxy → Open browser*. Sertifika ayarı gerekmez.
3. Burp tarayıcısında `http://127.0.0.1:3000` adresini aç.

![Burp Suite HTTP geçmişi](../../gorseller/a-01-b.webp)

## Dört temel sekme

| Sekme | Ne işe yarar? |
|---|---|
| **Proxy → HTTP history** | Geçen bütün istekler, sırayla |
| **Intercept** | İsteği yolda durdur, düzenle, bırak |
| **Repeater** | Bir isteği defalarca değiştirip gönder, yanıtları karşılaştır |
| **Decoder** | Base64, URL kodlaması gibi biçimleri çöz |

## Önce kapsam

*Target → Scope* içine **yalnızca** laboratuvar adresini ekle ve "Show only in-scope items"ı işaretle.
Böylece yanlışlıkla başka bir siteye tek bir istek bile gitmez.

## 🧪 Dene (5 dk)

Juice Shop'ta herhangi bir ürünü ara. HTTP history'de arama isteğini bul → sağ tık → *Send to Repeater*.
Arama kelimesini değiştirip **Send**'e bas. Yanıtın boyutu ve içeriği nasıl değişti?

## ✅ Akılda kalsın

- Proxy, tarayıcıyla sunucu arasındaki her mektubu okumanı sağlar.
- Repeater'ın formülü: değiştir, gönder, karşılaştır.
- Kapsamı Burp'e de söyle; laboratuvar dışına tek istek gitmesin.
