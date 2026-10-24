# 03 — Tasarım yönleri: üç konsept ve değerlendirme matrisi

> **Not:** Ajanlar bu oturumda Claude Code alt ajanı olarak, her biri kendi `.claude/agents/<ad>.md` tanımını sistem rolü olarak okuyarak AYRI ayrı çalıştırıldı (yeni eklenen ajan tipleri oturum yeniden başlamadan yerel tip olarak yüklenemediği için). Agent Teams kullanılmadı; tartışma, ana ajanın ayrı raporları birbirine iletmesiyle yürütüldü — "simüle edilmiş toplantı" değil, ayrı raporlardan sentez. Tur 1'de çalışan ajanlar: tryhackme-ux, htb-academy-ux, elite-ui-director, student-zero-knowledge, student-curious-beginner, student-bored-skeptic, underground-storyteller, learning-scientist, gamification-economy, interactive-mission, club-live-experience, motion-visual, accessibility-simplicity, student-ux-research, product-admin, technical-architect.

## 0. Bu belgenin kaynakları ve sınırları

| Kaynak | Tur | Bu belgede kullanımı |
|---|---|---|
| `elite-ui-director` Tur 1 raporu | 1 | Üç konseptin ilk tanımı, ortak durum dili, ilk melez önerisi |
| `elite-ui-director` tartışma raporu | 2 | Konseptlerin güncellenmiş tanımı, `LessonFrame`, yüzey kuralı |
| `tryhackme-ux` tartışma raporu | 2 | İlk görev uzunluğu, kurulumun ertelenmesi, navigasyon adları |
| `htb-academy-ux` tartışma raporu | 2 | Kontrol noktası kilidi, iki ders düzeni, `continueTarget` bulgusu |
| `learning-scientist` tartışma raporu | 2 | Ölçme, güven sorusu, seviye gözlemi |
| `underground-storyteller` tartışma raporu | 2 | Kanca = görev cümlesi, kötü adam ifşası |
| Yargıç raporları: `learning-scientist`, `accessibility-simplicity`, `student-ux-research` | 3 | Puanlar, çözülmemiş P0 listesi, melez görüşü |

- Diğer ajanların (öğrenci personaları, `gamification-economy`, `interactive-mission`, `club-live-experience`, `motion-visual`, `product-admin`, `technical-architect`) görüşleri burada **yalnızca yukarıdaki raporlardaki atıflar üzerinden** yer alıyor. Tam Tur 1 metinleri `01-agent-findings.md` belgesine aittir.
- `tryhackme-ux` ve `htb-academy-ux`, tartışma turunda kendi Tur 1 raporlarının girdilerinde olmadığını, önerilerini diğer raporlardaki alıntılardan çıkardıklarını belirtti.
- **Öğrenci tepkileri simülasyondur.** Gerçek kullanıcı verisi yoktur. Ekranlardaki sayılar ("4/12", "320 XP", "≈5 dk") örnek değerdir, ölçüm değildir.
- Bütün konseptler CIU tasarım sistemine (`docs/TASARIM-SISTEMI.md`) bağlıdır: mor `--ciu-purple`, neon yeşil yalnızca eylem (`--ciu-green`, üzerinde `--ciu-ink` metin), krem `--ciu-cream`, Lexend Tera / Readex Pro, hap düğme, 20px gölgesiz kart, galaxy degradesi. **Hiçbir konsept yeni renk ya da font eklemez** (elite-ui-director).

---

## 1. Ortak temel (üç konseptte aynı)

### 1.1 Mevcut durumdan devralınan sorunlar
`00-current-state.md` ve `elite-ui-director` Tur 1 bulguları, konseptlerin çözmesi gereken sorunları belirliyor:

| Kod | Sorun | Kaynak | Durum |
|---|---|---|---|
| K1 | `globals.css:162` tüm `h1–h6`'yı Lexend Tera + uppercase + -0.12em yapıyor; ders Markdown başlıkları da bu kurala düşüyor | elite-ui-director | Kanıt (kod); okunabilirlik etkisi varsayım |
| K2 | Üç ayrı koyu palet (sahne `#2E2E2E/#383838`, lab `#15112B`, terminal `#0F1923`); `--gold`, `--color-arterial-red`, `.dot-red` adları farklı renklere bağlı | elite-ui-director | Kanıt (kod) |
| K3 | Dashboard'da öncelik sırası yok; "Devam et" üçüncü kat aşağıda, "Kalkan dosyan" açıklanmamış | elite-ui-director | Kanıt (kod); ilk 30 sn etkisi varsayım |
| — | `continueTarget` önce `STARTED` dersi döndürüyor; PROGRAM sayfası bir kez açılırsa "Devam et" broşüre gider (`service.ts:186-191`) | htb-academy-ux | Kanıt (kod) |
| — | `MIN_READ_MS = 15_000` ile 15 sn bekleyip tıklamak XP getiriyor (`service.ts:143-144`) | tryhackme-ux, htb-academy-ux | Kanıt (kod) |

### 1.2 Ortak durum dili (elite-ui-director)

| Durum | Görünüm |
|---|---|
| Yükleniyor | Krem iskelet, 1.2 sn nabız; aynı boyutta iskelet kart |
| Boş | Tek cümle + tek eylem |
| Hata | `--ciu-error` metin + "Tekrar dene". Ders içinde: "Yanıtın kaydedildi, bağlantı dönünce gönderilir." |
| Kopma (canlı) | Üst bant: "Yeniden bağlanıyor… sunum 12. slaytta" |
| Hepsi bitti | "Bugünlük bitti." + 3 soruluk "Hatırla" kartı (Tur 2 eki) |

### 1.3 Ortak tipografi ve yüzey kararları (Tur 2 sonrası)
- **Üç kademeli yazı** (elite-ui-director Ö1): Lexend Tera yalnızca `display`, `h1` ve sayfa kahramanında, en fazla 6 kelime. `h2–h4` Readex Pro 500, cümle düzeni (sentence case). Uppercase yalnızca hero'da ve sayfa başına tek üst etikette (`.eyebrow`). -0.12em yalnızca `html.fonts-ready` altında. Önerilen tokenlar: `--type-display`, `--type-title`, `--type-section` (Readex 500 · 20/28), `--type-label`.
- **Yüzeyi nesne türü belirler, öğrencinin ilerlemesi değil** (elite-ui-director Tur 2; Tur 1'deki "tek gece yüzeyi" önerisini daralttı):
  - `--surface-paper` (krem): ders metni, kararlar, posta maketi, ana ekran — ürünün yaklaşık %90'ı.
  - `--surface-night`: yalnızca kanıt nesneleri (log kartı, terminal, ağ akışı); bu yüzeylerde `--focus-ring: #17FF74` (accessibility-simplicity Ö1'e atıfla).
  - Projeksiyon için `salon` kipi: krem zemin, gövde metni en az 28px, sağ altta "katıl" rozeti (club-live-experience Ö3'e atıfla).
- **Anlam tokenları** (elite-ui-director Ö2): `--signal-action` (yeşil), `--signal-brand` (mor), `--signal-live` (macenta nokta), `--signal-warn` (`#FFB020`). Eski adlar uyarı yorumuyla bir sürüm daha tutulur, sonra kaldırılır.

> Yüzey kuralı konusunda **açık not:** `tryhackme-ux` ve `htb-academy-ux` koyu lab temasının "ilk 3 dersten sonra isteğe bağlı" açılmasını istiyor. `elite-ui-director` ise koyuyu bir aşama/ödül yapmaya itiraz edip nesne türüne bağlıyor. İkisi de "varsayılan koyu tema yok" noktasında birleşiyor; "isteğe bağlı koyu tema" seçeneğinin kalıp kalmayacağı `04-final-ux-spec.md`'de kapatılmalı.

---

## 2. Konsept A — Mission Control

**Fikir:** Temiz, hedefli, ilerleme merkezli. Öğrenci her an "bugünün tek işi"ni görür.

### 2.1 Ekranlar

| Ekran | Tur 1 tanımı (elite-ui-director) | Tur 2 sonrası değişiklik |
|---|---|---|
| **İlk giriş** | 3 adımlı kurulum: ad → bölüm → "Ne kadar biliyorsun? Hiç / Biraz / Rahatım" → doğrudan ilk 5 dakikalık görev | **Kurulum kaldırıldı.** İlk ekranda form yok; kurulum ilk görevden sonra, atlanabilir, bölüm sorusu isteğe bağlı (tryhackme-ux, learning-scientist, elite-ui-director kabul etti). Seviye sorulmuyor, gözlemleniyor (learning-scientist). |
| **Ana ekran** | Solda dar "Görev Panosu" (Bugün: 1 kart · Bu hafta: 3 satır · Kulüp: canlı). Sağda ilerleme kolonu: yol halkası + haftalık hedef (3/5 adım). Krem zemin, galaxy yalnızca halka dolgusunda | `completed === 0` iken **tek kart**: `İLK GÖREV · 5 DK` / "Bir mesaj geldi. Gerçek mi?" / [Mesajı aç →]. Kart doğrudan görev sayfasını açar, PROGRAM sayfalarını atlar. Görevler ve duyurular tek satırlık katlı "Kulüp" şeridinde. Haftalık hedef ilk hafta gizli; sağ kolon ilk tamamlamaya kadar yok. İlk görevden sonra: "Sıradaki adım" kartı + "2 adım kaldı". |
| **Gezinme** | Mevcut mor üst başlık | 5 sekme: **Bugün / Öğren / Canlı / Kulüp / Ben**. "Görevler" → "Kulüp" (alt satır: "Görevler · Dosyalar · Sınıflar"); "Ben" → "İlerleme" ve "Hesap" alt sekmeleri; "Öğren" alt satırı "Dersler, kendi hızında" (tryhackme-ux). |
| **Ders kartı** | 20px kart, solda 4px durum şeridi; "M03 · Hesap koruması", "≈6 dk", "+40 XP", zorluk rozeti; tek düğme "Başla"/"Devam" | Zorluk rozeti yerine **"Kimler için: ilk kez başlayanlar · Ön koşul: yok"**; zorluk yalnızca Sezon 2'de (htb-academy-ux, curious-beginner itirazıyla). |
| **Ders içi** | Üstte 12px galaxy ilerleme rayı, "Adım 2/6"; her ekranda tek fikir + bir etkileşim; yeşil "Kontrol et" sağ altta, "İpucu" ikincil | İlerleme rayı/halkası **okunan sayfaları değil, geçilen karar anlarını sayar** (learning-scientist, elite-ui-director kabul etti). |
| **Canlı kulüp** | Öğrencide sahne + "Eğitmen 4/12 · sen senkron" etiketi, el kaldır ve soru sor. Eğitmen konsolunda katılımcı ızgarası, quiz yanıt çubukları, QR | Değişmedi. Kopma bandı ortak durum dilinden. |
| **Profil** | Yol haritası ızgarası, rozet rafı, "Bu ay 320 XP · Yeni Gelenler ligi" | Lig, seri ve haftalık hedef **ilk görev bitene kadar hiç gösterilmez**; sonra tek satır açıklama: "XP: ilerlemeni gösteren puan. Listede görünmek isteğe bağlı." (tryhackme-ux). Takma ad sunucuda otomatik atanır; seçim liderlik sayfasının ilk ziyaretinde satır içi, modal değil (tryhackme-ux; gamification-economy ve product-admin ile uyumlu olduğu belirtildi). |
| **Admin özeti** | 4 KPI (aktif üye, bu hafta tamamlanan adım, bekleyen teslim, onay bekleyen) + eylem listesi | Değişmedi. |

### 2.2 Örnek ekran (elite-ui-director Tur 1, `/dashboard`)
```
[eyebrow] CIU CYBER SECURITY CLUB
[h1 Lexend] MERHABA, EREN
[kart] Sıradaki adım · ≈5 dk · +60 XP
  "Şüpheli mesaj"
  Bir burs e-postası geldi. Herkes tıklıyor. Sen önce bir bak.
  [● Başla]
```
> Tur 1'deki "Bilgin yoksa sorun değil, buradan başlanır" satırı kısaltıldı ve "Bu ay 0 XP · Yeni Gelenler ligi · sıralamada görünmen kapalı (değiştir)" şeridi **kaldırıldı**: ilk 30 saniyede üç yeni kavram yüklüyordu (elite-ui-director Tur 2'de kabul etti).

### 2.3 Mikro kopyalar (elite-ui-director)
- "Bugünün tek işi bu. Gerisi bekleyebilir."
- "Hedefe 2 adım kaldı. Bir kahve süresi."
- "Senkron kaldın. Eğitmen ilerledikçe ekranın da ilerler."
- Hata durumu (Tur 2): "Görev açılamadı. [Tekrar dene]"

### 2.4 Güçlü ve zayıf yanlar (yargıç gerekçelerinden)
- **Güçlü:** Hedefi netleştirerek gereksiz bilişsel yükü azaltır (learning-scientist, [Araştırma-güçlü: Sweller]). Tek kart ve net sonraki adım P0 sürtünmelerini doğrudan kapatır (accessibility-simplicity).
- **Zayıf:** Tek başına öğrenme mekanizması getirmez; halka sayfa sayarsa vekil metriği ödüllendirir (learning-scientist). Tur 1 sürümündeki kurulum sorusu, 0/5 hedef ve boş ilerleme kolonu ilk gün baskı yaratır (accessibility-simplicity, student-ux-research).

---

## 3. Konsept B — Cyber Mystery

**Fikir:** Dosya inceleme, hikâyeli görev; sinematik ama kolay.

### 3.1 Ekranlar

| Ekran | Tur 1 tanımı (elite-ui-director) | Tur 2 sonrası değişiklik |
|---|---|---|
| **İlk giriş** | Gece paletinde kısa sahne: "Kampüste bir şey dönüyor. İlk dosya masanda." → [Dosyayı aç]; "Atla" her zaman görünür | **Ayrı sahne ekranı kaldırıldı.** Kanca görevin cümlesi olur ve 0. saniyede seçim içerir; atlanacak bir şey kalmadığı için "Atla" da gerekmez (underground-storyteller). Örnek aşağıda. |
| **Ana ekran** | Gece yüzeyinde "Vaka Masası": açık vaka büyük kartta, arşiv küçük kartlarda; canlı derste macenta "CANLI OTURUM" şeridi; krem açık tema seçeneği | B **kabuk olarak elendi**; ana ekran A'dan gelir (bkz. §6). |
| **Ders kartı** | Görsel üstünde `--ciu-gradient-card-overlay`; "VAKA 03", insan dilinde başlık ("Sızdırılan Şifre"), "≈7 dk · +60 XP"; kötü adam portresi yalnızca bu kartta | **Portre karttan ve ders başından çıkarıldı**, yalnızca kapanış kartında "ifşa" olarak görünür. Gerekçe: altın dişli dolandırıcıyı görevden önce göstermek "kötü adam belli olur" diye yanlış tehdit modeli öğretir; m01-02 "hacker sıradan biri olabilir" diyor (underground-storyteller, learning-scientist'in "seductive details" uyarısı ve motion-visual'in "portre bölümde bir kez yeter" görüşüne atıfla). |
| **Ders içi** | Solda kanıt paneli (sahte e-posta, log kartı), sağda "Ne fark ettin?"; kanıta tıklayınca vurgu; "DOSYA KAPANDI" yalnızca bölüm sonunda | B'nin etkileşim yapısı **ders motoru** olur: kanıt topla → karar ver → gerekçe göster → yeni vakaya aktar (learning-scientist, underground-storyteller; elite-ui-director Tur 2'de kabul etti). Posta maketi **krem** (interactive-mission itirazı); "Gönderene dokun ▸" çipi görünür, hover'a bağlı değil. Evidence ve classify tek adımda birleşir (elite-ui-director). |
| **Canlı kulüp** | "Brifing odası": herkes aynı kanıtı görür, eğitmen bir alanı işaretleyince öğrencilerde parlar; anket "Ekibin oyu" | Koyu, düşük kontrastlı sahne projektörde riskli (club-live-experience); canlıda `salon` kipi önerildi. |
| **Profil** | "Dedektif dosyası": çözülen vakalar, rozetler, takma ad | Unvan ve rütbeler "iyi taraf"ta kalır; Gölge Ağ yalnızca karşı taraf (underground-storyteller, gamification-economy'ye atıfla). |
| **Admin özeti** | Vaka bazında takılma noktaları ("Vaka 03, adım 4'te %X geri dönüş" — veri gelince doldurulur) | Değişmedi; **%X yer tutucudur, veri yoktur.** |

### 3.2 Örnek kanca ve kapanış (underground-storyteller)
```
23:47. Deniz'in telefonuna bir mesaj düştü:
"Bursun onaylandı, 24 saat içinde doğrula."
Deniz ne yapsın?  [Bağlantıya dokun]  [Göndereni incele]  [Gruba ilet]
```
```
DOSYA KAPANDI. Mesajı "Burs Ofisi" yazmamıştı. Tatlı Dil Tevfik.
Kibar, acil, tanıdık. Hep böyle gelir.
[Sıradaki: Onay ikinci kez geldi →]
```
- Nöbetçi anlatıcı yalnızca 3 yerde konuşur: kanca, yanlış cevabın sonucu, kapanış. Talimat metinleri düz Türkçe (underground-storyteller; bored-skeptic ve curious-beginner itirazıyla).
- Saat damgası yalnızca kanca bandında (elite-ui-director, underground-storyteller).

### 3.3 Mikro kopyalar
- "Her şey yerli yerinde. Bir satır hariç." (elite-ui-director)
- "Yanlış iz. Ama bir şeyi eledin, bu da iş." (elite-ui-director)
- "Dosya kapandı. Bir sonraki masanda." (elite-ui-director)
- "Dürüst cevap. Bu sefer ipucu ekranda: adrese bak." — net kartta "Emin değilim" seçildiğinde (underground-storyteller)

### 3.4 Güçlü ve zayıf yanlar
- **Güçlü:** Vaka temelli yapı (kanıt, karar, gerekçe, aktarma) gerçek beceriyi ölçmeye en uygun mimari (learning-scientist, [Araştırma-orta]). İlgi kriterinde en yüksek konsept (üç yargıç).
- **Zayıf:** Gece kabuğu ve sinematik giriş dersle ilgisiz çekici ayrıntılarla yükü artırır (learning-scientist, [Araştırma-orta: Harp & Mayer]); IT dışı öğrenciye "hacker ortamı, bana göre değil" sinyali verir; koyu yüzeyde odak halkası ve kontrast riski (accessibility-simplicity). En pahalısı: MissionRunner, sunucu doğrulaması, görsel üretim (learning-scientist). Hikâye kromu (damga, sansür bandı, daktilo) navigasyona ve düğmelere yayılırsa okunabilirlik düşer (elite-ui-director Tur 1 itirazı).

---

## 4. Konsept C — Friendly Academy

**Fikir:** Minimum karmaşa, açık öğrenme yolları, küçük başarılar.

### 4.1 Ekranlar

| Ekran | Tur 1 tanımı (elite-ui-director) | Tur 2 sonrası değişiklik |
|---|---|---|
| **İlk giriş** | "Hiç bilmiyorum" öne çıkarılmış; ilk ders "Dijital izin"; 2 ekranda biter | "Hiç" demek utandırabilir (öğrenci personaları, learning-scientist'in aktarımıyla); seviye sorusu yerine ilk görevin ilk iki kararı tanılama verisi olur. İkisi ilk denemede doğruysa: "Hızlı gidiyorsun, istersen 2 dersi atla" (isteğe bağlı) (learning-scientist). |
| **Ana ekran** | Krem zemin, ortada tek "Sıradaki adım" kartı; altında 12 bölümlük dikey patika, tamamlananlar yeşil işaretli | Patikada **yalnızca sıradaki 3 düğüm açık**, kalanı "+9 adım" altında katlı (curious-beginner itirazı; tryhackme-ux, learning-scientist, elite-ui-director kabul etti). |
| **Ders kartı** | Büyük ikon, 4–6 kelimelik başlık, "≈5 dk"; jargon altı noktalı çizgiyle, dokununca sözlük | Jargon **ilk geçtiği yerde parantez içinde** açıklanır: "OSINT (internette iz sürmek)". İkinci katman "Nedir?" düğmesi (`aria-expanded`, dokunmatikte çalışır; hover'a bağlı değil) (elite-ui-director; accessibility-simplicity P0). Zorluk rozeti yok, "Kimler için: ilk kez başlayanlar". |
| **Ders içi** | Tek kolon, en fazla 75ch; her adımda 1 fikir, 1 soru; geri bildirim kartı nedenini açıklar | Tek **`LessonFrame`** iskeleti: üstte 12px ilerleme rayı (`--progress-track`), ortada en fazla 640px gövde, altta yapışkan `.action-bar` (tek yeşil düğme). Krem zemin, Readex 17/1.6. Görsel hazır değilse **hiç gösterilmez** (motion-visual P0'a atıfla). |
| **Canlı kulüp** | Basit sahne, büyük "El kaldır"; ders bitince "Kaldığın derse dön" + ilgili görev kartı | Değişmedi. Bu köprü `00-current-state.md` sorun 8'i ("Ders sona erdi" kartında kalma) doğrudan hedefliyor. |
| **Profil** | Haftalık mini başarılar ("3 gün üst üste"), seri telafisi bilgisi | Seri ve lig bilgisi ilk görevden sonra (A ile aynı kural). |
| **Admin özeti** | "Bu hafta kulüp" anlatı kartı + 3 sayı | Değişmedi. |

### 4.2 Mikro kopyalar (elite-ui-director)
- "Bilmemek başlangıç noktası, eksiklik değil."
- "Yanlış oldu, sorun değil. Nedenine bakalım."
- "Küçük adım, gerçek beceri: göndereni kontrol ettin."
- Tur 2 düzeltmesi (tryhackme-ux, bored-skeptic itirazıyla): yanlış cevapta "Mantıklı bir tahmin" yerine **"Yakın. Adrese bir daha bak."** Cesaretlendirme cümlesi yalnızca ilk girişte ve ilk yanlışta görünür.
- Çözümlü örnek (learning-scientist): "Birlikte bakalım: adresi harf harf okulunkiyle karşılaştırıyoruz…"

### 4.3 Güçlü ve zayıf yanlar
- **Güçlü:** En düşük bilişsel yük, en iyi erişilebilirlik, en düşük maliyet; mevcut krem zemin ve CIU tokenlarıyla uyumlu (accessibility-simplicity, student-ux-research). 0 bilgili öğrenciye en uygun (learning-scientist).
- **Zayıf:** Tutundurma için zayıf (ilgi 5, üç yargıç); "kolay kalma" riski, öğrenmeyi güçlendiren zorluk eksik, ilk ders bir okuma metni (learning-scientist, [Hipotez]).

---

## 5. Değerlendirme matrisi (Tur 3)

> **Bu puanlar uzman değerlendirme puanıdır, ölçüm ya da kanıt değildir.** Gerçek öğrenci verisi yoktur; öğrenci itirazları simülasyondur. Puanlar 1–10 ölçeğinde, üç yargıç ajan tarafından ayrı ayrı verildi. Ağırlıklar `MASTER_PROMPT.md` Tur 3'ten: anlaşılabilirlik %35, ilgi/sürükleyicilik %25, öğrenme değeri %20, erişilebilirlik %10, uygulama maliyeti/karmaşıklık %10 (maliyette yüksek puan = daha ucuz/basit).
>
> Puanlanan konseptler, Tur 2 tartışmasından sonraki güncellenmiş tanımlardır. **Melez ayrıca puanlanmadı.**

### 5.1 Yargıç puanları

| Yargıç | Konsept | Anlaşılabilirlik | İlgi | Öğrenme | Erişilebilirlik | Maliyet | Ağırlıklı |
|---|---|---:|---:|---:|---:|---:|---:|
| learning-scientist | A | 8 | 5 | 6 | 8 | 7 | 6.75 |
| learning-scientist | B | 5 | 8 | 8 | 5 | 4 | 6.25 |
| learning-scientist | C | 9 | 5 | 6 | 9 | 8 | 7.30 |
| accessibility-simplicity | A | 7 | 6 | 7 | 7 | 6 | 6.65 |
| accessibility-simplicity | B | 4 | 9 | 8 | 4 | 3 | 5.95 |
| accessibility-simplicity | C | 9 | 5 | 7 | 9 | 8 | 7.50 |
| student-ux-research | A | 8 | 6 | 6 | 8 | 6 | 6.90 |
| student-ux-research | B | 4 | 9 | 7 | 4 | 3 | 5.75 |
| student-ux-research | C | 9 | 5 | 7 | 9 | 8 | 7.50 |

Satır bazındaki ağırlıklı toplamlar bu belge için yargıç puanlarından hesaplandı.

### 5.2 Ortalama ve ağırlıklı toplam

| Konsept | Anlaşılabilirlik (%35) | İlgi (%25) | Öğrenme (%20) | Erişilebilirlik (%10) | Maliyet (%10) | **Ağırlıklı toplam** | Sıra |
|---|---:|---:|---:|---:|---:|---:|:---:|
| A · Mission Control | 7.7 | 5.7 | 6.3 | 7.7 | 6.3 | **6.77** | 2 |
| B · Cyber Mystery | 4.3 | 8.7 | 7.7 | 4.3 | 3.3 | **5.98** | 3 |
| C · Friendly Academy | 9.0 | 5.0 | 6.7 | 9.0 | 8.0 | **7.43** | 1 |

(Ortalamalar tek ondalığa yuvarlandı; ağırlıklı toplam yuvarlanmamış ortalamalardan hesaplandı.)

### 5.3 Matrisin okunuşu
- **C tek başına en yüksek puanı alıyor**, çünkü en ağır kriterde (anlaşılabilirlik) üç yargıç da 9 verdi. Ama ilgi kriterinde en düşük konsept (5.0).
- **B ilgide (8.7) ve öğrenmede (7.7) en yüksek**, anlaşılabilirlik, erişilebilirlik ve maliyette en düşük. Yargıçların ortak yorumu: B'nin değeri kabuğunda değil, etkileşim yapısında.
- **A** kriterlerin çoğunda ortada; iskelet olarak güçlü, tek başına öğrenme mekanizması zayıf.
- Kriterlere göre en iyi konsept üç farklı yerde: anlaşılabilirlik ve erişilebilirlik C, ilgi ve öğrenme B, gezinme ve ilerleme sinyali A. Bu dağılım, üç yargıcın da melez önermesinin temel gerekçesi.
- Yargıç sayısı üçtür ve üçü de anlaşılabilirlik ile erişilebilirliğe odaklı roller; ilgi kriterini savunan bir rol (ör. `underground-storyteller`, `gamification-economy`) yargıç değildi. Bu bir sınırlılıktır.

---

## 6. Karar: gerekçeli melez (koşullu)

### 6.1 Karar
Üç yargıç da (learning-scientist, accessibility-simplicity, student-ux-research) bağımsız olarak aynı melezi destekledi; tasarım tarafında `elite-ui-director` Tur 1'de önerip Tur 2'de güncelledi:

| Katman | Kaynak konsept | Ne alınıyor |
|---|---|---|
| **Kabuk** (ana ekran, gezinme, ilerleme) | **A · Mission Control** | 5 sekme (Bugün/Öğren/Canlı/Kulüp/Ben); `completed === 0` iken tek "Sıradaki adım" kartı; halka, haftalık hedef ve lig ilk görevden sonra; ilerleme rayı karar anlarını sayar |
| **Dil ve ders gövdesi** | **C · Friendly Academy** | Krem zemin, tek `LessonFrame` (ray, ≤640px gövde, yapışkan tek yeşil düğme), parantezli jargon + "Nedir?", gerekçe veren kısa geri bildirim, cesaretlendirme yalnızca ilk girişte/ilk yanlışta |
| **Etkileşim motoru** | **B · Cyber Mystery** (yapısı) | Kanıt topla → karar ver → gerekçe göster → yeni vakaya aktar |
| **Atmosfer** | **B · Cyber Mystery** (görsel dili) | Yalnızca kanca bandı (tek cümle, saat damgası yalnızca orada) ve kapanış kartı (DOSYA KAPANDI + kötü adam ifşası, portre yalnızca burada) |
| **Elenenler** | — | B'nin tam gece kabuğu ve sinematik girişi; A'nın 3 adımlı kurulumu; ders gövdesindeki hero görsel, başlangıç DOSYA kutusu ve "Gölge Ağ hikâyesi →" bağlantısı |

**Tek ekranda tek dil kuralı:** Kabuk ekranları A; ders adımları C dili + B etkileşimi; kapanış kartı B atmosferi. Hiçbir ekranda iki görsel dil yan yana durmaz (`MASTER_PROMPT.md` Tur 3: "bir ekranda üç tasarımın karışımı olmasın").

### 6.2 Gerekçe
1. **Anlaşılabilirlik en ağır kriter (%35)** ve tam B kabuğu bu kriterde en riskli seçenek (ortalama 4.3). Kabuğu ve dili A ile C'ye vermek bu riski kaldırır (elite-ui-director, accessibility-simplicity).
2. **İlgi (%25) için B gerekli.** C tek başına ilgide 5.0 alıyor; B'nin merak yapısı bu boşluğu dolduruyor (elite-ui-director, student-ux-research).
3. **Öğrenme değeri B'nin süsünden değil yapısından geliyor.** Vaka mimarisi aktarmayı ölçmeye en uygun yapı; C'nin dili ise düşük kaygıyı sağlıyor. Melez ikisini aynı anda mümkün kılıyor (learning-scientist).
4. **Hikâye öğrenmeye hizmet ediyor:** Kötü adam ifşası kapanışta "kibar ve acil" kuralını tekrar ediyor; başta gösterilseydi yanlış tehdit modeli öğretirdi (underground-storyteller). Bu, `MASTER_PROMPT.md`'deki üçüncü önceliği ("hikâye güvenlik öğrenmesini destekleyecek, onun yerini almayacak") karşılıyor.
5. **Maliyet:** Kabuk ve gövde mevcut krem zemin ve CIU tokenlarıyla uyumlu; en pahalı kısım (MissionRunner, sunucu doğrulaması) yalnızca etkileşim motorunda yoğunlaşıyor.

### 6.3 Bağlayıcı şartlar (learning-scientist yargıç raporu)
1. Ders başına sınırlı sayıda karar anı ve her biri bir `yapabilir` maddesine eşlenir; eşlenmeyen madde "Bitince yapabileceğin" kartından silinir.
2. `firstTry` ve ipucu kullanımı arka planda kaydedilir; XP bunlardan bağımsız kalır; 2 yanlıştan sonra çözümlü örnek açılır.
3. Ustalık XP'si ancak quiz reformundan (varyant havuzu, seçenek karıştırma, ilk yanlışta cevabın verilmemesi) sonra devreye girer; aksi halde yeni XP tablosu kaba kuvveti ödüllendirir.

### 6.4 Neden "kesin kazanan" değil, "koşullu karar"?
`MASTER_PROMPT.md` Tur 3: "P0 öğrenci itirazlarını çözmeden kazanan ilan etme." Aşağıdaki P0'lar yargıç raporlarında **hâlâ açık** olarak listelendi. Melez bu belgeyle **yön** olarak seçilmiştir; P0'lar kapanmadan ve Tur 4 testleri yapılmadan kazanan ilan edilmiş sayılmaz.

| # | Açık P0 | Bildiren yargıç(lar) | Konseptten bağımsız mı? |
|---|---|---|---|
| 1 | Kontrol noktasında kaba kuvvet: seçenek karıştırma, varyant havuzu ve ilk yanlışta cevabın verilmemesi bağlanmadı; `gradeQuiz` açıklamayı her cevapta döndürüyor (`service.ts:23-28`); `firstTry=false` iken ustalık XP'sinin 0 kaldığını gösteren birim testi yok | üçü de | Evet |
| 2 | Uygulama sırası: quiz reformu, `track.complete` ve `lesson.proof` XP kurallarından önce gelmeli; sıra karara bağlanmadı | learning-scientist, accessibility-simplicity, student-ux-research | Evet |
| 3 | Kontrol noktası tavanı çelişkili: tryhackme-ux ve htb-academy-ux **en fazla 2**, elite-ui-director ve learning-scientist **en fazla 3**; `yapabilir` eşlemesi şema/`academy.mjs check` kuralı olarak tanımlanmadı | learning-scientist, student-ux-research | Hayır (ders içi) |
| 4 | "Emin değilim" kuralı: zero-knowledge "her zaman geçerli" istiyor; diğerleri "yalnızca belirsiz kartta ve doğrulama eylemiyle" diyor; net kartta öğrenciye nasıl görüneceği tek metinde sabitlenmedi | üçü de | Hayır (motor) |
| 5 | "Dersi bitir" kilidinin nedeni görünmeli ("1 karar kaldı"); sessiz kilit öğrenciyi çıkarır | accessibility-simplicity, student-ux-research | Hayır (`LessonFrame`) |
| 6 | `continueTarget` PROGRAM türünü hem "sıradaki ders" hem `STARTED` dalında atlamalı; "Başla" broşüre gidiyor | accessibility-simplicity, student-ux-research | Evet |
| 7 | İlk görev uzunluğu: 3 adım/≈3–4 dk (tryhackme-ux, htb-academy-ux) ile 5–7 karar noktalı tasarım (interactive-mission, underground-storyteller 5 ekran) arasında kesin karar yok; sınıflandırmanın modül sonu "Beceri kontrolü"ne taşınması interactive-mission'dan teyit almadı | accessibility-simplicity, student-ux-research | Hayır (motor) |
| 8 | m01-05 "alta yaz" diyor ama alan yok: ya alan eklenmeli ya vaat silinmeli | student-ux-research | Evet |
| 9 | Görünür "Gönderene dokun" etiketi; hover'a bağımlılık yok, dokunmatikte çalışmalı | accessibility-simplicity, student-ux-research | Hayır (motor) |
| 10 | Jargon açıklaması dokunmatikte keşfedilebilir olmalı; "Kalkan dosyan", OSINT, Yol A/M01 gibi terimler ilk ekrandan çıkmalı | accessibility-simplicity, student-ux-research | Hayır (C dili) |
| 11 | Eksik görsel için kesik çizgili kutu görünmemeli | accessibility-simplicity, student-ux-research | Evet |
| 12 | Canlı derste eski slaytta donma ve kopma: epoch ve yeniden bağlanma şeridi | accessibility-simplicity, student-ux-research | Evet |
| 13 | İlk ekranda lig, sıra, seri, haftalık hedef, ilerleme kolonu, kurulum formu ve takma ad modalı olmamalı (kararlaştırıldı, uygulanmadı) | accessibility-simplicity, student-ux-research | Hayır (A kabuğu) |
| 14 | Global uppercase/Lexend Tera başlık kuralı ders gövdesinden çıkmalı (Readex 500, sentence case) | accessibility-simplicity, student-ux-research | Evet |
| 15 | İlk görevin tanılama rolü (ilk iki kararın kaydı → "istersen 2 dersi atla") tasarlanmadı; öz-bildirim kaldırıldı ama yerine gözlem verisi yok | learning-scientist | Hayır |
| 16 | Kabul testleri çoğunlukla gezinmeyi ölçüyor; 48 saat sonra görülmemiş varyantla kanıtlı karar veren aktarma testi hiçbir P0 akışının "bitti" tanımına girmedi | learning-scientist, accessibility-simplicity, student-ux-research | Evet |

> student-ux-research ve accessibility-simplicity'nin ortak notu: en kritik P0'ların çoğu (continueTarget, kaba kuvvet kilidi, ilk ekranda birden fazla eylem, canlı slayt donması) **konseptten bağımsızdır**; hangi kabuk seçilirse seçilsin önce bunlar kapanmalıdır.

---

## 7. Kabul testleri (konsept doğrulaması için)

Aşağıdaki testler ajan raporlarından derlendi. **Hiçbiri henüz yapılmadı; sonuç yoktur ve uydurulmayacaktır.** Gerçek testler `06-usability-study.md` protokolüyle, gelecekte, 5–8 gönüllü ve izinli öğrenciyle yapılacaktır.

| Test | Eşik | Kaynak | Tür |
|---|---|---|---|
| 5 saniye ilk izlenim: "Ne yapardın?" | 5 kişiden en az 4'ü "Başla/Devam"ı gösterir | elite-ui-director, tryhackme-ux | Gerçek (gelecek) |
| Girişten ilk doğru cevaba süre | Medyan < 90 sn | elite-ui-director, tryhackme-ux | Gerçek (gelecek) |
| Girişten ilk karara tıklama | ≤ 2 tıklama; 360px'te kaydırma yok | tryhackme-ux | Gerçek (gelecek) |
| Yeni hesap, 375px | Kaydırmadan tek `.btn-primary`, görev sayfasına gider | elite-ui-director | Otomatik |
| İlk görevde koyu yüzey | `--surface-night` kullanan öğe yok | elite-ui-director | Otomatik |
| Koyu kanıt kartında Tab | Odak halkası ≥ 3:1 kontrast | elite-ui-director | Otomatik |
| Klavye ilk odak | Atlama bağlantısından sonra birincil düğme | elite-ui-director | Otomatik |
| `completed === 0` hesap | İlk ekranda lig, sıra, seri, modal yok; yalnızca bir yeşil düğme | tryhackme-ux | Otomatik |
| Bütün seçenekleri sırayla tıklama | `firstTry=false`, ustalık XP'si 0; yanlıştan sonra ders yine bitirilebilir | tryhackme-ux | Otomatik |
| Yeni hesap `p-01`'i açıp çıkar | `/dashboard` birincil düğmesi yine `m01-…` görevine gider | htb-academy-ux | Otomatik |
| M01 gövdesi | İlk etkileşimli öğeden önce `img` veya DOSYA bloğu yok; portre yalnızca kapanışta (`scripts/academy.mjs check`) | underground-storyteller | Otomatik |
| A ve C kabuklarının karşılaştırılması | 5 saniye testiyle | elite-ui-director, learning-scientist, student-ux-research | Gerçek (gelecek) |
| 48 saat aktarma testi | Görülmemiş mesaj varyantında kanıtlı karar | learning-scientist | Gerçek (gelecek) |
| 24 saat hikâye testi | "Tevfik nasıl yaklaştı?" → "kibar ve acil, tanıdık bir gönderen gibi" | underground-storyteller | Gerçek (gelecek) |

---

## 8. Sonraki belgelere devredilenler
- `04-final-ux-spec.md`: melezin token, bileşen (`LessonFrame`, "Sıradaki adım" kartı, kanıt yuvası `slot="evidence"`) ve durum tanımları; kontrol noktası tavanı (2 mi 3 mü) ve "isteğe bağlı koyu tema" kararlarının kapatılması.
- `05-curriculum-and-story.md`: "Şüpheli Mesaj: Sahte Kampüs Bursu" akışının adım sayısı (P0 #7) ve "Emin değilim" metni (P0 #4).
- `06-usability-study.md`: §7'deki "Gerçek (gelecek)" testlerinin protokolü.
- `07-implementation-and-tests.md`: konseptten bağımsız P0'lar (#1, #2, #6, #8, #11, #12, #14, #16) ve otomatik testler.
