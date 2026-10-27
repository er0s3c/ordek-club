---
id: c-02
tur: ders
baslik: "SIEM: dağınık logları tek ekranda nasıl birleştiririz?"
sure: 8
hedefler:
  - SIEM'in log toplama, normalizasyon ve korelasyon adımlarını açıklamak
  - Olay zamanı ile alınma zamanı arasındaki farkı kullanmak
gorseller:
  - id: c-02-b
    tur: ai
    alt: "Farklı yerlerden gelen günlük defterlerinin sayfaları tek bir büyük panoda zamana göre diziliyor"
    prompt: "Pages flying in from many different logbooks, a door log, a server log, a network log and a laptop diary, all landing in order on one huge timeline board on the wall, where an analyst connects matching pages with green threads."
---

# SIEM: dağınık logları tek ekranda nasıl birleştiririz?

> Tek bir log yalan söyleyebilir. On kaynaktan gelen loglar birbirini **doğrular**.
> 🧹 **İz 2:** KLP-WS07'nin kendi logları silindi; ama silinmeden önce kopyaları SIEM'e çoktan ulaşmıştı.

::cizgi[c-02-sahne]

## SIEM ne yapar?

![Farklı yerlerden gelen günlük defterlerinin sayfaları tek bir büyük panoda zamana göre diziliyor](../../gorseller/c-02-b.webp)

**SIEM (Security Information and Event Management)**, logları merkezde toplayan ve ilişkilendiren sistemdir.

| Adım | Ne olur? |
|---|---|
| **Toplama** (collection) | Ajanlar ve syslog ile loglar merkeze akar |
| **Normalizasyon** | Farklı biçimler ortak alanlara çevrilir: `kaynak_ip`, `kullanici`, `zaman` |
| **Zenginleştirme** | IP'ye konum, kullanıcıya departman, varlığa önem eklenir |
| **Korelasyon** | Kurallar olayları birleştirir, alarm üretir |
| **Saklama** | Loglar değiştirilemez biçimde aylarca tutulur |

## Log kaynakları

Uç noktalar (Windows Event Log, Sysmon, Linux auth.log), ağ (firewall, IDS, DNS, proxy), kimlik (Active Directory, VPN),
uygulamalar (web sunucusu, veritabanı). **Kaynak yoksa görünürlük de yoktur.**

## Korelasyon örneği

```text
EĞER   aynı kaynak IP'den 10 dk içinde ≥ 5 başarısız giriş (4625)
VE     ardından aynı IP'den başarılı giriş (4624)
İSE    alarm: "Kaba kuvvet başarılı olmuş olabilir" — önem: yüksek
```

Tek başına zararsız görünen iki olay, yan yana gelince hikâye anlatır. Kurallar çoğu zaman **Sigma** biçiminde yazılır:
SIEM'den bağımsız, YAML tabanlı bir kural dili; aynı kural Wazuh, Splunk ya da Elastic sorgusuna çevrilebilir.

## İki saat: olay zamanı ve alınma zamanı

Her kayıtta iki zaman olabilir: cihazın yazdığı **olay zamanı** ve SIEM'in kaydı aldığı **alınma zamanı (ingestion time)**.
Normalde aradaki fark saniyelerdir. Fark saatlere çıkıyorsa cihazın saati kaydırılmış olabilir. Saldırgan cihaz saatini oynatabilir;
SIEM'in saatine dokunamaz.

## 🧪 Dene (5 dk)

Windows olaylarında iki zamanı karşılaştır:

```bash
jq -r '[.zaman, .siem_alinma, .olay_id] | @tsv' /opt/akademi/c-windows-olaylar.jsonl
```

Hangi satırdan itibaren iki zaman arasında fark açılıyor? Fark kaç saat? Hangi olay kimliği (`olay_id`) bunun nedenini söylüyor?

## ✅ Akılda kalsın

- SIEM toplar, normalleştirir, zenginleştirir, ilişkilendirir ve saklar.
- Merkezde saklanan log, cihazdaki log silinse de yaşar.
- Olay zamanı ile alınma zamanı arasındaki fark, saat oynamasının izidir.
