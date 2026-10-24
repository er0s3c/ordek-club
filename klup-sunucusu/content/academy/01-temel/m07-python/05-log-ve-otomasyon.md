---
id: m07-05
tur: ders
baslik: Logları okuyan ve işini otomatik yapan program
sure: 8
hedefler:
  - Bir log dosyasını Python ile özetlemek
  - Basit bir Bash otomasyonu yazmak
gorseller:
  - id: m07-05-a
    tur: ai
    karakter: orhan
    alt: "Log özetleme makinesinden çıkan grafikte tek bir uzun kırmızı çubuk; Kuklacı Orhan makinenin arkasından bakıyor"
    prompt: "A whimsical copper machine with pipes and gauges eats a very long curling paper ribbon of faint abstract lines and outputs a single neat card with a simple bar chart where one bar towers glowing red. The villain peeks from behind the machine, realizing his bot swarm has been exposed."
---

# Logları okuyan ve işini otomatik yapan program

> Loglar bir sistemin günlüğüdür. Ama kimse 100.000 satırlık günlüğü okumaz —
> **özetini** okur. O özeti sen çıkaracaksın.

![Log özetleme makinesinden çıkan grafikte tek bir uzun kırmızı çubuk; Kuklacı Orhan makinenin arkasından bakıyor](../../gorseller/m07-05-a.webp)

## Bir log satırını tanı

```text
Mar  3 15:31:02 kulup-srv sshd[40101]: Failed password for deploy from 203.0.113.66 port 50003 ssh2
└──── zaman ───┘ └ sunucu ┘ └servis┘   └──────────── olay ─────────────┘    └── kaynak IP ─┘
```

## IP başına başarısız giriş sayısı

```python
import re
from collections import Counter

sayac = Counter()
with open("/opt/akademi/auth.log", encoding="utf-8") as f:
    for satir in f:
        if "Failed password" in satir:
            m = re.search(r"from (\S+)", satir)
            if m:
                sayac[m.group(1)] += 1

for ip, n in sayac.most_common(5):
    print(f"{ip:16} {n}")
```

`Counter` bir sözlüktür ama saymak için özelleşmiştir; `most_common()` en sıklarını verir.

## Aynısı Bash ile (tek satır)

```bash
grep "Failed password" /opt/akademi/auth.log | grep -oE "from [0-9.]+" | sort | uniq -c | sort -nr | head -5
```

Kısa işler için Bash, mantık büyüyünce Python.

## Otomatikleştir

Her sabah raporu kendiliğinden üretmek için Linux'ta `cron` kullanılır:

```bash
crontab -e
# her gün 07:00'de çalıştır, çıktıyı dosyaya yaz
0 7 * * * /usr/bin/python3 /home/ayse/log_ozet.py >> /home/ayse/rapor.txt 2>&1
```

## 🧪 Dene (5 dk)

Yukarıdaki Python programını laboratuvar VM'inde çalıştır. En çok başarısız denemeyi yapan IP hangisi?
Bash satırıyla aynı sonucu aldın mı?

## ✅ Akılda kalsın

- Log satırı: zaman, kaynak, olay — önce yapısını tanı.
- `Counter.most_common()` "en çok kim?" sorusunu cevaplar.
- Kısa işte Bash, büyüyen işte Python; düzenli işte cron.
