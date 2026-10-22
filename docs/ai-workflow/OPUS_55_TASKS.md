# Opus 5.5 Görevleri — Club Platform + Savunma

Durum değerleri: `DONE` · `IN_PROGRESS` · `DONE` · `BLOCKED`
Tüm görevler için ortak yasaklar: kök Ördek Labs koduna davranış değişikliği yapmamak; club'a saldırı lab'ı,
flag sistemi, docker.sock, VMware otomasyonu eklememek; çalışmayan buton/sahte veri bırakmamak.

Test komutları (aksi belirtilmedikçe `klup-sunucusu/` içinde):

```bash
npm run typecheck && npm run lint && npm test          # unit + entegrasyon (Postgres gerekli)
npm run build                                           # üretim derlemesi
node scripts/smoke.mjs http://localhost:3100            # canlı sunucuya HTTP smoke testi
```

---

## Faz 1 — Çalışan temel

### C1-01 · Repository analizi ve izolasyon
- **Model:** Opus 5.5 · **Durum:** DONE
- **Amaç:** Mevcut yığını analiz etmek, club'ın bağımsız yerleşimini belirlemek.
- **Dosyalar:** `docs/ai-workflow/*`, kök `.dockerignore`
- **İzin verilen:** dokümantasyon; kök `.dockerignore`'a `klup-sunucusu` eklemek.
- **Yapılmaması gereken:** kök uygulama kodunu değiştirmek.
- **Kabul:** MASTER_PLAN'da analiz + izolasyon kararları; lab imajı club dosyalarını içermez.
- **Test:** `git diff --stat main -- app lib docker internal proxy` boş olmalı.

### C1-02 · Proje iskeleti
- **Model:** Opus 5.5 · **Durum:** DONE
- **Amaç:** Next.js 15 + TS + Prisma + özel Node sunucusu iskeleti.
- **Dosyalar:** `klup-sunucusu/{package.json,tsconfig.json,next.config.ts,server.ts,src/**}`
- **İzin verilen:** yeni bağımlılıklar (yalnızca `klup-sunucusu/package.json`).
- **Yapılmaması gereken:** kök `package.json`'a bağımlılık eklemek.
- **Kabul:** `npm run build` ve `npm run typecheck` başarılı.
- **Test:** `npm run typecheck && npm run build`

### C1-03 · Veritabanı ve migration
- **Model:** Opus 5.5 · **Durum:** DONE
- **Amaç:** Faz 1 şeması (User, Session, ClubSettings, Invitation, AuditLog, SetupToken) + ilk migration; otomatik `migrate deploy`.
- **Dosyalar:** `prisma/schema.prisma`, `prisma/migrations/**`, `docker/entrypoint.sh`
- **İzin verilen:** yeni migration eklemek. **Yapılmaması gereken:** uygulanmış migration'ı düzenlemek.
- **Kabul:** boş DB'ye `prisma migrate deploy` hatasız; konteyner başlarken migration otomatik.
- **Test:** `npx prisma migrate deploy && npx prisma migrate status`

### C1-04 · Kimlik doğrulama ve oturum güvenliği
- **Model:** Opus 5.5 · **Durum:** DONE
- **Amaç:** Kayıt, giriş, çıkış, parola değiştirme; scrypt; DB-tabanlı oturum; rate limit; CSRF Origin kontrolü.
- **Dosyalar:** `src/server/auth/**`, `src/app/api/auth/**`, `src/middleware.ts`
- **Yapılmaması gereken:** JWT'yi localStorage'da tutmak; parolayı loglamak; kullanıcı adının var olup olmadığını sızdırmak.
- **Kabul:** yanlış parola ve olmayan kullanıcıda aynı yanıt; çerez HttpOnly; parola değişince diğer oturumlar düşer; 10 hatalı denemeden sonra 429.
- **Test:** `npm test -- auth`

### C1-05 · Roller ve yetkilendirme (RBAC)
- **Model:** Opus 5.5 · **Durum:** DONE
- **Amaç:** OWNER/ADMIN/INSTRUCTOR/STUDENT; sunucu tarafı politika fonksiyonları; rol yükseltme kuralları.
- **Dosyalar:** `src/server/auth/policy.ts`, `src/server/auth/guard.ts`
- **Kabul:** ADMIN, OWNER'ı değiştiremez ve kimseyi ADMIN/OWNER yapamaz; kimse kendi rolünü değiştiremez; tüm admin API'leri 403 döner (öğrenci ile).
- **Test:** `npm test -- policy rbac`

### C1-06 · İlk kurulum sihirbazı (güvenli bootstrap)
- **Model:** Opus 5.5 · **Durum:** DONE
- **Amaç:** Kurulum tamamlanana kadar tek seferlik kurulum anahtarı (loglara + `storage/setup-token.txt`) ile OWNER oluşturma; kulüp bilgileri, logo, URL.
- **Dosyalar:** `src/app/(auth)/setup/**`, `src/app/api/setup/**`, `src/server/setup.ts`
- **Yapılmaması gereken:** varsayılan admin parolası; anahtarsız kurulum.
- **Kabul:** anahtarsız/yanlış anahtarla 403; kurulum sonrası `/setup` kapalı; kurulum bitmeden `/admin` → `/setup`.
- **Test:** `npm test -- setup`

### C1-07 · Üyelik: davet kodu + başvuru + admin onayı
- **Model:** Opus 5.5 · **Durum:** DONE
- **Amaç:** Kayıt politikası (OPEN / APPROVAL / INVITE_ONLY), davet kodları (son kullanma, kullanım limiti, rol, otomatik onay).
- **Kabul:** INVITE_ONLY'de kodsuz kayıt reddedilir; APPROVAL'da kullanıcı PENDING kalır ve panele giremez; onay sonrası girer.
- **Test:** `npm test -- membership`

### C1-08 · Admin paneli iskeleti
- **Model:** Opus 5.5 · **Durum:** DONE
- **Amaç:** `/admin` dashboard (gerçek sayılar), üyeler (arama/filtre/onay/red/rol/devre dışı), davetler, ayarlar, audit log, sistem sağlığı.
- **Yapılmaması gereken:** henüz olmayan özellikler için tıklanabilir ama işlevsiz menü.
- **Kabul:** her ekran gerçek API'ye bağlı; her admin mutasyonu AuditLog'a yazılır.
- **Test:** `npm test -- admin` + smoke testi

### C1-09 · Docker Compose, kurulum ve yedekleme komutları
- **Model:** Opus 5.5 · **Durum:** DONE
- **Amaç:** `install.sh` (secret üretimi), `compose.yaml` (app+db, opsiyonel caddy), `scripts/club.sh` (update/backup/restore/logs/setup-token/status), healthcheck.
- **Yapılmaması gereken:** docker.sock bağlamak; root kullanıcıyla çalıştırmak; sabit parola.
- **Kabul:** temiz makinede `./install.sh` → sağlıklı servis + kurulum anahtarı; yeniden başlatmada veri korunur.
- **Test:** `docker compose up -d --build && curl -fsS localhost:3100/api/health`

---

## Faz 2–6 (özet — ayrıntılar faz başlarken genişletilecek)

| ID | Görev | Branch | Durum |
|---|---|---|---|
| C2-01 | Sunum JSON şeması (zod) + Presentation/Slide/PresentationVersion modelleri | feature/club-realtime | DONE |
| C2-02 | Sunum oynatıcı + adım adım animasyon motoru (SVG + Web Animations API, reduced-motion) | feature/club-realtime | DONE |
| C2-03 | 15 hazır siber güvenlik animasyonu (HTTP, DNS, TCP, TLS, SQLi, XSS, phishing…) | feature/club-realtime | DONE |
| C2-04 | LiveSession + WS: oturum kodu/QR, sürüm numaralı durum, yeniden senkronizasyon, WS auth + rate limit | feature/club-realtime | DONE |
| C2-05 | Eğitmen paneli: canlı kontrol, notlar, katılımcılar, el kaldırma, soru, duyuru | feature/club-realtime | DONE |
| C3-01 | LearningPath/Module/Lesson/LessonProgress + 10 başlangıç yolu (seed) | feature/club-academy | TODO |
| C3-02 | Quiz/Question/QuizAttempt (çoktan seçmeli, D/Y, kısa cevap, eşleştirme, senaryo) | feature/club-academy | TODO |
| C3-03 | Öğrenci dashboard (devam eden, önerilen, görevler, sıralama, duyurular) | feature/club-academy | TODO |
| C4-01 | XPTransaction (idempotency anahtarı, unique), XPRewardRule, Level eşikleri | feature/club-gamification | TODO |
| C4-02 | Badge/UserBadge + otomatik rozet kuralları | feature/club-gamification | TODO |
| C4-03 | Aylık (TZ ayarlı, arşivli) + genel liderlik; admin düzeltme + şüpheli kayıtlar | feature/club-gamification | TODO |
| C5-01 | Assignment/Target/Submission + rubrik + onay sonrası XP | feature/club-classroom | TODO |
| C5-02 | FileAsset/FilePermission: güvenli yükleme/indirme, kota | feature/club-classroom | TODO |
| C5-03 | Canlı quiz/anket, duyurular, Notification | feature/club-classroom | TODO |
| C5-04 | VMware uygulama molası slaytı (öğrenci/eğitmen görünümü, teslim) | feature/club-classroom | TODO |
| C6-01 | Club Studio blok editörü (otomatik kayıt, sürüm, içe/dışa aktarma, şablonlar) | feature/club-studio | TODO |
| C6-02 | Analitik ekranları | feature/club-studio | TODO |
| C6-03 | Uçtan uca 13 adımlı akış testi (Playwright) | feature/club-studio | TODO |
| S-01 | Dependency audit + secret scanning + static analysis CI (club workflow) | fix/security-hardening | TODO |
| S-02 | WebSocket yetkisiz olay regresyon testleri | feature/club-realtime | DONE |
