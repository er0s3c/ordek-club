---
id: c-08
tur: ders
baslik: "Ağ adli bilişimi: DNS anomalileri ve düzenli nabız"
sure: 8
hedefler:
  - DNS kayıtlarında beaconing ve tünelleme belirtilerini tanımak
  - Ağ sensörünün saatini uç nokta saatiyle karşılaştırmak
animasyonlar: [dns-resolution]
gorseller:
  - id: c-08-a
    tur: ai
    karakter: tamer
    alt: "Temizlikçi Tamer gece iskelesinde cep saatine bakarak tam aralıklarla fenerli kâğıt kayıklar bırakıyor; deniz fenerindeki dev mercek her kayığı kusursuz bir sıra hâlinde kaydediyor"
    prompt: "A night harbor where glowing network cables run under the water like currents. The villain stands at the end of a wooden pier, checking his pocket watch and releasing a tiny paper boat carrying a little lantern at perfectly regular intervals. High on a lighthouse above, a giant brass lens swivels to follow each boat and marks it as an amber dot in a perfectly even row across the night sky."
---

# Ağ adli bilişimi: DNS anomalileri ve düzenli nabız

> Cihazın saati yalan söyleyebilir. Ağ sensörü olayı **kendi saatiyle** kaydeder.
> 🧹 **İz 8:** KLP-WS07 gece boyunca her 30 dakikada bir aynı alan adına sordu. Tamer saati kaydırdı; sensörün saati kaymadı.

![Temizlikçi Tamer gece iskelesinde cep saatine bakarak tam aralıklarla fenerli kâğıt kayıklar bırakıyor; deniz fenerindeki dev mercek her kayığı kusursuz bir sıra hâlinde kaydediyor](../../gorseller/c-08-a.webp)

## Neden DNS?

Neredeyse her bağlantı bir **DNS sorgusuyla** başlar ve DNS çoğu ağda serbestçe dışarı çıkar.
Bu yüzden hem zararlı yazılımın sevdiği kanal hem de savunucunun en verimli log kaynağıdır.

::animasyon[dns-resolution]

## Üç anomali

| Belirti | Neye benzer? | Ne olabilir? |
|---|---|---|
| **Düzenli nabız (beaconing)** | Aynı alan adına tam 30 dk'da bir | Komuta-kontrol (C2) bağlantısı |
| **Uzun, anlamsız alt alan adı** | `4b4c502d57533037.v.example.test` | DNS tünelleme: veri sorgunun içinde taşınıyor |
| **Benzer ad** | `guncelleme.kampus.test` ↔ `guncelleme.kotu.test` | Meşru servisi taklit eden alan adı |

İnsanlar düzensiz gezinir; makineler **saat gibi** çalışır. Aralık düzenliyse, bir program konuşuyordur.
Dikkat: güncelleme ve saat eşitleme (NTP) servisleri de düzenli konuşur. Önce **meşru** olanı listeden çıkar, kalanı incele.

## PCAP'te ne aranır?

Wireshark'ta aynı soruların karşılığı:

```text
dns.qry.name contains "kotu.test"
dns.qry.type == 16                      # TXT sorguları
ip.addr == 198.51.100.200 && tcp.flags.syn == 1
```

*Statistics → Conversations* ile en çok konuşan dış adresleri, *I/O Graph* ile düzenli aralıkları görebilirsin.

## Zaman çapası

Ağ sensörü, uç noktadan bağımsız bir saattir. Uç noktada saat kaydırılmışsa, aynı bağlantının
DNS kaydındaki zamanı **gerçek zamandır**. Zaman çizelgesini sensör saatine göre kur.

## 🧪 Dene (5 dk)

```bash
grep kotu.test /opt/akademi/c-dns.log | cut -f1,4,5
for h in $(grep TXT /opt/akademi/c-dns.log | cut -f4 | cut -d. -f1); do echo "$h" | xxd -r -p; echo; done
```

Nabız aralığı kaç dakika, ilk ve son sorgu ne zaman? TXT sorgularının alt alan adları çözülünce ne çıkıyor?

## ✅ Akılda kalsın

- Makine saat gibi konuşur: düzenli aralık, beaconing işaretidir.
- Uzun ve anlamsız alt alan adı, DNS tünelleme şüphesidir.
- Ağ sensörünün saati, kaydırılmış uç nokta saatine karşı zaman çapasıdır.
