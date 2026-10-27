# Ördek Club — Animasyon uygulama raporu

24 Ekim 2026. [Referans plan](ANIMASYON-PLANI.md) mevcut siteye uygulandı.
Beş kaynak gerçek ürün bileşenlerine bağlandı; mor–krem tema, yazı tipleri ve mevcut navigasyon korunur.
Bu rapor, bütün özel kullanıcı sayfalarının kimliği doğrulanmış uçtan uca kabulü anlamına gelmez.

## Uygulanan entegrasyonlar

| Kaynak | Üründeki kullanım |
|---|---|
| Motion 14.6.0 | Header/Diğer/hesap menüleri, mobil menü, arama, native dialog Drawer, etkinlik geri bildirimi, XP ve öğrenme ilerlemesi, kayıt durumu ve seri günleri |
| Motion Primitives | MIT kaynaklı AnimatedBackground uyarlaması; ortak Tabs bileşenindeki kayan seçim zemini. Öğrenme alanı, değerlendirme kuyruğu ve mevcut Tabs kullanıcılarına uygulanır. |
| AutoAnimate 0.10.0 | Toast, bildirim, yaklaşan teslim, kişisel plan/kayıt/tekrar, öğretmen rapor/başvuru/atölye ve operasyon kanıt listeleri |
| Animate UI | Radix Accordion keepRendered uyarlaması; akademi ders/uygulama/kaynak grupları ve Linux lab brifing/sıfırlama/geçmiş alanları. Kapalı içerik inert; form durumu korunur. |
| Rive React 4.37.1 / Canvas 2.45.1 | Başarı, boş durum ve doğrulanmış seri dönüm noktaları için özgün ördek. Yedi kısa timeline/durum makinesi hazır; görünürlükle yüklenir ve tek tepkiden sonra durur. |

Motion Primitives ve Animate UI tüm tema/paket olarak taşınmadı; seçili kaynaklar mevcut CSS'e
uyarlandı. [Kaynak sürümleri ve lisanslar](../THIRD_PARTY_NOTICES.md) kaydedildi.
Animate UI dosyalarının MIT + Commons Clause bildirimi korunur.

Kopyalama onayı küçük bir SVG çizim animasyonuyla gösterilir. Bu öğe CSS kullanır; yalnız bir ikon
için SVG Motion paketini sayfalara taşımamak, üretim çıktısında ilgili ekranların First Load JS
değerini yaklaşık 39 kB azaltmıştır. Bu karşılaştırma aynı uygulamanın iki ardışık derlemesidir;
tüm animasyon çalışmasının eski siteye göre toplam boyut farkı değildir.

## Davranış ve erişilebilirlik

- Ortak tercih OS azaltılmış hareket **veya** hesabın `reduceMotion` ayarıdır. Yönetici layout'u da
  aynı kayıtlı tercihi uygular. Yeni JS hareketleri ve CSS hareketleri birlikte azaltılır.
- Native dialog, Escape, odak döngüsü, geri dönen odak ve body scroll kilidi korunur.
  Panel/arama hızlı kapanıp açılırsa hareket mevcut konumdan devam eder.
- Ortak sekmeler kontrollü/kontrolsüz kullanım destekler; ok/Home/End tuşları çalışır.
  Paneller mount halinde saklanır. Notlar, kişisel plan taslağı ve kaydedilmemiş tercihler kaybolmaz.
- Header çıkışındaki öğeler inert olur. Klavye ve konum hesabı yalnız etkin menüyü kullanır.
- Bir listenin yerleşimini AutoAnimate yönetir; aynı listeye Motion layout uygulanmaz.
- Rive görünür alan dışına çıktığında veya sekme gizlendiğinde durur; yükleme hatasında eski SVG
  gösterilir. Azaltılmış modda runtime yüklenmez. Canvas dekoratiftir; sonuç metni ayrıca bulunur.
- Başarı tepkileri oturum içinde olay kimliğiyle tekrar gösterilmez. Seri kutlaması yalnız doğrulanmış
  aktif günde ve belirli dönüm noktalarında gösterilir; telafi/sınav koruması ödül üretmez.
- Lab terminalinin PTY akışı animasyon kapsamına alınmadı. Yalnız durum/brifing/kontrol alanları değişti.
  Süre sayacı her saniye ekran okuyucuya bildirilmez.
- Kullanıcı, ders, ilerleme, XP, yetki veya belge şeması değiştirilmedi. AI entegrasyonu açılmadı.

## Özgün Rive varlığı

`public/animations/ordek-club.riv`: 4.328 bayt. Geometri ve animasyon kaynağı
`scripts/build-duck-rive.mjs` içindedir; editör hesabı veya dış servis gerektirmeden yeniden üretilebilir.
Durumlar: wave, cheer, search, sleep, level, streak, encourage.

SHA-256: `7f4145a6d4b42cfe9a47956d9489e44f864974180a602f8f08e722c90b220abd`.
React runtime'ın birincil WASM dosyası 2.128.716 bayt, uyumluluk yedeği 2.155.107 bayttır.
Bunlar aynı origin'den sunulur; normal durumda ikisi birden indirilmez. Farklı ağ/cihazlarda aktarılan
sıkıştırılmış boyut ve yükleme süresi ayrıca ölçülmelidir.

Üretim CSP'sine yalnız WebAssembly derlemesi için `wasm-unsafe-eval` eklendi;
JavaScript `unsafe-eval` üretimde açılmadı. Üretim benzeri nonce/strict-dynamic CSP altında
yedi durumun hatasız yüklendiği, dış origin isteği olmadığı ve canvas karelerinin değiştiği doğrulandı.
WASM ve `.riv` dosyaları üye verisi veya AI isteği içermez.

## Doğrulama

- `npm run typecheck`: geçti.
- `npm run lint`: sıfır hata ve uyarıyla geçti.
- `npm run build`: Next.js üretim derlemesi ve sunucu bundle'ları geçti.
- İki birim dosyasında 6 test: hareket politikası/bozuk ilerleme değerleri ve header sığdırma kuralları geçti.
- Playwright'ta 6 akış geçti; tekrar denemeyle geçiş veya atlanan test yok.
- Responsive genişlikler: 320, 375, 768, 1180, 1200, 1280, 1440, 1920 px. Uzun marka/header'da yatay taşma yok.
- Masaüstü ve 375px mobil ekran görüntüleri incelendi. Maskot katman sırası görsel kontrol sırasında düzeltildi.
- Yerel geliştirme sunucusu son kodla yeniden başlatıldı: `/api/health` 200, veritabanı `ok`,
  `/login` 200 ve özgün `.riv` dosyası 200. Giriş yanıtında WASM CSP izni doğrulandı.

Playwright akışları: sekme/not/akordeon/Drawer/arama odağı; yedi Rive durumu ve gerçek kare değişimi;
liste/ilerleme ile OS/hesap hareket tercihleri; kişisel öğrenme alanında taslak korunması;
Rive varlık hatasında SVG yedeği; responsive menü ve klavye erişimi.

Testler `scripts/preview-motion.mjs` üzerinden **gerçek bileşenler + sentetik OWNER verisi** kullanır.
Önizleme yalnız loopback'te çalışır; API/DB yazmaları kapalıdır. Üretimde demo sayfası açılmadı.
Ego tarayıcısında DOM/etkileşim kontrolleri yapıldı; ekran yakalama zaman aşımına uğradığı için görsel
doğrulama Playwright'ın ayrı Edge test profiliyle oluşturduğu görüntülerden tamamlandı.

Özel öğretmen/öğrenci sayfalarının tamamı için giriş yapılmış uçtan uca senaryolar, gerçek düşük güçlü
cihazdaki kare süreleri ve animasyon öncesine göre toplam JS farkı bu teslimatta doğrulanmış sayılmaz.
Üretim çıktısı: paylaşılan First Load JS 103 kB, giriş 126 kB, kişisel öğrenme alanı 175 kB,
değerlendirme kuyruğu 177 kB. Bunlar Next.js raporudur; sonradan yüklenen özellik/runtime varlıklarını
tek başına göstermez. Düşük güçlü cihaz kapasitesi/60 FPS iddiası yapılmaz.

Paket denetiminde raporlanan nodemailer, zod, vitest/tinypool bulguları bu çalışma öncesinde kullanılan
sürümlere aittir. Bu işte eklenen animasyon paketlerine ait bir advisory raporlanmadı;
ilgisiz bağımlılıklara zorunlu büyük sürüm yükseltmesi uygulanmadı.

## Yeniden çalıştırma

```sh
npm run motion:duck       # özgün .riv dosyasını üret
npm run motion:assets     # sabit runtime sürümünün WASM ve lisansını public'e kopyala
npm run typecheck
npm run lint
npx vitest run --config vitest.pure.config.ts tests/unit/motion-policy.test.ts tests/unit/header-layout.test.ts
npm run test:motion       # Playwright Chromium kurulu ortam
npm run build
```

Windows'ta kurulu Edge ile: PowerShell'de `$env:CLUB_TEST_BROWSER='msedge'; npm run test:motion`.
Önizleme: `node scripts/preview-motion.mjs` → `http://127.0.0.1:3189/dashboard?long=1`.
Gerçek kişisel alan bileşeninin örnek verili görünümü: `?workspace=1`.

`predev` ve `build` yerel WASM dosyalarını otomatik hazırlar. Docker çalışma imajında varlıklar,
runtime lisansı ve uyarlanan bileşenlerin bildirimleri bulunur. `NEXT_PUBLIC_MOTION_ENABLED=false`
ile yeniden derlemek ortak hareket katmanını kapatır; mevcut işlevler statik olarak kalır.

Görsel test çıktıları ve ayrıntılı loglar git'e alınmayan `test-results/` dizinindedir.
