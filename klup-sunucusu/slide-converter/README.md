# Slayt dönüştürücü (PPTX/PPT → PDF)

Club'ın "Dosyadan içe aktar" özelliği PDF'i **tarayıcıda** işler; sunucu PDF ayrıştırmaz. PowerPoint dosyaları
ise önce bu ayrı servisle PDF'e çevrilir. Güvenilmeyen ofis dosyası **Club sürecinde açılmaz**; LibreOffice yalnız
bu konteynerde çalışır.

```
Tarayıcı ──PPTX──▶ Club /api/presentations/import/convert ──▶ slide-converter /convert ──▶ LibreOffice
   ▲             (yetki, imza, ZIP denetimi, ClamAV,           (gizli anahtar, imza, geçici profil,
   └────PDF + konuşmacı notları────┘  notlar: jszip)             makro kapalı, 90 sn, tek iş)
```

## Kurulum (compose)

```sh
# .env
SLIDE_CONVERTER_URL=http://slide-converter:8080
SLIDE_CONVERTER_SECRET=$(openssl rand -hex 32)

docker compose --profile slides up -d --build
```

`SLIDE_CONVERTER_URL` boşsa Club PPTX/PPT seçeneğini kapatır ("Sunucuda dönüştürücü kurulu değil — dosyayı PDF
olarak dışa aktarıp yükleyin."); PDF içe aktarma her durumda çalışır.

## Güvenlik sınırları

| Katman | Ayar |
| --- | --- |
| Ağ | Yalnız `slides_net` (iç ağ, `internal: true`): internete çıkış yok, port yayınlanmaz; Club dışında kimse erişemez. |
| Kimlik | Her istek `X-Converter-Secret` (≥ 32 karakter, sabit zamanlı karşılaştırma). |
| Girdi | Yalnız `POST /convert`, `application/octet-stream`, `X-File-Type: pptx|ppt`; en fazla 60 MB; içerik imzası türle uyuşmalı (PPTX: ZIP + `[Content_Types].xml` + `ppt/`; PPT: OLE + "PowerPoint Document"). |
| LibreOffice | İş başına geçici profil (`-env:UserInstallation`), makro güvenliği en yüksek + yürütme kapalı, bağlantı güncelleme ve Java kapalı; 90 sn sonra süreç grubu öldürülür; aynı anda tek dönüştürme, en fazla 4 bekleyen (fazlası 503). |
| Konteyner | Root olmayan kullanıcı, salt-okunur kök, `/tmp` tmpfs, `cap_drop: ALL`, `no-new-privileges`, bellek/CPU/pid sınırı. |

Club tarafı ayrıca: yalnız eğitmen/yönetici, aynı origin, saatte 20 dönüştürme, uzantı ↔ içerik imzası, ZIP yapı
denetimi (makro `vbaProject.bin` ve ActiveX içeren sunum reddedilir) ve `CLAMAV_HOST` tanımlıysa ClamAV taraması.

## Yanıt kodları

`200` PDF · `401` anahtar yanlış · `411` uzunluk yok · `413` çok büyük · `415` tür/içerik uyuşmuyor ·
`422` dönüştürülemedi · `503` kuyruk dolu · `504` süre aşımı.

## Test

```sh
cd klup-sunucusu
npm run test:slide-converter   # node --test; LibreOffice gerektirmez (sahte soffice ile)
```

Gerçek LibreOffice ile deneme (konteyner çalışırken, Club ağından):

```sh
curl -sS -X POST http://slide-converter:8080/convert \
  -H "X-Converter-Secret: $SLIDE_CONVERTER_SECRET" -H "X-File-Type: pptx" \
  -H "Content-Type: application/octet-stream" --data-binary @ornek.pptx -o ornek.pdf
```
