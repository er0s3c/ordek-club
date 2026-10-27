---
id: m07-04
tur: ders
baslik: Desen yakala, parmak izi al — regex ve hash
sure: 8
hedefler:
  - Düzenli ifadelerle metinden bilgi çıkarmak
  - Bir dosyanın hash değerini hesaplamak
gorseller:
  - id: m07-04-b
    tur: ai
    alt: "Uzun bir kâğıt şeridin üzerinde kayan şablon bir kartın deliklerinden yalnızca eşleşen parçalar parlıyor"
    prompt: "A long paper scroll covered with tiny colored shapes passes under a stencil card with cut-out holes; wherever the shapes match the holes, they light up green and are lifted into a small tray by tweezers."
  - id: m07-04-c
    tur: ai
    alt: "İki neredeyse aynı belge parmak izi makinesinden geçiyor; çıkan parmak izleri tamamen farklı"
    prompt: "Two nearly identical documents enter a brass fingerprint machine side by side, one with a single tiny extra ink dot, and out of the machine come two fingerprint cards with completely different swirling patterns, one glowing green and one glowing amber."
---

# Desen yakala, parmak izi al — regex ve hash

> Bir logdan IP adreslerini çekmek ve bir dosyanın değiştirilip değiştirilmediğini anlamak:
> iki küçük süper güç.

::cizgi[m07-04-sahne]

## Regex: metinde desen bulmak

![Uzun bir kâğıt şeridin üzerinde kayan şablon bir kartın deliklerinden yalnızca eşleşen parçalar parlıyor](../../gorseller/m07-04-b.webp)

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

![İki neredeyse aynı belge parmak izi makinesinden geçiyor; çıkan parmak izleri tamamen farklı](../../gorseller/m07-04-c.webp)

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
