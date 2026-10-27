---
id: m04-03
tur: ders
baslik: Samanlıkta iğne bulmak — find ve grep
sure: 7
hedefler:
  - find ile dosya aramak
  - grep ve boru (|) ile metin filtrelemek
gorseller:
  - id: m04-03-b
    tur: ai
    alt: "Birbirine borularla bağlı üç makine: ilki samanı süzüyor, ikincisi iğneleri ayırıyor, üçüncüsü onları sayıp diziyor"
    prompt: "Three retro machines connected in a row by brass pipes: the first machine swallows a big pile of hay and sifts it through a sieve, the second machine magnetically pulls out only the shiny needles, and the third machine counts and lines the needles up neatly by size on a tray. Green glow at each joint."
---

# Samanlıkta iğne bulmak — find ve grep

> Bir log dosyası 100.000 satır olabilir. Aradığın tek bir satırdır.
> Linux'un süper gücü: **bul, süz, say.**

::cizgi[m04-03-sahne]

## find — dosyayı bul

```bash
find ~ -name "*.txt"            # ev dizinindeki tüm .txt dosyaları
find /tmp -type f -mmin -60     # son 60 dakikada değişen dosyalar
find / -name "*.conf" 2>/dev/null   # hata mesajlarını gizleyerek ara
```

## grep — satırı bul

```bash
grep "Failed" auth.log          # "Failed" geçen satırlar
grep -i "error" app.log         # büyük/küçük harf duyarsız
grep -c "Failed" auth.log       # kaç satır? (sadece sayı)
grep -r "parola" ~/notlar       # klasörde içten içe ara
```

## Boru (|): komutları birleştir

![Birbirine borularla bağlı üç makine: ilki samanı süzüyor, ikincisi iğneleri ayırıyor, üçüncüsü onları sayıp diziyor](../../gorseller/m04-03-b.webp)

Bir komutun çıktısı, diğerinin girdisi olur:

```bash
grep "Failed password" auth.log | wc -l
#   ↑ başarısız girişleri bul      ↑ satırları say

cat erisim.log | sort | uniq -c | sort -nr | head
#   satırları sırala → tekrarları say → en çoktan aza → ilk 10
```

Son satır bir güvenlik analistinin klasiğidir: **en sık tekrarlanan** şey ne?

## Diğer yardımcılar

| Komut | Ne yapar? |
|---|---|
| `head` / `tail` | İlk / son satırlar (`tail -f` canlı izler) |
| `less` | Büyük dosyada sayfa sayfa gez |
| `wc -l` | Satır say |
| `cut -d' ' -f1` | Boşluğa göre ayırıp 1. sütunu al |

## 🧪 Dene (5 dk)

Laboratuvar VM'inde:

```bash
grep -c "Failed password" /opt/akademi/auth.log
grep "Failed password" /opt/akademi/auth.log | tail -3
```

Kaç başarısız giriş var? Son üçü hangi saatlerde?

## ✅ Akılda kalsın

- `find` dosyayı, `grep` satırı bulur.
- `|` bir komutun çıktısını diğerine verir.
- `sort | uniq -c | sort -nr` = en sık tekrar edenler.
