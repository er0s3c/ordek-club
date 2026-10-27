---
id: m03-05
tur: ders
baslik: Sanal makine, yedek ve disk şifreleme
sure: 7
hedefler:
  - Güvenli deney ortamı olarak sanal makineyi tanımak
  - 3-2-1 yedekleme kuralını uygulamak
  - Disk şifrelemenin neyi koruduğunu açıklamak
gorseller:
  - id: m03-05-b
    tur: ekran
    alt: VirtualBox'ta bir sanal makinenin anlık görüntü (snapshot) listesi
    nasil: "VirtualBox'ta bir laboratuvar sanal makinesi seçin → sağ üstteki menüden 'Snapshots' (Anlık Görüntüler) görünümü. En az iki snapshot olsun (ör. 'temiz-kurulum' ve 'ders-oncesi'). 'Take' (Al) ve 'Restore' (Geri yükle) düğmelerini kehribar (#C9953B) çerçeveyle işaretleyin. VM adında kişisel bilgi olmasın."
  - id: m03-05-c
    tur: ai
    alt: "Üç aynı dosya kutusu: biri masada, biri harici diskte, biri bulutta; bulut olan uzakta ve kablosu yok"
    prompt: "Three identical glowing file boxes: one on a desk next to a laptop, one inside a small external hard drive on a shelf, and one carried away by a small cloud floating to a distant hill, with no cable connecting it to the desk. A storm cloud of red sparks hits the desk but the faraway box stays safe."
  - id: m03-05-d
    tur: ai
    alt: "Çalınan bir laptopun içi açılınca yalnızca kilitli, düğümlü ipliklerden bir yumak görünüyor"
    prompt: "A thief's gloved hands open a stolen laptop like a book, but inside there is only a tightly knotted ball of glowing threads wrapped around a padlock, impossible to untangle, while the owner's key hangs safely on a hook far away."
---

# Sanal makine, yedek ve disk şifreleme

> Bir şeyleri bozarak öğreneceksin. Bunu **kendi bilgisayarını bozmadan** yapmanın yolu: sanal makine.

::cizgi[m03-05-sahne]

## Sanal makine (VM)

Bilgisayarının içinde çalışan, ondan **yalıtılmış** ikinci bir bilgisayar. VirtualBox veya VMware ile kurulur.

En güzel özelliği **anlık görüntü** (snapshot): VM'in o anki hâlini kaydedersin,
ne olursa olsun tek tıkla geri dönersin.

![VirtualBox anlık görüntüleri](../../gorseller/m03-05-b.webp)

Laboratuvarda zararlı yazılım, açıklı uygulama veya riskli komut **hep VM'de** denenir.

## Yedekleme: 3-2-1 kuralı

![Üç aynı dosya kutusu: biri masada, biri harici diskte, biri bulutta; bulut olan uzakta ve kablosu yok](../../gorseller/m03-05-c.webp)

- **3** kopya (asıl + 2 yedek)
- **2** farklı ortamda (ör. harici disk + bulut)
- **1** tanesi başka bir yerde, bilgisayara bağlı değil

Fidye yazılımı (ransomware) bağlı diskleri de şifreleyebilir; o yüzden "bağlı değil" kısmı önemlidir.
Yedeği bir kez **geri yüklemeyi denemediysen**, yedeğin olduğundan emin değilsin.

## Disk şifreleme

![Çalınan bir laptopun içi açılınca yalnızca kilitli, düğümlü ipliklerden bir yumak görünüyor](../../gorseller/m03-05-d.webp)

Laptopun çalınırsa hırsız diski söküp başka bilgisayara takabilir. Disk şifreliyse dosyalar okunamaz.

- Windows: **BitLocker** veya **Cihaz şifreleme**
- macOS: **FileVault** · Linux: kurulumda **LUKS**

⚠️ Kurtarma anahtarını güvenli bir yere kaydet; kaybedersen dosyalarını sen de açamazsın.

## 🧪 Dene (3 dk)

Ayarlar → Gizlilik ve güvenlik → **Cihaz şifreleme** (veya BitLocker) açık mı?
En son ne zaman yedek aldın? Cevabı bir cümleyle yaz.

## ✅ Akılda kalsın

- Riskli her şey VM'de, snapshot alınarak denenir.
- 3-2-1: üç kopya, iki ortam, biri bağlantısız.
- Disk şifreleme çalınan cihazdaki veriyi korur; kurtarma anahtarını sakla.
