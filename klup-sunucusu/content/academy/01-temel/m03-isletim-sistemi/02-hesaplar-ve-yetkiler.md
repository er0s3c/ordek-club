---
id: m03-02
tur: ders
baslik: Neden yönetici hesabıyla gezmemelisin?
sure: 6
hedefler:
  - Standart ve yönetici hesap farkını açıklamak
  - En az yetki ilkesini günlük kullanıma uygulamak
gorseller:
  - id: m03-02-a
    tur: ai
    karakter: riza
    alt: "Anahtarcı Rıza koridordaki kilitli dolapta duran ana anahtarı maymuncukla almaya çalışıyor"
    prompt: "A dim hallway with many doors; on the wall a locked glass cabinet holds one large glowing master key. The villain crouches in front of it working a lockpick into the cabinet lock, his huge keyring jingling, eyes fixed on the prize."
  - id: m03-02-b
    tur: ekran
    alt: Windows Kullanıcı Hesabı Denetimi (UAC) onay penceresi
    nasil: "Windows'ta Başlat menüsünde 'Kayıt Defteri Düzenleyicisi'ne (regedit) sağ tık → 'Yönetici olarak çalıştır' deyin; çıkan Kullanıcı Hesabı Denetimi (UAC) penceresinin ekran görüntüsünü alın. Arka planı koyulaştırılmış hâliyle tüm pencereyi çekin. Uygulamayı açmanız gerekmez, 'Hayır' diyebilirsiniz."
---

# Neden yönetici hesabıyla gezmemelisin?

> Yönetici hesabıyla internette gezmek, evin bütün anahtarlarını cebinde taşımak gibidir.
> Bir zararlı program o cepten neyi bulursa onu kullanır.

![Anahtarcı Rıza koridordaki kilitli dolapta duran ana anahtarı maymuncukla almaya çalışıyor](../../gorseller/m03-02-a.webp)

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
