---
id: d-10
tur: ders
baslik: "Tehdit avcılığı: alarm çalmadan izi bul"
sure: 9
hedefler:
  - Test edilebilir bir av hipotezi kurup laboratuvar verisinde sınamak
  - Bulguyu Sigma ve YARA kuralına çevirmek
animasyonlar: [soc-alert]
gorseller:
  - id: d-10-b
    tur: ai
    alt: "Avcı ormanda pusula ile belirli bir izin peşinde; rastgele dolaşmıyor"
    prompt: "A tracker in a dark forest holds a brass compass whose needle points along a specific trail of faint glowing footprints, ignoring other paths, a notebook of the hypothesis tucked under the arm."
  - id: d-10-c
    tur: ai
    alt: "Avcının bulduğu iz bir kalıba dökülüp kapıdaki bekçiye teslim ediliyor"
    prompt: "A tracker pours plaster into a footprint and hands the hardened cast to a gate guard, who mounts it on the gate so every future visitor's footprints can be compared to it automatically."
---

# Tehdit avcılığı: alarm çalmadan izi bul

> Alarm, bildiğin şeyi yakalar. Av, bilmediğin şeyi arar.
> 🚩 **Bayrak 10:** Engelleme listesi hazır ama Selim Hoca soruyor: "Aynı belge başka kimin bilgisayarında açıldı? Alarm çalmayanlar?"

::cizgi[d-10-sahne]

## Hipotez: avın pusulası

![Avcı ormanda pusula ile belirli bir izin peşinde; rastgele dolaşmıyor](../../gorseller/d-10-b.webp)

Tehdit avcılığı (threat hunting) bir **hipotezle** başlar, IOC listesiyle değil:

```text
Eğer saldırgan ofis belgesiyle içeri giriyorsa (T1566.001 → T1059.001),
o zaman Word'ün alt süreci olarak PowerShell çalışmış olmalı.
Veri: süreç oluşturma olayları (Sysmon olay 1) · Süre: son 7 gün
```

Sonuç "bulduk" da olabilir, "bulamadık" da. İkisi de değerlidir: bulamadıysan veri kaynağın yeterli miydi, onu da yaz.

::animasyon[soc-alert]

## Sına

```bash
jq -c 'select(.event_id==1 and (.parent_image|test("WINWORD";"i")) and (.image|test("powershell";"i")))' \
  /opt/akademi/d-av-olaylari.jsonl
jq -r 'select(.image|test("schtasks";"i")) | [.ts,.host,.user,.command_line] | @tsv' /opt/akademi/d-av-olaylari.jsonl
```

Her sonucu bağlamla yorumla: yöneticinin gece yedekleme görevi de bir `schtasks` satırıdır.

## Sigma: avı kalıcı kurala çevir

![Avcının bulduğu iz bir kalıba dökülüp kapıdaki bekçiye teslim ediliyor](../../gorseller/d-10-c.webp)

```yaml
title: Ofis belgesinden PowerShell başlatılması
status: experimental
logsource: { category: process_creation, product: windows }
detection:
  selection:
    ParentImage|endswith: '\WINWORD.EXE'
    Image|endswith: '\powershell.exe'
    CommandLine|contains: ' -enc'
  condition: selection
level: high
tags: [attack.execution, attack.t1059.001]
```

Sigma, SIEM'den bağımsız bir kural dilidir; araçlarla Splunk, Elastic ve benzeri sorgulara çevrilir.

## YARA: dosyada ara

```text
rule Kampanya_svc_update {
  strings:
    $a = "MercanSync" ascii wide
    $b = "\\mrcn\\" ascii wide
  condition:
    uint16(0) == 0x5A4D and all of them
}
```

Dikkat: bu kural **bu kampanyanın** dosyalarını bulur, MERCAN-7'yi değil. Kural adına bayrağın adını değil, gördüğünü yaz.

## 🧪 Dene (6 dk)

Yukarıdaki iki sorguyu laboratuvar VM'inde çalıştır. Kaç bilgisayar etkilendi? Hangi `schtasks` satırı masum?
`rundll32` bağlantılarının saatlerine bak: aralık kaç dakika? Kampanyada adı geçmeyen bir hedef IP var mı?

## ✅ Akılda kalsın

- Av hipotezle başlar: davranış, veri kaynağı, süre.
- "Bulamadık" da sonuçtur; veri kaynağının yeterliliğiyle birlikte yazılır.
- Bulduğunu Sigma ve YARA ile kalıcı kurala çevir ve kurala gördüğünün adını ver.
