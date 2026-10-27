---
id: f-08
tur: ders
baslik: "Firmware ve donanım: binwalk, UART ve güvenli güncelleme"
sure: 9
hedefler:
  - Bir laboratuvar firmware imajını binwalk ile açıp içinde risk aramak
  - Donanım hata ayıklama arayüzlerini ve güvenli önyükleme/güncelleme ilkelerini açıklamak
gorseller:
  - id: f-08-b
    tur: ai
    alt: "Devre kartının kenarında açıkta kalmış dört küçük pim; araştırmacı onlara ince problarla bağlanıyor"
    prompt: "A close-up of a small green circuit board on a workbench with a row of four bare pins at its edge, a researcher's careful hands attaching fine probe clips to them, a magnifying lamp casting warm light."
  - id: f-08-c
    tur: ai
    alt: "Güncelleme paketi cihazın kapısında mühür kontrolünden geçiyor; mühürsüz paket geri dönüyor"
    prompt: "A small smart device with a door in its housing receives update parcels: a guard checks each parcel's wax seal against a reference, accepts the genuine one and sends back a parcel with a broken seal."
---

# Firmware ve donanım: binwalk, UART ve güvenli güncelleme

> Firmware, cihazın içindeki **küçük işletim sistemidir**. Kapağı açan, çoğu zaman anahtarı da içeride bulur.
> 🔧 **Devre 8:** Laboratuvar kamerasının firmware imajı elimizde. Leman'ın bıraktığı kapılar içinde mi?

::cizgi[f-08-sahne]

## binwalk ile firmware

```bash
binwalk gozcam-2.1.4.bin        # içindeki parçaları listele
binwalk -e gozcam-2.1.4.bin     # dosya sistemini çıkar
grep -rniE "pass|key|telnet|http://" _gozcam-2.1.4.bin.extracted/
```

Aranacaklar: `/etc/shadow` (boş parola), başlangıç betikleri (`rcS`), özel anahtarlar, koda gömülü parolalar, eski bileşen sürümleri.

## Donanım arayüzleri

![Devre kartının kenarında açıkta kalmış dört küçük pim; araştırmacı onlara ince problarla bağlanıyor](../../gorseller/f-08-b.webp)

| Arayüz | Ne işe yarar? | Risk |
|---|---|---|
| **UART** | Seri konsol (TX, RX, GND) | Açık bırakılırsa parolasız kök kabuk |
| **JTAG / SWD** | Çipte hata ayıklama | Belleği okumak, kodu değiştirmek |
| **SPI flash** | Firmware'in durduğu çip | Okuyucuyla tüm imaj kopyalanır |
| **I2C** | Küçük EEPROM, sensörler | Ayar ve anahtarlar okunur |

## Güvenli tasarım

![Güncelleme paketi cihazın kapısında mühür kontrolünden geçiyor; mühürsüz paket geri dönüyor](../../gorseller/f-08-c.webp)

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
