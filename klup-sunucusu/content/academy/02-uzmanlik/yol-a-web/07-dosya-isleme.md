---
id: a-07
tur: ders
baslik: "Dosya işleme: yükleme, path traversal, LFI/RFI"
sure: 7
hedefler:
  - Dosya yükleme açıklarının nedenlerini sıralamak
  - Path traversal ve dosya dahil etme (LFI/RFI) açıklarını açıklamak
gorseller:
  - id: a-07-b
    tur: ai
    alt: "Bir arşiv labirentinde ok işaretlerini takip edip bir üst kata, oradan da kilitli yönetici dairesine çıkan merdivenler"
    prompt: "An archive building cutaway where a visitor meant to stay in a small public reading room climbs a hidden staircase up, and up again, past several floors to a locked private vault room at the top, the path traced with a glowing dotted line."
---

# Dosya işleme: yükleme, path traversal, LFI/RFI

> "Profil fotoğrafını yükle" düğmesi, sunucuya **bir dosya bırakma** iznidir. Peki o dosya fotoğraf değilse?
> 🗂️ **Çekmece 7:** Portalın belge yükleme sayfasına "ödev.pdf" adında bir paket geldi.

::cizgi[a-07-sahne]

## Dosya yükleme

| Hata | Neden tehlikeli? |
|---|---|
| Uzantıya ya da `Content-Type`'a güvenmek | İkisini de istemci belirler |
| Dosyayı web kökünde, orijinal adıyla saklamak | Sunucu onu **çalıştırabilir** |
| Boyut ve sayı sınırı yok | Disk dolar, hizmet durur |
| Görsel/PDF içeriğini işlemeden yayınlamak | Gömülü script, meta veri sızıntısı |

## Path traversal

![Bir arşiv labirentinde ok işaretlerini takip edip bir üst kata, oradan da kilitli yönetici dairesine çıkan merdivenler](../../gorseller/a-07-b.webp)

Dosya adı bir yola eklenirken `../` temizlenmezse, kullanıcı klasörden **yukarı** çıkar:

```http
GET /dosya?ad=../../../../etc/passwd
```

## LFI / RFI

Uygulama, parametredeki dosyayı **kodun içine dahil ediyorsa** (`include`):

- **LFI:** sunucudaki başka bir dosya okunur ya da çalıştırılır.
- **RFI:** uzaktaki bir dosya çekilip çalıştırılır (bugün nadir ama hâlâ var).

## Savunma

- Uzantı için **izin listesi** + dosyanın gerçek içeriğini kontrol et.
- Dosyaya **rastgele ad** ver, web kökünün **dışında** sakla, ayrı bir alan adından sun.
- Yolu birleştirdikten sonra **normalleştir** ve izinli klasörün içinde kaldığını doğrula.
- Kullanıcı girdisini asla `include`/`require` içine koyma.

## 🧪 Dene (5 dk)

Yerel Juice Shop'ta `http://127.0.0.1:3000/ftp` sayfasını aç. Hangi dosyalar listeleniyor?
Bir `.md` dosyasını, sonra başka uzantılı bir dosyayı indirmeyi dene. Sunucu hangi kurala göre karar veriyor?

## ✅ Akılda kalsın

- Uzantı ve MIME türü istemciden gelir; tek başına güvenilmez.
- Yüklenen dosya rastgele adla, web kökü dışında saklanır.
- Yol birleştirdikten sonra normalleştir ve klasör dışına çıkmadığını doğrula.
