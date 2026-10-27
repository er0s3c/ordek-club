---
id: m08-03
tur: ders
baslik: Dijital imza ve sertifika — "bunu gerçekten sen mi gönderdin?"
sure: 7
hedefler:
  - Dijital imzanın nasıl çalıştığını açıklamak
  - Sertifika ve PKI zincirini anlamak
animasyonlar: [tls-handshake]
gorseller:
  - id: m08-03-b
    tur: ai
    alt: "Belgeye yalnızca sahibinin elindeki özel mühürle basılan bir balmumu mühür; herkes elindeki büyüteçle mührü doğrulayabiliyor"
    prompt: "A person presses a unique private seal ring into warm wax on a document, while a crowd of onlookers each hold an identical public magnifying lens that shows a matching glowing outline only when the seal is genuine."
  - id: m08-03-c
    tur: ai
    alt: "Pasaport kontrolü: bir anahtarın kimlik belgesi, güvenilir bir makam tarafından damgalanmış"
    prompt: "A passport control booth where an official with a heavy trusted stamp checks a small passport attached to a brass key, compares the photo with the key owner standing in line, and stamps it with a glowing green approval seal."
---

# Dijital imza ve sertifika

> Şifreleme "kimse okuyamasın" der. İmza ise "**bunu gerçekten ben gönderdim ve kimse değiştirmedi**" der.

::cizgi[m08-03-sahne]

## Dijital imza nasıl çalışır?

![Belgeye yalnızca sahibinin elindeki özel mühürle basılan bir balmumu mühür; herkes elindeki büyüteçle mührü doğrulayabiliyor](../../gorseller/m08-03-b.webp)

1. Gönderen belgenin **hash**'ini alır.
2. Hash'i kendi **özel anahtarıyla** imzalar.
3. Alıcı, göndericinin **açık anahtarıyla** imzayı doğrular ve kendi hesapladığı hash ile karşılaştırır.

Sonuç:
- ✅ **Kimlik** — İmza ancak o özel anahtarla atılabilir.
- ✅ **Bütünlük** — Belgede tek harf değişse hash tutmaz.
- ✅ **İnkâr edilemezlik** — "Ben göndermedim" denemez.

Nerede? Yazılım güncellemeleri, e-imzalı belgeler, Git commit'leri, TLS.

## Sertifika: "Bu açık anahtar gerçekten kime ait?"

![Pasaport kontrolü: bir anahtarın kimlik belgesi, güvenilir bir makam tarafından damgalanmış](../../gorseller/m08-03-c.webp)

Bir saldırgan da "ben bankayım" diyen bir açık anahtar üretebilir. Çözüm: **güvenilir bir üçüncü taraf** bunu doğrulayıp imzalar.

- **Sertifika** = alan adı + açık anahtar + bir **Sertifika Otoritesinin (CA)** imzası
- **PKI** (Açık Anahtar Altyapısı) = CA'lar, sertifikalar ve doğrulama kurallarının tamamı

## Güven zinciri

```text
Kök CA (tarayıcında/işletim sisteminde önceden yüklü)
   └── Ara CA (kök tarafından imzalanmış)
         └── kuzeykiyi.edu.example sertifikası (ara CA tarafından imzalanmış)
```

Tarayıcı zinciri yukarı doğru takip eder; köke ulaşamazsa uyarı verir.
Bu doğrulamanın TLS el sıkışmasında nerede olduğunu gör:

::animasyon[tls-handshake]

## 🧪 Dene (3 dk)

Bir sitenin sertifikasını aç (M05-06) ve **Sertifika yolu / Certificate Hierarchy** sekmesine bak.
Zincirde kaç halka var? Kök CA'nın adı ne?

## ✅ Akılda kalsın

- İmza: özel anahtarla atılır, açık anahtarla doğrulanır.
- İmza kimlik, bütünlük ve inkâr edilemezlik sağlar.
- Sertifika açık anahtarı bir kimliğe bağlar; güven, kök CA'ya kadar uzanan zincirle kurulur.
