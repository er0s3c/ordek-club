---
id: m05-06
tur: ders
baslik: Adres çubuğundaki kilit ne anlatıyor?
sure: 6
hedefler:
  - HTTPS ve TLS'in neyi koruduğunu açıklamak
  - Bir sitenin sertifikasını incelemek
animasyonlar: [tls-handshake]
gorseller:
  - id: m05-06-a
    tur: ekran
    alt: Tarayıcıda example.com için sertifika ayrıntıları penceresi; verilen kişi, veren ve geçerlilik tarihleri
    nasil: "Chrome veya Edge'de https://example.com adresini açın → adres çubuğundaki ayar/kilit simgesi → 'Bağlantı güvenli' → 'Sertifika geçerli'. Açılan pencerede 'Verilen' (Issued to), 'Veren' (Issued by) ve 'Geçerlilik' bölümleri görünsün. Bu üç alanı kehribar (#C9953B) çerçeveyle işaretleyin. Tarayıcı profil resmi veya yer imleri görünmesin."
  - id: m05-06-c
    tur: ai
    alt: "Mükemmel kilitli zırhlı bir araç, ama şoförü sahte bir bankanın kapısına park ediyor"
    prompt: "A perfectly armored delivery truck with a gleaming lock on its doors parks in front of a shabby fake bank storefront with painted-on windows and a cardboard door, while the real bank stands lit across the street. The lock is flawless, the destination is wrong."
---

# Adres çubuğundaki kilit ne anlatıyor?

> 🔒 kilit "bu site güvenli" demek **değildir**. "Bu siteyle aranızdaki yol şifreli ve
> bu site gerçekten iddia ettiği alan adı" demektir. Fark büyük.

::cizgi[m05-06-sahne]

## HTTPS = HTTP + TLS

TLS üç şey sağlar:

1. **Gizlilik** — Yoldaki kimse (kafe Wi-Fi'si, ağ yöneticisi) içeriği okuyamaz.
2. **Bütünlük** — Yolda kimse içeriği değiştiremez.
3. **Kimlik** — Bağlandığın sunucu gerçekten `banka.example`'dır; sertifika bunu kanıtlar.

Tarayıcı ile sunucu, dinleyen birinin çözemeyeceği bir anahtarda nasıl anlaşır?

::animasyon[tls-handshake]

## Sertifikaya bakmayı öğren

![Sertifika ayrıntıları](../../gorseller/m05-06-a.webp)

- **Verilen:** Alan adı adres çubuğundakiyle aynı mı?
- **Veren:** Tanınmış bir sertifika otoritesi (CA) mi?
- **Geçerlilik:** Tarihi geçmiş mi?

Tarayıcı bunları zaten kontrol eder ve sorun varsa **büyük kırmızı bir uyarı** gösterir.
O uyarıyı "devam et" diyerek geçmek, kilidin bütün anlamını çöpe atmaktır.

## Kilit neyi garanti etmez?

![Mükemmel kilitli zırhlı bir araç, ama şoförü sahte bir bankanın kapısına park ediyor](../../gorseller/m05-06-c.webp)

Bir dolandırıcı da `kku-burs-onay.example` için geçerli bir sertifika alabilir.
Kilit **"doğru adrese şifreli bağlandın"** der; **"bu adres dürüst"** demez. Alan adını yine sen okursun.

## 🧪 Dene (3 dk)

Okulunun veya bankanın sitesinde kilit simgesine tıkla ve sertifikayı aç.
Veren kim? Geçerlilik ne zaman bitiyor?

## ✅ Akılda kalsın

- TLS: gizlilik, bütünlük, kimlik.
- Kilit adresin doğru olduğunu söyler, dürüst olduğunu değil.
- Sertifika uyarısını asla "yine de devam et" ile geçme.
