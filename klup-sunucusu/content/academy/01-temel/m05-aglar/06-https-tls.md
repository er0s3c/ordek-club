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
  - id: m05-06-b
    tur: ai
    karakter: nuri
    alt: "Dinleyici Nuri kabloyu dinliyor ama içinden geçen paketler kilitli kapsüllerde; kulaklığından yalnızca parazit geliyor"
    prompt: "The villain clamps his headphones to a glowing cable, but every packet sliding through it is sealed inside a small glowing capsule with a padlock. Only static squiggles come out of his headphones and he scowls in frustration."
---

# Adres çubuğundaki kilit ne anlatıyor?

> 🔒 kilit "bu site güvenli" demek **değildir**. "Bu siteyle aranızdaki yol şifreli ve
> bu site gerçekten iddia ettiği alan adı" demektir. Fark büyük.

![Dinleyici Nuri kabloyu dinliyor ama içinden geçen paketler kilitli kapsüllerde; kulaklığından yalnızca parazit geliyor](../../gorseller/m05-06-b.webp)

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

Bir dolandırıcı da `kku-burs-onay.example` için geçerli bir sertifika alabilir.
Kilit **"doğru adrese şifreli bağlandın"** der; **"bu adres dürüst"** demez. Alan adını yine sen okursun.

## 🧪 Dene (3 dk)

Okulunun veya bankanın sitesinde kilit simgesine tıkla ve sertifikayı aç.
Veren kim? Geçerlilik ne zaman bitiyor?

## ✅ Akılda kalsın

- TLS: gizlilik, bütünlük, kimlik.
- Kilit adresin doğru olduğunu söyler, dürüst olduğunu değil.
- Sertifika uyarısını asla "yine de devam et" ile geçme.
