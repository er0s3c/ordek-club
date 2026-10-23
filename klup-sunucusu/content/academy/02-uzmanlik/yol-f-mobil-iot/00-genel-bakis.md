---
id: f-00
tur: bilgi
baslik: "Yol F — Mobil, IoT ve Gömülü Sistem Güvenliği"
sure: 3
gorseller:
  - id: f-00-a
    tur: ai
    karakter: leman
    alt: "Lehimci Leman bir atölye tezgâhında açık bir telefona, akıllı kilide ve küçük bir kameraya ucu yeşil parlayan havyasıyla kablo lehimliyor; kablolar arkadaki parlayan bir aynaya uzanıyor"
    prompt: "A cluttered workbench seen at a slight angle under a hanging lamp: an opened smartphone, a small microcontroller board with a sensor, a smart door lock with its back panel off, a tiny camera and a small smart bulb. The villain leans over the bench with her magnifier goggles down, carefully soldering a thin glowing wire onto the lock's board, her tiny drone holding the wire. From every device, thin glowing green wires run to a large oval mirror in the shadows behind the bench, its surface shimmering like an eye."
---

# Yol F — Mobil, IoT ve Gömülü Sistem Güvenliği

> Cebindeki uygulamalar ve kampüsteki akıllı cihazlar: içleri nasıl çalışır, nereden zayıflar?

![Lehimci Leman bir atölye tezgâhında açık bir telefona, akıllı kilide ve küçük bir kameraya ucu yeşil parlayan havyasıyla kablo lehimliyor; kablolar arkadaki parlayan bir aynaya uzanıyor](../../gorseller/f-00-a.webp)

> 🕴️ **DOSYA: Lehimci Leman** · *Devre Ustası*
>
> ![Lehimci Leman — Devre Ustası](../../gorseller/karakter-leman.webp)
>
> 📼 **Bölüm — Sezon 2: Gözler.** Kampüsteki akıllı kilitler gece kendi kendine açılıyor, kameralar boş koridorları değil seni izliyor. Ayna'nın gözleri ve kulakları her cihazda; onları kuran el tek: Lehimci Leman. Görevin laboratuvar tezgâhında; her cihazı aç, her kapıyı bul, her varsayılan parolayı değiştir.
>
> **Kim o?** Süper Kullanıcı Sadri'nin kız kardeşi. Ayna'nın gözlerini ve kulaklarını (kamera, kilit, sensör) o kurar.
> [Gölge Ağ hikâyesi →](../../00-program/09-golge-ag.md)

**Ön koşul:** İşletim sistemleri (M03), ağ (M05), temel programlama (M07)

## 12 ders

| # | Ders | Tek cümleyle |
|---|---|---|
| F01 | [Mobil güvenlik mimarisi](01-mobil-guvenlik-mimarisi.md) | Sandbox, izinler, güvenli depolama |
| F02 | [Android uygulama yapısı](02-android-uygulama-yapisi.md) | APK, Manifest, bileşenler |
| F03 | [Android statik analiz](03-android-statik-analiz.md) | JADX ve MobSF ile kod/konfigürasyon incelemesi |
| F04 | [Mobil dinamik analiz](04-mobil-dinamik-analiz.md) | Emülatör, logcat, trafik analizi |
| F05 | [Mobil API güvenliği](05-mobil-api-guvenligi.md) | Token saklama, sertifika doğrulama |
| F06 | [iOS güvenliğine giriş](06-ios-guvenligi.md) | Keychain, entitlements, sandbox |
| F07 | [IoT temelleri](07-iot-temelleri.md) | ESP32, MQTT, Bluetooth |
| F08 | [Firmware ve donanım](08-firmware-donanim.md) | Secure boot, UART/SPI/I2C, güncelleme |
| F09 | [IoT ağ güvenliği](09-iot-ag-guvenligi.md) | İzolasyon, şifreli haberleşme |
| F10 | [Endüstriyel sistemler](10-endustriyel-sistemler.md) | IT/OT, SCADA, Modbus — yalnız simülasyon |
| F11 | [IoT güvenlik testi](11-iot-guvenlik-testi.md) | Tehdit modeli, firmware envanteri |
| F12 | [Final](12-final-guvenlik-denetimi.md) | Kendi uygulaman/cihazın için güvenlik denetimi |

## Bitirme çıktısı

Mobil uygulama veya IoT prototipi için **güvenlik değerlendirmesi**.

Testler kendi cihazların, emülatörler ve eğitim için hazırlanmış uygulamalar üzerinde yapılır.
