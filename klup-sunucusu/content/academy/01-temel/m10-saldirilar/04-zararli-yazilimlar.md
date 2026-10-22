---
id: m10-04
tur: ders
baslik: Zararlı yazılımlar ailesi
sure: 6
hedefler:
  - Trojan, worm ve ransomware'i ayırt etmek
  - Zararlı yazılımların bulaşma yollarını ve savunmayı açıklamak
gorseller:
  - id: m10-04-a
    tur: ai
    karakter: ferhat
    alt: "Fidyeci Ferhat içinden gölge yaratıklar çıkan bir hediye kutusunu sırıtarak uzatıyor"
    prompt: "The villain holds out a cheerful gift box with a bow, grinning menacingly. Out of the slightly opened box climb three small mischievous shadow creatures: one in a gift-box costume, one splitting into copies of itself, and one wrapping glowing file folders in chains with a padlock."
---

# Zararlı yazılımlar ailesi

> Hepsine "virüs" deriz ama aile kalabalıktır. Her üyenin **bulaşma yolu** ve **amacı** farklıdır.

![Fidyeci Ferhat içinden gölge yaratıklar çıkan bir hediye kutusunu sırıtarak uzatıyor](../../gorseller/m10-04-a.webp)

## Aile üyeleri

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

- Cihazı ağdan **ayır** (Wi-Fi'yi kapat, kabloyu çek).
- Kapatıp açma; delilleri ve geri kurtarma şansını korumak için **uzmana** veya BT birimine haber ver.
- Başka bir cihazdan önemli hesaplarının parolalarını değiştir.

## 🧪 Dene (3 dk)

Bilgisayarındaki **tarayıcı eklentilerini** listele. Tanımadığın veya kullanmadığın var mı? Kaldır.

## ✅ Akılda kalsın

- Trojan kandırır, worm kendi yayılır, ransomware şifreler.
- Crack ve hile programları en sık bulaşma yollarındandır.
- Fidye yazılımına karşı en iyi çare bağlantısız yedektir.
