---
id: m04-01
tur: ders
baslik: Neden herkes Linux terminalinden bahsediyor?
sure: 6
hedefler:
  - Linux'un siber güvenlikteki yerini açıklamak
  - Terminal, shell ve dağıtım kavramlarını ayırt etmek
gorseller:
  - id: m04-01-a
    tur: ai
    karakter: sadri
    alt: "Süper Kullanıcı Sadri sunucu tahtında, önünde yeşil parlayan dev bir terminal penceresi"
    prompt: "A dark server room: the villain sprawls on his throne of server racks, and in front of him floats a huge dark terminal window emitting a soft green glow, filled with abstract glowing lines and a blinking block cursor (no readable characters). His monocle reflects the screen."
---

# Neden herkes Linux terminalinden bahsediyor?

> İnternetteki sunucuların büyük çoğunluğu Linux çalıştırır.
> Güvenlik araçlarının çoğu da orada yaşar. **Terminali bilen, kapıyı bilir.**

![Süper Kullanıcı Sadri sunucu tahtında, önünde yeşil parlayan dev bir terminal penceresi](../../gorseller/m04-01-a.webp)

> 🕴️ **DOSYA: Süper Kullanıcı Sadri** · *Root Babası*
>
> ![Süper Kullanıcı Sadri — Root Babası](../../gorseller/karakter-sadri.webp)
>
> 📼 **Bölüm 4 — Kök.** Şehrin eski veri merkezinde, kimsenin dokunmadığı bir sunucuda yaşlı bir adam oturuyor. Süper Kullanıcı Sadri her şeyi sudo ile yapar, her dosyaya 777 verir. Söylenene göre yirmi yıl önce kapüşonlu bir gence ilk terminalini o açtı.
>
> **Tehdit:** sudo yetkisini kötüye kullanmak, chmod 777, okunmadan çalıştırılan komutlar. · [Gölge Ağ hikâyesi →](../../00-program/09-golge-ag.md)

## Linux nedir?

Ücretsiz ve açık kaynak bir işletim sistemi çekirdeği. Etrafına araçlar eklenerek **dağıtımlar** oluşur:

| Dağıtım | Ne için? |
|---|---|
| **Ubuntu** | Başlangıç ve masaüstü için en yaygın |
| **Debian** | Kararlı sunucular; Ubuntu'nun temeli |
| **Kali Linux** | Güvenlik testleri için hazır araç kutusu |

> Kali bir "hacker sistemi" değil, **alet çantasıdır**. Günlük kullanım için değil, laboratuvar için.

## Terminal ve shell

- **Terminal** — Komut yazdığın pencere.
- **Shell** — Yazdığını anlayıp çalıştıran program. En yaygını **Bash**.

İlk komutların:

```bash
whoami        # ben kimim?
pwd           # şu an hangi klasördeyim?
ls            # burada ne var?
date          # tarih ve saat
```

Komut çıktısındaki `$` işareti normal kullanıcıyı, `#` ise **root** (yönetici) kullanıcısını gösterir.

## Neden grafik arayüz yerine terminal?

- Sunucularda çoğu zaman grafik arayüz **yoktur**.
- Komutlar birleştirilip **otomatikleştirilebilir**.
- Ne yaptığın tam olarak kayıtlıdır; tekrar edilebilir.

## 🧪 Dene (5 dk)

Laboratuvardaki Ubuntu VM'ini aç (Windows'ta WSL de olur). Yukarıdaki dört komutu çalıştır.
Sonra `whoami` çıktısını ve `pwd` çıktısını not et.

## ✅ Akılda kalsın

- Sunucuların ve güvenlik araçlarının çoğu Linux'ta çalışır.
- Terminal pencere, shell (Bash) tercümandır.
- `$` normal kullanıcı, `#` root.
