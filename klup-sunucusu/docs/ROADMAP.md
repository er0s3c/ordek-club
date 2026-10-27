# Ördek Club — uygulama ve müfredat yol haritası

Son güncelleme: 24 Ekim 2026.

Bu belge, ürün planıyla depodaki gerçek uygulama durumunu ayırır. **Kodlandı**, derlenen bir ekran/API/veri akışının bulunduğunu belirtir; PostgreSQL entegrasyon testi, tarayıcı kontrolü veya Linux yük testinin geçtiği anlamına gelmez.

## Ürün kararları

- Ördek Club, Ördek Akademi ve Gölge Ağ evreni korunur. Mevcut kullanıcı, ders kimliği, ilerleme, XP ve rozetler silinmez.
- Mevcut mor–krem UI, Readex Pro/Lexend Tera, üst navigasyon, kartlar ve butonlar kullanılır.
- Tam platform üyelik gerektirir. Yalnız tahmin edilemeyen kodla erişilen belge doğrulaması herkese açıktır; belge sahibinin adı varsayılan olarak gizlidir.
- Gerçek terminal, Club'dan ayrı Linux makinesinde çalışır. Club Docker soketine erişmez.
- AI bağlantısı ve Kalkan Kırıcı **kullanıcının “daha sonradan” tercihiyle ertelendi**. Dış AI servisine veri gönderen kod eklenmedi.
- Yeni özellik anahtarları varsayılan kapalıdır; Yönetim → Özellikler ekranından açılır.

## 36 özellik: gerçek durum

| No | Özellik | Depodaki durum |
|---|---|---|
| 1 | Streak merkezi ve takvimi | Kodlandı: 28 günlük görünüm, güncel/en uzun seri |
| 2 | Haftalık telafi ve sınav koruması | Kodlandı: haftada bir hak, geleceğe dönük sınıf dönemi; öğrenciler dönem oluşturulurken kaydedilir |
| 3 | Günlük hedef | Kodlandı: 1–3 doğrulanmış etkinlik |
| 4 | Çalışma takvimi | Kodlandı: kişisel plan, görev tarihi, üye olunan etkinlik |
| 5 | Hatırlatmalar | Kodlandı: uygulama içi, tercihe ve SMTP'ye bağlı e-posta; kişi/gün başına tek kayıt |
| 6 | Haftalık kişisel özet | Kodlandı: son 7 gündeki etkinlik ve aktif gün sayısı |
| 7 | Beceri haritası | Kodlandı: içerik etiketleri ve tamamlanmış çalışma kanıtları; etiketli içerik üretimi sürmeli |
| 8 | Başlangıç testi | Kodlandı: 10 özgün soru ve başlangıç önerisi; XP veya ders tamamlama üretmez |
| 9 | Tekrar kartları | Kodlandı: yanlış quizden kart; 3/10/30 günlük zamanlama |
| 10 | Kişisel notlar | Kodlandı: ders başına özel not, kaydetme ve eşzamanlı değişiklik kontrolü |
| 11 | Kaydedilenler | Kodlandı: ders içinden kaydetme ve kişisel liste |
| 12 | Portfolyo | Kodlandı: onaylı bireysel/takım teslimlerinden öğrencinin seçtikleri; dosya ekleri paylaşılmaz |
| 13 | Öğrenme radarı | Kodlandı: yetkili sınıf–beceri matrisi; veri yokken puan uydurmaz |
| 14 | Ders paketleri | Kodlandı: phishing, ağ ve log konularında 15/30/45 dk taslak sunum, rubrikli görev ve değerlendirme |
| 15 | Soru bankası | Kodlandı: değiştirilmeyen soru sürümleri; quizler seçilen sürümün kopyasını kullanır |
| 16 | Çıkış bileti | Kodlandı: canlı quizde ayrı amaç; ders özetinde doğru/toplam yanıt |
| 17 | Operasyon oturumu | Kodlandı: sürümlü “Şüpheli Mesaj” senaryosu, başlat/duraklat/devam/bitir |
| 18 | Takım kanıtları | Kodlandı: başlangıç kadrosuna üç rol; tek öğrenciye tüm kanıtlar; geç katılanlar gözlemci |
| 19 | Dallanan kararlar | Kodlandı: öğrenci oyu ve öğretmenin seçtiği karar; eşzamanlı aşama kontrolü |
| 20 | Çözümleme | Kodlandı: kalıcı olay geçmişi ve sonuç özeti; yeniden bağlantıda yüklenir |
| 21–24 | AI rehberi, ipuçları, içerik ve geri bildirim taslakları | Kullanıcı tercihiyle ertelendi |
| 25 | TR/EN dersler | Motor kodlandı: aynı ders kimliği ve ilerleme; onaylı ayrı Markdown sürümü. 28 ders ve 7 lab TR/EN taslağı `content/pilot` altında; bağımsız inceleme bekliyor |
| 26 | Sekiz etkinlik türü | Kodlandı: seçim, boşluk, komut doğrulama, log, eşleştirme, sıralama, HTTP, kod satırı |
| 27 | Dosya Odası | Kanıt ve soru bileşenleri hazır; 7 özgün vaka labı taslağı hazır; incelemeler ve ileri lab biçimleri eksik |
| 28 | Komut Hattı | Docker çalıştırıcısı ve izin labı hazır; yerel Ubuntu VM'de gerçek gVisor, mTLS, bağımsız alanlar, 20 eşzamanlı PTY ve 21. oturum kuyruğu doğrulandı. Üretim hostu, uzun yük ve kesinti testleri sürmeli |
| 29 | TR/EN terimler | Kodlandı: 16 terim, arama, ders içi açılır kart |
| 30 | Sınav ve belge | Kodlandı: 30+ soru havuzu, 10 soru, %75 açılma, %80 geçme, 24 saat, PDF ve gizlilik tercihi |
| 31 | Günün Kanıtı | Kodlandı: özgün dönen soru seti; kişi/gün başına tek ödül |
| 32 | Haftalık/bölüm ligi | Kodlandı: kulüp saat dilimi, pazartesi sınırı, eşit XP'de aynı sıra |
| 33 | Kalıcı CTF takımı | Kodlandı: 6 kişi, hash'li davet kodu, katılımda kapasite kilidi, ayrılan kaptanın devri |
| 34 | Nöbet Masası | Özgün üç alarmla temel sürüm kodlandı; eğitmen senaryo yükleme ve süreli mod sonraki genişletme |
| 35 | Kalkan Kırıcı | AI ile birlikte kullanıcı tercihiyle ertelendi |
| 36 | Rapor Atölyesi | Kodlandı: doğrulanmış izin labından özel rapor taslağı ve örnekle kıyaslama |

## Platform genişlemesi: 101 özellik

Migration: `20261025090000_platform_100` (yalnız ekleme; durum alanları CHECK kısıtlı). Yeni paket anahtarları varsayılan kapalı: `study`, `workshops`, `teacher-plus`, `club-ops`. Tasarım iyileştirmeleri, birleşik arama, odak modu, erişilebilirlik tercihleri, sorun bildirimi ve veri dışa aktarma anahtarsızdır.

| Alan | Özellikler | Durum |
|---|---|---|
| Gezinme ve tasarım (1, 2, 33–52) | Ctrl+K birleşik arama, kısayollar, mobil alt menü, öğrenci/öğretmen ana sayfası, katalog filtreleri, yol modül akışı, ders bölüm listesi, odak modu, not paneli, terim kartı konumu, aşamalı ipucu, öğretici başarı ekranı, maskot, ortak durum bileşenleri, projeksiyon kodu | Kodlandı, tarayıcıda açıldı |
| Çalışma (3–5, 25–27, 53–68) | Çalışma oturumları (süre tek başına XP üretmez), hedef tarih planı, çalışma arkadaşı ilanları (iletişim bilgisi reddedilir), ders içi sorular, seri gün açıklaması, haftalık karşılaştırma, beceri kanıtları, belirsiz nokta, güven işareti, kendi kartın, hata defteri, okuma süresi, kaldığın yer, önkoşul uyarısı, terim listesi + eşleştirme, modül kaynakları, yazdırma, erişilebilirlik, lab geçmişi, benzer sorular | Kodlandı |
| Topluluk (69–76) | Rozet yol haritası, kulüp ortak hedefi, başarı kartı (yerel PNG), çalışma grupları, teşekkür notu (XP yok), anketler, gönüllü görevler, kişisel veri dışa aktarma | Kodlandı |
| Değerlendirme (7–11, 30, 31, 49, 79–82, 90, 91) | Akran değerlendirmesi, teslim sürümleri ve fark, kontrol listesi, ek süre talebi, sorun takibi (HB-0001), rapor rubriği, portfolyo hikâyesi, değerlendirme kuyruğu, yorum bankası, rubrik kütüphanesi, klonlama, CSV not çizelgesi, benzerlik uyarısı | Kodlandı |
| Öğretmen içgörüsü (12–16, 32, 77, 78, 83–86, 92, 93) | İçerik onay adımları, soru kalite analizi (n<10 yetersiz veri), ön yoklama, yanılgı kütüphanesi, yetkinlik gösterimi, radardan müdahale, ısı haritası, destek listesi, planlı duyuru + okunma oranı, dönem planı, takım oluşturucu, rastgele quiz formu, içerik değişiklik notu | Kodlandı |
| Canlı ders (6, 29, 50, 87–89) | Yardım kuyruğu, anlama göstergesi, söz sırası, projeksiyon görünümü, operasyon rol değişimi, kaçıranlara özet | Kodlandı; WebSocket akışı gerçek sınıfta denenmedi |
| Atölyeler (17–21, 28, 44, 45) | Güvenli kod (kod çalıştırılmaz, kural testleri), ağ kurma, sorgu dili, zaman çizelgesi, kanıt haritası, Nöbet Masası senaryo editörü, bölünebilir lab alanı, terminal durum çubuğu | Kodlandı |
| Kulüp işleri (22–24, 94–99) | Görüşme saatleri, QR/kod katılım, takvim + iCal, aylık bülten taslağı, kullanım paneli, bekleme listesi, etkinlik geri bildirimi | Kodlandı |
| 100 | 26 modül kapak promptu (`content/academy/KAPAKLAR.md`), kapak gösterimi | Promptlar yazıldı; görseller üretilmedi |
| 101 | PDF/PPTX/PPT slayt içe aktarma (`slide-converter/`) | Kodlandı; dönüştürücü imajı derlenmedi, PDF render gerçek tarayıcıda denenmedi |

## Müfredat ve pilot kapısı

SK-101: 7 modül × (4 ders + 1 lab), toplam **28 ders + 7 lab**, her biri TR/EN. Kanonik kimlikler `sk101-m1-01` … `sk101-m7-04`, lablar `sk101-m1-lab` … `sk101-m7-lab` biçimindedir.

Modüller: güvenliğe giriş, ağın dili, web, Linux, Windows, kriptografi, ilk olay müdahalesi.

Mevcut M01–M11 dersleri otomatik olarak bu yeni kimliklere dönüştürülmez. Eşdeğerlik teknik inceleme olmadan verilmez. Eski içerikler ve kazanımlar erişilebilir kalır.

`SK-101` kodlu yol içe aktarılacaksa bütün 35 kimlik, onaylı İngilizce sürüm, Türkçe yazar/teknik/dil incelemesi ve ders başına 3–6 etkinlik aranır. Eksik varsa içe aktarma bütünüyle uygulanmaz. Yönetim → Özellikler içerik hazırlığını ayrıca gösterir. **Bu kontrol Linux kapasite testinin yerine geçmez.**

İlk pilot şu işler bitmeden açılmaz:

1. Hazır 28 ders ve 7 lab taslağının içerik derinliği, süre ve iki dilde bağımsız incelemesi.
2. Test PostgreSQL üzerinde migration ve entegrasyon testlerinin geçmesi.
3. Ayrı Linux hostta gVisor/mTLS/oturum sonlandırma doğrulaması.
4. 20 eşzamanlı terminal, kapasite kuyruğu, kesinti ve yeniden bağlantı testi.
5. 375/768/1440 piksel gerçek tarayıcı ve öğretmen–öğrenci uçtan uca kontrolü.

## Sonraki içerik dalgaları

| Dalga | Yollar | Yayın koşulu |
|---|---|---|
| 1 | SK-121, SK-211, SK-221, SK-231 | Temel pilotun ardından, modül başına TR/EN incelemesi |
| 2 | SK-241, SK-251, SK-261, SK-291, SK-301, SK-225 | Öğrenme verisi ve eğitmen değerlendirmesine göre |
| 3 | SK-271, SK-281, SK-311, SK-245, SK-285, SK-295, SK-305 | Ayrı içerik ve altyapı kapasitesi doğrulandığında |

Kasım 2026–Aralık 2027 tarihleri hedef aralıklarıdır; mevcut dosyaların varlığı gelecekteki içeriklerin tamamlandığı anlamına gelmez. SSO, dış etkinlik API'si, çevrim dışı paket, mentorluk ve sonraki oyunlar bu teslimatın dışında kalır.

## İki dilli içerik ve inceleme (27 Ekim 2026)

- **Kapsam %100:** 178 ders sayfası, 10 quiz, 201 çizgi roman şeridi (260 panel), 20 karakter profili, 18 Gölge Ağ bölümü ve 15 ders diyagramı İngilizce. Ölçüm: `npm run i18n:coverage`.
- **Çeviri inceleme akışı:** `/teach/translations` — TR/EN yan yana, satır farkı, yapısal sapma uyarıları, dil/teknik aşama onayı. Onay `LessonTranslation` içinde tutulur, içerik değişmedikçe `academy-import` korur, İngilizce metin değişince onay düşer. Onaylanan çeviride öğrenciye gösterilen "incelenmedi" notu kalkar.
- **Gölge Ağ okuyucu:** `/academy/golge-ag` ve `/academy/golge-ag/[bölüm]` — 18 bölüm, portreler, TR/EN, bölüm gezinmesi. Aynı şeritler ders içinde de görünür (tek kaynak).
- **İki dilli arama:** ders, terim, lab, görev, duyuru yanında çizgi roman panelleri ve karakter dosyaları da aranır; sonuç dili seçili dile göre gelir.
- **Yol kitabı PDF:** `/api/academy/track/[key]/book.pdf?lang=` — kapak, içindekiler, dersler, kod blokları ve çizgi roman diyalogları.
- **SK-101 pilotu:** 35 ders/lab çifti İngilizce (`content/pilot/translations/en/`), `check-pilot-drafts` 35/35 çift ve 0 sorun verir; inceleme durumu değişmedi (`reviewedPairs` 0).
- **Görsel regresyon:** `npm run test:content` — 178 ders × 2 dil × 3 kırılımda balon/anlatıcı/ses efekti panel içinde ve çakışmasız; ders diyagramları İngilizce metin gösterir. Çalışan sunucu ve test hesabı gerekir (`CLUB_E2E_*`).

## Doğrulama kaydı

**Platform genişlemesi (24 Ekim 2026):** `npm run typecheck` ve `npm run lint` temiz; `npm run test:pure` 161 test geçti (22'si yeni: Türkçe katlama, metin farkı, benzerlik, sorgu dili, güvenlik duvarı, zaman çizelgesi, atölye puanlama, iletişim bilgisi filtresi). Migration yerel geliştirme veritabanına uygulandı. Dev sunucusunda öğrenci ve öğretmen test hesaplarıyla 40 yeni/değişen sayfa 200 ve hatasız döndü; arama, sorun bildirimi, atölye gönderimi, çalışma oturumu ve kulüp API'leri uçtan uca denendi; Ctrl+K, odak modu ve 375 px mobil alt menü tarayıcıda kontrol edildi. Test hesapları sonra silindi. Üretim derlemesi (`npm run build`), PostgreSQL entegrasyon testleri ve canlı ders WebSocket akışları bu turda çalıştırılmadı.

- 108 birim testi ve 5 çalıştırıcı politika testi geçti.
- TypeScript ve üretim derlemesi çalıştırıldı; son kontrol sonuçları teslim mesajında belirtilir.
- Örnek PDF üretildi, PNG olarak render edildi; Türkçe karakterler ve yerleşim incelendi.
- 8 yeni PostgreSQL entegrasyon testi eklendi. Yerel `127.0.0.1:5433` bağlantısı `ECONNREFUSED` verdiği için çalıştırılamadı.
- Ego tarayıcı bağlantısı açılamadı; gerçek tarayıcı görsel kontrolü tamamlanmadı. Örnek verili önizleme aracı uçtan uca test sayılmaz.
- Linux çalıştırıcısı ayrı Ubuntu WSL VM'de Docker olarak başlatıldı; Docker Desktop'ın uygulama/DB motoru değiştirilmedi. Gerçek gVisor, mTLS, iki ayrı çalışma alanı, doğrulama/sıfırlama, 20 açık terminalde komut çalıştırma, 21. oturum kuyruğu ve boşalan yere geçiş doğrulandı. Sentetik oturumlar temizlendi. Üretim hostunda kabul testleri yeniden yapılmalı; uzun yük ve zorla kesinti henüz doğrulanmadı.

## Kurulum ve kontrol

```sh
cd klup-sunucusu
npm ci
npm run db:migrate
npm run test:pure
npm run test:lab-policy
npm run typecheck
npm run lint
npm run build
# PostgreSQL test veritabanı erişilebilir olduğunda:
npm run test:integration
# Yalnız örnek veriyle ekran önizlemesi:
npm run preview:learning
```

Yeni migration eklemelidir; uygulanmış eski migration'lar değiştirilmedi. İlk açılışta yeni paketler kapalıdır. Yönetim → Özellikler'den öğrenme, akademi, öğretmen, operasyon ve topluluk paketlerini pilot sırasına göre açın. Lab için önce [ayrı Linux kurulumunu](../lab-runner/README.md) tamamlayın.

İçerik biçimi: [ACADEMY-CONTENT-V2.md](ACADEMY-CONTENT-V2.md).

İncelemeye hazır taslaklar: [content/pilot](../content/pilot/README.md). 28 ders + 7 vaka labı, iki dilde 70 Markdown dosyası; ayrıca iki dilde 30 soruluk sınav havuzu taslağı vardır. `npm run academy:pilot-check` yapısal denetim yapar. Bu denetim bağımsız teknik inceleme değildir. Öğrenme süresi, pedagojik derinlik, yanıt seçenekleri ve kaynak bağlantıları inceleme sırasında kalibre edilmelidir. Taslaklar mevcut canlı içeriğe veya Docker imajına otomatik eklenmez.
