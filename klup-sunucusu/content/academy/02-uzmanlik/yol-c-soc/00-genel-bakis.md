---
id: c-00
tur: bilgi
baslik: "Yol C — SOC, Olay Müdahalesi ve Dijital Adli Bilişim"
sure: 3
gorseller:
  - id: c-00-a
    tur: ai
    karakter: aile
    alt: "Güvenlik operasyon merkezinin ekran duvarında Gölge Ağ Ailesi üyelerinin kırmızı işaretli siluetleri"
    prompt: "A dim security operations center seen from behind empty analyst chairs: a wall of screens shows abstract graphs, timelines and map dots, and on the largest screen the shadowy silhouettes of the family members appear one by one, each highlighted with a red alert frame. No readable text on screens."
---

# Yol C — SOC, Olay Müdahalesi ve Dijital Adli Bilişim

> Alarm çaldı. Gerçek mi? Ne oldu, ne zaman, nasıl durdururuz? **Blue Team** ve **DFIR**.

![Güvenlik operasyon merkezinin ekran duvarında Gölge Ağ Ailesi üyelerinin kırmızı işaretli siluetleri](../../gorseller/c-00-a.webp)

**Ön koşul:** İşletim sistemleri (M03), ağ (M05), log okuma (M07)

## 12 ders

| # | Ders | Tek cümleyle |
|---|---|---|
| C01 | SOC ve savunma operasyonları | Tier 1–3, alert/event/incident |
| C02 | SIEM temelleri | Log toplama, normalizasyon, korelasyon |
| C03 | Wazuh laboratuvarı | Ajan, kural, uyarı analizi |
| C04 | IDS/IPS | Snort, Suricata, basit kural yazımı |
| C05 | Endpoint güvenliği | EDR, IOC/IOA, uç nokta triyajı |
| C06 | Windows adli bilişim | Event log, Sysmon, registry, prefetch |
| C07 | Linux adli bilişim | auth.log, journald, auditd, kalıcılık |
| C08 | Ağ adli bilişimi | PCAP'te DNS anomalisi ve şüpheli bağlantı |
| C09 | Zararlı yazılım triyajı | Hash, strings, YARA, sandbox raporu |
| C10 | Disk ve bellek analizi | Autopsy, MFT, Volatility 3, kanıt bütünlüğü |
| C11 | Olay müdahalesi | Hazırlıktan olay sonrası değerlendirmeye, delil zinciri |
| C12 | Final simülasyonu | Alarm → analiz → zaman çizelgesi → olay raporu |

## Bitirme çıktısı

Tamamlanmış bir **olay inceleme dosyası** ve **müdahale raporu**.

Tüm loglar, disk imajları ve PCAP'ler **sentetiktir**; gerçek kişilere ait veri kullanılmaz.
