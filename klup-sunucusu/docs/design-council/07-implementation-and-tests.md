# 07 — Uygulama planı ve testler

> **Not:** Ajanlar bu oturumda Claude Code alt ajanı olarak, her biri kendi `.claude/agents/<ad>.md` tanımını sistem rolü olarak okuyarak AYRI ayrı çalıştırıldı (yeni eklenen ajan tipleri oturum yeniden başlamadan yerel tip olarak yüklenemediği için). Agent Teams kullanılmadı; tartışma, ana ajanın ayrı raporları birbirine iletmesiyle yürütüldü — "simüle edilmiş toplantı" değil, ayrı raporlardan sentez.
>
> Tur 1'de çalışan ajanlar: `tryhackme-ux`, `htb-academy-ux`, `elite-ui-director`, `student-zero-knowledge`, `student-curious-beginner`, `student-bored-skeptic`, `underground-storyteller`, `learning-scientist`, `gamification-economy`, `interactive-mission`, `club-live-experience`, `motion-visual`, `accessibility-simplicity`, `student-ux-research`, `product-admin`, `technical-architect`.

## 0. Bu belge nedir, ne değildir

- **Kaynak.** Bu belge şu girdilerden sentezlendi: `technical-architect`, `interactive-mission`, `club-live-experience` ve `product-admin` Tur 1 raporları. Bunlara Tur 3 yargıçları `learning-scientist`, `accessibility-simplicity` ve `student-ux-research`'ün puanları ve "çözülmemiş P0" listeleri eklendi. Diğer ajanların görüşleri burada yalnızca yargıç notlarında geçtiği kadarıyla yer alıyor; tam metinleri `01-agent-findings.md` ve `02-debate-log.md` içinde.
- **Durum.** Bu bir **plan**. Belge yazıldığı anda dikey dilimin hiçbir parçası uygulanmamıştı. belge sonundaki "Uygulama ve test sonuçları" bölümü boştur ve ana ajan tarafından doldurulacaktır.
- **Etiketler.**
  - **[Ajan: ad]**: görüşün sahibi.
  - **[Doğrulandı]**: belge yazıcısı repoda bakarak teyit etti; dosya varlığı ve betik satırları dahil.
  - **[V]**: varsayım veya doğrulanmamış iddia.
  - **[Sentez]**: belge yazıcısının iki ajan önerisini uzlaştırma önerisi. Bağlayıcı değildir; ana ajan onaylar.
- **Veri.** Gerçek öğrenci verisi yok. Puanlar uzman değerlendirmesidir, ölçüm değildir. Öğrenci itirazları persona simülasyonudur.

## 1. Seçilen yön ve uygulamaya etkisi

Tur 3 ağırlıklı matrisinde üç yargıcın ortalaması kullanıldı (ağırlıklar: anlaşılabilirlik %35, ilgi %25, öğrenme %20, erişilebilirlik %10, maliyet %10; uzman değerlendirme puanıdır, kanıt değildir).

| Konsept | Anlaşılabilirlik | İlgi | Öğrenme | Erişilebilirlik | Maliyet | Ağırlıklı |
|---|---|---|---|---|---|---|
| A — Mission Control | 7,7 | 5,7 | 6,3 | 7,7 | 6,3 | 6,77 |
| B — Cyber Mystery | 4,3 | 8,7 | 7,7 | 4,3 | 3,3 | 5,98 |
| C — Friendly Academy | 9,0 | 5,0 | 6,7 | 9,0 | 8,0 | 7,43 |

Üç yargıç (`learning-scientist`, `accessibility-simplicity`, `student-ux-research`) aynı melezi **koşullu** destekliyor. Kural: bir ekranda tek görsel dil olur.

| Katman | Kaynak konsept | Uygulamadaki karşılığı |
|---|---|---|
| Kabuk: ana ekran, gezinme, ilerleme | A | Tek "Sıradaki adım" kartı. İlerleme rayı sayfaları değil karar anlarını sayar [Ajan: learning-scientist]. Halka, haftalık hedef ve lig ilk görev tamamlanana kadar gizli kalır [Ajan: accessibility-simplicity, student-ux-research]. |
| Ders gövdesi ve dil | C | Krem zemin (`--ciu-cream`), tek kolon, ≤640 px gövde, 12 px ilerleme rayı, yapışkan tek yeşil düğme. Jargon ilk geçişte parantez içinde açıklanır, ikinci katmanda "Nedir?" düğmesi bulunur. |
| Etkileşim motoru | B | Kanıt topla → karar ver → gerekçe göster → yeni vakaya aktar. |
| Atmosfer | B | Yalnızca kanca cümlesinde ve kapanıştaki "DOSYA KAPANDI" kartında. Koyu yüzey yalnızca log, terminal ve ağ kanıtı gibi nesnelerde kullanılır; ilk görevde hiç koyu öğe yoktur [Ajan: student-ux-research]. |

**Marka uyumu (CIU tasarım sistemi, `docs/TASARIM-SISTEMI.md`).**
- Neon yeşil (`--ciu-green`) yalnızca eylemde kullanılır; yeşil düğmenin metni `--ciu-ink` olur (§2).
- Yanlış cevapta `--lab-danger` ve 300 ms sallanma kullanılır; azaltılmış harekette sallanma yoktur (§5A).
- Kartlar 20 px köşeli ve gölgesizdir (§4).
- **Çelişki, karar gerektirir:** §3 "Display / başlık: Lexend Tera, daima `uppercase`" diyor. `accessibility-simplicity` ve `student-ux-research` ise ders gövdesinde Lexend Tera ile büyük harf başlığın kaldırılmasını, yerine Readex Pro 500 ve cümle düzeninin (sentence case) kullanılmasını istiyor. Bu ancak tasarım sistemine ders gövdesi için bir istisna eklenerek uygulanabilir. İstisna `TASARIM-SISTEMI.md`'de yazılmadan kod değişmemeli.
- **Görev postası:** E-posta gövdesi gerçeğe yakın, açık/krem bir arayüz olmalı. Mor ve yeşil marka token'ları çerçevede kalır, posta gövdesine girmez [Ajan: interactive-mission].

## 2. Mimari değerlendirme

### 2.1 Korunacaklar

| Bileşen | Neden korunmalı | Kaynak |
|---|---|---|
| Canlı hub (tek süreç, sunucu otoriteli, sürümlü anlık görüntü) | Durum yalnızca sunucuda değişiyor. Tek 8 GB sunucu hedefine uyuyor. | [Ajan: technical-architect, club-live-experience] |
| XP defteri (idempotent `award()`) | Tekrar tıklama çift XP üretmiyor. | [Ajan: technical-architect] |
| Sunucu tarafı quiz puanlama | Quiz cevapları istemciye gitmiyor. | [Ajan: technical-architect] |
| zod doğrulama, hız sınırları, sunucu saatli quiz, öğrenciye ad listesi gönderilmemesi | Güvenlik ve mahremiyet tabanı. | [Ajan: club-live-experience] |
| Bireysel modun canlıdan bağımsızlığı | Akademi erişimi yalnızca `status === ACTIVE` ister; XP, ilerleme ve canlı oturum ayrı kayıtlarda tutulur. | [Ajan: club-live-experience] |
| Docker yapısı ve başlangıçta `migrate deploy` | Yalnızca ekleme yapan bir migration kendiliğinden uygulanır. | [Ajan: technical-architect]; `docker/entrypoint.sh:17` [Doğrulandı] |
| `TaskForm`, rubrik/takım, denetim kaydı, rol ayrımı, `outbox` temizlik deseni | Güç kullanıcı özelliklerini silmek yerine katlamak tercih edilir. | [Ajan: product-admin] |

### 2.2 Kusurlar (dilimi doğrudan etkileyenler)

| # | Kusur | Kanıt (ajanın verdiği) | Kaynak |
|---|---|---|---|
| K1 | Yeni öğrencinin "Devam et" düğmesi önce `program` yolundaki 9 bilgi sayfasına gidiyor. İlk uygulama yaklaşık 14. sayfada. | `src/server/academy/service.ts:185-199`, `akademi.yaml:8` | [Ajan: technical-architect]; ayrıca üç yargıcın çözülmemiş P0 listesinde: "PROGRAM türü atlanmalı, STARTED dalı dahil" |
| K2 | `m01-05` "alttaki alana yaz" diyor ama sayfada alan yok. "Okudum, tamamla" düğmesi 15 sn sonra 40 XP veriyor; XP beklemeyi ödüllendiriyor. Cevap anahtarı aynı sayfada `<details>` içinde duruyor. | `lesson/[slug]/page.tsx:53-62`, `LessonActions.tsx:41-43`, `MIN_READ_MS` | [Ajan: technical-architect, interactive-mission] |
| K3 | Quiz geri bildirimi sonda ve toplu geliyor. "Tekrar dene" tüm seçimleri sıfırlıyor. `gradeQuiz` açıklamayı her cevapta döndürüyor, bu da kaba kuvvetle geçişi kolaylaştırıyor. | `QuizForm`, `service.ts:23-28` | [Ajan: interactive-mission, learning-scientist] |
| K4 | Canlıdan bireysel moda geçiş köprüsü yok: `ended` mesajı veri taşımıyor, deste meta verisinde ders bağlantısı yok, katılım XP'si gösterilmiyor. | `live-protocol.ts:102`, `LiveViewer.tsx:68-79`, `presentations.ts:41` | [Ajan: technical-architect, club-live-experience] |
| K5 | Yeniden bağlanınca ilk `state` mesajı `m.v <= vRef.current` kuralına takılıp elenebiliyor. Çökme sonrası öğrenci "Canlı" yazısını görürken eski slaytta donabilir. | `useLiveSession.ts`, `hub.ts` (`stateVersion` 250 ms gecikmeli yazılıyor); `live-hub.test.ts:181` bu durumu kapsamıyor | [Ajan: club-live-experience] |
| K6 | Projeksiyon modunda katılım kodu/QR görünmüyor; quiz dock'u 16:9 ekranda dışarı taşabiliyor; yazılar 14,5–16 px. | `presentation.css:97` | [Ajan: club-live-experience] |
| K7 | Quiz cevabı sessizce kaybolabiliyor: `send()` sonucu ve `ack` işlenmiyor, seçenekler `reconnecting` durumunda da aktif kalıyor. | `Poll.tsx` | [Ajan: club-live-experience] |
| K8 | `hub.end()` açık quizi `CLOSED` yapıyor; XP yalnızca `revealPoll`'da veriliyor. Açıklanmadan biten quizde doğru cevaplayan XP alamıyor. | `hub.ts` | [Ajan: club-live-experience] |
| K9 | `LiveSession` ve `Assignment` kayıtlarında `groupId` yok; etkinlik, canlı ders ve görev birbirine bağlı değil. | `prisma/schema.prisma` | [Ajan: product-admin] |
| K10 | Kişisel veri saklama/silme/dışa aktarma akışı kodda görülmedi; yalnızca `EmailOutbox` 30 gün sonra temizleniyor. | `src` metin taraması [V: kod dışında belgelenmiş olabilir] | [Ajan: product-admin] |

### 2.3 Reddedilen mimari yönler

| Öneri | Ret gerekçesi | Kaynak |
|---|---|---|
| Tarayıcıda gerçek terminal, VM veya konteyner | 8 GB tek sunucu hedefi ve kulüp konteynerinin `cap_drop: ALL`, salt-okunur, "lab ağına bağlanmaz" kurallarıyla çelişir. Statik JSON sahne verisi yeter. | [Ajan: technical-architect] |
| Genel sahne motoru | 5 adım tipi (`inbox`, `inspect`, `choose`, `pick-evidence`, `classify`) ile başlanır. | [Ajan: interactive-mission]; teknik mimar da tek bileşen türünü önerdi |
| Canlıda öğrenci başına anlık ilerleme akışı, Redis | Kişisel görev sonucu HTTP ve veritabanında kalır; hub'a görev mesajı eklenmez. | [Ajan: technical-architect] |
| Saklama temizliği için yeni servis | `outbox.ts` desenindeki gibi günlük bir iş yeter. | [Ajan: product-admin] |
| Tüm akademiyi §5A koyu lab arayüzüne taşımak | Önce tek ders ve isteğe bağlı (opt-in). 183 sayfanın görsel geçişi ayrı bir iştir. | [Ajan: technical-architect] |

### 2.4 Ajanlar arası uyuşmazlıklar ve uzlaştırma önerisi

Aşağıdaki maddelerde iki uygulama ajanının önerileri farklı. Ana ajan uygulamaya başlamadan her biri için karar vermeli.

| Konu | `technical-architect` | `interactive-mission` | [Sentez] önerisi |
|---|---|---|---|
| Görev tanımının yeri | Ders front-matter'ında `gorevler:` | Ayrı `content/academy/missions/<id>.yaml` | Dilim için front-matter, çünkü importer ve hash mevcut `sorular:` kalıbıyla çalışıyor. Ayrı YAML dosyası, birden fazla dersin aynı görevi paylaşması gerektiğinde P2. |
| XP kural anahtarı | `mission.solve` = 60 | `mission.complete` = 60 | Tek kural, ad `mission.complete`. Görev çok adımlı olduğu için ödül "tamamlama"ya bağlanır. Miktar her iki öneride 60. |
| İdempotency anahtarı | `mission:u:l:m` | `mission:<userId>:<id>` | `mission:<userId>:<lessonId>:<missionId>`. Görev id'si yalnızca ders içinde tekil olduğu için ders kimliği anahtarda bulunmalı. |
| API | `api/academy/lessons/[slug]/missions/[id]` (tek gönderim) | `/api/academy/missions/[id]/check` ve `/complete` | `…/lessons/[slug]/missions/[id]/check` (adım başına geri bildirim, durumsuz, hız sınırlı) ve `…/complete` (işlem içinde yeniden doğrulama, XP). |
| Görev durumunun tutulduğu yer | `MissionAttempt` tablosu | `sessionStorage` (yenilemede kaldığı yerden devam) | İkisi birlikte: arayüz adımı `sessionStorage`'da (try/catch ile; boş gelirse baştan başlar), ilerlemenin tek kaynağı ise `MissionAttempt`. |
| İlk görevin uzunluğu | Tek kart, 3 seçenek, 2 ipucu | 7 durumlu akış (`intro` … `rewarded`), `classify` dahil | **Açık P0** (üç yargıç da çözülmedi diyor). Dilim için `accessibility-simplicity` yargıcının belirttiği "3 adım ≈ 3-4 dk" kapsamı önerilir: mesajı aç, karar ver, kanıt seç. `classify` adımı modül sonu beceri kontrolüne taşınır. Bu taşıma `interactive-mission` tarafından henüz onaylanmadı. |
| Kurgusal okul ve alan adı | `KKU Burs <onay@kku-burs-onay.example>` | "Kuzey Ada Üniversitesi", `kuzeyada-burslar.example` | Tek kurgu: "Kuzey Ada Üniversitesi" ve `.example` alan adları. "KKU" kısaltması gerçek bir kurumla karışabilir [V]. |

## 3. Dikey dilim: adım adım teslim planı

Dilim sırası MASTER_PROMPT'ta tanımlı: **onboarding → ders ekranı → mini görev → XP geri bildirimi → eğitmen senkronizasyonu**. Her adım kendi başına birleştirilebilir (merge) olmalı ve mevcut testleri kırmamalı.

### Adım 0 — Ön karar ve hazırlık (kod yok)

| İş | Çıktı |
|---|---|
| §2.4'teki uyuşmazlıkları karara bağla | Bu belgeye karar satırı eklenir |
| Tasarım sistemine ders gövdesi başlık istisnasını ekle (§1) | `TASARIM-SISTEMI.md` notu |
| Temel çizgiyi kaydet: `npm run typecheck`, `npm run lint`, `npm test`, `npm run test:e2e` | "Uygulama ve test sonuçları" bölümündeki "Dilim öncesi" sütunu |

### Adım 1 — Onboarding: ilk görev yolu

| | |
|---|---|
| **Amaç** | Yeni öğrenci 60 saniye içinde ilk görevine ulaşır. Broşür (program) sayfalarına düşmez. |
| **Değişiklik** | (a) `continueTarget` PROGRAM türündeki yolu hem "sıradaki ders" hem STARTED dalında atlar [Yargıç P0: üçü de]. (b) `progressSummary().completed === 0` ise panelin en üstünde tek kart gösterilir; diğer kartlar altta kalır [Ajan: technical-architect]. (c) İlk ekranda lig, sıra, seri, haftalık hedef, ilerleme kolonu, kurulum formu ve takma ad modalı bulunmaz [Yargıç P0: accessibility-simplicity, student-ux-research]. |
| **Mikro kopya** | "İlk görevin hazır · 3 dk. Bir burs mesajı geldi. Sen önce bir bak." Tek yeşil düğme: **Başla** [Ajan: technical-architect] |
| **Davranış** | İlk görev slug'ı kodda sabittir (`m01-05`). Ders yoksa `continueTarget` davranışına dönülür. Program sayfaları silinmez, sonradan okunur. |
| **Dosyalar** | `src/server/academy/service.ts`, `src/app/(member)/dashboard/page.tsx`, `src/i18n/tr.ts`, `src/i18n/en.ts` |
| **Veri modeli** | Değişiklik yok |
| **Açık** | Tanılama rolü: ilk iki kararın ilk deneme sonucunun "istersen 2 dersi atla" önerisine dönüşmesi tasarlanmadı [Yargıç: learning-scientist]. Dilim dışı. |

### Adım 2 — Ders ekranı: LessonFrame ve isteğe bağlı adımlayıcı

| | |
|---|---|
| **Amaç** | "Duvar metni" yerine kart başına tek fikir. Mevcut 183 sayfa bozulmaz. |
| **Değişiklik** | Gövdede `::adim` ayracı varsa ders kartlara bölünür: `.lab-progress` rayı, "Devam" düğmesi. Ayraç yoksa sayfa bugünkü gibi kalır. Tüm bölümleri sunucu render eder; istemci yalnızca `hidden` özniteliğini değiştirir. Ekran okuyucu ve yazdırma için "Tümünü göster" seçeneği vardır [Ajan: technical-architect]. |
| **Görsel** | C dili: krem zemin, tek kolon, ≤640 px, 12 px ray (`role="progressbar"`), yapışkan tek yeşil düğme [Yargıç: accessibility-simplicity, student-ux-research]. İlerleme rayı karar anlarını sayar [Yargıç: learning-scientist]. |
| **Kilit metni** | "Dersi bitir" kilitliyken nedeni yazılır, örneğin "1 karar kaldı". Sessiz kilit yoktur [Yargıç P0: accessibility-simplicity, student-ux-research]. |
| **Jargon** | İlk geçişte parantez içinde açıklama, ikinci katmanda "Nedir?" düğmesi. Hover'a bağlı değildir, dokunmatikte çalışır [Yargıç P0: üçü de]. |
| **Eksik görsel** | Kesik çizgili yer tutucu kutu öğrenciye gösterilmez [Yargıç P0: accessibility-simplicity, student-ux-research]. |
| **Dosyalar** | `src/components/academy/Markdown.tsx` (`::adim`), yeni `src/components/academy/LessonStepper.tsx`, `src/app/(member)/academy/lesson/[slug]/page.tsx`, `src/styles/academy.css` ve/veya `src/styles/lab.css`, i18n |
| **Veri modeli** | Değişiklik yok |

### Adım 3 — Mini görev: "Şüpheli Mesaj: Sahte Kampüs Bursu"

| | |
|---|---|
| **Amaç** | İlk dakikalarda gerçek bir küçük başarı. Ödül tıklamaya değil kanıta bağlanır. |
| **İçerik söz dizimi** | Ders gövdesinde `::gorev[sahte-burs]`; tanım front-matter'da `gorevler:` (§2.4 sentezi). Bilinmeyen id yer tutucu gösterir ve dersi kilitlemez. |
| **Bileşen** | `MissionCard` / `MissionRunner`: tek bileşen, dilimde yalnızca `inbox`, `inspect`, `choose`, `pick-evidence` adım tipleri. `classify` §2.4'teki açık karara bağlı. |
| **Güvenlik kapsamı** [Ajan: interactive-mission] | Hiç `<a href>` yok; dış istek yok; `input[type=password]` yok; simülasyon giriş ekranı input içermeyen kutulardan oluşur. Sabit rozet: "SİMÜLASYON · Gerçek e-posta değil, hiçbir şey sana zarar veremez". Alan adları `.example` / `.invalid` (RFC 2606). Gerçek kişi, kurum ya da logo yok. |
| **Keşfedilebilirlik** | Görünür bir "Gönderene dokun" etiketi; hover'a bağımlılık yok. Mobilde hedef adres alttan açılan sayfada (bottom sheet) görünür [Ajan: interactive-mission; Yargıç P0: accessibility-simplicity, student-ux-research]. |
| **Geri bildirim** | Yanlış seçimde `--lab-danger` kenarlık ve 300 ms sallanma (azaltılmış harekette yok). Metin saygılıdır, ceza ekranı yoktur, öğrenci aynı adıma döner. Seçenekler, ipuçları ve geri bildirim metinleri için §2.4'teki tek kurgu esas alınır; kopya örnekleri `technical-architect` ve `interactive-mission` raporlarında ve `05-curriculum-and-story.md`'de. |
| **İpucu** | İki ipucu, otomatik açılmaz ("İpucu (2 kaldı)"). İpucu XP'yi düşürmez [Ajan: interactive-mission]. 2 yanlıştan sonra çözümlü örnek açılır [Yargıç: learning-scientist]. |
| **"Emin değilim"** | **Açık P0.** Yargıçlar şunu öneriyor: yalnızca gerçekten belirsiz kartta doğru sayılsın ve doğrulama eylemi seçtirilsin. `student-zero-knowledge` "her zaman geçerli olsun" istiyor. Net kartta yanlış sayılmasının cezasız metni henüz yazılmadı. Dilimde `classify` yoksa bu karar dilimi bloke etmez. |
| **Cevap anahtarı** | Görev çözülene kadar `<details>` içindeki cevap gösterilmez (mevcut `revealEnding` mantığı) [Ajan: technical-architect]. `m01-05`'teki "alttaki alana yaz" vaadi silinir ya da görevle karşılanır. |
| **Dosyalar** | `content/academy/01-temel/m01-dijital-tehlikeler/05-uygulama-sahte-burs.md` [Doğrulandı: dosya var], `src/server/academy/content.ts` (zod `gorevler`), `src/server/academy/importer.ts` (`missions` alanı), `scripts/academy.mjs` (`check`: `::gorev` referansları), `src/server/academy/service.ts` (`publicMissions`, saf `gradeMission`, `checkMissionStep`, `completeMission`, `completeLesson` içinde görev kontrolü), yeni `src/app/api/academy/lessons/[slug]/missions/[id]/check/route.ts` ve `…/complete/route.ts`, `src/server/rate-limit.ts` (`hit()` kullanımı), yeni `src/components/academy/MissionCard.tsx`, `Markdown.tsx` (`::gorev`), `LessonActions.tsx` (görevli derste "Okudum, tamamla" yerine görev) |

### Adım 4 — XP geri bildirimi

| | |
|---|---|
| **Kural** | `src/server/xp/defaults.ts` dosyasına `mission.complete` = 60 eklenir. `ensureGamificationDefaults` `skipDuplicates` kullandığı için kural mevcut kurulumlara kendiliğinden eklenir [Ajan: technical-architect] [V: dilimde doğrulanmalı]. `/admin/xp`'ten düzenlenebilir. |
| **Motor** | `src/server/xp/engine.ts` içine `onMissionCompleted`: `source: "LESSON"`, `refType: "Mission"`, `ruleKey: "mission.complete"`. `XpSource` enum'una dokunulmaz, enum migration'ı gerekmez [Ajan: technical-architect, interactive-mission]. |
| **Ayrışma** | İlerlemenin kaynağı `MissionAttempt`'tir; XP bunun sonucudur. Yönetici kuralı kapatırsa `award()` 0 döner, ders yine tamamlanır (kilitlenme önlenir) [Ajan: technical-architect, P0]. |
| **Görevli derslerde okuma XP'si** | "15 sn bekle, tıkla, 40 XP" yolu görev içeren PRACTICE derslerinde kaldırılır [Ajan: technical-architect, interactive-mission; P1]. |
| **Arayüz** | Doğru sonuçta `+60 XP · ilk denemede ya da ipucuyla, fark etmez`. Miktar sunucudan gelir ve `aria-live="polite"` ile duyurulur. Tekrar gönderimde: "Bu görevi çözdün. XP bir kez verilir." Ardından tek birincil düğme: "Sıradaki dosya →" [Ajan: technical-architect]. Kapanışta "DOSYA KAPANDI" kartı (B atmosferi). |
| **Arka plan kaydı** | `firstTry` ve ipucu kullanımı kaydedilir, XP bunlardan bağımsız kalır [Yargıç: learning-scientist, şart 2]. Hız ya da "ipucusuz" bonusu yoktur [Ajan: interactive-mission]. |
| **Sıra kısıtı** | Ustalık XP'si, `track.complete` ve `lesson.proof` gibi yeni XP kuralları **quiz reformundan sonra** gelir [Yargıç P0: learning-scientist, student-ux-research]. Dilimde yalnızca `mission.complete` eklenir. |

### Adım 5 — Eğitmen senkronizasyonu

| | |
|---|---|
| **Kapsam** | Eğitmen görev slaytına geçer, öğrenci görevi kendi cihazında çözer, XP aynı uç noktadan gelir. **`hub.ts` ve canlı protokol görev için değişmez** [Ajan: technical-architect]. |
| **Deste şeması** | `src/lib/deck-schema.ts` içinde yeni `{type: "mission", lesson, mission}` bloğu. Kayıt sırasında dersin ve görevin varlığı doğrulanır (görsel bloğu gibi). Eski desteler v1'de geçerli kalır, çünkü blok birleşime ekleniyor. |
| **Render** | `SlideView.tsx` aynı `MissionCard`'ı kullanır. Club Studio önizlemesinde ve tekil `DeckPlayer.tsx`'te kart **salt-okunurdur**; önizleme deneme kaydı üretmez [Ajan: technical-architect, risk]. |
| **Canlı süre sınırı** | Senkron sahnede en fazla 60 sn'lik ortak karar etkileşimi çalışır; uzun görev "Evde devam" ile bireysel moda gider [Ajan: club-live-experience]. **Uyumsuzluk:** dilimdeki görev 3-4 dk sürüyor. Canlı slaytta görevin kısa bir alt kümesi mi (tek karar) yoksa tamamı mı gösterileceğine karar verilmeli. |
| **Bitiş köprüsü** | Deste meta verisine isteğe bağlı `academyLesson` alanı eklenir (`src/server/presentations.ts`). `LiveViewer.tsx` bitiş kartı: "Bu dersi kendi hızında tekrar et → M01 · Sahte Burs" [Ajan: technical-architect]. `club-live-experience` kazanılan XP'nin de gösterilmesini öneriyor; bunun için `ended` mesajı veya ayrı bir HTTP çağrısı gerekir; ikinci yol protokolü değiştirmez [Sentez]. |
| **Canlı güvenilirlik (P0, dilimle paralel)** | `club-live-experience` şu maddeleri P0 sayıyor: `epoch` ve yeniden bağlanınca ilk `state` mesajının her zaman kabulü (K5), canlılık denetimi, eğitmen kopma göstergesi (`hostOnline`), projeksiyon katılım rozeti ve ölçekli quiz (K6), quiz cevap geri bildirimi (K7), bitirme öncesi kontrol listesi (K8). **Teknik mimarla gerilim:** `technical-architect` "hub ve protokol değişmez" diyor; `club-live-experience` ise `welcome` mesajında `epoch` alanını zorunlu tutuyor ve "`stateVersion` kalıcı, yeter" savına itiraz ediyor. [Sentez]: görev bloğu için protokol değişmez; K5 düzeltmesi ayrı, küçük bir protokol değişikliği olarak Dalga 1'de ele alınır. |
| **Dosyalar** | `src/lib/deck-schema.ts`, `src/components/presentation/SlideView.tsx`, `src/components/presentation/DeckPlayer.tsx`, `src/server/presentations.ts`, `src/app/live/[code]/LiveViewer.tsx`, Club Studio önizleme bileşeni [V: yolu ana ajan belirlemeli] |
| **P1** | Sınıf düzeyinde görev istatistiği (`MissionAttempt` sorgusu). "Sınıfın %X'i ilk denemede yakaladı" bilgisi yalnızca canlı oturumda, gerçek katılımcı sayısıyla hesaplanır [Ajan: interactive-mission, technical-architect]. |

## 4. Dalgalar (dilimden sonra)

Öncelikler ajan raporlarındaki P0/P1/P2 etiketlerinden alındı. Dalga sırası belge yazıcısının önerisidir [Sentez].

| Dalga | İş | Öncelik ve kaynak |
|---|---|---|
| **Dalga 1: Güven ve ölçme** | Quiz reformu: seçenek karıştırma, varyant havuzu, ilk yanlışta cevabın ele verilmemesi, açıklamanın her cevapta dönmemesi, `firstTry=false` iken ustalık XP'sinin 0 kalması | P0 [Yargıç: learning-scientist, accessibility-simplicity, student-ux-research] |
| | Ders başına en fazla 2–3 karar anı; her biri bir "yapabilir" maddesine eşlenir; `scripts/academy.mjs check` bunu denetler | P0. Tavan tartışmalı: tryhackme/htb en fazla 2, elite-ui/learning-scientist en fazla 3 diyor [Yargıç: learning-scientist] |
| | Canlı: `epoch`, ilk `state` kabulü, canlılık denetimi, `hostOnline`, tam ekran perde yerine ince şerit | P0 [Ajan: club-live-experience] |
| | Canlı: projeksiyonda katılım rozeti (QR ve kod), `cqw` ölçekli quiz ve duyuru (gövde ≥28 px) | P0 [Ajan: club-live-experience] |
| | Canlı: `StudentPoll` gönderim/`ack` geri bildirimi, bağlantı yokken pasif seçenekler | P0 [Ajan: club-live-experience] |
| | Canlı: "Dersi bitir" kontrol listesi ve "Açıkla ve bitir" | P0 [Ajan: club-live-experience] |
| | Veri ve Gizlilik: aydınlatma özeti, "Verilerimi indir", "Hesabımı sil / anonimleştir", saklama ayarları ve günlük temizlik işi | P0 [Ajan: product-admin]. Süreler öneridir; hukuk ve kulüp danışmanı karar verir. |
| **Dalga 2: Akış ve etkinlik** | "Hızlı Etkinlik" sihirbazı (`/teach/new`, 3 adım); `LiveSession.groupId`, `Assignment.groupId` | P0 [Ajan: product-admin] |
| | Lobi ve mola (`phase`, `resumeAt`), anonim "Takıldım / Yetiştim" nabzı, "Geri bak", son duyurunun yeniden gösterilmesi, 4 saat hareketsiz oturumun otomatik kapanması | P1 [Ajan: club-live-experience] |
| | Yayın öncesi özet kartı, "Öğrenci gözüyle" önizleme, aranabilir çoklu seçim, `MembersEditor` için "X kişi çıkarılacak" onayı | P1 [Ajan: product-admin] |
| | Mini görevler: "Gece 03:12 logları", "Fotoğrafın sakladığı", "Şüpheli QR" | P1 [Ajan: interactive-mission] |
| | Durum noktasından yeşili çıkarma (`.dot.on`, `.conn[open]`) | P1 [Ajan: club-live-experience]; marka kuralı "yeşil yalnızca eylem" (§2) |
| **Dalga 3: Derinleşme** | Oturum rafı (dosya ve görev iliştirme), anonim soru projeksiyonu, tek kontrol sahibi ve devir, yansıtma kipi (isimler gizli) | P2 [Ajan: club-live-experience, product-admin] |
| | Kulüp etkinliği "Kayıp dosya, sahte masaüstü" ve toplu skor ekranı | P2 [Ajan: interactive-mission] |
| | İlk görev slug'ını koddan `akademi.yaml`'a taşıma | P2 [Ajan: technical-architect] |
| | Diğer dersleri `::adim` ve `::gorev` biçimine kademeli dönüştürme | [Sentez]: her dalgada birkaç ders, önce Temel kısım |

## 5. Veri modeli

Yalnızca ekleme yapan bir migration; tüm yeni alanlar boş bırakılabilir [Ajan: technical-architect].

```prisma
model Lesson {
  // … mevcut alanlar
  missions Json?            // front-matter `gorevler:` (yalnızca sunucuda; istemciye publicMissions ile süzülerek gider)
}

model MissionAttempt {
  id        String   @id @default(cuid())
  userId    String
  lessonId  String
  missionId String          // ders içinde tekil görev id'si
  step      String?         // [Sentez] adım tipi/no; adım başına kayıt tutulacaksa
  choice    String
  correct   Boolean
  hintsUsed Int      @default(0)  // [Sentez] learning-scientist şart 2: arka planda kayıt
  createdAt DateTime @default(now())
  @@index([userId, lessonId])
}
```

| Karar | Gerekçe | Kaynak |
|---|---|---|
| `XpSource` enum'una dokunulmaz | Enum değişikliği migration ister; ayrım `ruleKey` ve `refType: "Mission"` ile yapılır. | [Ajan: technical-architect, interactive-mission] |
| `firstTry` ayrı alan değil, sorguyla türetilir (görevdeki ilk `MissionAttempt` kaydı) | [Sentez]: veri tekrarını önler. Ana ajan ayrı alan da seçebilir. | — |
| Başlangıç ligi için yeni tablo yok | `joinedAt` alanından sorgu düzeyinde hesaplanabilir; dilimin kapsamı dışında. | [Ajan: technical-architect] |
| Dalga 2: `LiveSession.groupId String?`, `Assignment.groupId String?` | Etkinlik paketi (`ClassGroup` EVENT altında sunum, canlı ders, görev). | [Ajan: product-admin] |
| Dalga 1: `LiveState.phase`, `resumeAt`, `presence.hostOnline`, `welcome.epoch` | Bunlar bellek içi hub durumu ve protokol alanları; şema değişikliği gerekip gerekmediği [V]. | [Ajan: club-live-experience] |
| Silme ve dışa aktarma | Hesap silmede `AuditLog.ip` boşaltılır, liderlikte "Silinmiş üye" görünür. Yönetici XP denetiminde gerçek kimlik korunur, takma ad yalnızca öğrenci görünümüne uygulanır. | [Ajan: product-admin] |

## 6. Etkilenen dosyalar (dilim)

Yollar repoda bulundu [Doğrulandı: dosya varlığı]. Satır numaraları ajan raporlarından alındı ve yeniden doğrulanmadı.

| Dosya | Adım | Değişiklik türü |
|---|---|---|
| `prisma/schema.prisma` + yeni migration | 3 | Ekleme |
| `src/server/academy/content.ts` | 3 | `gorevler` zod şeması |
| `src/server/academy/importer.ts` | 3 | `missions` alanını yazar, ilerlemeyi korur |
| `src/server/academy/service.ts` | 1, 3 | `continueTarget` PROGRAM atlama; görev servis fonksiyonları; `completeLesson` görev kontrolü (`MISSION_PENDING`) |
| `scripts/academy.mjs` | 3 | `check`: `::gorev` ve `::adim` referans denetimi |
| `src/server/xp/defaults.ts` | 4 | `mission.complete` = 60 |
| `src/server/xp/engine.ts` | 4 | `onMissionCompleted` |
| `src/server/rate-limit.ts` | 3 | Yalnızca kullanım (`hit()`); değişiklik beklenmiyor |
| `src/app/api/academy/lessons/[slug]/missions/[id]/check/route.ts` | 3 | Yeni |
| `src/app/api/academy/lessons/[slug]/missions/[id]/complete/route.ts` | 3, 4 | Yeni |
| `src/components/academy/Markdown.tsx` | 2, 3 | `::adim`, `::gorev` direktifleri (mevcut `::animasyon` kalıbı) |
| `src/components/academy/LessonStepper.tsx` | 2 | Yeni |
| `src/components/academy/MissionCard.tsx` | 3, 4, 5 | Yeni; salt-okunur kip |
| `src/components/academy/LessonActions.tsx` | 2, 4 | Kilit nedeni metni; görevli derste tamamla düğmesinin yerine görev |
| `src/app/(member)/academy/lesson/[slug]/page.tsx` | 2, 3 | LessonFrame, görev verisi |
| `src/app/(member)/dashboard/page.tsx` | 1 | İlk görev kartı, `completed === 0` koşulu |
| `src/styles/academy.css`, `src/styles/lab.css` | 2, 3 | LessonFrame, görev kartı; CIU token'ları |
| `src/i18n/tr.ts`, `src/i18n/en.ts` | 1–5 | Yeni metinler |
| `content/academy/01-temel/m01-dijital-tehlikeler/05-uygulama-sahte-burs.md` | 3 | `::adim`, `::gorev`, `gorevler:`; "alta yaz" vaadinin kaldırılması |
| `src/lib/deck-schema.ts` | 5 | `mission` bloğu |
| `src/server/presentations.ts` | 5 | `academyLesson` meta alanı, blok doğrulaması |
| `src/components/presentation/SlideView.tsx`, `DeckPlayer.tsx` | 5 | `MissionCard` render, önizlemede salt-okunur |
| `src/app/live/[code]/LiveViewer.tsx` | 5 | Bitiş köprüsü kartı |
| `src/server/live/hub.ts`, `src/lib/live-protocol.ts`, `src/hooks/useLiveSession.ts` | — | **Dilimde değişmez.** Dalga 1'de K5 düzeltmesi için değişir. |

## 7. Test planı

Mevcut altyapı [Doğrulandı: `package.json`]: `npm run typecheck`, `npm run lint`, `npm test` (vitest; `tests/unit` altında 10, `tests/integration` altında 14 test dosyası), `npm run test:e2e` (build + `e2e/prepare.mjs` + Playwright, `e2e/club-flow.spec.ts`). `00-current-state.md`'ye göre mevcut durum 196 vitest testi ve 13 adımlık E2E. **Mevcut testlerin hepsi yeşil kalmalı.**

### 7.1 Birim (vitest, `tests/unit`)

| # | Test | Adım |
|---|---|---|
| U1 | `gorevler` zod şeması: geçerli/geçersiz tanım, eksik ipucu, bilinmeyen adım tipi | 3 |
| U2 | `publicMissions` çıktısında `dogru` ve `geri` alanları yok (snapshot) | 3 |
| U3 | `gradeMission` saf fonksiyon: doğru/yanlış, çekirdek kanıt koşulu | 3 |
| U4 | Markdown: `::gorev[id]` ve `::adim` ayrıştırma; tanımsız id yer tutucu verir | 2, 3 |
| U5 | `continueTarget`: PROGRAM yolu atlanır, STARTED dalı dahil | 1 |
| U6 | Deck şeması: `mission` bloğu kabul edilir; eski v1 desteler geçerli kalır | 5 |
| U7 | `MissionCard` render çıktısında `input[type=password]` ve `a[href]` yok [Ajan: interactive-mission] | 3 |
| U8 | Azaltılmış hareket ayarında sallanma sınıfı uygulanmaz | 3 |

### 7.2 Entegrasyon (vitest, `tests/integration`, test veritabanı)

| # | Test | Kaynak |
|---|---|---|
| I1 | Ders yanıtında cevap anahtarı bulunmaz; hiçbir ağ yanıtında anahtar yoktur | [Ajan: technical-architect, interactive-mission] |
| I2 | Aynı göreve iki kez doğru gönderim veya iki `complete` isteği: deftere tek XP satırı | [Ajan: technical-architect, interactive-mission] |
| I3 | `mission.complete` kuralı kapalıyken görev çözülür, ders tamamlanır, XP 0 | [Ajan: technical-architect] |
| I4 | Görev çözülmeden `complete` çağrısı: `MISSION_PENDING` | [Ajan: technical-architect] |
| I5 | Tanımsız `::gorev` id'si dersi kilitlemez | [Ajan: technical-architect] |
| I6 | `check` uç noktasında hız sınırı devreye girer | [Ajan: interactive-mission] |
| I7 | `firstTry` ve `hintsUsed` kaydedilir; XP bunlardan bağımsızdır | [Yargıç: learning-scientist] |
| I8 | Canlı deste `mission` bloğunu kabul eder; geçersiz ders/görev referansı reddedilir | [Ajan: technical-architect] |
| I9 | İçerik hash'i değişince importer `m01-05`'i günceller ve ilerlemeyi korur | [Ajan: technical-architect, risk] |
| I10 | Önizleme kipinde görev denemesi kaydı oluşmaz | [Ajan: technical-architect, risk] |

### 7.3 Uçtan uca (Playwright)

| # | Akış | Kaynak |
|---|---|---|
| E1 | Bireysel: yeni üye → ilk görev kartı → yanlış seçim → ipucu → doğru seçim → +XP duyurusu → tamamla | [Ajan: technical-architect] |
| E2 | Canlı: eğitmen görev slaytına geçer → öğrenci çözer → ders bitişinde akademi köprüsü görünür | [Ajan: technical-architect] |
| E3 | Mobil görünüm (375 px): "Gönderene dokun" ile alt sayfa açılır; yatay kaydırma yok | [Ajan: interactive-mission] [Sentez: test ekleme önerisi] |
| E4 | Klavye: görev yalnızca klavyeyle tamamlanır, odak halkası görünür, sonuç `aria-live` ile duyurulur | [Yargıç: accessibility-simplicity] [Sentez] |

### 7.4 Canlı dayanıklılık (Dalga 1; 5 istemci, 1 eğitmen, gerçek soket) [Ajan: club-live-experience]

| # | Senaryo | Geçme ölçütü |
|---|---|---|
| L1 | Sunucu `kill -9`, yeniden başlat; eğitmen 3 kez ileri gider | Tüm istemciler ≤3 sn içinde aynı slayt ve adımda |
| L2 | Telefon 60 sn kilitli kalır | ≤2 sn içinde eşitlenir; aksi halde şerit görünür |
| L3 | Eğitmen ağı 30 sn kesilir | Öğrencide "eğitmen bekleniyor" şeridi; slayt okunur kalır |
| L4 | 16:9 projektör emülasyonu | Quiz ve katılım rozeti kaydırmadan görünür |
| L5 | Açıklanmamış quizle bitirme | Kontrol listesi uyarır; "Açıkla ve bitir" doğru cevaplayanlara XP verir |

### 7.5 Gizlilik (Dalga 1) [Ajan: product-admin]

Kayıt formunda aydınlatma onayı; "Verilerimi indir" yalnızca kullanıcının kendi verisini içerir; silme sonrası aynı e-postayla yeniden kayıt yapılabilir ve `AuditLog.ip` boşalır; 91 günlük `AuditLog` satırında IP temizlenir ve bu `system` sayfasında raporlanır.

### 7.6 Gerçek öğrenci testleri (gelecekte; protokol `06-usability-study.md`)

Bu testler **yapılmadı** ve sonuçları uydurulmayacak. Dilimin "bitti" tanımı için önerilenler:
- 5–8 gönüllü, izinli, farklı bölümlerden öğrenciyle 5 saniye testi. A ve C kabukları karşılaştırılır [Yargıç: learning-scientist, student-ux-research].
- 5 öğrenci, 0 bilgili, telefonda, ipucusuz: en az 4/5 kişi 60 sn içinde gönderen ayrıntısını açar [Ajan: interactive-mission].
- İlk doğru karara 90 sn'den kısa sürede ulaşma [Yargıç: student-ux-research].
- 48 saat sonra görülmemiş bir varyantla kanıtlı karar veren aktarma testi. `learning-scientist` bunun P0 akışların "bitti" tanımına girmesini istiyor.
- 3 gönüllü eğitmenle "Hızlı Etkinlik" zamanlı görev testi (hedef <3 dk) [Ajan: product-admin].

## 8. Docker, kurulum ve güncelleme notları

| Konu | Not | Kaynak |
|---|---|---|
| Yeni servis | Yok. Yeni ortam değişkeni ve volume da yok. Bellek etkisi önemsiz. | [Ajan: technical-architect] |
| Migration | Başlangıçta `migrate deploy` çalışır; yalnızca ekleme yapan migration otomatik uygulanır. | `docker/entrypoint.sh:17` [Doğrulandı] |
| İçerik güncellemesi | İçerik imaja gömülü olduğu için değişiklik imajın yeniden derlenmesini gerektirir: `scripts/club.sh update`. | [Ajan: technical-architect] |
| `club.sh update` akışı | Sırasıyla `git pull --ff-only`, `cmd_backup`, `dc up -d --build --wait`. Aktif `LiveSession` kontrolü **yok**. | `scripts/club.sh:90-100` [Doğrulandı] |
| Canlı ders sırasında güncelleme | WebSocket bağlantıları kopar. Durum veritabanından geri yüklenir ama otomatik oynatma kapanır (`hub.ts:165`). Öneri: güncelleme betiği aktif oturum varsa uyarsın veya onay istesin. K5 düzeltilmeden bu senaryo öğrencide donmaya yol açabilir. | [Ajan: technical-architect, club-live-experience] |
| `compose.yaml` | `caddy.depends_on` için `service_healthy` koşulu yok (küçük not). | [Ajan: technical-architect] [V: yazıcı doğrulamadı] |
| Saklama temizliği | Günlük iş, mevcut `src/server/mail/outbox.ts` deseninde; yeni servis yok. | [Ajan: product-admin] |
| Yedek | `club.sh update` zaten yedek alıyor [Doğrulandı]. Yedeklerin şifrelenmesi ve saklama süresi gizlilik kontrol listesinde açık madde. | [Ajan: product-admin] |

## 9. Riskler

| Risk | Olasılık / etki | Önlem | Kaynak |
|---|---|---|---|
| Cevap sızıntısı: "doğru" bayrağı veya geri bildirim istemciye giderse tıkla-dene ile XP toplanır | Yüksek etki | `publicMissions` süzgeci, U2/I1 snapshot testleri, sunucuda yeniden doğrulama | [Ajan: technical-architect, P0] |
| Kilitlenme: tamamlama XP defterine bağlanırsa kural kapatıldığında ders tamamlanamaz | Yüksek etki | `MissionAttempt` ilerlemenin tek kaynağı; I3 testi | [Ajan: technical-architect, P0] |
| "Gönderen" paneli keşfedilmezse görev tahmine döner | Yüksek etki | Görünür "Gönderene dokun" etiketi, hover yok, 4/5 öğrenci testi | [Ajan: interactive-mission, P0] |
| Simülasyonda gerçek parola kutusu olursa öğrenci gerçek parolasını yazabilir | Kritik | Input içermeyen kutular, U7 testi | [Ajan: interactive-mission, P0] |
| Kaba kuvvetle bedava XP (3 seçenek) | Yüksek | Dalga 1 quiz reformu; yeni XP kuralları ondan sonra | [Yargıç: üçü de, P0] |
| Öğrenci "Canlı" görürken eski slaytta donar | Güveni en hızlı bitiren hata | Dalga 1 `epoch`, L1–L3 testleri | [Ajan: club-live-experience, P0] |
| Kişisel veri süresiz tutulur; silme ve dışa aktarma yolu yok | Kurumsal ve hukuki risk | Dalga 1 gizlilik merkezi; hukuk birimi teyidi | [Ajan: product-admin, P0] |
| Yanlış kitleye görev veya dosya yayını | Orta | Yayın öncesi alıcı özeti (Dalga 2) | [Ajan: product-admin] |
| Önizlemede istenmeyen görev kaydı | Orta | Salt-okunur `MissionCard`, I10 | [Ajan: technical-architect] |
| İki görsel dilin aynı ekranda karışması | Orta (tasarım kalitesi) | §1 katman tablosu; ders ekranında yalnızca C dili, B yalnızca kanca ve kapanışta | [Yargıç: üçü de] |
| Canlı slaytta 3-4 dk'lık görev senkron akışı bozar | Orta | En fazla 60 sn'lik ortak karar; uzun kısım "Evde devam" | [Ajan: club-live-experience] |
| Ders başlıklarında büyük harf kuralının kaldırılması marka sistemiyle çelişir | Düşük-orta | `TASARIM-SISTEMI.md`'ye yazılı istisna | §1 |
| Tüm kabul ölçütleri simülasyon; gerçek öğrenciyle sınanmadı | Yüksek (kanıt eksikliği) | `06-usability-study.md` protokolü; sonuçlar ölçülmeden başarı iddia edilmez | [Yargıç: üçü de] |

## 10. Açık kararlar (ana ajan)

1. §2.4 tablosundaki yedi uyuşmazlık.
2. İlk görevin uzunluğu ve `classify` adımının modül sonuna taşınması (`interactive-mission` onayı gerekiyor).
3. "Emin değilim" kuralının metni.
4. Ders başına karar anı tavanı: 2 mi 3 mü?
5. Canlı görev slaytında görevin ne kadarının gösterileceği.
6. K5 (`epoch`) düzeltmesinin dilime mi, Dalga 1'e mi alınacağı.
7. Tasarım sistemine ders gövdesi başlık istisnası.

### 10.1 Ana ajanın kararları (dilim için)

| # | Karar | Gerekçe |
|---|---|---|
| 1a | Görev tanımı ders front-matter'ında `gorevler:`; yerleştirme `::gorev[id]` | §2.4 sentezi; importer ve hash mevcut kalıpla çalışıyor |
| 1b | XP kuralı `mission.complete` = 60; anahtar `mission:<userId>:<lessonId>:<missionId>` | §2.4 sentezi |
| 1c | API `…/lessons/[slug]/missions/[id]/check` (adım, durumsuz puanlama, hız sınırlı) ve `…/complete` (işlem içinde yeniden puanlama) | §2.4 sentezi |
| 1d | Durum: arayüz adımı `sessionStorage` (try/catch), ilerlemenin tek kaynağı `MissionAttempt` | §2.4 sentezi |
| 1e | Kurgu: **Kuzey Ada Üniversitesi**, `kuzeyada.edu.example` / `burs@kuzeyada-burslar.example` / `giris.kuzeyada-burslar.example` (05 §6.2). "KKU" kısaltması gerçek bir kurumla karışabileceği için kullanılmadı. Diğer 3 derste geçen "Kuzey Kıyı Üniversitesi (kurgusal)" bu dilimde değiştirilmedi (ayrı içerik işi). | 05 §6.2 |
| 2 | İlk görev = 05 §6.6 **kısa sürüm**, 3 karar: kanca+ilk hamle → gönderen (panelle) → tek seçimli kanıt → kapanış. `classify` modül sonu "Beceri kontrolü"ne (Dalga 1) bırakıldı. | 04 F1 ve 07 §2.4 "3 adım ≈3–4 dk" |
| 3 | "Emin değilim" yalnız net kartta ve cezasız: "Dürüst cevap. Bu sefer ipucu ekranda: adrese bak." + 1. ipucu kendiliğinden açılır, soru yeniden sorulur. Belirsiz kart (classify) dilimde yok. | 04 §6.6, 05 Sayfa 2 |
| 4 | Karar anı tavanı **3** (şema + `academy.mjs check` denetler) | Yargıçlardan learning-scientist ve elite-ui-director; ilk görevin 3 adımı bununla uyumlu |
| 5 | Canlı görev slaytı: tam görev **öğrencinin kendi cihazında** akademide; slaytta yalnız köprü kartı ("Görevi aç →"). Senkron 60 sn kısıtı bozulmaz; hub ve protokol değişmez. Ders bitişinde destedeki görevler "Kendi hızında tekrar et" bağlantısı olur. | club-live-experience 60 sn sınırı, technical-architect "protokol değişmez" |
| 6 | K5 (`epoch`) Dalga 1'e | Dilimde protokol değişikliği yok |
| 7 | Ders gövdesi başlık istisnası `TASARIM-SISTEMI.md` §5A.1'e yazıldı; §5A koyu oda **isteğe bağlı** (varsayılan açık oda) | §1 çelişkisi; §2.3 "tüm akademiyi koyu lab'a taşıma" reddi |

---

## Uygulama ve test sonuçları — ana ajan dolduracak

> Yalnızca gerçekten uygulanan ve çalıştırılan işler yazıldı (2026-10-23). Gerçek öğrenci testi **yapılmadı**.

### Uygulanan değişiklikler

| Adım | Dosya | Özet | Durum |
|---|---|---|---|
| 1 | `src/server/academy/service.ts` | `continueTarget` PROGRAM yolunu her iki dalda atlar; `firstMission` (sabit `m01-05`) | Uygulandı |
| 1 | `src/app/(member)/dashboard/page.tsx`, `src/styles/academy.css` | `completed === 0` öğrenciye tek "İlk görev" kartı, tek yeşil düğme; lig/sıra/seri/XP kartı yok; kulüp haberleri katlı şerit | Uygulandı |
| 2 | `lesson/[slug]/page.tsx`, `src/styles/lab.css`, `LabThemeToggle.tsx` | §5A oda iskeleti (breadcrumb, ikon, yol rayı `role=progressbar`, `.lab-prose`, `.lab-qa`); varsayılan açık oda, koyu oda tercihe bağlı | Uygulandı |
| 2 | `Markdown.tsx`, `academy.css` | Eksik görsel yer tutucusu gösterilmez; portresiz dosya kutusu tek kolon | Uygulandı |
| 2 | `LessonActions.tsx` | Görevli derste "Okudum, tamamla" yerine kilit nedeni ("1 görev kaldı …") | Uygulandı |
| 2 | `::adim` adımlayıcı, "Nedir?" sözlük düğmesi | — | **Uygulanmadı** (aşağıda) |
| 3 | `prisma/schema.prisma`, migration `20261023120000_mission_attempts` | `Lesson.missions Json?`, `MissionAttempt` (yalnız ekleme) | Uygulandı |
| 3 | `src/server/academy/missions.ts`, `content.ts`, `importer.ts`, `scripts/academy.mjs` | `gorevler` zod şeması (yalnız `.example/.invalid`, gerçek URL yasak), tutarlılık kuralları, tavan 3, `::gorev` referans denetimi | Uygulandı |
| 3 | `api/academy/lessons/[slug]/missions/[id]/{check,complete}` | Adım geri bildirimi (hız sınırlı, 2 yanlıştan sonra çözümlü örnek), işlem içinde yeniden puanlama | Uygulandı |
| 3 | `MissionCard.tsx`, `mission.css` | Kanca bandı, posta maketi, "Gönderene dokun" karşılaştırma paneli (farklı parça mor halka), simülasyon giriş ekranı (input yok), ipuçları, `aria-live`, `sessionStorage` ile devam, kapanış kartı (DOSYA KAPANDI + portre + 3 kural + sonraki merak) | Uygulandı |
| 3 | `content/academy/01-temel/m01-dijital-tehlikeler/05-uygulama-sahte-burs.md` | 05 §6.6 kısa sürüm; "alta yaz" vaadi ve gövdedeki cevap anahtarı kaldırıldı | Uygulandı |
| 4 | `src/server/xp/defaults.ts`, `engine.ts` | `mission.complete` = 60, `onMissionCompleted`; görevli derste `lesson.complete` yok; backfill görevli dersleri atlar | Uygulandı |
| 5 | `deck-schema.ts`, `presentations.ts`, Studio (`BlockEditor`, `Studio`, `page`), `SlideView.tsx`, `LiveViewer.tsx`, `presentation.css` | `mission` bloğu (Studio'dan seçilir, kayıtta doğrulanır), slaytta köprü kartı, ders bitişinde "Kendi hızında tekrar et" | Uygulandı |

### Komut çıktıları

| Komut | Dilim öncesi | Dilim sonrası | Not |
|---|---|---|---|
| `npm run typecheck` | hatasız | hatasız | |
| `npm run lint` | hatasız | hatasız | |
| `npm test` | 196/196 (Faz 6 kaydı) | **217/217** (26 dosya) | |
| `npm run test:e2e` | 1/1 (13 adım) | **1/1** (13 adım + 4b ilk görev) | Liderlik beklentisi 130 → 190 XP (+60 görev) |
| `npm run academy:check` | hatasız | hatasız | |

### Yeni testler

| Test | Tür | Sonuç |
|---|---|---|
| `tests/unit/missions.test.ts` — U1 şema, U2 süzgeç, U3 puanlama, gerçek `m01-05` içeriği, U6 deste şeması | Birim | 10/10 ✅ |
| `tests/unit/terminal-parse.test.ts` | Birim | 5/5 ✅ |
| `tests/integration/missions.test.ts` — I1, I2+I7, I3, I4 (+ ders kilidi), I8, U5 | Entegrasyon | 6/6 ✅ |
| `e2e/club-flow.spec.ts` adım 4b — E1 (tek kart → yanlış → simülasyon → ipucu → doğru → panel → kanıt → DOSYA KAPANDI → +60 XP; maket içinde `a[href]` ve `input` yok) | E2E | ✅ |

### Uygulanmayanlar ve nedenleri

| Madde | Neden | Sonraki adım |
|---|---|---|
| `::adim` adımlayıcı ve yapışkan eylem çubuğu (Adım 2) | Dilim görev düzenine odaklandı; 183 sayfanın ders düzeni ayrı iş | Dalga 1, önce Temel kısımdan birkaç ders |
| "Nedir?" jargon düğmesi | İçerik tarafında sözlük verisi yok | İçerik + bileşen birlikte |
| Quiz reformu (karıştırma, varyant, ilk yanlışta cevabı vermeme) | Dalga 1 P0; yeni ustalık XP'si bundan önce eklenmedi | Dalga 1 |
| Beceri kontrolü `classify` + "Emin değilim" belirsiz kart | §10.1 karar 2 | Dalga 1 |
| "Hızlı gidiyorsun, 2 dersi atla" tanılama önerisi | Tasarımı açık (learning-scientist) | firstTry verisi `MissionAttempt`'te hazır |
| K5 `epoch`, canlı dayanıklılık L1–L5, gizlilik merkezi | Dalga 1 (§10.1 karar 6) | Dalga 1 |
| Mobilde alttan açılan panel (bottom sheet) | Panel satır içinde açılıyor; 375 px'de taşma yok | Gerçek telefon testiyle karar |
| Diğer derslerdeki "Kuzey Kıyı Üniversitesi" kurgusu | Kapsam dışı içerik değişikliği | İçerik turunda tek kurguya geçiş |
| Gerçek öğrenci testleri (5 sn, 90 sn, 48 saat aktarma) | Yapılmadı; sonuç uydurulmaz | `06-usability-study.md` protokolü |

### Çalıştırma yönergeleri

```bash
npx prisma migrate deploy        # yalnız ekleme yapan migration
npx tsx cli.ts academy-import    # m01-05 görevini içeri alır
npm run dev                      # /academy/lesson/m01-05
npm test && npm run test:e2e
```
Docker kurulumunda başlangıçtaki `migrate deploy` migration'ı uygular; içerik değiştiği için imaj yeniden derlenmeli ve yönetimden "İçeriği şimdi içe aktar" çalıştırılmalı.
