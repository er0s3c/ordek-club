# 05 — Öğrenme yolu, sayfa şablonu, hikâye sistemi ve örnek modül

> **Not:** Ajanlar bu oturumda Claude Code alt ajanı olarak, her biri kendi `.claude/agents/<ad>.md` tanımını sistem rolü olarak okuyarak AYRI ayrı çalıştırıldı (yeni eklenen ajan tipleri oturum yeniden başlamadan yerel tip olarak yüklenemediği için). Agent Teams kullanılmadı; tartışma, ana ajanın ayrı raporları birbirine iletmesiyle yürütüldü — "simüle edilmiş toplantı" değil, ayrı raporlardan sentez. Tur 1'de çalışan ajanlar: tryhackme-ux, htb-academy-ux, elite-ui-director, student-zero-knowledge, student-curious-beginner, student-bored-skeptic, underground-storyteller, learning-scientist, gamification-economy, interactive-mission, club-live-experience, motion-visual, accessibility-simplicity, student-ux-research, product-admin, technical-architect.

## 0. Bu belge nasıl okunmalı

- **Kaynaklar.** Bu belge şu raporlardan derlendi: Tur 1'den `underground-storyteller`, `learning-scientist`, `interactive-mission` ve `motion-visual`; Tur 2 tartışmasından `tryhackme-ux`, `htb-academy-ux`, `elite-ui-director`, `learning-scientist` ve `underground-storyteller`. Öğrenci persona'larının (`student-*`), `gamification-economy`'nin ve `accessibility-simplicity`'nin görüşleri yalnızca bu raporlarda aktarıldığı kadarıyla yer alıyor. Kendi raporları bu belgenin girdisi değildi.
- **Etiketler.**
  - **[Kod]:** Bir ajan repoda doğruladı.
  - **[Araştırma]:** Alanyazında yerleşik bir ilke. Bu kitleyle sınanmadı.
  - **[Hipotez]:** Kanıtı olmayan tahmin.
  - **[Sentez]:** Ajanlar arasında çelişki vardı ve bu belgede bir uzlaşı önerildi. İlgili ajanın onayı gerekir.
- **Gerçek kullanıcı verisi yok.** Öğrenci tepkileri simülasyondur. Süre ve başarı hedeflerinin hiçbiri henüz gerçek öğrenciyle sınanmadı; sınanacakları yer `06-usability-study.md`.
- **Marka.** Bütün yüzeyler CIU tasarım sistemine (`docs/TASARIM-SISTEMI.md`) bağlıdır:
  - Mor (`--ciu-purple` #5C1FE2) çerçeve, rozet ve odak için kullanılır.
  - Neon yeşil (`--ciu-green` #17FF74) yalnızca birincil eylemde, üzerinde de daima `--ciu-ink` metinle kullanılır.
  - Krem (`--ciu-cream` #FFFCF2) sakin zemindir.
  - Başlıklar Lexend Tera, gövde Readex Pro ile yazılır.
  - Butonlar hap biçimlidir; kartlar 20px köşeli ve gölgesizdir.

---

## 1. Mevcut içeriğin sorunları (bu belgenin çözmeye çalıştığı şeyler)

| # | Sorun | Kaynak | Etiket |
|---|---|---|---|
| S1 | Uygulama sayfası (`m01-05-uygulama-sahte-burs.md`) "bu sayfanın altındaki alana yaz" diyor, ama sayfada metin alanı yok. `lesson/[slug]/page.tsx` QUIZ dışındaki her türde yalnızca `CompleteButton` ("Okudum, tamamla") gösteriyor. Çözüm de uygulamanın üstünde, açık bir `<details>` içinde duruyor. | underground-storyteller B3, learning-scientist K1, interactive-mission 1–3 | [Kod] |
| S2 | `MIN_READ_MS = 15_000` (`service.ts:143-144`). 15 dakikalık bir uygulama 15 saniyede tamamlanıyor ve 40 XP veriyor. | learning-scientist K1; tryhackme-ux ve htb-academy-ux Tur 2'de doğruladı | [Kod] |
| S3 | `gradeQuiz` yanlış cevapta da doğruyu ele veren açıklamayı döndürüyor (`service.ts:27`). "Tekrar dene" aynı soruları aynı sırayla getiriyor. Sorular çoğunlukla tanım soruyor. | learning-scientist K2, htb-academy-ux | [Kod] |
| S4 | Hikâye kenarda kalıyor. Ders açılışında önce hero görsel, sonra DOSYA kutusu, sonra portre, sonra anlatı ve dersten dışarı çıkaran "Gölge Ağ hikâyesi →" bağlantısı geliyor. İlk fikre ulaşmadan önce iki görsel geçiliyor. | underground-storyteller B1 ve Tur 2 | [Kod] |
| S5 | Ton iki uca kayıyor: bir yanda ders kitabı dili (340–420 kelime, tablolar, açıklanmamış İngilizce terim), öbür yanda karikatür kötü adam (puro, altın diş). Karikatür, gerçek tehdidin modelini yanlış öğretebilir. | underground-storyteller B2 | [Kod] + [Hipotez] |
| S6 | Sıra ve ön koşul 0 seviyeyi korumuyor. M02 mevzuat ikinci sırada. Log okuma M07'de Python'a bağlı. M11 ısınması `tcp.flags` ve base64 istiyor. Wi-Fi ve tarayıcı Kısım I'de ayrı modül olarak yok. | learning-scientist K3 | [Kod] + [Hipotez] |
| S7 | Görsellerin 229'undan 15'i hazır, hepsi portre. Eksik görselin yerinde kesik çizgili kutu görünüyor. AI promptlarının paleti (bordo, sepya) markayla çelişiyor. | motion-visual 1–2 | [Kod] |
| S8 | `continueTarget` önce `STARTED` durumundaki dersi döndürüyor (`service.ts:186-191`). Öğrenci bir kez program sayfasını açarsa "Devam et" onu hep oraya götürüyor. | htb-academy-ux Tur 2 | [Kod] |

---

## 2. Öğrenme yolu: "0'dan İlk Bayrağa" (12 bölüm)

### 2.1 İlkeler

1. **0 seviye yolu Python'a, Linux'a ve paket yakalamaya bağlı değildir.** Bu konular M03, M04 ve M07'de "İsteğe bağlı derinleşme" rozetiyle kalır. Mevcut M01–M11 silinmez, yalnızca sırası ve görünürlüğü değişir. *(learning-scientist F3)*
2. **Her bölümde en az bir tarayıcı içi uygulama (TİU) bulunur.** TİU güvenlidir, sentetik veri kullanır ve dışarıya bağlantı açmaz. *(learning-scientist, interactive-mission)*
3. **Adımlar 5–12 dakikadır.** Uzun uygulamalar ara kontrol noktalarıyla bölünür. *(learning-scientist K3)*
4. **Öğrenci yolun tamamını görmez.** Yalnızca sıradaki 3 düğüm açık durur, kalanlar "+9 adım" olarak katlanır. *(tryhackme-ux ve learning-scientist Tur 2; öğrenci ajanlarının talebi)*
5. **Zorluk rozeti yoktur.** Yerine "Kimler için: ilk kez başlayanlar · Ön koşul: yok" satırı yazılır. Zorluk bilgisi yalnızca Sezon 2'de gösterilir. *(htb-academy-ux Tur 2; curious-beginner itirazı)*
6. **Jargon ilk geçtiği yerde parantez içinde açıklanır**, örneğin "OSINT (internette iz sürmek)". İkinci katmanda bir "Nedir?" düğmesi bulunur. *(elite-ui-director, C konsepti)*

### 2.2 Bölüm tablosu

TİU, tarayıcı içi uygulama demektir. Bölüm adlarındaki kancalar §5'te ayrıntılı verilmiştir.

| # | Bölüm | Kimler için / ön koşul | Adımlar (dk) | TİU (tarayıcı içi uygulama) | Mevcut eşleşme / boşluk |
|---|---|---|---|---|---|
| 1 | Dijital iz | İlk kez başlayanlar · ön koşul yok | Ne bırakıyorum (6) · Aktif/pasif iz (6) · Temizlik (8) | Sahte profil kartında 6 izi işaretle. Ek görev: **Fotoğrafın sakladığı**, sentetik metadata kartında konumu ele veren alanı bul *(interactive-mission mini görev 1)*. | M01-01, M01-03 |
| 2 | Hesap koruması | Bölüm 1 | Parola uzunluğu (6) · MFA/passkey (8) · Kurtarma kodları (6) | Parola gücü kaydırıcısı ve "hangisi daha uzun sürer" eşlemesi | M08-04, M08-05. Hash ayrıntısı isteğe bağlı. |
| 3 | Oltalama (phishing) | Bölüm 1 *(ilk görev olarak ön koşulsuz, bkz. §2.4)* | Kanca (5) · Gelen kutusu (8) · Doğrulama kanalı (7) | **Şüpheli Mesaj: Sahte Kampüs Bursu** (§6). Ek görev: **Şüpheli QR** *(interactive-mission mini görev 2)*. | M01-04, M01-05, M10-03 |
| 4 | Verinin yolculuğu | Bölüm 3 | Bir mesaj nereden geçer (8) · Adres ve isim, DNS'in sade anlatımı (8) | Paketi durak durak sürükle. Mevcut DNS/HTTP animasyonu "Kolay mod"da 4 adımla oynar *(motion-visual Ö3)*. | M05-01, M05-03 (sadeleştirilecek), M06-01 |
| 5 | Wi-Fi | Bölüm 4 | Açık ağ ne görür (7) · Sahte erişim noktası (7) · Güvenli seçim (6) | Sahte "yakındaki ağlar" listesinden doğru ağı seç ve gerekçeyi işaretle | **Boşluk:** Kısım I'de yok. Yol B'den 0 seviyeye uyarlanmalı. |
| 6 | Tarayıcı | Bölüm 4 | Kilit simgesi ne der, ne demez (7) · Çerez ve oturum (8) · Eklenti izinleri (6) | Sahte adres çubuğunda 4 adresi "güvenilir mi?" diye sınıflandır | M05-06, M06-04, M06-06 (kısmen) |
| 7 | Dosya güvenliği | Bölüm 3 | Uzantı oyunları (7) · Ekler ve makrolar (7) · Yedek (6) | `fatura.pdf.exe` gibi 6 dosya kartını ayıkla | M03-04/05, M10-04. Hash isteğe bağlı. |
| 8 | Olay inceleme | Bölüm 3, 7 | Ne oldu, ne zaman (8) · Zaman çizelgesi (10) | 6 olay kartını zaman çizelgesine diz | M10-08. M10-07 kill chain isteğe bağlı. |
| 9 | OSINT etiği | Bölüm 1 | İzin ve sınır (6) · Doğrulama (8) · Ne zaman durmalı (6) | Kurgusal bir ilanda 3 doğrulama adımı seç. "Bu arama etik değil" seçeneği de puan alır. | M02-01, M09-01, M09-06. M02 mevzuatı isteğe bağlı. |
| 10 | Ağ mantığı | Bölüm 4 | Port = kapı numarası (8) · TCP/UDP benzetmesi (7) | Kapı ve hizmet eşleme oyunu | M05-02/04/05 (sadeleştirilecek) |
| 11 | Log okuma | Bölüm 8, 10 | Bir log satırının anatomisi (8) · Örüntü bul (10) | **Gece 03:12 logları** *(interactive-mission mini görev 3)*: 8 log kartı (`203.0.113.x`, TEST-NET aralığı) ya da `lab/auth.log` alıntısında başarısız girişleri ve saldırgan IP'yi işaretle | **Boşluk:** M07-07 Python'a bağlı. Tarayıcı sürümü gerekli. |
| 12 | İlk mini CTF | Bölüm 3, 6, 8, 11 | Brifing (5) · 4 istasyon × 8 dk · Rapor (7) | Bayraklar: alan adı, sahte dosya, log IP'si, zaman çizelgesi. Biçim: `CIU{...}`. | M11-01/03. M11-02 ısınması 0 seviye için yeniden yazılmalı. |

Kaynak: learning-scientist, Ek görev A. TİU eşlemeleri interactive-mission'dan, animasyon kipi motion-visual'den alındı.

**Bölüm 12 (yalnızca kulüp etkinliği, P2):** "Kayıp dosya, sahte masaüstü". Kurgusal çalışan Deniz'in masaüstünde 5 simge bulunur. 3 kişilik takımlar farklı simgeleri açar ve olay zaman çizelgesini birlikte kurar. Bu görev mevcut takım görevi altyapısını ve `/live`'ı kullanır. Etkinlik sonrası toplu skor ekranı yeni geliştirme gerektirir *(interactive-mission; [Hipotez] maliyet)*.

### 2.3 İsteğe bağlı derinleşme (0 seviye yolunda kilitli değil, ama önerilmez)

| Konu | Yer | Ne zaman önerilir |
|---|---|---|
| Linux komut satırı | M04 | Bölüm 7'den sonra. Önce simüle terminal (`.ciu-terminal`), gerçek VM/WSL yalnızca isteğe bağlı *(htb-academy-ux Tur 2)*. |
| Python ile log ayrıştırma | M07 (M07-07 dahil) | Bölüm 11'den sonra |
| Paket yakalama, `tcp.flags`, base64 | M11-02 ısınması | Bölüm 12'den sonra, "ileri öğrenci" rozetiyle |
| KKTC mevzuatı, KVKK/GDPR | M02 | Bölüm 9'un içinde, tek sayfalık özet olarak. Ayrıntısı isteğe bağlı. |
| Kill chain, hash ayrıntısı | M10-07, M08 | Bölüm 8 ve 2'den sonra |

### 2.4 İlk görev ve "Devam et"

- **İlk görev:** "Şüpheli Mesaj · Kısa" (≈3 dk; §6.6). Bölüm 3'ün kısa sürümüdür ve ön koşul aramaz. `completed === 0` olan bir hesabın ana ekranında tek kart ve tek yeşil düğme olarak görünür:
  > `İLK GÖREV · 5 DK` / "Bir mesaj geldi. Gerçek mi?" / [Mesajı aç →]
  
  *(elite-ui-director A konsepti, tryhackme-ux Çelişki 2)*
- İlk görevin slug'ı `akademi.yaml` içinde `ilk_gorev:` alanında tutulur. Alan tanımlı değilse `continueTarget` devreye girer ve PROGRAM türünü **hem** "sıradaki ders" **hem de** `STARTED` dalında atlar *(tryhackme-ux; htb-academy-ux [Kod] düzeltmesi)*.
- **Seviye sorusu sorulmaz.** Seviye gözlemlenir: ilk görevin ilk iki kararı ilk denemede doğruysa sonuç ekranında "Hızlı gidiyorsun, istersen 2 dersi atla" önerisi çıkar. Öneri isteğe bağlıdır, varsayılan yol herkes için aynıdır *(learning-scientist Tur 2, Çelişki 3)*.
- **Açık karar [Sentez]:** Kısa sürümü bitiren öğrenci Bölüm 3'e geldiğinde ilk iki adım "görüldü" sayılsın mı? Ürün ve öğrenme bilimi kararı gerekiyor.

---

## 3. Sayfa şablonu

### 3.1 İki düzen, tek iskelet

| Düzen | Ne için | Yapı | Kaynak |
|---|---|---|---|
| **Adım dersi** | Ders ve bilgi sayfaları | `::adim` ayraçlarıyla kartlara bölünür. Kart başına tek fikir. Üstte "Adım 2/5" rayı bulunur. | htb-academy-ux Tur 2 (technical-architect F2'ye dayanarak) |
| **Görev** | Uygulama sayfaları | `::gorev[id]` bloğu `MissionRunner` bileşenini yükler. Bu derste `CompleteButton` yerine `MissionRunner` çıkar. | interactive-mission Ö1 |

İki düzen de aynı `LessonFrame` iskeletini kullanır *(elite-ui-director Çelişki 1)*:
- Üstte 12px ilerleme rayı bulunur. Ray okunan sayfayı değil, geçilen karar anlarını sayar.
- Ortadaki gövde en fazla 640px genişliğindedir.
- Altta yapışkan bir eylem çubuğu ve içinde tek yeşil düğme durur.
- İnceleme masası ayrı bir düzen değil, bir yuvadır (`slot="evidence"`). 1024px ve üstünde sağda açılır, mobilde alttan açılan panel olarak gelir.
- Akordeon düzeni yalnızca Sezon 2'de ve derinleşme sayfalarında kullanılır.
- `.lab-*` (§5A) koyu yüzeyi yalnızca kanıt nesnelerinde kullanılır (§3.4).

### 3.2 Sayfa alanları (her adım kartı için)

| Alan | Kural | Kaynak |
|---|---|---|
| **Başlık** | 4–6 kelime. Sayfa başında tek bir BÜYÜK HARF üst etiket olabilir. Başlık Lexend Tera ile, uzun metin Readex Pro ile yazılır. | MASTER_PROMPT; elite-ui-director Tur 2 |
| **Giriş** | 20–30 kelime. Kanca ise en fazla 20 kelime ve aynı ekranda bir seçim içerir. | MASTER_PROMPT; underground-storyteller Tur 2 |
| **Açıklamalar** | En fazla 3 kısa paragraf ya da madde, sayfa başına tek ana fikir. Tanım duvarı olmaz. | MASTER_PROMPT; underground-storyteller Karar tablosu |
| **Görsel kararı** | 5 türden biri seçilir: `ekran` · `ai` · `diyagram` · `animasyon` · `yok`. Ders başına en fazla 1 görsel olur. Gerekçe bir cümleyle yazılır. Görsel hazır değilse bileşen hiç çizilmez; kesik çizgili kutu gösterilmez. | motion-visual Ö1 ve P0 |
| **AI promptu** | Yalnızca `ai` türünde ve İngilizce yazılır. Sabit "Mor Mürekkep" eki (§3.5) eklenir. Görselde yazı, logo ya da gerçek uygulama olmaz. 16:9 oranında, WebP biçiminde ve en fazla 120 KB olur. | motion-visual Ö2 ve §5 |
| **Etkileşim** | Karar anı en fazla 2 veya 3 (bkz. §3.3). Okuma adımları "Devam" ile akar. | tryhackme-ux, htb-academy-ux, elite-ui-director, learning-scientist |
| **Doğru / yanlış açıklaması** | Yanlış cevapta "neden yanlış" söylenir, doğru seçenek ele verilmez. Tam açıklama doğru cevaptan sonra ya da 2. yanlıştan sonra çözümlü örnek olarak gelir. Ceza metni yazılmaz. | learning-scientist F2 ve Tur 2 |
| **İpucu** | En fazla 2 kademe, otomatik açılmaz. XP'yi düşürmez, ama analitikte kaydedilir. | interactive-mission; tryhackme-ux; learning-scientist Tur 2 |
| **Sonraki CTA** | Merak satırı havada kalan bir cümle değildir; düğme etiketidir: `Sıradaki: … →`. | underground-storyteller Tur 2 |
| **`yapabilir` eşlemesi** | Frontmatter'daki her "Bitince yapabileceğin" maddesi bir kontrol noktasına bağlanır. Bağlanamayan madde karttan silinir. | htb-academy-ux Tur 2; learning-scientist Tur 2 |

**Önerilen frontmatter.** Bu alanlar henüz şemada yok; zod doğrulaması eklenmeli.

```yaml
baslik: "Gönderene bir daha bak"
tur_gorsel: yok            # ekran | ai | diyagram | animasyon | yok
gorsel_gerekce: "Öğrenilen şey maketin kendisi; ek görsel dikkat dağıtır."
kimler_icin: "ilk kez başlayanlar"
on_kosul: []
yapabilir:
  - id: gonderen-alan-adi
    metin: "Göndereni @ işaretinden sonrasıyla kontrol edebilirim."
    kontrol: k1            # bağlı kontrol noktası
```

### 3.3 Kontrol noktası kuralları

| Kural | Durum | Kaynak |
|---|---|---|
| Kilit "Dersi bitir" düğmesindedir. Kapalıyken nedenini yazar: `1 karar kaldı · ≈1 dk`. Tıklanınca ilgili bölüme kaydırır ve odağı oraya taşır. | Uzlaşı | tryhackme-ux, htb-academy-ux, elite-ui-director, learning-scientist |
| Kilit doğru cevabı şart koşmaz; yanıtlanmış olması yeterlidir. Yanlış cevaptan sonra da ders bitirilebilir. | Uzlaşı | tryhackme-ux Çelişki 1 |
| İlk deneme ayrıca kaydedilir (`firstTry`). Ustalık XP'si yalnızca ilk denemede doğru cevaba ya da yeni bir varyanta verilir. | Uzlaşı | tryhackme-ux, htb-academy-ux, learning-scientist |
| 2 yanlıştan sonra çözümlü örnek gösterilir: "Birlikte bakalım: adresi harf harf okulunkiyle karşılaştırıyoruz…" | Uzlaşı | htb-academy-ux; learning-scientist [Araştırma: çözümlü örnek etkisi] |
| Ders başına kontrol noktası sayısı | **Açık çelişki:** tryhackme-ux ve htb-academy-ux en fazla 2, elite-ui-director ve learning-scientist en fazla 3 diyor. **[Sentez] önerisi:** varsayılan 2, uzun derslerde (≥10 dk) 3. Bu bir UI kuralı olarak `LessonFrame`'de zorlanır. | — |
| Güven sorusu ("Tahmin · Biraz · Eminim") | İlk 3 derste sorulmaz. Sonra ders sonunda bir kez, atlanabilir olarak sorulur: "Bunu yarın bir arkadaşına anlatabilir misin? [Evet] [Galiba] [Henüz değil]". Cevap XP'yi ve sıralamayı etkilemez. | learning-scientist Tur 2 (elite-ui-director'ın "aynı kartta çip" biçimiyle) |
| "Emin değilim" seçeneği | Yalnızca gerçekten belirsiz kartta doğru sayılır ve ardından zorunlu bir takip çipi açılır: "Nasıl doğrularsın?". Net kartlarda yanlış sayılır, ama ceza metni yerine şu yazar: "Dürüst cevap. Bu sefer ipucu ekranda: adrese bak." | learning-scientist P0-3; underground-storyteller, htb-academy-ux, elite-ui-director Tur 2 |

### 3.4 Yüzey kuralı (marka)

| Yüzey | Nerede | Token |
|---|---|---|
| Kâğıt (krem) | Ders metni, kararlar, posta maketi, ana ekran (ürünün yaklaşık %90'ı) | `--ciu-cream` zemin, `--ciu-ink` metin, mor çerçeveli ikincil haplar |
| Gece | Yalnızca kanıt nesneleri: log kartı, terminal, ağ akışı | `--lab-bg` / `--lab-surface`, odak `#17FF74`. Terminal `.ciu-terminal` bloğudur. |
| Salon | Projeksiyon | Krem zemin, gövde en az 28px |

Kaynak: elite-ui-director Tur 2, Çelişki 2. `--surface-paper` ve `--surface-night` adları bu ajanın önerisidir ve TASARIM-SISTEMI'nde henüz yoktur. Tablodaki token eşlemesi bir [Sentez] önerisidir.

**Posta maketi açık ve kremdir.** Öğrenilen şey gerçek bir mesajı tanımaktır; neon ya da koyu "hacker" havası olmaz. Marka token'ları (mor başlık, yeşil CTA) çerçevede kalır, posta gövdesine girmez *(interactive-mission → elite-ui-director itirazı; elite-ui-director ve htb-academy-ux kabul etti)*. İlk görevde `--surface-night` kullanan hiçbir öğe bulunmaz.

### 3.5 AI görsel stili: "Mor Mürekkep" *(motion-visual Ö2)*

Her `ai` promptunun sonuna şu sabit ek konur:

```
deep violet #5C1FE2 shadows, cream #FFFCF2 highlights, single neon green #17FF74 accent, soft grain, no text, no logos, no real applications, no people unless required, 16:9
```

- AI görseli yalnızca soyut kavramlarda kullanılır (hukuk, gizlilik, "dijital iz"). Bu, 214 bekleyen sahneyi yaklaşık 40'a indirir *(motion-visual tahmini)*.
- Yükleme kuralları: WebP, 1280px genişlik, 640px `srcset`, `width` ve `height` dolu, ~20px'lik LQIP önizleme. Sayfanın üstündeki görsel `loading="eager"` ile yüklenir. `saveData` açıksa görsel yerine alt metinli kart gösterilir.
- Hero sahne ile portre çifti kullanılmaz. Portre bölümde yalnızca bir kez, kapanış kartında görünür (§4.3).

---

## 4. Hikâye ve anlatıcı sistemi

### 4.1 Anlatıcı: "Nöbetçi" *(underground-storyteller Ö1, Tur 2'de daraltıldı)*

Kampüs ağının gece vardiyasında çalışan, adı ve yüzü olmayan bir iç ses. Kurguda kim olduğu açık ve sabit. Özgün bir karakterdir; herhangi bir dizi karakterinin sesini, repliklerini ya da görsellerini taklit etmez (MASTER_PROMPT kuralı).

| Kural | Ayrıntı |
|---|---|
| **İmza** | Saat damgası, yalnızca kanca bandında: `23:47 — Bir mesaj düştü.` |
| **Konuştuğu yerler** | Yalnızca 3 yer: **kanca**, **yanlış cevabın sonucu**, **kapanış** *(Tur 2'de bored-skeptic ve curious-beginner itirazıyla daraltıldı)* |
| **Talimat metni** | Düz Türkçe. Anlatıcının sesi talimatta duyulmaz. |
| **Uzunluk** | Balon başına en fazla 2 cümle |
| **Tavır** | Asla alay etmez, asla "hacker oldun" demez. Bazen "Emin değilim. Bakalım." der ve böylece şüpheyi öğretir. Övgüyü kendine değil öğrenciye verir: "Sen yakaladın." |
| **Kötü adam** | Gölge Ağ karakterlerinin adını yalnızca kapanış kartında anar |
| **Kapanış imzası** | "Kayda geçti." Mevcut "DOSYA KAPANDI" damgasıyla birlikte kullanılır. |
| **Görsel** | Krem metin ve küçük mor bir saat rozeti. Neon yeşil yalnızca "Devam" düğmesinde. |

### 4.2 Sahne + seçim

- Kanca ile ilk eylem **aynı ekranda** olur. Ayrı bir sahne ekranı, sinematik giriş ya da "Atla" düğmesi kullanılmaz; atlanacak bir şey kalmaz *(underground-storyteller Tur 2; motion-visual ve elite-ui-director'a yöneltilen itiraz)*.
- Kancadan ilk dokunuşa geçen süre en fazla 10–20 saniyedir. interactive-mission 10 saniye, underground-storyteller 20 saniye diyor. Hedef ≤10 saniye, kabul sınırı 20 saniye **[Sentez]**.
- Ekran düzeni şöyledir:
  - **Üst şerit:** Nöbetçi balonu.
  - **Orta:** Kurgu nesne (gelen kutusu, log kartı, dosya listesi).
  - **Alt:** Mor çerçeveli ikincil haplar.
  - Yeşil yalnızca "Devam" düğmesinde kullanılır.

### 4.3 Gölge Ağ: dekor değil, ifşa

- **Sorun:** Altın dişli bir dolandırıcıyı görevden önce göstermek, "kötü adam belli olur" diye yanlış bir tehdit modeli öğretir. Oysa gerçek sahte mesaj "Burs Ofisi"nden gelir *(underground-storyteller Tur 2, Çelişki 1; learning-scientist "seductive details" riski [Araştırma])*.
- **Karar:** Görev boyunca gönderen yalnızca kurgusal kurum adıyla görünür. Kötü adam, öğrenci kararını verip kanıtı işaretledikten **sonra** açılan kapanış kartında ortaya çıkar. Portre bölümde bir kez görünür. Ders gövdesindeki hero görsel ve "Gölge Ağ hikâyesi →" bağlantısı kaldırılır; bağlantı kapanış kartına taşınır.
- İfşa anı kuralı yeniden söyler ("kibar, acil, tanıdık"). Böylece hikâye öğrenmeyi pekiştirir.
- Unvanlar ve rütbeler "iyi taraf"ta kalır. Gölge Ağ yalnızca karşı taraf olarak vardır *(underground-storyteller Tur 2'de gamification-economy önerisine atıf)*.
- `karakterler.yaml` silinmez. Karikatür estetiği (puro, altın diş, "Don") yeniden yazılıp yazılmayacağı, gerçek öğrenci testinde "cringe" etiketi çıkarsa kararlaştırılır *(underground-storyteller P0 kabul testi)*.

### 4.4 Mikro kopya kütüphanesi

| Durum | Metin | Kaynak |
|---|---|---|
| Yanlış seçim (tıklama tuzağı) | "Çoğu kişi tam burada tıklıyor; mesaj bunun için yazıldı. Simülasyon, hiçbir şey gitmedi." `[Tekrar bak]` | underground-storyteller Ö3 |
| Yanlış seçim (kısa) | "Yakın. Adrese bir daha bak." | tryhackme-ux Tur 2. bored-skeptic itirazıyla "Mantıklı bir tahmin" yerine geçti. |
| Yanlış iz, ama ilerleme var | "Yanlış iz. Ama bir şeyi eledin." | elite-ui-director B konsepti |
| İpucu düğmesi | `[Bir ipucu ver]` → ikinci kez `[Biraz daha]` | underground-storyteller Ö3 |
| Belirsiz vakada doğru seçenek | `Emin değilim, başka yoldan doğrularım` | underground-storyteller Ö3 |
| "Emin değilim" net kartta | "Dürüst cevap. Bu sefer ipucu ekranda: adrese bak." | underground-storyteller Tur 2 |
| 2 yanlıştan sonra | "Birlikte bakalım: adresi harf harf okulunkiyle karşılaştırıyoruz…" | learning-scientist Tur 2 |
| Kilitli bitir düğmesi | `Dersi bitir` · `1 karar kaldı · ≈1 dk` | tryhackme-ux, htb-academy-ux, elite-ui-director |
| Doğru seçim | "Sen yakaladın." | underground-storyteller |
| Hepsi bitti | "Bugünlük bitti." + 3 soruluk "Hatırla" kartı | elite-ui-director A konsepti |
| Hata durumu | "Görev açılamadı. [Tekrar dene]" | elite-ui-director A konsepti |

**Ton yasakları:** emojili başlık, "15. haftada" gibi müfredat dili, açıklanmamış İngilizce terim, alaycı ya da teatral anlatı, kırmızı ceza ekranı *(underground-storyteller B2; interactive-mission Ö3)*.

---

## 5. Ders kancaları (12 bölüm)

Her ders şu kalıbı izler: **Kanca · Bağlam · Seçim · Açıklama · Sonraki merak**. Kaynak underground-storyteller Tur 1'dir. Tur 2'de iki şey eklendi: her seçime makul çeldiriciler, ve "merak" satırının düğme etiketine dönüştürülmesi. Seçenekleri iki olan derslere üçüncü bir makul çeldirici yazılması hikâyeci için açık iştir. Bu belge o çeldiricileri uydurmaz.

| # | Kanca (Nöbetçi) | Bağlam (en fazla 2 cümle) | Seçim | Doğru ve gerekçe | Sonraki merak (CTA) | Tur 2 notu |
|---|---|---|---|---|---|---|
| 1 Dijital iz | "22:10. Kafede çekilen bir fotoğraf. Sen oradaydın; fotoğraf da bunu biliyor." | Fotoğraf çoğu zaman görünmez bilgi taşır: saat, cihaz, bazen konum. Dosya olarak gönderilirse bu bilgi kalabilir. | Gruba fotoğraf olarak mı, dosya olarak mı göndermeli? | Kurgu kartta konum açıkça görünüyor. Bazı uygulamalar bu bilgiyi siler, bazıları silmez. Bilmiyorsan kontrol et. | `Sıradaki: Fotoğrafsız iz →` ("Ama fotoğraf olmadan da iz bırakıyorsun.") | 2 seçenek; 3. çeldirici gerekli |
| 2 Hesap koruması | "03:12. Telefonuna 'Giriş sen misin?' onayı geldi. Sen uyuyordun." | İki adımlı doğrulama, şifreni bilen birini kapıda tutar. Ama onayı sen verirsen kapı açılır. | Onayla / Reddet ve şifreni değiştir / Görmezden gel | **Reddet ve şifreni değiştir.** Gelen onay, şifrenin başkasında olduğunu söylüyor. | `Sıradaki: Onay ikinci kez geldi →` | 3 seçenek var. "Onayla" fazla bariz olabilir, yerine daha yakın bir çeldirici düşünülmeli (learning-scientist). |
| 3 Oltalama | "23:47. Bir mesaj düştü. Başlığında 'Bursun onaylandı' yazıyor." | Tam modül §6'da. | — | — | `Sıradaki: Adını yanlış yazan mesaj →` | — |
| 4 Verinin yolculuğu | "Adresi yazdın, Enter'a bastın. İlk kime sordun?" | Bilgisayar ismi bilmez, numara bilir. Önce bir "adres defteri" (DNS) ismi numaraya çevirir. | Siteye / Adres defterine / Wi-Fi şifresine | **Adres defterine.** Site ondan sonra gelir. | `Sıradaki: Defter yanlış numara verirse? →` | Animasyon "Kolay mod" 4 adım (motion-visual) |
| 5 Wi-Fi | "Kütüphanede iki ağ var: `Kampus` ve `Kampus_Free`. Biri sahte olabilir." | Herkes istediği isimle ağ açabilir. Sahte ağ, giriş sayfasında öğrenci şifreni isteyebilir. | Free'ye bağlan / BT'nin duyurduğu ağı seç / İkisini de dene | **Resmî ağı seç.** Ağın adı bir kanıt değildir. | `Sıradaki: Tarayıcı yine de uyarıyor →` | — |
| 6 Tarayıcı | "Kilit simgesi var. Demek ki güvenli… değil mi?" | Kilit yalnızca bağlantının şifreli olduğunu söyler. Karşıdaki sitenin dürüst olduğunu söylemez. | Kilit varsa gir / Önce adrese harf harf bak | **Adrese bak.** Sahte siteler de kilit alabilir. | `Sıradaki: Dosyanın adı tuhaf →` | 2 seçenek; 3. çeldirici gerekli |
| 7 Dosya güvenliği | "`odev.pdf.exe`. Arkadaşın 'notları attım' diyor." | Windows dosya uzantısını çoğu zaman gizler. Sondaki uzantı dosyanın ne olduğunu belirler. | Aç / Arkadaşına başka bir yoldan sor / Klasöre taşı | **Sor.** Dosya bir program, PDF değil. | `Sıradaki: "Ben bir şey atmadım" →` | — |
| 8 Olay inceleme | "Hesabında hiç gitmediğin bir şehirden giriş var. Saat 04:40." | İlk dakikalardaki adımlar en önemlisidir. İzleri silmek, olanı anlamayı zorlaştırır. | Hesabı sil / Güvendiğin cihazdan şifreyi değiştir, oturumları kapat, bildir / Bekle | **İkinci seçenek.** Silmek izi de siler. | `Sıradaki: Giriş kaydında bir ayrıntı daha →` | Doğru seçenek uzunluğuyla belli oluyor; seçenek uzunlukları eşitlenmeli [Hipotez]. |
| 9 OSINT etiği | "Bir sınıf arkadaşının adresini 4 dakikada buldun. Bulabilmek, bulmalı mısın demek değil." | Açık kaynaktaki bilgiler bile bir araya toplanınca zarar verebilir. Amaç ve izin önemlidir. | Gruba paylaş / Hiçbir şey yapma / Kişiye bilgisinin açıkta olduğunu söyle | **Kişiye söyle.** Toplamak ve paylaşmak zarara dönüşür. | `Sıradaki: Senin hakkında ne bulunur? →` | — |
| 10 Ağ mantığı | "Aynı bina, farklı oda. Paket hangi kapıyı çalacağını nereden biliyor?" | IP binanın adresidir, port oda numarasıdır. Web genellikle 443 numaralı odada oturur. | Aynı adrese gelen iki paketi doğru odalara eşle | Yanlış odaya giden paketi kimse açmaz. | `Sıradaki: Kapısını açık bırakan oda →` | Eşleme; mobilde sürükleme yerine düğme |
| 11 Log okuma | "Kayıtta 40 başarısız giriş var. Sonra bir tane başarılı." | Log, sistemin günlüğüdür. Tek tek satırlar önemsiz görünür; desen önemlidir. | Normal / Biri şifre denedi ve tuttu / Sistem hatası | **İkinci seçenek.** Asıl alarm 41. satırdaki başarılı giriş. | `Sıradaki: O hesap şimdi neye bakıyor? →` | TİU: Gece 03:12 logları |
| 12 İlk mini CTF | "Bu sayfayı kulüp kendi kurdu. Bir bayrak sakladık. Görünen yerde değil." | CTF izinli bir bulmaca yarışmasıdır. Bayrak, bulduğun cevabın kodudur ve `CIU{...}` biçimindedir. Bu sayfa sentetiktir ve yalnızca bizimdir. | Sayfanın kaynağına bak / Rastgele tıkla / Yöneticiye sor | **Kaynağa bak.** Bayrak bir yorum satırında: `CIU{gorunmeyen_not}`. | `Sıradaki: Sezon 2'de bayrak tek parça değil →` | Bayrak tanımı Tur 2'de eklendi |

---

## 6. Tam modül: "Şüpheli Mesaj: Sahte Kampüs Bursu"

### 6.1 Künye

| Alan | Değer |
|---|---|
| Bölüm | 3: Oltalama. Mevcut M01-04/M01-05'in yerine geçer. Dosyalar silinmez, `m01-05` görev düzenine geçer. |
| Süre hedefi | Tam sürüm ≈5–6 dk, kısa (ilk görev) sürüm ≈3 dk. Ardından ayrı sayfa olarak M01 "Beceri kontrolü" ≈3 dk (§6.5). **Süreler test edilmedi.** |
| Kimler için | İlk kez başlayanlar · ön koşul yok · jargon yok ("oltalama" kelimesi yalnızca özette, adı konarak geçer) |
| Düzen | Görev (`::gorev[sahte-burs]`, `MissionRunner`) |
| Adım tipleri | `inbox`, `inspect`, `choose`, `pick-evidence` (+ beceri kontrolünde `classify`) *(interactive-mission Ö1)* |
| Öğrenme hedefi (`yapabilir`) | 1) Göndereni @ işaretinden sonrasıyla kontrol ederim. 2) Linke tıklamam, resmî siteye kendim girerim. 3) Emin değilsem başka bir kanaldan doğrularım ve bildiririm. |
| Kalıcılık kuralı (24 saat sonra) | "Göndereni @ işaretinden sonrasıyla kontrol et, resmî siteye kendin gir." *(underground-storyteller kabul testi)* |

**Neden ekran sayısı azaldı:** underground-storyteller Tur 1'de 8 ekran, interactive-mission yaklaşık 7 karar noktası önermişti. curious-beginner ve bored-skeptic bunu "ilk görev için fazla" buldu. Tur 2'de underground-storyteller akışı 5 ekrana indirdi. htb-academy-ux ve tryhackme-ux sınıflandırmayı (classify) modül sonundaki ayrı bir beceri kontrolüne taşıdı. Aşağıdaki akış bu uzlaşıdır; özet ekranı ayrıca korunmuştur (MASTER_PROMPT bunu şart koşuyor).

### 6.2 Kurgu ve güvenlik kapsamı *(interactive-mission §3)*

- **Kurum kurgusaldır:** "Kuzey Ada Üniversitesi". CIU'yu ya da başka gerçek bir kurumu taklit etmez; gerçek kişi, logo ya da marka kullanılmaz.
- **Alan adları yalnızca `.example` ile biter (RFC 2606) [Sentez].** Ajanlar farklı alan adları önerdi: underground-storyteller `kampus.edu.example`/`scholarship-campus.example`, interactive-mission `kuzeyada.example`/`kuzeyada-burslar.example`, learning-scientist `kuzeyikiyi.edu.example`/`kku-burs-onay.example`. Bu belgede tek bir set seçildi:

  | Rol | Alan adı |
  |---|---|
  | Okulun gerçek (kurgu) adresi, yer imi | `kuzeyada.edu.example` |
  | Sahte gönderen | `burs@kuzeyada-burslar.example` |
  | Sahte linkin hedefi | `giris.kuzeyada-burslar.example` |
  | Harfi kaymış alan adı (beceri kontrolü) | `kuzeyada-edu.example` |

- Hiç `<a href>` yoktur. Dış istek yoktur. Parola kutusu yoktur; simülasyon giriş ekranı input içermeyen, devre dışı kutulardan oluşur.
- Ekranın üstünde sabit bir rozet durur: `SİMÜLASYON · Gerçek e-posta değil, hiçbir şey sana zarar veremez`.
- Durum `sessionStorage`'da tutulur ve sayfa yenilenince görev kaldığı yerden devam eder. Cevap anahtarı istemciye gönderilmez; geri bildirim `POST /api/academy/missions/[id]/check` ile adım adım gelir.

### 6.3 Sayfa sayfa akış

Her sayfa için şu alanlar verilir: Başlık · Giriş · Açıklamalar · Görsel kararı · Etkileşim · Doğru/yanlış açıklaması · İpuçları · Sonraki CTA. Zaman damgaları hedeftir, ölçülmemiştir.

---

#### Sayfa 1 — Kanca ve ilk karar (0:00–0:30)

| Alan | İçerik |
|---|---|
| **Başlık** | BURSUN ONAYLANDI. GERÇEKTEN Mİ? |
| **Giriş (Nöbetçi, kanca bandı)** | `23:47` Deniz'in telefonuna bir mesaj düştü: "Bursun onaylandı, 24 saat içinde doğrula." Herkes sevinecek. Sen önce bir bak. |
| **Açıklamalar** | Yok. Kanca ile seçim aynı ekranda; tanım verilmez. |
| **Görsel kararı** | `yok`. Görsel yerine kodla çizilmiş krem posta maketi kullanılır. Gerekçe: öğrenilen şey maketin kendisi; ek görsel ilk dokunuşu geciktirir *(motion-visual §5.1; underground-storyteller Tur 2)*. |
| **Etkileşim** | Krem gelen kutusu maketi. Okunmamış tek mesaj açık, diğerleri "Önce ilk mesajı çöz" kilidiyle kapalı. Mesajda şunlar görünür: **Gönderen:** Kuzey Ada Burs Ofisi; **Konu:** Burs başvurun ONAYLANDI, 24 saat içinde doğrula; **Metin:** "Bursunuzun iptal olmaması için 24 saat içinde öğrenci numaranız ve şifrenizle giriş yapınız."; mesajın içinde `[Hesabımı doğrula]` görünümlü, link olmayan bir öğe. Altta üç ikincil hap: `Bağlantıya dokun` · `Göndereni incele` · `Gruba ilet` |
| **Doğru: "Göndereni incele"** | Sayfa 2'ye geçilir. Nöbetçi: "Sen yakaladın. Adı 'Burs Ofisi' ama adresine bakalım." |
| **Yanlış: "Bağlantıya dokun"** | Simülasyon giriş ekranı gösterilir. Input yoktur; adres çubuğunda `giris.kuzeyada-burslar.example` yazar. Nöbetçi: "Çoğu kişi tam burada tıklıyor; mesaj bunun için yazıldı. Simülasyon, hiçbir şey gitmedi." Düz metin: "Şifreni yazsaydın dolandırıcıya gidecekti. Sorun sen değilsin." `[Tekrar bak]` Sayfa 1'e döner (`attempts++`). |
| **Yanlış: "Gruba ilet"** | "İyi niyetli bir seçim. Ama uyarısız iletirsen tuzağı gruptaki herkese taşırsın. Önce kendin doğrula." `[Tekrar bak]` |
| **İpuçları** | Bu sayfada yok. İpucu düğmesi ilk yanlıştan sonra Sayfa 2'de görünür. |
| **Sonraki CTA** | Doğru seçimle otomatik olarak Sayfa 2'ye geçilir. |
| **Ölçme notu** | İlk karar ve deneme sayısı `MissionAttempt`'e yazılır. İlk karar tanılama verisi olarak da kullanılır (§2.4). |

Kaynaklar: underground-storyteller (Tur 1 Ekran 1–4, Tur 2 kanca), interactive-mission (`intro → inbox → reading`, sim_A ve C metinleri). "40 kişiye" ifadesi kaldırıldı, yerine "gruptaki herkese" yazıldı. Sayı kurgu dışı bir iddia gibi okunabilirdi **[Sentez]**.

---

#### Sayfa 2 — Gönderene dokun (0:30–1:30)

| Alan | İçerik |
|---|---|
| **Başlık** | ADI BAŞKA, ADRESİ BAŞKA |
| **Giriş** | Bir mesajın üstünde iki şey yazar: bir ad ve bir adres. Adı herkes istediği gibi yazabilir. Adresi değiştirmek o kadar kolay değildir. |
| **Açıklamalar** | 1) Adres, @ işaretinden sonraki kısımdır. Mesajın gerçekte nereden geldiğini o söyler. 2) Okulun adresini zaten biliyorsun: yer iminde duruyor. |
| **Görsel kararı** | `yok`. Etkileşimli karşılaştırma paneli kullanılır. Gerekçe: farkı göstermek için iki satırı yan yana koymak yeterli. |
| **Etkileşim** | Gönderen satırında görünür bir çip: `Gönderene dokun ▸`. Hover'a bağlı hiçbir şey yoktur. Dokununca karşılaştırma paneli açılır: `Yer imindeki okul: kuzeyada.edu.example` / `Bu mesaj: kuzeyada-burslar.example`. Farklı kısım mor bir halkayla işaretlenir (300ms, azaltılmış harekette anında). İkinci çip: `[Hesabımı doğrula] nereye gidiyor? ▸`. Dokununca alttan açılan panelde hedef görünür: `giris.kuzeyada-burslar.example`. Panel kapandıktan sonra soru: **"Bu mesaj okulun adresinden mi geliyor?"** `Evet` · `Hayır` · `Emin değilim` |
| **Doğru: "Hayır"** | "Doğru. Ad 'Kuzey Ada Burs Ofisi', ama adres okulunki değil. Tire ve fazladan bir kelime, başka bir yer demek." |
| **Yanlış: "Evet"** | "Yakın. 'kuzeyada' kelimesi iki adreste de var, ama ardından gelen kısım farklı. Bir daha yan yana bak." |
| **"Emin değilim"** | Bu kart net olduğu için: "Dürüst cevap. Bu sefer ipucu ekranda: adrese bak." İpucu 1 otomatik vurgulanır, ama soru yeniden sorulur. |
| **İpuçları** | `[Bir ipucu ver]` → **İpucu 1:** "Ad güzel görünür. Adrese bak: @ işaretinden sonrası, mesajın nereden geldiğini söyler." Gönderen satırı vurgulanır. `[Biraz daha]` → **İpucu 2:** "Okulun adresi `kuzeyada.edu.example`. Bu mesajdaki onunla aynı mı? Harf harf yan yana koy." Karşılaştırma paneli kendiliğinden açılır. **2 yanlıştan sonra** çözümlü örnek gösterilir: "Birlikte bakalım: `kuzeyada` · `.edu` · `.example` ile `kuzeyada` · `-burslar` · `.example`. Ortadaki parça farklı." |
| **Sonraki CTA** | `Devam` (yeşil, tek birincil eylem) |

Kaynaklar: interactive-mission (Ö2 kanıt panosu, ipucu metinleri, mobil alt panel), underground-storyteller (İpucu 1–2), tryhackme-ux ve htb-academy-ux ("Gönderene dokun" etiketi, zero-knowledge P0-7), motion-visual (tek mor halka), learning-scientist (çözümlü örnek). İpucu düğmesinin etiketi için iki öneri vardı: interactive-mission `İpucu (2 kaldı)`, underground-storyteller `[Bir ipucu ver]` / `[Biraz daha]`. Ceza çağrışımı taşımadığı için ikincisi seçildi **[Sentez]**.

---

#### Sayfa 3 — Kanıtı seç (1:30–2:30)

| Alan | İçerik |
|---|---|
| **Başlık** | SENİ NE İKNA ETTİ? |
| **Giriş** | Şüphelenmek yetmez. Neden şüphelendiğini söyleyebilmelisin; bir dahaki mesajda işine yarayacak olan bu. |
| **Açıklamalar** | 1) Seni ikna eden kanıtları seç. En az bir tane. |
| **Görsel kararı** | `yok`. Etiketler, maketin yanındaki kanıt panosuna eklenir (1024px ve üstünde sağda, mobilde maketin altında). |
| **Etkileşim** | 5 etiket (`role="checkbox"`). **Çekirdek:** `Gönderen adresi okulunkiyle aynı değil` · `Düğmenin gittiği adres okulunki değil`. **Destek:** `24 saat baskısı yapıyor`. **Yem:** `"Merhaba" diye başlıyor` · `Bir kelime büyük harfle yazılmış`. Her etiket eklenince kısa bir "klik" animasyonu oynar (azaltılmış harekette yok). `Kanıtları gönder` |
| **Doğru (≥1 çekirdek)** | "Sen yakaladın. Adres, mesajın içinde değiştirilmesi en zor şey; bu yüzden en güçlü kanıt." Destek de seçildiyse: "Acele ettirmek de klasik bir işaret: düşünmeden tıklayasın diye." |
| **Yalnızca yem seçildiyse** | Etiketler elenmez, saygılı bir açıklama çıkar: "Gerçek okullar da 'Merhaba' yazar ve bazen büyük harf kullanır. Bunlar tek başına kanıt değil. Sayfa 2'de neyi karşılaştırmıştın?" `[Tekrar seç]` |
| **Yem + çekirdek** | Geçerli sayılır. Yem için tek satır not: "'Merhaba' tek başına bir şey söylemez; asıl kanıt adres." Yem seçimi ölçme verisine yazılır *(learning-scientist Tur 2)*. |
| **İpuçları** | İpucu 1: "Sayfa 2'de neyi yan yana koydun?" İpucu 2: "Değiştirmesi en zor olan şey hangisi: bir selam mı, bir adres mi?" |
| **Sonraki CTA** | `Devam` |

Kaynaklar: interactive-mission (`evidence` adımı, 2 çekirdek + 1 destek + 2 yem, saygılı açıklama), htb-academy-ux (yanlış seçimin ekranda kalması ve "neden yanlış"ın görünmesi). htb-academy-ux kısa sürüm için "Bir tane seç" diyordu; tam sürüm için çoklu seçim önerildi, kısa sürümde (§6.6) tek seçim kullanılır **[Sentez]**.

---

#### Sayfa 4 — Deniz şimdi ne yapsın? (2:30–3:30)

| Alan | İçerik |
|---|---|
| **Başlık** | ŞİMDİ NE YAPMALI? |
| **Giriş** | Mesajın sahte olduğunu biliyoruz. Ama bursu gerçekten merak ediyorsan? Doğru hamle, mesajın içinden değil, dışından gider. |
| **Açıklamalar** | 1) Mesajdaki düğme, mesajı yazanın istediği yere gider. 2) Yer imindeki adres ise senin seçtiğin yere. |
| **Görsel kararı** | `yok`. Üç karar kartı. |
| **Etkileşim** | Üç seçenek. Uzunlukları eşittir, böylece doğru seçenek uzunluğundan belli olmaz [Hipotez]: `Mesajı silerim, olay biter` · `Okul portalına yer iminden kendim girer, mesajı bildiririm` · `Mesajdaki düğmeden girip bakarım, şifre yazmam` |
| **Doğru: "Kendim girer, bildiririm"** | "Kayda geçecek hamle bu. Burs gerçekse portalda da görünür. Bildirmek de sonraki kişiyi korur." |
| **Yanlış: "Silerim"** | "Kendini korudun, bu iyi. Ama burs gerçekse kaçırırsın, sahteyse bir sonraki kişi de aynı mesajı alır. Portaldan kontrol et, sonra bildir." |
| **Yanlış: "Düğmeden girip bakarım"** | "Şifre yazmasan da sahte sayfaya gitmiş olursun; o sayfa da gerçeğinin kopyası olabilir. Resmî siteye kendin gir." |
| **İpuçları** | İpucu 1: "Hangi seçenekte adresi sen seçiyorsun?" İpucu 2: "Bir de: senden sonra bu mesajı kim alacak?" |
| **Sonraki CTA** | `Devam` |

Kaynak: learning-scientist rubrik Ö3 ("Resmî kanaldan bağımsız doğruladı veya bildirdi"), underground-storyteller özet kuralı ("Linke tıklama. Resmî siteye kendin gir. Şüpheliyse bildir."). Bu sayfa iki ajanın 5 ekranlık akışındaki "karar" adımının ayrıntısıdır. Seçenek metinleri bu belgede yazıldı **[Sentez]** ve hikâyecinin onayına bağlı.

---

#### Sayfa 5 — Özet (3:30–4:15)

| Alan | İçerik |
|---|---|
| **Başlık** | BU NUMARANIN BİR ADI VAR |
| **Giriş** | Tehlikeli mesaj her zaman kötü yazılmış olmaz. Bazen her şey düzgündür; tek bir adres farklıdır. |
| **Açıklamalar (en fazla 3)** | 1) **Göndereni @ işaretinden sonrasıyla kontrol et.** 2) **Linke tıklama. Resmî siteye kendin gir.** 3) **Şüpheliyse bildir, iletme.** Bu numaranın adı **oltalama**: seni yemle çekmeye çalışan mesaj. |
| **Görsel kararı** | `yok`. Üç kural, numaralı kart olarak. |
| **Etkileşim** | Tek, atlanabilir geri çağırma: "Kendi sözlerinle: bir dahaki mesajda ilk neye bakacaksın?" Tek satırlık metin alanı (isteğe bağlı) ya da `Gönderen adresine` · `Mesajın diline` · `Gönderilme saatine` seçimi. İlk 3 derste güven sorusu sorulmaz *(learning-scientist Tur 2)*. |
| **Doğru / yanlış** | "Gönderen adresine": "Sen yakaladın." Diğerleri: "Onlar da bazen ipucu verir, ama tek başına kanıt değil. Önce adres." Cevap XP'yi etkilemez. |
| **İpuçları** | Yok |
| **Sonraki CTA** | `Dosyayı kapat` (yeşil) |

Kaynaklar: underground-storyteller (Tur 1 Ekran 7), learning-scientist (isteğe bağlı tek cümlelik "neden" alanı; 150 kelimelik zorunlu yazı kaldırıldı).

---

#### Sayfa 6 — Kapanış, XP ve sonraki merak (4:15–5:00)

| Alan | İçerik |
|---|---|
| **Başlık** | DOSYA KAPANDI |
| **Giriş (Nöbetçi, kapanış)** | Mesajı "Burs Ofisi" yazmamıştı. *Tatlı Dil Tevfik.* Kibar, acil, tanıdık. Hep böyle gelir. Kayda geçti. |
| **Açıklamalar** | Yok |
| **Görsel kararı** | Mevcut **karakter portresi** (Gölge Ağ, Tatlı Dil Tevfik). Bölümdeki tek görsel budur. Gerekçe: ifşa anı, "kötü adam belli olmaz, kibar gelir" kuralını pekiştirir. Portre dosyası hazır değilse kart görselsiz çizilir *(motion-visual P0)*. |
| **Etkileşim** | `revealEnding` kutusu açılır. `+60 XP` sayacı 600ms'de yukarı sayar; azaltılmış harekette anında görünür. Duyuru `aria-live="polite"` ile yapılır. İkincil bağlantı: `Gölge Ağ dosyası: Tevfik →` (gövdeden buraya taşındı). İlk denemede iki karar da doğruysa: "Hızlı gidiyorsun, istersen 2 dersi atla." (isteğe bağlı). |
| **Sonraki merak** | Nöbetçi: `00:12` Yeni mesaj. İçinde link yok. Adres de doğru. Ama gönderen, senin adını yanlış yazmış. |
| **Sonraki CTA** | `Sıradaki: Adını yanlış yazan mesaj →` (Bölüm 3, adım "Doğrulama kanalı"). M01 akışındaysa önce `Beceri kontrolü · 3 yeni mesaj →` gelir. |

Kaynaklar: underground-storyteller (Tur 2 ifşa kartı, Tur 1 Ekran 8 merakı), interactive-mission (`rewarded`, `revealEnding`), motion-visual (XP mikro etkileşimi).

---

### 6.4 XP koşulu (sunucuda yeniden hesaplanır)

| Ödül | Koşul | Kaynak |
|---|---|---|
| **+60 XP** `mission.complete` (önerilen varsayılan; `/admin/xp`'ten düzenlenir) | (a) Sayfa 1'de "Göndereni incele" seçilmiş, ya da A/C seçildikten sonra düzeltilmiş olmalı. (b) Sayfa 2'de karşılaştırma paneli açılmış ve "Hayır" cevabına ulaşılmış olmalı. (c) Sayfa 3'te en az 1 çekirdek kanıt seçilmiş olmalı. (d) Sayfa 4'te doğru eylem seçilmiş olmalı; düzeltme de kabul. | underground-storyteller, interactive-mission |
| İpucu kullanımı | XP'yi düşürmez. `MissionAttempt`'e kaydedilir ve yalnızca eğitmen analitiğinde "ipucuyla geçti" olarak görünür. | interactive-mission, tryhackme-ux, learning-scientist Tur 2 |
| Tekrar | XP bir kez verilir. Anahtar `mission:<userId>:<id>`'dir (`award()` → `idempotencyKey`). Aynı adımı yeniden tıklamak ek XP getirmez. | interactive-mission |
| Okuma XP'si | Bu derste "Okudum, tamamla" ve `lesson.complete` yoktur. `MissionRunner` onların yerine geçer. | interactive-mission Karar |
| Kaynak alanı | `source: "LESSON"`, `refType: "Mission"`. Enum göçü gerekmez. | interactive-mission [Varsayım] |

**Açık karar (gamification-economy) [Sentez]:** learning-scientist'in 15 dakikalık rubrik akışında XP 30 (tamamlama) + 30 (ustalık) olarak bölünmüştü. Bu belgede modül için tek parça 60 XP, ayrı beceri kontrolü için +30 ustalık XP'si öneriliyor (§6.5). gamification-economy'nin nihai değerleri bu belgenin girdisi değildi. learning-scientist'in sıralama şartı geçerlidir: quiz reformu (varyant havuzu, seçenek karıştırma, ilk yanlışta cevabın verilmemesi) yeni XP kurallarından önce uygulanmalıdır.

### 6.5 Ayrı sayfa: M01 "Beceri kontrolü · 3 yeni mesaj" (≈3 dk)

Bu sayfa, bugünkü tanım quiz'inin ("Purple Team nedir?") yerini alır *(htb-academy-ux Tur 2)*. Ölçtüğü şey aktarmadır.

| Alan | İçerik |
|---|---|
| **Başlık** | ÜÇ YENİ MESAJ, ÜÇ KARAR |
| **Giriş** | Az önce bir mesajı çözdün. Şimdi daha önce görmediğin üç mesaj var. Her biri için bir karar ver ve nedenini seç. |
| **Görsel kararı** | `yok`. Krem posta kartları. |
| **Etkileşim (`classify`)** | Her kartta `Güvenilir` · `Sahte` · `Emin değilim, başka kanaldan doğrularım` seçeneklerinden biri ve bir "neden?" etiketi seçilir. |
| **Kart A** | Gönderen `kuzeyada.edu.example`. "Sonuçlar portalda; kendi tarayıcınızdan girin." Doğru cevap **güvenilir**. Kanıt: tanıdık adres, link yok, aciliyet yok. |
| **Kart B** | Gönderen `kuzeyada-edu.example`. "Burs ödemesi için kart bilginizi onaylayın." Doğru cevap **sahte**. Kanıt: nokta yerine tire konmuş farklı adres, burs için kart bilgisi istenmesi. |
| **Kart C** | Adres doğru görünüyor, ama bir arkadaşın hesabından geliyor ve "acil, şu dosyayı aç" diyor. Doğru cevap **Emin değilim** + zorunlu takip çipi: "Nasıl doğrularsın?" → `Arkadaşıma başka bir yoldan sorarım`. Nöbetçi: "Burada 'bilmiyorum' demek zayıflık değil. Başka bir yoldan doğrulamak." |
| **Geri bildirim** | İlk yanlışta yalnızca "neden yanlış" ipucu gösterilir; doğru seçenek ele verilmez. Tam açıklama ikinci denemede gelir. Yalnızca eksik kalan kart tekrarlanır. |
| **Varyant** | Her kart için en az 3 varyantlı havuz olur ve seçenek sırası her denemede karışır. Tekrar deneme yeni bir varyant getirir. *(learning-scientist F2)* |
| **XP** | **+30 ustalık XP'si** (önerilen). Koşul: ilk sunulan varyantta 3 karttan en az 2'si **kanıt etiketiyle birlikte** doğru olmalı. Ya da sonraki yeni bir varyantta aynı koşul sağlanmalı. Aynı varyantı tekrar tıklamak XP vermez. |
| **Sonraki CTA** | `Sıradaki: Bölüm 4 · Verinin yolculuğu →` |

**Neden kanıt etiketi şart:** learning-scientist, "3 karttan en az 2'si doğru" eşiğinin rastgele tahminle yaklaşık %26 olasılıkla (7/27) geçildiğini hesapladı. Bu bir hesaptır, veri değildir. Karar ile gerekçenin birlikte doğru olması bu olasılığı düşürür. Yeni olasılık, etiket sayısına bağlı olduğu için burada hesaplanmadı.

**Kaynaklar:** kartlar underground-storyteller (Tur 1 Ekran 6) ve interactive-mission (`classify` K1–K3) birleştirilerek, kurallar learning-scientist ve htb-academy-ux'ten alınarak hazırlandı. Kart B'deki "burs ödemesi için" ifadesi bağlamı netleştirmek için eklendi **[Sentez]**.

### 6.6 Kısa sürüm: ilk görev "Şüpheli Mesaj · Kısa" (≈3 dk)

| Adım | İçerik |
|---|---|
| 1 | Sayfa 1 (kanca ve karar), aynen |
| 2 | Sayfa 2 (gönderene dokun), aynen. İpuçları dahil. |
| 3 | Sayfa 3'ün tek seçimli hali: "En güçlü kanıtı seç. Bir tane." Yanlış seçim ekranda kalır ve "neden yanlış" görünür. |
| Kapanış | Sayfa 6, kısaltılmış: Tevfik ifşası, XP, `Sıradaki: Ne yapmalı? →` (tam sürümün 4. sayfasına) |

**Kabul hedefleri** *(tryhackme-ux, henüz sınanmadı)*:
- Girişten ilk karara en fazla 2 tıklama.
- 360px genişlikte yatay kaydırma yok.
- İlk doğru/yanlış geri bildirimi 90 saniyenin altında.

**Açık karar [Sentez]:** Kısa sürümde XP tam modülle aynı anahtarı mı paylaşsın, yoksa kısa sürüme ayrı ve daha küçük bir ödül mü verilsin? gamification-economy kararı gerekiyor.

### 6.7 Görsel kararları ve AI promptu

| Yer | Tür | Gerekçe |
|---|---|---|
| Sayfa 1–5 | `yok` (kodla çizilmiş maket) | Görsel, öğrenme anının kendisi. Gerçek bir e-posta istemcisinin ekran görüntüsü kullanılmaz *(underground-storyteller, motion-visual)*. |
| Sayfa 6 | Mevcut karakter portresi | Bölümde bir kez, ifşa anında |
| Yol kartı kapağı (isteğe bağlı, ders gövdesinde değil) | `ai` | Akademi listesinde Bölüm 3'ü tanıtmak için |

**Yol kartı kapağı promptu** (motion-visual §5.1 + "Mor Mürekkep" eki):

```
A moody close-up of a fictional student laptop on a dorm desk at night showing a generic unreadable email notification card, deep violet ambient glow with a faint neon green rim light, cream paper notes, no logos, no real applications, no readable text, no people, strong negative space on the left for overlay, editorial illustration with soft grain, 16:9 — deep violet #5C1FE2 shadows, cream #FFFCF2 highlights, single neon green #17FF74 accent, soft grain, no text
```

Alt metin: "Gece yurt masasında açık laptop; ekranda bulanık bir bildirim kartı."

### 6.8 Mobil ve erişilebilirlik *(interactive-mission; elite-ui-director)*

- Hover kullanılmaz. Hedef adres, düğmeye dokununca alttan açılan panelde görünür. Mail açılınca tam ekran olur.
- 480px altında ya da "Basit görünüm" seçildiğinde akış tek ekran, tek soru kartı olarak ilerler. Sürükle-bırak yoktur, her şey düğmedir.
- Etiketler `role="checkbox"` olur. Sonuçlar `aria-live="polite"` ile okunur. Odak halkası her yüzeyde görünür; koyu yüzeyde `#17FF74` ve en az 3:1 kontrast.
- `prefers-reduced-motion`: halka, klik ve sayaç animasyonları kapanır, sonuç anında görünür.

### 6.9 Kabul testleri (hiçbiri henüz çalıştırılmadı)

| # | Test | Tür | Kaynak |
|---|---|---|---|
| T1 | `MissionRunner` çıktısında `input[type=password]` ve `a[href]` yok | Birim | interactive-mission |
| T2 | `complete` isteği iki kez gelirse XP ikinci kez yazılmaz. Cevap anahtarı hiçbir ağ yanıtında bulunmaz. | Birim / E2E | interactive-mission |
| T3 | PRACTICE dersinde kontrol noktası yanıtlanmadan `POST /complete` 400 döner. Çözüm, öğrenci seçim göndermeden DOM'da görünmez. | E2E | learning-scientist |
| T4 | Beceri kontrolü tekrarında seçenek sırası ve varyant değişir. İlk yanlışta yanıt yükü doğru seçeneği içermez. | Birim | learning-scientist |
| T5 | Bütün seçenekleri sırayla tıklayan hesap için `firstTry=false` olur ve ustalık XP'si 0 kalır. Yanlıştan sonra ders yine bitirilebilir. | Birim | tryhackme-ux |
| T6 | M01 gövdesinde ilk etkileşimli öğeden önce `img` ya da DOSYA bloğu yok. Portre yalnızca kapanış kartında. `scripts/academy.mjs check` ile denetlenir. | Otomatik | underground-storyteller |
| T7 | Yeni hesap `p-01`'i açıp çıkar. `/dashboard` birincil düğmesi yine görev sayfasına gider. | E2E | htb-academy-ux |
| T8 | 375px ve hızlı 3G: ilk ekranda kesik çizgili kutu yok, CLS < 0,1, her `<img>`'de `alt`, `width` ve `height` dolu | Manuel / otomatik | motion-visual |
| G1 | **Gerçek test (ileride, izinli, 5–8 gönüllü):** telefonda, ipucusuz, en az 4/5 kişi 60 saniye içinde gönderen ayrıntısını açar | Gerçek | interactive-mission |
| G2 | **Gerçek test:** 24 saat sonra büyük çoğunluk kuralı kendi sözleriyle söyler. Ayrıca "Tevfik nasıl yaklaştı?" sorusuna hedef cevap: "kibar ve acil, tanıdık bir gönderen gibi". Ton etiketi istenir: komik / gergin / sıkıcı. "Cringe" çıkarsa ton yeniden yazılır. | Gerçek | underground-storyteller |
| G3 | **Gerçek test:** 48 saat sonra daha önce görülmemiş bir mesaj varyantında kanıtlı karar | Gerçek | learning-scientist |

Gerçek testlerin sonuçları burada **uydurulmaz**; `06-usability-study.md` protokolüyle toplanır.

---

## 7. Öğrenme bilimcinin rubriği

**Kaynak:** learning-scientist, Ek görev B (Tur 1) ve Tur 2 revizyonu. Rubrik başlangıçta 15 dakikalık "Şüpheli Mesaj+" akışı için yazıldı: kanca (0–1), 3 mesajlık gelen kutusu (1–4), kanıt etiketleme (4–8), karar ve gerekçe (8–11), yeni bir kanala aktarma, örneğin QR afiş ya da telefon araması (11–13), özet ve 2 gün sonrası için bir hatırlatma sorusu (13–15). Aşağıda bu belgedeki modüle (§6) eşlenmiştir.

### 7.1 Tur 2 değişiklikleri (learning-scientist)

- 6 ölçüt 5'e indi: **gerekçe ve karar ölçütleri birleşti**.
- "İpucusuz" puanı XP'yi hiçbir zaman etkilemez. Yalnızca eğitmen rubriğinde görünür ve **rubrik öğrenciye gösterilmez**.
- 150 kelimelik zorunlu yazı kaldırıldı. Yerine seçmeli kanıt etiketi ve isteğe bağlı tek cümlelik "neden" alanı geldi. Bu cümle ileri derslerde zorunlu olacak [Hipotez].

### 7.2 Rubrik (5 ölçüt)

| Ölçüt | 0 | 1 | 2 | Modüldeki yer | Puanlama |
|---|---|---|---|---|---|
| **R1 İşaret tespiti** | Alan adını bulamadı | Alan adını ipucuyla buldu | Alan adı + en az 1 destek işareti (aciliyet, kart bilgisi), ipucusuz | Sayfa 2–3 | Otomatik |
| **R2 Karar ve gerekçe** *(Tur 1'deki Ö2 Gerekçe + Ö3 Eylem)* | Hüküm doğru ama gerekçe yanlış, ya da "linke tıkla, sonra bak" | Kısmen doğru: gerekçe kısmen doğru ya da sildi ama doğrulamadı | Doğru gerekçeyi çeldiricilerden ayırdı **ve** resmî kanaldan bağımsız doğruladı ya da bildirdi | Sayfa 3–4 | Otomatik |
| **R3 Aktarma** | Yeni senaryoda yanıldı | İpucuyla doğru | İlk denemede doğru + gerekçe | Beceri kontrolü (§6.5), havuzdan rastgele varyant | Otomatik |
| **R4 Belirsizlik** | Belirsiz mesaja kesin hüküm verdi | — | "Emin değilim, doğrularım" dedi ve doğrulama eylemi seçti (doğru sayılır) | Beceri kontrolü, Kart C | Otomatik |
| **R5 Tavsiye** (isteğe bağlı) | Yok ya da genel | Tek doğru eylem | 2–3 cümle, eylem + gerekçe | Sayfa 5 metin alanı | Eğitmen / akran, 0–2 |

R2'nin 0/1/2 düzey tanımları, Tur 1'deki iki ölçütün birleştirilmesiyle bu belgede yazıldı **[Sentez]**. learning-scientist birleşik düzey tanımını vermedi; onayı gerekiyor.

### 7.3 Geçme ve XP

- **Tur 1 eşiği:** 5 otomatik ölçütün toplamı 10 puandı. Geçme için ≥7/10 ve "işaret" ile "eylem" ölçütlerinin her biri ≥1 gerekiyordu.
- **Birleşme sonrası uyarlama [Sentez, learning-scientist onayı gerekli]:** Otomatik bölüm R1–R4 = 8 puan. Geçme için ≥6/8 (aynı %75 düzeyine yakın) ve R1 ≥1, R2 ≥1.
- **XP:** XP rubrik puanına göre değil, §6.4 ve §6.5'teki koşullarla verilir. Tamamlama XP'si ipucundan ve deneme sayısından bağımsızdır. Ustalık XP'si yalnızca R3 için, ilk sunulan ya da yeni bir varyantta verilir. Rubrik puanı yalnızca eğitmen analitiğinde ve aralıklı tekrar seçiminde kullanılır.
- **Aralıklı tekrar:** 2–3 gün sonra ana sayfada 3 soruluk "Hatırla" kartı çıkar. learning-scientist Tur 2'de günlük tavanlı küçük bir XP'yi kabul etti (gamification-economy önerisi `review.spaced`; öncelik P1).

### 7.4 Geçerlilik uyarısı

Bu rubrik ölçütle kurulmuş bir tasarımdır; **ölçme güvenilirliği test edilmedi**. Her ölçüt için en az 3 varyant gerekir. 5–8 gerçek öğrenciyle sesli düşünme protokolü ve 1 hafta sonra gecikmeli bir aktarma sorusuyla doğrulanmalıdır *(learning-scientist)*. Başarı oranı uydurulmaz, testten sonra raporlanır.

---

## 8. Karar özeti ve açık kararlar

### 8.1 Kararlar

| Öğe | Karar | Öncelik | Kaynak |
|---|---|---|---|
| Uygulama sayfasındaki "Okudum, tamamla" + açık çözüm | Değiştir → `MissionRunner` | P0 | learning-scientist, interactive-mission |
| Sahte Kampüs Bursu görevi (§6) | Yeni spesifikasyonla uygula | P0 | interactive-mission, underground-storyteller |
| Kanca = görev cümlesi (aynı ekranda seçim) | Değiştir | P0 | underground-storyteller |
| Dersin başındaki hero görsel ve DOSYA kutusu | Kapanışa taşı | P0 | underground-storyteller |
| "Emin değilim" kuralı | Değiştir | P0 | learning-scientist, htb-academy-ux, underground-storyteller |
| Quiz reformu (varyant, karıştırma, ilk yanlışta cevabı verme) | Değiştir; yeni XP kurallarından önce | P0 | learning-scientist |
| Kontrol noktası: görünür kilit nedeni, `firstTry` kaydı | Ekle | P0 | tryhackme-ux, htb-academy-ux |
| `continueTarget` PROGRAM atlaması (STARTED dalı dahil) | Değiştir | P0 | htb-academy-ux |
| Eksik görsel kutusunu gösterme, ders başına 1 görsel | Değiştir | P0 | motion-visual |
| 12 bölümlük 0 seviye yolu; Python ve Linux isteğe bağlı | Sırayı değiştir; M01–M11 korunur | P1 | learning-scientist |
| Wi-Fi (Bölüm 5) ve tarayıcıda log okuma (Bölüm 11) | Yeni içerik | P1 | learning-scientist |
| Nöbetçi sesi 3 yerle sınırlı | Değiştir | P1 | underground-storyteller |
| 2 ders düzeni, tek `LessonFrame` | Değiştir | P1 | htb-academy-ux, elite-ui-director |
| "Mor Mürekkep" AI stili | Değiştir | P1 | motion-visual |
| Mini görevler: 03:12 logları, fotoğraf, QR | Ekle | P1 | interactive-mission |
| Ders gövdesindeki "Gölge Ağ hikâyesi →" bağlantısı | Kapanışa taşı | P1 | underground-storyteller |
| M11 ısınması (tcp flag, base64) | 0 seviye için yeniden yaz, ileri öğrencide koru | P1 | learning-scientist |
| "Hatırla" kartı | Ekle | P1 | learning-scientist, gamification-economy (aktarılan) |
| Kulüp etkinliği "Kayıp dosya" | Ekle | P2 | interactive-mission |
| Bir kez verilen quiz XP'si, `lab/` sentetik veri, `FlowAnimationView` reduced-motion mimarisi | Koru | — | learning-scientist, motion-visual |

### 8.2 Açık kararlar (sahibi belirtilmiş)

| # | Soru | Seçenekler | Karar sahibi |
|---|---|---|---|
| A1 | Ders başına kontrol noktası sayısı | 2 (tryhackme-ux, htb-academy-ux) / 3 (elite-ui-director, learning-scientist) / **[Sentez]** varsayılan 2, ≥10 dk derste 3 | learning-scientist + elite-ui-director |
| A2 | Modül ve beceri kontrolü XP değerleri | 60 + 30 (bu belge) / 30 + 30 (learning-scientist rubriği) | gamification-economy |
| A3 | Kısa ilk görevin XP'si ve Bölüm 3 adımlarıyla ilişkisi | Aynı anahtar / ayrı küçük ödül; adımlar "görüldü" sayılsın mı | gamification-economy + learning-scientist |
| A4 | Kancada üçüncü kişi ("Deniz") mi, ikinci kişi ("sen") mi | underground-storyteller Tur 2'de Deniz'i kullandı, MASTER_PROMPT tonu "sen" diyor. Bu belge kancada Deniz'i, talimatlarda "sen"i kullanıyor. | underground-storyteller; gerçek testte doğrulanmalı (G2) |
| A5 | Kurgusal alan adı seti (§6.2) | Bu belgede seçildi | underground-storyteller + interactive-mission onayı |
| A6 | R2 birleşik düzey tanımları ve 6/8 eşiği | §7.2–7.3 uyarlaması | learning-scientist |
| A7 | İki seçenekli kancalara (1, 6) ve bariz çeldiricili kancalara (2, 8) yeni çeldiriciler | Yazılmadı | underground-storyteller |
| A8 | `karakterler.yaml` karikatür estetiği | Koru / yeniden yaz; G2 sonucuna bağlı | underground-storyteller |

**Uygulanmamış olanlar:** Bu belgedeki `::gorev`, `::adim`, `:::kontrol`, `MissionRunner`, `mission.complete`, `MissionAttempt`, `ilk_gorev:` ve frontmatter alanlarının hiçbiri henüz kodda yok. Yalnızca tasarım kararıdır. Uygulama planı ve test sonuçları `07-implementation-and-tests.md` belgesindedir.
