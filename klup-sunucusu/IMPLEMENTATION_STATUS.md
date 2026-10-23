# Ördek Club — Uygulama Durumu

> Son güncelleme: 2026-10-23 · Branch: `feature/club-studio` (Faz 6) · Sorumlu: Opus 5.5

## Özet

**Faz 1 (çalışan temel) ve Faz 2 (canlı eğitim) tamamlandı ve doğrulandı. Faz 3 (Club Academy) çalışır durumda:** dersler, quizler, ilerleme ve hikâye platformda. **Faz 4 (XP, seviyeler, rozetler, liderlik) çalışır durumda.** **Faz 5 (görevler, dosyalar, canlı quiz/anket, duyurular, VMware uygulama molası) ve Faz 5'in eksikleri (sınıf/etkinlik, takım görevi, otomatik puanlanan görev, ZIP/ClamAV taraması) çalışır durumda.** **Faz 6 (Club Studio, görsel blok, e-posta, analitik, oturum yönetimi, sahiplik devri, 13 adımlı Playwright E2E, CI güvenlik taraması) çalışır durumda.**

## ✅ Çalışan özellikler (Faz 1)

| Özellik | Kanıt |
|---|---|
| Bağımsız uygulama (`klup-sunucusu/`): kendi package.json, Prisma, Postgres, Compose | Kök lab koduna import yok; kendi PostCSS/outputFileTracingRoot (kök config'lerine çıkmaz) |
| PostgreSQL 16 + Prisma 6, 2 migration (`init_phase1`, `db_constraints` — CHECK kısıtları) | `prisma migrate deploy` konteyner başlangıcında otomatik |
| Tek komutla kurulum `install.sh` (güçlü rastgele sırlar, HTTP veya Caddy ile otomatik HTTPS) | Temiz kopyada çalıştırıldı → sağlıklı servisler + kurulum anahtarı |
| Güvenli bootstrap: tek seferlik kurulum anahtarı (log + `storage/setup-token.txt`, 24 saat, DB'de hash) | Entegrasyon testi + tarayıcıda gerçek sihirbaz |
| 4 adımlı kurulum sihirbazı (anahtar → kulüp bilgisi/URL/saat dilimi/kayıt politikası → kurucu → logo) | Tarayıcıda baştan sona yapıldı |
| Kayıt / giriş / çıkış / parola değiştirme | Testler + tarayıcı |
| Roller OWNER/ADMIN/INSTRUCTOR/STUDENT; sunucu tarafı politika (`policy.ts`) | 6 birim + RBAC entegrasyon testleri |
| Üyelik politikaları: Başvuru+onay / Yalnızca davet / Açık / Kapalı | Entegrasyon testleri |
| Davet kodları: rol, kullanım limiti, süre, otomatik onay, iptal; kod yalnız bir kez gösterilir | Testler (eşzamanlı yarış testi dahil) + tarayıcı |
| Admin paneli: genel bakış (gerçek sayılar), üyeler (arama/filtre/sayfalama/onay/red/rol/devre dışı), üye detayı + geçmiş, davetler, kulüp ayarları + logo, denetim kaydı, sistem durumu | Tarayıcıda gerçek API'lerle |
| Üye paneli: ana sayfa (üyelik bilgisi, yöneticiye bekleyen başvuru kartı), Hesabım (profil, parola) | Tarayıcı |
| Yönetim CLI'ı + `scripts/club.sh` (status, logs, setup-token, backup, restore, update, revoke-sessions) | backup ve restore konteynerlerde denendi |
| Veri kalıcılığı (volume'lar) | `down` + `up` sonrası veriler korundu |
| Mobil uyum, klavye odağı, skip-link, reduced-motion, loading/empty/error durumları | 375 px'de yatay kaydırma yok |
| i18n altyapısı (TR varsayılan, EN iskeleti, eksik anahtar TR'ye düşer) | — |
| Club CI workflow (`.github/workflows/club.yml`): typecheck, lint, test, build, npm audit, docker build | Yerelde aynı adımlar çalıştı; GitHub'da henüz koşmadı |

### Güvenlik kontrolleri (Faz 1)
scrypt parola · opak oturum token'ı (DB'de SHA-256) · HttpOnly/SameSite/Secure çerez · mutlak + boşta kalma
süresi · parola/rol/devre dışı değişiminde oturum iptali · CSRF (Origin + Sec-Fetch-Site + yalnız JSON) · nonce'lu
CSP ve güvenlik başlıkları · zod ile mass-assignment koruması · kullanıcı adı numaralandırma koruması ·
IP/kullanıcı bazlı hız sınırı · atomik davet tüketimi · satır kilitli kurulum · magic-byte logo doğrulama (SVG yok) ·
audit log (önce/sonra değerleriyle) · Docker: root değil, read-only FS, cap_drop ALL, no-new-privileges, DB portu kapalı, docker.sock yok.

## ✅ Çalışan özellikler (Faz 2 — canlı eğitim)

| Özellik | Kanıt |
|---|---|
| Sunum modeli: Presentation → değişmez PresentationVersion → Slide (adım sayısı hesaplı); JSON şema doğrulaması (zod) | Birim testleri; içe aktarma/yeni sürüm entegrasyon testi |
| 3 hazır şablon (HTTP Security 101, Ağ Temelleri, Mavi Takıma Giriş) | Şemadan geçer; tarayıcıda oluşturuldu |
| 15 animasyon, iki veri güdümlü motor (akış: SVG + Web Animations API; kod: panel/vurgu/çıktı), adım adım, hız kontrolü, reduced-motion | Tanım bütünlüğü testleri (aktör/satır başvuruları); tarayıcıda görüldü |
| Bloklar: başlık, metin, adım adım maddeler, kod (adım vurgulu), terminal simülasyonu, uyarı kutusu, animasyon | — |
| Eğitmen paneli `/teach`: şablondan oluşturma, JSON içe/dışa aktarma, yayınla/taslak, kopyala, arşivle, içerik değiştir (yeni sürüm), önizleme + eğitmen notları | Entegrasyon testleri (sahiplik/IDOR) + tarayıcı |
| Canlı oturum: 6 haneli kod + QR, sunucu otoriteli durum, sürüm numarası, yeniden bağlanmada tam senkron | Hub + gerçek soket testleri; tarayıcı + ikinci kullanıcı |
| Eğitmen konsolu: ileri/geri/slayta git, klavye kısayolları, sıradaki slayt, notlar, duraklat/devam, otomatik oynat, hız 0.5–2×, serbest gezinme izni, katılımcılar (çevrimiçi/süre/el), sorular (yanıtlandı işareti), duyuru, projeksiyon ekranı, dersi bitir | Tarayıcıda + script öğrenci ile |
| Öğrenci ekranı `/live/KOD`: tam ekran, bağlantı durumu, mola perdesi, el kaldır, soru sor, duyuru bandı, serbest gezinmede yerel ilerleme + “Canlıya dön”, ders bitti ekranı | Tarayıcıda |
| Sunucu yeniden başlasa da ders devam eder (durum Postgres'te; istemci otomatik yeniden bağlanır) | Tarayıcıda: sunucu öldürülüp başlatıldı → aynı slayt/adım |
| Ders özeti: katılımcılar, bağlı kalma süresi ve %, bağlantı sayısı, sorular, duyurular, el kaldırmalar | Tarayıcı + smoke |
| `/live` katılım sayfası + devam eden dersler; ana sayfada “Şu an canlı” kartı | — |

### Güvenlik kontrolleri (Faz 2)
WebSocket yükseltmesinden ÖNCE Origin kontrolü (CSWSH), çerez oturumu, IP hız sınırı ve oturum varlığı · her mesajda
zod doğrulaması + yetki (yalnız eğitmen/admin akışı değiştirir) · mesaj boyutu ve sıklık sınırı (ısrarda bağlantı kapanır) ·
soru/el/duyuru için ayrı hız sınırları · kullanıcı başına en fazla 3 cihaz, oda başına 400 bağlantı · 30 sn'de bir oturum
yeniden doğrulama (çıkış/devre dışı/rol değişimi soketi kapatır) · **eğitmen notları öğrenciye hiçbir yoldan gönderilmez**
(API, RSC yükü, projeksiyon) · katılımcı adları yalnız eğitmene, öğrencilere yalnız sayı · başkasının taslak sunumu 404 ·
sunum içeriği yalnız düz metin + kayıtlı animasyon kimliği (çalıştırılabilir içerik yok) · CSP connect-src yalnız aynı host.

## 📚 Akademi içeriği (Faz 3 hazırlığı) — branch: feature/academy-content

| İçerik | Durum |
|---|---|
| İçerik rehberi, yazım ve görsel stili ([content/academy/README.md](content/academy/README.md)) | ✅ |
| Akademi hakkında: 8 sayfa | ✅ |
| Kısım I — M01–M11: 55 ders, 12 uygulama, 10 quiz | ✅ |
| Kısım II — 7 uzmanlık yolunun tanıtım sayfası | ✅ |
| Kısım II — 7 uzmanlık yolunun 84 dersi (A–G) | ✅ |
| Sentetik laboratuvar dosyası (`content/academy/lab/auth.log`) | ✅ |
| Noir mafya + hacker tasarımı (Club arayüzü, canlı ders slaytları, AI görsel stili) | ✅ |
| Gölge Ağ Ailesi: 11 modül kötü adamı + Baron Eren (genç hâli dahil) + Tek Tırnak Jasmine ([karakterler.yaml](content/academy/karakterler.yaml) → [KARAKTERLER.md](content/academy/KARAKTERLER.md)) | ✅ |
| Hikâye "Gölge Ağ — Sezon 1": [hikâye sayfası](content/academy/00-program/09-golge-ag.md), her modülde bölüm girişi + DOSYA KAPANDI kutusu | ✅ |
| Yol A (Web güvenliği): 12 ders + Sezon 2 "Çekmeceler" (Tek Tırnak Jasmine), sentetik `lab/access.log` | ✅ |
| Yol B (Ağ ve sistem güvenliği): 12 ders + Sezon 2 "Tüneller" (Tünelci Tarık, dördüncü Kapüşonlu) | ✅ |
| Yol C–G: 60 ders, 5 yeni kötü adam (Tamer, Bedri, Veysel, Leman, Sabri), Sezon 2 "Proje Ayna" hikâyesi, 22 sentetik laboratuvar dosyası ([lab/README.md](content/academy/lab/README.md)) | ✅ |
| Görseller: 229 adet (21 karakter portresi — 15 hazır, 187 Midjourney sahnesi, 21 ekran görüntüsü) — [GORSELLER.md](content/academy/GORSELLER.md) | ⏳ kullanıcıdan bekleniyor |
| İçerik doğrulayıcı `npm run academy:check` / liste üretici `npm run academy:gorseller` | ✅ |
| Platformda gösterim (Markdown içe aktarıcı, ders/quiz sayfaları) | ✅ Faz 3 (aşağıda) |

## ✅ Faz 3 — Club Academy

| Özellik | Kanıt |
|---|---|
| Veri modeli: Track, Lesson, LessonProgress, QuizAttempt (migration `phase3_academy`) | `prisma migrate dev` + test DB |
| İçe aktarıcı: `content/academy` → DB; tek transaction, hatalı içerik hiç uygulanmaz, kaldırılan ders arşivlenir (ilerleme korunur) | `npm run cli academy-import`, admin düğmesi, konteyner açılışında otomatik; 3 entegrasyon testi |
| Yol yapısı tek dosyada: [content/academy/akademi.yaml](content/academy/akademi.yaml) | 19 yol · 118 ders içe aktarıldı |
| Güvenli Markdown çizici: ham HTML basılmaz (yalnız `<details>`), yalnız izinli bağlantılar, `::animasyon[id]` canlı ders animasyonlarıyla oynatılır | Tarayıcıda M01 dersleri |
| Quiz: sorular istemciye cevapsız gider, puanlama sunucuda, deneme kaydı, geçince ders tamamlanır, hız sınırı | Birim + entegrasyon testleri |
| Hikâye: 🕴️ DOSYA kutusu portreyle; 🔒 DOSYA KAPANDI ve sıradaki ipucu bölüm tamamlanınca açılır | Tarayıcıda M01 quiz geçilerek |
| Sayfalar: /academy (kaldığın yer + sezonlar), /academy/[yol], /academy/lesson/[ders], panelde akademi kartı, /admin/academy (içe aktarma + katılım) | Masaüstü + 375 px mobilde taşma yok |
| Ders görselleri yalnız üyelere, katı ad kalıbıyla (`/api/academy/images/<ad>`); olmayan görsele yer tutucu | Yol geçişi testleri |

## ✅ Faz 4 — XP, seviye, rozet, liderlik

| Özellik | Kanıt |
|---|---|
| XP kayıt defteri (`XpTransaction`): her kazanım, düzeltme ve geri alma ayrı satır; toplam = SUM | migration `phase4_gamification` |
| Çift ödül yok: benzersiz `idempotencyKey` + `ON CONFLICT DO NOTHING`; ödül, onu doğuran işlemle aynı transaction'da | Eşzamanlı 4 yazımda tek kayıt testi |
| Kurallar sunucuda (`XpRewardRule`, yönetimden düzenlenir): ders 40, bilgi 10, quiz 30 (ilk geçiş), yol 200, canlı ders 25 (≥10 dk); görev kuralları Faz 5 için hazır | İstemcinin gönderdiği XP yok sayılır testi |
| Suistimal önlemleri: quiz tekrarı XP üretmez; ders açılmadan veya 15 sn dolmadan tamamlanamaz; kısa tanıtım yolları yol ödülü vermez; şüpheli etkinlik listesi (10 dk'da >8 ödül, 24 saatte >1500 XP) | Entegrasyon testleri |
| 10 seviye, artan eşikler (Çaylak → Efsane Tilki); yönetimden düzenlenir, artmayan eşik reddedilir | Birim + entegrasyon |
| 11 rozet (İlk Ders, İlk Quiz, 7/30 günlük seri, Web Security Beginner, Network Explorer, Digital Detective, Monthly Champion, Top 10, Learning Path Master, Gölge Ağ Çökertildi) + yöneticinin yeni rozetleri (sabit kural tipleri; kod çalışmaz) | Entegrasyon testleri |
| Aylık liderlik kulüp saat dilimine göre; biten ay ilk ihtiyaçta arşivlenir (sonraki düzeltmeler arşivi değiştirmez) ve ay şampiyonu rozeti verilir; genel liderlik sıfırlanmaz; yalnız öğrenciler sıralanır | Yaz saati dahil saat dilimi testleri |
| Yönetici: elle düzeltme (gerekçe zorunlu), geri alma (karşı kayıt, bir kez), rozet ver/geri al; hepsi denetim kaydında | 403/400/409 testleri |
| Sayfalar: /leaderboard (bu ay · genel · geçmiş aylar, podyum, Top 10/50/tümü, kendi sıran), /u/[kullanıcı] profil (XP geçmişi yalnız kişiye ve yöneticiye), panelde XP kartı, /admin/xp, /admin/badges | Masaüstü + 375 px, taşma yok |
| CLI: `xp-backfill` (Faz 4 öncesi ilerlemeye XP; tekrar çalıştırmak güvenli), `leaderboard-archive` | Yerelde çalıştırıldı |

## ✅ Faz 5 — Sınıf yönetimi

| Özellik | Kanıt |
|---|---|
| Görev (`Assignment`): 8 tür (metin, kısa cevap, dosya, PCAP, log, OSINT, kod inceleme, VMware), zorluk, başlangıç/son teslim, geç teslim izni, yeniden teslim, rubrik (toplam = en yüksek puan), XP kuralı veya özel XP (0–500) | migration `phase5_classroom`; şema testleri |
| Hedef: tüm öğrenciler ya da seçili öğrenciler (`AssignmentTarget`); hedef dışı öğrenciye görev, teslim ve ekler 404 | IDOR testleri |
| Teslim: metin + en fazla 5 dosya; geç teslim işaretlenir ya da reddedilir; düzeltme istenince yeniden teslim (deneme sayısı); onaylanan/reddedilen teslim kilitli | Entegrasyon testleri |
| Değerlendirme: yalnız görevi oluşturan eğitmen ya da yönetici; rubrik puanı ölçüt sınırında; onay / düzeltme iste (geri bildirim zorunlu) / reddet; **XP yalnız onayda, onayla aynı transaction'da, görev başına bir kez**; toplu onay | XP-bir-kez, başka eğitmen 403, öğrenci 403 testleri |
| Dosyalar (`FileAsset` + `FileGrant`): kapsam kulüp / seçili üyeler / görev eki / teslim; içerik baytlarından tür tespiti (PE/ELF/Mach-O, HTML, SVG reddedilir; uzantı-içerik uyumu); rastgele depolama anahtarı, `wx` yazımı; kulüp ve öğrenci başına kota | Birim testleri + kılık değiştirmiş .exe testi (diskte iz yok) |
| İndirme: her istekte yetki; yetkisize 404; `attachment`, `nosniff`, `CSP: sandbox`, CORP same-origin | Başlık testleri, curl |
| Canlı quiz (puanlı, isimli) ve anket (isteğe bağlı anonim): çoktan seçmeli / doğru-yanlış, 10 sn–10 dk süre, sunucu tarafı süre ve otomatik kapanış, kişi başına tek cevap (DB birincil anahtarı), eğitmene canlı dağılım, öğrenciye dağılım ve doğru cevap yalnız açıklanınca; doğru cevaba `live.quiz` XP (soru başına bir kez); anonimde eğitmen de kimin ne seçtiğini görmez; yeniden bağlanınca durum geri gelir | 9 hub testi + tarayıcı + betikli WS öğrenci |
| Duyurular: herkese / yalnız personele, sabitleme, bitiş tarihi; uygulama içi bildirim | Testler |
| Bildirimler: görev yayınlandı, yeni teslim, değerlendirme sonucu, duyuru; menüde okunmamış sayısı; kişi yalnız kendi bildirimini okundu yapar | Testler |
| VMware uygulama molası slaytı (`practical` blok): öğrenciye açıklama, dosyalar, adımlar, süre ve teslim formu; eğitmene hazırlık notları, VM'ler, snapshot, beklenen sonuç, teslim durumu (5 sn'de bir), değerlendirme bağlantısı. Eğitmen notları öğrenci destesinden sunucuda çıkarılır. Slayta ilk geçişte bağlı görev bir kez oluşur. **Sistem VMware'i başlatmaz/yönetmez**; WebRTC gerekmiyor | Testler + tarayıcı |
| Sayfalar: /tasks, /tasks/[id], /teach/tasks (+ yeni, düzenle, değerlendirme), /files, /announcements, /notifications; panelde görev ve duyuru kartları; yönetim → sistem durumunda dosya kotası; ayarlarda kulüp/öğrenci kotası | Masaüstü + 375 px, taşma yok |

### Faz 5'in eksikleri — Faz 6'da tamamlandı (branch: feature/club-studio)

| Özellik | Kanıt |
|---|---|
| **Sınıflar ve etkinlikler** (`ClassGroup`): sınıf üyelerini personel belirler; etkinlikte tarih/yer/kapasite ve isteğe bağlı öğrenci kaydı (kapasite eşzamanlı isteklerde satır kilidiyle korunur). Görev (`audience: GROUP`) ve dosya (`scope: GROUP`) bir gruba hedeflenebilir; arşivlenen grubun görev/dosyaları üyelerine kapanır; öğrenci üye listesini görmez | migration `phase6_studio`; 3 test (4 eşzamanlı kayıt → 2 kabul) |
| **Takım görevleri**: takım başına tek teslim; takım arkadaşları teslimi ve dosyalarını görür, günceller; onayda XP takımdaki herkese (kişi başı bir kez); teslimden sonra takımlar değişmez | 2 test |
| **Otomatik puanlanan görev** (`QUIZ`): tek/çoklu seçim, doğru/yanlış, kısa cevap (harf/Türkçe karakter duyarsız), eşleştirme (deterministik karıştırma). Cevap anahtarı öğrenciye gitmez; geçen teslim aynı transaction'da onay + XP; deneme hakkı; sonuç kesinleşince açıklamalar | 5 birim + 2 entegrasyon testi |
| **ZIP denetimi** (açmadan, merkezi dizinden): şifreli öğe, yol geçişi (`..`, mutlak yol), iç içe arşiv, çalıştırılabilir ad/içerik, sıkıştırma bombası, ZIP64 | 4 birim testi (test içinde ZIP üretilir) |
| **ClamAV** (isteğe bağlı, `docker compose --profile clamav`): clamd INSTREAM; tanımlıysa tarama zorunlu, tarayıcıya ulaşılamazsa yükleme reddedilir | sahte clamd ile 2 test |

### Faz 5 ve 6'da hâlâ bilinçli olarak yapılmayanlar
- **WebRTC ekran paylaşımı**: gerekmiyor; mimari engel yok.
- **Office makrolu belgeler / ZIP dışı arşivler** (7z, rar): yüklenemez (izin listesinde değil).

## ✅ Faz 6 — Club Studio, e-posta, analitik, sertleştirme, E2E

| Özellik | Kanıt |
|---|---|
| **Club Studio** (`/teach/presentations/[id]/studio`): slayt ekle/çoğalt/sil/taşı, düzen, 9 blok türü için form (başlık, metin, madde, kod + adım vurgusu, terminal, bilgi kutusu, animasyon, görsel, VMware molası), canlı önizleme (adım adım), eğitmen notları | Tarayıcı + E2E adım 6 |
| Otomatik kayıt **taslağa** yazılır (sürüm oluşturmaz); doğrulama sorunları slayt/blok konumuyla listelenir ve yayını engeller; **Yayınla** doğrulanmış yeni sürüm açar; **sürüm geçmişi** ve eski sürümü taslağa yükleme; kaydedilmemiş değişiklikte sayfadan çıkış uyarısı | 4 test |
| **Şablon olarak paylaş**: yayınlanmış sunum diğer eğitmenlerin şablon listesinde görünür ve kopyalanır | Test |
| **Görsel bloğu**: yalnız kulübe yüklenmiş raster görsel (`MEDIA` kapsamı; PNG/JPEG/WebP, SVG yok); yayında dosyanın varlığı/türü doğrulanır; görsel `inline` + `nosniff` + `CSP sandbox` ile sunulur, diğer dosyalar her zaman indirme | Test |
| **E-posta** (`EmailOutbox` + işçi): istek yolu SMTP'ye bağlanmaz; 5 deneme, artan bekleme; STARTTLS zorunlu; satır sonu temizliği (başlık enjeksiyonu); gönderilenler 30 gün sonra silinir. SMTP yoksa üretimde kapalı, geliştirmede `storage/mail/` | 2 test |
| **Bildirim e-postaları**: görev, değerlendirme, duyuru; kişi Hesabım'dan kapatabilir | Test |
| **Parola sıfırlama**: yanıt hesabın varlığını sızdırmaz; token 256 bit, DB'de yalnız hash, 30 dk, tek kullanımlık (eşzamanlı kullanımda tek kazanan), yeni istek eskisini iptal eder, bağlantı `#token` (sunucu günlüğüne düşmez), IP ve hesap başına sınır, sıfırlamada tüm oturumlar kapanır | 3 test |
| **Oturum yönetimi** (Hesabım): cihaz listesi, tek tek ya da toplu kapatma; başkasının oturumu kapatılamaz | Test |
| **Sahiplik devri** (Ayarlar, yalnız OWNER): parola doğrulaması, hedef aktif ADMIN olmalı, tek transaction; her an tek OWNER | Test |
| **Analitik** (`/teach/analytics`, personel): haftalık aktif öğrenci, giriş, akademi yol tamamlanma, en zorlayan quizler, görev katılım/onay/geç teslim, canlı ders katılımı, XP kaynakları. Bireysel öğrenci listesi yok | Test + tarayıcı |
| **İngilizce katalog**: `tr.ts` anahtarlarının tamamı (tip denetimli) | Typecheck |
| **13 adımlı E2E** (Playwright, `npm run test:e2e`): kurulum sihirbazı → başvuru → onay öncesi giriş reddi + onay → giriş → şablondan sunum → Studio'da düzenle + yayınla → canlı ders → kodla katılım → eşzamanlı ilerleme → canlı quiz + açıklama → görev yayınla → bildirimden teslim → onay + bildirimde XP + liderlikte 130 XP | ✅ 1/1 (20 sn), ayrı `_e2e` veritabanı, derlenmiş üretim sunucusu |
| **CI (S-01)**: E2E işi, gitleaks (tüm geçmiş; yalnız test dosyalarındaki sahte değerler muaf), CodeQL `security-extended` | Yerelde gitleaks: sızıntı yok |

### Faz 6'da bilinen sınırlamalar
- **Sayfa metinlerinin çoğu Türkçe sabit metin**; İngilizce katalog menü, roller, giriş/kayıt ve hesap ekranlarını kapsar. Tam çeviri, sayfa metinlerinin kataloğa taşınmasını gerektirir.
- **Studio'da aynı anda iki eğitmen** aynı sunumu düzenlerse son kayıt kazanır (kilitleme yok).
- E-posta kuyruğu tek süreçte işlenir (tek sunucu kurulumu için yeterli).
- CodeQL ve gitleaks işleri GitHub'da henüz çalıştırılmadı (PR açılınca çalışır); E2E yerelde çalıştı.
- Geliştirme bağımlılıklarında (vitest, braces) `npm audit` uyarıları var; üretim bağımlılıklarında açık yok (`npm audit --omit=dev`: 0).

## 🎨 Tasarım: CIU tabanlı tema + üst başlık (2026-10-23)

- Kullanıcının verdiği ciu.edu.tr tabanlı tasarım sistemi uygulandı (üniversitenin logosu/adı kullanılmaz; kulübün kendi markası kalır).
- Renk: derin mor marka (#5C1FE2), neon yeşil yalnız eylem (#17FF74, üzerinde koyu metin), krem yüzeyler (#FFFCF2),
  mürekkep metin (#2E2E2E); mor→macenta galaxy degradesi vurgulu bölümlerde (ana sayfa karşılama bandı, ilerleme, sekmeler).
- Tipografi: Lexend Tera 700 BÜYÜK HARF başlıklar (-0.12em), Readex Pro gövde (0.02em); fontsource ile kendi sunucumuzdan.
- Bileşenler: hap butonlar (birincil yeşil, ikincil mor çerçeve), 20px gölgesiz kartlar, 16px inputlar (odakta mor çerçeve),
  52px etiketler, krem açılır menüler (dropdown gölgesi).
- **Kenar çubuğu yerine TryHackMe tarzı üst başlık**: mor degrade şerit · Ana sayfa / Akademi / Canlı ders · *Sınıf* ve
  *Eğitmen* açılır menüleri · Liderlik · Yönetim · bildirim zili · kullanıcı menüsü. 1180 px altında hamburger panel.
- Slayt sahnesi ve canlı ders ekranı **koyu kapsamda** kalır (projeksiyon okunurluğu); orada vurgu yeşil.
- Doğrulama: 196/196 test, E2E 1/1, 375 px'de taşma yok (denetim çizelgesindeki uzun kod düzeltildi).

## 🧭 Tasarım konseyi ve dikey dilim (2026-10-23)

- **Kimlik:** UKÜ Siber Güvenlik Kulübü (CIU Cyber Security Club) logosu `public/brand/`, favicon `src/app/icon.png`.
- **16 ajanlı tasarım konseyi** (`docs/design-council/`, kaynak: kullanıcının verdiği zip). Ajanlar `.claude/agents/<ad>.md`
  tanımlarıyla, salt okuma yetkisiyle, ayrı alt ajanlar olarak çalıştırıldı (35 çağrı: Tur 1 ×16, öğrenci eleştirisi ×4,
  tartışma ×5, yargıç ×3, belge yazıcı ×7). Öğrenci tepkileri **simülasyondur**; gerçek kullanıcı verisi yok, sonuç uydurulmadı.
  Matris: C 7.43 · A 6.77 · B 5.98 → **koşullu melez** (kabuk A, ders gövdesi C, etkileşim motoru B).
- **Terminal bloğu** (§5.14): `Terminal.tsx` + `terminal-parse.ts`; Markdown kabuk blokları ve slayt terminali bunu kullanır.
- **Lab odası** (§5A): ders sayfası breadcrumb, 96px ikon, yol ilerleme rayı, `.lab-prose`, `.lab-qa` quiz (doğru kilit, yanlış
  sallanma, `aria-live`). Varsayılan açık oda; koyu oda kullanıcı tercihi.
- **Dikey dilim** (07 §3): (1) `continueTarget` PROGRAM yolunu atlar; hiç ders bitirmemiş öğrenciye panelde tek "İlk görev" kartı.
  (2) Eksik görsel yer tutucusu öğrenciye gösterilmez; görevli derste kilit nedeni yazılır. (3) **Mini görev "Şüpheli Mesaj:
  Sahte Kampüs Bursu"** (`m01-05`, `gorevler:` + `::gorev[id]`, `MissionCard`, `MissionAttempt`, check/complete API; cevap
  anahtarı istemciye gitmez; bağlantı/parola alanı yok). (4) `mission.complete` = 60 XP, görev başına bir kez; ipucu XP'yi
  düşürmez; 2 yanlıştan sonra çözümlü örnek. (5) Sunumlara `mission` bloğu (Studio'dan seçilir, kayıtta doğrulanır); canlı
  ders bitişinde "Kendi hızında tekrar et" köprüsü. Canlı hub/protokol değişmedi.
- Kararlar ve kalan işler: `docs/design-council/07-implementation-and-tests.md` §10.1 ve "Uygulama ve test sonuçları".
- Doğrulama: typecheck + lint hatasız, `academy:check` hatasız, **217/217** vitest (yeni: görev birim 10, görev entegrasyon 6,
  terminal 5), E2E 1/1 (yeni adım 4b: ilk görev uçtan uca), tarayıcıda görev akışı + koyu oda + 375 px taşma yok.

## 🧪 Çalıştırılan testler (2026-10-23, Faz 6)

| Komut | Sonuç |
|---|---|
| `npm run typecheck` · `npm run lint` | ✅ hatasız |
| `npm test` | ✅ **196/196** (23 dosya; yeni: ZIP/ClamAV, otomatik puanlama, gruplar/takımlar/test görevi, Studio, hesap/e-posta/analitik) |
| `npm run build` | ✅ |
| `npm run test:e2e:run` (Playwright, Chromium) | ✅ 13 adım, 1/1 |
| gitleaks v8.24.3 (geçmiş + çalışma ağacı `src`, `e2e`) | ✅ sızıntı yok |
| Tarayıcı (dev): Studio, sınıf oluştur + üye ekle, test görevi soru editörü, analitik, Hesabım (oturumlar, e-posta tercihi), parola sıfırlama sayfaları; 375 px taşma yok | ✅ |

## 🧪 Çalıştırılan testler (2026-10-23, Faz 5)

| Komut | Sonuç |
|---|---|
| `npm run typecheck` · `npm run lint` | ✅ hatasız |
| `npm test` | ✅ **166/166** (18 dosya; yeni: dosya doğrulama, sınıf yönetimi, canlı quiz/uygulama molası) |
| `npm run build` | ✅ |
| Tarayıcı (dev): görev oluştur → yayınla → öğrenci teslimi (API) → rubrikle onay (+120 XP bildirimi) → indirme başlıkları; canlı quiz (betikli WS öğrenci cevapladı, açıklamadan önce doğru cevabı görmedi) → uygulama molası slaytı → bağlı görev; 375 px taşma kontrolü | ✅ |

## 🧪 Çalıştırılan testler (2026-10-22)

| Komut | Sonuç |
|---|---|
| `npm run typecheck` | ✅ hatasız |
| `npm run lint` | ✅ hatasız |
| `npm test` | ✅ **94/94** (4 birim + 7 entegrasyon dosyası, gerçek PostgreSQL + gerçek WebSocket) |
| `npm run build` | ✅ |
| `./install.sh --http --port 3110` (temiz kopya) | ✅ imaj derlendi, servisler sağlıklı |
| `SETUP_TOKEN=… node scripts/smoke.mjs http://localhost:3110` (üretim konteyneri) | ✅ **32/32** — kurulum → davet → başvuru → onay → giriş → RBAC → sunum → canlı ders → WS senkron → soru → bitir → özet |
| `club.sh backup` / `club.sh restore` | ✅ |
| Tarayıcı (dev): kurulum sihirbazı, admin paneli, başvuru onayı, XSS yükü kaçışı, davet oluşturma, mobil görünüm | ✅ |

Doğrulanan güvenlik senaryoları (testlerde): yanlış/süresi dolmuş kurulum anahtarı, eşzamanlı kurulum yarışı,
öğrenci/eğitmen ile 10 admin uç noktası → 403, ADMIN'in OWNER/ADMIN yönetememesi ve yetki yükseltememesi,
davet kullanım limiti yarışı (6 eşzamanlı istek → 2 kabul), yabancı Origin, form-encoded CSRF, sahte token,
süresi dolmuş/boşta oturum, kaba kuvvet 429, `role: "OWNER"` enjeksiyonu, SVG-in-PNG yükleme, yol geçişi dosya adı.

## ⏳ Henüz yapılmadı (bilinçli olarak Faz 1 dışı)

| Faz | Eksik |
|---|---|
| 3 | LearningPath/Module/Lesson, 10 başlangıç yolu, quiz türleri, öğrenci dashboard içeriği, ilerleme |
| 4 | XPTransaction (idempotency), XP kuralları (admin düzenlenebilir), seviyeler, rozetler, aylık/genel liderlik |
| 5 | ✅ yapıldı (eksikleri dahil) |
| 6 | ✅ yapıldı (bkz. Faz 6 sınırlamaları) |

### Faz 2 içindeki bilinen sınırlamalar
- ~~Görsel blok editörü yok~~ → Faz 6: Club Studio. JSON biçimi: [docs/SUNUM-FORMATI.md](docs/SUNUM-FORMATI.md).
- Canlı oturum durumu tek süreçte; yatay ölçeklemede Redis pub/sub gerekir (8 GB tek VPS hedefi için gereksiz).
- Sunucu ani çökerse son ≤30 sn'lik katılım süresi kaybolabilir (düzgün kapanışta kayıp yok).
- WebRTC ekran paylaşımı yok (mimari engel yok; temel sistem için gerekmiyor).

### Faz 1 içindeki bilinen sınırlamalar
- ~~E-posta / parola sıfırlama yok~~ → Faz 6 (SMTP isteğe bağlı; yoksa yönetici yardımı gerekir).
- ~~Sahiplik devri yok~~ → Faz 6.
- **Uygulama içinden yedek indirme** yok; yedekleme sunucu komut satırından (`club.sh backup`). Tam DB dökümünü web'den sunmak ayrı bir risk değerlendirmesi gerektirir.
- **Tema** ayarı alanı var ama yalnızca koyu tema mevcut; **İngilizce** katalog tam, sayfa gövdeleri Türkçe (bkz. Faz 6 sınırlamaları).
- ~~Oturum yönetimi ekranı yok~~ → Faz 6 (Hesabım).
- Rate limit ve ayar önbelleği **süreç içi bellek**te: tek sunucu kurulumu için doğru; yatay ölçeklemede Redis gerekir.
- Saat dilimi seçimi sihirbazda/ayarlarda 5 seçenekle sınırlı (API her geçerli IANA dilimini kabul eder).
- Club CI workflow'u yalnız main'e push ve PR'larda çalışır; feature dalları için PR açılmadı.

## Alınan kararlar

| Karar | Gerekçe |
|---|---|
| Next.js 15.5 + TypeScript (lab: 14 + JS) | Kararlı sürüm; club tipli ve bağımsız |
| Prisma 6 (7/8 değil) | Olgun, `url = env()` modeli; 8 RC aşamasında |
| Özel Node sunucusu (`server.ts`) | WebSocket'in Next ile aynı port/oturum doğrulamasını paylaşması (Faz 2) |
| DB tabanlı opak oturum (JWT değil) | Anında iptal (rol değişimi, devre dışı) |
| Üyelik durumu `User.status` + başvuru alanları (ayrı Membership tablosu yok) | Tek kulüplü kurulum; 1:1 ilişki gereksiz karmaşıklık |
| Rol enum (ayrı Role tablosu yok) | Sabit 4 rol; izin matrisi kodda ve testli |
| Redis yok | 8 GB tek VPS hedefi |
| Fontlar `@fontsource` ile self-host | CSP `font-src 'self'`; derlemede ağ bağımlılığı yok |
| Test temizliği `TRUNCATE` (yalnızca adı `_test` olan DB) | Prisma'nın `migrate reset` korumasını aşmamak için yıkıcı olmayan `migrate deploy` + izole test DB |

## Sonraki adımlar

1. Noir tasarım + akademi içeriği + Faz 3 değişikliklerini incele ve commit'le (`feature/academy-content`, henüz commit'lenmedi; ham `images/` klasörü commit dışında kalmalı).
2. Görseller (Midjourney sahneleri, ekran görüntüleri) geldikçe `content/academy/gorseller/` altına WebP olarak eklenecek.
3. Kalan uzmanlık yolları (C–G) ve yol sonu quizleri.
4. Yükseltmede bir kez: `node dist/cli.js xp-backfill` (Faz 4 öncesi tamamlanan ders ve quizlere XP).
5. Faz 6'yı incele ve commit'le (`feature/club-studio`, henüz commit'lenmedi). Yükseltmede migration'lar (`phase6_studio`) otomatik uygulanır.
6. E-posta için `.env`'e SMTP_* değişkenlerini, virüs taraması için `--profile clamav` + `CLAMAV_HOST=clamav` ekle (isteğe bağlı).
7. `feature/club-studio` → `main` PR'ı: CI'da test, E2E, gitleaks ve CodeQL ilk kez çalışır.
8. Kılavuz: [docs/KULLANIM-KILAVUZU.md](docs/KULLANIM-KILAVUZU.md).
