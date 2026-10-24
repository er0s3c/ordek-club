---
id: m04-02
tur: ders
baslik: Linux'ta dosyalar nerede saklanır?
sure: 7
hedefler:
  - Linux dizin yapısındaki önemli klasörleri tanımak
  - Temel dosya ve dizin komutlarını kullanmak
gorseller:
  - id: m04-02-a
    tur: ai
    karakter: sadri
    alt: "Ters dönmüş klasör ağacının kökünde oturan Süper Kullanıcı Sadri elinde budama makasıyla"
    prompt: "An upside-down glowing tree hanging from the ceiling of a cavern, its branches ending in small folder-shaped leaves. The villain sits at the very root at the top like a king, holding a pair of pruning shears and eyeing the folders below."
---

# Linux'ta dosyalar nerede saklanır?

> Windows'ta `C:`, `D:` sürücüleri vardır. Linux'ta ise her şey **tek bir kökten** başlar: `/`

![Ters dönmüş klasör ağacının kökünde oturan Süper Kullanıcı Sadri elinde budama makasıyla](../../gorseller/m04-02-a.webp)

## Önemli adresler

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
