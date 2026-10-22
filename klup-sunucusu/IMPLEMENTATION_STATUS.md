# Ördek Club — Uygulama Durumu

> Son güncelleme: 2026-10-22 · Branch: `feature/academy-content` (Faz 3) · Sorumlu: Opus 5.5

## Özet

**Faz 1 (çalışan temel) ve Faz 2 (canlı eğitim) tamamlandı ve doğrulandı. Faz 3 (Club Academy) çalışır durumda:** dersler, quizler, ilerleme ve hikâye platformda. Faz 4–6 başlamadı.

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
| Kısım II — 84 uzmanlık dersinin tam sayfaları | ⏳ |
| Sentetik laboratuvar dosyası (`content/academy/lab/auth.log`) | ✅ |
| Noir mafya + hacker tasarımı (Club arayüzü, canlı ders slaytları, AI görsel stili) | ✅ |
| Gölge Ağ Ailesi: 11 modül kötü adamı + Baron Eren (genç hâli dahil) + Tek Tırnak Jasmine ([karakterler.yaml](content/academy/karakterler.yaml) → [KARAKTERLER.md](content/academy/KARAKTERLER.md)) | ✅ |
| Hikâye "Gölge Ağ — Sezon 1": [hikâye sayfası](content/academy/00-program/09-golge-ag.md), her modülde bölüm girişi + DOSYA KAPANDI kutusu | ✅ |
| Yol A (Web güvenliği): 12 ders + Sezon 2 "Çekmeceler" (Tek Tırnak Jasmine), sentetik `lab/access.log` | ✅ |
| Yol B (Ağ ve sistem güvenliği): 12 ders + Sezon 2 "Tüneller" (Tünelci Tarık, dördüncü Kapüşonlu) | ✅ |
| Görseller: 153 adet (16 karakter portresi, 122 Midjourney sahnesi — her bölümde bir tane, 15 ekran görüntüsü) — [GORSELLER.md](content/academy/GORSELLER.md) | ⏳ kullanıcıdan bekleniyor |
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
| 5 | Görev atama/teslim/rubrik, dosya paylaşımı (FileAsset/FilePermission, kota — `maxUploadMb` ayarı hazır), **canlı quiz ve canlı anket** (WS altyapısı hazır), seçili öğrenci/gruba görev gönderme, bildirimler, VMware uygulama molası slaytı, görsel blokları (dosya deposuna bağlı) |
| 6 | Club Studio blok editörü (şimdilik JSON dışa aktar → düzenle → içe aktar), analitik, Playwright ile 13 adımlı E2E, ek sertleştirme |

### Faz 2 içindeki bilinen sınırlamalar
- Görsel blok editörü yok (Faz 6). İçerik düzenleme: JSON dışa aktar → düzenle → “İçeriği değiştir”. Biçim: [docs/SUNUM-FORMATI.md](docs/SUNUM-FORMATI.md).
- Görsel (resim) bloğu yok: güvenli dosya deposu Faz 5'te gelince eklenecek.
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
4. Faz 4: XP, seviyeler, rozetler, liderlik tablosu (akademi ilerlemesi XP kaynağı olacak).
