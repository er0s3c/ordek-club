# Ördek Club — Beş araçla profesyonel hareket tasarımı

Tarih: 24 Ekim 2026. Durum: beş entegrasyon siteye uygulandı.
Gerçek teslimat, test kapsamı ve doğrulanmamış ölçümler [uygulama raporunda](ANIMASYON-UYGULAMA.md).
Bu belge, [UI incelemesindeki](UI-AUDIT.md) düzeltmelerin üzerine uygulanır ve
[ürün yol haritasını](ROADMAP.md) tamamlar.

## 1. Hedef ve tasarım sınırları

Hareket; kullanıcının nerede olduğunu, neyin değiştiğini ve işlemin sonucunu açıklayacak.
Ördek Club'ın mor–krem renkleri, Readex Pro/Lexend Tera yazı tipleri, mevcut kartları, butonları
ve navigasyon yapısı korunacak. Yeni bir tema veya tüm uygulamayı kapsayan Tailwind geçişi yapılmayacak.

- Yönetici header'ındaki taşma çözümü, mobil menü ve klavye davranışları korunacak.
- Ders metni, terminal çıktısı ve öğretmenin sunum alanı sürekli hareket etmeyecek.
- Başarı animasyonu yalnız sunucunun doğruladığı sonuçtan sonra gösterilecek; XP, seri veya belge üretmeyecek.
- İlk görev akışı sade kalacak. Animasyonlar kullanılabilir içeriğin gösterilmesini bekletmeyecek.
- İşletim sistemi **veya** hesap ayarı azaltılmış hareket istiyorsa statik/azaltılmış sürüm kullanılacak.
- Bu çalışma için veri modeli geçişi veya AI sağlayıcısı gerekmiyor. AI entegrasyonu sonraya bırakılmış durumda kalacak.

## 2. Beş aracın kesin sorumluluğu

| Araç | Gerçek ürün kullanımı | Entegrasyon biçimi | Sınır |
|---|---|---|---|
| [Motion](https://github.com/motiondivision/motion) | Header menüleri, arama/panel giriş ve çıkışı, ilerleme değişimi, işlem geri bildirimi | Ortak sağlayıcı, hareket token'ları ve küçük istemci bileşenleri | Uygulamanın ana hareket altyapısı. Aynı öğenin mevcut CSS/WAAPI animasyonu kaldırılıp tek yönetici bırakılacak. |
| [Motion Primitives](https://github.com/ibelick/motion-primitives) | Akademi/çalışma alanı sekmelerinde kayan seçim zemini ve kontrollü içerik geçişi | Kaynağı incelenen seçili bileşenler mevcut CSS'e uyarlanacak; Motion bağımlılığı paylaşılacak | Beta kaynaklar sürüm/commit ile sabitlenecek. Mevcut sekme erişilebilirliği korunacak. |
| [AutoAnimate](https://github.com/formkit/auto-animate) | Bildirimler, günlük görevler ve öğretmen değerlendirme kuyruğunda eklenen/silinen/sırası değişen satırlar | Hesap hareket tercihini de uygulayan ortak liste sarmalayıcısı | Aynı listeye Motion layout animasyonu eklenmeyecek; terminal ve sanallaştırılmış tablolar kapsam dışı. |
| [Animate UI](https://github.com/imskyleen/animate-ui) | Modül akordeonları, lab brifingi/ipucu açılır alanları ve kopyalama geri bildirim ikonu | Seçili Accordion/Collapsible ve ikon kaynakları mevcut bileşenlere uyarlanacak | Sekmeler veya Drawer ikinci kez bu araçla yönetilmeyecek. Lisans bildirimleri korunacak. |
| [Rive React](https://github.com/rive-app/rive-react) | İlk görev, ders tamamlama, seviye ve seri dönüm noktalarında özgün ördek maskotu | İhtiyaç anında yüklenen istemci bileşeni + özgün `.riv` durum makinesi | Runtime tek başına maskot animasyonu üretmez. Özgün varlık hazırlanacak; mevcut SVG her zaman yedek görünüm olacak. |

**Tek sahip kuralı:** Her DOM alt ağacının yerleşim hareketini tek araç yönetecek. Örneğin AutoAnimate
listeyi taşırken içindeki düğmenin basılma geri bildirimi Motion olabilir; iki araç aynı satırın
`transform`, yüksekliğini veya çıkış yaşam döngüsünü birlikte yönetemez. Animate UI ve Motion Primitives
ayrı birer genel animasyon motoru olarak kurulmayacak; seçili ürün bileşenleri için kullanılacak.

## 3. Ekran ekran uygulanacak tasarımlar

| # | Ekran / öğe | Planlanan davranış | Sorumlu |
|---|---|---|---|
| 1 | Yönetici ve üye header menüleri | Tetikleyiciye göre açılan küçük mesafeli giriş; kapanırken odak dönüşü; ekran kenarına sığma korunur | Motion |
| 2 | Mobil menü | Sabit header altında kısa panel geçişi; panel kendi içinde kayar; link seçimi kapanışı beklemez | Motion |
| 3 | Komut paleti / arama | Arka plan ve sonuç panelinin uyumlu açılışı; sonuçların gelişinde kısa durum geçişi | Motion |
| 4 | Yan/alttan Drawer | Mevcut native dialog, odak döngüsü ve kaydırma kilidi üzerinde tek giriş/çıkış yaşam döngüsü | Motion |
| 5 | Akademi sekmeleri | Seçili sekmenin mor zemini konum değiştirir; içerik boyu kararlı kalır | Motion Primitives |
| 6 | Ders yardımcı araçları | Notlar, terimler ve kaydedilenler arasında kısa içerik geçişi; yazılan metin kaybolmaz | Motion Primitives |
| 7 | Filtre çipleri | Seçim/basılma geri bildirimi; filtre sonucu metinle de belirtilir | Motion |
| 8 | Günlük görev listesi | Tamamlanan görev satırı durum değiştirir; kalan görevler yumuşak yerleşir | AutoAnimate |
| 9 | Bildirim listesi | Okundu/silindi değişikliklerinde satır hareketi; toplu işlem tek geçişte biter | AutoAnimate |
| 10 | Öğretmen değerlendirme kuyruğu | Teslim eklenmesi/incelemenin bitmesi görünür; odaktaki eylem aniden yer değiştirmez | AutoAnimate |
| 11 | Akademi modülleri | Açılan modülün içeriği kontrollü yüksekliğe geçer; başlıkta yön ikonu değişir | Animate UI |
| 12 | Lab brifingi ve ipuçları | İpucu açılmasıyla ilgili içerik ortaya çıkar; ücret/puan etkisi varsa mevcut metin açık kalır | Animate UI |
| 13 | Komut/kanıt kopyalama | Kullanıcının tıklamasından sonra kısa kopyalandı ikonu ve erişilebilir metin | Animate UI |
| 14 | Ders etkinlikleri | Doğru/yanlış durumu renk, ikon ve açıklamayla gösterilir; odağı çalan sallanma kullanılmaz | Motion |
| 15 | Ders/yol ilerlemesi | Sunucudan gelen önceki değerden yeni değere kısa dolum; ilk yüklemede sahte kazanım gösterilmez | Motion |
| 16 | XP / seviye çubuğu | Doğrulanmış fark kadar dolum, tek seferlik seviye vurgusu; ekran okuyucuya sonuç bir kez bildirilir | Motion |
| 17 | İlk görev ve boş durumlar | Maskot kısa selamlama/arama tepkisi verir; metin ve birincil eylem hemen kullanılabilir | Rive |
| 18 | Ders tamamlama | Sabit boyutlu maskot alanında kısa kutlama; kazanılan beceriler ve sonraki adım aynı anda okunabilir | Rive + ayrı Motion metin alanı |
| 19 | Streak merkezi | Takvimde aktif/korunan günler açık biçimde ayrılır; yalnız yeni dönüm noktasında kısa maskot tepkisi | Motion takvim, Rive ayrı maskot alanı |
| 20 | Linux lab oturum durumu | Kuyruk, bağlanıyor, aktif, bağlantı kesildi ve sona erdi durumları arasında kısa geçiş | Motion; PTY çıktısı kapsam dışı |
| 21 | Canlı operasyon kanıt panosu | Yeni açılan kanıt kartı kısa vurgulanır; yeniden bağlantıda tüm eski kanıtlar yeniden kutlanmaz | Motion |
| 22 | Studio / öğretmen araçları | Kaydediliyor–kaydedildi–hata göstergesi geçişi; editör tuş vuruşları veya slayt tuvali otomatik hareket etmez | Motion |

## 4. Ortak hareket dili

Değerler tasarım başlangıç noktasıdır; cihaz ölçümleriyle ayarlanacak.

| Tür | Başlangıç değeri | Kullanım |
|---|---|---|
| Anlık geri bildirim | 100–140 ms | Basılma, kopyalama, küçük durum değişimi |
| Menü | 160–220 ms | Header, hesap, filtre menüsü |
| Panel | Giriş 280–320 ms; çıkış 160–180 ms | Arama ve Drawer |
| Yerleşim | 220–280 ms | Liste ve sekme hareketi |
| Sıralı giriş | Öğeler arası 30–45 ms; toplam gecikme en fazla 180 ms | Kısa başarı özeti; uzun listeler sırayla bekletilmez |
| Maskot | Yaklaşık 700–1000 ms, tek tepki | Başarı ve dönüm noktası |

Küçük girişlerde 4–12 px mesafe kullanılacak. Basılma ölçeği yalnız etkileşimli öğelerde yaklaşık
0,98 olacak. Okuma alanlarında parallax, sürekli zıplama, yazı yazılıyormuş gibi uzun metin animasyonu
ve sayfa genelinde konfeti kullanılmayacak. Geçişlerde tutarlı yavaşlama; sekme göstergesinde düşük
taşmalı yay davranışı kullanılabilir. Odak halkaları ve hata mesajları geciktirilmeyecek.

## 5. Teknik uygulama

### Ortak katman ve dosyalar

Aşağıdaki ortak dosyalar uygulamada oluşturuldu:

```text
src/lib/motion-tokens.ts                         süreler, easing ve hareket mesafeleri
src/components/motion/MotionProvider.tsx         OS + hesap tercihi, ortak Motion ayarı
src/components/motion/AnimatedList.tsx           AutoAnimate ve tercih yönetimi
src/components/motion/AnimatedBackground.tsx     uyarlanmış Motion Primitives; ortak Tabs kullanır
src/components/motion/ModuleAccordion.tsx        uyarlanmış Animate UI
src/components/motion/DuckMascot.tsx             tembel yüklenen Rive ve SVG yedeği
src/components/motion/RiveDuck.tsx               yerel renderer ve yaşam döngüsü
public/animations/ordek-club.riv                 özgün maskot varlığı
THIRD_PARTY_NOTICES.md                          sürüm/commit, kaynak ve lisans kayıtları
```

Mevcut bağlantı noktaları: `providers.tsx`, `AppShell.tsx`, `Drawer.tsx`, `Tabs.tsx`, `Duck.tsx`,
`LevelBar.tsx`, `academy/Progress.tsx`, `academy/SuccessPanel.tsx`, `academy/LearningWorkspace.tsx`,
`live/OperationPanel.tsx`, öğrenci/öğretmen ana ekranları ve Studio.
Sunucu bileşenleri topluca istemci bileşenine çevrilmeyecek; yalnız hareket eden yaprak bileşenler ayrılacak.

### Paket uyumu ve yükleme

- Next.js 15 / React 19 ile sürümler denenecek; geçen sürümler lockfile ile sabitlenecek.
- Tek Motion sürümü kullanılacak; seçili kaynakların peer dependency ve import yolları doğrulanacak.
- `LazyMotion` ve `m` ile gerekli özellikler yüklenecek. Layout gereken alanda uygun özellik paketi
  kullanılacak; `domAnimation` paketinin layout hareketini kapsadığı varsayılmayacak.
- Üçüncü taraf kaynakların doğrudan `motion` importları incelenecek. Uyarlama yapılmadan tüm ağaca
  `LazyMotion strict` eklenmeyecek; bu birleşim çalışma zamanında hata verebilir.
- Motion Primitives ve Animate UI stilleri mevcut CSS değişkenlerine bağlanacak. Hazır tema,
  font, renk ve buton görünümleri projeye taşınmayacak.
- Rive yalnız gereken ekranda ve görünürlük yaklaşınca yüklenecek. Giriş ve temel lab ekranının
  başlangıç paketinde Rive runtime/varlıkları bulunmayacak.

### Rive maskotu ve üretim güvenlik ayarı

Mevcut SVG ördeğin biçimi ve renkleri temel alınarak özgün bir vektör rig ve `.riv` varlığı hazırlanacak.
İlk durumlar: durgun, selamlama, arama, başarı, seviye atlama, seri dönüm noktası ve cesaretlendirme.
Başarısız cevapta alaycı/cezalandırıcı tepki kullanılmayacak. Sürekli idle döngüsü zorunlu olmayacak.

React renderer seçimi küçük bir üretim denemesiyle yapılacak; güncel React rehberindeki WebGL2
seçeneği ve gerekli alternatifler gerçek cihazda karşılaştırılacak. WASM ve `.riv` dosyaları kendi
sunucumuzdan sunulacak. Mevcut CSP'de WASM çalışması ayrıca doğrulanacak; genel `unsafe-eval`
gevşetmesi yapılmayacak. Gerekli dar izin, renderer ve yükleyici ayarı çalıştığı kanıtlanarak belirlenecek.
Bu deneme geçmeden Rive entegrasyonu tamamlandı sayılmayacak.

Maskot alanı önceden boyutlandırılacak. Yükleme/CSP/WebGL hatasında mevcut `Duck` SVG'si gösterilecek.
Sekme arka plana geçtiğinde veya maskot ekran dışına çıktığında çalışma duracak; unmount'ta kaynaklar
temizlenecek. Kutlamalar olay kimliğiyle tek sefer gösterilecek; yeniden render veya sayfa yenileme
yeni bir kazanım izlenimi yaratmayacak.

### Erişilebilirlik ve güvenilirlik

- Ortak tercih: işletim sistemi azaltılmış hareket **veya** `LearningPreference.reduceMotion`.
  Üye ve yönetici kabuklarında aynı politika uygulanacak; tercihin değişmesi yeniden giriş gerektirmeyecek.
- Motion `reducedMotion` varsayılanına güvenilmeyecek. Bu ayarda opacity animasyonu devam edebildiği
  için katı statik modda süreler ayrıca sıfırlanacak. AutoAnimate için hesap tercihiyle de devre dışı bırakma yapılacak.
- Rive azaltılmış modda statik SVG olacak; canvas dekoratifse ekran okuyucudan gizlenecek.
  Önemli sonuç canvas dışında metin olarak bulunacak.
- Sekmelerin rolleri ve ok/Home/End tuşları; dialogların Escape, odak döngüsü ve odak dönüşü korunacak.
- SSR içeriği görünür başlayacak. JavaScript/animasyon hatası içeriği görünmez bırakmayacak.
- İşlem devam ederken yinelenen tıklama ve hızlı aç/kapa durumları test edilecek; kapanış animasyonu
  ağ isteği iptali veya yanlış kayıt anlamına gelmeyecek.

## 6. Uygulama sırası ve geçiş koşulları

Takvim taahhüdü yerine bağımlılık ve kabul koşulu kullanılır. Bir aşama geçmeden ona bağlı aşama açılmaz.

| Aşama | Teslim | Geçiş koşulu |
|---|---|---|
| 0 — Uyumluluk denemesi | Beş kaynağın sürüm/commit ve lisans kaydı; Motion ortak sürümü; Rive production CSP/renderer denemesi; mevcut JS ve UI ölçümleri | Her araç için çalışan küçük örnek; kaynak koşulları kayıtlı; tema/font değişmemiş; Rive yedeği çalışıyor |
| 1 — Ortak hareket sistemi | Token'lar, tercih sağlayıcısı, azaltılmış/statik mod, sabit önizleme verileri | OS ve hesap tercihi ayrı ayrı çalışıyor; SSR içeriği görünür; istemci konsolunda hydration hatası yok |
| 2 — Navigasyon ve paneller | Header, mobil menü, arama, Drawer ve işlem göstergeleri | Uzun yönetici menüsünde taşma yok; klavye/odak ve hızlı aç/kapa kontrolleri geçiyor |
| 3 — Akademi ve veri listeleri | Motion Primitives sekmeleri; Animate UI modül/ipucu alanları; AutoAnimate görev/bildirim/kuyruk listeleri | Üçü de gerçek ürün ekranında çalışıyor; aynı öğede çift animasyon yok; düzenleme/odak/veri kaybı yok |
| 4 — İlerleme ve özgün maskot | XP/ilerleme geçişleri; özgün Rive durum makinesi; başarı ve streak dönüm noktaları | Gerçek doğrulanmış olay bir kez kutlanıyor; Rive hata/azaltılmış hareket yedeği ve kaynak temizliği geçiyor |
| 5 — Ürün doğrulaması ve açılış | Responsive görsel kontrol, performans ölçümü, ana akış testleri ve kademeli açılış | Aşağıdaki kabul matrisi tamamlanmış; beş araç yalnız demo değil gerçek işlevde kullanılıyor |

İlk pilot ekranları: yönetici header'ı + Drawer → öğrenci çalışma alanı → öğretmen kuyruğu → ders tamamlama.
Sunum katmanını kapatabilen bir özellik anahtarıyla önce personelde, sonra öğrenci pilotunda açılacak.
Anahtar kapatıldığında aynı veriler ve işlevler statik olarak kullanılmaya devam edecek.

## 7. Doğrulama ve tamamlanma tanımı

| Alan | Kontrol |
|---|---|
| Roller ve diller | Öğrenci, öğretmen, yönetici/tam yetkili; TR/EN; uzun ad ve menü etiketleri |
| Responsive | 320, 375, 768, 1180, 1200, 1280, 1440, 1920 px; header taşması ve yatay kaydırma yok |
| Durumlar | Boş, yükleniyor, hata, kayıt başarılı, çok sayıda sonuç, bağlantı kesilmesi ve yeniden bağlantı |
| Etkileşim | Klavye, odak görünürlüğü, Escape, hızlı aç/kapa, sekme değiştirirken form verisi, beklenmedik veri gelişi |
| Hareket tercihi | OS açık/kapalı ve hesap açık/kapalı dört kombinasyon; tercih çalışma anında değişince güncelleme |
| Rive | Üretim CSP, varlık yüklenememesi, WebGL kullanılamaması, düşük güçte cihaz, arka plan ve unmount |
| Görsel kalite | Masaüstü/mobil ekran görüntüleri ve gerçek etkileşim kaydı incelenir; yalnız DOM ölçümü görsel onay sayılmaz |
| Yazılım | Typecheck, lint, üretim derlemesi; tercih ve olay tekrarı için anlamlı birim testleri; kritik klavye/öğrenme akışları için Playwright |

Performans bütçesi aşama 0 başlangıç ölçümüyle kesinleştirilecek. İlk hedef: ortak DOM animasyonları
için sıkıştırılmış başlangıç JS artışı yaklaşık 45 KiB sınırında tutulmaya çalışılacak; gerçek Next.js
Webpack çıktısı raporlanacak, bu sayı garanti olarak yayımlanmayacak. Rive yükü ayrı ölçülecek;
özgün `.riv` için ilk hedef 250 KiB. Animasyonun yol açtığı yerleşim kayması olmamalı; metin girişi,
ders cevabı ve terminal tuşları görsel geçiş nedeniyle gecikmemeli. Düşük güçte cihazda iz kaydıyla
kare süreleri kontrol edilmeden performans tamamlandı sayılmayacak.

**Bitti:** Beş aracın her biri gerçek ekranda tanımlı görevini yapıyor; mevcut mor–krem dil korunuyor;
yetki/öğrenme verileri değişmiyor; erişilebilir statik karşılıklar var; üretim derlemesi, ana akışlar,
görsel inceleme ve ölçüm raporu tamam. Sadece paket kurmak veya örnek animasyon sayfası açmak yeterli değil.

## 8. Kaynak ve lisans notları

- Motion: [reduced motion ayarı](https://motion.dev/docs/react-motion-config) ve
  [LazyMotion / paket boyutu](https://motion.dev/docs/react-reduce-bundle-size).
- Motion Primitives: [kaynak depo](https://github.com/ibelick/motion-primitives); beta ve Tailwind
  tabanlı kaynaklar mevcut CSS'e uyarlanacak. Seçilecek bileşenin gerçek API'si aşama 0'da doğrulanacak.
- AutoAnimate: [resmî rehber](https://auto-animate.formkit.com/); OS hareket tercihini destekler,
  hesap tercihi ek sarmalayıcıyla uygulanır. Flex boyutlandırma davranışı gerçek listelerde ölçülecek.
- Animate UI: [Accordion rehberi](https://animate-ui.com/docs/primitives/radix-ui/accordion) ve
  [MIT + Commons Clause lisans metni](https://github.com/imskyleen/animate-ui/blob/main/LICENSE.md).
  Bileşenleri ürün içinde kullanma koşulları ile bileşenlerin kendisini yeniden dağıtma koşulları aynı
  değildir. Uyarlanan kaynakların orijinal bildirimleri korunacak; dosyalar düz MIT diye yeniden etiketlenmeyecek.
- Rive: [React runtime rehberi](https://rive.app/docs/runtimes/react/react) ve
  [React kaynak deposu](https://github.com/rive-app/rive-react). Runtime lisansı özgün/üçüncü taraf
  animasyon varlıklarının lisansı yerine geçmez; `.riv` kaynağı ve kullanım hakkı ayrıca kaydedilecek.
