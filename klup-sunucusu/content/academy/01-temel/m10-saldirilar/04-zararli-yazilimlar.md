---
id: m10-04
tur: ders
baslik: Zararlı yazılımlar ailesi
sure: 6
hedefler:
  - Trojan, worm ve ransomware'i ayırt etmek
  - Zararlı yazılımların bulaşma yollarını ve savunmayı açıklamak
gorseller:
  - id: m10-04-b
    tur: ai
    alt: "Zararlı yazılım ailesi portresi: tahta at, kendini kopyalayan solucan, kilitli zincirli kutu, dürbünlü casus ve parola cebe atan yankesici"
    prompt: "A family portrait of mischievous creatures standing on a stage: a wooden horse with a secret hatch open, a worm splitting into copies of itself, a box wrapped in chains and padlocks, a tiny spy peering through binoculars, and a pickpocket slipping glowing keys into a coat pocket."
  - id: m10-04-c
    tur: ai
    alt: "Öğrenci laptopun ağ kablosunu çekiyor ve Wi-Fi anahtarını kapatıyor; arkadan BT görevlisi koşarak geliyor"
    prompt: "A student quickly unplugs the network cable from a laptop glowing with an infected red aura and flips its wireless switch off, while a helpful technician with a toolbox runs toward them through the door."
---

# Zararlı yazılımlar ailesi

> Hepsine "virüs" deriz ama aile kalabalıktır. Her üyenin **bulaşma yolu** ve **amacı** farklıdır.

::cizgi[m10-04-sahne]

## Aile üyeleri

![Zararlı yazılım ailesi portresi: tahta at, kendini kopyalayan solucan, kilitli zincirli kutu, dürbünlü casus ve parola cebe atan yankesici](../../gorseller/m10-04-b.webp)

| Tür | Nasıl yayılır? | Ne yapar? |
|---|---|---|
| **Trojan** (Truva atı) | Faydalı görünen programın içinde (crack, sahte güncelleme) | Arka kapı açar, veri çalar |
| **Worm** (solucan) | **Kendi kendine**, ağdaki açıklardan | Hızla çoğalır, ağı doldurur |
| **Ransomware** (fidye yazılımı) | Phishing eki, açık RDP, zayıf parola | Dosyaları şifreler, fidye ister |
| **Spyware** (casus yazılım) | Sahte uygulamalar, izin istismarı | Konum, mesaj, ekran bilgisi toplar |
| **Infostealer** | Crack/hile programları | Tarayıcıdaki parolaları ve oturum çerezlerini çalar |

## En sık bulaşma yolları

1. E-posta ekleri ve bağlantılar (bkz. M10-03)
2. "Ücretsiz" crack, hile ve korsan yazılımlar
3. Güncellenmemiş yazılımlardaki açıklar
4. Sahte tarayıcı eklentileri ve uygulamalar
5. Tanımadığın USB bellekler

## Fidye yazılımına karşı en iyi sigorta

Fidye ödemek dosyaları geri getireceğini **garanti etmez**. Asıl çare:
**bağlantısız, test edilmiş yedek** (M03-05'teki 3-2-1 kuralı).

## Bulaştıysa?

![Öğrenci laptopun ağ kablosunu çekiyor ve Wi-Fi anahtarını kapatıyor; arkadan BT görevlisi koşarak geliyor](../../gorseller/m10-04-c.webp)

- Cihazı ağdan **ayır** (Wi-Fi'yi kapat, kabloyu çek).
- Kapatıp açma; delilleri ve geri kurtarma şansını korumak için **uzmana** veya BT birimine haber ver.
- Başka bir cihazdan önemli hesaplarının parolalarını değiştir.

## 🧪 Dene (3 dk)

Bilgisayarındaki **tarayıcı eklentilerini** listele. Tanımadığın veya kullanmadığın var mı? Kaldır.

## ✅ Akılda kalsın

- Trojan kandırır, worm kendi yayılır, ransomware şifreler.
- Crack ve hile programları en sık bulaşma yollarındandır.
- Fidye yazılımına karşı en iyi çare bağlantısız yedektir.
