---
id: f-08
tur: ders
baslik: "Firmware ve donanım: binwalk, UART ve güvenli güncelleme"
sure: 9
hedefler:
  - Bir laboratuvar firmware imajını binwalk ile açıp içinde risk aramak
  - Donanım hata ayıklama arayüzlerini ve güvenli önyükleme/güncelleme ilkelerini açıklamak
gorseller:
  - id: f-08-a
    tur: ai
    karakter: leman
    alt: "Lehimci Leman bir akıllı kilidin arka kapağını açmış; içeride dört parlayan pin ve çengele asılı, üzerinde soyut bir varsayılan simgesi olan bir anahtar buluyor"
    prompt: "Close-up of a smart door lock on a workbench with its back panel unscrewed and lifted away. Inside the casing, a small circuit board shows a row of four glowing pins and a tiny memory chip, and hanging from a little hook beside them is a brass key with a tag marked by an abstract default symbol. The villain, goggles down, clips a tiny probe onto the pins with a satisfied smirk, her glowing green soldering iron resting safely in its stand and her tiny drone holding the unscrewed panel."
---

# Firmware ve donanım: binwalk, UART ve güvenli güncelleme

> Firmware, cihazın içindeki **küçük işletim sistemidir**. Kapağı açan, çoğu zaman anahtarı da içeride bulur.
> 🔧 **Devre 8:** Laboratuvar kamerasının firmware imajı elimizde. Leman'ın bıraktığı kapılar içinde mi?

![Lehimci Leman bir akıllı kilidin arka kapağını açmış; içeride dört parlayan pin ve çengele asılı, üzerinde soyut bir varsayılan simgesi olan bir anahtar buluyor](../../gorseller/f-08-a.webp)

## binwalk ile firmware

```bash
binwalk gozcam-2.1.4.bin        # içindeki parçaları listele
binwalk -e gozcam-2.1.4.bin     # dosya sistemini çıkar
grep -rniE "pass|key|telnet|http://" _gozcam-2.1.4.bin.extracted/
```

Aranacaklar: `/etc/shadow` (boş parola), başlangıç betikleri (`rcS`), özel anahtarlar, koda gömülü parolalar, eski bileşen sürümleri.

## Donanım arayüzleri

| Arayüz | Ne işe yarar? | Risk |
|---|---|---|
| **UART** | Seri konsol (TX, RX, GND) | Açık bırakılırsa parolasız kök kabuk |
| **JTAG / SWD** | Çipte hata ayıklama | Belleği okumak, kodu değiştirmek |
| **SPI flash** | Firmware'in durduğu çip | Okuyucuyla tüm imaj kopyalanır |
| **I2C** | Küçük EEPROM, sensörler | Ayar ve anahtarlar okunur |

## Güvenli tasarım

- **Secure boot:** her aşama bir sonrakinin imzasını doğrular.
- **İmzalı güncelleme** HTTPS üzerinden, sürüm geri alma (rollback) korumasıyla.
- Üretimde UART/JTAG kapalı (eFuse ile kilitli), flash şifreli.

## ⚡ Elektrik ve kural

Yalnızca **kulübün laboratuvar kartları**. Bağlantıyı cihaz kapalıyken yap; 3.3 V ile 5 V'u karıştırma, GND'leri ortakla.
Antistatik bileklik tak, havyayı standında bırak. Bina sistemlerine, araçlara ve tıbbi cihazlara dokunmak yok.

## Gerçek bir ürünün açığını bulursan

Kendi cihazında gerçek bir açık bulduysan paylaşma, önce **eğitmene** söyle. Birlikte üreticiye sorumlu bildirim
(responsible disclosure) yapılır; düzeltme yayımlanmadan ayrıntı açıklanmaz.

## 🧪 Dene (5 dk)

`content/academy/lab/f-firmware-listesi.txt` dosyasını incele. En az **beş** sorun bul: parola, servis, güncelleme,
anahtar ve sürüm alanlarından. Her biri için secure boot / imzalı güncelleme / sertleştirme önerini yaz.

## ✅ Akılda kalsın

- Firmware imajı bir dosya sistemidir; sırlar orada da aranır.
- Açık UART/JTAG, cihazın arka kapısıdır; üretimde kapatılır.
- Güncelleme imzasızsa, güncelleyen herkes cihazın sahibidir.
