---
id: m03-02
tur: ders
baslik: Neden yönetici hesabıyla gezmemelisin?
sure: 6
hedefler:
  - Standart ve yönetici hesap farkını açıklamak
  - En az yetki ilkesini günlük kullanıma uygulamak
gorseller:
  - id: m03-02-b
    tur: ekran
    alt: Windows Kullanıcı Hesabı Denetimi (UAC) onay penceresi
    nasil: "Windows'ta Başlat menüsünde 'Kayıt Defteri Düzenleyicisi'ne (regedit) sağ tık → 'Yönetici olarak çalıştır' deyin; çıkan Kullanıcı Hesabı Denetimi (UAC) penceresinin ekran görüntüsünü alın. Arka planı koyulaştırılmış hâliyle tüm pencereyi çekin. Uygulamayı açmanız gerekmez, 'Hayır' diyebilirsiniz."
  - id: m03-02-c
    tur: ai
    alt: "Bir otel resepsiyonunda her misafire yalnız kendi odasının anahtarı veriliyor; ana anahtar kilitli kutuda"
    prompt: "A vintage hotel reception desk: a calm receptionist hands each guest a single small key for their own room only, while the large golden master key stays locked inside a glass case behind the desk. A corridor of doors in different colors stretches behind the desk."
---

# Neden yönetici hesabıyla gezmemelisin?

> Yönetici hesabıyla internette gezmek, evin bütün anahtarlarını cebinde taşımak gibidir.
> Bir zararlı program o cepten neyi bulursa onu kullanır.

::cizgi[m03-02-sahne]

## İki tür hesap

| | Standart hesap | Yönetici hesabı |
|---|---|---|
| Günlük işler | ✅ | ✅ |
| Program kurmak, sistem ayarı değiştirmek | Şifre ister | Tek tıkla onay |
| Zararlı program bulaşırsa | Kendi dosyalarına zarar verir | **Tüm sisteme** yerleşebilir |

## UAC: son savunma hattın

Bir program yönetici yetkisi istediğinde Windows şu pencereyi gösterir:

![Kullanıcı Hesabı Denetimi penceresi](../../gorseller/m03-02-b.webp)

Bu pencere bir **soru**dur: "Bu programa bütün anahtarları vereyim mi?"
Ne yaptığını bilmediğin bir program için cevap **Hayır**.

## En az yetki ilkesi (least privilege)

![Bir otel resepsiyonunda her misafire yalnız kendi odasının anahtarı veriliyor; ana anahtar kilitli kutuda](../../gorseller/m03-02-c.webp)

Her kullanıcı ve program, işini yapacak **kadar** yetkiye sahip olmalı — fazlasına değil.
Bu ilke güvenliğin her katmanında karşına çıkacak: Linux'ta `sudo`, web'de yetkilendirme, bulutta IAM.

Önerilen düzen:
- Günlük kullanım için **standart** hesap.
- Ayrı, güçlü şifreli bir **yönetici** hesabı — sadece gerektiğinde.

## 🧪 Dene (2 dk)

Ayarlar → Hesaplar → Diğer kullanıcılar (veya Aile) yolundan hesabının türüne bak.
"Yönetici" mi yazıyor?

## ✅ Akılda kalsın

- Yönetici hesabı = tüm anahtarlar; günlük işte kullanma.
- UAC penceresi bir sorudur, rutin bir tık değil.
- En az yetki: işin kadar yetki, fazlası değil.
