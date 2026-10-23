# 01 — Ajan bulguları (Tur 1: bağımsız görüş)

> **Not:** Ajanlar bu oturumda Claude Code alt ajanı olarak, her biri kendi `.claude/agents/<ad>.md` tanımını sistem rolü olarak okuyarak AYRI ayrı çalıştırıldı (yeni eklenen ajan tipleri oturum yeniden başlamadan yerel tip olarak yüklenemediği için). Agent Teams kullanılmadı; tartışma, ana ajanın ayrı raporları birbirine iletmesiyle yürütüldü — "simüle edilmiş toplantı" değil, ayrı raporlardan sentez.
>
> **Tur 1'de çalışan ajanlar:** tryhackme-ux, htb-academy-ux, elite-ui-director, student-zero-knowledge, student-curious-beginner, student-bored-skeptic, underground-storyteller, learning-scientist, gamification-economy, interactive-mission, club-live-experience, motion-visual, accessibility-simplicity, student-ux-research, product-admin, technical-architect.

Hazırlayan: tasarım konseyi belge yazıcısı, 2026-10-23. Girdi: 16 ajanın Tur 1 raporları, `00-current-state.md`, `MASTER_PROMPT.md`. Marka referansı: CIU tasarım sistemi (`docs/TASARIM-SISTEMI.md`).

## 0. Bu belge nasıl okunmalı

- **Katılım:** 16 ajanın **16'sı** Tur 1'de çalıştı ve rapor verdi. Çalıştırılmayan rol yok.
- **Bağımsızlık:** Tur 1'de hiçbir ajan diğerlerinin raporunu görmedi. Bu yüzden "İtiraz" başlıkları altındaki maddeler, ajanların **diğer rollerden beklediği** görüşlere karşı yazılmış öngörüsel itirazlardır; gerçekleşmiş bir tartışma değildir. Asıl çelişkiler `02-debate-log.md`'de ele alınır.
- **Kanıt düzeyi:** Ajanlar farklı etiketler kullandı ([KANIT]/[KOD]/[K], [VARSAYIM]/[V], [SİM], [HESAP], [Araştırma-güçlü/orta], [Hipotez]). Bu belgede etiketler korunmuştur. **Hiçbir ajan gerçek öğrenci verisi kullanmadı; hiçbir kabul testi henüz yapılmadı.** Uygulama tarayıcıda çalıştırılmadı; bulgular kod ve içerik okumasına dayanır.
- **Marka:** Tüm öneriler CIU tasarım sistemi içindedir (mor `#5C1FE2`, neon yeşil `#17FF74` yalnız eylem, krem `#FFFCF2`, Lexend Tera + Readex Pro, hap düğme, 20px kart, galaxy degradesi). Yeni renk veya font öneren ajan yok.

## 1. Katılım ve özet tablosu

| # | Ajan | Çalıştı | Ana P0 risk (tek cümle) | Öne çıkan öneri |
|---|---|---|---|---|
| 01 | tryhackme-ux | Evet | İlk 60 sn'de tek karar verilmiyor; "ders kitabı" algısı | Tek görev kartlı ilk oturum; `continueTarget` PROGRAM'ı atlasın |
| 02 | htb-academy-ux | Evet | "Tamamlandı" ve XP öğrenmeyi ölçmüyor | Kontrol noktası bileşeni; türe göre ders düzeni (A/B/C/D) |
| 03 | elite-ui-director | Evet | 0 bilgili öğrenci birincil eylemi ilk 60 sn'de bulamıyor | Üç kademeli yazı sistemi; tek gece yüzeyi; "Sıradaki adım" kartı |
| 04 | student-zero-knowledge | Evet | "Başla" → 30 haftalık program metni → çıkış | "İlk 5 dakika" modu; satır içi sözlük; takma ad |
| 05 | student-curious-beginner | Evet | İlk 60 sn'de hiçbir şey çözmeden, geri bildirim almadan çıkış | Yap-önce mini görev; VM yerine tarayıcı simülasyonu |
| 06 | student-bored-skeptic | Evet | İlk 90 sn'de küçük başarı yok (kayıt→onay→boş panel→bilgi sayfası) | Tek kartlık "ilk dosya" ekranı; hesapsız deneme |
| 07 | underground-storyteller | Evet | Hikâye öğrenmenin yerini alır | "Nöbetçi" anlatıcı; ders = sahne + seçim; 12 ders kancası |
| 08 | learning-scientist | Evet | XP ve "ilerleme" öğrenme olmadan veriliyor; analitik yanıltıcı | `:::kontrol` bloğu; quiz'i ölçme aracına çevirmek; 12 bölümlük yol |
| 09 | gamification-economy | Evet | Okuma-XP ekonomisi düzeltilmeden lig/takma ad eklemek | Öğrenmeye bağlı XP tablosu; Yeni Kadro ligi; Sakin Seri |
| 10 | interactive-mission | Evet | "Gönderen ▾" keşfedilmezse görev tahmine döner; sahte giriş ekranında gerçek parola kutusu | `MissionRunner` + `::gorev`; Sahte Burs durum makinesi |
| 11 | club-live-experience | Evet | Öğrenci "Canlı" görürken eski slaytta donuyor | `epoch` + yaşam döngüsü fazları; projeksiyon katıl rozeti |
| 12 | motion-visual | Evet | Görsel hattı bitmeden yayın: boş kutular, markayla uyuşmayan sahneler | Ders başına en fazla 1 görsel; "Mor Mürekkep" AI stili |
| 13 | accessibility-simplicity | Evet | Koyu sahnede odak görünmüyor, slayt/quiz değişimi duyulmuyor | Kapsam bazlı odak/kontrast token'ları; erişilebilir quiz sonucu |
| 14 | student-ux-research | Evet | İlk 60 sn'de tek net eylem bulunamıyor | İlk-5-dakika ana sayfası; onay bekleme odası; test protokolü |
| 15 | product-admin | Evet | Kişisel veri yaşam döngüsü eksik; yanlış kitleye yayın | "Hızlı Etkinlik" sihirbazı; "Veri ve Gizlilik" merkezi |
| 16 | technical-architect | Evet | Görev ilerlemesi/XP yanlış kaynağa bağlanırsa hile veya kilitlenme | `MissionAttempt` kaydı; en az değişiklikli dikey dilim planı |

## 2. Ajanlar arası ortak bulgular (kaynaklı)

Aşağıdaki tablo yalnızca raporlarda açıkça geçen bulguları sayar; "ajan" sütunu bulguyu kendi raporunda dile getiren ajanlardır.

| Ortak bulgu | Dile getiren ajanlar | Kanıt |
|---|---|---|
| `continueTarget` yeni öğrenciyi önce PROGRAM yoluna (9 bilgi sayfası, "Ördek Akademi nedir?") gönderiyor; ilk uygulama ~14. sayfa | tryhackme-ux, student-zero-knowledge, student-bored-skeptic, technical-architect | `service.ts:185-199`, `akademi.yaml:8` (04 ve 06 bunu çalıştırmadan, sıradan çıkarım olarak etiketledi) |
| Dashboard'da birincil eylem (Akademi "Başla/Devam") boş Görevler/Duyurular kartlarının altında kalıyor | tryhackme-ux, elite-ui-director, student-zero-knowledge, student-curious-beginner, student-bored-skeptic, student-ux-research | `dashboard/page.tsx` kart sırası |
| `m01-05` "bu sayfanın altındaki alana yaz" diyor ama alan yok; çözüm `<details>` içinde açık; "Okudum, tamamla" 15 sn sonra XP veriyor | tryhackme-ux, htb-academy-ux, student-bored-skeptic, underground-storyteller, learning-scientist, interactive-mission, technical-architect, gamification-economy (XP tarafı) | `lesson/[slug]/page.tsx`, `LessonActions.tsx`, `MIN_READ_MS = 15_000` |
| Quiz geri bildirimi geç ve toplu; "Tekrar dene" tüm cevapları sıfırlıyor; açıklama doğru cevabı ele veriyor | student-bored-skeptic, learning-scientist, interactive-mission, accessibility-simplicity | `QuizForm`, `gradeQuiz` |
| Jargon (OSINT, CTF, SOC, CTI, M01, Yol A) açıklamasız; sözlük yok | tryhackme-ux, htb-academy-ux, student-zero-knowledge, student-curious-beginner, student-bored-skeptic, accessibility-simplicity | `00-current-state` gözlem 3, içerik dosyaları |
| Marka/ad karışıklığı ("Ördek Akademi", "Club Academy · Gölge Ağ", "Kalkan dosyan", "Kod adın: Tilki") | tryhackme-ux, student-zero-knowledge, student-bored-skeptic, elite-ui-director, student-ux-research | içerik ve dashboard metinleri |
| Sıfır XP'li yeni üyeye "genel sıra / seri 0 gün" gösterilmesi; tek lig, takma ad/opt-out yok | elite-ui-director, student-zero-knowledge, student-curious-beginner, student-bored-skeptic, gamification-economy, student-ux-research | `overallBoard`, `monthlyBoard`, dashboard XP kartı |
| Global `h1–h6` kuralı (Lexend Tera, büyük harf, -0.12em) uzun başlık ve soru metinlerinde okunabilirliği düşürüyor | elite-ui-director, accessibility-simplicity, student-zero-knowledge, student-ux-research | `globals.css:162`, `presentation.css:149` |
| Eski token adları yanlış renklere bağlı (`--gold` mor, `--color-arterial-red` mor/yeşil, `.dot-red` yeşil) | elite-ui-director, motion-visual, club-live-experience | `globals.css:64`, `globals.css:132`, `presentation.css` |
| Canlı ders bitişinde bireysel moda köprü yok; kopma perdesi slaytı kapatıyor | club-live-experience, student-ux-research, technical-architect, student-bored-skeptic | `LiveViewer.tsx:68-79`, `live-protocol.ts:102` |
| Temel kısımda VM/WSL/Ubuntu gereksinimi; tarayıcı içi terminal yok | student-curious-beginner, learning-scientist, technical-architect (gerçek terminale karşı) | `01-temel` içinde 7 dosyada 16 VM/WSL geçişi |
| Hikâye "DOSYA" kutusu ders fikrinden ve ilk etkileşimden önce geliyor | student-zero-knowledge, student-curious-beginner, student-bored-skeptic, underground-storyteller (kendi alanı), motion-visual | `m01-01-neden-onemli.md` |

**Korunması üzerinde ortaklık olanlar:** CIU marka sistemi (mor/neon yeşil/krem, Lexend Tera + Readex Pro, hap düğme, 20px kart); Gölge Ağ kötü adamları ve "DOSYA KAPANDI" damgası (ikinci plana alınarak); idempotent XP defteri ve sunucu tarafı puanlama; sunucu otoriteli, sürümlü canlı hub; kısa ders sayfaları ve "Akılda kalsın" kapanışı; `FlowAnimationView` reduced-motion/`aria-live` mimarisi.

---

## 3. Ajan başına bulgular

### 01 · tryhackme-ux

**Okunan dosyalar:** `dashboard/page.tsx`, `server/academy/service.ts`, `academy/page.tsx`, `academy/lesson/[slug]/page.tsx`, `(member)/layout.tsx`, `AppShell.tsx`, `akademi.yaml`, `00-program/01-akademi-nedir.md`, `m01/05-uygulama-sahte-burs.md`.

**Kusurlar**

| # | Kusur | Kanıt | Etki |
|---|---|---|---|
| B1 | "Başla" göreve değil broşüre götürüyor | `continueTarget()` (`service.ts:185`) türe bakmıyor; ilk yol `program`. Açılan sayfa 273 kelime + 30 haftalık tablo. İlk uygulama (`m01-05`) doğrusal sırada 14. sayfa | İlk dakikada küçük başarı yok; "ders kitabı" izlenimi |
| B2 | Akademi kartı ana sayfada üçüncü sırada | Sıra: galaxy bandı (düğmesiz) → "Şu an canlı" → Görevler + Duyurular → Akademi. İlk iki kart yeni üyede boş. Sondaki paragrafta 4 link | Ekranın en değerli yeri iki boş mesaja gidiyor (1366×768 ve telefonda ekran altı kalması varsayım, ölçülmedi) |
| B3 | "Uygulama" sayfası uygulatmıyor | QUIZ dışındaki her tür yalnız `CompleteButton` alıyor; `m01-05`'te yazma alanı yok, kontrol listesi `<details>` içinde açık | XP öğrenmeyi değil tıklamayı ödüllendiriyor |
| B4 (ek) | Ürünün adı ve dili dağınık | "Ördek Akademi", "Club Academy · Gölge Ağ", "Kalkan dosyan", "Kod adın: Tilki", "M01", "Yol A"; açıklama/sözlük yok | Sıfır bilgili öğrenci kodları ve OSINT'i anlamıyor |

**Fikirler**
1. **İlk oturumda tek kart** (`completed === 0` iken): "MERHABA, EREN / İlk görevin hazır. 5 dakika sürer." + krem kart "GÖREV 1 · KOLAY · ~5 DK · +60 XP — Şüpheli Mesaj: Sahte Kampüs Bursu" + tek yeşil hap **İlk görevi aç →**; program yolu "Akademi nasıl işler?" üçüncül linkine dönüşür. Kodda: `continueTarget` PROGRAM türünü atlasın (küçük değişiklik).
2. **Adım kartlı ders:** Markdown `##` başlıklarından adımlara bölünür, üstte "Adım 2/5" rayı (§5A, 12px galaxy), her adım **Devam** ile biter. Yanlışta 300ms sallanma (reduced-motion'da yok) + "Mantıklı bir tahmin. Ama gönderen adresine bir daha bak." + **İpucu al** ("İpucu almak puanını düşürmez."). "Tamamla" yalnız son karardan sonra açılır.
3. **Jargon kartta açıklansın:** sade ad büyük ("İnternette iz sürmek"), kod küçük gri; dokununca tek satır "OSINT: herkese açık bilgiyle, izinli araştırma." Sezon 2 ilk 3 ders bitene kadar katlı; 19 kart birden görünmesin.

**Ek çıktılar**
- *5 ekranlık öğrenci navigasyonu:* **Bugün** (`/dashboard`), **Öğren** (`/academy`), **Canlı** (`/live`, açık oturumda kırmızı nokta), **Görevler** (`/tasks`; Görevler · Dosyalar · Sınıflar sekmeleri, "Sınıf ▾" kalkar), **Ben** (`/u/[ad]`). Zil ikon olarak kalır; eğitmen/yönetim yalnız o rollerde. Mobilde alt çubuk (dokunma alanı ≥48px varsayımı doğrulanmalı).
- *Onboarding metinleri:* (1) "Burada kimse 'bunu bilmen gerekirdi' demez. İlk görev 5 dakika: bir mesaj geldi, sen karar ver." (2) İlk başarı: "İlk ipucunu kendin buldun. +60 XP…" / **Sıradaki (4 dk)** · **Bugünlük yeter**. (3) Canlı bitiş: "Ders bitti, merak bitmedi…" / **Uygulamaya geç**.
- *İlk görev 2 tıklamada mı?* Kâğıt üzerinde evet, işlevsel olarak **hayır**: gerçek ilk uygulamaya en kısa yol 3 tık (Akademi → M01 → 5. ders). Ö1 ile 1 tıka iner.

**P0 risk:** Öğrenci ilk 60 sn'de tek karar vermiyor; program sayfalarını okuyup çıkıyor (MASTER_PROMPT ikinci kalite kapısı ihlali).
**Kabul testi:** Playwright — yeni hesapta `/dashboard`'daki tek `.btn-primary` `p-01`'e değil `/academy/lesson/m01-…` uygulamasına gitmeli; ilk etkileşim ≤1 tıkta görünmeli; "Tamamla" karar öncesi devre dışı. İnsanla (gelecekte): 5 öğrenci, "ilk görevini bul" — ilk karar ≤60 sn, ≤2 tık, 5 sn sonra "Bu site ne için?" cevabı. Yapılmadı.

**İtirazlar (öngörüsel):** htb-academy-ux'e — koyu lab teması, modül kodu ve zorluk rozeti ilk ekranda varsayılan olmasın (ilk 3 dersten sonra/isteğe bağlı). Çocukça tasarıma (maskot, sürekli konfeti, "Süpersin!") karşı; Gölge Ağ portreleri ve damga korunmalı. underground-storyteller'a — hikâye görevin içinde başlasın, ayrı giriş sayfası olmasın.

**Karar**

| Öğe | Karar | Öncelik |
|---|---|---|
| `continueTarget` PROGRAM'ı sıraya katıyor | Değiştir: atla | **P0** |
| İlk oturum ana sayfası | Değiştir: tek görev kartı | **P0** |
| Uygulama sayfasında girişsiz "Tamamla" | Değiştir: karar olmadan XP yok | **P0** |
| Uzun Markdown ders | Değiştir: adım kartları | P1 |
| Üst menü (7+ öğe) | Değiştir: 5 ekran | P1 |
| Kod adları/jargon | Değiştir: sade ad + açıklama | P1 |
| Sezon 2'nin hemen görünmesi | Değiştir: katla | P2 |
| Gölge Ağ, damga, CIU marka dili | Koru | — |
| "Üyelik" kartı ve 4 linkli paragraf | Çıkar: Ben ekranına taşı | P2 |

---

### 02 · htb-academy-ux

**Okunan dosyalar:** `lesson/[slug]/page.tsx`, `LessonActions.tsx`, `service.ts`, `akademi.yaml`, `m01/02-hacker-kimdir.md`, `m01/05-uygulama-sahte-burs.md`.

**Kusurlar**
1. **K1 — Uygulama sayfası vaadi karşılanmıyor.** `m01-05` "Teslim" bölümü alan vaat ediyor; PRACTICE yalnız `CompleteButton` gösteriyor; cevaplar `<details>` içinde. 40 XP yalnız `MIN_READ_MS` beklenerek alınıyor; talimat–arayüz çelişkisi güveni kırıyor.
2. **K2 — Beceri haritası yok, yalnız içerik listesi var.** `akademi.yaml`'da ön koşul, zorluk, "bitirince ne yapabileceksin" alanı yok; yol sayfası numaralı liste + rozet + dakika. M07 Python, M09 OSINT'ten önce; M05 özeti dört konuyu tek cümleye sıkıştırıyor. [Varsayım] "Neden bu sıra / ben neredeyim" ekranda cevapsız.
3. **K3 — Ders içinde kontrol noktası yok.** Ders = tek Markdown + sonda quiz/tamamla; "🧪 Dene" cevabı `<details>`'ta, giriş/geri bildirim yok; §5A görev akordeonu uygulanmamış; bölüm bazında "kaldığın yer" yok.
- *Ek gözlem:* m01-02'de "15. haftada bir yöne yönelirsin" — bireysel modda "hafta" kavramı yok (metin kanıt, etki varsayım).

**Fikirler**
1. **"Bu modül bitince" kartı + sade beceri haritası.** `akademi.yaml`'a `yapabilir` (3 madde), `onkosul`, `zorluk`. Örnek: "✓ Sahte bir burs mesajını 1 dakikada ayırt edebilirsin · Ön koşul: yok · Zorluk: Kolay · ≈45 dk". Temel kısım 11 düğümlü dikey çizgi, kilitsiz "önerilen sıra" (kilit simgesi caydırır — varsayım). Modül adı: "OSINT — Açık kaynaktan iz sürmek".
2. **Kontrol noktası bileşeni ve kontrol noktasına bağlı tamamlama.** Her H2 sonunda bir soru (`.lab-qa` token'ları, `aria-live`). Örnek: "GÖREV 2 — Adrese bak [■■□] 2/3 · Aynı / Farklı / Emin değilim, başka yoldan kontrol ederim · Kanıt çipleri · [İpucu 1/2] [Kontrol et]". Metinler: boşta "Önce bir tahmin seç. Yanlış olsa da olur."; yanlışta "Yakın. Adrese harf harf bak…"; doğruda "✓ Yakaladın…". Düğme "Okudum, tamamla" yerine "Dersi bitir"; devre dışıyken "1 görev kaldı".
3. **Bölüm adımlayıcı + kalıcı "kaldığın yer".** 12px galaxy ray, `role="progressbar"`, URL `#adim-2`, bölüm durumu sunucuda; canlı bitiş kartı aynı adım kimliğiyle "Bıraktığın yerden devam et" (gözlenen sorun 8'i çözer).

**Ders düzeni alternatifleri**

| Düzen | Tarif | Uygun olduğu yer | Zayıf yanı |
|---|---|---|---|
| A) Görev akordeonu | Breadcrumb, zorluk, "≈6 dk", ray; 56px satırlar, 4px durum şeridi; açık satırda ≤120 kelime + tek soru | Kavram dersleri (M03–M08); artımlı ve ucuz | Mobilde uzar; sinematik değil |
| B) Tek kart adımlayıcı | ≤640px tek kart, nokta adımlayıcı, 20–30 kelime, 2–3 hap seçenek, cevap sonrası "Devam" | M01–M02, ilk kullanım, Sahte Burs | İleri öğrenciye yavaş ("Tümünü tek sayfada göster"); içerik yeniden yazımı pahalı |
| C) İnceleme masası | Solda %40 Brifing (adımlar, ipucu, kanıt sayacı), sağda %60 Masa (sahte gelen kutusu/log/metadata); mobilde sekmeler; bitişte Rapor kartı | m01-05, log okuma, OSINT uygulamaları | Geliştirme maliyeti; 4 masa tipiyle sınırlanmalı |
| D) Okuma + yan not | Mevcut uzun sayfa + yapışkan "Bu sayfada" + bölüm sonu soru | Bilgi sayfaları, Yol A–G derin içerik | — |

**Önerilen eşleme:** bilgi → D · ders → A (Temel'in ilk iki modülünde B) · uygulama → C · quiz → A'nın son görevi. Aynı ekranda iki düzen karışmasın.

**THM yaklaşımı eleştirisi (genel kalıp analizi, marka temsili değil):** cevap kutusu ezber/metinde arama ölçüyor (bizde "neden?" seçimi olmalı); motivasyon sayıya kayıyor (varsayım); VM/VPN bize uygun değil (kampüs ağı, 8 GB VPS) → tarayıcı içi masa; koyu-neon atmosfer IT dışı öğrenciyi dışlayabilir → koyu tema yalnız terminal/masa alanında. Alınacak: görev başına doğrulama + "modül = net beceri çıktısı". Jargon (room, flag, box, pwn) kullanılmasın.

**P0 risk:** "Tamamlandı" ve XP sinyalleri öğrenmeyi ölçmüyor → eğitmen analitiği yanıltıcı, liderlik gerçek ilerlemeyi göstermiyor, "anlamadım ama bitirdim".
**Kabul testi:** (1) E2E: kontrol noktası geçilmeden `POST /api/academy/lessons/:slug/complete` → 400; düğme devre dışı ve "1 görev kaldı". (2) Kalıcılık: yenilemede "Adım 3/5"ten devam; canlı bitişte aynı adıma dönüş. (3) Gelecekte 5–8 gönüllü: görülmemiş yeni mesajda alan adı farkını 60 sn'de kanıtla gösterme. Sonuç yok.

**İtirazlar (öngörüsel):** underground-storyteller — kanca ≤20 sn, DOSYA katlanabilir, ilk kontrol noktasını geciktirmesin. gamification-economy / tryhackme-ux — "Okudum, tamamla" ile XP sürmesin. elite-ui-director — koyu lab teması bütün akademiye yayılmasın.

**Karar**

| Öğe | Karar | Öncelik |
|---|---|---|
| Modül/yol yapısı, §5A token'ları, §5.14 terminal, `MIN_READ_MS` (ikincil koruma) | Koru | — |
| PRACTICE'e teslim alanı/inceleme masası; tamamlama ve XP kontrol noktasına bağlı | Değiştir | **P0** |
| Türe göre düzen, bölüm adımlayıcı, "kaldığın yer" | Değiştir | P1 |
| `yapabilir`/`onkosul`/`zorluk`, beceri haritası, açıklamalı modül adları | Değiştir | P1 |
| Takvim varsayımlı metinler ("15. hafta") | Değiştir | P1 |
| `<details>` içinde hemen açılan cevaplar (önce ipucu 1/2) | Çıkar | P2 |

---

### 03 · elite-ui-director

**Okunan dosyalar:** `styles/globals.css`, `dashboard/page.tsx`, `academy/lesson/[slug]/page.tsx`.

**Kusurlar**
1. **K1 — Başlık sistemi tek sesle konuşuyor.** `globals.css:162` tüm `h1–h6`'yı Lexend Tera, büyük harf, -0.12em yapıyor; kart başlıkları sayfa başlığıyla aynı ağırlıkta. §5A bu yazı tipini içerikte yasaklıyor ama ders Markdown'ı global kurala düşüyor. Uzun Türkçe başlıklar büyük harfli bloklara dönüşüyor (okunabilirlik etkisi varsayım).
2. **K2 — Üç ayrı "karanlık dünya" ve karışık token anlamları.** Canlı sahne gri (`#2E2E2E/#383838`), lab mor-gece (`#15112B`), terminal mavi-gece (`#0F1923`). `--gold` mor, `--color-arterial-red` mor/yeşil, `.dot-red` yeşil eylem rengi; dashboard ikonları `var(--gold)`. Canlıdan derse geçişte "başka ürün" hissi; geliştirici yanlış token seçiyor.
3. **K3 — Dashboard'da öncelik sırası yok.** "Devam et" üçüncü katta; "Kalkan dosyan" açıklanmamış metafor. Birincil eylemin ekran altı kalması ilk 30 sn sürtünmesinin ana adayı (varsayım, 5 sn testiyle doğrulanmalı).

**Fikirler**
1. **Üç kademeli yazı sistemi:** Lexend Tera yalnız `display`, `h1`, sayfa kahramanı, ≤6 kelime; `h2–h4` Readex Pro 500, cümle düzeni; `.eyebrow`/micro etiket büyük harf. Token'lar: `--type-display`, `--type-title`, `--type-section` (Readex 500 · 20/28), `--type-label`.
2. **Tek gece yüzeyi:** `--lab-*` → `--night-0/1/2/line`; sahne, canlı ekran ve lab aynı palet; terminal kendi koyusunda ("makine" belli olsun). Eski adlar uyarı yorumuyla 1 sürüm daha, sonra kaldırılır. Anlam token'ları: `--signal-action` (yeşil), `--signal-brand` (mor), `--signal-live` (macenta nokta), `--signal-warn` (#FFB020).
3. **"Tek kart" ana ekran + mikro etkileşim:** ilk görünen kısımda yalnız **Sıradaki Adım** (başlık, ≈5 dk, +XP, tek yeşil düğme); canlı ders varsa macenta "CANLI" ile onun yerini alır; geri kalanı "Kulüpte bu hafta". Doğru cevapta düğme 300ms'de yeşil onaya döner, "+30 XP · Nedenini yakaladın."; XP sayacı 600ms sayar (reduced-motion'da yalnız metin).

**Somut ekran (`/dashboard`, ilk giriş):** eyebrow "CIU CYBER SECURITY CLUB" · h1 "MERHABA, EREN" · kart "Sıradaki adım · ≈5 dk · +60 XP — 'Şüpheli mesaj' — Bir burs e-postası geldi. Herkes tıklıyor. Sen önce bir bak. [● Başla] — Bilgin yoksa sorun değil, buradan başlanır." · ince şerit "Bu ay 0 XP · Yeni Gelenler ligi · sıralamada görünmen kapalı (değiştir)".

**Üç konsept (hepsi CIU token'larıyla; yeni renk/font yok)**

Ortak durum dili: yükleniyor = krem iskelet + 1.2 sn nabız; boş = tek cümle + tek eylem; hata = `--ciu-error` + "Tekrar dene" (derste "Yanıtın kaydedildi, bağlantı dönünce gönderilir"); kopma = üst bant "Yeniden bağlanıyor… sunum 12. slaytta".

| Yüzey | A) Mission Control | B) Cyber Mystery | C) Friendly Academy |
|---|---|---|---|
| İlk giriş | 3 adım: ad, bölüm, "Ne kadar biliyorsun? Hiç/Biraz/Rahatım" → doğrudan 5 dk görev | Gece paletinde tek cümle "Kampüste bir şey dönüyor. İlk dosya masanda." · "Dosyayı aç" · "Atla" her zaman görünür | "Hiç bilmiyorum" öne çıkar; ilk ders "Dijital izin"; 2 ekran |
| Ana ekran | Solda Görev Panosu (Bugün 1 kart, Bu hafta 3 satır, Kulüp), sağda yol halkası + haftalık hedef (3/5); krem zemin | Gece yüzeyinde "Vaka Masası"; açık vaka büyük kart; canlıda macenta şerit; krem açık tema seçeneği | Krem zemin, ortada "Sıradaki adım", altta 12 bölümlük dikey patika |
| Ders kartı | 20px, 4px durum şeridi, "M03 · Hesap koruması", ≈6 dk, +40 XP, zorluk; tek düğme | `--ciu-gradient-card-overlay`, "VAKA 03 — Sızdırılan Şifre", ≈7 dk · +60 XP; kötü adam portresi yalnız burada | Büyük ikon, 4–6 kelime, ≈5 dk; jargon noktalı alt çizgiyle sözlük |
| Ders içi | 12px galaxy ray "Adım 2/6", her ekranda tek fikir + bir etkileşim, sağ altta yeşil "Kontrol et", "İpucu" ikincil | Solda kanıt paneli, sağda "Ne fark ettin?"; damga yalnız bölüm sonunda | Tek kolon ≤75ch, adım başına 1 fikir + 1 soru, nedenli geri bildirim |
| Canlı kulüp | Sahne + "Eğitmen 4/12 · sen senkron", el kaldır, soru; eğitmende katılımcı ızgarası, quiz çubukları, QR | "Brifing odası"; eğitmen işaretlediği alan öğrencide parlar; anket "Ekibin oyu" | Basit sahne, büyük "El kaldır"; bitişte "Kaldığın derse dön" + görev kartı |
| Profil | Yol haritası ızgarası, rozet rafı, "Bu ay 320 XP · Yeni Gelenler ligi" | "Dedektif dosyası", takma ad seçeneği | Haftalık mini başarılar, seri telafisi bilgisi |
| Admin özeti | 4 KPI + eylem listesi | Vaka bazında takılma noktaları (veri gelince) | "Bu hafta kulüp" anlatı kartı + 3 sayı |
| Mikro kopya | "Bugünün tek işi bu. Gerisi bekleyebilir." · "Hedefe 2 adım kaldı. Bir kahve süresi." · "Senkron kaldın…" | "Her şey yerli yerinde. Bir satır hariç." · "Yanlış iz. Ama bir şeyi eledin, bu da iş." · "Dosya kapandı. Bir sonraki masanda." | "Bilmemek başlangıç noktası, eksiklik değil." · "Yanlış oldu, sorun değil. Nedenine bakalım." · "Küçük adım, gerçek beceri: göndereni kontrol ettin." |

**Tavsiye (uzman görüşü, puan değil):** gerekçeli melez — **kabuk A** (navigasyon, dashboard, ilerleme), **ders gövdesi ve tüm kopyalar C**, **B yalnız içerik katmanında** (ders kartı görseli, kanıt paneli, bölüm sonu damgası). Hiçbir ekranda üç stil karışmaz. Gerekçe: anlaşılabilirlik (%35) için tam Mystery kabuğu en riskli; ilgi (%25) için Mystery merakı gerekli. Kanıtlanmadı; Tur 4'te A ve C kabukları 5 sn testiyle karşılaştırılsın.

**P0 risk:** 0 bilgili öğrenci ilk 60 sn'de tek birincil eylemi bulamıyor (K3 kart yarışı + K1 bağıran başlıklar + jargon).
**Kabul testi (5–8 gönüllü, yapılmadı):** 5 sn izlemde ≥4/5 "Başla/Devam"ı gösterir; girişten ilk doğru cevaba medyan <90 sn; Tab'da atlama bağlantısından sonra ilk odak birincil düğme; 360px'te birincil kart ilk görünen kısımda.

**İtirazlar (öngörüsel):** underground-storyteller — DOSYA öğeleri (damga, sansür bandı, daktilo) arayüz kromuna, navigasyona, düğmelere yayılmasın. gamification-economy — ilk ekranda sıra numarası ("#47") gösterilmesin; varsayılan lig + kişisel ilerleme.

**Karar**

| Öğe | Karar | Öncelik |
|---|---|---|
| CIU marka token'ları, hap düğme, 20px kart | Koru | — |
| Global uppercase başlık kuralı | Değiştir (Ö1) | **P0** |
| Dashboard kart sırası | Değiştir (Ö3) | **P0** |
| Uzun tek Markdown ders sayfası | Değiştir: adım kartları | **P0** |
| Üç koyu palet ve eski token adları | Değiştir (Ö2) | P1 |
| "Kalkan dosyan" | Değiştir: "XP ve seviyen" | P1 |

---

### 04 · student-zero-knowledge

**Persona/etiket:** IT dışı, 0 bilgi. [KANIT] repo, [VARSAYIM] çalıştırılmadan çıkarım, [SİM] simüle tepki. Okunan: `dashboard/page.tsx`, `tr.ts`, `academy/service.ts`, `akademi.yaml`, `00-program/01-akademi-nedir.md`, M01 01/05/07.

**Kusurlar**
1. **B1 (P0) — İlk "Başla" işe yarar yere götürmüyor.** [KANIT] `continueTarget` yol sırasına göre, ilk yol Program; [VARSAYIM] "Ördek Akademi nedir?"e gidiyor (çalıştırılmadı). Sayfada "30 haftalık yol", tablo, "OSINT, mini CTF, SOC/DFIR" açıklamasız; kulüp "CIU Cyber Security Club", sayfa "Ördek Akademi". [SİM] "30 hafta" korkutuyor, yapılacak iş yok.
2. **B2 (P0) — Ana sayfa boş kartlar gösteriyor.** [KANIT] Görevler "Bekleyen görevin yok.", Duyurular "Henüz duyuru yok.", XP kartı "Genel sıra: sıralama dışı", "Seri 0 gün"; "Kalkan dosyan" belirsiz; "Üyelik" kartında son giriş tarihi gereksiz.
3. **B3 (P1) — Hikâye önce, etkileşim çok uzakta.** [KANIT] M01-01'de "Selim Hoca" tanıtılmadan geçiyor; "DOSYA · Bölüm 1" ders fikrinden önce; "Gölge Ağ hikâyesi →" dersten çıkarıyor; ilk "Dene" geri bildirimsiz; gerçek uygulama 5. sayfada 150 kelimelik serbest yazı; ilk quiz 7. sayfada ve "Purple Team", "pasif ayak izi" gibi derste açıklanmamış terimler.
4. **B4 (P1, ek) — "Rezil olur muyum?" korkusu.** [KANIT] Kayıt öğrenci no + bölüm istiyor; kullanıcı adı "liderlik tablosunda görünür"; parola ≥10; onay modunda "Başvurun alındı" ve ders erişimi onaya bağlı. [SİM] Onay beklerken platform denenemiyor.

**Fikirler**
1. **"İlk 5 dakika" modu (P0):** sıfır derste ana sayfa tek karta iner; tek yeşil düğme doğrudan "Sahte Kampüs Bursu" mini görevine; diğer kartlar ilk görev bitene kadar tek satır bağlantı; `continueTarget` program yolunu atlar.
2. **Satır içi sözlük + "yanlış cevap güvenli" sözü (P1):** jargon ilk geçtiği yerde noktalı alt çizgi, tıklayınca 1 cümle. Quiz başında: "Burada yanlış yapmak serbest. Sıralamayı etkilemez, kimse görmez."
3. **Başlangıç gizliliği (P1):** kayıtta varsayılan açık takma ad, öğrenci numarası hiç görünmesin; öğrenci no isteğe bağlı ya da yalnız yönetici doğrulaması için.

**Somut ekran:** "Merhaba, Ayşe. Teknik bilgi gerekmiyor. Önce 5 dakikalık küçük bir görev. [Sahte bir burs mesajını incele — 5 dk] · Ne öğreneceksin: bir mesajın gerçek mi sahte mi olduğunu anlamak. · Ne kazanacaksın: +60 XP ve ilk rozetin. Yanlış cevap serbest. · Daha sonra: Akademi'nin tamamı · Kulüp duyuruları". Görev içi: "Adım 1 / 3 · Gönderen adresine bak"; yanlışta "Çoğu insan buraya tıklar. İpucu ister misin? [İpucu al]"; bitişte "Bir sahtekârı yakaladın. +60 XP. Sıradaki: bağlantısı bile olmayan bir mesaj."

**İlk 60 saniye [SİM — gerçek veri değil]** (işletme 2. sınıf): 0–8 sn boş kartlar ve "Kalkan dosyan"a takılma → 8–20 sn "sıralama dışı" başarısızlık hissi → 20–35 sn "Başla" → "Ördek mi? Ben CIU'ya gelmiştim… 30 hafta… OSINT, CTF, SOC" → 35–50 sn "Hiçbir şey yapmadım, sadece okudum" → 50–60 sn sekmeyi kapatma.

**10 kritik terim (sade karşılık):** oltalama (yemle kandırma), sosyal mühendislik (insanı kandırma, "acil, hemen tıkla"), alan adı (sitenin adresi; benzer ama farklı adres sahte olabilir), IP adresi (cihazın numarası), zafiyet (açık kapı/zayıf yer), OSINT (herkese açık kaynaktan bilgi; gizli sızma yok), CTF (kurallı bilmece yarışı, "bayrak"), SOC (alarmları 7/24 izleyen ekip), terminal (bilgisayarla yazıyla konuşmak; ilk derslerde şart değil — varsayım), sanal makine (bilgisayar içinde kapalı sahte bilgisayar).

**P0 risk:** "Başla" → 30 haftalık program metni → hiçbir şey yapmadan çıkış (koddan türeyen tahmin).
**Kabul testi (gelecekte, sonuç yok):** 5–8 siber güvenlik bilmeyen öğrenci, "giriş yaptıktan sonra ne yapacağını söyle ve yap": 10 sn'de birincil düğme, 90 sn'de ilk mini etkileşim, 5 dk'da "ne kazanacağım" sorusuna tek cümle. Çoğunluk yardımsız geçemezse ekran bitmiş sayılmaz.

**İtirazlar (öngörüsel):** underground-storyteller — DOSYA derse girişin önüne konmasın; hikâye ödül olarak açılsın. elite-ui-director — büyük harf + sıkı aralık koyu galaxy bantlarında Türkçe İ/I ve noktalı harflerde okunurluğu düşürür (ölçülmedi). gamification-economy — ilk haftada seri baskısı olmasın; sıralama varsayılan "bu hafta başlayanlar". htb-academy-ux — terminal ve VM ilk iş olmasın.

**Karar**

| Öğe | Karar | Öncelik |
|---|---|---|
| Sıfır ilerlemede ana sayfa | Değiştir → tek "İlk 5 dakika" kartı | **P0** |
| `continueTarget` ilk önerisi | Değiştir → Program'ı atla | **P0** |
| Program sayfası (p-01) | Koru ama sona al; "30 hafta" çerçevesini yumuşat | P1 |
| Satır içi sözlük | Ekle | P1 |
| Takma ad/gizlilik, öğrenci numarası | Değiştir | P1 |
| DOSYA kutusu | Koru, sonradan açılan ödül yap | P1 |
| "Kalkan dosyan", "Üyelik" kartı | Çıkar ya da adlandır (ilk gün) | P2 |

---

### 05 · student-curious-beginner

**Persona/etiket:** IT 1. sınıf, Linux'u duymuş, terminal açmamış, telefonla QR'dan geldi. [KANIT] / [VARSAYIM]; sayısal iddia yok.

**Kusurlar**
1. **B1 — İlk 30 sn'de 7 kart, birincil CTA ekranda yok.** [KANIT] `dashboard/page.tsx` sırası; "Başla" sayfanın ortasında; iki boş kart yarışıyor; XP kartı "sıralama dışı" + "Seri 0 gün" ("geri kaldım" hissi). [VARSAYIM] Telefonda ilk ekranda yalnız bant ve boş kartlar.
2. **B2 — İlk ders okumayla başlıyor, "Dene" uygulamada yapılamıyor.** [KANIT] `m01-01` sonunda "hesaplarını say, bir kenara yaz" — sistem almıyor, geri bildirim/XP yok; ilk blok "DOSYA: Tatlı Dil Tevfik"; ilk etkileşimli görev 5. sayfada 150 kelimelik açık uçlu yazı. [VARSAYIM] 0 bilgili öğrenci yazı kutusunu boş bırakır.
3. **B3 — "Tarayıcıdan yapılır" sözü M03–M04'te bozuluyor.** [KANIT] `m04-01` "Laboratuvardaki Ubuntu VM'ini aç (Windows'ta WSL de olur)"; `01-temel` içinde 7 dosyada 16 VM/VMware/WSL geçişi, en yoğun `m03-05` (8); tarayıcı içi terminal yok, §5.14 yalnız stil olarak planlı. [VARSAYIM] Düşük özellikli/Mac/Chromebook öğrencide 30+ dk kurulum, bırakma sebebi.
- *Ek:* M01-01'de "sosyal mühendislik, phishing" kalın ama tanımsız; sözlük yok.

**Fikirler (her biri için alternatif mikro etkinlikle)**
1. **İlk 5 dakika modu (B1):** "İLK GÖREV · 5 DK — Bir mesaj geldi. Gerçek mi, sahte mi? — Kayıt gerekmez, bir şey kurmana gerek yok. Sadece bak ve karar ver. [Mesajı aç →] · Önce akademiyi gezmek istiyorum". Diğer kartlar tek şeride iner; "Seri 0 gün" hiç gösterilmez. *Alternatif:* 15 sn'lik "Hacker dediğin kim? [kapüşonlu biri] [sıradan biri bile olabilir]" sorusu → tek cümle geri bildirim + ilk +10 XP → "Mesajı aç" açılır.
2. **"Önce yap, sonra oku" (B2):** sahte kampüs e-postası kartı (`burs@scholarship-campus.example`, "Bursun onaylandı"); `Bağlantıya tıkla · Göndereni incele · Arkadaşıma ilet`. Yanlışta "Tıkladın. Gerçek hayatta burada giriş sayfası açılırdı. Bu sefer güvendesin, çünkü bu bir prova…" + İpucu 1; doğruda "Güzel… Neden? [Adres okula benzemiyor] [Çok acele ettiriyor] [Emin değilim]"; "Emin değilim" → "Doğru refleks: başka kanaldan doğrula." Dönüt 1–2 sn. *Alternatif:* tek tıklık "Sen olsan ne yapardın?" kartı, yazı kutusu yok.
3. **VM yerine tarayıcı simülasyonu (B3):** yalnız 4–6 komutu tanıyan simüle terminal (`whoami`, `pwd`, `ls`, `date`), sunucuya komut göndermez; "Bu gerçek bir sunucu değil, güvenli bir prova alanı…"; "Gerçek Linux kurmak istiyorum (opsiyonel)" bağlantısı. *Alternatif:* 4 komut kartını 4 açıklamaya eşleştirme (dokunarak), 30 sn.

**P0 risk:** Yeni öğrenci ilk 60 sn'de hiçbir şeyi çözmeden, geri bildirim almadan ayrılır (B1 + B2 + B3).
**Kabul testi (gelecekte, sonuç yok):** 5–8 deneyimsiz gönüllü, kendi telefonlarıyla QR'dan: (A) ilk mini görevin başlatılmasına süre/tık — hedef <60 sn, yardımsız; (B) "Az önce ne yaptın ve neden doğru/yanlıştı?"; (C) sessiz gözlemde ilk 5 dk'da 0–1 takılma; (D) kimse VM/WSL kurmak zorunda kalmamalı.

**İtirazlar (öngörüsel):** tryhackme-ux / htb-academy-ux — "hemen laboratuvar/makine" B3'ü büyütür; simülasyon önce, gerçek ortam opsiyonel. underground-storyteller — hedef cümlesi (tek satır) DOSYA kutusundan önce. gamification-economy — sıfır XP'liye sıra/seri/liderlik ilk dersten sonra açılsın. learning-scientist — 150 kelimelik serbest metin ağır; önce seçmeli gerekçe, yazı isteğe bağlı.

**Karar**

| Öğe | Karar | Öncelik |
|---|---|---|
| Dashboard ilk kullanım (tek CTA, diğerleri katlı) | Değiştir | **P0** |
| İlk ders "yap-önce" mini görevi (sahte e-posta, anlık dönüt) | Değiştir | **P0** |
| VM/WSL "Dene" bölümleri → tarayıcı simülasyonu + opsiyonel gerçek ortam | Değiştir | P1 |
| Sıfır XP'liye sıra/seri ilk dersten sonra | Değiştir | P1 |
| İlk derste jargon sözlüğü | Ekle | P1 |
| DOSYA kutuları, Gölge Ağ, noir ton (hedef cümlesinden sonra) | Koru | P2 |
| M01-05 serbest 150 kelime (önce seçmeli, yazı opsiyonel) | Değiştir | P2 |
| CIU marka sistemi | Koru | — |

Kritik not: yeşil birincil CTA yalnız tek yerde ("Mesajı aç") görünmeli; tasarım sisteminin "bölümde tek yeşil eylem" kuralıyla uyumlu.

---

### 06 · student-bored-skeptic

**Persona/etiket:** sabırsız, hemen çıkacak öğrenci. [KOD], [İÇERİK], [VARSAYIM]; yüzde yok.

**İlk 30–60 sn akışı:** `/login` platformun ne olduğunu göstermiyor [KOD] → `/register` 7 alan (+ başvuruda "Kendini tanıt") — ilk terk anı [VARSAYIM] → onay modunda "Başvurun alındı…", oyalanacak bir şey yok → `/dashboard` altı kutu, çoğu boş; altta 4 linkli paragraf [KOD].

**Kusurlar**
1. **Yeni üyenin ilk ekranı boş kartlar, tek "ilk adım" yok.** "Başla" görev/duyuru kartlarının altında; `continueTarget` → [VARSAYIM: yaml sırası] "Ördek Akademi nedir?" (30 haftalık tablo, deneme yok); "CIU / Club Academy / Gölge Ağ" ile "Ördek Akademi" karışıklığı güveni düşürür.
2. **Görsel boşluk ve etkileşimsiz "Dene".** Dersin ilk ekranında iki "Görsel hazırlanıyor" gri kutusu (bitmemiş ürün hissi); "Dene" düz metin; "Okudum, tamamla" tek tıkla XP — "oyun değil sahte" geliyor.
3. **Uygulama vaadi tutmuyor, quiz geç geri bildirim veriyor.** `m01-05` 150 kelimelik alan vaat ediyor; `components/academy` ve `server/academy`'de "teslim" araması sonuçsuz; sayfa hâlâ 15 dk ve üç yazma görevi istiyor. Quiz'de sorular toplu gönderiliyor, "Tekrar dene" doğruları da sıfırlıyor; "Purple Team'in görevi nedir?" ezber sorusu.

**Fikirler**
1. **Tek kartlık "ilk dosya" ekranı:** "Hoş geldin, Eren. İlk dosyan: SAHTE BURS MESAJI · 5 dk · +60 XP — 'Telefonuna bir mesaj düştü. Tıklamadan önce bir bak.' [MESAJI AÇ] · Önce etrafa bakayım → · Canlı ders kodun mu var? [____] [Katıl]". Diğer kartlar gerçek veri gelene kadar gizli; `EXAMPLE_LESSON.md` akışı "Başla"nın ilk hedefi.
2. **Hesapsız önizleme / onay beklerken mini görev:** `/login`'de "Hesap açmadan 2 dakikalık deneme"; "Başvurun alındı" ekranında "Beklerken şunu dene" (XP kaydedilmez, "Hesabın onaylanınca ilerlemeni kaydederiz"); öğrenci no ve bölüm formdan profile.
3. **Ders sadeleştirme ve anında geri bildirim:** görseli olmayan kutuyu hiç render etme veya tek renkli diyagram; "Bu sayfada" hedef kutusu mini etkileşimden sonra; quiz soru soru (anında doğru/yanlış + tek cümle neden, tekrarda yalnız yanlışlar); "Okudum, tamamla" yerine küçük karar. Metinler: yanlışta "Neredeyse. Gönderen adresine bir daha bak, harf harf oku. [İpucu — XP düşmez]"; doğruda "+60 XP. Adres okul adına benziyor ama aynı değil. Bunu fark ettin."
- *Küçük ek:* liderlikte "bana en yakın 5 kişi", canlı bitişte "Kaldığın derse dön".

**Sayfa sayfa: kalır mıyım / çıkar mıyım**

| Sayfa | Karar | İlk terk anı | Tersine çeviren düzeltme |
|---|---|---|---|
| `/login` | Kalırım, merak etmem | Ürünü göstermeyen çıplak form | "5 dk'lık ilk görev seni bekliyor" + "Hesapsız dene" |
| `/register` | **Çıkarım** | Öğrenci no / bölüm / davet kodu | Yalnız takma ad + e-posta + parola; diğerleri profile; onay beklerken mini görev |
| `/dashboard` | **Çıkarım** (yeni), kalırım (devam eden) | Çoğu boş altı kutu | İlk-giriş tek kartı; boş kartları gizle |
| `/academy` | Kararsız | 19 yol, OSINT/SOC/CTI, "Kod adın: Tilki" (seçmedim) | Sezon 2 kapalı; üstte tek önerilen ders; jargon altına 1 satır |
| `/academy/lesson/*` | Kalırım | "Görsel hazırlanıyor" ve dosya/hedef kutusu içeriği itiyor | Boş görseli gizle; ilk ekranda 1 mini karar; anında quiz geri bildirimi |
| `/live`, `/live/[code]` | Kalırım | Kopma perdesinde süre ve "yeniden dene" yok | Overlay'e "Yeniden dene" + son slayt; bitişte "Kaldığın derse dön"; "6 haneli" metni ile `maxLength=8` [KOD] tutarlı yapılsın |
| `/tasks` | Çıkarım | 4 sütunlu tablo, mobilde yatay kaydırma, mavi "teslim edilmedi", XP eğitmen onayından sonra | Mobilde kart listesi, "~10 dk · +120 XP", etiket "Hazır" |
| `/leaderboard` | Sıra yüksekse kalırım | Genel sekmede 0 XP ile #47 | Varsayılan "bu ay"; "Yakınındakiler"; takma ad ve opt-out |

**P0 risk:** Yeni üye ilk 90 sn'de küçük başarı yaşamadan çıkar. Zincir: kayıt → (onay) → boş panel → bilgi sayfası → gri görsel kutuları → "Okudum, tamamla"; hiçbir noktada gerçek geri bildirim yok [VARSAYIM, kod yollarından].
**Kabul testi (yöntem önerisi, yapılmadı):** temiz hesap, 5 gönüllü, izinli ekran kaydı: ilk etkileşimli karara ≤2 tık ve kaydırmasız; ilk doğru/yanlış geri bildirimine ≤90 sn; 5'ten 4'ü yardımsız bitirir. Not: ilk kapanma anı, "bu ne" denen jargon, tıklamadan çıkış.

**İtirazlar (öngörüsel):** underground-storyteller — giriş ≤2 cümle; tam DOSYA ilk etkileşimden sonra ödül. gamification-economy — genel liderlik ana sayfada link olmasın; "bu ay" yeni gelen için daha adil. tryhackme-ux / htb-academy-ux — §5A akordeon, terminal, 12px çubuk 0 bilgiliyi korkutur; terminal ancak M04'te. learning-scientist — gerekçe yazma seçmeli olsun ("Neden? (isteğe bağlı) [+10 XP]").

**Karar**
- **Değiştir P0:** onboarding + dashboard + kayıt akışı.
- **Değiştir P1:** boş görsel kutusunu gizleme, quiz'de anında geri bildirim, `m01-05` teslim tutarsızlığı, "Okudum, tamamla" XP'sinin koşullandırılması.
- **Değiştir P2:** liderlik "yakınındakiler", canlıdan bireysel moda köprü, görevler tablosunun mobil kart hâli.
- **Koru:** 300–400 kelimelik kısa dersler, tek ana fikir, "✅ Akılda kalsın", dashboard'daki tek "Devam et" mantığı.

---

### 07 · underground-storyteller

**Kusurlar**
1. **B1 — Hikâye öğrenmenin parçası değil, kenarda.** *Kanıt:* `m01/01-neden-onemli.md` "DOSYA: Tatlı Dil Tevfik" = resim + paragraf, ardından tanım; hikâyeyi "Selim Hoca" sürdürüyor; öğrencinin verdiği karar yok. *Varsayım:* kutu süs gibi atlanır.
2. **B2 — Tonda iki kayma: ders kitabı dili ve karikatür kötü adam.** *Kanıt:* sayfalar ~340–420 kelime, tablolar, açıklanmamış "white hat/black hat", emojili başlıklar, "15. haftada"; `karakterler.yaml` mafya estetiği (puro, altın diş, "Don"). *Varsayım:* karikatür gerçek tehlikeyi hafife aldırabilir; gerçek sahte mesaj sıkıcı ve resmî görünür.
3. **B3 (P0 adayı) — Uygulama sayfası olmayan alanı vaat ediyor.** `m01-05` "bu sayfanın altındaki alana yaz"; `academy` altında `textarea` yok; cevaplar uygulamadan önce `<details>` içinde. *Teyit gerekli:* başka bileşende olabilir.

**Fikirler**
1. **Özgün anlatıcı "Nöbetçi":** kampüs ağının gece vardiyasındaki adsız, yüzsüz iç ses. İmza: saat damgası (`23:47 — Bir mesaj düştü.`). Kurallar: balon ≤2 cümle; asla alay etmez, "hacker oldun" demez; bazen "Emin değilim. Bakalım." der; övgü öğrenciye ("Sen yakaladın."); Gölge Ağ adları yalnız dosya kutusunda. Kapanış "Kayda geçti." ("DOSYA KAPANDI" ile birlikte; mevcut içerik silinmez). Görsel: koyu sahnede krem metin, küçük mor saat rozeti; neon yeşil yalnız "Devam" (TASARIM-SISTEMI §2).
2. **Ders = sahne + seçim:** üstte Nöbetçi balonu, ortada kurgu nesne (gelen kutusu, log kartı, dosya listesi), altta üç ikincil hap düğme (mor çerçeve); kancadan ilk tıka ≤20 sn.
3. **Mikro kopya:** yanlışta "Çoğu kişi tam burada tıklıyor; mesaj bunun için yazıldı. Simülasyon, hiçbir şey gitmedi. Geri saralım mı?" `[Tekrar bak]`; ipucu `[Bir ipucu ver]` → `[Biraz daha]` (ceza metni yok); belirsiz vakada doğru seçenek `Emin değilim, başka yoldan doğrularım`.

**12 ders kancası (Kanca → Seçim → Doğru cevap → Sonraki merak)**

| # | Ders | Kanca | Seçim | Doğrusu | Sonraki merak |
|---|---|---|---|---|---|
| 1 | Dijital iz | "22:10. Kafede çekilen bir fotoğraf…" | Fotoğraf mı, dosya mı gönderilsin | Kurgu kartta konum görünüyor; bilmiyorsan kontrol et | "Fotoğraf olmadan da iz bırakıyorsun." |
| 2 | Hesap koruması | "03:12. 'Giriş sen misin?' onayı geldi. Sen uyuyordun." | Onayla / Reddet ve şifre değiştir / Görmezden gel | Reddet ve şifreni değiştir | "Onay ikinci kez geldi. Bu sefer mesajla." |
| 3 | Oltalama | Tam modül (aşağıda) | — | — | — |
| 4 | Verinin yolculuğu | "Adresi yazdın, Enter'a bastın. İlk kime sordun?" | Siteye / Adres defterine / Wi-Fi şifresine | Adres defteri (DNS) | "O defter yanlış numara verirse?" |
| 5 | Wi-Fi | "`Kampus` ve `Kampus_Free`. Biri sahte olabilir." | Free'ye bağlan / BT'nin duyurduğu ağ / İkisini dene | Resmî ağ; ağ adı kanıt değil | "Resmî ağdasın. Tarayıcı yine de uyarıyor." |
| 6 | Tarayıcı | "Kilit simgesi var. Demek ki güvenli… değil mi?" | Kilit varsa gir / Adrese harf harf bak | Adrese bakmak; sahte siteler de kilit alır | "İndirilen dosyanın adı tuhaf." |
| 7 | Dosya güvenliği | "`odev.pdf.exe`. Arkadaşın 'notları attım' diyor." | Aç / Başka yoldan sor / Klasöre taşı | Sormak; dosya bir program | "Arkadaşın 'ben bir şey atmadım' dedi." |
| 8 | Olay inceleme | "Gitmediğin bir şehirden giriş var. Saat 04:40." | Hesabı sil / Güvenli cihazdan şifre değiştir, oturumları kapat, bildir / Bekle | İkinci seçenek; silmek izi siler | "Giriş kaydında bir ayrıntı daha var." |
| 9 | OSINT etiği | "Bir arkadaşının adresini 4 dakikada buldun…" | Gruba paylaş / Hiçbir şey yapma / Kişiye söyle | Kişiye söylemek | "Senin hakkında ne bulunur?" |
| 10 | Ağ mantığı | "Aynı bina, farklı oda…" | İki paketi doğru odalara eşle | IP = bina, port = oda (web genelde 443) | "Bir oda kapısını açık bırakmış." |
| 11 | Log okuma | "40 başarısız giriş. Sonra bir tane başarılı." | Normal / Biri şifre denedi ve tuttu / Sistem hatası | İkinci; asıl alarm 41. satır | "O hesap şimdi neye bakıyor?" |
| 12 | İlk mini CTF | "Bu sayfayı kulüp kurdu. Bir bayrak sakladık…" | Kaynağa bak / Rastgele tıkla / Yöneticiye sor | Kaynağa bakmak; `CIU{gorunmeyen_not}` yorum satırında (sentetik, yalnız kulüp sayfası) | "Sezon 2'de bayrak tek parça değil." |

**Tam modül: "Şüpheli Mesaj: Sahte Kampüs Bursu" (~6 dk, tamamen kurgu; okul alan adı `kampus.edu.example`, gerçek link yok)**

| Ekran | Zaman | İçerik |
|---|---|---|
| 1 Kanca | 0:00 | "`23:47` Bir mesaj düştü. Başlığında 'Bursun onaylandı' yazıyor. Herkes sevinecek. Sen önce bir bak." `[Mesajı aç]` |
| 2 Sahte gelen kutusu | 0:20 | Gönderen "Öğrenci İşleri – Burs Ofisi `<burs@scholarship-campus.example>`"; konu "Tebrikler! %100 bursunuz onaylandı"; "24 saat içinde öğrenci numaranız ve şifrenizle giriş yapınız." Tıklanamaz `[Hemen giriş yap]`. Nöbetçi: "Ekranda her şey resmî görünüyor. Sen olsan ne yapardın?" |
| 3 Seçim | 1:00 | `Giriş yap, bursu kaybetmeyeyim` · `Önce kimden geldiğine bakarım` · `Arkadaşlarıma da iletirim` |
| 4 Geri bildirim | 1:30 | Giriş: "Çoğu kişi tam burada tıklıyor… adres çubuğunda `scholarship-campus.example` yazıyor. Okulun adresi bu değil." `[Tekrar bak]` · İlet: "İyi niyetli… tuzağı 40 kişiye daha taşımış olursun. Doğrusu: bildir, iletme." · Bak: "Sen yakaladın. Adı 'Öğrenci İşleri' ama adresi başka bir yerin." |
| 5 İpuçları | 2:30 | İpucu 1: "@ işaretinden sonrası, mesajın gerçekte nereden geldiğini söyler." İpucu 2: "Okulun adresi `kampus.edu.example`. Bu mesajdaki onunla aynı mı?" |
| 6 Uygulama: üç kart | 3:30 | Sahte / Güvenilir / Emin değilim + kanıt etiketi. A `kampus.edu.example` "Sonuçlar portalda; kendi tarayıcınızdan girin" → güvenilir. B `kampus-edu.example` "Kart bilginizi onaylayın" → sahte. C doğru adres ama arkadaş hesabından "acil, şu dosyayı aç" → "Emin değilim" kabul, başka yoldan sor. Nöbetçi: "C'de 'bilmiyorum' demek zayıflık değil. Başka bir yoldan doğrulamaktır." |
| 7 Özet | 5:00 | "Tehlikeli mesaj her zaman kötü yazılmış olmaz… Linke tıklama. Resmî siteye kendin gir. Şüpheliyse bildir. Bu numaranın adı: **oltalama**. Kayda geçti." |
| XP koşulu (gamification için öneri) | — | +60 XP: Ekran 3'te karar + Ekran 6'da en az 2 kart kanıtla doğru; ipucu sonrası düzeltme tam XP; aynı kartı yeniden denemek ek XP vermez |
| 8 Sonraki merak | 5:40 | "`00:12` Yeni mesaj. İçinde link yok. Adres de doğru. Ama gönderen, senin adını yanlış yazmış." `[Sonraki dosya]` |

Görsel kararı: özgün tasarlanmış sahte gelen kutusu arayüzü; gerçek e-posta istemcisi ekran görüntüsü yok; isteğe bağlı açılış görselinin promptu `EXAMPLE_LESSON.md`'de.

**P0 risk:** Hikâye öğrenmenin yerini alır; öğrenci kötü adamı hatırlar, kuralı hatırlamaz.
**Kabul testi (5–8 gerçek öğrenci, yapılmadı):** kancadan ilk etkileşime <20 sn; 24 saat sonra büyük çoğunluk "Göndereni @'den sonrasıyla kontrol et, resmî siteye kendin gir" kuralını kendi sözleriyle söyler (karakter adı gerekmez); "komik / gergin / sıkıcı" etiketlemesi — "cringe" diyen çıkarsa ton yeniden yazılır.

**İtirazlar (öngörüsel):** gamification-economy — "her doğru tıklamaya XP" tahmini ödüllendirir; XP gerekçeli karara ve düzeltmeye. elite-ui-director / motion-visual — ağır sinematik giriş, tam ekran animasyon kancayı geciktirir; gerilimi metin ve tek nesne taşımalı.

**Karar**

| Öğe | Karar | Öncelik |
|---|---|---|
| Gölge Ağ dosya kutuları | Koru; ikinci plana al | P1 |
| Sahne + seçim akışı | Değiştir | **P0** |
| m01-05 olmayan yazı alanı vaadi | Değiştir: kaldır ya da gerçek giriş ekle | **P0** |
| Dersin girişindeki tanım duvarları | Çıkar | P1 |

---

### 08 · learning-scientist

**Etiketler:** [Kod], [Araştırma-güçlü/orta] (alanyazında yerleşik, bu kitleyle test edilmedi), [Hipotez]. Okunan: `service.ts`, `LessonActions.tsx`, `lesson/[slug]/page.tsx`, `xp/engine.ts`, `akademi.yaml`, `01-temel/` (M01 örnekleri, M11 ısınması, süreler).

**Kusurlar**
1. **K1 — Uygulama sayfaları uygulatmıyor; XP tıklamayı ölçüyor.** [Kod] `m01-05` alan vaat ediyor, yalnız `CompleteButton`; çözüm `<details>`'ta açık; `MIN_READ_MS = 15_000` ile 15 dk'lık uygulama 15 sn'de 40 XP. Hatırlama (üretim) aşaması atlanıyor; kendi kendine sınama yeniden okumadan daha kalıcı [Araştırma-güçlü: Roediger & Karpicke 2006; Dunlosky vd. 2013]. Metin–arayüz uyuşmazlığı güven kaybettirir [Hipotez].
2. **K2 — Quiz ezberi ve kaba kuvveti ödüllendiriyor.** [Kod] `gradeQuiz` yanlışta doğruyu ele veren `explanation` gösteriyor; "Tekrar dene" aynı soru/sıra; 10 dk'da 20 deneme hakkı; ikinci denemede geçmek neredeyse garanti. XP'nin bir kez verilmesi (`quiz:${userId}:${lessonId}`) iyi, ama "geçti" anlamsızlaşıyor. Sorular tanım ağırlıklı ("Purple Team'in görevi nedir?"); karar/aktarma sorusu az; ders içi sınama ve aralıklı tekrar yok [Araştırma-güçlü: Cepeda vd. 2006].
3. **K3 — Sıra, süre ve ön koşul 0 seviyeyi korumuyor.** [Kod + Hipotez] M02 "KKTC mevzuatı, KVKK/GDPR" ikinci sırada (soyut); M04 Linux ve M07 Python, OSINT (M09) ve log okumadan önce; "Log dedektifi" M07'de Python gerektiriyor. Uygulamalar 15–45 dk, M11 ısınması 30 dk, ara kontrol yok. M11 ısınması `tcp.flags.syn == 1 && tcp.flags.ack == 0` ve base64 istiyor. İstenen 12 konudan Wi-Fi ve tarayıcı Kısım I'de ayrı modül değil (Wi-Fi Yol B'de).

**Fikirler**
1. **`:::kontrol` bloğu (3–7 dk'da bir)** [Araştırma-güçlü: segmenting/retrieval; Hipotez: motivasyon]: tek soru (seçmeli/eşle); doğru cevaba kadar sonraki bölüm sönük; "Okudum, tamamla" ancak tüm kontroller yanıtlanınca; `<details>` çözümü seçim gönderildikten sonra. Örnek: "Bir saniye. Sen olsan? Mesaj A'da seni en çok rahatsız eden şey ne? ◯ Gece 23:47'de gelmesi ◯ Adresteki alan adı ◯ Emoji kullanması". Yanlışta "Mantıklı bir tahmin. Ama saat tek başına kanıt değil…"; [İpucu 1] → [İpucu 2] (`kku-burs-onay.example` ile `kuzeykiyi.edu.example`) → [Çözümü göster]; seçimden sonra güven sorusu "Tahmin · Biraz · Eminim" (kalibrasyon; "Eminim" deyip yanılanlara 2 gün sonra yeni soru).
2. **Quiz'i ölçme aracına çevir** [Araştırma-orta: Hattie & Timperley 2007]: soru başına ≥3 varyant, karışan seçenek sırası; ilk yanlışta yalnız "neden yanlış" ipucu (doğru ele verilmez); modülde soruların ≥%40'ı senaryo/karar; 2–3 gün sonra ana sayfada 3 soruluk "Hatırla" kartı (XP'den çok "kalıcı" işareti).
3. **0 seviye yolunu Python/Linux'tan bağımsızlaştır** [Hipotez; `lab/` sentetik verisi hazır]: Linux, Python, paket yakalama "İsteğe bağlı derinleşme" olarak M03/M04/M07'de kalır; 12 konunun hiçbiri bunları ön koşul tutmaz; her bölümde bir tarayıcı içi uygulama (TİU).

**Ek A — 0'dan 12 bölümlük yol (adımlar 5–12 dk)**

| # | Bölüm | Ön koşul | Tarayıcı içi uygulama | Mevcut eşleşme / boşluk |
|---|---|---|---|---|
| 1 | Dijital iz | yok | Sahte profil kartında 6 izi işaretle | M01-01, M01-03 |
| 2 | Hesap koruması | 1 | Parola gücü kaydırıcısı + süre eşlemesi | M08-04/05; hash isteğe bağlı |
| 3 | Phishing | 1 | Sahte gelen kutusu, kanıt etiketleme | M01-04/05, M10-03 |
| 4 | Veri yolculuğu | 3 | Paketi durak durak sürükle (DNS/HTTP animasyonu + eşleme) | M05-01, M05-03 (sadeleştir), M06-01 |
| 5 | Wi-Fi | 4 | Sahte "yakındaki ağlar"dan doğru ağı seç + gerekçe | **Boşluk:** Kısım I'de yok, Yol B'den uyarlanmalı |
| 6 | Tarayıcı | 4 | Sahte adres çubuğunda 4 adresi sınıflandır | M05-06, M06-04, M06-06 (kısmi) |
| 7 | Dosya güvenliği | 3 | `fatura.pdf.exe` gibi 6 dosya kartını ayıkla | M03-04/05, M10-04 |
| 8 | Olay inceleme | 3, 7 | 6 olay kartını zaman çizelgesine diz | M10-08; kill chain isteğe bağlı |
| 9 | OSINT etiği | 1 | Kurgusal ilanda 3 doğrulama adımı; "bu arama etik değil" de puan alır | M02-01, M09-01/06 |
| 10 | Ağ mantığı | 4 | Kapı–hizmet eşleme | M05-02/04/05 (sadeleştir) |
| 11 | Log okuma | 8, 10 | `lab/auth.log` alıntısında başarısız girişleri ve saldırgan IP'yi işaretle | **Boşluk:** M07-07 Python'a bağlı |
| 12 | İlk mini CTF | 3, 6, 8, 11 | 4 istasyon: alan adı, sahte dosya, log IP'si, zaman çizelgesi | M11-01/03; M11-02 ısınması yeniden yazılmalı |

**Ek B — 15 dk "Şüpheli Mesaj+" rubriği** (akış: kanca → 3 mesajlık gelen kutusu → kanıt etiketleme → karar/gerekçe → yeni kanala aktarma (QR afiş/telefon) → özet + 2 gün sonrası hatırlatma)

| Ölçüt | 0 | 1 | 2 | Puanlama |
|---|---|---|---|---|
| Ö1 İşaret tespiti | Alan adını bulamadı | İpucuyla buldu | Alan adı + ≥1 işaret, ipucusuz | Otomatik |
| Ö2 Gerekçe | Hüküm doğru, gerekçe yanlış | Kısmen doğru | Doğru gerekçeyi çeldiricilerden ayırdı | Otomatik |
| Ö3 Eylem | "Linke tıkla, sonra bak" | Sildi, doğrulamadı | Resmî kanaldan doğruladı/bildirdi | Otomatik |
| Ö4 Aktarma | Yeni senaryoda yanıldı | İpucuyla doğru | İlk denemede doğru + gerekçe | Otomatik, havuzdan |
| Ö5 Belirsizlik | Belirsize kesin hüküm | — | "Emin değilim, doğrularım" | Otomatik |
| Ö6 Tavsiye (isteğe bağlı) | Yok/genel | Tek doğru eylem | 2–3 cümle eylem + gerekçe | Eğitmen/akran |

Geçme: otomatik ≥7/10, Ö1 ve Ö3 ≥1. XP: tamamlama 30 + Ö4 geçilirse +30 ustalık; ipucu sonrası düzeltme XP alır; tekrar yeni varyant getirir. Geçerlilik test edilmedi; ölçüt başına ≥3 varyant, 5–8 öğrenciyle sesli düşünme ve 1 hafta sonra gecikmeli aktarma ile doğrulanmalı.

**P0 risk:** Platform ilerleme ve XP gösteriyor ama öğrenci 15 sn'de tamamlayıp ikinci denemede quiz'i geçebiliyor; kulüp yanlış analitikle karar veriyor ve "anlamadım" şikâyeti gizleniyor [Kod + Hipotez].
**Kabul testi:** (a) E2E: PRACTICE'te kontrol yanıtlanmadan `POST /complete` → 400; çözüm seçim öncesi DOM'da yok. (b) Birim: quiz tekrarında sıra/varyant değişir; ilk yanlışta yanıt yükü doğruyu içermez. (c) Gelecekte izinli 5–8 öğrenci: 48 saat sonra görülmemiş aktarma sorusu; oran uydurulmaz.

**İtirazlar (öngörüsel):** gamification-economy — okuma/tamamlama XP'sini artırma veya seri baskısına karşı; XP ustalık kanıtına; oyunlaştırmanın etkisi küçük-orta ve tasarıma bağlı [Araştırma-orta: Sailer & Homner 2020]. underground-storyteller — hikâye sayfa başına ≤2 cümle, karara bağlı. interactive-mission — ilk 3 bölümde açık uçlu serbest keşif lab'ına karşı; önce çözümlü örnek, rehberlik sonra azalır [Araştırma-güçlü: Sweller].

**Karar**

| Öğe | Karar | Öncelik |
|---|---|---|
| Uygulama sayfası "Okudum, tamamla" + açık çözüm | Değiştir | **P0** |
| Quiz: aynı sıra, ele veren açıklama, tanım soruları | Değiştir | **P0** |
| Ders içi kontrol, ipucu kademesi, güven sorusu | Ekle | P1 |
| 12 bölümlük 0 seviye yolu (Python/Linux isteğe bağlı) | Sırayı değiştir; M01–M11 korunur | P1 |
| Wi-Fi ve tarayıcı/log boşlukları | Yeni içerik | P1 |
| M11 ısınması | 0 seviye için değiştir; ileride koru | P1 |
| Gecikmeli "Hatırla" kartı | Ekle | P2 |
| Bir kez verilen quiz XP'si, `lab/` sentetik veri | Koru | — |

---

### 09 · gamification-economy

**Okunan dosyalar:** `src/server/xp/{defaults,engine,leaderboard,time,profile,admin}.ts`, `src/server/academy/service.ts`. [KANIT] / [VARSAYIM]; öğrenci verisi yok.

**Kusurlar**
1. **B1 — XP sayfa açıp beklemeyi ödüllendiriyor.** [KANIT] `completeLesson` yalnız `MIN_READ_MS` (15 sn) arıyor; ders 40, bilgi 10, quiz geçmek yalnız 30 — okumak kanıtlamaktan değerli. Kaba hesap: ~183 sayfayı 15 sn aralıkla tıklayan biri bir öğleden sonrada yüzlerce XP (Seviye 5–7, aylık 1.). `suspiciousActivity` yalnız olay sonrası liste (10 dk'da >8 ödül, 24 saatte >1500 XP); dürüst hızlı okuyucu da düşebilir [VARSAYIM].
2. **B2 — Herkes tek ligde, görünür adla.** [KANIT] `overallBoard`/`monthlyBoard` aynı havuz; `displayName`/`username` açık; takma ad/opt-out yok; genel tablo "kulübe katılımdan sayılır" niyetinde ama `sums()` tüm zamanı topluyor (kod–yorum çelişkisi). İlk ay girenin karşısında 9000 XP'lik "Efsane Tilki" [VARSAYIM: tipik bırakma yolu].
3. **B3 — Seri sert kırılıyor, telafi yok.** [KANIT] `streaks()` bir gün atlanınca `current = 0`; "7/30 günlük seri" rozetleri buna bağlı. Sınav/hastalık/bayram "zaten bozuldu" bırakmasına iter (kaçınma motivasyonu) [VARSAYIM].
- *B4 (ek):* "Çaylak" unvanı ilk gün küçümseyici okunabilir; "Yeni Kadro" veya "İz Başı" [VARSAYIM].

**Fikirler**

1. **Öğrenmeye bağlı XP tablosu (`DEFAULT_RULES` revizyonu)**

| Kural | Şimdi | Öneri |
|---|---|---|
| `info.read` | 10 | 5, tek soruluk "Anladım" kontrolüyle |
| `lesson.complete` | 40 | 20 bitirme + 20 `lesson.proof` (mini etkileşim çözülünce); etkileşimsiz derste 25 |
| `quiz.pass` | 30 | 40, ≥%70; tekrar serbest, XP bir kez |
| `review.spaced` (yeni) | – | 10; ≥3 gün önceki konudan 3 soru; günde ≤3 |
| `track.complete` | 200 | 200; koşul "tüm quizler geçildi" |
| `live.attend` | 25 | 25: ≥10 dk bağlı **ve** ≥1 etkileşim; etkileşimsiz 10 |
| `club.mission` (yeni) | – | 30 sabit, katkı miktarından bağımsız |
| Günlük okuma tavanı | – | Okuma kaynaklı XP günde ≤120; aşınca ilerleme kaydolur, XP 0, suçlayıcı mesaj yok |

`task.approved` (120) ve `live.quiz` (10) olduğu gibi kalır.

2. **Ligler ve sıfırlama sınırı:** **Yeni Kadro** = `joinedAt`'tan 60 gün **veya** 800 XP (Seviye 4), hangisi önce; terfi ay sonunda (ay ortası zıplama/kasten düşük kalma önlenir). **Usta Kadro** = diğerleri. Yalnız aylık puan sıfırlanır; toplam XP, seviye, rozet, arşiv (`LeaderboardPeriod`) asla. Görünür katılımcı <5 ise liste açılmaz. Yeni Kadro tablosu: ilk 10 + "Sen" + 2 üst/2 alt; genel tabloda yeni üyeye sıra yerine seviye yolu. `monthly-champion` lig başına.
3. **"Sakin Seri":** haftada 2 otomatik dinlenme günü (satın alınmaz; köprü sayılır, sayıya eklenmez); boşluk 2 günü aşarsa ertesi gün 5 dk'lık "Geri dönüş görevi" seriyi kurtarır; "En uzun seri" silinmez; "Seri sıfırlandı" yerine "Yeni bir seri başlıyor"; seri XP çarpanı değil, sıralamaya girmez; bildirim varsayılan kapalı.

**Somut ekranlar**
- *A — Liderlik ilk açılış (tek seferlik; atlanırsa varsayılan takma ad):* "Listede nasıl görünmek istersin? … ( ) Takma adımla görün (önerilen) — `Gece Tilkisi-47` [Yeniden üret] · ( ) Gerçek adımla görün — Eren A. · ( ) Listede görünme — Puanın, seviyen ve rozetlerin yine çalışır. · Yöneticiler sorun çözmek için gerçek adı görebilir…" [Kaydet] (yeşil) — [Şimdilik atla].
- *B — Dashboard XP kartı:* "Yeni Kadro · Mayıs — Bu ay 135 puan. Senden 2 üstteki arkadaşın 20 puan ilerinde. Bu ay kimse seni geride bırakmak zorunda değil. Kendi hızın sayılır. — Sakin Seri: 5 gün · Bu hafta 1 dinlenme günü hakkın kaldı." (Rakamlar örnek metindir, veri değil.)
- *C — Atlama sonrası:* "Hoş geldin geri… 5 dakikalık bir görev yap, serin kaldığı yerden devam etsin. [Geri dönüş görevini başlat] — [Şimdi değil, yeni seri başlat]".

**Takma ad / opt-out ve kulüp ortak görevi**
- `User.alias` (benzersiz, 3–20 karakter, sunucuda üretilir, küfür/yetkili-taklit denetimi, değiştirilebilir). Gizli seçenekte kişi listelerde, `/u/[kullanıcı]`'da (başkalarına 404) ve ortak görev adlarında görünmez; XP/seviye/rozet çalışır. Mevcut kullanıcılara ilk ziyarette kart; seçene kadar otomatik takma ad. Bölüm, öğrenci no, e-posta hiçbir sıralama ekranında yok (`profile.ts` zaten gözetiyor [KANIT]).
- **"Ağı Kurtar" (aylık, işbirlikçi):** hedef `max(20, son 30 günde aktif üye × 3)`; tek ilerleme çubuğu, ad yok; ulaşılırsa en az 1 etkinlikle katkı yapan herkese sabit 30 XP + ortak rozet; başarısız ay suçlayıcı değil ("Bu ay %80'e geldik…"); `/admin/xp`'ten açılır/kapanır.
- **Anti-cheat ve veri minimizasyonu:** yeni veri yok (IP, parmak izi, tuş kaydı yok); mevcut sinyaller (`startedAt`→`completedAt`, günlük tavan, quiz karıştırma, görev onayı); yüksek hız = "inceleme bekliyor" (XP beklemede), otomatik ban yok; bayraklar 30 günde silinir.

**Üç motivasyondan eleştiri [VARSAYIM]:** rekabetçi — lig/aylık sıfırlamayı sever, takma adla "kimi yendim" bilemez (isteyen gerçek adı açar; terfi "yeni zirve" diye kurgulanır). Meraklı — tavan ve kanıt şartından rahatsız (keşif sayfaları 0 XP ama rozet/sayaç). Çekingen/0 bilgili — varsayılan takma ad, Yeni Kadro, dashboard'da sıra yok, Sakin Seri; "hiçbir şey bilmiyorum" hissi yine de içerik tarafında (ajan 04) çözülmeli.

**P0 risk:** Okuma-XP ekonomisi düzeltilmeden lig/takma ad eklemek; tıklayarak aylık 1. olan biri Yeni Kadro'yu da zehirler.
**Kabul testi:** (1) 183 sayfayı 15 sn aralıkla tamamlayan hesap günde >120 okuma XP'si alamaz; (2) 61 gün/800 XP geçen hesap bir sonraki ay sonunda Yeni Kadro'dan çıkar, aynı ay içinde değil; (3) opt-out kullanıcı `monthlyBoard`, `overallBoard`, `/u/` ve ortak görev listesinde yok, `xpSummary` ve rozetler çalışıyor; (4) `streaks()` 2 dinlenme günüyle 3 günlük boşluğu köprüler, uzun boşlukta koparır, `longest` korunur; (5) elle: <5 görünür katılımcıda liste açılmaz; (6) Tur 4: 5–8 yeni üyeyle ilk liderlik ziyareti ve takma ad kartını anlama süresi.

**İtirazlar (öngörüsel):** student-bored-skeptic / elite-ui-director — her sayfada konfeti/XP patlaması ve dashboard üstünde liderlik olmasın; anlık ödül yalnız kanıt anlarında; dashboard'da sıra yerine "kaldığın yer" (MASTER_PROMPT madde 6). learning-scientist — "XP'yi tamamen kaldır"a karşı: görünür ama kanıta bağlı, rekabet isteğe bağlı. underground-storyteller — unvanlar "iyi taraf"ta (Kalkan); kullanıcı kendini "suçlu" görmesin. club-live-experience — canlı derste anlık sıralama yok; yalnız takım/sınıf toplamı.

**Karar**
- XP tablosu ve günlük okuma tavanı: **Değiştir, P0.**
- Takma ad + opt-out (varsayılan takma ad): **Ekle, P0** (mahremiyet; yerel mevzuat varsayımı hukuk danışmanınca doğrulanmalı).
- Yeni Kadro / Usta Kadro, yalnız aylık puanın sıfırlanması: **Ekle, P1.**
- Sakin Seri + Geri dönüş görevi: **Değiştir, P1.**
- "Ağı Kurtar": **Ekle, P1.**
- "Çaylak" unvanını yumuşatma, `review.spaced`: **P2.**
- **Koru:** idempotent XP defteri, sunucu tarafı miktar, aylık arşiv, `live.quiz` ve `task.approved`.

---

### 10 · interactive-mission

**Okunan dosyalar:** `LessonActions.tsx`, `Markdown.tsx`, `xp/engine.ts`, `lesson/[slug]/page.tsx`.

**Kusurlar**
1. **Ödül tıklamayla geliyor, kanıtla değil.** [KANIT] "Okudum, tamamla" `lesson.complete` (40) veriyor; "salt tekrar tıklama puan vermez" ilkesiyle çelişiyor; anlamayı ölçen adım yok.
2. **Geri bildirim geç ve tek parça.** [KANIT: `QuizForm`] cevaplar sonda toplu, açıklamalar sonra; "Tekrar dene" tüm seçimleri sıfırlıyor → ezberleyip yeniden deneme; "Cevabı ezberleme, nedenini yakala" tonuyla uyuşmuyor.
3. **İçerik şeması etkileşimi taşıyamıyor.** [KANIT: `page.tsx`, `Markdown.tsx:88`] yalnız `QUIZ` ayrılıyor; PRACTICE da "Okudum, tamamla"ya düşüyor; Markdown'daki tek etkileşim `::animasyon[id]` (izleme var, karar yok). [VARSAYIM: `service.ts` okunmadı.]

**Fikirler**
1. **Yeniden kullanılabilir `MissionRunner`:** Markdown'da `::gorev[sahte-burs]`; `Markdown.tsx` `ANIM` regex'inin yanında yakalar, lazy yükler; içerik `content/academy/missions/<id>.yaml`, zod ile doğrulanır. Yalnız 5 adım tipi: `inbox`, `inspect`, `choose`, `pick-evidence`, `classify`; genel sahne motoru gerekmez.
2. **"Kanıt panosu":** `Gönderen ▾ (adrese bak)` → yan yana "Yer imindeki okul: `kuzeyada.example`" / "Bu mesaj: `kuzeyada-burslar.example`" (fark işaretli) → `+ Kanıt: Gönderen adresi okulunkiyle aynı değil`; panoya eklemede kısa "klik" animasyonu (reduced-motion'da kapalı).
3. **Güvenli yanlış, sonra devam:** yanlışta "simülasyon sonucu", sonra aynı adıma dönüş; ceza/kırmızı ekran yok. Toplu veri ("sınıfın %X'i ilk denemede yakaladı") yalnız canlı oturumda, gerçek katılımcı sayısıyla [VARSAYIM: `/ws/live`'a eklenmeli].

**Sahte Kampüs Bursu görev spesifikasyonu**
- **Güvenlik kapsamı:** kurgusal okul "Kuzey Ada Üniversitesi" (CIU'yu taklit etmez); alan adları `.example`/`.invalid` (RFC 2606); hiç `<a href>` yok; dış istek yok; parola kutusu yok (simülasyon girişi input olmayan kutular); sabit rozet `SİMÜLASYON · Gerçek e-posta değil, hiçbir şey sana zarar veremez`; gerçek kişi/kurum/logo yok.
- **Durum makinesi** (`sessionStorage`, yenilemede devam):

| Durum | Ne olur | Geçiş |
|---|---|---|
| `intro` | "Gelen kutusunu aç" | → `inbox` |
| `inbox` | Mail 1 okunmamış açık; diğerleri "Önce ilk mesajı çöz" kilitli | Mail 1 → `reading` |
| `reading` | "Kuzey Ada Burs Ofisi" `burs@kuzeyada-burslar.example`, "Burs başvurun ONAYLANDI, 24 saat içinde doğrula", "Hesabımı doğrula" (hedef `giris.kuzeyada-burslar.example` yalnız incelenince) | A "Tıkla, giriş yap" → `sim_A` ("Şifreni yazsaydın dolandırıcıya gidecekti. Sorun sen değilsin, mesaj tam bunun için yazılmış.") → `reading`, `attempts++` · C "Arkadaşlara ilet" → "İletirsen sahte mesaj yayılır. Önce kendin doğrula." → `reading` · B "Göndereni kontrol et" → `evidence` |
| `evidence` | 5 etiket: 2 çekirdek (alan adı farklı, link hedefi farklı), 1 destek ("24 saat" baskısı), 2 yem ("Merhaba yazıyor", "Tek büyük harf var") — yemde saygılı açıklama, eleme yok | → `classify` |
| `classify` | 3 kart (K1 gerçek, K2 harfi kaymış alan adı, K3 belirsiz); `Güvenilir / Sahte / Emin değilim, başka kanaldan doğrularım`; K3'te doğrusu üçüncü; her karta "neden?" etiketi | → `summary` |
| `summary` | Tek cümlelik özet; sunucuya `complete` | → `rewarded` |
| `rewarded` | `+60 XP`, "DOSYA KAPANDI" (`revealEnding`), sonraki bölüm kancası | — |

- **Başarı koşulu (sunucuda yeniden hesaplanır):** Mail 1'de B yolu veya A/C sonrası düzeltme; `evidence`'ta ≥1 çekirdek kanıt; `classify`'da 3'ten ≥2 doğru (yalnız eksik kart tekrarlanır). XP bir kez; ipucu XP düşürmez; anahtar `mission:<userId>:<id>` (`award()` `idempotencyKey`).
- **İki ipucu** ("İpucu (2 kaldı)", otomatik açılmaz): "Ad güzel görünür. Adrese bak." (gönderen vurgusu) → "Bu adres, yer imindeki okul adresiyle aynı mı? Yan yana koy." (karşılaştırma paneli açılır).
- **Mobil:** hover yok; hedef adres alt sayfada (bottom sheet); mail tam ekran; <480px veya "Basit görünüm"de tek ekran–tek soru; sürükle-bırak yok; etiketler `role="checkbox"`, sonuçlar `aria-live="polite"`.
- **Teknik akış:** `POST /api/academy/missions/[id]/check` (adım geri bildirimi; cevap anahtarı istemciye gitmez; durumsuz, hız sınırlı) · `POST …/complete` (`db.$transaction(…, XP_TX)` içinde yeniden doğrulama, `award(tx, { ruleKey: "mission.complete" })`, `recordActivity`) · `defaults.ts`'e `mission.complete` = 60 (`/admin/xp`'ten düzenlenir) · enum göçü olmasın diye `source: "LESSON"`, `refType: "Mission"` [VARSAYIM: `MISSION` enum'u göç gerektirir] · bu derste `CompleteButton` yerine `MissionRunner`.

**Dört başka tarayıcı içi mini görev**

| # | Görev | Tür | Özet | Sınır |
|---|---|---|---|---|
| 1 | Fotoğrafın sakladığı | Bireysel, dijital iz | Kurgusal "kampüs kedisi" fotoğrafının sentetik metadata kartı; konumu ele veren alanı bul, silinecekleri seç | Gerçek EXIF ayrıştırma/dosya yükleme yok |
| 2 | Şüpheli QR | Bireysel | Çizilmiş, taranamayan QR; "İçeriği göster" `…example`; güven/sahte/doğrula | Kamera yok |
| 3 | Gece 03:12 logları | Bireysel, log | 8 log kartı (IP'ler `203.0.113.x` TEST-NET); zaman çizelgesi; "14 başarısız + 1 başarılı" kalıbı | Mobilde yukarı/aşağı düğmeleri |
| 4 | Kayıp dosya, sahte masaüstü | Yıllık kulüp etkinliği | Kurgusal "Deniz"in 5 simgeli masaüstü; 3 kişilik takımlar oda başına ipucu bulur, ortak zaman çizelgesi; eğitmen konsolu ipucu sayısı | Takım görevi + `/live`; toplu skor ekranı yeni geliştirme [VARSAYIM] |

**P0 risk:** "Gönderen ▾" paneli keşfedilmezse görev tahmine döner (hover'a dayalı tasarım dokunmatikte çalışmaz). Eşit ciddi ikinci risk: simülasyon girişinde gerçek parola kutusu olursa öğrenci gerçek parolasını yazabilir.
**Kabul testi (yapılmadı):** 5 gerçek, 0 bilgili öğrenci, telefonda, ipucusuz — ≥4/5 gönderen ayrıntısını 60 sn'de açar. Güvenlik: `MissionRunner` çıktısında `input[type=password]` ve `a[href]` yok (birim testi). Sunucu: iki kez `complete` → ikinci XP yazılmaz; cevap anahtarı hiçbir ağ yanıtında yok.

**İtirazlar (öngörüsel):** underground-storyteller — ilk dokunuş ≤10 sn; anlatı etkileşimin içinde. gamification-economy — hız/"ipucusuz" bonusu olmasın; ipucu cezası 0 bilgiliyi takılı bırakır. elite-ui-director — posta ekranı neon/koyu "hacker" değil, gerçeğe yakın açık/krem; marka token'ları (mor başlık, yeşil CTA) çerçevede, posta gövdesinde değil. technical-architect — genel sahne motoruna karşı; 5 adım tipiyle başla.

**Karar**
- `MissionRunner` + `::gorev`: **Değiştir** ("Okudum, tamamla"nın yerine; quiz'in değil), **P0.**
- Sahte Kampüs Bursu görevi: **Koru** (bu spesifikasyonla), **P0.**
- Mini görev 3 (loglar), 1 ve 2 (fotoğraf, QR): **P1.**
- Kulüp etkinliği (Kayıp dosya): **P2** (canlı mod + takım görevi altyapısına bağlı).
- Görev içeren derslerde okuma-tıkla XP'si: **Çıkar, P1.**

---

### 11 · club-live-experience

**Okunan dosyalar:** `server/live/hub.ts`, `hooks/useLiveSession.ts`, `live/[code]/LiveViewer.tsx`, `teach/live/[id]/HostConsole.tsx`, `components/live/Poll.tsx`, `styles/presentation.css`. [K] kodla doğrulandı / [V] varsayım; tarayıcıda çalıştırılmadı.

**Kusurlar (rapordaki 7 bulgudan; ilk üçü ana kusur)**
1. **B1 — Projeksiyon geç gelen için işlevsiz.** [K] `?present=1`'de üst/alt çubuk `display:none` (`presentation.css:97`); kod ve QR yalnız eğitmen konsolu yan panelinde; sahne `100vh*16/9`'a büyüyüp `.live-dock`'u (quiz, uygulama molası) ekran dışına itiyor; quiz seçenekleri 14,5px, duyuru 16px (arka sıradan okunmaz).
2. **B2 — Kopma/yeniden bağlanma güven vermiyor.** [K] `reconnecting`'de tüm sahneye perde; `presence` yalnız çevrimiçi sayı (eğitmen gitti mi bilinmiyor); istemcide canlılık kontrolü yok, `visibilitychange` yalnız `ws.current` boşsa bağlanıyor [V: yarı açık soket "Canlı" yazıp eski slaytı gösterebilir]. **Sessiz donma:** `if (m.v <= vRef.current) return` yeniden bağlanınca ilk durum mesajını da eliyor; `stateVersion` 250ms gecikmeli yazılıyor → çökme/OOM sonrası öğrenci eğitmen birkaç slayt ilerleyene kadar eski ekranda. Mevcut test (`live-hub.test.ts:181`) bunu görmüyor; istemci kancası için test yok.
3. **B3 — Başlangıç ve bitiş boşlukları.** [K] Lobi yok (erken giren slayt 1'i görüyor); bitiş yalnız "Ana sayfaya dön", XP yazmıyor; `hub.end()` açık quizi sessizce `CLOSED` yapıyor, XP yalnız `revealPoll`'da — eğitmen açıklamadan bitirirse doğru cevaplayanlar XP'siz kalıyor, arayüz ise "Doğru cevap XP kazandırır" diyor; otomatik kapanma yok, unutulan oturum sonsuza dek "Şu an canlı".
- *Diğer bulgular:* **B4** yavaş/geç katılan çaresiz (`freeNav` ikili; "yetişemedim" sinyali yalnız el kaldırma/soru [V: utandırır]; duyuru 12 sn'de kaybolur, yeniden bağlanana gönderilmez; canlı farkındalığı yalnız `/dashboard` ve `/live`'da). **B5** quiz cevabı sessiz kaybolabilir (`send()` dönüşü yok sayılıyor, `ack` işlenmiyor, `reconnecting`'de seçenekler aktif; çift tıkta hata toast'ı). **B6** görev/dosya paylaşımı konsolda yok (yalnız uygulama molası ve 300 karakterlik duyuru). **B7** `.dot.on`/`.conn[open]` `--color-arterial-red` kullanıyor, koyu temada neon yeşile eşleniyor (`globals.css:132`) — "yeşil yalnız eylem" kuralına aykırı.
- **Doğrulandı:** bireysel mod canlıdan bağımsız (`canUseAcademy` yalnız `status === ACTIVE`; XP, ilerleme, canlı oturum ayrı kayıtlar; öğrenci ikinci sekmede ders çalışabilir). Eksik: sunum ile akademi dersi arasında bağlantı.

**Fikirler**
1. **Açık yaşam döngüsü ve bağlantı dili (P0/P1):** `LiveState`'e `phase: "lobby"|"live"|"break"|"ended"` + `resumeAt`; `presence`'e ayrı `hostOnline`; sunucu açılışında `epoch` (`welcome` içinde); istemci epoch değişince veya her yeni bağlantının ilk `state`'inde `vRef`'i sıfırlar. Perde yerine ince şerit: "Bağlantı koptu. Son slayt ekranda (12/31). Gelince otomatik eşitleniriz." · "Eğitmenin bağlantısı koptu. Ders durmadı, birazdan devam eder." · Lobi: "Odadasın ✓ 23 kişi burada. Ders 14:00'te başlıyor. Beklerken 3 dakikalık mini göreve bak →". Şerit `aria-live="polite"`, renk yerine ikon; yeşil yalnız "Devam et".
2. **Anonim "Takıldım / Yetiştim" nabzı + "Geri bak" (P1):** iki hap düğme, mesaj tipi `pulse`, 1/30 sn; eğitmende yalnız toplam ("7 kişi 'Takıldım' dedi (son 2 dk)"), 2 dk'da söner, ad yok. "Geri bak" varsayılan açık, yalnız canlı ve önceki slaytlar; `freeNav` yalnız ileriyi açar; çubuk "Eğitmen şu an 14. slaytta. [Canlıya dön]". Yeniden bağlanan "Son duyuru" rozetiyle görür. Sinyal XP vermez.
3. **Projeksiyon düzeni ve eğitmen konsolu (P0/P1):** sağ altta sabit "katıl" rozeti (QR + 6 haneli kod, sahnenin %10'u); quiz/duyuru sahne üzerine `cqw` ölçekli, gövde ≥28px, Lexend Tera yalnız başlıkta. Konsol: sol "Şimdi" + tek yeşil **İleri** + slayt şeridi; sağ sekmeler Katılımcı/Sorular/Quiz; alt "Oturum rafı" (mevcut dosya/görevi tek tıkla iliştir; öğrencide "Bu derste: 2 dosya, 1 görev"). "Dersi bitir" iki adımlı kontrol listesi: "42 bağlı. Açıklanmamış quiz var: [Açıkla ve bitir]. 3 açık soru…".
4. **Bitişten bireysel moda köprü (P1):** "Ders bitti. +25 XP işlendi. Bugünün konusu: Sahte Mesajlar. Evde devam: **Şüpheli Mesaj** (6 dk) [Devam et]…"; sunum bloğuna isteğe bağlı `akademi: lesson-slug`.

**Ekranlar:** *Öğrenci* — üstte kod + bağlantı şeridi, ortada sahne, altta El kaldır · Soru sor · Takıldım · Geri bak · Rafım; quiz alt çekmecede, bağlantı yokken pasif ("Bağlantı yok, cevabın gönderilmedi"). *Projeksiyon* — yalnız sahne, katıl rozeti, quiz, duyuru; imleç gizli; bağlantı sorunu küçük nokta. *Eğitmen* — Ö3 konsolu; önizleme yalnız eğitmende; sinyal/el/soru tek "dikkat" rozetinde. *Admin* — aktif oturum tablosu (kod, eğitmen, çevrimiçi, son hareket, denetim kayıtlı "Zorla bitir"); 4 saat hareketsiz otomatik bitiş; tek "kontrol sahibi" bayrağı ve devir (şimdi birden çok host'ta son yazan kazanıyor).

**Durum diyagramı (özet):** `YOK → LOBİ → CANLI ⇄ MOLA(resumeAt)`; öğrenci soketi düşerse `KOPTU (şerit) → YENİDEN BAĞLANIYOR (0,5–10 sn, jitter) → welcome+epoch+state (ilk state her zaman kabul) → CANLI`; host düşerse `hostOnline=false` şeridi; 4 saat hareketsiz → otomatik BİTİŞ; `Dersi bitir → BİTİŞ (kontrol listesi) → ended`; koparken oturum bitmişse HTTP 404 (3. denemede) → BİTİŞ; BİTİŞ → bitiş kartı (+XP, "Evde devam") → BİREYSEL MOD (aynı hesap, aynı ilerleme).

**P0 risk:** Öğrenci "Canlı" görürken eski slaytta donuyor (B2) — güveni en hızlı bitiren hata.
**Kabul testi (5 istemci, 1 eğitmen, gerçek soket):** (1) sunucu `kill -9` + yeniden başlat, eğitmen 3 kez ileri → tüm istemciler ≤3 sn'de aynı slayt/adım; (2) telefon 60 sn kilit → ≤2 sn eşitleme, yoksa şerit; (3) eğitmen ağı 30 sn kesik → "eğitmen bekleniyor" şeridi, slayt okunur; (4) 16:9 projektör emülasyonunda quiz ve katıl rozeti kaydırmasız; (5) açıklanmamış quizle bitir → uyarı; "Açıkla ve bitir" doğrulara XP. Gerçek öğrenciyle: nabız düğmelerini anlama, "Rafım"ın bulunabilirliği (test edilmedi).

**İtirazlar (öngörüsel):** gamification-economy — "10 dk soket açık" kuralı arka plan sekmesini ödüllendirir; ≥1 etkileşim şart; nabız/el kaldırma XP vermesin. interactive-mission — senkron sahnede yalnız ≤60 sn ortak karar; uzun görev "Evde devam"a. elite-ui-director — projektörde koyu, düşük kontrastlı sinematik sahneye karşı; odada ışık var, mor/krem + yüksek kontrast yeterli. technical-architect — "`stateVersion` kalıcı, yeter" savına karşı; 250ms gecikmeli yazım çökmeyi kapsamıyor, `epoch` zorunlu.

**Karar**
- **Koru:** sunucu otoriteli sürümlü durum, zod doğrulama, hız sınırları, sunucu saatli quiz, öğrenciye ad listesi göndermeme, bireysel modun bağımsızlığı.
- **Değiştir P0:** `epoch` + ilk durumu her zaman kabul, canlılık denetimi, host kopma göstergesi, projeksiyon katıl rozeti + ölçekli quiz, quiz cevap geri bildirimi, bitirme öncesi kontrol listesi.
- **Değiştir P1:** lobi ve mola, nabız + geri bak, bitiş köprüsü, otomatik oturum kapanması, durum noktasından yeşili çıkarma.
- **Değiştir P2:** oturum rafı, soruyu anonim projeksiyona alma, tek kontrol sahibi ve devir.
- **Çıkar:** tam ekran "Bağlantı koptu" perdesi; 12 sn'de kaybolup dönmeyen duyuru.

---

### 12 · motion-visual

**Okunan dosyalar:** `.claude/agents/motion-visual.md`, `00-current-state.md`, `MASTER_PROMPT.md`, `TASARIM-SISTEMI.md`, `EXAMPLE_LESSON.md`, `content/academy/GORSELLER.md`, `FlowAnimationView.tsx`, `Markdown.tsx`, `academy.css`, `globals.css`, `presentation.css`, ilgili ders dosyaları. Dosya değiştirilmedi.

**Kusurlar**
1. **Görsel hattı yarım ve ilk izlenimi bozuyor.** [K] `GORSELLER.md`: 229 görselin 15'i hazır, 214'ü bekliyor; hazırların hepsi portre, tek ders sahnesi yok. Eksikte kesik çizgili kutu (`academy.css:79-81`, `.md-img-missing`). Her ders sahne + DOSYA portresiyle açılıyor (m04-01, m05-01) — ilk ekranda iki görsel, içerik yok.
2. **Görsel stil markayla çelişiyor.** [K] Promptlar bordo, amber-sepya, "1940s film noir", Midjourney `--v 7`; arayüz mor/neon yeşil/krem. [V] Üretilen sahneler kartların yanında yabancı duracak (henüz sahne üretilmedi). Kodda eski noir izleri: `--gold` (mora yönlendirilmiş, `globals.css:64`), `--color-arterial-red`.
3. **Animasyon motoru sağlam ama tonlar yalnız renkle ayrışıyor, içerik ağır.** [K] İyi: `FlowAnimationView` reduced-motion (WAAPI atlanıyor, `pulse` kapalı), SVG `role="img"` + `<title>`, adım notu `aria-live="polite"`. Kusur: istek/yanıt/güvenli/bilgi okları yalnız renkle ayrılıyor (çizgi biçimi yalnız saldırıda kesikli); `dns-resolution` 5 aktör, 8 adım, notlarda "stub resolver", "TLD", "referral", "DNSSEC" (M05'in 5. sayfası için yoğun). [V] `Label` genişliği 7,2px × karakter (≤380) kenar aktörlerde 800px viewBox'tan taşabilir.
- *Ek:* `Markdown.tsx:47` `<img>`'de `width/height` yok, yalnız `loading="lazy"` → üstteki görselde CLS.

**Fikirler**
1. **Ders başına ≤1 görsel ve karar tablosu:** 5 tür `ekran`, `ai`, `diyagram`, `animasyon`, `yok`; AI yalnız soyut kavramlarda (hukuk, gizlilik, dijital iz) → ~40 sahne (187 değil). Frontmatter `tur:`. Görsel hazır değilse bileşen hiç çizilmez.
2. **"Mor Mürekkep" tek AI stili:** prompt sabiti *deep violet #5C1FE2 shadows, cream #FFFCF2 highlights, single neon green #17FF74 accent, soft grain, no text*. Yükleme: WebP, 1280px, ≤120 KB, 640px `srcset`, `width/height`, ~20px LQIP, üst görselde `loading="eager"`. `navigator.connection.saveData` açıksa alt metinli kısa kart.
3. **Animasyon oynatıcısı "Kolay / Tam mod" + hareket tercihi:** `Sıradaki adım ▸` · `Baştan oyna ↻` · `Hareketi azalt` (OS tercihini devralır, `localStorage`); altyazı `2/4 · Rehbere soruyorsun: "ornek.edu.tr nerede?"`; `Ayrıntıyı aç (8 adım, ileri seviye)`. Ok etiketleri renkten bağımsız (`İSTEK` / `YANIT` / `⚠ SALDIRI` / `🔒 GÜVENLİ`; dolu uç / boş ince uç / kesikli kalın). XP: `+60 XP` 600ms sayaç (reduced-motion'da anında); doğru kararda gönderen alanında tek mor halka (300ms).

**Somut ekran (m01-05):** e-posta bileşen olarak çizilir — `Burs Ofisi <onay@scholarship-campus.example>`; `Bağlantıya tıkla · Göndereni kontrol et · Önce başka kanaldan doğrula`; "Göndereni kontrol et"te benzer harfler sarı vurgu + "İyi bakış. Okulun adresiyle yan yana koy: hangi harf farklı?"; yanlışta "Çoğu kişi buradan tıklar. Bu kez gönderene bak."

**Beş ders için görsel kararı** (ortak: AI görselde yazı yok, marka/gerçek uygulama logosu yok, 16:9, WebP ≤120 KB; ekran görüntüsünde kişisel veri ve profil yok)

| Ders | Karar | Gerekçe | Not |
|---|---|---|---|
| m01-05 Sahte Burs | **Görselsiz** (etkileşimli e-posta maketi kodla) | Görsel öğrenme anının kendisi; hero sahne çıkar | Yol kartı kapağı için isteğe bağlı prompt (gece yurt masasında laptop, okunamaz bildirim kartı, mor ışık, yazısız); alt: "Gece yurt masasında açık laptop; ekranda bulanık bir bildirim kartı." |
| m02-02 KKTC bilişim suçları ve kişisel veri | **Özgün AI görseli** | Hukuk soyut; terazi "yetki–sorumluluk dengesi" | Prompt: pirinç terazi, bir kefede parlayan kilitli veri küpü, diğerinde kapalı kanun kitabı; bayrak/arma/kişi yok. Alt: "Terazinin bir kefesinde kilitli veri küpü, diğerinde kapalı kanun kitabı; terazi dengede." Ders başı, ≤960px |
| m05-01 İnternet nedir | **Diyagram** (statik SVG) | LAN/WAN bir sınır çizgisi; diyagram daha az hata verir | Mor kesikli "SENİN AĞIN (LAN)" / "DIŞ DÜNYA (WAN)"; tıklayınca cihaz kartı; Türkçe gerçek metin; kapak promptu izometrik mahalle benzetmesi |
| m05-05 DNS, DHCP, ARP, ICMP | **Animasyon** (mevcut `dns-resolution`, iki kademe) | DNS bir sıra; hareket sırayı gösterir | Kolay mod 4 adım (sorarsın → rehbere gider → adresi bulur → sana döner); 8 adım "Derinleşme"; yardımcılar tablosu statik; kapak: dört yardımcı robot |
| m06-02 HTTP istek/yanıt | **Ekran görüntüsü** (DevTools, `example.com`) | Öğrencinin kendi tarayıcısında yapacağının birebiri | Yalnız Network paneli; ① yöntem ② durum kodu ③ yanıt başlıkları; 1600×900. [V] DevTools sürümle değişir → 3 satır yazılı adım + sürüm/tarih notu; fırın metaforu kapağa taşınır |

**P0 risk:** Görsel hattı bitmeden yayın: kesik çizgili boş kutular, markayla uyuşmayan sahneler, ilk ekranda ağır görsel. [S] "Yarım site" hissiyle ilk derste çıkma ihtimali yüksek.
**Kabul testi:** (1) 375px + hızlı 3G, M01 ilk ders: kesik kutu yok, ilk görünür içerik ≤2 sn, CLS <0,1; (2) her `<img>`'de `alt`, `width`, `height`; (3) `prefers-reduced-motion: reduce`'da >0,2 sn hareket yok, "Hareketi azalt" uygular; (4) protanopia/deuteranopia simülasyonunda oklar biçimle ayırt edilir; (5) canlıda 2 geç istemci aynı adım numarasına düşer, hareket yerel oynar.

**İtirazlar (öngörüsel):** elite-ui-director — hero animasyonu, parallax, Lottie girişine karşı (8 GB VPS, düşük cihaz). underground-storyteller — her sayfaya portre + sahneye karşı; DOSYA bölümde bir kez. club-live-experience — tüm istemcilerde senkron otomatik oynatmaya karşı; senkron olan adım numarası, hareket yerel (bugünkü kod zaten böyle ve doğru).

**Karar**

| Konu | Karar | Öncelik |
|---|---|---|
| Eksik görsel kutusunu gösterme, `width/height`, hero eager, LQIP, saveData | Değiştir | **P0** |
| "Ders başına 1 görsel" ve `tur:` alanı | Değiştir | **P0** |
| AI stilini mor-krem paletine kilitle (~40 sahne) | Değiştir | P1 |
| `FlowAnimationView` reduced-motion ve `aria-live` mimarisi | Koru | P1 |
| Renkten bağımsız ok etiketleri, Kolay/Tam mod, "Hareketi azalt" | Değiştir | P1 |
| Her derste hero sahne + portre çifti | Çıkar | P1 |
| Eski `--gold` / `arterial-red` adları | Değiştir (yeniden adlandır) | P2 |
| Kahraman animasyonu, parallax, Lottie | Çıkar | P2 |

---

### 13 · accessibility-simplicity

**Kaynak:** `src/styles/*.css`, `AppShell.tsx`, `LessonActions.tsx`, `Poll.tsx`, `LiveViewer.tsx`, `FlowAnimationView.tsx`, `LessonAnimation.tsx`, `Field.tsx`. [KOD] / [HESAP] (elle kontrast) / [VARSAYIM]. Gerçek kullanıcı veya ekran okuyucu testi yok; kontrastlar axe/Lighthouse/WebAIM ile doğrulanmalı.

**Kusurlar (dokuz bulgu, etki sırasıyla)**

| # | Bulgu | Kanıt | Öncelik |
|---|---|---|---|
| B1 | Koyu sahnede odak halkası görünmez | `--focus`, `.btn:focus-visible` `rgba(46,46,46,.6)` (globals.css:97, 156, 221); `.stage/.live-shell/.theme-dark` zemini `#2E2E2E/#333`; oran ~1:1 [HESAP]; §8 "koyu zeminde yeşil" uygulanmamış. WCAG 2.4.7, 1.4.11 | **P0** |
| B2 | Quiz geri bildirimi ekran okuyucuya ve renk körüne eksik | `LessonActions.tsx:108` ikon `aria-hidden`, metin "Doğru/Yanlış" demiyor, tek gösterge kart kenarı rengi; `scrollIntoView({behavior:"smooth"})` (63) ve `scrollTo` (74) reduced-motion'ı yok sayıyor; eksik cevap uyarısı yalnız 4–7 sn'lik `polite` toast, odak soruya gitmiyor | **P0** |
| B3 | Canlı quiz/anket kartı zayıf | `Poll.tsx:52` tüm `<section>` `aria-live`, geri sayım 250ms'de yenileniyor (okuma gürültüsü); tek seferlik cevap, onay/geri alma yok (82); süre (20–300 sn) uzatılamıyor (WCAG 2.2.1); `PollBars` ikonunda `role="img"` yok (33); "El kaldır" hem `aria-pressed` hem değişen etiket (`LiveViewer.tsx:138-139`); duyuru `role="alert"`, 12 sn'de kapanıyor | P1 |
| B4 | Lexend Tera + büyük harf + -0.12em | Her `h1–h6` ve `.poll-q` (globals.css:162, presentation.css:149) — uzun quiz sorusu da büyük harf; [VARSAYIM] disleksi/düşük görmede yavaşlatır; `swap` sırasında Helvetica da -0.12em ile çiziliyor (harfler biner); Türkçe İ/Ş/Ğ/Ü `line-height:1.04–1.12` ile kırpılabilir (test edilmedi); WCAG 1.4.12 testi yapılmadı | P1 |
| B5 | Kontrast boşlukları [HESAP] | Form kenarı `ink-40` beyazda ~2.3:1 (3:1 gerekir); `--lab-border #3A3170` `#15112B`'de ~1.6:1; lab odak moru `#5C1FE2` koyu lab zeminde ~2.4:1; `.cta-link` magenta ucu (`#ED04FA`) beyazda ~3.5:1, `color:transparent` nedeniyle Yüksek Karşıtlık modunda kaybolur; hiç `forced-colors` kuralı yok (`.cta-link` henüz kullanılmıyor) | P1 |
| B6 | Gezinme ve odak yönetimi | `AppShell.tsx:56-58` Esc'de odak tetikleyiciye dönmüyor; marka linki `aria-label="Ana sayfa"` görünür metinle uyuşmuyor (98; 2.5.3); `Field.tsx:12` hata çıkınca `hint` siliniyor (parola kuralı kayboluyor) | P1 |
| B7 | Terminal denetimleri yalnız hover'da | §5.14 "varsayılan gizli, hover/odakta belirir" — dokunmatikte bulunamaz; henüz uygulanmadığı için önlenebilir | P1 |
| B8 | Çift anons | `FlowAnimationView` ve `LessonAnimation` figcaption'ları ikisi de `aria-live`; 900px altında aynı not iki kez okunur (academy.css:121) | — |
| B9 | Canlı slayt değişimi okunmuyor | `SlideView` yalnız `aria-label` (132); [VARSAYIM] başka canlı bölge grep ile bulunmadı | — |

**Fikirler**
1. **Kapsam bazlı odak ve kontrast token'ları (P0):**
   ```css
   :root{--focus-ring:#2E2E2E;--field-border:var(--ciu-ink-60);}
   .stage,.live-shell,.theme-dark,.lab{--focus-ring:#17FF74;--field-border:#8E86AD;}
   :focus-visible{outline:3px solid var(--focus-ring);outline-offset:2px;box-shadow:0 0 0 5px var(--bg-0);}
   .input,.select,.textarea{border-color:var(--field-border)}
   @media (forced-colors:active){.cta-link{color:LinkText;background:none;-webkit-text-fill-color:currentColor}.btn{border:2px solid ButtonText}}
   ```
   Dış `box-shadow` halkası açık/koyu komşu zeminde ayrışma sağlar; neon yeşil yalnız koyu zeminde odak ve eylem (ink üzerinde ~10:1 [HESAP]), beyaz zeminde metin/kenar olarak yok.
2. **Ekran okuyucu dostu quiz sonucu:** `<fieldset aria-describedby>` + `<legend>`; açıklamada `<span class="sr-only">Yanlış cevap. </span><strong>Yanlış.</strong> Doğrusu: …`; gönderince `#quiz-result` başlığına `tabIndex={-1}` + `focus()`; `scrollIntoView` reduced-motion'da `'auto'`; cevapsız soru varsa toast yerine form üstünde `role="alert"` özet ve odak ilk eksik `fieldset`'e.
3. **Canlı quiz kartı:** görsel sayaç `aria-hidden`; yalnız 30/10/0 sn eşiklerinde sr-only `role="status"` ("Kalan süre: 10 saniye."); seçenek seçer, ayrı "Cevabımı gönder" gönderir, 5 sn "Geri al"; `aria-live` yalnız "Cevabın alındı…" paragrafında; eğitmen panelinde "+30 sn ver"; "El kaldır"da sabit etiket + `aria-pressed` ya da yalnız değişen etiket.
- **Ek kısa öneriler:** Lexend Tera yalnız ≤6 kelimelik görsel başlıklarda (`.page-title`, `.display`); `.poll-q`, `.md h2`, soru metinleri Readex Pro 500, cümle düzeni, `letter-spacing:0`; -0.12em yalnız `html.fonts-ready` altında (yedek fontta -0.02em). `AppShell` Esc'de `triggerRef.current?.focus()`; marka `aria-label="{kulüp adı} – ana sayfa"`; `Field` `aria-describedby` hem hint hem hata. Terminal `@media (hover:none){.ciu-terminal-controls{opacity:1}}`, kopyalamada "Kopyalandı". Çift anonsta tek kaynak (`lesson-anim-note`). Canlıda gizli `role="status"`: "Slayt 5/12: {başlık}" (800ms debounce, serbest gezinmede kapalı).
- **Sözlük ve A2 İngilizce:** `<abbr title>` dokunmatikte açılmaz → `<button aria-expanded>` ile 1 cümlelik "Nedir?" kutusu; TR "OSINT: herkesin görebileceği kaynaklardan bilgi toplama." / EN A2 "OSINT means finding facts from public sources."; sayfa başına ≤3 terim.

**P0 risk:** Klavye/ekran okuyucu kullanan öğrenci canlı derste (koyu sahne) odağı göremez, slayt/quiz değişimini duyamaz; kulüp onu sessizce kaybeder (B1 + B3 + B9).
**Kabul testi (elle, 15 dk; Tab + NVDA/VoiceOver, %200 yakınlaştırma, Yüksek Karşıtlık):** (1) `/live/[code]`'da her odakta ≥3:1 halka; (2) slayt ilerleyince ≤1 sn'de "Slayt n/N: başlık"; (3) geri sayım saniyede bir değil, 10 sn'de bir kez; onaylı gönderim; (4) hatalı soruyla gönderimde odak sonuç başlığına, "Yanlış cevap" okunur; (5) Lighthouse erişilebilirlik ≥95, axe kritik/ciddi 0; (6) reduced-motion'da kaydırma ve paket animasyonu anlık; (7) Tur 4: 1–2 klavye/ekran okuyucu kullanan gönüllü (yapılmadı).

**İtirazlar (öngörüsel):** elite-ui-director / underground-storyteller — koyu tema ve büyük harf başlık markada kalabilir; uzun metin, quiz sorusu, ipucu büyük harf/Tera olmasın; atmosfer "GİZLİ/KAPANDI" etiketiyle. motion-visual — her animasyonun durdurulabilir metin eşdeğeri, otomatik oynatma yok; yeni hareket aynı reduced-motion kuralına uysun. gamification-economy — süre baskısı erişilebilirliği ve 0 bilgiliyi zorlar; süre uzatma, "puan yarışı değil öğrenme" modu.

**Karar**

| Alan | Karar | Öncelik |
|---|---|---|
| Marka (mor, neon yeşil, krem, Tera + Readex); yeşil yalnız eylem ve koyu zeminde odak | Koru | P2 |
| Koyu zemin odak halkası; quiz ve canlı sonuç bileşenleri (B1, B2) | Değiştir | **P0** |
| Canlı quiz kartı (B3), slayt anonsu (B9), menü odak dönüşü (B6) | Değiştir | P1 |
| Uzun metin ve soru metninde büyük harf + Tera + -0.12em | Çıkar (yalnız kısa başlıkta) | P1 |
| Form/lab kenar kontrastı, forced-colors, `.cta-link` | Değiştir | P1 |
| Terminal denetim görünürlüğü (§5.14 öncesi) | Değiştir | P1 |
| Jargon sözlüğü ve A2 İngilizce | Ekle | P2 |

---

### 14 · student-ux-research

**Etiketler:** [Kod], [Envanter] (00-current-state'ten, kodda ayrıca doğrulanmadı), [Varsayım]. Üç persona (sıfır bilgili, meraklı, sabırsız) uzman yorumudur, gerçek veri değil. Okunan: `dashboard/page.tsx`, `academy/lesson/[slug]/page.tsx`, `live/[code]/LiveViewer.tsx`, `i18n/tr.ts`.

**Kusurlar**
1. **B1 — İlk iki kart boş, birincil eylem üçüncü sırada.** [Kod] Sıra: galaxy → Görevler → Duyurular → Akademi ("Başla"); ilk gün "Bekleyen görevin yok.", "Henüz duyuru yok."; "Kalkan dosyan" ve "Üyelik" ("Son giriş…") işe yaramaz. [Varsayım] 30 sn'de "yapacak bir şey yok"; telefonda Akademi ekran altı.
2. **B2 — Onay bekleyen için çıkmaz sokak.** [Kod] `tr.ts`: "Başvurun alındı / … Onaylandığında aynı bilgilerle giriş yapabilirsin." Süre yok, beklerken yapılacak şey yok, platformun ne olduğu açıklanmıyor; kök girişte yalnız `/login`. [Varsayım] Çoğu öğrenci geri dönmez.
3. **B3 — Canlı kopma ve bitiş yönlendirmiyor.** [Kod] `LiveViewer.tsx` sahneyi kaplayan "Bağlantı koptu, yeniden bağlanılıyor…"; zaman aşımı, alternatif eylem, "kaç slayt kaçırdım" yok; `error`'da yalnız "Bağlantı hatası"; geriye bakış yalnız `freeNav` açıksa; bitişte yalnız "Ana sayfaya dön" (envanter madde 8).
- *Diğer:* **B4** ders sayfasında eylem sonda; başlıkta "M01 · 1/11" kodu; tamamlama kaybolan toast ("Ders tamamlandı. +XP"); quiz'de "N soru cevapsız" toast'ı [Varsayım: kaydırmayı bırakan etkileşime ulaşmaz]. **B5** jargon ve oryantasyon eksiği; "Derse katıl" "6 haneli kod" diyor ama kodun nerede çıktığını yalnız QR ile anlatıyor.

**Fikirler**
1. **İlk-5-dakika ana sayfası (P0):** 0 dersteki öğrencide Görevler/Duyurular/Üyelik/XP tek "Kulüp" şeridine çöker ("Görevler 0 · Duyurular 1 · Kodla canlı derse katıl"); üstte galaxy kart, neon yeşil düğme + `--ciu-ink` metin, Lexend Tera başlık (≤6 kelime). Metin: "Merhaba, Ayşe. İlk görevin hazır." · "5 DK · BİLGİ GEREKMEZ" · "ŞÜPHELİ MESAJ: SAHTE KAMPÜS BURSU" · "Burs onaylanmış, ama mesaj senden hemen şifre istiyor. Sence neden?" · [Göreve başla →] · "Bu platform ne? (30 sn)". İlk ders bitince normal ana sayfa.
2. **Onay bekleme odası (P0):** "Başvurun alındı. Genelde 1–2 gün sürer. [kulüp kendi süresini yönetimden yazar]. Beklerken platformun nasıl çalıştığına bak." + hesapsız, XP'siz, kayıt tutmayan 2 dk'lık "Tadımlık görev" (sahte e-posta kartı; kullanıcı verisi toplamaz). Yönetimde onay politikasında bekleme süresi ve iletişim kanalı alanı.
3. **Canlı kopma/dönüş ve bitiş köprüsü (P1):** ince şerit "Bağlantın koptu. Son gördüğün: slayt 7. Yeniden deniyorum…" [Tekrar dene]; 15 sn sonra "Mobil veriye geçmeyi dene."; dönüşte kalıcı mini kart "Geri döndün. Eğitmen şu an 11. slaytta, sen 3 slayt kaçırdın." [Canlıya git] [Kaçırdıklarıma bak] (yalnız `freeNav` açıkken); bitiş "Ders bitti. Bugün: DNS nasıl çalışır? (+25 XP)" [Kaldığın derse dön: HTTP'ye giriş] [Bu dersin görevi (1 bekliyor)].
- **Ö4 (P1):** başarı anını toast'tan çıkar — ortada kalıcı kart "+60 XP. Seviye 2'ye 40 XP kaldı." [Sıradaki: Parolan gerçekten güvenli mi? (4 dk)]; "Kalkan dosyan" yerine ilk haftada "XP ve seviyen" (hikâye rozet adlarında sürer). **Ö5 (P2):** ders başlıklarını 6 kelimeyle sınırla, 5 sn testinde ölç [Varsayım].

**Gerçek öğrenci test protokolü (plan; sonuç yok)**
- **Katılımcı:** 6–8 gönüllü, farklı bölümler (ör. işletme, hukuk, mimarlık, eğitim, sağlık, 1–2 bilgisayar/yazılım); ≥5'i siber güvenlikte kendini 1–2/5; ≥3'ü telefonla; ≥2 kulüp üyesi olmayan; katılım ödülü sonuçtan bağımsız.
- **İzin/mahremiyet:** yazılı onay (amaç, süre, gönüllülük, çıkma hakkı, değerlendirme olmadığı, üyeliğe etkisizlik); katılımcı kodu P01…P08, eşleşme tablosu ayrı ve şifreli; test hesapları + sentetik veri, gerçek parola/e-posta yok; ekran/ses kaydı ayrı isteğe bağlı onayla, saklama önceden belirli (öneri: analiz sonrası silme, ≤30 gün); yüz kaydı yok; KVKK ve üniversite etik birimi önceden netleşir; moderatör eğitmen/değerlendirici değil, yönlendirmez.
- **Görevler:** (1) 5 sn ilk izlenim ("Bu ne için?", "Şimdi ne yapardın?", "Ne gördün?"); (2) 60 sn ilk görev (süre, yanlış tık, yardım isteği); (3) dersi bitirme (tamamlama, süre, bırakma noktası, SEQ 1–7, "Sıkıldığın an oldu mu?", eğlence 0–10); (4) kopan canlı oturum (30 sn Wi-Fi/uçak modu, geç katılım; doğru slayta dönüş süresi, "şimdi ne oluyor?", "sıradaki ne"); (5) aktarma (aynı oturumda ve 48–72 saat sonra yeni sahte mesaj; sınıflandırma + gerekçe). Ortak: SUS (Türkçe), görev başarısı, jargon listesi, hata etiketleri.
- **Geçme/kalma (öneri, önceden sabitlenir; n küçük, istatistiksel iddia yok):** 5 sn ≥5/6 amacı anlar · 60 sn ≥5/6 yardımsız başlatır, medyan ≤40 sn · ders ≥5/6 bitirir, süre ≤ yazılının 1,5 katı · canlı ≥5/6 ≤15 sn'de doğru slayta döner · aktarma ≥4/6 gerekçeyle doğru · SUS ≥68 yalnız uyarı eşiği · aynı ekranda >2 dk takılan ≥2 kişi veya aynı P0 hatayı yaşayan ≥2 kişi → ekran tamamlanmış sayılmaz · sıfır bilgili alt grup ayrı raporlanır.

**P0 risk:** Öğrenci ilk 60 sn'de (kayıt sonrası ya da ilk girişte) tek net şeyi bulamaz, ilk küçük başarı olmadan ayrılır.
**Kabul testi:** 6 sıfır/az bilgili öğrencinin ≥5'i yardımsız 60 sn'de ilk görevi başlatır; hiçbiri >2 dk aynı ekranda takılmaz; eşikler önceden yazılı sabitlenir.

**İtirazlar (öngörüsel; kimseye atfedilmiş karşı görüş değil):** elite-ui-director / motion-visual — galaxy hero değerli ama CTA 5 sn'de, hareket olmadan da fark edilmeli. underground-storyteller — ilk ekran eylemle başlasın, hikâye eylemin sonucunda. gamification-economy — ilk gün "#412 genel sıra" yerine kişisel ilerleme [Varsayım].

**Karar**

| Konu | Karar | Öncelik |
|---|---|---|
| İlk-5-dakika ana sayfası | Değiştir | **P0** |
| Onay bekleme odası + tadımlık görev | Ekle | **P0** |
| Canlı kopma/bitiş akışı | Değiştir | P1 |
| Kalıcı başarı kartı | Değiştir | P1 |
| Marka sistemi (galaxy/mor/yeşil, Lexend + Readex) | Koru | — |
| Ders başlığı uzunluğu | Ölç, sonra karar | P2 |

---

### 15 · product-admin

**Okunan dosyalar:** `teach/TeachHome.tsx`, `teach/tasks/TaskForm.tsx`, `groups/GroupsClient.tsx`, `prisma/schema.prisma`, `server/mail/outbox.ts`. [K] / [V]; gerçek eğitmen verisi yok.

**Kusurlar**
1. **Etkinlik kurmak dört ayrı yerde, parçalar bağlı değil.** [K] Sunum ve canlı ders `TeachHome`'da, sınıf/etkinlik `GroupsClient`'ta, görev `TaskForm`'da; `LiveSession`'da `groupId` yok — "Cuma CTF gecesi" (`ClassGroup` `EVENT`) ile o akşamki canlı ders ve görevler aynı şeye ait değil. `TaskForm` tek sayfada 5 kart, ~25 alan (tür, zorluk, takım, rubrik, XP kuralı…). [V] 3 dakika hedefi tutmaz (ölçülmedi).
2. **Hedef kitle ve üye yönetimi serbest metinle.** [K] Görevde "Seçili öğrenciler" ve `MembersEditor`'da kullanıcı adı yazılıyor; ipucu "Listede olmayanlar gruptan çıkarılır." — yazım hatası üyeyi sessizce atar; arama, çoklu seçim, CSV, alıcı önizlemesi yok.
3. **Kişisel veri yaşam döngüsü kodda görünmüyor.** [K] Toplananlar: `studentNumber`, `department`, `applicationNote`, `AuditLog.ip` (kalıcı), `Session.userAgent`, teslim metinleri/dosyaları. Yalnız `EmailOutbox` 30 günde siliniyor; IP, teslim, dosya saklama süresi, hesap silme, dışa aktarma, aydınlatma metni, açık rıza ekranı bulunamadı (`src` metin taraması). [V] Kod dışında belgede yapılıyor olabilir.
- *Ek:* **Yayın anı kör** — "Kaydet ve yayınla", toast alıcı sayısını sonradan söylüyor; "Öğrenci gözüyle önizle" yok; yönetim ve öğrenci görünümü aynı kabukta.

**Fikirler**
1. **"Hızlı Etkinlik" sihirbazı (`/teach/new`, P0):** etkinlik bir paket — `ClassGroup` (EVENT) altına sunum, canlı ders, görev, dosya; `LiveSession` ve `Assignment`'a `groupId`.

| Süre | Adım | Ekran |
|---|---|---|
| 0:00–0:45 | 1. Ne yapacağız? | Şablon kartları: "Phishing 60 dk", "Log okuma 60 dk", "Boş etkinlik"; seçince başlık, 3 slayt, 1 görev hazır |
| 0:45–1:45 | 2. Kim, ne zaman? | Başlık, tarih/saat, aramalı çoklu kitle seçimi ("Başlangıç A sınıfı (24 kişi)" ya da "Herkes"), isteğe bağlı yer |
| 1:45–2:45 | 3. Ekle (isteğe bağlı) | **+ Görev**, **+ Dosya**, **+ Hızlı soru**; "Gelişmiş ayarlar" kapalı |
| 2:45–3:00 | Özet ve yayın | Özet kartı + tek yeşil **Yayınla (24 kişiye bildirim)** |

   "Gelişmiş ayarlar" (rubrik, takım, geç teslim, özel XP) silinmez, katlanır; mevcut `TaskForm` bozulmaz. Ölçülebilir hedefler: ≤5 zorunlu alan (şablon, başlık, tarih, kitle, yayınla); dolu varsayılanlar ("geçen etkinlikteki sınıf", "bu cuma 18:00", "kural" XP); alan yanında hata; geri dönüşte veri kaybı yok, otomatik taslak.
2. **Yayın öncesi özet + "Öğrenci gözüyle" önizleme (P1):** "24 öğrenciye gidecek · Son teslim: Cuma 23:59 · Geç teslim: kapalı · XP: 120 · Dosya: 1 (tarandı: temiz)"; önizleme yönetim kabuğunu gizler, sabit bant **"Önizleme — öğrenciler bunu böyle görecek. [Kapat]"**.
3. **"Veri ve Gizlilik" merkezi (`/admin/privacy`, P0):** kayıtta kısa aydınlatma özeti + bağlantı; `/account`'ta **"Verilerimi indir"** ve **"Hesabımı sil / anonimleştir"**; admin saklama ayarları (öneri: denetim IP'si 90 gün, pasif/mezun 12 ay, teslim dosyaları dönem sonu + 6 ay — karar kulüp ve hukuk danışmanında). Silme penceresi: "Emin misin? — Adın silinir. Liderlik tablosundaki XP'n 'Silinmiş üye' olarak kalır. Bu geri alınamaz." **Vazgeç** (birincil, yeşil) · **Hesabımı sil** (ikincil, kırmızı çerçeve).

**KKTC / TR veri koruma uyum kontrol listesi (hukuk görüşü değil; üniversite hukuk birimi ve danışmanla teyit; KKTC güncel yasası ve KVKK 6698 metinleri doğrulanmalı; AB vatandaşı varsa GDPR [V])**
veri envanteri ve amaç/gerekçe (öğrenci no isteğe bağlı olabilir mi?) · veri sorumlusu (kulüp mü üniversite mi) · aydınlatma metni · açık rıza gerektiren işlemler için ayrı, işaretlenmemiş kutular (e-posta duyuruları, liderlik görünürlüğü, fotoğraf) · veri sahibi hakları kanalı ve yanıt süresi · saklama/imha süreleri, günlük temizlik işi, imha kaydı · rol bazlı erişim (eğitmen kendi grubundan fazlasını görmemeli) · 18 yaş altı/veli onayı · güvenlik (şifreli yedek, HTTPS, özetlenmiş parola, kısıtlı erişim) · üçüncü taraf (SMTP veri işleyen mi, yurt dışı aktarım) · ihlal prosedürü · liderlik takma ad/gizlenme · lab'ın sentetik veri kullandığının ve öğrenci cihazından veri toplanmadığının yazılı olması.

**P0 risk:** Kişisel veri yaşam döngüsü eksik (öğrenci no, bölüm, IP süresiz); "verim nerede, nasıl silerim" sorusunun cevabı yok; denetim/şikâyette kulüp savunmasız. İkincil: alıcı özeti olmadığı için yanlış kitleye görev/dosya.
**Kabul testi (test öğrenci + test eğitmen):** (1) kayıtta aydınlatma özeti, onaysız ilerlemez; (2) "Verilerimi indir" yalnız kendi profil/XP/teslim/dosya listesini içeren JSON/CSV; (3) silme sonrası aynı e-postayla yeniden kayıt mümkün, ad/e-posta kalıntısı yok, liderlikte "Silinmiş üye", `AuditLog` IP'si boş; (4) test DB'de 91 gün önceki `AuditLog` IP'si silinir ve `system` sayfasında raporlanır; (5) sihirbazla ilk kullanımda <3 dk yayın (3 gönüllü eğitmenle ayrıca ölçülmeli; sonuç yok).

**İtirazlar (öngörüsel):** gamification-economy — takma ada katılır ama yönetici XP doğrulamasında gerçek kimlik görünmeli (`adjust`/`reverse` denetimi); takma ad yalnız öğrenci görünümünde. club-live-experience — eğitmen ekranı yansıtılırsa isimler 30 kişiye açılır; konsolda "Yansıtma kipi" (isimler/sorular gizli, sayılar görünür). interactive-mission — mini görevler elle puanlama yükü getirmesin; otomatik ya da `Assignment`'a bağlı. accessibility-simplicity — rubrik/takım çıkarılmasın, katlansın. technical-architect — saklama temizliği için Redis/yeni servis yerine `outbox.ts` desenindeki günlük iş.

**Karar**
- **Koru (P2):** mevcut `TaskForm`, rubrik/takım, denetim kaydı, rol ayrımı (OWNER/ADMIN/INSTRUCTOR/STUDENT), `outbox` temizlik deseni.
- **Değiştir (P0):** Hızlı Etkinlik sihirbazı ve etkinlik–canlı ders–görev bağlantısı; "Veri ve Gizlilik" merkezi, hesap silme/dışa aktarma.
- **Değiştir (P1):** yayın öncesi özet ve "Öğrenci gözüyle" önizleme; aranabilir çoklu seçim; `MembersEditor` için "X kişi çıkarılacak" onayı.
- **Çıkar:** yok.

---

### 16 · technical-architect

**Okunan/atıf yapılan dosyalar:** `service.ts:185-199`, `akademi.yaml:8`, `m01/05-uygulama-sahte-burs.md`, `lesson/[slug]/page.tsx:53-62`, `LessonActions.tsx:41-43`, `live-protocol.ts:102`, `LiveViewer.tsx:68-79`, `presentations.ts:41`, `engine.ts:35`, `hub.ts:165`, `compose.yaml`. `club.sh` okunmadı.

**Kusurlar**
1. **K1 — "Devam et" yeni öğrenciyi önce 9 bilgi sayfasına gönderiyor.** `continueTarget` ilk tamamlanmamış sayfayı döndürüyor; ilk yol `program` (9 `bilgi` sayfası); ilk uygulama (`m01-05`, 15 dk) ~14. sayfa. *Varsayım:* sıkıcı bulunacağı test edilmedi.
2. **K2 — Uygulama sayfası olmayan teslim alanını vaat ediyor.** QUIZ dışında yalnız "Okudum, tamamla"; cevap anahtarı `<details>`'ta; 15 sn sonra +40 XP — beklemeyi ödüllendiriyor.
3. **K3 — Canlıdan bireysel moda köprü veri modelinde yok.** `ended` mesajı veri taşımıyor; LiveViewer yalnız "Ana sayfaya dön"; deste meta verisi yalnız `{schema}` (hangi akademi dersine bağlı olduğu yok); katılım XP'si hesaplanıyor ama gösterilmiyor ("Katılımın kaydedildi").
- *Ek gözlem:* altyapı sağlam (durum yalnız sunucuda değişir, sürümlü anlık görüntü; idempotent XP; quiz cevapları istemciye gitmez). Dikey dilim bunların üzerine kurulmalı.

**Fikirler**
1. **Görevi Markdown direktifi + front-matter ile tanımla:** `::animasyon[id]` kalıbının aynısı; `::gorev[burs-a]`, tanım `gorevler:` alanında (`sorular:` gibi); puanlama sunucuda, geri bildirim yalnız seçilen seçenek için; dilimde tek bileşen türü (gelen kutusu kartı, 3 seçenek, 2 ipucu).
2. **Opt-in ders içi adımlayıcı:** `::adim` ayraçları varsa kartlara bölünür (`.lab-progress` rayı, "Devam"); yoksa sayfa bugünkü gibi (183 sayfa bozulmaz); bölümler sunucuda render, istemci yalnız `hidden`; ekran okuyucu/yazdırma için "Tümünü göster".
3. **Gelen kutusu görevinin mikro kopyası:** `Gelen kutusu · 23:47`; `KKU Burs <onay@kku-burs-onay.example>` (dokunulabilir, odakta altı çizili); "Deniz ne yapmalı?" `Linke tıkla, hemen onayla · Önce göndereni kontrol et · Sınıf grubuna ilet`; yanlışta `--lab-danger` kenar + 300ms sallanma (reduced-motion'da yok) + "Anlaşılır bir refleks. Ama mesaj senden acele istiyor; bu başlı başına bir işaret." [İpucu 1/2]; doğruda "Yakaladın. Adres okulun adına benziyor ama okulun değil." + `+60 XP · ilk denemede ya da ipucuyla, fark etmez` (miktar sunucudan, `aria-live="polite"`); tekrar tıkta "Bu görevi çözdün. XP bir kez verilir."; bitişte tek birincil `Sıradaki dosya →`.
- **F4 — Onboarding için veri modeli gerekmiyor:** `progressSummary().completed === 0` ise panel üstünde tek kart "İlk görevin hazır · 3 dk. Bir burs mesajı geldi. Sen önce bir bak. [Başla]"; doğrudan görev sayfası; ilk görev slug'ı kodda sabit (`m01-05`), yoksa `continueTarget`'a döner; program sayfaları silinmez.

**Dikey dilim: en az değişiklikli plan**

| Katman | Dosyalar | Not |
|---|---|---|
| Veri | `prisma/schema.prisma` + 1 migration: `Lesson.missions Json?`, `MissionAttempt{id,userId,lessonId,missionId,choice,correct,createdAt; @@index([userId,lessonId])}` | Yalnız ekleme, boş bırakılabilir; entrypoint `migrate deploy` uygular; `XpSource` enum'una dokunulmaz (kaynak `LESSON`, ayrım `ruleKey`) |
| İçerik | `academy/content.ts` (`gorevler` zod), `academy/importer.ts` (`missions`), `scripts/academy.mjs check` (`::gorev` referansları) | `m01-05` dönüştürülür; cevap anahtarı çözülünce açılır (`revealEnding` mantığı) |
| Sunucu | `academy/service.ts`: `publicMissions`, saf `gradeMission`, `submitMission` (`hit()` hız sınırı), `completeLesson`'da görev kontrolü; rota `api/academy/lessons/[slug]/missions/[id]` | `submitQuiz` kalıbının aynısı |
| XP | `xp/defaults.ts`: `mission.solve` = 60; `xp/engine.ts`: `onMissionSolved`, anahtar `mission:u:l:m` | `ensureGamificationDefaults` `skipDuplicates` → mevcut kurulumlara kendiliğinden eklenir |
| Arayüz | `Markdown.tsx` (`::gorev`, `::adim`), yeni `MissionCard.tsx`, `LessonStepper.tsx`, `dashboard/page.tsx` (ilk görev kartı), `i18n/tr.ts`, `en.ts` | CSP'ye uyar, harici kaynak yok |
| Canlı | `deck-schema.ts`: `{type:"mission", lesson, mission}` (kayıtta varlık doğrulaması); `SlideView` aynı `MissionCard`; deste meta verisine isteğe bağlı `academyLesson`; LiveViewer bitişinde "Bu dersi kendi hızında tekrar et → M01 · Sahte Burs" | **`hub.ts` ve protokol değişmez**; öğrenci görevi kendi cihazında çözer; sınıf toplam istatistiği P1 |

**Testler:** Vitest birim (zod şeması, `publicMissions`, `gradeMission`, mission bloğu, Markdown direktifi); entegrasyon (aşağıdaki 5 kabul testi + destede mission bloğunun kabulü/geçersiz referansın reddi); Playwright iki akış (bireysel: yeni üye → ilk görev kartı → yanlış → ipucu → doğru → +XP → tamamla; canlı: eğitmen görev slaytı → öğrenci çözer → bitişte akademi köprüsü). Mevcut 196 vitest ve 13 adımlık E2E yeşil kalmalı.
**Riskler:** Club Studio önizlemesi ve tekil DeckPlayer'da `MissionCard` salt-okunur olmalı (yoksa önizleme deneme kaydeder); içerik hash'i değişince importer ilerlemeyi korumalı; eski desteler v1'de geçerli kalır.
**Docker:** yeni servis/ortam değişkeni/volume yok, bellek etkisi önemsiz; içerik imaja gömülü → değişiklik `club.sh update` ile yeniden derleme. [Varsayım, `club.sh` okunmadı] güncelleme canlı ders sırasında WebSocket'leri koparır, durum DB'den döner ama otomatik oynatma kapanır (`hub.ts:165`) — betik aktif `LiveSession` varsa uyarmalı. Küçük not: `compose.yaml`'da `caddy.depends_on` için `service_healthy` yok.

**P0 risk:** Görev ilerlemesi ve XP yanlış kaynağa bağlanırsa (a) **cevap sızıntısı** — "doğru" bayrağı/geri bildirim istemciye giderse tıkla-dene ile XP; (b) **kilitlenme** — tamamlama XP defterine bağlanırsa, kural kapalıyken `award()` 0 döner ve satır yazmaz (`engine.ts:35`), öğrenci dersi tamamlayamaz. Çözüm: ilerlemenin kaynağı ayrı `MissionAttempt`; XP yalnız sonuç.
**Kabul testi:** (1) ders yanıtında `dogru` ve `geri` alanları yok (snapshot); (2) iki kez doğru → tek XP satırı; (3) `mission.solve` kapalıyken görev çözülür, ders tamamlanır, XP 0; (4) görev çözülmeden `complete` → `MISSION_PENDING`; (5) tanımsız id'li `::gorev` yer tutucu gösterir, dersi kilitlemez.

**İtirazlar (öngörüsel):** tarayıcıda gerçek terminal/VM/konteyner — tek 8 GB sunucu ve konteynerin `cap_drop: ALL`, salt-okunur, "lab ağına bağlanmaz" kurallarıyla çelişir; statik JSON sahne verisi yeterli. Tüm akademiyi §5A koyu lab'a taşıma — önce tek ders, isteğe bağlı. Canlıda öğrenci başına anlık ilerleme akışı veya Redis — hub tek süreç, durumun tek kaynağı slide/step; kişisel sonuç HTTP + DB'de kalmalı. Başlangıç ligi için yeni tablo — dilim dışı; `joinedAt`'tan sorgu düzeyinde hesaplanabilir.

**Karar**
- **Koru:** hub mimarisi, XP defteri, sunucu tarafı puanlama, Docker yapısı.
- **Değiştir (P0):** ilk görev yolu, görev bileşeni ve `MissionAttempt`; `m01-05`'teki karşılıksız teslim vaadi.
- **Değiştir (P1):** ders içi adımlayıcı, canlı bitiş köprüsü, sınıf görev istatistiği.
- **Çıkar (P1):** görevli PRACTICE sayfalarında "15 sn bekle, tıkla, 40 XP al" yolu.
- **P2:** ilk görev slug'ını koddan `akademi.yaml`'a taşı.

---

## 4. P0 kümesi (ajan kararlarından derlenmiş)

Aşağıdaki liste yalnızca ajanların kendi karar tablolarında P0 işaretlediği öğeleri tema bazında toplar; öncelik yeniden puanlanmamıştır.

| Tema | P0 diyen ajanlar | İlgili öğeler |
|---|---|---|
| İlk kullanım / ilk görev yolu | tryhackme-ux, elite-ui-director, student-zero-knowledge, student-curious-beginner, student-bored-skeptic, student-ux-research, technical-architect | `continueTarget` PROGRAM'ı atlasın; sıfır ilerlemede tek kartlı ana sayfa; onay bekleme odası (student-ux-research); kayıt akışı sadeleştirme (student-bored-skeptic) |
| Kanıta bağlı tamamlama ve XP | tryhackme-ux, htb-academy-ux, learning-scientist, gamification-economy, interactive-mission, underground-storyteller, technical-architect | PRACTICE'te karar/kontrol noktası olmadan XP yok; `MissionRunner`/`MissionCard`; `MissionAttempt`; XP tablosu ve günlük okuma tavanı |
| Quiz'in ölçme değeri | learning-scientist | Karışan sıra/varyant, ele vermeyen ilk geri bildirim, senaryo soruları |
| Ders içi etkileşim (sahne + seçim, adım kartları) | elite-ui-director, underground-storyteller, student-curious-beginner | Uzun Markdown → adım kartları; yap-önce mini görev |
| Yazı sistemi ve dashboard sırası | elite-ui-director | Global uppercase başlık kuralı; kart sırası |
| Görsel hattı | motion-visual | Eksik görsel kutusunu çizmeme, `width/height`, LQIP, ders başına ≤1 görsel |
| Erişilebilirlik | accessibility-simplicity | Koyu zeminde odak halkası; erişilebilir quiz/canlı sonuç |
| Canlı mod güvenilirliği | club-live-experience | `epoch`, canlılık denetimi, host kopma göstergesi, projeksiyon katıl rozeti, quiz ack, bitirme kontrol listesi |
| Mahremiyet | gamification-economy, product-admin | Takma ad + opt-out (varsayılan takma ad); Veri ve Gizlilik merkezi, dışa aktarma/silme |
| Eğitmen akışı | product-admin | Hızlı Etkinlik sihirbazı, etkinlik–canlı ders–görev bağlantısı (`groupId`) |
| Görev güvenliği | interactive-mission | Simülasyonda parola kutusu ve `a[href]` yok; "Gönderen" ayrıntısı dokunmatikte keşfedilebilir |

## 5. Tur 2'ye devredilen açık noktalar

Bunlar Tur 1 raporları arasında yön farkı görünen konulardır; burada karara bağlanmamıştır, `02-debate-log.md`'de ele alınır.

1. **Hikâyenin yeri:** underground-storyteller "sahne + seçim" ve "Nöbetçi" anlatıcısını P0 sayıyor; öğrenci ajanları (04, 05, 06), htb-academy-ux, learning-scientist, interactive-mission ve student-ux-research hikâyenin ilk etkileşimi geciktirmemesini (≤10–20 sn, ≤2 cümle, DOSYA sonradan ödül) şart koşuyor. Karikatür kötü adam tonu (B2) Gölge Ağ'ı "koru" diyen ajanlarla (01, 04, 05) birlikte tartışılmalı.
2. **Koyu tema kapsamı:** elite-ui-director tek gece yüzeyi ve Cyber Mystery'yi yalnız içerik katmanında öneriyor; htb-academy-ux koyu lab'ı yalnız terminal/masa alanında; interactive-mission posta gövdesini açık/krem; club-live-experience projektörde yüksek kontrast; accessibility-simplicity koyu kapsamlarda yeşil odak halkası istiyor.
3. **Ders düzeni:** htb-academy-ux türe göre A/B/C/D eşlemesi; tryhackme-ux ve elite-ui-director adım kartları; technical-architect opt-in `::adim`; learning-scientist `:::kontrol` bloğu. Direktif adlandırması (`::gorev`, `::adim`, `:::kontrol`) ve kapsamı tekleştirilmeli.
4. **Gerekçe yazma yükü:** learning-scientist Ö6 tavsiye ve gerekçe ölçütleri öneriyor; student-curious-beginner ve student-bored-skeptic serbest yazının seçmeli/isteğe bağlı olmasını istiyor (learning-scientist'in rubriğinde Ö6 zaten isteğe bağlı).
5. **XP sayıları:** gamification-economy (`lesson.proof`, `quiz.pass` 40, günlük tavan 120), interactive-mission (`mission.complete` 60), technical-architect (`mission.solve` 60), learning-scientist (30 + 30 ustalık) ve underground-storyteller (+60 koşulu) farklı kural adları ve miktarlar öneriyor; tek kural adı ve koşulda birleşilmeli.
6. **Görev bileşeninin kapsamı:** interactive-mission 5 adım tipli `MissionRunner` ve ayrı `missions/<id>.yaml`; technical-architect tek bileşen türü ve front-matter `gorevler:`. Dikey dilim için hangisinin başlangıç olduğu seçilmeli.
7. **Canlı mod değişiklik sınırı:** club-live-experience `epoch`, `phase`, `hostOnline`, `pulse` mesajları öneriyor; technical-architect dilimde "`hub.ts` ve protokol değişmez" diyor. P0 güvenilirlik düzeltmeleri ile dilim kapsamı ayrıştırılmalı.
8. **Kayıt alanları:** student-zero-knowledge ve student-bored-skeptic öğrenci no/bölümün isteğe bağlı olmasını; product-admin envanterde gerekçelendirilmesini istiyor; gamification-economy ve product-admin yönetici tarafında gerçek kimliğin görünür kalması konusunda hemfikir.

## 6. Kaynak raporlar ve sınırlar

- Her bölüm yalnızca adı geçen ajanın Tur 1 raporuna dayanır; ajanlar arası atıflar o ajanın kendi ifadesidir.
- Tüm "kabul testi" maddeleri **önerilmiş** testlerdir; hiçbiri çalıştırılmadı, hiçbir sonuç üretilmedi.
- Örnek metinlerdeki sayılar (ör. "135 puan", "23 kişi burada", "%80'e geldik") arayüz kopyası örneğidir, ölçüm değildir.
- Hukuki notlar (KVKK, KKTC mevzuatı, GDPR) hukuk görüşü değildir; product-admin ve gamification-economy bunu açıkça belirtti.
- Görsel ve AI promptları markalı, logolu veya gerçek kişi içeren üretim istemez; motion-visual ortak kuralları geçerlidir.
