---
id: d-03
tur: ders
baslik: "İnternet varlıkları: WHOIS, DNS ve sertifika kayıtları"
sure: 8
hedefler:
  - WHOIS/RDAP, DNS ve pasif DNS kayıtlarından altyapı ilişkisi çıkarmak
  - Sertifika şeffaflığı kayıtlarında gizli alan adlarını bulmak
animasyonlar: [dns-resolution]
gorseller:
  - id: d-03-a
    tur: ai
    karakter: bedri
    alt: "Bayrakçı Bedri farklı bayraklı şamandıraların hepsini sandalından aynı parlayan zincirle tek bir batık sandığa bağlıyor"
    prompt: "A calm night harbor with a row of small round buoys floating on dark water, each painted with a different abstract flag symbol. The villain rows a little wooden boat between them, quietly tying every buoy to the same single thick glowing green anchor chain that disappears down into one sunken crate on the seabed, visible through the clear water."
---

# İnternet varlıkları: WHOIS, DNS ve sertifika kayıtları

> Bayrak boyamak ucuzdur; altyapı kurmak pahalı. Bedri'nin her alan adı başka bir bayrak taşır ama hepsi bir yere bağlanır.
> 🚩 **Bayrak 3:** Saldırıda kullanılan alan adlarının adı "mercan" diye bağırıyor. Peki kayıtları ne fısıldıyor?

![Bayrakçı Bedri farklı bayraklı şamandıraların hepsini sandalından aynı parlayan zincirle tek bir batık sandığa bağlıyor](../../gorseller/d-03-a.webp)

## WHOIS ve RDAP

Bir alan adının **kayıt şirketi (registrar)**, oluşturulma tarihi ve ad sunucuları (name server).
Kayıt sahibi çoğu zaman gizlidir; ama **tarih, saat, registrar ve NS** ortaklıkları gizlenmesi zor parmak izleridir.

```bash
whois ornek.example
curl -s https://rdap.org/domain/ornek.example    # RDAP: aynı bilgi, JSON
```

## DNS ve pasif DNS

```bash
dig +short A ornek.example
dig +short NS ornek.example
dig +short TXT ornek.example     # SPF içinde gerçek posta sunucusu IP'si olabilir
```

::animasyon[dns-resolution]

**Pasif DNS (passive DNS)**, bir IP'nin geçmişte hangi adlara karşılık geldiğini gösterir.
Dikkat: paylaşımlı barındırma ve CDN adreslerinde binlerce masum site aynı IP'yi paylaşır. Böyle bir IP tek başına delil değildir.

## Sertifika şeffaflığı (Certificate Transparency)

Her TLS sertifikası herkese açık günlüklere yazılır. `crt.sh` gibi arayüzlerde bir sertifikanın
**SAN (Subject Alternative Name)** alanı, aynı sertifikayı paylaşan başka alan adlarını ele verir.
Saldırgan bir alt alan adını unutursa, oradan çıkar.

## Pivot (pivoting)

Bir göstergeden ötekine atla: alan adı → IP → aynı IP'deki diğer adlar → onların NS'i → aynı NS'deki diğer kayıtlar.
Her adımı günlüğe yaz; her pivot bir **hipotez**dir, kanıt değil.

## 🧪 Dene (5 dk)

`lab/d-altyapi-kayitlari.txt` dosyasını aç. Kampanyanın üç alan adı hangi üç özelliği paylaşıyor?
MERCAN-7'nin eski alan adı `mrcn-sync.example` bu özelliklerden kaçını taşıyor? Sertifika kayıtlarında beklenmeyen bir ad var mı?

## ✅ Akılda kalsın

- Ad kolayca taklit edilir; kayıt saati, registrar ve NS ortaklığı daha zor.
- Paylaşımlı IP'ler (CDN, barındırma) tek başına ilişki kanıtı değildir.
- Sertifika SAN alanı, unutulan alan adlarını ortaya çıkarır.
