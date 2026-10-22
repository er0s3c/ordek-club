# Ördek — Ana Geliştirme Planı

> Son güncelleme: 2026-10-22 · Sahibi: Opus 5.5 (teknik lider)

## 1. Repository analizi (özet)

| Alan | Mevcut Ördek Labs (kök dizin) | Ördek Club (`klup-sunucusu/`) |
|---|---|---|
| Amaç | **Kasıtlı zafiyetli** web lab'ı + öğretmen paneli | Kulüp eğitim platformu (güvenli) |
| Framework | Next.js 14.2, JavaScript, App Router | Next.js 15, TypeScript, App Router + özel Node sunucusu (WebSocket için) |
| Veritabanı | SQLite (Prisma, kasıtlı zafiyetli tablolar) + JSON dosyaları (`data/`) | PostgreSQL 16 (Prisma 6, migration'lı) |
| Kimlik | scrypt + HMAC imzalı çerez (`lib/session.js`) | scrypt + DB-tabanlı opak oturum token'ı (hash'li saklanır) |
| Docker | Panel `docker.sock` ile hedef konteyner başlatır | Sadece `app` + `db` (+ opsiyonel `caddy`). **docker.sock YOK.** |
| Tasarım | `lib/ui-css.js` token'ları (kömür + fosfor yeşili, IBM Plex / JetBrains Mono) | Aynı kimlikten türetilmiş, yeniden yazılmış token seti (`src/styles/`) |
| Test | Elle yazılmış node script'leri | Vitest (unit + Postgres entegrasyon) + HTTP smoke testi |

Kök uygulamanın kasıtlı zafiyetleri (ör. `node-serialize`, `middleware.js` içindeki yalnız-middleware
yetkilendirmesi, geniş `images.remotePatterns`) **eğitim içeriğidir**; Club kodu bunların hiçbirini
kopyalamaz ve kök koduna import ile bağlanmaz.

## 2. İzolasyon kararları

1. `klup-sunucusu/` kendi `package.json`, `node_modules`, `prisma/`, `compose.yaml`, `.env` dosyalarına sahiptir.
2. Kök `.dockerignore` → `klup-sunucusu` hariç tutulur (lab imajına club kodu girmez).
3. Kök `next build` club kodunu görmez (kök `app/` dışında). Kök CI'ya dokunulmaz; club için ayrı workflow.
4. Club compose projesi adı `ordek-club`, ağı `ordek_club_net`. Lab ağlarına (`ordek_internal`, `ordek_vpn`) bağlanmaz.
5. Club içinde lab başlatma, flag doğrulama, VMware yönetimi, exploit çalıştırma **yoktur** (bkz. `SECURITY_BOUNDARIES.md`).

## 3. Club mimarisi

```
tarayıcı ──HTTPS──> caddy (opsiyonel, otomatik TLS)
                     └─> app (Node 22, tek süreç)
                           ├─ Next.js (sayfalar + /api route handler'ları)
                           └─ ws sunucusu (/ws, Faz 2) ── aynı port, aynı oturum doğrulaması
                         └─> db (PostgreSQL 16, volume: club_pg)
                         storage volume: /app/storage (logo, dosyalar, yedekler)
```

- Tek süreç, tek sunucu (8 GB VPS hedefi). Redis yok; rate-limit ve canlı oturum durumu bellekte +
  kalıcı olması gerekenler Postgres'te. Yatay ölçek gerekirse Redis adapter eklenir (not edildi).
- Yetkilendirme **her route handler ve server component'te** `requireUser()` / `requireRole()` ile yapılır;
  middleware yalnızca güvenlik başlıkları (CSP nonce) ve Origin (CSRF) kontrolü yapar.
- Tüm girdiler zod ile doğrulanır. Tüm DB erişimi Prisma (parametreli) üzerinden.

## 4. Fazlar

| Faz | İçerik | Durum |
|---|---|---|
| 1 | Kurulum, Compose, Postgres, auth, roller, kurulum sihirbazı, admin iskeleti, üyelik | ✅ Tamamlandı |
| 2 | Sunum veri modeli, oynatıcı, animasyon motoru, canlı oturum, WS senkronizasyonu, eğitmen paneli | ✅ Tamamlandı (canlı quiz/anket Faz 5'e bırakıldı) |
| 3 | Club Academy: öğrenme yolları, dersler, quiz, öğrenci dashboard, ilerleme | ✅ Çalışıyor (içerik içe aktarıcı, ders/quiz sayfaları, ilerleme) |
| 4 | XP transaction, seviyeler, rozetler, aylık/genel liderlik | Bekliyor |
| 5 | Görev atama/teslim, dosya paylaşımı, canlı quiz/anket, duyurular, VMware molası | Bekliyor |
| 6 | Club Studio editörü, şablonlar, analitik, sertleştirme, E2E, dokümantasyon | Bekliyor |

Görev ayrıntıları: `OPUS_55_TASKS.md`. Lab doğrulama görevleri: `OPUS_48_TASKS.md`.

## 5. Branch stratejisi

- `feature/club-platform` — Faz 1 (bu branch)
- `feature/club-realtime` — Faz 2
- `feature/club-gamification` — Faz 4
- `fix/security-hardening` — güvenlik düzeltmeleri
- `lab/authorized-validation` — yalnız Opus 4.8 lab doğrulama görevleri; inceleme + test olmadan `main`'e girmez

Club sunucusunun çalışması hiçbir `lab/*` görevine bağlı değildir.
