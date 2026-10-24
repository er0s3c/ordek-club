# 02 — Tartışma günlüğü (Tur 2: karşılıklı eleştiri ve tartışma turu)

> **Not:** Ajanlar bu oturumda Claude Code alt ajanı olarak, her biri kendi `.claude/agents/<ad>.md` tanımını sistem rolü olarak okuyarak AYRI ayrı çalıştırıldı (yeni eklenen ajan tipleri oturum yeniden başlamadan yerel tip olarak yüklenemediği için). Agent Teams kullanılmadı; tartışma, ana ajanın ayrı raporları birbirine iletmesiyle yürütüldü — "simüle edilmiş toplantı" değil, ayrı raporlardan sentez.
>
> **Tur 1'de çalışan ajanlar:** tryhackme-ux, htb-academy-ux, elite-ui-director, student-zero-knowledge, student-curious-beginner, student-bored-skeptic, underground-storyteller, learning-scientist, gamification-economy, interactive-mission, club-live-experience, motion-visual, accessibility-simplicity, student-ux-research, product-admin, technical-architect.

Hazırlayan: belge yazıcısı alt ajan, 2026-10-23. Girdi: Tur 2'de ayrı ayrı üretilen 4 eleştiri raporu ve 5 tartışma raporu (aşağıda). Ortak bağlam: `00-current-state.md`, `MASTER_PROMPT.md`, marka için `docs/TASARIM-SISTEMI.md` (CIU tasarım sistemi).

---

## 0. Okuma kuralları (bu belgede ne var, ne yok)

- **Öğrenci görüşleri simülasyondur.** student-zero-knowledge, student-curious-beginner ve student-bored-skeptic kurgusal personalardır. Hiçbir rapor gerçek öğrenci gözlemi, oran ya da test sonucu içermiyor; bu belgede de yok.
- **"Çözüldü" = tasarım kararıyla karşılandı.** Hiçbir karar henüz kodda uygulanmadı, hiçbiri gerçek kullanıcıyla sınanmadı. Gerçek test protokolü `06-usability-study.md`'ye aittir.
- **Kaynak gösterimi:** Her görüş, onu yazan ajanın adıyla verilir. Bir ajanın Tur 1 önerisi başka bir ajanın alıntısından aktarılıyorsa bu belirtilir.
- **Yazıcı notu** etiketiyle verilen satırlar, raporlarda olmayan, belge yazıcısının kaynakları karşılaştırarak yaptığı tespitlerdir (ör. tasarım sistemiyle çatışma, satır numarası farkı).
- learning-scientist kendi kanıt etiketlerini kullanıyor: **[Kod]** repoda doğrulandı, **[Araştırma-güçlü/orta]** alanyazında yerleşik ama bu kitlede sınanmadı, **[Hipotez]** tahmin. Bu etiketler aynen korundu.

---

## 1. Tur 2'nin yapısı

### 1.1 Kim hangi adımda çalıştı

| Adım | Ajan | Girdi | Çıktı |
|---|---|---|---|
| Karşılıklı eleştiri | student-zero-knowledge | Tur 1 tasarım/içerik önerileri | Konsept ve öneri bazında "kalır mıyım / takılırım / düzelir", 7 P0, 10 terim sadeleştirme |
| Karşılıklı eleştiri | student-curious-beginner | Aynı | Öneri bazında değerlendirme, 5 P0, ajanlara itiraz listesi, öncelik tablosu |
| Karşılıklı eleştiri | student-bored-skeptic | Aynı | 6 ortak P0, ajan bazında değerlendirme, P0/P1/P2 sırası |
| Karşılıklı eleştiri | learning-scientist | Aynı + `service.ts` | Pedagojik değerlendirme, konsept kıyası, 4 P0 itirazı, karar tablosu |
| Tartışma | tryhackme-ux | Tur 1 raporları + Tur 2 eleştirileri | 3 çelişki, karşı öneriler, kabul ettiği eleştiriler |
| Tartışma | htb-academy-ux | Aynı + `service.ts`, ders sayfası | 3 çelişki, yeni kod bulgusu (`continueTarget` STARTED dalı), karar tablosu |
| Tartışma | elite-ui-director | Aynı | 3 çelişki, güncellenmiş A/B/C tanımı, kabul testi |
| Tartışma | learning-scientist | Aynı | 3 çelişki, kendi Tur 1 önerisinde değişiklikler |
| Tartışma | underground-storyteller | Aynı + `m01-01-neden-onemli.md` | 3 çelişki, kanca/ifşa yeniden tasarımı, karar tablosu |

### 1.2 Doğrudan katılmayan ajanlar

gamification-economy, interactive-mission, club-live-experience, motion-visual, accessibility-simplicity, student-ux-research, product-admin ve technical-architect Tur 2'de ayrı bir rapor yazmadı. Onların Tur 1 önerileri, eleştiri ve tartışma raporlarında **alıntı olarak** yer aldı. Bu ajanların Tur 2'de kendilerine yöneltilen itirazlara yanıtı **yok**. Bu nedenle onlara yöneltilen itirazların bir kısmı aşağıda "açık" ya da "kısmen çözüldü" olarak işaretlendi.

### 1.3 Süreç sınırlamaları (raporların kendi beyanları)

- **tryhackme-ux, htb-academy-ux ve elite-ui-director** kendi Tur 1 raporlarının bu turun girdisinde olmadığını, önerilerini diğer raporlardaki alıntılardan çıkardıklarını yazdı. Yani bu üç ajan kendi Tur 1 metinlerini değil, onların aktarılmış hâlini savundu.
- **student-zero-knowledge, student-curious-beginner ve student-bored-skeptic** kod bulgularını yeniden doğrulamadı; "raporlara göre" düzeyinde aldı.
- **Kod doğrulaması yapan ajanlar:** learning-scientist, tryhackme-ux, htb-academy-ux (`service.ts`, ders sayfası), underground-storyteller (`m01-01-neden-onemli.md`).

---

## 2. Tur 2'de yapılan kod doğrulamaları

| Bulgu | Doğrulayan | Kaynak satırı (rapora göre) | Yazıcı notu |
|---|---|---|---|
| Ders tamamlama yalnızca süreye bağlı: `MIN_READ_MS = 15_000` | learning-scientist, tryhackme-ux, htb-academy-ux | 142 / 144 / 143 (üç rapor üç farklı satır verdi) | Çalışma ağacında `service.ts` değiştirilmiş durumda; yazıcının taramasında sabit **144. satırda**. Fark, raporların farklı anlarda okunmasından kaynaklanıyor olabilir; içerik aynı. |
| `gradeQuiz` açıklamayı doğru ya da yanlış her cevapta döndürüyor | learning-scientist (`service.ts:23-28`), htb-academy-ux (`service.ts:27`) | 23-28 | Yazıcı taramasında `return { correct, explanation: q.explanation }` 28. satırda. |
| `continueTarget` önce `STARTED` durumundaki dersi döndürüyor; PROGRAM türünü yalnız "sıradaki ders" sorgusunda atlamak yetmez | htb-academy-ux (**Tur 2'nin yeni bulgusu**) | 186-191 | Fonksiyon tanımı 187. satırda. |
| M01-01 dersi ilk fikirden önce iki görsel ve bir anlatıyla açılıyor (hero görsel, DOSYA kutusu, portre, "Bölüm 1" anlatısı, ders dışına çıkaran "Gölge Ağ hikâyesi →" bağlantısı) | underground-storyteller | `content/academy/01-temel/m01-dijital-tehlikeler/01-neden-onemli.md` | — |

---

## 3. Öğrenci personalarının eleştirisi (simülasyon)

### 3.1 elite-ui-director'ın üç konsepti

| Konsept | student-zero-knowledge | student-curious-beginner | student-bored-skeptic | learning-scientist |
|---|---|---|---|---|
| **A · Mission Control** | İskelet olarak kalır. Takılma: "Hiç/Biraz/Rahatım" sorusunda "Hiç" demek utandırıcı; ilk gün 0/5 haftalık hedef baskı; "yol halkası", "Görev Panosu", "KPI" anlamsız. | İskelet olarak kalır. Takılma: aynı seviye sorusu; boş sağ ilerleme kolonu. Düzeltme: kolon ve halka ilk tamamlamaya kadar gizli. | Ana ekran düzeni kalır. Takılma: 3 adımlı kurulum (ad, bölüm, seviye) görevden önce bir form; "Bölümü neden soruyorlar?". | Mekanizma: hedef netliği. Risk: halka ve "3/5" sayfa sayarsa vekil metriği ödüllendirir. |
| **B · Cyber Mystery** | Kabuk olarak çıkar, tek vaka kartı olarak kalır. Gece teması "hacker ortamı, benlik değil" der. | Kabuk olarak hayır, içerik olarak evet. Sahne ekranı 1 cümleye insin, ilk dokunuş 10 sn içinde. | Tam kabuk hayır, içerik katmanı evet. "Her şey yerli yerinde. Bir satır hariç." metnini sevdi. | Aktarma için en uygun mimari [Araştırma-orta]; ama gece kabuğu ve sinematik giriş en yüksek yükü getiriyor. |
| **C · Friendly Academy** | Ton ve ders gövdesi olarak en çok bundan kalır; sözlük dokunuşu P0 olsun. Takılma: ilk ders okuma gibi, küçük başarı yok. | En çok kalacağı konsept. Takılma: altı noktalı jargon çizgisi telefonda keşfedilmez; 12 bölümlük patika uzun. | Dil olarak evet. Cesaretlendirme cümleleri her ekranda olursa "patronluk" gibi okunur. | En düşük yük; ama öğrenmeyi güçlendiren zorluk eksik kalabilir. |
| **Melez (A iskelet + C dil + B içerik)** | Kalır; şart: üç stil aynı ekranda karışmasın. | Kalır; üç şart: sağ kolon gizli, B sahnesi 1 cümle, C dili her yerde aynı. | Katılır; tek risk tutarsız dikiş. | Kabul, düzeltmeyle: **B süs değil, ders gövdesinin etkileşim motoru** olmalı. |

### 3.2 Ana öneriler

| Öneri (sahibi) | zero-knowledge | curious-beginner | bored-skeptic | learning-scientist |
|---|---|---|---|---|
| Tek "Sıradaki adım" kartı (elite-ui-director, tryhackme-ux) | Kalır, **P0 çözümü**. "+60 XP" açıklansın; lig şeridi ilk gün gizli. | Kalır. Lig şeridi kafa karıştırır; ilk tamamlamaya kadar çıkmasın. | Kalır, P0-2'nin çözümü. "Bilgin yoksa sorun değil" cümlesi fazla sıcak. | Gereksiz bilişsel yükü azaltır [Araştırma-güçlü: Sweller]. |
| `continueTarget` PROGRAM türünü atlasın (tryhackme-ux) | Kalır, **P0**. | **P0-1**. | **P0-1**, "en ucuz ve en yüksek etkili düzeltme". | Doğru ve ucuz. |
| Üç kademeli yazı, uppercase azaltma (elite-ui-director) | Kalır, **P0**: büyük harf başlık "bağırıyor". | Kalır; sayfa başına en fazla bir uppercase eyebrow. | Kalır; uzun başlıkta otomatik küçük harf sınırı. | Destekliyor; öğrenmeye etkisi dolaylı [Hipotez]. |
| Kontrol noktası + "Tamamla" kapısı (htb-academy-ux, learning-scientist, interactive-mission, gamification-economy) | **P0**, ama dozaj: her adımda soru sınav gibi; kilitliyse "1 görev kaldı" yazsın; "Emin değilim" hep geçerli olsun. | Kalır; her soruda "Bir tane seç / Birden fazla seçebilirsin" yazsın; yanlışta seçim ekranda kalsın. | Kalır, dozunda; "6 bölümlük derste 6 kez durdurulurum". Sessiz kilit beni çıkarır. | **P0-1:** 3 seçenekte en fazla 3 tıkla geçilir; ilk deneme ayrı kaydedilmeli. |
| MissionRunner, "Sahte Kampüs Bursu" (interactive-mission) | İlk dakikada somut başarı veren tek öneri. "Gönderen ▾" keşfedilmezse **P0 risk**. | Kalır; ama 5 adım tipi fazla; `classify` ikinci derse taşınsın. | Kalır; ~7 karar noktası fazla, `evidence` ve `classify` birleşsin. | Destekliyor; ama "3 karttan en az 2'si doğru" rastgele tahminle ~%26 (7/27, hesap, veri değil). |
| Nöbetçi anlatıcı (underground-storyteller) | Kalır; saat damgası yalnız kanca ekranında. | Kalır; anlatıcı talimatta değil, yalnız geri bildirimde konuşsun. | Kalır; yalnız kanca, yanlış cevap, kapanış. | Gecikmeli serbest hatırlama testi doğru ölçüt [Araştırma-güçlü]; 12 ders örneğinde çeldiriciler zayıf. |
| Takma ad, lig, Sakin Seri (gamification-economy) | Takma ad ve dinlenme günü P1; ilk ekranda lig/sıra **çıkar**. | Takma ad en önemli parça; ilk ziyaret modalı olursa **çıkarır**. | Takma ad varsayılanı kalır; modal ilk liderlik ziyaretine ertelensin. "Bu ay kimse seni geride bırakmak zorunda değil" cümlesi çıksın. | `lesson.proof`, okuma tavanı, `review.spaced` doğru yön; ama `track.complete` quiz reformundan önce gelirse sorunu çözmez (**P0-2**). |
| Canlı: lobi, kopma şeridi, "Takıldım" (club-live-experience) | En değerli parçalar; "Sadece sayı görünür, adın görünmez" yazsın. Eski slaytta donma **P0**. | Anonim "Takıldım" en değerli öneri; "Kimse kim olduğunu görmez" yazsın. | Kalır (P0-5). Ama El kaldır, Soru sor, Geri bak, Raf + 2 yeni düğme = telefonda kalabalık. | Anlık biçimlendirici sinyal [Hipotez]. Eksik: canlı quizde "neden" satırı (P1). |
| Eksik görsel kutusunu gizle, Kolay/Tam mod (motion-visual) | Gizleme **P0**. Kolay/Tam anahtarı yeni karar yükü; varsayılan Kolay. | Kolay mod gerekli; "Ayrıntıyı aç (8 adım, ileri seviye)" ürkütücü. | Gizleme **P0**; ok etiketleri yalnız seçili adımda. | Mayer ilkeleriyle uyumlu [Araştırma-güçlü]. Eksik görseli öğrenme açısından P1 sayar ama P0 kararına itiraz etmez. |
| 12 bölümlük 0 seviye yolu (learning-scientist) | Python/Linux'u ön koşuldan çıkarma kalır; "TİU" gibi kısaltmalar öğrenci arayüzüne sızmasın. | Kalır; M11 0 seviye için yeniden yazılsın. | Kalır; yalnız sıradaki 3 bölüm açık görünsün. | (Kendi önerisi) — rubrik 6 ölçütten 5'e insin. |
| 5 sekmeli navigasyon (tryhackme-ux) | Kalır; "Görevler" adı yanıltıcı (Dosyalar, Sınıflar da içinde). | Kalır; "Ben" içinde "İlerleme" ve "Hesap" alt sekmeleri. | Kalır; "Öğren" ile "Görevler" farkı net değil. | — |
| Beceri haritası, "Bu modül bitince" (htb-academy-ux) | — | Kalır; "Zorluk: Orta" ürkütür, "Kimler için" yazsın. | Kalır; ama 4 ders düzeni çok. | Her madde bir kontrol noktasına eşlenmezse "pazarlama metni" olur. |
| Güven sorusu "Tahmin/Biraz/Eminim" (learning-scientist Tur 1) | — | İlk 3 derste **çıkarır**. | Her kontrol noktasında görünce çıkar; yalnız ders sonunda tek kez. | (Kendi önerisi) Her noktada yük eklediğini kabul ediyor. |

### 3.3 student-zero-knowledge'ın terim sadeleştirme listesi

| Terim | Öneri |
|---|---|
| OSINT | "İnternette iz sürmek" |
| Phishing / oltalama | "Sahte mesaj tuzağı" (ilk geçişte sade, sonra terim) |
| DNS | "İnternetin adres defteri" |
| MFA / passkey | "İkinci kapı" / "Şifresiz giriş anahtarı" |
| Log | "Sistem günlüğü" |
| CTF | "İzinli bulmaca yarışması" |
| Kalkan dosyan | "XP ve seviyen" |
| Kod adın: Tilki | Açıklama ekle: "Listede görünecek takma adın" |
| M01 / Yol A | İkisinden biri kalsın, sade ad önde |
| Lig / Yeni Kadro / Sakin Seri | İlk haftada hiç gösterme |

Bu liste tartışma turunda reddedilmedi. elite-ui-director C konseptinde "OSINT (internette iz sürmek)" biçimini örnek olarak kullandı.

---

## 4. Tartışmasız uzlaşı noktaları

Aşağıdaki noktalarda Tur 2 raporlarının hiçbirinde itiraz yok:

| Uzlaşı | Destekleyen ajanlar |
|---|---|
| Tamamlama ve XP öğrenme kanıtına bağlanmalı; 15 saniye bekleyip tıklamak XP getirmemeli | learning-scientist ([Kod] doğruladı), student-bored-skeptic, student-curious-beginner, student-zero-knowledge, tryhackme-ux, htb-academy-ux, elite-ui-director; Tur 1'de htb-academy-ux, gamification-economy, interactive-mission, tryhackme-ux, underground-storyteller aynı kusuru buldu (curious-beginner'ın sayımı: altı ajan) |
| "Başla" düğmesi broşüre (PROGRAM sayfası) değil göreve gitmeli | üç öğrenci, learning-scientist, tryhackme-ux, htb-academy-ux, elite-ui-director |
| İlk ekranda tek kart, tek yeşil düğme (`--ciu-green` birincil CTA) | üç öğrenci, tryhackme-ux, elite-ui-director, learning-scientist |
| İlk görevde parola kutusu yok, "SİMÜLASYON" rozeti var | student-curious-beginner, student-bored-skeptic |
| Hover'a bağlı etkileşim yok; dokunmatikte çalışmalı | student-zero-knowledge, student-bored-skeptic, tryhackme-ux, elite-ui-director |
| Cevap anahtarı istemciye gitmez, sunucuda yeniden doğrulanır | learning-scientist (interactive-mission'ın Tur 1 önerisini destekledi) |
| Python ve Linux 0 seviye yolunda ön koşul değil | student-zero-knowledge, student-bored-skeptic, student-curious-beginner |
| Patikada yalnızca sıradaki 3 düğüm açık, kalanı katlı | student-zero-knowledge, student-curious-beginner, student-bored-skeptic, tryhackme-ux, elite-ui-director, learning-scientist |
| Sakin Seri / dinlenme günü | student-bored-skeptic, student-curious-beginner, student-zero-knowledge; learning-scientist "öğrenme etkisi nötr" [Hipotez] |
| Gerçek test 5–8 gönüllüyle sonra yapılacak; sonuç uydurulmayacak | dokuz raporun tamamı |

---

## 5. Çelişkiler, itirazlar ve çözümler

Her çelişki için: kim neyi savundu, kim itiraz etti, karşı öneriler ve sonuç. **Durum** sütunu: *Çözüldü* (taraflar aynı karara vardı), *Kısmen* (ana yön ortak, ayrıntıda fark var), *Açık* (itiraz edilen ajan yanıt vermedi ya da taraflar ayrıştı).

### Ç1 — Kontrol noktası sıklığı ve "doğruyu bulana kadar kilit"

- **Savunan:** htb-academy-ux (Tur 1 Ö2): her H2 sonunda soru; kontrol noktası geçilmeden sonraki bölüm açılmaz.
- **İtiraz:**
  - student-bored-skeptic: "6 bölümlük derste 6 kez durdurulurum."
  - student-zero-knowledge: her adımda soru sınav gibi; "rezil olur muyum?" korkusu.
  - learning-scientist (P0-1): 3 seçenekte en fazla 3 tıkla geçilir, tahmin görünmez kalır.
- **Tartışma turunda:**
  - tryhackme-ux: kilit "Tamamla"ya konunca sırayla denemek ödüllendiriliyor. "Dersi bitir" kontrol noktası **yanıtlanınca** açılsın, doğru cevap şartı olmasın. Ustalık XP'si yalnız ilk denemedeki doğruya ya da yeni varyanta.
  - htb-academy-ux: "Kilit yanlış değil, yanlış olan kilidin ölçtüğü şey." Soruyu kaldırmak 15 sn'lik `MIN_READ_MS` ekonomisine geri götürür. Kabul ettiği karşı öneri: `firstTry` kaydı, 2 yanlıştan sonra çözümlü örnek, öğrenci yine ilerleyebilir.
  - elite-ui-director: karar anlarının sıklığı içerik yazarına değil **UI kuralına** bağlansın.
  - learning-scientist: sorular bölüme göre değil, öğrenme çıktısına (`yapabilir` maddesine) göre konsun [Araştırma-güçlü: test etkisi].
- **Üst sınırda fark:** tryhackme-ux ve htb-academy-ux **en fazla 2**, elite-ui-director ve learning-scientist **en fazla 3** kontrol noktası diyor.
- **Sonuç:** Kontrol noktası yalnızca karar gerektiren bölümde; okuma bölümleri "Devam" ile akar; ilk deneme ayrı kaydedilir; 2 yanlıştan sonra çözümlü örnek; yanlış cevap ilerlemeyi durdurmaz; ustalık XP'si yalnız ilk denemede ya da yeni varyantta. Kilit asla sessiz değil: `Dersi bitir` (kapalıyken `1 karar kaldı · ≈1 dk`; htb-academy-ux'e göre tıklayınca ilgili bölüme kaydırır ve odağı taşır).
- **Durum:** **Kısmen.** Üst sınırın 2 mi 3 mü olacağı Tur 3'te karara bağlanmalı. *Yazıcı notu:* İki değer çelişmiyor; "ilk dersler için 2, sonrası için 3" gibi bir ayrım raporlarda önerilmedi, Tur 3'e aday olarak not edildi.

### Ç2 — "Emin değilim" her zaman doğru mu?

- **Savunan:** student-zero-knowledge: "Emin değilim" her zaman geçerli bir cevap olsun (Tur 1'de underground-storyteller ve learning-scientist'in önerisine dayandırarak).
- **İtiraz:** learning-scientist (P0-3): gerekçe istenmezse her kartta güvenli varsayılana dönüşür; eğitmen analitiği "anladı" ile "denedi ve tutturdu"yu ayıramaz.
- **Tartışma turunda:** underground-storyteller, htb-academy-ux ve elite-ui-director learning-scientist'in kuralını kabul etti; storyteller zero-knowledge'ın korkusunu da "ceza metni olmaz" şartıyla korudu.
- **Sonuç:**
  - "Emin değilim" yalnızca gerçekten belirsiz kartta (learning-scientist'in K3'ü) doğru sayılır ve ardından bir doğrulama eylemi seçmek zorunludur (ör. "Okulun kendi sitesinden kontrol ederim", "Başka kanaldan sorarım").
  - Net kartta yanlış sayılır, ama ceza metni yok. Örnek metinler: underground-storyteller "Dürüst cevap. Bu sefer ipucu ekranda: adrese bak."; learning-scientist "Burada bir ipucu var, istersen göster."
  - UI biçimi (elite-ui-director): ikincil hap; seçilince zorunlu takip çipi "Nasıl doğrularsın?".
- **Durum:** **Çözüldü.** (student-zero-knowledge Tur 2'den sonra yeniden çalıştırılmadı; kararı onaylayıp onaylamadığı bilinmiyor.)

### Ç3 — Güven sorusu ("Tahmin / Biraz / Eminim")

- **Savunan:** learning-scientist (Tur 1): her kontrol noktasında güven sorusu.
- **İtiraz:** student-curious-beginner (ilk 3 derste çıkarır; tahmin ettiğini itiraf etmek utandırıcı), student-bored-skeptic (fazladan tıklama, sınav hissi).
- **Tartışma turunda:**
  - learning-scientist itirazı kabul etti: güven sorusunun yararı üst-bilişi kalibre etmek, bu da yeni başlayanda ancak birkaç deneyimden sonra işe yarar [Hipotez]. İlk 3 derste hiç yok; sonrasında yalnız ders sonunda, tek kez, atlanabilir. Metin: "Bunu yarın bir arkadaşına anlatabilir misin? [Evet] [Galiba] [Henüz değil]". XP'yi ve sıralamayı etkilemez.
  - elite-ui-director: ayrı ekran olmasın; seçimden sonra aynı kartta 3 küçük çip, atlanabilir, derste yalnız 1 kritik noktada.
- **Sonuç:** İlk 3 derste güven sorusu yok; sonrasında derste bir kez, atlanabilir, XP'den bağımsız.
- **Durum:** **Kısmen.** Yer konusunda küçük fark var: learning-scientist "ders sonunda", elite-ui-director "kritik noktada, aynı kartta çip". Pedagojik sahip learning-scientist olduğu için ders sonu biçimi öncelikli aday; UI biçimi (çip, ayrı ekran yok) iki öneriyle de uyumlu.

### Ç4 — İlk görevin uzunluğu ve sınıflandırma adımının yeri

- **Savunan:**
  - interactive-mission (Tur 1): 5 adım tipi (`inbox`, `inspect`, `choose`, `pick-evidence`, `classify`), yaklaşık 7 karar noktası.
  - underground-storyteller (Tur 1): 8 ekranlık "Sahte Burs" modülü.
  - technical-architect (Tur 1, F4; tryhackme-ux'in aktarımıyla): ilk görev `m01-05` olarak sabitlensin (15 dakikalık sayfa).
- **İtiraz:** student-curious-beginner ve student-bored-skeptic "mini görev için fazla"; curious-beginner kilitli mailleri ("Önce ilk mesajı çöz") ve "yem" etiketleri sinir bozucu buluyor.
- **Tartışma turunda:**
  - tryhackme-ux: 15 dk'lık uygulamayı "ilk 5 dakika" kartının arkasına koymak broşür hatasını başka biçimde tekrarlamak olur. İlk görev ≈3 dk'lık "Şüpheli Mesaj · Kısa": aç → karar ver → kanıtı seç. Uzun sürüm ve `classify` `m01-05`'te. İlk görev slug'ı `akademi.yaml` içinde `ilk_gorev:` alanında.
  - htb-academy-ux: öğrenciler haklı ama adımları silmek çözüm değil; sınıflandırma (görülmemiş kartlara aktarma) öğrenmenin kanıtı. İlk görev 3 adım ≈4 dk; sınıflandırma M01'in son sayfasına "Beceri kontrolü · 3 yeni mesaj" olarak taşınsın ve bugünkü tanım quiz'inin ("Purple Team nedir?") yerini alsın.
  - elite-ui-director: B vaka motorunda evidence ve classify tek adımda birleşsin (student-bored-skeptic'in önerisi).
  - underground-storyteller: akış 8 ekrandan 5'e (kanca+seçim, gönderen incelemesi, kanıt, karar, kapanış); ipucu ayrı ekran değil, düğme.
- **Sonuç:** İlk görev 3 karar adımı ve en fazla birkaç dakika; aktarma/sınıflandırma ilk görevden çıkarılıp modül içinde sonraya alınıyor; ipucu düğme.
- **Durum:** **Kısmen.** Ortak yön net, ama üç ayrıntı açık: (a) sınıflandırma `m01-05`'e mi (tryhackme-ux) yoksa M01 son sayfasına mı (htb-academy-ux) gidiyor; elite-ui-director ise birleştirip ilk akışta tutuyor; (b) süre ≈3 dk (tryhackme-ux) / ≈4 dk (htb-academy-ux) / 5 ekran (underground-storyteller); (c) interactive-mission ve technical-architect bu değişikliklere Tur 2'de yanıt vermedi.

### Ç5 — Ders düzeni sayısı

- **Savunan:** htb-academy-ux (Tur 1): türe göre 4 düzen (A akordeon, B tek kart, C bölünmüş masa, D bilgi).
- **İtiraz:** student-bored-skeptic: "Dört düzen çok, yönümü kaybederim." learning-scientist: tür içinde tutarlıysa yük artmaz (itiraz değil, nüans).
- **Tartışma turunda:**
  - htb-academy-ux: bored-skeptic'i kabul etti; 183 sayfada 4 düzen fazla. İki düzen: **Adım dersi** (`::adim` ayraçları, technical-architect F2; "Adım 2/5" rayı) ve **Görev** (`MissionRunner`). Akordeon yalnız Sezon 2 ve derinleşme sayfalarında.
  - tryhackme-ux: iki düzen: **adım kartı** (içinde açılabilir "masa" paneli) ve **okuma**.
  - elite-ui-director: tek `LessonFrame` iskeleti (üstte 12px ilerleme rayı, en fazla 640px gövde, altta yapışkan eylem çubuğu ve tek yeşil düğme). Tür yalnız gövde yoğunluğunu değiştirir (`step`, `read`); inceleme masası ayrı düzen değil, yuva (`slot="evidence"`): ≥1024px sağda, mobilde alttan açılan panel. Gerekçe: dört düzen dört ayrı QA ve erişilebilirlik matrisi.
- **Sonuç:** Tek sabit iskelet + iki gövde türü; "Tamamla" her derste aynı yerde.
- **Durum:** **Çözüldü** (adlandırma farkı var: htb "Adım dersi/Görev", tryhackme "adım kartı/okuma", elite "step/read + evidence slot"; üçü aynı yapıyı tarif ediyor. `04-final-ux-spec.md`'de tek ad seçilmeli).

### Ç6 — Koyu yüzey: ilerlemeyle mi, nesne türüyle mi?

- **Savunan (ilerlemeyle açılan):** tryhackme-ux ve student-zero-knowledge: koyu tema ilk 3 dersten sonra açılan bir seçenek; htb-academy-ux de bunu "koyu lab teması varsayılan değil, ilk 3 dersten sonra seçenek" olarak kabul etti.
- **Diğer itirazlar:** interactive-mission (Tur 1, elite'in aktarımıyla) posta gövdesinin açık renk olmasını istiyor; club-live-experience (Tur 1) projektörde koyu, düşük kontrastlı sahneye itiraz ediyor.
- **İtiraz (elite-ui-director):** Koyu temayı ödül ya da aşama yapmak ürünü ikiye böler; dördüncü derste arayüzün değişmesi "başka bir ürüne geçtim" hissi verir. Kendi Tur 1 Ö2'deki "tek gece yüzeyi"nin de fazla geniş olduğunu kabul etti.
- **elite-ui-director'ın karşı önerisi:** yüzeyi nesne türü belirlesin:
  - `--surface-paper` (krem): ders metni, kararlar, posta maketi, ana ekran (ürünün yaklaşık %90'ı, elite'in tahmini).
  - `--surface-night`: yalnız kanıt nesneleri (log kartı, terminal, ağ akışı); bu yüzeylerde `--focus-ring: #17FF74` (accessibility-simplicity Ö1).
  - Projeksiyonda `salon` kipi: krem zemin, gövde metni en az 28px, sağ altta "katıl" rozeti (club-live-experience Ö3).
- **Ortak zemin:** Koyu yüzey varsayılan değil; ilk görevde (Sahte Burs) hiç koyu yüzey yok; posta maketi krem; ders gövdesi krem.
- **Durum:** **Kısmen.** tryhackme-ux tartışma raporunda hâlâ "koyu lab teması yalnız masa ve terminal alanında, ilk 3 dersten sonra isteğe bağlı" diyor; bu, elite'in "işlevle" kuralına büyük ölçüde yakın, ama "ilk 3 ders" kapısını koruyor. Kapının kalıp kalmayacağı Tur 3'te karara bağlanmalı.
- **Yazıcı notu (tasarım sistemiyle ilişki):** `TASARIM-SISTEMI.md` §5A lab arayüzünü koyu varsayılan (`--lab-bg #15112B`) ve "açık tema isteğe bağlı" olarak tanımlıyor; terminal her temada koyu. Tartışmanın ortak zemini bunun tersini (krem varsayılan, koyu yalnız kanıt nesnesi) öneriyor. elite'in yeni tokenları (`--surface-paper`, `--surface-night`, `--focus-ring`, `--progress-track`) tasarım sisteminde yok; `--surface-paper` ≈ `--ciu-cream #FFFCF2`, `--focus-ring` = `--ciu-green #17FF74`, `--surface-night` ≈ `--lab-bg` ailesi olarak eşlenebilir. Karar kesinleşirse §5A güncellenmeli.

### Ç7 — Onboarding'de seviyenin öz-bildirimi

- **Savunan:** elite-ui-director (A konsepti): ilk girişte 3 adımlı kurulum, "Ne kadar biliyorsun? Hiç / Biraz / Rahatım".
- **İtiraz:** üç öğrenci: "Hiç" demek utandırıyor (zero-knowledge, curious-beginner); "Biraz" deyip zor derse düşmek (curious-beginner); kurulum ilk görevden önce gelen bir form, "Bölümü neden soruyorlar?" (bored-skeptic).
- **Tartışma turunda:**
  - elite-ui-director: kurulumu kaldırdı; ilk görevden sonra, atlanabilir, bölüm sorusu isteğe bağlı.
  - tryhackme-ux: ilk girişte kurulum yok; ilk görevden sonra isteğe bağlı tek satır: "Daha önce bu konuyla ilgilendin mi? İlk kez / Biraz".
  - learning-scientist: yeni başlayanın öz-değerlendirmesi zayıf kalibre olur [Araştırma-orta]; **seviye sorulmasın, gözlemlensin**. Sahte Burs görevinin ilk iki kararı tanılama verisi; ikisi de ilk denemede doğruysa "Hızlı gidiyorsun, istersen 2 dersi atla" önerisi (zorunlu değil); varsayılan yol herkes için aynı.
- **Sonuç:** İlk görevden önce hiçbir form ya da seviye sorusu yok.
- **Durum:** **Kısmen.** İlk görevden önce soru yok konusunda tam uzlaşı. Görevden sonra sorulup sorulmayacağı açık: elite-ui-director ve tryhackme-ux isteğe bağlı soruyor, learning-scientist hiç sormayıp gözlemliyor. İkisi birlikte uygulanabilir (gözlem birincil, soru isteğe bağlı), ama bu birleşim raporlarda açıkça önerilmedi.

### Ç8 — İlk ekranda oyun ekonomisi sinyalleri (lig şeridi, takma ad modalı)

- **Savunan:**
  - elite-ui-director (Ö3): ana ekranda ince şerit "Yeni Gelenler ligi · sıralamada görünmen kapalı (değiştir)".
  - gamification-economy (Tur 1, Ekran A): takma ad seçimi tek seferlik modal.
- **İtiraz:** student-zero-knowledge (ligi, XP'yi, görünürlüğü aynı anda öğrenmek; gizlilik kartı ilk girişte "ne alakası var"), student-curious-beginner ("Lig nedir? Neden kapalı?"; modal olursa çıkarır), student-bored-skeptic (modal ilk görevden önce engel; P0-6 görünür adla yarış).
- **Tartışma turunda:**
  - elite-ui-director: şeridi kaldırdı ("ilk 30 saniyede üç yeni kavram yüklüyordu"); haftalık hedef (3/5) ilk hafta gizli; sağ ilerleme kolonu ilk tamamlamaya kadar yok.
  - tryhackme-ux: takma ad sunucuda otomatik atansın; seçim kartı modal değil, liderlik sayfası ilk açıldığında satır içi (gamification-economy ve product-admin ile uyumlu, tryhackme-ux'in aktarımıyla). Lig, seri, haftalık hedef ilk görev bitene kadar yok; sonra tek satır: "XP: ilerlemeni gösteren puan. Listede görünmek isteğe bağlı."
- **Sonuç:** `completed === 0` olan hesapta ilk ekranda lig, sıra, seri ve modal yok.
- **Durum:** **Çözüldü** (gamification-economy Tur 2'de yanıt vermedi; tryhackme-ux ve elite-ui-director, gamification'ın Tur 1'de bu ertelemeyi zaten kabul ettiğini aktarıyor). Öğrenci önerisi "Yeni Kadro / Usta Kadro / Sakin Seri" adlarının ilk hafta gösterilmemesi de bu kararla karşılanıyor.

### Ç9 — Kötü adam portresi nerede durmalı?

- **Savunan:** tryhackme-ux (Gölge Ağ portreleri ve "DOSYA KAPANDI" korunsun), elite-ui-director (B konseptinde portre ders kartında).
- **İtiraz / uyarı:** learning-scientist: karikatür kötü adam riski, konuyla ilgisiz çekici ayrıntılar öğrenmeyi düşürebilir [Araştırma-orta: seductive details, Harp & Mayer 1998]. motion-visual (Tur 1, storyteller'ın aktarımıyla): portre bölümde bir kez yeter. student-zero-knowledge ve student-bored-skeptic: her derse uzun noir giriş çıksın; "önce iki görsel".
- **Tartışma turunda (underground-storyteller):** Sorun karikatürün kendisi değil, sırası. Altın dişli bir dolandırıcıyı görevden önce göstermek m01-02'nin "hacker sıradan biri olabilir" mesajını çürütüyor ve yanlış tehdit modeli öğretiyor ("kötü adam belli olur"). Karşı öneri: kötü adam **ifşa** olarak; görev boyunca gönderen yalnız "KKU Burs Ofisi"; karar ve kanıttan sonra kapanış kartı:
  > **DOSYA KAPANDI.** Mesajı "Burs Ofisi" yazmamıştı. *Tatlı Dil Tevfik.* Kibar, acil, tanıdık. Hep böyle gelir.
  > [Sıradaki: Onay ikinci kez geldi →]
- **Sonuç:** Ders gövdesinde hero görsel yok; DOSYA kutusu girişten kapanışa taşınıyor; portre bölümde bir kez, yalnız kapanış kartında; "Gölge Ağ hikâyesi →" bağlantısı gövdeden kapanış kartına.
- **Durum:** **Çözüldü** (öneri sahibinin kendisi, kod kanıtıyla değiştirdi; tryhackme-ux ve elite-ui-director'ın "portre korunsun" isteği kapanışta korunuyor).

### Ç10 — Hikâye süs mü, motor mu?

- **Savunan:** elite-ui-director'ın Tur 1 melezi: B yalnız "ders kartı görseli, kanıt paneli, damga".
- **İtiraz:** learning-scientist: B'nin etkileşim yapısı (kanıt topla, karar ver, gerekçelendir, yeni vakaya aktar) ders gövdesinin öğrenme motoru olmalı. underground-storyteller bu tarafı tuttu: hikâyeyi atmosfer katmanına indirmek ya işe yaramaz ya da yine ders öncesi dekor olur.
- **Tartışma turunda:**
  - elite-ui-director düzeltmeyi kabul etti: "B artık bir süs katmanı değil … ders motoru oluyor."
  - underground-storyteller: kanca görevin cümlesinin ta kendisi; ayrı sahne ekranı ve "Atla" düğmesi yok:
    > **23:47.** Deniz'in telefonuna bir mesaj düştü: "Bursun onaylandı, 24 saat içinde doğrula."
    > Deniz ne yapsın? `[Bağlantıya dokun]` `[Göndereni incele]` `[Gruba ilet]`
- **Sonuç:** Melez = A iskelet ("Bugün" ve gezinme) + C dil ve ders gövdesi + B etkileşim motoru (vaka akışı); B'nin atmosferi yalnız kancada ve "DOSYA KAPANDI" damgasında. Kural: hiçbir ekranda iki konseptin dili karışmaz (elite-ui-director).
- **Durum:** **Çözüldü.** Ağırlıklı puanlama ve kazanan ilanı Tur 3'e (`03-design-directions.md`) aittir.

### Ç11 — Quiz reformu ile yeni XP tablosunun sırası

- **Savunan:** gamification-economy (Tur 1): `track.complete` = "tüm quizler geçildi", `lesson.proof` kuralları.
- **İtiraz:** learning-scientist (P0-2): bugünkü quiz kaba kuvvetle geçilebiliyor ve `gradeQuiz` yanlış cevapta da açıklamayı döndürüyor [Kod]. Quiz reformu (varyant havuzu, seçenek karıştırma, ilk yanlışta cevabın ele verilmemesi) yeni XP kurallarından **önce** gelmezse kural "sorunu çözmez, yalnızca adını değiştirir". learning-scientist bunu tartışma turunda "değişmeyen sıralama" olarak yineledi. htb-academy-ux bağımsız olarak, beceri kontrolünde açıklamanın ilk yanlışta değil ikinci denemede gelmesini önerdi.
- **Durum:** **Açık.** gamification-economy ve technical-architect Tur 2'de yanıt vermedi. Teslim planında (`07-implementation-and-tests.md`) sıra bağımlılığı olarak işlenmeli.

### Ç12 — "3 karttan en az 2'si doğru" eşiği ve yem etiketler

- **Savunan:** interactive-mission (Tur 1): başarı koşulu 3 kartın en az 2'si; kanıt adımında "yem" etiketler.
- **İtiraz:** learning-scientist: rastgele tahminle geçme olasılığı yaklaşık %26 (7/27; hesap, veri değil); yemler elenmediği için tümünü seçmek mümkün olabilir. student-curious-beginner: yem etiketler ("Merhaba yazıyor", "Tek büyük harf var") ceza vermese de kafa karıştırabilir.
- **Tartışma turunda (learning-scientist):** yem seçmek kartı geçersiz kılmasın ama sayılsın; çekirdek kanıt şartı; ilk deneme ve ipucu `MissionAttempt` içinde ayrı kaydedilsin.
- **Durum:** **Kısmen.** Ç4'te sınıflandırma adımı ilk görevden çıkarıldığı için eşiğin ilk görevdeki etkisi azaldı; ancak beceri kontrolündeki eşik ve "yem seçimi kartı geçersiz kılar mı" sorusu interactive-mission'ın yanıtını bekliyor.

### Ç13 — İpucu politikası ve rubrikteki "ipucusuz" puanı

- **Savunan:** tryhackme-ux ve interactive-mission (Tur 1): "İpucu almak puanını düşürmez."
- **Çatışan:** learning-scientist'in Tur 1 rubriği (Ö1'de 2 puan "ipucusuz" koşuluna bağlı). student-bored-skeptic: ceza varsa çıkar.
- **Tartışma turunda:**
  - learning-scientist: ipucu XP'yi hiçbir zaman etkilemiyor; yalnız eğitmen rubriğinde görünüyor; rubrik öğrenciye gösterilmiyor (student-bored-skeptic'in "puan tablosu görürsem okul sınavı gibi" eleştirisi kabul edildi); rubrik 6 ölçütten 5'e indi (gerekçe ve karar birleşti).
  - tryhackme-ux: "İpucu XP düşürmez" kalıyor; ipucu kullanımı ölçme verisi olarak kaydedilip eğitmen analitiğinde "ipucuyla geçti" ayrı görünüyor.
- **Durum:** **Çözüldü.**

### Ç14 — 150 kelimelik serbest yazı ve m01-05'in "alta yaz" vaadi

- **Kusur:** m01-05 "alta yaz" diyor ama alan yok (Tur 1'de htb-academy-ux K1, underground-storyteller B3; student-bored-skeptic P0-4, student-curious-beginner P0-3).
- **İtiraz:** student-curious-beginner: boş serbest metin alanı intihal korkusu ve "doğru mu yazdım" kaygısı yaratır; ilk uygulamada seçim kartları kullanılsın.
- **Tartışma turunda (learning-scientist):** 150 kelimelik serbest yazı zorunlu değil; yerine seçmeli kanıt etiketi ve isteğe bağlı tek cümlelik "neden" alanı; üretim etkisini korumak için bu cümle ileri derslerde zorunlu [Hipotez]. htb-academy-ux: "uygulama sayfası uygulatmıyor" P0'ı Görev düzeniyle kapanıyor.
- **Durum:** **Çözüldü.**

### Ç15 — Canlı öğrenci ekranında düğme kalabalığı

- **İtiraz:** student-bored-skeptic: El kaldır, Soru sor, Geri bak, Raf ve iki yeni nabız düğmesi (Takıldım / Yetiştim) telefonda kalabalık; ikincil olanlar "Daha fazla" altında, öncelik Takıldım. Oturum rafı P2. student-zero-knowledge ve student-curious-beginner: "Takıldım"ın anonim olduğu ekranda yazmalı.
- **Durum:** **Açık.** club-live-experience Tur 2'de yanıt vermedi. İtirazlarda öğrenciler arasında çelişki yok; club-live-experience'in onayıyla `04-final-ux-spec.md`'ye işlenmeli.

### Ç16 — Navigasyon adları

- **İtiraz:** student-zero-knowledge ("Görevler" içinde Dosyalar ve Sınıflar da var, ad yanıltıcı), student-curious-beginner ("Ben" içinde hesap ayarı nerede?), student-bored-skeptic ("Öğren" ile "Görevler" farkı net değil).
- **Tartışma turunda (tryhackme-ux):** "Görevler" → **"Kulüp"** (alt satır "Görevler · Dosyalar · Sınıflar"); "Ben" içinde "İlerleme" ve "Hesap"; "Öğren" alt satırı "Dersler, kendi hızında". elite-ui-director 5 sekmeyi "Bugün / Öğren / Canlı / Kulüp / Ben" olarak güncelledi.
- **Durum:** **Çözüldü.**

### Ç17 — Büyük harf başlıklar ve CIU tasarım sistemi

- **Savunan (azaltma):** elite-ui-director (Ö1); student-zero-knowledge (P0), student-curious-beginner, student-bored-skeptic destekledi.
- **Tartışma turunda (elite-ui-director):** BÜYÜK HARF yalnız hero'da ve sayfa başına tek üst etikette; uzun metin, quiz ve ipucu Readex Pro 500, harf aralığı 0; `-0.12em` yalnız `html.fonts-ready` altında. student-bored-skeptic'in "uzun başlıkta otomatik küçük harf sınırı" önerisine ayrıca yanıt yok.
- **Durum:** **Çözüldü** (konsey içinde).
- **Yazıcı notu:** `TASARIM-SISTEMI.md` §3 başlıklar için "Daima `uppercase`, `letter-spacing: -0.12em`", §10 "Yap: Lexend Tera + uppercase + -0.12em başlık" diyor. Konsey kararı bu kuraldan bilinçli bir sapmadır; uygulanmadan önce tasarım sistemine istisna olarak (ders/uygulama yüzeyleri) yazılmalı. Aynı şekilde §5A'daki "zorluk rozeti: Kolay/Orta/Zor/Uzman" Ç18 kararıyla başlangıç yüzeylerinde kaldırılıyor.

### Ç18 — Zorluk rozeti

- **Savunan:** htb-academy-ux (Tur 1): "Ön koşul: yok · Zorluk: Kolay".
- **İtiraz:** student-curious-beginner: "Zorluk: Orta" görürse ürker; "Kimler için: ilk kez başlayanlar" yazılsın.
- **Tartışma turunda:** htb-academy-ux kabul etti: "Kimler için: ilk kez başlayanlar · Ön koşul: yok"; zorluk bilgisi yalnız Sezon 2'de. elite-ui-director C konseptinde aynı metni kullandı.
- **Durum:** **Çözüldü.**

### Ç19 — Mikro kopya tonu

- **İtirazlar:**
  - student-bored-skeptic: "Bilgin yoksa sorun değil, buradan başlanır" fazla sıcak; "Mantıklı bir tahmin" yapay; "Burada kimse 'bunu bilmen gerekirdi' demez" fazla konuşkan; "Bilmemek başlangıç noktası, eksiklik değil" her ekranda olursa patronluk.
  - student-curious-beginner: "Küçük adım, gerçek beceri" çocuksu kaçabilir; yetişkin tonu.
  - student-zero-knowledge: "Süper, harikasın" tonuna kayarsa alay gibi gelir.
- **Tartışma turunda:** tryhackme-ux "Mantıklı bir tahmin" yerine "Yakın. Adrese bir daha bak." dedi ve onboarding metinlerini kısalttı; tryhackme-ux ve elite-ui-director: cesaretlendirme yalnız ilk girişte ve ilk yanlış cevapta. underground-storyteller: Nöbetçi yalnız 3 yerde (kanca, yanlış cevabın sonucu, kapanış); talimat metinleri düz Türkçe.
- **Korunan kopyalar (öğrencilerin beğendiği):** "Yanlış iz. Ama bir şeyi eledin, bu da iş." (student-zero-knowledge; elite B'de "Yanlış iz. Ama bir şeyi eledin." olarak), "Herkes tıklıyor. Sen önce bir bak." (student-bored-skeptic), "Her şey yerli yerinde. Bir satır hariç." (student-bored-skeptic; student-curious-beginner bunun girişte değil ders sonunda anlam kazandığını söyledi), "İpucu almak puanını düşürmez" (student-bored-skeptic).
- **Durum:** **Çözüldü.**

### Ç20 — Eksik görselin önceliği

- **Görüşler:** motion-visual (Tur 1) ve üç öğrenci P0; learning-scientist öğrenme açısından P1 sayıyor ama "güven ve UX açısından P0 kararına itiraz etmiyorum".
- **Tartışma turunda:** underground-storyteller hero görseli ders üstünden kaldırınca "görsel bekliyor" kutusu sorununun büyük ölçüde ortadan kalktığını yazdı; elite-ui-director C'de "görsel hazır değilse hiç gösterilmiyor".
- **Durum:** **Çözüldü** (P0 olarak).

---

## 6. Karar tablosu (özet)

| # | Öğe | Önerdi | İtiraz eden | Çözüm | Durum | Öncelik |
|---|---|---|---|---|---|---|
| Ç1 | Kontrol noktası ve kilit | htb-academy-ux | bored-skeptic, zero-knowledge, learning-scientist | Yalnız karar bölümünde; yanıtlanınca açılır; `firstTry`; 2 yanlıştan sonra çözümlü örnek; görünür kilit nedeni | Kısmen (üst sınır 2/3) | P0 |
| Ç2 | "Emin değilim" | zero-knowledge (storyteller, LS Tur 1) | learning-scientist | Yalnız belirsiz kartta doğru + zorunlu doğrulama eylemi; net kartta yanlış ama cezasız metin | Çözüldü | P0 |
| Ç3 | Güven sorusu | learning-scientist | curious-beginner, bored-skeptic | İlk 3 derste yok; sonra derste bir kez, atlanabilir, XP'siz | Kısmen (yer) | P1 |
| Ç4 | İlk görevin uzunluğu | interactive-mission, storyteller, technical-architect | curious-beginner, bored-skeptic | 3 karar adımı; sınıflandırma sonraya; ipucu düğme; `ilk_gorev:` alanı | Kısmen (classify yeri) | P0 |
| Ç5 | Ders düzeni | htb-academy-ux | bored-skeptic, elite-ui-director | Tek `LessonFrame` + iki gövde türü; masa = yuva | Çözüldü | P1 |
| Ç6 | Koyu yüzey | tryhackme-ux, zero-knowledge, htb | elite-ui-director | Krem varsayılan; koyu yalnız kanıt nesnesi; ilk görevde koyu yok; "ilk 3 ders" kapısı tartışmalı | Kısmen | P1 |
| Ç7 | Seviye sorusu | elite-ui-director | üç öğrenci, learning-scientist | Görevden önce yok; sonra isteğe bağlı soru ya da gözlem | Kısmen | P0 (görev öncesi formun kaldırılması) |
| Ç8 | Lig şeridi / takma ad modalı | elite-ui-director, gamification-economy | üç öğrenci | `completed === 0` iken lig/sıra/seri/modal yok; takma ad otomatik; kart liderlik sayfasında satır içi | Çözüldü | P0 |
| Ç9 | Kötü adam portresi | tryhackme-ux, elite-ui-director | learning-scientist, motion-visual, öğrenciler | Kapanışta ifşa; hero/DOSYA ders başından kalkar | Çözüldü | P0 (ders başı), P1 (ifşa kartı) |
| Ç10 | B'nin rolü | elite-ui-director | learning-scientist, storyteller | B = etkileşim motoru; kanca = görev cümlesi | Çözüldü | P0 (kanca), P1 (melez) |
| Ç11 | Quiz reformu sırası | gamification-economy | learning-scientist | Reform XP kurallarından önce | Açık | P0 |
| Ç12 | 2/3 eşiği, yemler | interactive-mission | learning-scientist, curious-beginner | Çekirdek kanıt şartı, yemler sayılır | Kısmen | P0 (LS) |
| Ç13 | İpucu ve rubrik | tryhackme-ux, interactive-mission / LS rubriği | bored-skeptic | İpucu XP'yi etkilemez; yalnız eğitmen analitiği; rubrik 5 ölçüt, gizli | Çözüldü | P1 |
| Ç14 | "Alta yaz" vaadi, serbest yazı | — (kusur) | curious-beginner | Seçmeli kanıt etiketi + isteğe bağlı tek cümle | Çözüldü | P0 |
| Ç15 | Canlı düğme kalabalığı | club-live-experience | bored-skeptic | "Daha fazla" menüsü önerisi; anonimlik metni | Açık | P1 |
| Ç16 | Navigasyon adları | tryhackme-ux | üç öğrenci | Bugün / Öğren / Canlı / Kulüp / Ben (+ alt satırlar) | Çözüldü | P1 |
| Ç17 | Uppercase başlıklar | elite-ui-director | — (tasarım sistemiyle çatışma) | Yalnız hero + sayfa başına 1 etiket | Çözüldü (konseyde); tasarım sistemine işlenmeli | P0 |
| Ç18 | Zorluk rozeti | htb-academy-ux | curious-beginner | "Kimler için" + "Ön koşul"; zorluk yalnız Sezon 2 | Çözüldü | P1 |
| Ç19 | Mikro kopya tonu | tryhackme-ux, elite, storyteller | üç öğrenci | Cesaretlendirme yalnız ilk giriş ve ilk yanlışta; Nöbetçi 3 yerde | Çözüldü | P1 |
| Ç20 | Eksik görsel | motion-visual | learning-scientist (öncelik nüansı) | Hazır değilse gösterilmez | Çözüldü | P0 |

---

## 7. P0 itirazlarının durumu

**Kalite kapısı (MASTER_PROMPT):** "Öğrenci ajanları P0 sürtünme bildirirse UI direktörü düzeltmeden o ekranı tamamlanmış sayma" ve "P0 öğrenci itirazlarını çözmeden kazanan ilan etme". Aşağıdaki "Tasarımda karşılandı" sütunu yalnızca bir tasarım kararının var olduğunu gösterir; **hiçbiri kodda uygulanmadı ve hiçbiri gerçek öğrenciyle sınanmadı.**

| # | P0 itirazı | Kaynak | Tasarım kararı | Karşılayan ajan(lar) | Durum |
|---|---|---|---|---|---|
| P0-01 | "Başla" broşüre (PROGRAM sayfasına) gidiyor | zero-knowledge (1), curious-beginner (P0-1), bored-skeptic (P0-1), learning-scientist | `continueTarget` PROGRAM türünü **hem STARTED hem sıradaki ders** dalında atlasın; `akademi.yaml` `ilk_gorev:` alanı | tryhackme-ux, htb-academy-ux (STARTED dalı), elite-ui-director | Tasarımda karşılandı |
| P0-02 | İlk ekranda boş durum kartları, birincil eylem aşağıda | curious-beginner (P0-2), bored-skeptic (P0-2) | `completed === 0` iken tek kart "İLK GÖREV · 5 DK / Bir mesaj geldi. Gerçek mi? / [Mesajı aç →]"; görev ve duyurular katlı "Kulüp" şeridinde | elite-ui-director, tryhackme-ux | Tasarımda karşılandı |
| P0-03 | "Tamamla" ile bedava XP | bored-skeptic (P0-3), curious-beginner (P0-3), learning-scientist | Karar verilmeden tamamlama/XP yok; ustalık XP'si ilk denemede ya da yeni varyantta | tryhackme-ux, htb-academy-ux, elite-ui-director, learning-scientist | Tasarımda karşılandı |
| P0-04 | Kilidin nedeni görünmüyor | zero-knowledge (3) | `Dersi bitir` / `1 karar kaldı`; tıklayınca bölüme kaydırma ve odak | htb-academy-ux, elite-ui-director, tryhackme-ux | Tasarımda karşılandı |
| P0-05 | Uygulama sayfası olmayan yazı alanını vaat ediyor | bored-skeptic (P0-4) | Görev düzeni (`MissionRunner`), seçim kartları, isteğe bağlı tek cümle | htb-academy-ux, learning-scientist | Tasarımda karşılandı |
| P0-06 | Jargon açıklamasız | zero-knowledge (4), curious-beginner (P0-4; Tur 1 raporları bunu P1 saymıştı) | İlk geçişte parantez içi açıklama + "Nedir?" düğmesi (`aria-expanded`, dokunmatikte çalışır); terim listesi §3.3 | elite-ui-director | Tasarımda karşılandı; öncelik seviyesi (P0/P1) Tur 3'te teyit edilmeli |
| P0-07 | Büyük harf başlıklar | zero-knowledge (2) | Yalnız hero + sayfa başına 1 etiket | elite-ui-director | Tasarımda karşılandı; `TASARIM-SISTEMI.md` §3 ile çatışma kaydı gerekli (Ç17) |
| P0-08 | Eksik görsel kutusu "yarım site" | zero-knowledge (5), curious-beginner (P0-5), bored-skeptic | Hazır değilse hiç gösterilmez; ders başında hero yok | elite-ui-director, underground-storyteller | Tasarımda karşılandı |
| P0-09 | Canlıda "Canlı" yazıp eski slaytta donma | zero-knowledge (6), bored-skeptic (P0-5) | Tur 1'deki epoch, "ilk durumu her zaman kabul etme", kopma şeridi (perde yerine ince şerit) | club-live-experience (Tur 1) | Tur 1 önerisiyle karşılanıyor; Tur 2'de itiraz yok, tartışılmadı |
| P0-10 | "Gönderen" paneli keşfedilemez, hover'a bağlı | zero-knowledge (7), curious-beginner | Görünür "Gönderene dokun ▸" çipi; hover yok | tryhackme-ux, htb-academy-ux, elite-ui-director | Tasarımda karşılandı |
| P0-11 | Liderlikte ilk gün görünür adla yarış | bored-skeptic (P0-6) | Takma ad sunucuda otomatik; ilk görevden önce lig/sıra yok | tryhackme-ux, elite-ui-director (gamification-economy Tur 1) | Tasarımda karşılandı |
| P0-12 | Kontrol noktası kaba kuvvetle geçilir | learning-scientist (P0-1) | `firstTry` kaydı; 2 yanlıştan sonra çözümlü örnek; birim testi: tüm seçenekler sırayla tıklandığında `firstTry=false`, ustalık XP'si 0 | tryhackme-ux, htb-academy-ux, elite-ui-director | Tasarımda karşılandı |
| P0-13 | Quiz reformu XP kurallarından önce gelmeli | learning-scientist (P0-2) | Sıra bağımlılığı | — | **Açık** (gamification-economy, technical-architect yanıtı yok) |
| P0-14 | "Emin değilim" güvenli varsayılan | learning-scientist (P0-3) | Ç2 kuralı | underground-storyteller, htb-academy-ux, elite-ui-director | Tasarımda karşılandı |
| P0-15 | Kabul testleri öğrenmeyi ölçmüyor | learning-scientist (P0-4) | Her P0 akışına 48 saat sonra görülmemiş varyantla aktarma testi; storyteller'ın 24 saat sonra "Tevfik nasıl yaklaştı?" serbest hatırlama sorusu | learning-scientist, underground-storyteller | **Kısmen**: plana eklendi, `06-usability-study.md`'de protokole dönüşmeli; sonuç yok |
| P0-16 | Ders başında iki görsel ve anlatı | underground-storyteller ([Kod]), bored-skeptic | Hero ve DOSYA kapanışa; otomatik denetim `scripts/academy.mjs check` | underground-storyteller | Tasarımda karşılandı (denetim kuralı henüz yazılmadı) |
| P0-17 | `MissionRunner` + Sahte Burs kanıt şartı | learning-scientist (karar tablosu) | Çekirdek kanıt şartı, yemler sayılır | learning-scientist | **Kısmen** (interactive-mission yanıtı yok; Ç12) |

**Özet:** 17 P0 kaydının 13'ü tasarım kararıyla karşılandı, 1'i Tur 1 önerisiyle karşılanıyor ama Tur 2'de tartışılmadı (P0-09), 2'si kısmen (P0-15, P0-17), 1'i açık (P0-13). Ayrıca Ç1, Ç4 ve Ç7'deki ayrıntı farkları P0 kararlarının uygulama biçimini etkiliyor. Bu nedenle Tur 3'te kazanan ilan edilmeden önce en az P0-13 ve Ç4'ün (sınıflandırmanın yeri) kapatılması gerekiyor.

---

## 8. Ajanların kendi Tur 1 önerilerinde yaptığı değişiklikler

| Ajan | Geri çektiği / değiştirdiği | Neden (kimin itirazı) |
|---|---|---|
| tryhackme-ux | "Mantıklı bir tahmin" → "Yakın. Adrese bir daha bak."; onboarding metinleri kısaldı; "Görevler" → "Kulüp"; "Ben" iki alt sekme; patikada 3 açık düğüm; ipucu kaydı analitikte | bored-skeptic, zero-knowledge, curious-beginner, learning-scientist |
| htb-academy-ux | 4 düzen → 2; zorluk rozeti → "Kimler için"; beceri haritası maddeleri kontrol noktasına eşlenir, eşlenmeyen silinir; halka kontrol noktası sayar; koyu lab varsayılan değil; mail maketi krem; terminal M04'e kadar yok, önce simüle terminal | bored-skeptic, curious-beginner, learning-scientist, interactive-mission, tryhackme-ux |
| elite-ui-director | Lig şeridi ve "Hiç/Biraz/Rahatım" kurulumu kaldırıldı; haftalık hedef ilk hafta gizli; sağ kolon ilk tamamlamaya kadar yok; halka karar anlarını sayar; uppercase sınırlandı; "tek gece yüzeyi" daraltıldı; B süs → motor | üç öğrenci, learning-scientist, gamification-economy |
| learning-scientist | Güven sorusu her noktadan çıktı; "ipucusuz" puanı XP'den ayrıldı, rubrik gizli ve 5 ölçüt; 150 kelime zorunlu değil; "Hatırla" kartına günlük tavanlı küçük XP kabul edildi ve P2 → P1; 12 bölümün yalnız sıradaki 3'ü açık | curious-beginner, bored-skeptic, interactive-mission, gamification-economy |
| underground-storyteller | Nöbetçi 3 yerle sınırlı; "Merak" satırı düğme etiketi; kanca ≤20 sn; DOSYA kutusu kapanışa (Tur 1'deki "her dersin başında DOSYA" geri çekildi); Sahte Burs 8 → 5 ekran; ders 12'de bayrak açıklaması (`CIU{...}`); 12 derse yakın çeldirici ve aktarma varyantı; unvanlar "iyi taraf"ta | bored-skeptic, curious-beginner, htb-academy-ux, zero-knowledge, tryhackme-ux, learning-scientist, gamification-economy |

---

## 9. Tartışmadan çıkan kabul testleri (henüz çalıştırılmadı)

| Test | Tür | Kaynak |
|---|---|---|
| Tüm seçenekleri sırayla tıklayan hesapta `firstTry=false`, ustalık XP'si 0; yanlıştan sonra ders yine bitirilebilir | Birim/entegrasyon | learning-scientist, tryhackme-ux |
| Yeni hesap `p-01`'i açıp çıkar; `/dashboard` birincil düğmesi yine `m01-…` görev sayfasına gider | Entegrasyon/E2E | htb-academy-ux |
| `completed === 0` hesapta ilk ekranda lig, sıra, seri ve modal yok; yalnız bir yeşil düğme | E2E | tryhackme-ux |
| 375px genişlikte kaydırmadan tek `.btn-primary` görünür ve görev sayfasına gider; ilk görevde `--surface-night` öğe yok; koyu kanıt kartında Tab odağı en az 3:1 kontrast | E2E + erişilebilirlik | elite-ui-director |
| Girişten ilk karara en fazla 2 tıklama; 360px'te kaydırma yok | E2E | tryhackme-ux |
| M01 gövdesinde ilk etkileşimli öğeden önce `img` ya da DOSYA bloğu yok; portre yalnız kapanış kartında (`scripts/academy.mjs check`) | İçerik denetimi | underground-storyteller |
| 5 saniye testi: 5 kişiden en az 4'ü "Başla"yı gösterir | **Gerçek test (yapılmadı)** | tryhackme-ux |
| İlk doğru/yanlış geri bildirimi 90 sn altında | **Gerçek test (yapılmadı)** | tryhackme-ux, elite-ui-director |
| 48 saat sonra görülmemiş varyantla kanıtlı karar (aktarma) | **Gerçek test (yapılmadı)** | learning-scientist |
| 24 saat sonra "Tevfik nasıl yaklaştı?" serbest hatırlama | **Gerçek test (yapılmadı)** | underground-storyteller |
| "Bu sitede ilk görevini bul" (süre, tıklama), çıkışta "Neden bıraktın?" | **Gerçek test (yapılmadı)** | student-curious-beginner, student-bored-skeptic, student-zero-knowledge |

learning-scientist'in uyarısı: elite-ui-director'ın 5 sn ve "ilk doğruya 90 sn" testleri yalnız gezinmeyi ölçüyor; ilk doğru cevap şansla da gelebilir. Bu yüzden gerçek test planında aktarma testi zorunlu tutulmalı.

---

## 10. Açık kalanlar ve sahipleri

| Konu | Bekleyen karar | Yanıt vermesi gereken |
|---|---|---|
| Quiz reformu ↔ `track.complete` / `lesson.proof` sırası (P0-13, Ç11) | Teslim sırası | gamification-economy, technical-architect |
| Sınıflandırma adımının yeri ve ilk görevin ekran sayısı (Ç4) | `m01-05` mi, M01 son sayfası mı, birleşik tek adım mı | interactive-mission, technical-architect (ana ajan Tur 3'te) |
| Beceri kontrolünde başarı eşiği ve yem etiketler (Ç12, P0-17) | Eşik ve "yem seçimi geçersiz kılar mı" | interactive-mission |
| Kontrol noktası üst sınırı 2 mi 3 mü (Ç1) | UI kuralı | elite-ui-director + learning-scientist (Tur 3) |
| Koyu yüzeyin "ilk 3 ders" kapısı (Ç6) | Kapı kalır mı | elite-ui-director, tryhackme-ux, accessibility-simplicity |
| Seviye: isteğe bağlı soru mu, yalnız gözlem mi (Ç7) | Görev sonrası akış | learning-scientist, elite-ui-director |
| Canlı öğrenci ekranında düğme önceliği ve anonimlik metni (Ç15) | "Daha fazla" menüsü | club-live-experience |
| `TASARIM-SISTEMI.md` §3 (uppercase) ve §5A (koyu varsayılan lab, zorluk rozeti) ile çatışmalar | Tasarım sistemine istisna/güncelleme | elite-ui-director (ana ajan uygular) |
| Jargon P0 mı P1 mi (P0-06) | Öncelik | Tur 3 matrisi |

---

## 11. Sınırlamalar

- Bu belge ayrı raporların sentezidir; katılımcılar aynı anda konuşmadı ve birbirlerinin Tur 2 yanıtlarını görmedi. Tartışma raporlarını yazan beş ajan, öğrenci ve learning-scientist eleştirilerini gördü; öğrenciler ise tartışma turundaki karşı önerileri görmedi.
- Sekiz ajanın (gamification-economy, interactive-mission, club-live-experience, motion-visual, accessibility-simplicity, student-ux-research, product-admin, technical-architect) Tur 2'de kendi sesi yok; görüşleri başka raporlardaki alıntılarla temsil edildi.
- Üç tasarım ajanı kendi Tur 1 metinlerini değil, onların alıntılanmış hâlini savundu (§1.3).
- Satır numaraları raporlar arasında farklı (§2); çalışma ağacı değiştirilmiş olduğu için kesin satır, uygulama sırasında yeniden doğrulanmalı.
- Öğrenci tepkileri simülasyondur. Hiçbir oran, süre ya da başarı iddiası gerçek veriye dayanmıyor; learning-scientist'in %26 değeri bir olasılık hesabıdır, ölçüm değildir.
