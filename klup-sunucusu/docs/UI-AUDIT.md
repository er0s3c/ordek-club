# UI kontrolü — 24 Ekim 2026

## Düzeltilenler

- Üye tarafında yönetici/öğretmen yetkileri ve özellik grupları üst satıra sığmıyordu. Gerçek yazı genişliklerini ölçen, sığmayan grupları `Diğer` panelinde toplayan ortak header uygulandı. Bağlantılar mobil menü ve aramada korunur.
- Uzun kulüp adı dar ekranda hesap/bildirim kontrollerini itiyordu. Marka alanı küçülebilir, metni kesilebilir; kontroller sabit alanlarını korur.
- Açılır paneller ekran kenarında taşabiliyordu. Genişlik, yatay konum ve kullanılabilir yükseklik sınırlandı; uzun menüler kendi içinde kayar.
- Menü klavye davranışı tamamlandı: oklar, Home/End, Escape ve açan düğmeye odak dönüşü. Aynı sayfa bağlantısı da menüyü kapatır.
- Mobil menü ana içeriği aşağı itmek yerine header altında açılır; 68/76px header ve alt gezinme yüksekliğine uyar.
- 320px görünümde `.grid-2` kartları, dar kartlarda form alanları minimum sütun genişliği yüzünden taşıyordu. Minimumlar kapsayıcı genişliğiyle sınırlandı.
- Kart başlıkları/eylemleri dar alanda satıra geçebilir. Arama alanı küçülebilir; kısayol açıklamaları sarılır.
- Drawer native modal oldu: arka plan inert, kaydırma kilitli, Tab/Shift+Tab döngüsü ve odak dönüşü var. Inline callback değişmesi panel içindeki odağı yeniden başlatmaz.
- Panel girişi 320ms, çıkışı 180ms; menü girişi 240ms ve ortak easing düzenlendi. İşletim sistemi ve hesap azaltılmış hareket tercihi desteklenir.
- Radio rolündeki yedi düğmede desteklenmeyen `aria-pressed` kaldırıldı; seçili görünüm `aria-checked` ile korunur.

## Doğrulama kapsamı

Gerçek `AppShell`, `Drawer`, arama ve stil dosyaları, `scripts/preview-shell.mjs` üzerinden sentetik
yönetici verileriyle tarayıcıda çalıştırıldı. Gerçek üye verisi okunmadı; kayıt/arama API'si mock'tur.
Bu önizleme giriş gerektiren tüm ürün sayfalarının uçtan uca kontrolü değildir.

- Üye tarafındaki tam yetkili menü ve yönetim menüsü; uzun marka, İngilizce etiketler, bildirim/görev sayaçları.
- Her görünümde 320, 375, 768, 1180, 1200, 1280, 1440 ve 1920px: 16 kombinasyonda yatay sayfa taşması ve header çakışması yok.
- Overflow/hesap paneli ekran sınırları, ok/Home/End/Escape, odak dönüşü, mobil menü ve arama kontrol edildi.
- Drawer odak döngüsü, body scroll kilidi, animasyonlu kapanış, alttan panel ve azaltılmış hareket kontrol edildi.
- Dört header yerleşim testi, TypeScript, uyarısız ESLint ve tam üretim derlemesi geçti.
- Ekran görüntüsü alma, Ego Lite penceresi küçültülmüş olduğu için mümkün olmadı. Kontroller DOM ölçümleri ve gerçek klavye/tıklama etkileşimleriyle yapıldı.
- Yeniden üretim: `node scripts/preview-shell.mjs` → `http://localhost:3188/dashboard?long=1`; yönetim için `?mode=admin&long=1&locale=en`. Bu araç yalnız loopback arayüzüne bağlanır.

## Animasyon için incelenen GitHub depoları

Bu turda yeni animasyon kütüphanesi eklenmedi. Mevcut CSS/token sistemi korunur. Aşağıdaki kullanım
eşlemeleri bu projeye yönelik öneridir; depo açıklamalarının birebir kullanım taahhüdü değildir.

| Depo | Bu projede önerilen kullanım | Not |
|---|---|---|
| [Motion](https://github.com/motiondivision/motion) | Sekme göstergeleri, kart/listelerin yer değiştirmesi, giriş/çıkış yaşam döngüsü | MIT ana kütüphane; ana altyapı için ilk tercih. Motion+ ayrı üründür. |
| [Motion Primitives](https://github.com/ibelick/motion-primitives) | Daha iyi geçişler ve animasyonlu bileşen örnekleri | MIT, beta; Tailwind stilleri mevcut CSS'e uyarlanmalı. |
| [AutoAnimate](https://github.com/formkit/auto-animate) | Görev, bildirim ve değerlendirme listelerine ekleme/silme | MIT; liste animasyonu için hafif bir alternatif. |
| [Animate UI](https://github.com/imskyleen/animate-ui) | Accordion, menü ve ikon davranışları için referans | MIT + Commons Clause; standart MIT ile aynı koşullar değildir. |
| [Rive React](https://github.com/rive-app/rive-react) | Ördek maskotu için başarı, düşünme, hata gibi duruma bağlı vektör animasyonları | MIT runtime; özgün `.riv` dosyası ayrıca hazırlanır. |

Önerilen ilerleyiş: ortak hareket token'ları → Motion ile seçili sekme ve panel geçişleri → gerçek
veri listelerinde yer değiştirme → başarı/XP sunumu → özgün Rive maskotu. Sayfa genelinde sürekli
hareket yerine kullanıcının eylemini ve değişen durumu açıklayan hareketler kullanılmalı.

Beş aracın birlikte kullanılacağı ekranlar, teknik sınırlar, uygulama sırası ve kabul ölçütleri
[Animasyon Planı](ANIMASYON-PLANI.md) belgesinde tanımlandı.

Sonraki teslimatta beş kaynak entegre edildi. Bu incelemenin animasyon öncesi kapsamından ayrı
olan güncel testler ve ekran görüntüsü doğrulaması [uygulama raporunda](ANIMASYON-UYGULAMA.md).
