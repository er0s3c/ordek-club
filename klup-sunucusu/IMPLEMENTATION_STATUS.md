# Ördek Club — Uygulama Durumu

> Son güncelleme: 2026-10-23 · Branch: `feature/club-classroom` (Faz 5) · Sorumlu: Opus 5.5

## Özet

**Faz 1 (çalışan temel) ve Faz 2 (canlı eğitim) tamamlandı ve doğrulandı. Faz 3 (Club Academy) çalışır durumda:** dersler, quizler, ilerleme ve hikâye platformda. **Faz 4 (XP, seviyeler, rozetler, liderlik) çalışır durumda.** **Faz 5 (görevler, dosyalar, canlı quiz/anket, duyurular, VMware uygulama molası) çalışır durumda.** Faz 6 başlamadı.

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

### Faz 5'te bilinçli olarak eksik kalanlar
- **Sınıf/şube ve etkinlik kapsamları** (görev ve dosyayı bir sınıfa/etkinliğe atamak): veri modelinde sınıf/etkinlik yok; şimdilik "tüm öğrenciler" ya da kullanıcı adı listesi.
- **Grup görevleri** (ortak teslim): her teslim kişiseldir.
- **Çoktan seçmeli / eşleştirme görev türü** (otomatik puanlanan ödev): canlı quiz ve akademi quizleri var; ödev tarafında yok.
- **E-posta bildirimleri**: yalnız uygulama içi (SMTP Faz 6).
- **Görsel (resim) slayt bloğu**: dosya deposu hazır; blok ve editör desteği Faz 6.
- **Dosya içeriği taraması** (antivirüs): yalnız tür doğrulaması yapılır; ZIP içleri açılmaz. Dosyalar indirme olarak sunulur, uygulama kökeninde çalışmaz.
- **WebRTC ekran paylaşımı**: gerekmiyor; mimari engel yok.

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
| 5 | ✅ yapıldı (bkz. Faz 5). Kalanlar: sınıf/etkinlik kapsamı, grup görevi, otomatik puanlı ödev türü, görsel blok |
| 6 | Club Studio blok editörü (şimdilik JSON dışa aktar → düzenle → içe aktar), analitik, Playwright ile 13 adımlı E2E, ek sertleştirme |

### Faz 2 içindeki bilinen sınırlamalar
- Görsel blok editörü yok (Faz 6). İçerik düzenleme: JSON dışa aktar → düzenle → “İçeriği değiştir”. Biçim: [docs/SUNUM-FORMATI.md](docs/SUNUM-FORMATI.md).
- Görsel (resim) bloğu yok: güvenli dosya deposu Faz 5'te geldi; blok Faz 6'da.
- Canlı oturum durumu tek süreçte; yatay ölçeklemede Redis pub/sub gerekir (8 GB tek VPS hedefi için gereksiz).
- Sunucu ani çökerse son ≤30 sn'lik katılım süresi kaybolabilir (düzgün kapanışta kayıp yok).
- WebRTC ekran paylaşımı yok (mimari engel yok; temel sistem için gerekmiyor).

### Faz 1 içindeki bilinen sınırlamalar
- **E-posta ayarları / parola sıfırlama e-postası yok** (SMTP yok). Parolasını unutan üye için şimdilik çözüm: yönetici hesabı devre dışı bırakıp yeni davet verir. Faz 6'da e-posta altyapısı + güvenli sıfırlama.
- **Sahiplik devri (OWNER → başka kullanıcı)** yok.
- **Uygulama içinden yedek indirme** yok; yedekleme sunucu komut satırından (`club.sh backup`). Tam DB dökümünü web'den sunmak ayrı bir risk değerlendirmesi gerektirir.
- **Tema** ayarı alanı var ama yalnızca koyu tema mevcut; **İngilizce** çeviri kısmi.
- **Oturum yönetimi ekranı** (aktif cihazları listeleyip tek tek kapatma) yok; sayı gösteriliyor, CLI ile toplu iptal var.
- Rate limit ve ayar önbelleği **süreç içi bellek**te: tek sunucu kurulumu için doğru; yatay ölçeklemede Redis gerekir.
- Saat dilimi seçimi sihirbazda/ayarlarda 5 seçenekle sınırlı (API her geçerli IANA dilimini kabul eder).
- Club CI workflow henüz GitHub'da çalıştırılmadı (push yapılmadı).

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
5. Faz 5'i incele ve commit'le (`feature/club-classroom`, henüz commit'lenmedi). Yükseltmede migration `phase5_classroom` uygulanır; ek komut gerekmez.
6. Faz 6: Club Studio editörü, görsel blok, e-posta, analitik, E2E.
