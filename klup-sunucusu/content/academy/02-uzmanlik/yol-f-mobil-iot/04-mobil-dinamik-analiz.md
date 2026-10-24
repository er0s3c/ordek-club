---
id: f-04
tur: ders
baslik: "Mobil dinamik analiz: emülatör, logcat ve trafik"
sure: 8
hedefler:
  - Emülatörde adb ve logcat ile bir uygulamanın çalışırken ne yaptığını izlemek
  - Uygulamanın veri klasöründe ve loglarda hassas veri aramak
gorseller:
  - id: f-04-a
    tur: ai
    karakter: leman
    alt: "Lehimci Leman cam bir fanusun içindeki telefonu stetoskopla dinliyor; telefondan dışarı parlayan bir log şeridi akıyor"
    prompt: "A smartphone sits inside a large glass terrarium on a workbench like a specimen under study, its screen glowing. The villain presses a stethoscope against the glass, listening intently with one eyebrow raised, while a long glowing paper tape of abstract symbols spools out of a small slot in the terrarium and curls across the bench. Her tiny drone hovers above, reading the tape with a tiny magnifier."
---

# Mobil dinamik analiz: emülatör, logcat ve trafik

> Statik analiz planı okur. Dinamik analiz (dynamic analysis) uygulamayı **çalıştırıp** ne yaptığını izler.
> 🔧 **Devre 4:** Kilit uygulamasına giriş yaptığında bir şey sessizce kayda geçiyor. Ne?

![Lehimci Leman cam bir fanusun içindeki telefonu stetoskopla dinliyor; telefondan dışarı parlayan bir log şeridi akıyor](../../gorseller/f-04-a.webp)

## Statik mi, dinamik mi?

| | Statik | Dinamik |
|---|---|---|
| Ne yapar? | Kodu ve ayarları okur | Çalışan uygulamayı izler |
| Neyi iyi bulur? | Gömülü sır, riskli ayar | Loga, diske, ağa giden gerçek veri |
| Kör noktası | Çalışma anında üretilen değer | Hiç tetiklenmeyen kod yolu |

İkisi birlikte kullanılır: statikte bulduğunu dinamikte doğrularsın.

## Laboratuvar düzeni

- **Android Studio emülatörü (AVD)**; "Google APIs" imajı test için root erişimi verir.
- Kişisel telefonunu root'lama: yalnızca emülatör ya da kulübün test cihazı.
- Uygulama: DIVA, InsecureBankv2 veya kendi uygulaman.

## adb ile ilk adımlar

```bash
adb devices                          # emülatör görünüyor mu?
adb install diva-beta.apk
adb shell pm list packages | grep diva
adb logcat | grep -iE "pass|token|kart"
```

## Veri klasörü

```bash
adb shell
run-as jakhar.aseem.diva ls -R       # debuggable uygulamalarda çalışır
```

| Konum | Ne aranır? |
|---|---|
| `shared_prefs/*.xml` | Düz metin parola, token |
| `databases/*.db` | Şifresiz SQLite tabloları |
| `files/`, `cache/` | Dışa aktarılmış rapor, görsel, geçici dosya |
| Harici depolama (`/sdcard`) | Başka uygulamaların da okuyabildiği dosyalar |

## Trafik

Emülatörün trafiği bir proxy'den (OWASP ZAP, Burp) geçirilir; istekleri ve yanıtları görürsün.
HTTPS için proxy'nin sertifikasını **yalnızca emülatöre** kurarsın. Neden bazen işe yaramadığını F05'te göreceğiz.

## 🧪 Dene (5 dk)

Emülatörde DIVA'yı aç, "Insecure Logging" ekranına sahte bir kart numarası gir (ör. `4000 0000 0000 0000`).
Aynı anda `adb logcat` çalıştır ve girdiğin değerin loga düşüp düşmediğini gör. Sonra "Insecure Data Storage – Part 1"
ekranında kaydettiğin bilgiyi `shared_prefs` içinde bul.

## ✅ Akılda kalsın

- Dinamik analiz yalnızca emülatörde ya da laboratuvar cihazında yapılır.
- Logcat ve `shared_prefs`, unutulan sırların ilk adresidir.
- Proxy, uygulamanın sunucuyla gerçekte ne konuştuğunu gösterir.
