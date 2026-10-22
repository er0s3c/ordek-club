---
id: m07-04
tur: ders
baslik: Desen yakala, parmak izi al — regex ve hash
sure: 8
hedefler:
  - Düzenli ifadelerle metinden bilgi çıkarmak
  - Bir dosyanın hash değerini hesaplamak
gorseller:
  - id: m07-04-a
    tur: ai
    karakter: orhan
    alt: "Kuklacı Orhan parmak izi tarayıcısına sahte parmak izli bir eldiven tutuyor"
    prompt: "A sleek glowing fingerprint scanner device on a lab table, a unique fingerprint pattern shown on a floating screen above it. The villain holds up a rubber glove with a fake glowing fingerprint toward the scanner, while a large sieve nearby filters falling glowing shapes."
---

# Desen yakala, parmak izi al — regex ve hash

> Bir logdan IP adreslerini çekmek ve bir dosyanın değiştirilip değiştirilmediğini anlamak:
> iki küçük süper güç.

![Kuklacı Orhan parmak izi tarayıcısına sahte parmak izli bir eldiven tutuyor](../../gorseller/m07-04-a.webp)

## Regex: metinde desen bulmak

```python
import re

satir = "Failed password for deploy from 203.0.113.66 port 50012 ssh2"

ip = re.search(r"from (\d+\.\d+\.\d+\.\d+)", satir)
if ip:
    print(ip.group(1))          # 203.0.113.66

kullanici = re.search(r"for (?:invalid user )?(\w+)", satir)
print(kullanici.group(1))       # deploy
```

| Desen | Anlamı |
|---|---|
| `\d` | rakam |
| `\w` | harf, rakam veya `_` |
| `+` | bir veya daha fazla |
| `( )` | yakala ve sonra kullan |
| `\.` | gerçek nokta (yalnız `.` = herhangi bir karakter) |

Regex yazarken [regex101.com](https://regex101.com) gibi bir denemede test et.

## Hash: dosyanın parmak izi

Hash fonksiyonu herhangi bir veriden **sabit uzunlukta** bir özet çıkarır. Tek bir bit değişse özet tamamen değişir.

```python
import hashlib

def sha256_dosya(yol: str) -> str:
    h = hashlib.sha256()
    with open(yol, "rb") as f:
        for parca in iter(lambda: f.read(8192), b""):
            h.update(parca)
    return h.hexdigest()

print(sha256_dosya("kurulum.iso"))
```

Kullanım alanları: indirilen dosyanın değişmediğini doğrulamak, delil bütünlüğünü kanıtlamak,
zararlı yazılımı hash'iyle tanımak (M08, Yol C).

> MD5 ve SHA-1 artık güvenli kabul edilmez; **SHA-256** kullan.

## 🧪 Dene (5 dk)

Bir metin dosyasının SHA-256'sını hesapla. Dosyaya tek bir boşluk ekle ve tekrar hesapla. Ne değişti?

## ✅ Akılda kalsın

- Regex metinden desen çıkarır; önce dene, sonra kullan.
- Hash = verinin parmak izi; küçük değişiklik, tamamen farklı özet.
- Bütünlük için SHA-256; MD5/SHA-1 değil.
