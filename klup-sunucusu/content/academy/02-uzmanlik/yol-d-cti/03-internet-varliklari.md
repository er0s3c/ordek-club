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
  - id: d-03-b
    tur: ai
    alt: "Tek bir anahtardan çıkan iplik başka kapılara, oradan başka binalara uzanarak bir ağ oluşturuyor"
    prompt: "A single key pinned to the center of a cork board with threads running from it to three doors, and from each door further threads to buildings and certificates, the network growing outward as an investigator adds new pins."
---

# İnternet varlıkları: WHOIS, DNS ve sertifika kayıtları

> Bayrak boyamak ucuzdur; altyapı kurmak pahalı. Bedri'nin her alan adı başka bir bayrak taşır ama hepsi bir yere bağlanır.
> 🚩 **Bayrak 3:** Saldırıda kullanılan alan adlarının adı "mercan" diye bağırıyor. Peki kayıtları ne fısıldıyor?

::cizgi[d-03-sahne]

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

![Tek bir anahtardan çıkan iplik başka kapılara, oradan başka binalara uzanarak bir ağ oluşturuyor](../../gorseller/d-03-b.webp)

Bir göstergeden ötekine atla: alan adı → IP → aynı IP'deki diğer adlar → onların NS'i → aynı NS'deki diğer kayıtlar.
Her adımı günlüğe yaz; her pivot bir **hipotez**dir, kanıt değil.

## 🧪 Dene (5 dk)

`lab/d-altyapi-kayitlari.txt` dosyasını aç. Kampanyanın üç alan adı hangi üç özelliği paylaşıyor?
MERCAN-7'nin eski alan adı `mrcn-sync.example` bu özelliklerden kaçını taşıyor? Sertifika kayıtlarında beklenmeyen bir ad var mı?

## ✅ Akılda kalsın

- Ad kolayca taklit edilir; kayıt saati, registrar ve NS ortaklığı daha zor.
- Paylaşımlı IP'ler (CDN, barındırma) tek başına ilişki kanıtı değildir.
- Sertifika SAN alanı, unutulan alan adlarını ortaya çıkarır.
