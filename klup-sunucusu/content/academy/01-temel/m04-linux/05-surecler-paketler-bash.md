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
  - id: m04-05-b
    tur: ai
    alt: "Resmî mühürlü kolilerin geldiği güvenli bir depo ile sokakta mühürsüz kutu satan şüpheli bir seyyar satıcı"
    prompt: "Split scene: on the left a clean official warehouse counter where sealed boxes with intact wax seals arrive on a conveyor belt and a clerk checks each seal with a magnifier; on the right a dark alley where a shady street vendor offers unsealed boxes with wires sticking out from a cart."
  - id: m04-05-c
    tur: ai
    alt: "Öğrenci internetten gelen kapalı bir zarfı açmadan doğrudan makinenin ağzına atmak üzereyken bir el onu durduruyor"
    prompt: "A student about to drop an unopened mysterious envelope straight into the mouth of a large humming machine, while another hand gently catches their wrist and offers a magnifying glass to read the envelope first."
---

# Süreçler, paketler ve terminalde güvenli kalmak

> Linux'ta neyin çalıştığını görmek, neyi kurduğunu bilmek ve
> internetten kopyaladığın komutlara güvenmemek — üç temel alışkanlık.

::cizgi[m04-05-sahne]

## Süreçler ve servisler

```bash
ps aux | head            # çalışan süreçler
top                      # canlı görünüm (çıkış: q)
systemctl status ssh     # bir servisin durumu
sudo systemctl stop xyz  # servisi durdur
kill 1234                # PID'i 1234 olan süreci sonlandır
```

## Paket yöneticisi: güvenli kurulum

![Resmî mühürlü kolilerin geldiği güvenli bir depo ile sokakta mühürsüz kutu satan şüpheli bir seyyar satıcı](../../gorseller/m04-05-b.webp)

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

![Öğrenci internetten gelen kapalı bir zarfı açmadan doğrudan makinenin ağzına atmak üzereyken bir el onu durduruyor](../../gorseller/m04-05-c.webp)

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
