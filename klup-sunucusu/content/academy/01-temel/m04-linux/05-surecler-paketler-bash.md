---
id: m04-05
tur: ders
baslik: Süreçler, paketler ve terminalde güvenli kalmak
sure: 7
hedefler:
  - Çalışan süreçleri ve servisleri incelemek
  - Paket yöneticisiyle güvenli kurulum yapmak
  - Tehlikeli komut kalıplarını tanımak
gorseller:
  - id: m04-05-a
    tur: ai
    karakter: sadri
    alt: "Paket deposunda Süper Kullanıcı Sadri mühürü kırık şüpheli bir kutuyu güler yüzle uzatıyor"
    prompt: "An orderly delivery depot with shelves of identical boxes sealed with green wax seals. The villain holds out one box with a broken seal and a suspicious green glow leaking out, offering it with an exaggerated friendly smile."
---

# Süreçler, paketler ve terminalde güvenli kalmak

> Linux'ta neyin çalıştığını görmek, neyi kurduğunu bilmek ve
> internetten kopyaladığın komutlara güvenmemek — üç temel alışkanlık.

![Paket deposunda Süper Kullanıcı Sadri mühürü kırık şüpheli bir kutuyu güler yüzle uzatıyor](../../gorseller/m04-05-a.webp)

## Süreçler ve servisler

```bash
ps aux | head            # çalışan süreçler
top                      # canlı görünüm (çıkış: q)
systemctl status ssh     # bir servisin durumu
sudo systemctl stop xyz  # servisi durdur
kill 1234                # PID'i 1234 olan süreci sonlandır
```

## Paket yöneticisi: güvenli kurulum

Linux'ta programlar **resmî depolardan**, imzalı paketlerle kurulur:

```bash
sudo apt update          # paket listesini yenile
sudo apt upgrade         # güncellemeleri kur
sudo apt install htop    # yeni paket kur
```

Paket yöneticisi, indirilen paketin imzasını doğrular. Rastgele bir siteden indirilen
`.deb` veya derlenmiş program bu güvenceyi vermez.

## Bash: komutları birleştirmek

```bash
#!/bin/bash
# yedek.sh — akademi klasörünü tarihli yedekle
tar -czf ~/yedek-$(date +%F).tar.gz ~/akademi
echo "Yedek tamam"
```

```bash
chmod u+x yedek.sh && ./yedek.sh
```

## 🚩 Tehlikeli kalıplar

| Kalıp | Neden tehlikeli? |
|---|---|
| `curl … \| bash` | İnternetten indirilen betiği **okumadan** çalıştırır |
| `rm -rf /` veya `rm -rf ~` | Her şeyi siler |
| `chmod -R 777` | Herkese her yetki |
| Anlamadığın base64'lü uzun komut | Ne yaptığı gizlenmiş olabilir |

Kural: **Okumadığın komutu çalıştırma.** Önce indir, oku, sonra karar ver.

## 🧪 Dene (5 dk)

`yedek.sh` betiğini oluştur, çalıştır ve `ls -l ~` ile yedek dosyasını gör.
Sonra `ps aux | grep bash` ile kendi shell'ini bul.

## ✅ Akılda kalsın

- `ps`, `top`, `systemctl` ile neyin çalıştığını gör.
- Programı resmî depodan, paket yöneticisiyle kur.
- Okumadığın komutu, özellikle `curl | bash`'i çalıştırma.
