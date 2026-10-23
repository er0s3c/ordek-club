# Ördek Club

Üniversite siber güvenlik kulüpleri için **bağımsız**, kendi sunucunuzda çalışan eğitim platformu.
Ördek Lab ile aynı repository'de durur ama onunla **hiçbir çalışma zamanı bağı yoktur**: ayrı
veritabanı, ayrı Docker yığını, ayrı ağ; saldırı lab'ı, flag sistemi veya `docker.sock` erişimi yok.

> Durum: **Faz 1–6** çalışıyor — kurulum ve üyelik, canlı sınıf (quiz/anket, VMware uygulama molası), Club Academy,
> XP/rozet/liderlik, görevler (rubrik, takım, otomatik puanlama), sınıflar/etkinlikler, dosya paylaşımı, duyurular,
> Club Studio sunum editörü, e-posta, analitik. Ayrıntı: [IMPLEMENTATION_STATUS.md](IMPLEMENTATION_STATUS.md) ·
> Kullanım: [docs/KULLANIM-KILAVUZU.md](docs/KULLANIM-KILAVUZU.md)

## Canlı ders nasıl yapılır?

1. Eğitmen (veya yönetici) **Eğitmen paneli → bir şablondan oluştur** ya da kendi sunum JSON'unu içe aktarır
   ([biçim](docs/SUNUM-FORMATI.md)).
2. **Canlı başlat** → konsolda 6 haneli kod ve QR kod görünür. Projeksiyon için **Projeksiyon ekranı**nı açın.
3. Öğrenciler giriş yapıp **Canlı ders** sayfasında kodu girer (veya QR'ı okutur).
4. Eğitmen **İleri / ← →** ile slaytları ve animasyon adımlarını yönetir; öğrenci ekranları anında senkronize olur.
   Duraklatma, otomatik oynatma, hız, serbest gezinme izni, el kaldırma, sorular ve duyurular konsoldadır.
5. **Dersi bitir** → katılım ve etkinlik özeti.

15 hazır animasyon: HTTP, DNS, TCP el sıkışma, TLS, kimlik doğrulama, SQL Injection, XSS, phishing, paket yolculuğu,
güvenlik duvarı, VPN, MITM, güvenli/güvensiz kod, ağ topolojisi, SOC alarm süreci.

---

## Hızlı kurulum (Linux sunucu)

Gereksinim: Docker Engine + Docker Compose v2, ~2 GB boş RAM.

```bash
git clone https://github.com/er0s3c/ordek.git
cd ordek/klup-sunucusu
./install.sh                     # etkileşimli: alan adı sorar
# veya
./install.sh --domain club.ornek.edu.tr   # otomatik HTTPS (Caddy + Let's Encrypt)
./install.sh --http --port 3100           # yerel ağ / deneme (HTTP)
```

`install.sh` şunları yapar:

1. Docker'ı kontrol eder.
2. `.env` dosyasını **güçlü rastgele** veritabanı parolası ve uygulama sırrıyla üretir (izin 600).
3. İmajı derler, PostgreSQL + uygulamayı başlatır; **migration'lar otomatik** uygulanır.
4. Ekrana tek seferlik **kurulum anahtarını** yazar.

Ardından tarayıcıda `https://alan-adiniz/setup` adresini açın:

| Adım | |
|---|---|
| 1. Kurulum anahtarı | Sunucuya erişimi olmayan biri kurulumu ele geçiremesin diye. Anahtar 24 saat geçerlidir. |
| 2. Kulüp bilgileri | Ad, üniversite, açıklama, sunucu adresi, saat dilimi, kayıt politikası |
| 3. Kurucu hesabı | OWNER rolü — varsayılan parola **yoktur** |
| 4. Logo | İsteğe bağlı (PNG/JPEG/WebP, ≤1 MB) |

Kurulum tamamlanana kadar giriş, kayıt ve yönetim API'leri kapalıdır.

> **HTTPS:** Alan adının DNS kaydı sunucuyu göstermeli ve 80/443 portları açık olmalı.
> HTTPS modunda uygulama portu yalnızca `127.0.0.1`'e bağlanır; dışarıya Caddy açılır.

## Yönetim komutları

```bash
./scripts/club.sh status            # servisler + üye sayıları + sağlık
./scripts/club.sh logs              # canlı loglar
./scripts/club.sh setup-token       # kurulum anahtarını yeniden göster
./scripts/club.sh backup            # backups/club-db-*.dump + club-storage-*.tar.gz
./scripts/club.sh restore backups/club-db-X.dump backups/club-storage-X.tar.gz
./scripts/club.sh update            # git pull → yedek → yeniden derle → migration → başlat
./scripts/club.sh revoke-sessions   # herkesin oturumunu kapat (güvenlik olayı sonrası)
```

**Yedekleme önerisi:** `backup` komutunu günlük cron'a ekleyin ve `backups/` ile `.env`'i sunucu
dışına kopyalayın. `.env` kaybolursa veritabanı yedeği yine geri yüklenebilir, ancak açık oturumlar düşer.

```cron
30 3 * * * cd /opt/ordek/klup-sunucusu && ./scripts/club.sh backup >> backups/cron.log 2>&1
```

Veriler iki Docker volume'unda kalıcıdır: `ordek-club_club_pg` (veritabanı) ve `ordek-club_club_storage`
(logo ve ileride yüklenen dosyalar). `docker compose down` verileri silmez; **`down -v` siler.**

## Sorun giderme

| Belirti | Çözüm |
|---|---|
| `POSTGRES_PASSWORD tanımlı değil` | `.env` yok → `./install.sh` çalıştırın. |
| `Üretimde varsayılan APP_SECRET kullanılamaz` | `.env.example`'ı kopyalamışsınız. `.env`'i silip `./install.sh` çalıştırın. |
| Sayfa "Veritabanına ulaşılamıyor" | `./scripts/club.sh status` ve `./scripts/club.sh logs db` |
| Kurulum anahtarı süresi doldu | `./scripts/club.sh restart` (yeni anahtar loga yazılır) veya `./scripts/club.sh setup-token` |
| HTTPS sertifikası alınamıyor | DNS kaydı ve 80/443 portları; `./scripts/club.sh logs caddy` |
| Giriş sonrası hemen çıkış oluyor | HTTP üzerinden erişirken `APP_URL` `https://` ile başlıyorsa çerez `Secure` olur — `APP_URL`'i düzeltin. |
| "Çok fazla deneme" | Giriş hız sınırı (kullanıcı başına 15 dk'da 8 deneme). Bekleyin ya da `restart`. |

## Roller

| Rol | Şu an yapabildikleri |
|---|---|
| **OWNER** | Her şey; ADMIN atayabilir. Kendisi yönetilemez/devre dışı bırakılamaz. |
| **ADMIN** | Başvuru onay/red, INSTRUCTOR/STUDENT rol atama, devre dışı bırakma, davet kodları, ayarlar, denetim kaydı, sistem durumu |
| **INSTRUCTOR** | Sunum oluşturma/içe aktarma, kendi sunumlarını yönetme, yayınlanmış sunumları kopyalama, canlı ders başlatma ve yönetme, ders özetleri |
| **STUDENT** | Canlı derslere kodla katılma, el kaldırma, soru sorma (bireysel öğrenme paneli Faz 3'te) |

Kayıt politikaları: **Başvuru + onay** (varsayılan), **Yalnızca davet**, **Açık kayıt**, **Kapalı**.
Davet kodları rol taşıyabilir, kullanım limiti/son kullanma tarihi olabilir ve isteğe bağlı otomatik onay verir.

## Güvenlik özeti

- Parolalar **scrypt** (N=2¹⁵, r=8) ile; min. 10 karakter, yaygın parolalar ve kullanıcı adını içeren parolalar reddedilir.
- Oturum: 256-bit opak token, DB'de yalnızca **SHA-256 hash**; çerez `HttpOnly`, `SameSite=Lax`, HTTPS'te `Secure`.
  Mutlak ömür + hareketsizlik sınırı (ayarlardan); parola/rol değişimi ve devre dışı bırakmada oturumlar düşer.
- **CSRF:** durum değiştiren her istekte Origin/Sec-Fetch-Site kontrolü + yalnızca JSON gövde.
- **RBAC** her API handler'ında ve her sayfada sunucu tarafında; middleware'e güvenilmez. Rol yükseltme kuralları
  `src/server/auth/policy.ts`'de saf fonksiyonlardır ve birim testlidir.
- **Mass assignment:** tüm girdiler zod şemalarıyla; tanımsız alanlar (`role`, `status`…) atılır.
- **Kaba kuvvet:** IP ve kullanıcı başına hız sınırı; olmayan kullanıcıda da aynı süre/yanıt (numaralandırma yok).
- **Davet / kurulum kodları:** kriptografik rastgele, DB'de hash'li; davet tüketimi tek atomik `UPDATE` (yarış koşulu yok).
- **Dosya yükleme (logo):** içerik imzası (magic byte) ile tür tespiti, SVG yok, sunucu tarafı dosya adı, boyut sınırı,
  `nosniff` + `sandbox` CSP ile servis.
- **Başlıklar:** nonce'lu CSP, `frame-ancestors 'none'`, `X-Frame-Options: DENY`, `nosniff`, `Referrer-Policy`.
- **Audit log:** giriş/başarısız giriş, üyelik kararları, rol/ayar değişiklikleri (önce/sonra değerleriyle).
- **Docker:** root olmayan kullanıcı, salt-okunur kök FS, `cap_drop: ALL`, `no-new-privileges`, DB portu dışarı kapalı, `docker.sock` yok.

## Geliştirme

```bash
cd klup-sunucusu
cp .env.example .env
docker compose -f compose.dev.yaml up -d     # PostgreSQL → 127.0.0.1:5433
npm install
npx prisma migrate deploy
npm run dev                                  # http://localhost:3100 (kurulum anahtarı konsolda)
```

| Komut | |
|---|---|
| `npm test` | Birim + entegrasyon testleri (ayrı `ordek_club_test` veritabanında) |
| `npm run test:e2e` | Derler ve 13 adımlı Playwright akışını ayrı `ordek_club_e2e` veritabanında, 3199 portunda çalıştırır (ilk kez: `npx playwright install chromium`) |
| `npm run typecheck` / `npm run lint` | TypeScript ve ESLint |
| `npm run build` | Üretim derlemesi (Next.js + `dist/server.js`) |
| `node scripts/smoke.mjs <url>` | Çalışan sunucuya HTTP smoke testi; `SETUP_TOKEN=…` ile boş kurulumda tam uçtan uca akış |

### Mimari

```
server.ts            Özel Node sunucusu: Next.js + (Faz 2) WebSocket, tek port
cli.ts               Konteyner içi yönetim CLI'ı (setup-token, revoke-sessions, status)
src/app/(auth)       login, register, setup (sihirbaz)
src/app/(member)     dashboard, account
src/app/admin        yönetim paneli
src/app/api          REST route handler'ları (hepsi route() sarmalayıcısıyla)
src/server/          iş mantığı: auth/, members, invitations, setup, branding, audit, health
src/lib/validation   istemci+sunucu ortak zod şemaları
src/i18n             Türkçe (varsayılan) + İngilizce iskeleti
prisma/              şema + migration'lar
tests/unit           saf fonksiyon testleri · tests/integration  gerçek Postgres ile API testleri
```
