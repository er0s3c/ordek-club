# 06 — Gerçek öğrenci kullanılabilirlik testi protokolü

> **Not:** Ajanlar bu oturumda Claude Code alt ajanı olarak, her biri kendi `.claude/agents/<ad>.md` tanımını sistem rolü olarak okuyarak AYRI ayrı çalıştırıldı (yeni eklenen ajan tipleri oturum yeniden başlamadan yerel tip olarak yüklenemediği için). Agent Teams kullanılmadı; tartışma, ana ajanın ayrı raporları birbirine iletmesiyle yürütüldü — "simüle edilmiş toplantı" değil, ayrı raporlardan sentez. Tur 1'de çalışan ajanlar: tryhackme-ux, htb-academy-ux, elite-ui-director, student-zero-knowledge, student-curious-beginner, student-bored-skeptic, underground-storyteller, learning-scientist, gamification-economy, interactive-mission, club-live-experience, motion-visual, accessibility-simplicity, student-ux-research, product-admin, technical-architect.

> **DURUM: BU ARAŞTIRMA HENÜZ YAPILMADI. SONUÇ YOK.**
> Bu belge yalnızca bir plandır. İçindeki tüm eşikler **hedef**tir, ölçülmüş değer değildir. Öğrenci ajanlarının (student-zero-knowledge, student-curious-beginner, student-bored-skeptic) "ilk 60 saniye" anlatımları **simülasyondur**; gerçek kullanıcı verisi yerine geçmez. Bu belgeye, çalışma gerçekten yapılıp kayıtları analiz edilmeden hiçbir "öğrencilerin %X'i…" cümlesi yazılmayacaktır (MASTER_PROMPT, kalite kapıları).

Belge Tur 4 "Kanıt planı"nın çıktısıdır. Ana kaynak `student-ux-research` raporundaki protokol taslağıdır; diğer öğrenci ajanlarının kabul testleri ve Tur 3 yargıçlarının (learning-scientist, accessibility-simplicity, student-ux-research) "çözülmemiş P0" listeleri buraya eklenmiş ve çelişen eşikler §9'da açıkça uzlaştırılmıştır. Ajan görüşleri her yerde ajan adıyla etiketlenir. Etiketi olmayan bağlayıcı metinler belge yazıcısının sentezidir ve **[Sentez]** olarak işaretlenir.

---

## 1. Amaç ve araştırma soruları

MASTER_PROMPT'un kalite kapıları test edilebilir sorulara çevrildi:

| # | Kalite kapısı (MASTER_PROMPT) | Araştırma sorusu | Görev |
|---|---|---|---|
| RQ1 | 0 bilgili öğrenci nereye tıklayacağını anlar | İlk ekranda amaç ve tek birincil eylem 5 sn'de anlaşılıyor mu? | G1 |
| RQ2 | İlk dakikalarda gerçek küçük başarı | Taze hesapla ilk mini görev yardımsız ve hızlı başlatılıp ilk geri bildirim alınıyor mu? | G2 |
| RQ3 | Hikâye öğrenmeyi destekler, yerini almaz | İlk ders/mini görev bitiriliyor mu, öğrenci ne yaptığını ve nedenini kendi sözleriyle açıklayabiliyor mu? | G3 |
| RQ4 | Canlı sınıf stabil, bireysel öğrenme bağımsız | Kopan/geç katılan öğrenci doğru slayta dönüyor mu; ders bitince "sıradaki ne" biliniyor mu? | G4 |
| RQ5 | Öğrenilen bilgi gerçek beceriye dönüşür | 48–72 saat sonra görülmemiş bir sahte mesaj gerekçesiyle doğru sınıflandırılıyor mu? | G5 |
| RQ6 | Konsept seçimi (Tur 3 melezi) | Kabuk A (Mission Control) ile kabuk C (Friendly Academy) 5 sn testinde nasıl ayrışıyor? | G1-K |

RQ6 kaynağı: learning-scientist ve student-ux-research yargıç kararları ("Tur 4'te A ve C kabukları 5 saniye testiyle karşılaştırılsın"). accessibility-simplicity aynı melezi destekledi.

**Bu çalışma neyi ölçmez:** istatistiksel anlamlılık, uzun dönem tutundurma, liderlik tablosunun motivasyon etkisi (yalnızca ilk izlenim düzeyinde not alınır), eğitmen/yönetici paneli kullanılabilirliği (ayrı çalışma gerekir).

---

## 2. Test öncesi ön koşullar (çalışma bunlar olmadan başlamaz)

Yargıçların ortak görüşü: en kritik P0'lar konseptten bağımsızdır ve test edilecek arayüzde çözülmüş olmalıdır, yoksa test zaten bilinen bir sorunu yeniden ölçer.

| Ön koşul | Neden | Kaynak ajan |
|---|---|---|
| `continueTarget` PROGRAM türünü atlar (STARTED dalı dahil); "Başla" broşür sayfasına ("Ördek Akademi nedir?") gitmez | Aksi halde G2 bilinen bir hatayı ölçer | student-zero-knowledge (B1), student-bored-skeptic, accessibility-simplicity, student-ux-research (yargıç) |
| `completed === 0` iken ilk ekranda tek yeşil birincil eylem; lig, sıra, seri, haftalık hedef, kurulum formu, takma ad modalı yok | G1/G2'nin test ettiği tasarım budur | student-ux-research (Ö1), student-zero-knowledge (Ö1), student-curious-beginner (Ö1), student-bored-skeptic (öneri 1), accessibility-simplicity |
| "Şüpheli Mesaj: Sahte Kampüs Bursu" mini görevi tarayıcıda çalışır, anında geri bildirim verir, 2 ipucu içerir | G2–G3–G5'in materyali | MASTER_PROMPT, student-curious-beginner (Ö2), interactive-mission |
| "Dersi bitir" kilitliyken nedeni yazar ("1 karar kaldı") | Sessiz kilit G3'te yapay takılma üretir | accessibility-simplicity, student-ux-research (yargıç) |
| Eksik görsel için kesik çizgili "Görsel hazırlanıyor" kutusu gösterilmez | Güven kaybını ölçmek istemiyoruz, kaldırmak istiyoruz | student-bored-skeptic, accessibility-simplicity |
| Canlı modda kopma şeridi (sahneyi kapatmayan) ve geri dönüş kartı; ders bitişinde bireysel moda köprü | G4'ün test ettiği tasarım | student-ux-research (Ö3), club-live-experience |
| Jargon ilk geçişte parantez içinde açıklanır, "Nedir?" düğmesi dokunmatikte çalışır (hover'a bağlı değil) | Telefonla katılanlar için G3 geçerliliği | accessibility-simplicity, student-ux-research (yargıç) |
| Kontrol noktasında kaba kuvvet önlemi: `firstTry` kaydı, ilk yanlışta cevap ele verilmez, 2 yanlıştan sonra çözümlü örnek | G3'te "bitirdi" ölçüsünün anlamlı olması | learning-scientist (P0) |

Bu maddelerden biri uygulanmamışsa test **iptal edilmez** ama ilgili görevin sonucu "ön koşul eksik" etiketiyle raporlanır ve geçme/kalma kararına girmez **[Sentez]**.

Hâlâ açık ve testle beslenecek tasarım soruları §11'de listelenir.

---

## 3. Katılımcılar

### 3.1 Sayı ve kotalar

Kaynak: student-ux-research (protokol taslağı); kotalar diğer öğrenci ajanlarının persona tanımlarıyla uyumlu.

| Kriter | Hedef | Kaynak |
|---|---|---|
| Toplam | 6–8 gönüllü (MASTER_PROMPT: 5–8). Planlama n = 6 üzerinden yapılır; 7–8 olursa eşikler §9.2'deki orana göre uygulanır | student-ux-research |
| Bölüm çeşitliliği | Farklı bölümler, ör. işletme, hukuk, mimarlık, eğitim, sağlık; en fazla 1–2 bilgisayar/yazılım | student-ux-research |
| Bilgi düzeyi | En az 5'i kendini siber güvenlikte 1–2/5 puanlıyor | student-ux-research |
| Sıfır bilgi alt grubu | En az 3 kişi (1/5) — ayrı raporlanır | [Sentez], student-ux-research ("sıfır bilgili alt grup ayrı raporlanır") |
| Cihaz | En az 3'ü kendi telefonuyla | student-ux-research; student-curious-beginner ("kendi telefonlarından QR'la") |
| Kulüp dışı | En az 2 kişi kulüp üyesi değil | student-ux-research |
| Hariç tutma | Kulüp yönetimi, eğitmenler, bu projede çalışmış kişiler, moderatörle aynı derste not ilişkisi olanlar | [Sentez] |

### 3.2 İşe alım

- Kanal: kulüp duyurusu ve bölüm grupları (student-ux-research).
- Katılım ödülü varsa sonuçtan ve performanstan bağımsızdır, görevi bitirmeye bağlı değildir (student-ux-research).
- Duyuru metni "test edilen sizsiniz değil, platform" ilkesini açıkça söyler **[Sentez]**:

> "CIU Cyber Security Club'ın yeni öğrenme platformunu deniyoruz. Siber güvenlik bilmen gerekmiyor; aslında bilmiyorsan daha da iyi. 45–60 dakika, sınav değil. Platformu test ediyoruz, seni değil."

### 3.3 Ön tarama formu (kısa, anonim kodla)

| Soru | Yanıt türü | Amaç |
|---|---|---|
| Bölümün ve sınıfın | Açık uçlu | Kota |
| Siber güvenlik bilgini 1–5 arası puanla | 1–5 | Kota, alt grup |
| Hiç terminal / komut satırı kullandın mı? | Evet / Hayır / Bilmiyorum | Alt grup notu (student-curious-beginner personası) |
| Testte hangi cihazı kullanacaksın? | Telefon / Dizüstü | Kota |
| Kulüp üyesi misin? | Evet / Hayır | Kota |
| Ekran yardımcı teknoloji kullanıyor musun (ekran okuyucu, büyütme, renk ayarı)? | İsteğe bağlı | Erişilebilirlik notu (accessibility-simplicity kapsamı) |

Tarama formunda ad, öğrenci numarası veya e-posta **istenmez**; iletişim bilgisi ayrı bir randevu kanalında tutulur **[Sentez]**.

---

## 4. İzin ve mahremiyet

Kaynak: student-ux-research (izin/mahremiyet bölümü). student-zero-knowledge'ın "rezil olur muyum?" korkusu (B4) bu bölümde ayrıca dikkate alındı.

### 4.1 Onay formu (yazılı, test başlamadan)

Formda bulunması gereken maddeler:

1. Çalışmanın amacı: platformun kullanılabilirliğini değerlendirmek.
2. Süre: oturum 45–60 dk; G5 için 48–72 saat sonra 10 dk'lık ikinci kısa oturum.
3. Gönüllülük ve **istediği an gerekçe göstermeden çıkma hakkı**; çıkarsa o ana kadarki verinin silinmesini isteyebilme.
4. Katılımcının **değerlendirilmediği**, not veya kulüp üyeliğine hiçbir etkisi olmadığı.
5. Toplanan veri türleri, saklama süresi ve kimin erişeceği (§4.3 tablosu forma eklenir).
6. Ekran ve ses kaydı için **ayrı, isteğe bağlı** onay kutusu. Kayda onay vermeyen de katılabilir (yalnızca not alınır).
7. Yüz kaydı yapılmayacağı.
8. İletişim kişisi ve veri silme talebi yolu.

### 4.2 Kimlik ve hesap kuralları

- Katılımcı kodu **P01…P08**. Ad notlara yazılmaz; kod–ad eşleşme tablosu ayrı ve şifreli tutulur (student-ux-research).
- **Test hesapları ve sentetik veriyle çalışılır; gerçek parola veya gerçek e-posta girdirilmez** (student-ux-research). Moderatör her katılımcı için önceden hazırlanmış test hesabı verir. Kayıt akışı test edilecekse sentetik e-posta (ör. `p03@test.invalid`) kullanılır **[Sentez]**.
- Test hesabının kullanıcı adı liderlik tablosunda görünmez ya da test sunucusu yalnızca test hesaplarını içerir; katılımcı kendini gerçek kulüp listesinde görmez (student-zero-knowledge B4'ten türetildi **[Sentez]**).
- "Sahte Kampüs Bursu" materyali gerçek kişisel veriye ya da gerçek zararlı URL'ye yönlendirmez; tüm adresler `.example` / `.invalid` gibi ayrılmış alan adlarıdır (MASTER_PROMPT, güvenlik ilkesi).

### 4.3 Veri envanteri

| Veri | Neden | Biçim | Saklama | Erişim |
|---|---|---|---|---|
| Tarama yanıtları | Kota ve alt grup | Kodlu tablo | Analiz bitince silinir | Araştırma ekibi |
| Gözlem notları | Görev ölçüleri | Kodlu form (§10.1) | Anonim hâli rapora girer; ham notlar en çok 30 gün | Araştırma ekibi |
| Ekran + ses kaydı (isteğe bağlı) | Zaman ölçümü doğrulama, alıntı | Yerel şifreli disk | Analiz sonrası silme, **en çok 30 gün** (student-ux-research önerisi) | Moderatör + not alıcı |
| Anketler (SEQ, SUS, eğlence) | Öznel ölçü | Kodlu tablo | Anonim hâli rapora girer | Araştırma ekibi |
| Test sunucusu olay günlüğü (isteğe bağlı) | Tıklama/süre doğrulama | Sunucu logu, yalnızca test hesapları | Analiz sonrası silinir | Teknik sorumlu |
| Kod–ad eşleşmesi | Silme talebi, G5 randevusu | Ayrı şifreli dosya | G5 bitince silinir | Yalnızca çalışma sorumlusu |

Kayıtlar üçüncü taraf bulut transkripsiyon ya da analitik servislerine yüklenmez **[Sentez]**; bu, uygulamanın "harici kaynak çağrısı yok" ilkesiyle de tutarlıdır (00-current-state, teknik kısıtlar).

### 4.4 Etik ve mevzuat

- Üniversite etik birimi ve geçerli kişisel veri mevzuatı gereklilikleri **çalışmadan önce** üniversite danışmanıyla netleştirilir (student-ux-research "KVKK ve üniversite etik birimi" dedi). Kulüp KKTC'deki Uluslararası Kıbrıs Üniversitesi'ne bağlı olduğundan hangi düzenlemenin uygulanacağı danışmanla teyit edilmelidir **[Sentez — doğrulanmadı]**.
- 18 yaş altı katılımcı alınmaz **[Sentez]**.

### 4.5 Moderatör kuralları

- Moderatör katılımcının eğitmeni veya değerlendiricisi olmaz (student-ux-research).
- Yönlendirme yapmaz, sessiz bekler, "sesli düşün" ister (student-ux-research).
- Yardım isteğine standart yanıt: "Sen olsan ne yapardın?" İkinci istekte: "Burada ne arıyorsun?" Üçüncü istekte ya da 2 dk takılmada yardım verilir ve **"yardım alındı"** olarak işaretlenir **[Sentez]**.
- Yanlış seçimde yorum yapılmaz, yüz ifadesi nötr tutulur. "Doğru/yanlış yok, platformu deniyoruz" cümlesi oturum başında bir kez söylenir.

---

## 5. Ortam ve materyal

### 5.1 Teknik ortam

| Öğe | Ayrıntı | Kaynak |
|---|---|---|
| Sunucu | Ayrı test kurulumu (Docker Compose), yalnızca test hesapları ve sentetik içerik; gerçek üye verisi yok | [Sentez]; 00-current-state (Docker Compose) |
| Hesap durumu | G1–G2 için **taze hesap** (0 ders, 0 XP); onay politikası testi istenirse ayrı bir "onay bekliyor" hesabı | student-ux-research (G2), student-bored-skeptic |
| Cihaz | Katılımcının kendi telefonu (en az 3 kişi) veya hazırlanmış dizüstü | student-ux-research, student-curious-beginner |
| Ağ | Normal kampüs Wi-Fi; G4'te Wi-Fi/uçak modu 30 sn kapatılır | student-ux-research |
| Canlı oturum | Bir eğitmen (moderatör değil) test sunumunu kendi cihazından ilerletir; slayt numaraları önceden yazılı | student-ux-research (G4), club-live-experience |
| Kayıt | Masaüstünde yerel ekran kaydı; telefonda cihazın kendi ekran kaydı veya omuz üstü not (yüz yok) | student-ux-research |

### 5.2 Test edilen arayüz ve marka

Test edilen ekranlar CIU tasarım sistemine (`docs/TASARIM-SISTEMI.md`) uygun olmalıdır; çalışma marka sistemini değiştirmeyi değil, marka içinde hangi kararların okunabilirliği etkilediğini ölçmeyi hedefler. student-ux-research ve student-curious-beginner kararı: **marka sistemi korunur** (mor + neon yeşil + krem, Lexend Tera + Readex Pro, hap butonlar, galaxy degradesi).

Çalışmada özellikle gözlenecek marka kararları:

| Tasarım kararı (TASARIM-SISTEMI.md) | Gözlenecek soru | Görev | Kaynak ajan |
|---|---|---|---|
| Neon yeşil `--ciu-green` yalnızca eylem; bölümde tek yeşil düğme; üzerindeki metin `--ciu-ink` | Tek yeşil düğme 5 sn'de fark ediliyor mu? Yeşilin yanında yarışan ikinci "eylem gibi görünen" öğe var mı? | G1, G2 | student-curious-beginner (kritik not), student-ux-research |
| Galaxy degradesi karşılama bandı (`--ciu-gradient-galaxy`) | Galaxy hero birincil eylemi geciktiriyor ya da gölgeliyor mu? Hareketsiz hâlde de CTA 5 sn'de görünüyor mu? | G1 | student-ux-research (elite-ui-director / motion-visual'a itiraz) |
| Başlıklar Lexend Tera 700, `uppercase`, `letter-spacing: -0.12em` | Uzun ders başlıkları ve Türkçe İ/I, noktalı harfler okunuyor mu? | G1, G3 | student-ux-research (Ö5, P2), student-zero-knowledge (elite-ui-director'a itiraz), accessibility-simplicity ("ders içeriğinde büyük harf Lexend Tera başlık kuralı kaldırılmalı") |
| Ders gövdesi krem zemin `--ciu-cream`, tek kolon | Okuma rahat mı, nerede kaydırmayı bırakıyor? | G3 | accessibility-simplicity, learning-scientist (melez: ders gövdesi C) |
| Koyu yüzey yalnızca log/terminal kanıtında; koyu zeminde odak halkası `#17FF74` | İlk görevde koyu öğe var mı (olmamalı)? Klavyeyle odak görünüyor mu? | G3, G4 | student-ux-research (yargıç melezi), accessibility-simplicity |
| Canlı sahne koyu | Kopma şeridi koyu sahnede okunuyor mu? | G4 | club-live-experience, student-ux-research |

Not: student-ux-research ve student-zero-knowledge başlık okunabilirliğini **ölçülmemiş varsayım** olarak işaretledi. Bu çalışma o varsayımı sınar; sonuç gelene kadar karar "ölç, sonra karar" (P2) olarak kalır.

### 5.3 Materyal listesi

- Onay formu (iki kopya), tarama formu.
- Moderatör betiği (§7) ve gözlem formu (§10.1), her katılımcı için bir kopya.
- 5 sn testi için ekran görüntüleri: ilk giriş ana sayfası, kabuk A ve kabuk C varyantları (G1-K).
- Test sunumu (canlı oturum, en az 12 slayt; 7. ve 11. slayt işaretli).
- G5 için **görülmemiş** iki sahte mesaj varyantı (biri net sahte, biri belirsiz). Mini görevdeki mesajla aynı yüzey ipuçlarını kopyalamamalı (learning-scientist: "görülmemiş varyantla kanıtlı karar").
- SEQ kartı (1–7), eğlence ölçeği (0–10), SUS Türkçe sürümü (10 madde).
- Kronometre veya kayıttan zaman damgası.

---

## 6. Oturum akışı (yaklaşık 50–60 dk)

| Dakika | Bölüm | Not |
|---|---|---|
| 0–5 | Karşılama, onay formu, "sesli düşün" alıştırması | Kayıt onayı ayrı sorulur |
| 5–7 | G1 — 5 sn ilk izlenim (+ G1-K konsept karşılaştırması) | Ekran görüntüsüyle, katılımcı henüz giriş yapmamış |
| 7–10 | G2 — 60 sn ilk görev | Taze hesap, gerçek arayüz |
| 10–22 | G3 — Dersi / mini görevi bitirme | Görev sonrası SEQ, sıkılma sorusu, eğlence 0–10 |
| 22–35 | G4 — Kopan canlı oturum + geç katılım + bitiş | Eğitmen ayrı cihazdan ilerletir |
| 35–40 | G5a — Aynı oturum içinde aktarma | Görülmemiş varyant 1 |
| 40–48 | SUS, kısa görüşme | §8.6 soruları |
| 48–50 | Kapanış, G5b randevusu | Katılım ödülü (varsa) burada, sonuçtan bağımsız |
| +48–72 saat | G5b — gecikmeli aktarma (10 dk) | Görülmemiş varyant 2, hatırlama soruları |

Görev sırası sabittir (G1 → G5), çünkü G2 taze hesap durumuna, G3 G2'nin sonucuna bağlıdır. G1-K'deki A/C ekranlarının sırası katılımcılar arasında **dönüşümlü** verilir (P01 A önce, P02 C önce…) **[Sentez]**.

---

## 7. Moderatör betiği (sabit metin)

Oturum başı:

> "Merhaba, katıldığın için teşekkürler. Bugün yeni bir öğrenme platformunu deniyoruz. Burada test edilen sen değilsin, platform. Takılırsan bu bizim hatamız ve tam da bulmak istediğimiz şey. Lütfen aklından geçenleri sesli söyle; 'şunu arıyorum, bu ne demek' gibi. Ben çoğunlukla sessiz kalacağım. İstediğin an bırakabilirsin."

Her görevde yönerge kâğıtta da verilir; moderatör aynı metni okur, açıklama eklemez. Görev yönergeleri §8'de.

---

## 8. Görevler

Ortak not: tüm süreler kayıttan ya da kronometreden ölçülür; "yardım alındı" olan deneme başarısız sayılır ama süresi ayrıca not edilir.

### G1 — 5 saniye ilk izlenim

| | |
|---|---|
| **Amaç** | İlk giriş ana sayfasında amaç ve birincil eylem anlaşılıyor mu (RQ1) |
| **Kaynak** | student-ux-research (G1); student-zero-knowledge ("10 sn içinde tek birincil düğmeyi gösterebilir") |
| **Hazırlık** | Taze hesabın ilk giriş ana sayfasının ekran görüntüsü, katılımcının cihaz türünde (telefon/masaüstü) |
| **Yönerge** | "Sana 5 saniye bir ekran göstereceğim. Sonra birkaç soru soracağım." |
| **Sorular** (açık uçlu, hatırlama) | 1) "Bu ne için?" 2) "Şimdi ne yapardın?" 3) "Ne gördün?" (student-ux-research) |
| **Ek ölçü** | Ekran tekrar gösterilir: "Başlamak için nereye dokunurdun? Göster." Süre ölçülür (student-zero-knowledge: 10 sn hedefi) |
| **Kodlama** | Amaç yanıtı: "siber güvenlik öğrenme / kurs / kulüp eğitimi" yönünde mi? Eylem yanıtı: tek yeşil birincil eylemi mi işaret ediyor? Hatırlanan öğeler listesi (boş kartlar, sıra, seri hatırlanıyorsa not edilir) |

**G1-K — Konsept karşılaştırması (A ve C kabukları):** Aynı üç soru, kabuk A (Mission Control: tek "Sıradaki adım" kartı, ilerleme rayı) ve kabuk C (Friendly Academy: krem zemin, açık yol) ekran görüntüleriyle, dönüşümlü sırayla. Ek soru: "Hangisinde ne yapacağını daha hızlı anladın? Neden?" Kaynak: learning-scientist, student-ux-research (yargıç kararları). Bu bir tercih ölçüsüdür; n küçük olduğu için "kazanan" ilan etmez, yalnızca Tur 3 melezinin kabuk seçimini besler.

### G2 — 60 saniye ilk görev

| | |
|---|---|
| **Amaç** | Taze hesapla ilk mini görev yardımsız ve hızlı başlatılıyor mu; ilk geri bildirime ne kadar sürede ulaşılıyor (RQ2) |
| **Kaynak** | student-ux-research (G2), student-bored-skeptic (Ölçüt 1–2), student-curious-beginner (Ölçüt A, C), student-zero-knowledge (90 sn) |
| **Hazırlık** | Giriş ekranında, taze test hesabı bilgileri katılımcıya verilmiş |
| **Yönerge** | "Giriş yap. Sonra ilk dersi bul ve başlat. Bitince 'başladım' de." |
| **Ölçüler** | (a) Girişten ilk görev ekranının açılmasına süre; (b) tıklama sayısı ve kaydırma gerekip gerekmediği; (c) yanlış tıklama sayısı (birincil eylem dışındaki hedeflere dokunma); (d) yardım isteği; (e) ilk doğru/yanlış geri bildirimine kadar süre; (f) "şimdi ne yapacağım?" duraksamaları (5 sn'den uzun hareketsizlik) |
| **Gözlem notu** | "Başla" nereye götürdü? Broşür/program sayfasına düştüyse ön koşul ihlali olarak işaretlenir (§2) |

İsteğe bağlı alt görev **G2-O (onay bekleyen kullanıcı):** "Onay bekliyor" durumundaki hesapla giriş yapılır. Soru: "Şimdi ne olacak? Beklerken ne yapabilirsin?" Ölçü: öğrenci bekleme süresini ve yapabileceği bir şeyi söyleyebiliyor mu. Kaynak: student-ux-research (B2/Ö2), student-bored-skeptic (onay politikası), student-zero-knowledge (B4). Bu alt görev yalnızca "bekleme odası" uygulandıysa yapılır.

### G3 — Dersi / mini görevi bitirme

| | |
|---|---|
| **Amaç** | İlk mini görev ("Şüpheli Mesaj: Sahte Kampüs Bursu") bitiriliyor mu, ne öğrenildiği kendi sözleriyle açıklanabiliyor mu (RQ3) |
| **Kaynak** | student-ux-research (G3), student-curious-beginner (Ölçüt B), learning-scientist (gerekçe, firstTry), accessibility-simplicity (kilit nedeni) |
| **Yönerge** | "Başladığın görevi kendi hızında bitir. Bitti diye düşündüğünde söyle." |
| **Ölçüler** | (a) Tamamlama (evet/hayır/yardımla); (b) süre, ekranda yazan süreyle karşılaştırmalı; (c) bırakma noktası (hangi adım/kart); (d) ilk denemede doğru karar sayısı; (e) ipucu kullanımı (1. / 2. ipucu); (f) "Dersi bitir" kilidine takılma ve nedeni anlama; (g) jargon duraksamaları ("bu ne demek?") |
| **Görev sonrası** | SEQ: "Bu görev ne kadar kolaydı?" (1 = çok zor, 7 = çok kolay). "Sıkıldığın an oldu mu? Nerede?" Eğlence 0–10 (student-ux-research) |
| **Açıklama sorusu** | "Az önce ne yaptın ve neden doğru ya da yanlıştı?" Yanıt kendi sözleriyle, kanıta (gönderen adresi, acele ettirme, şifre isteme gibi) dayanıyorsa "açıklayabildi" kodlanır (student-curious-beginner Ölçüt B) |
| **Gözlem notu** | Hikâye öğeleri (DOSYA kutusu, kanca cümlesi, "DOSYA KAPANDI" kartı) eylemi geciktirdi mi, yoksa merak mı yarattı? (student-zero-knowledge, student-bored-skeptic ve student-curious-beginner'ın underground-storyteller'a itirazı burada sınanır) |
| **Başarı anı** | +XP geri bildirimi fark edildi mi, kayboldu mu? Kalıcı başarı kartı mı, toast mı? (student-ux-research Ö4) |

### G4 — Kopan canlı oturuma dönüş

| | |
|---|---|
| **Amaç** | Kopma ve geç katılımda doğru slayta dönüş, durumun anlaşılması, bitişte bireysel moda köprü (RQ4) |
| **Kaynak** | student-ux-research (G4, B3, Ö3), club-live-experience, accessibility-simplicity ("canlıda eski slaytta donma") |
| **Hazırlık** | Eğitmen test sunumunu başlatır; katılımcı 6 haneli kodla katılır (kodun nerede yazdığını bulması da gözlenir — student-ux-research B5; student-bored-skeptic `maxLength=8` tutarsızlığı) |
| **Adım 1 — Katılım** | "Eğitmenin derse katılmanı istiyor. Katıl." Ölçü: katılım süresi, kodu bulma |
| **Adım 2 — Kopma** | Eğitmen 7. slayta geldiğinde katılımcının Wi-Fi'ı / uçak modu **30 sn** kapatılır; bu sırada eğitmen 11. slayta ilerler. Ağ açılır. Ölçüler: doğru slayta dönüş süresi; "şimdi ne oluyor?" sorusuna yanıt (anlama); kaç slayt kaçırdığını söyleyebiliyor mu |
| **Adım 3 — Geç katılım** | Sekme kapatılır, eğitmen 2 slayt daha ilerler, katılımcı yeniden katılır. Ölçü: doğru slayta düşme, süre |
| **Adım 4 — Bitiş** | Eğitmen dersi bitirir. Soru: "Şimdi sıradaki ne? Ne yapardın?" Ölçü: kaldığı derse ya da ilgili göreve köprüyü bulma |
| **Not** | Ağ kesme moderatör tarafından değil, katılımcıya "şimdi Wi-Fi'ı kapatacağız, sonra açacağız" denerek yapılır; sürpriz yapılmaz **[Sentez]** |

### G5 — Öğrenilen bilgiyi uygulama (aktarma)

| | |
|---|---|
| **Amaç** | Mini görevde öğrenilen beceri görülmemiş bir vakaya aktarılıyor mu (RQ5) |
| **Kaynak** | student-ux-research (G5), learning-scientist ("48 saat sonra görülmemiş varyantla kanıtlı karar veren aktarma testi … 'bitti' tanımına girmedi") |
| **G5a (aynı oturum)** | Görülmemiş sahte mesaj varyantı 1. Yönerge: "Bu mesaj sana gelse ne yapardın? Neden?" |
| **G5b (48–72 saat sonra)** | Varyant 2 (belirsiz kart dahil). Aynı yönerge + "Geçen gün öğrendiğin şeyden aklında ne kaldı?" |
| **Ölçüler** | Doğru sınıflandırma (sahte / gerçek / doğrulamak gerekir) **ve** gerekçe; gerekçenin mesajdaki somut bir kanıta dayanıp dayanmadığı; ders içeriğinin hatırlanması |
| **Belirsiz kart kuralı** | "Başka kanaldan doğrularım" yanıtı belirsiz kartta doğru sayılır; net sahte kartta tek başına doğru sayılmaz, "kısmen" kodlanır. Bu, açık "Emin değilim" çelişkisinin (§11) gözlem verisini toplar (learning-scientist, accessibility-simplicity, student-ux-research yargıç notları) |

### 8.6 Kapanış görüşmesi (açık uçlu, 5–8 dk)

1. "Bir arkadaşına bu platformu tek cümleyle nasıl anlatırsın?" (student-zero-knowledge: "bu platformdan ne kazanacağım" sorusu)
2. "Seni en çok nerede durdurdu?"
3. "Tekrar açar mıydın? Ne olursa açardın?"
4. "Liderlik tablosu, seri ya da sıra gibi şeyler gördün mü? Sana nasıl hissettirdi?" (student-zero-knowledge, student-curious-beginner, student-bored-skeptic'in gamification-economy'ye itirazları; yalnızca nitel not)
5. "Anlamadığın bir kelime oldu mu?" → jargon listesine eklenir.

Ardından SUS (10 madde, Türkçe sürüm) doldurulur (student-ux-research).

---

## 9. Geçme / kalma eşikleri

### 9.1 İlke

- Eşikler **çalışmadan önce yazılı olarak sabitlenir** ve sonuç görüldükten sonra değiştirilmez (student-ux-research: "Eşik değerleri çalışmadan önce yazılı sabitlenir").
- n küçük; **istatistiksel iddia yok** (student-ux-research). Eşikler "ekran bitti sayılır mı" kararı içindir, genelleme için değildir.
- **Sıfır bilgili alt grup ayrı raporlanır, ortalamaya karıştırılmaz** (student-ux-research).
- MASTER_PROMPT: öğrenci ajanları P0 sürtünme bildirirse UI direktörü düzeltmeden ekran tamamlanmış sayılmaz. Bu çalışmada aynı kural gerçek gözlem için geçerlidir.

### 9.2 Eşik tablosu (n = 6 için; n = 5, 7, 8 için "en fazla 1 kişi başarısız" kuralıyla ölçeklenir)

| Görev | Geçme eşiği (öneri) | Kaynak |
|---|---|---|
| G1 amaç | En az 5/6 amacı "siber güvenlik öğrenme / kurs" yönünde anlar | student-ux-research |
| G1 eylem | En az 5/6 tek birincil düğmeyi **≤ 10 sn** içinde gösterir | student-zero-knowledge |
| G2 başlatma | En az 5/6 yardımsız başlatır, **medyan ≤ 40 sn**, hiçbiri > 60 sn değil | student-ux-research (60 sn ve ≤ 40 sn medyan) |
| G2 yol | İlk mini göreve **≤ 2 tıkla ve kaydırmadan** ulaşılır | student-bored-skeptic |
| G2 ilk geri bildirim | İlk doğru/yanlış geri bildirimine **≤ 90 sn** | student-bored-skeptic, student-zero-knowledge |
| G2 takılma | İlk 5 dakikada kişi başı 0–1 "ne yapacağım?" duraksaması | student-curious-beginner |
| G3 bitirme | En az 5/6 bitirir, süre ≤ yazılı sürenin **1,5 katı** | student-ux-research |
| G3 açıklama | En az 4/6 "ne yaptın, neden" sorusunu kanıta dayalı yanıtlar | [Sentez] — student-curious-beginner Ölçüt B eşik vermedi, "oran kaydedilir" dedi; eşik G5 ile aynı düzeye konuldu |
| G3 kurulum | **Hiçbir katılımcı** VM/WSL kurmak zorunda kalmaz | student-curious-beginner (Ölçüt D) |
| G4 dönüş | En az 5/6 kopmadan sonra **≤ 15 sn** içinde doğru slayta döner | student-ux-research |
| G4 bitiş | En az 5/6 "sıradaki ne" sorusuna arayüzden bir hedef gösterir | [Sentez] — student-ux-research ölçü olarak tanımladı, eşik vermedi |
| G5 aktarma | En az 4/6 yeni örneği **gerekçesiyle** doğru sınıflandırır (G5a ve G5b ayrı raporlanır) | student-ux-research; learning-scientist (48 saat koşulu) |
| SUS | ≥ 68 yalnızca **uyarı eşiği** olarak okunur; tek başına geçme/kalma belirlemez | student-ux-research |

### 9.3 Kalma (ekran "bitti" sayılmaz) kuralları

Aşağıdakilerden biri olursa ilgili ekran tamamlanmış sayılmaz (student-ux-research):

- Aynı ekranda **2 dakikadan uzun** takılan **≥ 2** kişi.
- Aynı **P0** hatayı yaşayan **≥ 2** kişi.
- Ek **[Sentez]**: Sıfır bilgili alt grupta (≥ 3 kişi) çoğunluk G1 veya G2'yi geçemezse, genel eşik geçilse bile ekran "bitti" sayılmaz. Bu, student-zero-knowledge'ın "çoğunluk bu üçünü yardımsız geçemezse o ekran bitmiş sayılmaz" kuralının alt gruba uygulanmasıdır.

### 9.4 Ajanlar arası eşik farkları ve uzlaştırma

| Konu | Farklı öneriler | Bu protokolde | Gerekçe |
|---|---|---|---|
| İlk görevi başlatma süresi | student-ux-research: 60 sn, medyan ≤ 40 sn · student-curious-beginner: 60 sn altı · student-zero-knowledge: 90 sn içinde ilk mini etkileşim | Başlatma ≤ 60 sn (medyan ≤ 40), ilk geri bildirim ≤ 90 sn | İki farklı olayı ölçüyorlar: "başlattı" ve "ilk etkileşime/geri bildirime girdi". İkisi ayrı satırda tutuldu **[Sentez]** |
| Örneklem ve oran | student-ux-research: 5/6 · student-bored-skeptic: 4/5 · student-zero-knowledge: "çoğunluk" | "En fazla 1 kişi başarısız" | 5/6 ile 4/5 aynı kuralı verir; çoğunluk kuralı sıfır bilgi alt grubuna uygulandı **[Sentez]** |
| Birincil eylemi bulma | student-zero-knowledge: 10 sn · student-ux-research (Tur 1 itirazı): CTA 5 sn içinde, hareket olmadan da fark edilmeli | G1 5 sn testinde "şimdi ne yapardın" + ≤ 10 sn gösterme | 5 sn testi fark etmeyi, 10 sn gösterme bulmayı ölçer; ikisi tamamlayıcı **[Sentez]** |
| Takılma | student-ux-research: 2 dk aynı ekranda · student-curious-beginner: ilk 5 dk'da 0–1 takılma | İkisi de tutuldu: 2 dk kalma kuralı, 0–1 duraksama hedefi | Biri ağır başarısızlık, diğeri akıcılık ölçüsü |

Bu tablodaki uzlaştırma bir **öneridir**; çalışma sorumlusu eşikleri çalışma başlamadan bu belgeye son hâlini yazarak sabitler.

---

## 10. Veri toplama

### 10.1 Gözlem formu (katılımcı başına, kodlu)

| Alan | Değer |
|---|---|
| Katılımcı kodu | P0_ |
| Cihaz / tarayıcı | Telefon / Dizüstü — |
| Öz bildirim düzeyi (1–5) | — |
| Alt grup | Sıfır bilgi / Az bilgi / IT |
| Ön koşul eksikleri (§2) | — |

| Görev | Başladı (zaman) | Bitti (zaman) | Başarı (E / H / Yardımla) | Yanlış tıklama | Yardım isteği | Duraksama (>5 sn) | Bırakma noktası | Alıntı (kelimesi kelimesine) | Hata etiketi |
|---|---|---|---|---|---|---|---|---|---|
| G1 | | | | | | | | | |
| G1-K | | | | | | | | | |
| G2 | | | | | | | | | |
| G3 | | | | | | | | | |
| G4 | | | | | | | | | |
| G5a | | | | | | | | | |
| G5b | | | | | | | | | |

Anket alanları: SEQ (G3) · Eğlence 0–10 (G3) · SUS toplamı · Jargon listesi.

### 10.2 Tanımlar

| Terim | Tanım |
|---|---|
| Başarı | Görevin hedef durumuna moderatör yardımı olmadan ulaşmak |
| Yardım | Moderatörün betik dışı herhangi bir yönlendirmesi (§4.5'teki üçüncü aşama) |
| Yanlış tıklama | Görev hedefine götürmeyen bir öğeye dokunma/tıklama (geri dönüş dahil) |
| Duraksama | Görev sırasında 5 sn'den uzun hareketsizlik ve/veya "ne yapacağım?" türü söz |
| Takılma | Aynı ekranda 2 dk'dan uzun ilerleyememe |
| Bırakma noktası | Katılımcının vazgeçtiği ya da "bitti" dediği halde görevin bitmediği yer |
| Jargon | Katılımcının sorduğu ya da yanlış anladığı her terim (ör. OSINT, CTF, SOC, "Kalkan dosyan") |

### 10.3 Hata önem dereceleri (moderatör etiketleri)

| Derece | Tanım | Örnek (beklenen, gözlenmiş değil) |
|---|---|---|
| **P0** | Görevi engelliyor ya da yanlış hedefe götürüyor; yardımsız aşılamıyor | "Başla" program broşürüne gidiyor; kopma katmanı sahneyi kapatıp eylem vermiyor |
| **P1** | Görev tamamlanıyor ama belirgin gecikme, yanlış anlama veya güven kaybı | Açıklamasız jargon; kaybolan +XP toast'ı; kilit nedenini yazmayan "Dersi bitir" |
| **P2** | Küçük sürtünme, kozmetik | Uzun büyük harf başlıkta okuma yavaşlaması |

Örnek sütunu ajanların kod okumasına dayalı **beklentileridir** (student-ux-research B3/B4, student-zero-knowledge B1, accessibility-simplicity); gerçek etiketler yalnızca gözlemden gelir.

### 10.4 Rol dağılımı

| Rol | Görev |
|---|---|
| Moderatör | Betiği okur, sessiz kalır, yardım aşamalarını uygular |
| Not alıcı | Gözlem formunu doldurur, zaman damgası ve alıntı yazar |
| Eğitmen (yalnızca G4) | Test sunumunu ilerletir; katılımcıyla konuşmaz |
| Teknik sorumlu | Test hesapları, ağ kesme, sunucu günlüğü |

Moderatör ve not alıcı aynı kişi olmamalıdır **[Sentez]**.

---

## 11. Çalışmanın beslediği açık tasarım soruları

Bu sorular Tur 3'te kapanmadı; çalışma bunlar için **karar değil, gözlem** üretir.

| Açık soru | Taraflar | Çalışmada nasıl gözlenir |
|---|---|---|
| "Emin değilim" her zaman mı geçerli, yalnızca belirsiz kartta mı? | student-zero-knowledge: her zaman · learning-scientist, underground-storyteller (yargıç notlarına göre): yalnızca belirsiz kartta ve doğrulama eylemiyle | G5'te belirsiz ve net kart ayrı; net kartta "emin değilim" diyenin gerekçesi not edilir; ceza hissi sorulur |
| Ders başına kontrol noktası en fazla 2 mi 3 mü? | tryhackme-ux, htb-academy-ux: 2 · elite-ui-director, learning-scientist: 3 (yargıç notlarına göre) | G3'te hangi karar anında sıkılma/bırakma olduğu ve toplam süre |
| İlk görev uzunluğu: 3 adım (≈3–4 dk) mı, 5–7 karar noktası mı? | accessibility-simplicity ve student-ux-research yargıç notları: kesin karar yok | G3 süresi, bırakma noktası, eğlence puanı |
| Lexend Tera uppercase ders gövdesinde kalmalı mı? | accessibility-simplicity ve student-ux-research (yargıç): ders gövdesinden çıkmalı (Readex 500, sentence case) · TASARIM-SISTEMI.md: başlıklar daima uppercase | G1/G3 başlık okuma duraksaması, yanlış okuma |
| Hikâye (DOSYA kutusu) eylemden önce mi sonra mı? | student-zero-knowledge, student-bored-skeptic, student-curious-beginner: sonra/ödül · underground-storyteller: hikâye çerçevesi | G3'te kutu üzerinde geçirilen süre, "ders mi roman mı" tepkileri |
| Sıra/seri ilk haftada gösterilmeli mi? | Üç öğrenci ajanı ve student-ux-research: ilk görevden sonra · gamification-economy: Tur 1 raporu bu belgeye girdi olarak verilmedi | §8.6 soru 4, nitel |

---

## 12. Analiz planı

1. **Nicel özet (görev başına):** başarı sayısı / n, süre medyanı ve aralığı (en kısa–en uzun), yanlış tıklama ve duraksama toplamları. Ortalama yerine medyan; yüzde yerine "x/n" yazılır **[Sentez]**, çünkü n küçüktür (student-ux-research: istatistiksel iddia yok).
2. **Alt grup ayrımı:** sıfır bilgi / az bilgi / IT ayrı sütunlarda; telefon / dizüstü ayrı satırda. Sıfır bilgili alt grup ortalamaya karıştırılmaz (student-ux-research).
3. **Nitel analiz:** alıntılar ve gözlemler kartlara yazılır, benzerlik gruplaması (affinity) ile temalara ayrılır; her tema en az 2 katılımcıdan gelmeden "örüntü" sayılmaz **[Sentez]**.
4. **Sorun listesi:** her sorun için ekran, önem (P0/P1/P2), kaç kişide görüldüğü, alıntı ve ilgili ajan önerisi (ör. "Ö3 — kopma şeridi, student-ux-research").
5. **Karar kuralı:** §9.2 eşikleri ve §9.3 kalma kuralları uygulanır. Sonuç her ekran için yalnızca üç değerden biri olur: **Geçti** · **Kaldı (düzelt, tekrar test et)** · **Ön koşul eksik (ölçülmedi)**.
6. **Konsept karşılaştırması (G1-K):** A/C tercihleri ve gerekçeleri yan yana; "kazanan" ilan edilmez, Tur 3 melezinin kabuk kararına girdi olarak iletilir (learning-scientist, student-ux-research).
7. **Simülasyonla karşılaştırma:** gerçek gözlemler, öğrenci ajanlarının simüle ettiği "ilk 60 saniye" anlatımlarıyla karşılaştırılır; tutan ve tutmayan tahminler açıkça yazılır. Simülasyon hiçbir zaman sonuç olarak raporlanmaz **[Sentez]**.
8. **Yeniden test:** "Kaldı" çıkan ekran düzeltildikten sonra **yeni** katılımcılarla (önceki katılımcılar değil) en az 3 kişilik kısa tur yapılır **[Sentez]**.

---

## 13. Sonuçlar

> **BU BÖLÜM BOŞTUR. ÇALIŞMA YAPILMADI.**
> Aşağıdaki tablolar yalnızca raporlama şablonudur. Değer yazılmadan önce oturumlar gerçekten yapılmış, kayıtlar analiz edilmiş ve tarih/katılımcı sayısı not edilmiş olmalıdır.

**Çalışma bilgisi**

| Alan | Değer |
|---|---|
| Oturum tarihleri | — (yapılmadı) |
| Katılımcı sayısı (n) | — |
| Sıfır bilgi alt grubu | — |
| Telefon / dizüstü | — |
| Etik onay / danışman teyidi | — |
| Sabitlenmiş eşik sürümü | — |

**Görev sonuçları**

| Görev | Eşik | Sonuç (x/n) | Medyan süre | Karar |
|---|---|---|---|---|
| G1 amaç | ≥ 5/6 | — | — | — |
| G1 eylem | ≥ 5/6, ≤ 10 sn | — | — | — |
| G2 başlatma | ≥ 5/6, medyan ≤ 40 sn | — | — | — |
| G2 ilk geri bildirim | ≤ 90 sn | — | — | — |
| G3 bitirme | ≥ 5/6, ≤ 1,5× süre | — | — | — |
| G3 açıklama | ≥ 4/6 | — | — | — |
| G4 dönüş | ≥ 5/6, ≤ 15 sn | — | — | — |
| G4 bitiş köprüsü | ≥ 5/6 | — | — | — |
| G5a aktarma | ≥ 4/6 | — | — | — |
| G5b aktarma (48–72 sa) | ≥ 4/6 | — | — | — |
| SUS (uyarı) | ≥ 68 | — | — | — |

**Bulunan sorunlar**

| # | Ekran | Önem | Görülme (x/n) | Alıntı | İlgili öneri | Durum |
|---|---|---|---|---|---|---|
| — | — | — | — | — | — | — |

---

## 14. Sınırlılıklar ve riskler

| Risk | Etki | Önlem |
|---|---|---|
| Küçük örneklem (5–8) | Genelleme yok; tek kişi sonucu değiştirebilir | Eşikler "ekran bitti mi" kararı için; yüzde yazılmaz (student-ux-research) |
| Gönüllü yanlılığı | Meraklı öğrenciler fazla temsil edilir; student-bored-skeptic personası eksik kalabilir | Kulüp dışından en az 2 kişi; duyuruda "bilmiyorsan daha iyi" (student-ux-research kotası) |
| Moderatör etkisi | Katılımcı "doğru yapmaya" çalışır | Eğitmen olmayan moderatör, sabit betik, nötr tutum |
| Laboratuvar ortamı | Gerçek kullanımda dikkat dağınıklığı (student-zero-knowledge simülasyonundaki "telefonum çaldı") yoktur | Telefonla, mümkünse kampüs ortamında; bulgular "en iyi durum" olarak okunur **[Sentez]** |
| Yenilik etkisi | İlk izlenim olumlu, ikinci hafta farklı olabilir | G5b ikinci temas noktası; uzun dönem tutundurma ayrı çalışma |
| Simülasyonla karışma | Ajan anlatımları gerçek bulgu sanılabilir | Bu belgede simülasyon ve sonuç ayrı bölümlerde; §13 boş |
| Ön koşulların eksik uygulanması | Bilinen hatayı yeniden ölçmek | §2 kontrol listesi, "ön koşul eksik" etiketi |

---

## 15. Kaynaklar

| Kaynak | Bu belgeye kattığı |
|---|---|
| `MASTER_PROMPT.md` (Tur 4, kalite kapıları, güvenlik) | Beş görev türü, 5–8 gerçek öğrenci, "sonuç üretme" kuralı |
| `00-current-state.md` | Ekran haritası, gözlenen sorunlar 1–9, teknik kısıtlar |
| `docs/TASARIM-SISTEMI.md` | Gözlenecek marka kararları (§5.2) |
| student-ux-research (Tur 1 raporu ve Tur 3 yargıç notu) | Protokol iskeleti, kotalar, izin/mahremiyet, G1–G5, eşikler, kalma kuralları, ön koşullar |
| student-zero-knowledge (Tur 1) | 10 sn / 90 sn / 5 dk eşikleri, "çoğunluk" kuralı, jargon listesi, görünürlük korkusu |
| student-bored-skeptic (Tur 1) | ≤ 2 tık ve kaydırmasız erişim, ≤ 90 sn ilk geri bildirim, 4/5 kuralı, terk anları |
| student-curious-beginner (Tur 1) | Kendi telefonundan QR, açıklama sorusu (Ölçüt B), 0–1 takılma, VM/WSL yasağı |
| learning-scientist (Tur 3 yargıç) | 48 saatlik görülmemiş varyant aktarma testi, A/C 5 sn karşılaştırması, kaba kuvvet ön koşulu, "Emin değilim" çelişkisi |
| accessibility-simplicity (Tur 3 yargıç) | Kilit nedeni, dokunmatik sözlük, eksik görsel kutusu, Lexend Tera uppercase itirazı, koyu yüzey kuralı |

Diğer Tur 1 ajanlarının (tryhackme-ux, htb-academy-ux, elite-ui-director, underground-storyteller, gamification-economy, interactive-mission, club-live-experience, motion-visual, product-admin, technical-architect) raporları bu belgeye doğrudan girdi olarak verilmedi. Adları yalnızca yukarıdaki ajanların raporlarında ya da yargıç notlarında geçtiği yerde, o kaynağa dayanarak anıldı.
