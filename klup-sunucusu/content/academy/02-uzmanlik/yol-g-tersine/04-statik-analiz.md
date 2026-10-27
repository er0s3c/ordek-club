---
id: g-04
tur: ders
baslik: "Statik analiz: hash, strings, entropi ve Ghidra"
sure: 9
hedefler:
  - Bir örnek için ilk 10 dakikalık triage'ı yapmak
  - Paketleme işaretlerini tanımak ve Ghidra'da import'lardan koda gitmek
gorseller:
  - id: g-04-b
    tur: ekran
    alt: "Ghidra'da eğitim crackme'sinin import listesi ve parola karşılaştırmasını gösteren Decompile penceresi"
    nasil: "Analiz VM'inde herkese açık, zararsız bir eğitim crackme'sini Ghidra'da aç ve otomatik analizi çalıştır. Solda Symbol Tree → Imports açık, sağda main fonksiyonunun Decompile görünümü olsun. Parola karşılaştırmasını kehribar (#C9953B) dikdörtgenle işaretle. Yalnızca Ghidra penceresini kırp; kullanıcı adı ve dosya yolları görünmesin. 1600×900, koyu tema."
  - id: g-04-c
    tur: ai
    alt: "Sıkıca sarılmış, içi görünmeyen bir paket ile açık duran düzenli bir kutu; paketin dokusu rastgele parazit gibi"
    prompt: "Two parcels side by side on an inspection table: one open box with neatly arranged items, and one tightly wrapped bundle whose surface looks like dense random static, an analyst holding a measuring device that buzzes over the wrapped one."
---

# Statik analiz: hash, strings, entropi ve Ghidra

> Böceği çalıştırmadan konuşturabilirsin: dosyanın kendisi, sorulursa çok şey anlatır.
> ⚙️ **Çark 4:** Sabri böceklerini kat kat sarar. Selim Hoca: "Ambalajı say, sonra içine bak."

::cizgi[g-04-sahne]

## Triage: ilk 10 dakika

```bash
file ornek.exe_            # gerçek tür (uzantıya güvenme)
sha256sum ornek.exe_       # kimlik: rapora ve IOC listesine
strings -n 6 ornek.exe_    # ASCII dizeler
strings -n 6 -el ornek.exe_  # UTF-16 dizeler (Windows'ta sık)
```

Hash'i aramak serbesttir; örneğin kendisini eğitmen izni olmadan herkese açık servislere **yükleme**.

## Strings neyi ele verir?

Alan adları, IP'ler, URL'ler, registry yolları, dosya adları, mutex adları, hata mesajları.
Okunabilir dize neredeyse hiç yoksa dosya **paketlenmiş** olabilir.

## Paketleme ve entropi

![Sıkıca sarılmış, içi görünmeyen bir paket ile açık duran düzenli bir kutu; paketin dokusu rastgele parazit gibi](../../gorseller/g-04-c.webp)

Paketleyici (packer) kodu sıkıştırır ya da şifreler, çalışınca bellekte açar. Analistin işi onu **tanımaktır**:

| İşaret | Normal | Şüpheli |
|---|---|---|
| Bölüm entropisi | 5–6,5 | 7,2+ (8'e yakın = rastgele gibi) |
| Import sayısı | Onlarca | Bir avuç: `LoadLibraryA`, `GetProcAddress`, `VirtualAlloc` |
| Okunabilir dize | Bol | Neredeyse yok |

Detect It Easy (DIE) bilinen paketleyicileri ve derleyicileri tanır.

## Ghidra'ya ilk bakış

Projeye aktar → otomatik analiz → **Symbol Tree › Imports** → ilginç API'ye sağ tık **References** →
çağıran fonksiyonu **Decompile** penceresinde oku → anlamlı bir ad ver (`L` tuşu).

![Ghidra'da eğitim crackme'sinin import listesi ve parola karşılaştırmasını gösteren Decompile penceresi](../../gorseller/g-04-b.webp)

## 🧪 Dene (8 dk)

Kurgusal örneğin dökümlerinde ara:

```bash
grep -Ei "http|\.test|software|global" /opt/akademi/g-saat-bocegi-strings.txt
grep -A6 "Bölümler" /opt/akademi/g-saat-bocegi-pe.txt
```

1. En az 4 IOC adayı yaz: alan adı, IP, registry yolu, mutex.
2. Hangi bölüm paketli ya da şifreli bir yük taşıyor gibi? Kanıtın ne?

## ✅ Akılda kalsın

- Triage sırası: tür → hash → strings → PE yapısı → import'lar.
- Yüksek entropi + az import + az dize = paketleme şüphesi.
- Ghidra'da ilginç bir API'den geriye, onu çağıran koda git.
