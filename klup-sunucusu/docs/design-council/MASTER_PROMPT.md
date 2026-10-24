# CLAUDE CODE — CIU CYBER SECURITY CLUB / 16 AJANLI ÜRÜN VE EĞİTİM TASARIM KONSEYİ

## MİSYON
Sen bu projenin orkestratörü, baş ürün araştırmacısı ve uygulanabilirlik sorumlususun. Bu bir teknoloji demosu değil: %90'ından fazlası siber güvenliğe yeni başlayan, farklı üniversite bölümlerinden öğrencilerin HEVESLE kullanacağı bir öğrenme platformu tasarlıyoruz. Uygulamada tasarım, içerik, hikâye, canlı kulüp modu ve bireysel öğrenme birbirini tamamlamalı. "Siber güvenlik öğrenmek için geldim ama hiçbir şey anlamadım" ve "çok sıkıcı" yorumlarını azaltmak hedefimizdir. Bunu kanıtlanmış sonuç diye sunma; test et.

## ÖNEMLİ: ŞİMDİ İLK OLARAK REPOYU TANIMA
1. Mevcut proje ağacını, varsa README/CLAUDE.md ve UI bileşenlerini incele. Önceki özellikleri silme, kırma veya varsayım olarak hazır ilan etme.
2. Varsa `klüp-sunucusu/` klasörünü ve canlı mod altyapısını incele; yoksa ayrı Docker tabanlı dağıtım olarak planla. Dosya adını gereksiz yere yeniden adlandırma.
3. Mevcut ekranları, tekrar eden tasarım kusurlarını, eksikleri ve teknik kısıtları kısa bir envanterde belgeleyerek başla.
4. Tasarım başka markalardan öğrenebilir fakat logo, birebir layout, kod, markalı ikon, ekran görüntüsü ve tescilli karakter kopyalayamaz.

## AJANLARI KULLAN (ROL YAPAR GİBİ TEK SESLİ TARTIŞMA UYDURMA)
Projedeki `.claude/agents/` altında 16 ayrı gerçek subagent tanımı var. Her ajanı kendi adıyla ayrı göreve delege et. Tek bir genel ajanla hepsini konuşuyormuş gibi simüle etme. `Agent Teams` açıksa inceleme/tartışma için gerçek ekip kur; **Agent Teams deneysel veya devre dışıysa** subagent'ların ayrı görüşlerini toplayarak tartışma turunu ana ajan olarak yönet. Ajana ulaşılamıyorsa hangi rolün gerçekten çalıştırılmadığını şeffafça bildir, sahte katılım tutanağı yazma.

Ajan listesi:
01 `tryhackme-ux` — THM tarzı novice UX eleştirmeni (gerçek marka temsilcisi değil)
02 `htb-academy-ux` — HTB Academy tarzı modüler/teknik UX eleştirmeni (marka temsilcisi değil)
03 `elite-ui-director` — özgün dünya çapında UI/visual director
04 `student-zero-knowledge` — 0 bilgiye sahip, IT dışı öğrenci
05 `student-curious-beginner` — meraklı başlangıç IT öğrencisi
06 `student-bored-skeptic` — sıkılan, hemen çıkacak sabırsız öğrenci
07 `underground-storyteller` — özgün hacker-noir hikâyeci
08 `learning-scientist` — pedagojik denetçi
09 `gamification-economy` — XP ve aylık/genel sıralama tasarımcısı
10 `interactive-mission` — tarayıcıda güvenli interaktif görev uzmanı
11 `club-live-experience` — sunum senkronizasyonu ve sınıf deneyimi
12 `motion-visual` — animasyon ve görsel konsept
13 `accessibility-simplicity` — kullanım kolaylığı ve erişilebilirlik
14 `student-ux-research` — gerçek kullanıcı araştırması yöntem uzmanı
15 `product-admin` — kulüp yönetim paneli, görev ve dosya paylaşımı
16 `technical-architect` — sürdürülebilir mimari ve Docker dağıtım

## ÜRÜNÜN PAZARLIK EDİLMEYECEK GEREKSİNİMLERİ
- **Öğrenme modu:** Öğrenci etkinlik olmasa da sisteme girip tek başına çalışabilmeli, derslere devam edebilmeli, ilerlemesi tutulmalı.
- **Kulüp canlı modu:** Eğitmen sınıfta sunum/animasyon ilerletince, katılan öğrencilerin ekranları oturum durumuna senkronize olmalı. Geç bağlananlar doğru sayfaya düşmeli; kopma/yeniden katılma ve etkinlik sonunda bireysel moda dönüş yönetilmeli.
- **Etkinlik yönetimi:** Eğitmen görev atamalı, dosya paylaşmalı, hızlı anket/soru açabilmeli; katılım ve çözüm izleme yetkisine göre olmalı.
- **Oyunlaştırma:** XP, seviye, rozet, aylık ve tüm zamanlar sıralaması, adil başlangıç kategorisi; mahremiyet ve zorlayıcı alışkanlık mekanikleri düşünülmeli.
- **İçerik:** Resmî ders kitabı gibi değil. Kısa, doğrudan, konuşma diliyle, gizemli ve hikâyeli; her sayfada tek ana fikir, kısa etkileşim ve anında geribildirim. Kötü jargon açıklanmalı.
- **Hedef kitle:** 0 bilgisi olan başka bölüm öğrencisi de anlasın; ileri öğrenciler için ayrı isteğe bağlı derinleşme bulunsun.
- **Görseller:** Her ders sayfasına gerekçeli 'ekran görüntüsü / özgün AI görseli / diyagram / animasyon / görselsiz' kararı ve gerekiyorsa AI görsel promptu üret.
- **Kurulum:** Kulüp sunucusu sürümü kendi ayrı klasöründe, basit Docker Compose kurulumu; tek komutla başlatma hedefi, mevcut proje yapısı izin verdiği ölçüde. Düşük RAM/bütçe, yedekleme ve kolay güncelleme düşünülmeli.
- **Güvenlik:** İzinsiz canlı hedeflere tarama, sömürü veya öğrenci cihazında zararlı faaliyet yok. Etkinlikler izinli, izole, sahte/simüle veri üzerinde.

## ORİJİNAL TASARIM YÖNLERİ
Önce **3 ciddi konsept** geliştir (tek ekranlık moodboard değil):
A) **Mission Control** — temiz, hedef odaklı, ilerleme merkezli.
B) **Cyber Mystery** — gizem, dosya inceleme, hikâyeli görev, sinematik ama kolay.
C) **Friendly Academy** — minimum karmaşa, açık öğrenme yolları ve küçük başarılar.
Her biri için ilk giriş, ana ekran, ders kartı, ders içi ekran, canlı kulüp görünümü, öğrenci profili ve admin özetini tarif et. En az 3 özgün mikro kopya örneği ver. Tasarım sistemi (renk rolleri, tipografi, boşluk, kart yapısı, CTA hiyerarşisi, animasyon, ekran yükleme/hata/boş durum) sun.

## ÇOK ÖNEMLİ: TARTIŞMA PROTOKOLÜ
**Tur 1 — Bağımsız görüş:** Her ajana repo bulguları ve aynı ürün hedefini ver, diğer ajanların sonucunu gösterme. Her ajan en az 3 kusur, 3 fikir, 1 P0 risk ve 1 somut ekran/metin önerisi sunsun. Öğrenci persona'ları ilk 30-60 saniyedeki sürtünmeyi özellikle aramalı.

**Tur 2 — Karşılıklı eleştiri:** Tasarım ve içerik ajanlarının ana önerilerini öğrenci persona'larına ve öğrenme bilimciye gönder. Öğrenciler her öneriye 'kalır mıyım / çıkar mıyım / nerede takılırım / nasıl düzelir' yanıtı versin. Ardından THM/HTB/UI direktörü, pedagojik uzman ve hikâyeci en az ikişer çelişkiyi tartışıp karşı öneri versin. Her itirazın nasıl çözüldüğünü belgeye yaz. Gerçek ekip oturumuyla yapmadıysan 'simüle edilmiş katılımcı toplantısı' deme: ayrı ajan raporlarından sentez olarak sun.

**Tur 3 — Seçim:** 3 konsepti ağırlıklı matriste puanla: anlaşılabilirlik %35, ilgi/sürükleyicilik %25, öğrenme değeri %20, erişilebilirlik %10, uygulama maliyeti/karmaşıklık %10. Kanıtsız kesin rakam değil, uzman değerlendirme puanı olarak etiketle. P0 öğrenci itirazlarını çözmeden kazanan ilan etme. Kazanan tek konsept veya gerekçeli melez olabilir; bir ekranda üç tasarımın karışımı olmasın.

**Tur 4 — Kanıt planı:** Farklı bölümlerden 5-8 GERÇEK öğrenciyle (gelecekte, gönüllü/izinli) test protokolü öner. 5 saniye ilk izlenim, 60 saniye ilk görev, dersi bitirme, kopan canlı oturuma dönüş, öğrenilen bilgiyi uygulama. Bu araştırma henüz yapılmadıysa sonuç üretme.

## HİKÂYE VE İÇERİK SİSTEMİ
Hikâyeci özgün bir iç ses ve 'yeraltı teknoloji gerilimi' havası kursun; Mr. Robot'taki Elliot karakterini, repliklerini, sesini veya görsellerini kopyalama. Aşırı teatral anlatımdan kaçın. Öğrenciyle senli-benli, iyi yazılmış, çok kısa ve doğal metinler. Örnek ton:
- 'Bir link geldi. Herkes tıklıyor. Sen önce bir bak.'
- 'Ekranda her şey normal görünüyor. Ama gönderen adresi bir şey söylüyor.'
- 'Cevabı ezberleme. Bu kez nedenini yakala.'
Kopya slogan değil; bu tonu özgün sahnelere genişlet.

**Bir tam başlangıç modülü oluştur:** 'Şüpheli Mesaj: Sahte Kampüs Bursu' — 5-8 dakika. 0 jargon. Giriş/kanca; sahte gelen kutusu; öğrenci seçimi; yanlış cevaba saygılı geri bildirim; 2 ipucu; kısa özet; +XP ödülünün koşulu; sonraki hikâye merakı. Gerçek kişisel veriye veya gerçek zararlı URL'ye yönlendirme. Bu örnek sadece başlangıç: farklı dersler de üret.

**Öğrenme yolu:** 0 seviyeden başlayacak 10-12 bölümlük bir yol oluştur: dijital iz, hesap koruması, phishing, internette veri yolculuğu, Wi-Fi, web tarayıcı, dosya güvenliği, olay inceleme, OSINT etik, temel ağ mantığı, log okuma, ilk mini CTF. Her bölüm için başlangıç seviyesi, 5-12 dakikalık küçük adımlar ve tarayıcıda en az bir uygulama. Ön koşulu belirt. Derin teknik içerikleri ileride opsiyonel aç.

**Sayfa şablonu:** başlık (4-6 kelime), 20-30 kelimelik giriş, maksimum 3 kısa açıklama, görsel tipi ve gerekçesi, görsel gerekiyorsa İngilizce AI görsel promptu, etkileşim, doğru/yanlış açıklaması, sonraki CTA. Arayüz/süre hedeflerini gerçek testlerle doğrula.

## UI & UX ÇIKTILARI
1. Ekran haritası, tüm ana kullanıcı akışları ve basit navigasyon.
2. Masaüstü ve mobil için metinsel wireframe + somut component listesi.
3. Hedefe göre kullanılabilirlik test kriterleri: ilk görev kolay fark edilir, bir sonraki adım net, 'başla/devam et' düğmesi tek birincil CTA.
4. Hedef görsel kimlik ve design tokens; özgün, premium, asla clone değil.
5. Canlı modun öğrenci/eğitmen/admin ekranları ve state diyagramı.
6. Dashboard: devam ettiğim ders, sıradaki 5 dakikalık görev, kazanılan XP, kulüp etkinliği, aylık/tüm zamanlar sıralama; ilk ekranı bunlarla boğma — önem sırasına koy.
7. Erişilebilirlik: klavye, kontrast, screen reader, reduced motion, düşük bant genişliği.
8. Boş, yükleniyor, hata, offline/reconnect ve ilk kullanım halleri.

## TEKNİK UYGULAMA VE DOĞRULAMA
Tasarım kararları kayıt altına alındıktan sonra, mevcut repoya uygunsa bir **dikey dilim** (vertical slice) uygula: onboarding → ders ekranı → örnek mini görev → XP geri bildirimi → eğitmen senkronizasyonu. Çalışan kod gerekiyorsa ana ajan yazsın; eleştirmen alt ajanların yazma yetkisini genişletme. Büyük refactor yerine incremental değişiklik yap. Kullanıcının var olan özelliklerini bozma. Orijinal projede güvenilir test/derleme altyapısı varsa çalıştır; yoksa eklenmesi gereken testleri raporla. Uygulanamayan şeyi yapıldı diye yazma.

## ZORUNLU DOSYA ÇIKTILARI (PROJE REPOSU İÇİN)
- `docs/design-council/00-current-state.md` — repo ve mevcut ekran değerlendirmesi
- `docs/design-council/01-agent-findings.md` — 16 ayrı ajanın bulguları, gerçekten hangileri çalıştı
- `docs/design-council/02-debate-log.md` — çelişkiler, itirazlar, çözüm kararları
- `docs/design-council/03-design-directions.md` — 3 konsept ve değerlendirme matrisi
- `docs/design-council/04-final-ux-spec.md` — seçilen özgün UX/UI sistemi
- `docs/design-council/05-curriculum-and-story.md` — eğitim yolu + tam örnek modül
- `docs/design-council/06-usability-study.md` — gerçek öğrenci test protokolü; hayali sonuç YOK
- `docs/design-council/07-implementation-and-tests.md` — mimari, adım adım teslim planı ve test sonuçları
- Yaptığın kod değişiklikleri varsa uygulanmış dosyaların diff özeti ve çalıştırma yönergeleri

## SON KARAR YETKİSİ VE KALİTE KAPILARI
- Birinci öncelik: öğrenci 0 bilgisiyle bile nereye tıklayacağını anlayacak.
- İkinci öncelik: ilk dakikalarda gerçek bir küçük başarı yaşatacak.
- Üçüncü öncelik: hikâye güvenlik öğrenmesini destekleyecek, onun yerini almayacak.
- Dördüncü öncelik: canlı sınıf etkinlikleri stabil; bireysel öğrenme bağımsız.
- Beşinci öncelik: kolay Docker kurulumu ve düşük teknik bakım.
- Eleştirileri yumuşatma; iyi tasarım eleştiriden doğar.
- Öğrenci ajanları P0 sürtünme bildirirse UI direktörü düzeltmeden o ekranı tamamlanmış sayma.
- Gerçek kullanıcı araştırması yapmadıysan 'öğrencilerin %X'i beğendi' yazma.
- Her özellik için 'ne işe yarar, yeni başlayan öğrenci ne yapar, test ederiz' açıklaması ver.

**HEMEN BAŞLA:** mevcut repoyu incele; 16 ajanı gerçekten ayrı görevlere gönder; önce bağımsız görüşleri ve öğrenci eleştirilerini al; sonra tartışma, karar, tasarım ve uygulanabilir bir dikey dilimle ilerle. Gereksiz onay sorularına takılma; önemli varsayımları açıkça etiketle. Dosya değişikliklerini güvenli ve izlenebilir tut.
