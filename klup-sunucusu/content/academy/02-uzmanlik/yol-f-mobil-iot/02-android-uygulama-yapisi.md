---
id: f-02
tur: ders
baslik: "Android uygulama yapısı: APK, Manifest ve bileşenler"
sure: 8
hedefler:
  - Bir APK dosyasının içindeki parçaları ve görevlerini tanımak
  - AndroidManifest.xml içindeki riskli ayarları ve dışa açık bileşenleri bulmak
gorseller:
  - id: f-02-b
    tur: ai
    alt: "Açılmış bir kargo kutusu: içinde kod dişlileri, resim kutusu ve en üstte kurallar listesi olan manifest belgesi"
    prompt: "An opened shipping box on a workbench revealing its contents in neat compartments: a bundle of gears, a box of small pictures and icons, a folded sealed manifest document on top, and a signature seal on the lid."
---

# Android uygulama yapısı: APK, Manifest ve bileşenler

> Bir APK aslında bir **zip dosyası**. Açınca uygulamanın planı da içinden çıkar.
> 🔧 **Devre 2:** Leman'ın "KampüsKilit" uygulamasının manifesti laboratuvara düştü. Kapılardan kaçı açık?

::cizgi[f-02-sahne]

## APK'nın içi

![Açılmış bir kargo kutusu: içinde kod dişlileri, resim kutusu ve en üstte kurallar listesi olan manifest belgesi](../../gorseller/f-02-b.webp)

```bash
unzip -l kampuskilit.apk          # içeriği listele
apktool d kampuskilit.apk -o kilit/   # Manifest'i okunur XML'e çevir
```

| Parça | Görevi |
|---|---|
| `AndroidManifest.xml` | Paket adı, izinler, bileşenler, güvenlik ayarları |
| `classes.dex` | Derlenmiş kod (Dalvik bytecode) |
| `res/`, `assets/` | Görseller, metinler, gömülü dosyalar |
| `lib/` | Yerel (native) kütüphaneler, `.so` |
| `META-INF/` | İmza bilgisi |

## Dört bileşen

- **Activity:** bir ekran.
- **Service:** arka planda çalışan iş.
- **BroadcastReceiver:** sistem ya da başka uygulamalardan gelen yayınları dinler.
- **ContentProvider:** veriyi başka uygulamalarla paylaşır.

`android:exported="true"` olan bileşeni **başka uygulamalar da başlatabilir.** İzin (permission) koruması yoksa,
"Yönetici paneli" ekranı giriş yapmadan açılabilir.

## Manifest kırmızı bayrakları

| Ayar | Risk |
|---|---|
| `android:debuggable="true"` | Üretimde hata ayıklayıcı bağlanabilir, veri klasörü okunabilir |
| `android:allowBackup="true"` | Uygulama verisi yedekle dışarı alınabilir |
| `android:usesCleartextTraffic="true"` | Şifresiz HTTP'ye izin |
| İzinsiz `exported` bileşen | Başka uygulama ekranı/servisi tetikler |
| `<meta-data>` içinde anahtar | Herkesin okuyabildiği sır |

## Düzeltme nasıl görünür?

- Dışarıdan çağrılması gerekmeyen bileşen: `android:exported="false"`.
- Gerekiyorsa: `android:permission` ile koru, gelen her veriyi doğrula.
- İşlevle uyuşmayan izni sil; sırrı uygulamadan çıkarıp sunucuya taşı.
- Üretim derlemesinde `debuggable` ve cleartext kapalı, yedeklemeden hassas veri hariç.

## 🧪 Dene (5 dk)

`content/academy/lab/f-AndroidManifest.xml` dosyasını aç. Bu bir kapı kilidi uygulaması.
En az **beş** kırmızı bayrak bul: işleviyle uyuşmayan izinler, riskli ayarlar ve korumasız dışa açık bileşenler.
Her biri için tek satırlık bir düzeltme yaz.

## ✅ Akılda kalsın

- APK bir zip'tir; Manifest uygulamanın güvenlik planıdır.
- `exported="true"` ve izin yoksa, bileşen herkese açık kapıdır.
- `debuggable`, `allowBackup` ve cleartext ayarları üretimde kapalı olmalı.
