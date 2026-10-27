---
id: f-00
tur: bilgi
baslik: "Yol F — Mobil, IoT ve Gömülü Sistem Güvenliği"
sure: 3
gorseller:
  - id: f-00-b
    tur: ai
    alt: "Atölye masasında açılmış bir akıllı telefon, akıllı ampul, devre kartı ve küçük bir dron; büyüteçli lambanın altında"
    prompt: "A cozy hardware workshop table under a magnifier lamp: an opened smartphone, a smart light bulb, a small circuit board with pins and a tiny drone, each with a student carefully inspecting it."
---

# Yol F — Mobil, IoT ve Gömülü Sistem Güvenliği

> Cebindeki uygulamalar ve kampüsteki akıllı cihazlar: içleri nasıl çalışır, nereden zayıflar?

::cizgi[f-00-sahne]

> 🕴️ **DOSYA: Lehimci Leman** · *Devre Ustası*
>
> ![Lehimci Leman — Devre Ustası](../../gorseller/karakter-leman.webp)
>
> **Kim o?** Süper Kullanıcı Sadri'nin kız kardeşi. Ayna'nın gözlerini ve kulaklarını (kamera, kilit, sensör) o kurar.
> [Gölge Ağ hikâyesi →](../../00-program/09-golge-ag.md)

::cizgi[leman-acilis]

**Ön koşul:** İşletim sistemleri (M03), ağ (M05), temel programlama (M07)

## 12 ders

![Atölye masasında açılmış bir akıllı telefon, akıllı ampul, devre kartı ve küçük bir dron; büyüteçli lambanın altında](../../gorseller/f-00-b.webp)

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
