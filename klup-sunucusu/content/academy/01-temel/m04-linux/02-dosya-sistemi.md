---
id: m04-02
tur: ders
baslik: Linux'ta dosyalar nerede saklanır?
sure: 7
hedefler:
  - Linux dizin yapısındaki önemli klasörleri tanımak
  - Temel dosya ve dizin komutlarını kullanmak
gorseller:
  - id: m04-02-b
    tur: ai
    alt: "Kökü yukarıda olan ters bir ağaç; dallarında ev, kilitli kale, ayar dişlisi, günlük defteri, açık çöp kutusu ve alet çantası biçiminde odalar"
    prompt: "An upside-down tree with its glowing root at the top, branches spreading downward into small rooms: a cozy house for personal files, a locked little fortress, a cabinet full of gear-shaped settings, a shelf of diary logbooks, an open public bin where anyone can drop things in, and a toolbox of programs. A tiny explorer with a lantern climbs down the branches."
---

# Linux'ta dosyalar nerede saklanır?

> Windows'ta `C:`, `D:` sürücüleri vardır. Linux'ta ise her şey **tek bir kökten** başlar: `/`

::cizgi[m04-02-sahne]

## Önemli adresler

![Kökü yukarıda olan ters bir ağaç; dallarında ev, kilitli kale, ayar dişlisi, günlük defteri, açık çöp kutusu ve alet çantası biçiminde odalar](../../gorseller/m04-02-b.webp)

| Dizin | İçinde ne var? | Güvenlikçi için neden önemli? |
|---|---|---|
| `/home/kullanici` | Kullanıcının dosyaları | Kişisel veriler burada |
| `/root` | root kullanıcısının evi | Sadece root erişebilir |
| `/etc` | Ayar dosyaları | Kullanıcı listesi (`/etc/passwd`), servis ayarları |
| `/var/log` | Loglar | Olay incelemesinin ilk durağı |
| `/tmp` | Geçici dosyalar | Herkes yazabilir → saldırganların sevdiği yer |
| `/bin`, `/usr/bin` | Programlar | `ls`, `cat` gibi komutlar |

## Gezinme ve dosya işlemleri

```bash
cd /var/log          # klasöre git
cd ~                 # kendi ev dizinine dön
ls -la               # gizli dosyalar dahil ayrıntılı liste
mkdir proje          # klasör oluştur
touch notlar.txt     # boş dosya oluştur
cp notlar.txt yedek.txt
mv yedek.txt proje/
cat notlar.txt       # dosya içeriğini göster
rm proje/yedek.txt   # sil (çöp kutusu yok!)
```

Adı **nokta** ile başlayan dosyalar gizlidir (`.bashrc`, `.ssh`). `ls -a` ile görünür.

⚠️ `rm` geri alınamaz. `rm -rf` ile başlayan bir komutu, ne yaptığını bilmeden **asla** kopyalayıp çalıştırma.

## 🧪 Dene (5 dk)

Ev dizininde `akademi` klasörü oluştur, içine `hafta4.txt` dosyası koy, dosyaya bir şey yaz:

```bash
echo "Linux haftası başladı" > ~/akademi/hafta4.txt
```

Sonra `ls -la ~` ile gizli dosyaları listele. Kaç tane var?

## ✅ Akılda kalsın

- Her şey `/` kökünden başlar.
- `/etc` ayarlar, `/var/log` loglar, `/tmp` herkesin yazabildiği yer.
- `rm` geri alınamaz; gizli dosyalar nokta ile başlar.
