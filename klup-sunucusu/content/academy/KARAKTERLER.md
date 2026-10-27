# Gölge Ağ Ailesi — Karakter Kitabı

> ⚠️ Bu dosya **otomatik üretilir** (`npm run academy:gorseller`) — kaynak: [`karakterler.yaml`](karakterler.yaml).

Kurgusal bir siber suç ailesi. Her üyesi bir saldırı türünün ustasıdır ve Akademi'nin bir modülünde karşına çıkar. Modülü bitiren öğrenci o üyenin hilelerini çözmüş ve onu "dosyalayıp" etkisiz bırakmış olur. Ailenin görünen başı Don Gölge'dir; ama ipleri, yüzünü kimsenin görmediği Baron Eren tutar.

## 1. Evrensel sanat yönetimi

| Kural | Uygulama |
|---|---|
| **Atmosfer** | Klasik mafya filmlerinin karanlık zarafeti + sokak gerçekçiliği; üstüne parlayan yeşil hacker terminalleri, kablolar. Eğlenceli karikatür form, tehlikeli sinematik yeraltı ağırlığı. |
| **Oranlar** | Yarı-karikatür, 4.5–5.5 kafa boyu. Arketipe göre abartı: iri adamda ters üçgen gövde, babada uzun bacak/ince bel, kısa karakterde geniş duruş. |
| **Silüet** | Aksesuar, telefon, anahtar, puro ve kollar gövdeye yapışmaz; dış konturdan ayrışır, negatif alan oluşturur. Ayaklar sağlam basar; 3/4 pozlarda ayaklar ~90°. |
| **Mürekkep** | Kalın, kesintisiz dış kontur; incelen (tapered) basınçlı iç çizgiler. Çizgiler saf siyah değil, bölgenin koyu tonunda (koyu kahve, bordo, mürekkep lacivert). |
| **Renk** | Sıcak, eskitilmiş, doygunluğu düşük vintage tonlar; yüksek kontrastlı koyu gölgeler. Gölgelerde camgöbeği-yeşil kırılma, ışıkta kehribar/sepya. |
| **Gölgelendirme** | Hibrit: yumuşak airbrush hacim + çene altı, yaka, ceket katlarında net kenarlı cel gölge; kenarlarda ince kontur ışığı. |
| **Asla** | Görselde yazı/harf/rakam, gerçek kişi benzerliği, gerçek marka/kurum, stüdyo veya sanatçı adı. Kadın karakterler cinselleştirilmez. |

## 2. Kadro

| Modül | Karakter | Unvan | Temsil ettiği tehdit |
|---|---|---|---|
| M01 | **Tatlı Dil Tevfik** | Dolandırıcı | Sahte burs mesajları, sosyal mühendislik, phishing |
| M02 | **Avukat "Boşluk" Kemal** | Çarpık Avukat | İzinsiz "test", kapsam dışına çıkmak, "sadece baktım" bahaneleri |
| M03 | **Anahtarcı Rıza** | Çilingir | Yönetici yetkisi ele geçirme, başlangıca saklanma (kalıcılık), sahte dosya uzantıları |
| M04 | **Süper Kullanıcı Sadri** | Root Babası | sudo yetkisini kötüye kullanmak, chmod 777, okunmadan çalıştırılan komutlar |
| M05 | **Dinleyici Nuri** | Dinleyici | Ortak Wi-Fi'de trafik dinleme, ARP/DNS sahteciliği, ortadaki adam |
| M06 | **Çerezci Celal** | Oturum Hırsızı | Oturum çerezi çalma, yetki kontrolü eksik API'ler (IDOR), sahte alan adları |
| M07 | **Kuklacı Orhan** | Bot Ustası | Botnet'ler, kötü niyetli script'ler, koda gömülü anahtarlar, eval/komut enjeksiyonu |
| M08 | **Kasa Kıran Kadir** | Kasa Hırsızı | Parola kırma, zayıf hash'ler, tuzsuz parolalar, sızmış parola listeleri |
| M09 | **Maskeli Mine** | Bilgi Tüccarı | Kişisel bilgi toplama (doxxing), sahte profiller, sahte ilanlar |
| M10 | **Fidyeci Ferhat** | Fidye Patronu | Fidye yazılımı, zararlı yazılım, saldırı zinciri (kill chain), DDoS |
| M11 | **Don Gölge** | Ailenin Başı | Final — tüm tekniklerin birleştiği mini CTF |
| Yol A | **Tek Tırnak Jasmine** | Veritabanı Kraliçesi | SQL enjeksiyonu, veritabanı sızıntıları, girdiyi doğrulamayan formlar |
| Baron | **Baron Eren** | Ailenin En Büyüğü | Hepsi — gelmiş geçmiş en iyi hacker; Gölge Ağ'ın kurucusu ve görünmez beyni |
| Geçmiş | **Kapüşon (genç Eren)** | Baron'un geçmişi | Yirmi yıl önceki ilk büyük sızma — hikâyenin başladığı gece |
| Yol B | **Tünelci Tarık** | Ağın Hayaleti | Ağda yatay hareket, segmentasyon boşlukları, sahte erişim noktaları, tünelleme, zayıf sunucu yapılandırması |
| Yol C | **Temizlikçi Tamer** | İz Silici | Log silme, iz gizleme (anti-forensics), saldırı sonrası kalıcılık, alarm yorgunluğu |
| Yol D | **Bayrakçı Bedri** | Sahte İzlerin Ustası | Sahte bayrak (yanlış atıf), dezenformasyon, sahte tehdit raporları, iz şaşırtma |
| Yol E | **Vantrolog Veysel** | Sesin Sahibi | Prompt injection, dolaylı enjeksiyon, jailbreak, veri zehirleme, sahte ses ve görüntü |
| Yol F | **Lehimci Leman** | Devre Ustası | Akıllı cihaz ve IoT açıkları, varsayılan parolalar, güvensiz mobil uygulamalar, açık bırakılan hata ayıklama portları, güvensiz güncellemeler |
| Yol G | **Saatçi Sabri** | Mekanik Böceklerin Ustası | Zararlı yazılım (truva atı, solucan, fidye yazılımı), paketleme ve gizleme, kalıcılık, analizden kaçma |

## 3. Kimlik kartları

### M01 — Tatlı Dil Tevfik (Dolandırıcı)

- **Portre dosyası:** `karakter-tevfik.png`
- **Özet:** Herkese tam beklediği anda tam istediği mesajı gönderen tatlı dilli dolandırıcı. "Bursun onaylandı!" onun imzasıdır.
- **Temsil ettiği tehdit:** Sahte burs mesajları, sosyal mühendislik, phishing
- **Fiziksel yapı:** 40'larında, ince ve uzun bacaklı, hafif öne eğik "satıcı" duruşu; 5 kafa boyu.
- **Yüz ve ifade:** Yağlı yandan ayrılmış siyah saç, ince kalem bıyık, tek altın dişli geniş sahte gülümseme, yarı kısık hesapçı gözler.
- **Poz ve silüet:** 3/4 cephe; iki kolu gövdeden açık, her elinde yeşil parlayan bir akıllı telefon uzatıyor — net silüet.
- **Kıyafet ve aksesuar:** Bordo çizgili yelek, kolları sıvalı krem gömlek, gevşetilmiş hardal kravat; yelek cebinden taşan parlayan sahte mesaj kartları.
- **İmza detay:** Altın diş ve iki telefon.
- **Renk paleti:** yelek `#6E1E1E` · gomlek `#E6DDD3` · kravat `#B8892E` · ten `#D89E7A` · ten_golge `#9E6347`

- **Hikâyedeki yeri:** Don'un yeğeni. Ailenin en çok konuşan ağzı — ve ipin ilk ucu.

**Portre promptu (Midjourney):**

```text
Full-body character design portrait of Tatli Dil Tevfik, a slick con artist in his 40s with oily side-parted black hair, a pencil mustache, a wide fake charming grin showing one gold tooth and half-lidded scheming eyes, lean build with long legs and a slightly forward salesman posture, wearing a burgundy pinstripe vest over a cream shirt with rolled-up sleeves and a loosened mustard tie, glowing fake message cards sticking out of his vest pocket, both arms held away from his body each holding a smartphone glowing green. Three-quarter view, the entire figure visible, plain dark smoky background under a single soft spotlight, character sheet clarity. stylized 2D cartoon illustration in a film noir comic look, semi-cartoon proportions about 5 heads tall, clear readable silhouette with arms and props held away from the body, bold confident outer ink contours with tapered thinner interior lines, line art tinted in dark local colors (deep brown, burgundy, ink-navy) instead of pure black, warm worn-out desaturated vintage palette, high-contrast hard cel-shaded shadows combined with soft airbrushed volumes, subtle cyan-green tint in the shadows and warm amber-sepia highlights, thin soft rim light separating figures from the dark background, cinematic 1940s film noir atmosphere with vintage pinstripe fashion mixed with glowing green retro computer terminals and cables, playful and comedic tone --ar 2:3 --v 7 --no text, letters, words, numbers, logo, watermark, signature
```

### M02 — Avukat "Boşluk" Kemal (Çarpık Avukat)

- **Portre dosyası:** `karakter-kemal.png`
- **Özet:** Her yasada bir boşluk bulduğuna inanan avukat. Müvekkillerine "izin mi? Sonra hallederiz" diye öğüt verir.
- **Temsil ettiği tehdit:** İzinsiz "test", kapsam dışına çıkmak, "sadece baktım" bahaneleri
- **Fiziksel yapı:** 50'lerinde, tombul gövde, kısa kalın bacaklar; 4.5 kafa boyu.
- **Yüz ve ifade:** Yuvarlak tel gözlük, geriye taranmış seyrek saç, gıdı, kurnaz yan gülümseme, kalkık tek kaş.
- **Poz ve silüet:** Bir elinde dev evrak çantası, diğer elinde yere kadar açılan uzun bir sözleşme rulosu, gövdeden açık tutuyor.
- **Kıyafet ve aksesuar:** Üç parça kahverengi takım, köstekli cep saati, papyon; sözleşmenin altında parlayan minicik dipnot çizgileri.
- **İmza detay:** Yere kadar uzanan sözleşme rulosu.
- **Renk paleti:** takim `#5A4A42` · golge `#3B302B` · papyon `#6E1E1E` · gozluk `#C9953B` · ten `#DDA585`

- **Hikâyedeki yeri:** Ailenin avukatı; herkesin sırrını bilir. Gizlice Mine'ye çalışır.

**Portre promptu (Midjourney):**

```text
Full-body character design portrait of Avukat Bosluk Kemal, a crooked portly lawyer in his 50s with round wire-rimmed glasses, thinning slicked-back hair, a double chin and one sly raised eyebrow with a cunning sideways smile, short stocky legs, wearing a three-piece brown suit with a pocket-watch chain and a burgundy bow tie, one hand gripping an oversized leather briefcase and the other holding a very long contract scroll unrolling to the floor, its tiny fine print glowing faintly (abstract lines only). Three-quarter view, the entire figure visible, plain dark smoky background under a single soft spotlight, character sheet clarity. stylized 2D cartoon illustration in a film noir comic look, semi-cartoon proportions about 5 heads tall, clear readable silhouette with arms and props held away from the body, bold confident outer ink contours with tapered thinner interior lines, line art tinted in dark local colors (deep brown, burgundy, ink-navy) instead of pure black, warm worn-out desaturated vintage palette, high-contrast hard cel-shaded shadows combined with soft airbrushed volumes, subtle cyan-green tint in the shadows and warm amber-sepia highlights, thin soft rim light separating figures from the dark background, cinematic 1940s film noir atmosphere with vintage pinstripe fashion mixed with glowing green retro computer terminals and cables, playful and comedic tone --ar 2:3 --v 7 --no text, letters, words, numbers, logo, watermark, signature
```

### M03 — Anahtarcı Rıza (Çilingir)

- **Portre dosyası:** `karakter-riza.png`
- **Özet:** "Bir kapı açılmadıysa, anahtarı yanlış seçmişsindir." Her sistemde ana anahtarın peşinde, bulunca da asla gitmeyen çilingir.
- **Temsil ettiği tehdit:** Yönetici yetkisi ele geçirme, başlangıca saklanma (kalıcılık), sahte dosya uzantıları
- **Fiziksel yapı:** 40'larında, çok uzun ve sırık gibi ince, omuzları düşük; 5.5 kafa boyu.
- **Yüz ve ifade:** Kasket altında çökük yanaklar, üç günlük sakal, tek gözü kısık sinsi bakış, uzun kemikli burun.
- **Poz ve silüet:** Hafif kamburlu yan dönük duruş; bir eliyle parlayan altın ana anahtarı havaya kaldırmış, diğeri kalçadaki dev anahtarlığı tutuyor.
- **Kıyafet ve aksesuar:** Uzun gri trençkot, kasket, parmaksız eldivenler, belinde yüzlerce anahtarlı halka ve maymuncuk seti.
- **İmza detay:** Parlayan altın ana anahtar.
- **Renk paleti:** trenckot `#4A4743` · kasket `#2B2623` · anahtar `#C9953B` · eldiven `#3B302B` · ten `#CFA083`

- **Hikâyedeki yeri:** Kadir'le aynı koğuşta yatmış eski çilingir. Kapıları o açar.

**Portre promptu (Midjourney):**

```text
Full-body character design portrait of Anahtarci Riza, a gaunt very tall locksmith in his 40s with sunken cheeks, three-day stubble, a long bony nose and one squinting sly eye under a flat cap, slightly hunched sideways stance, wearing a long gray trench coat and fingerless gloves, an enormous ring with hundreds of keys and lockpicks hanging from his hip, one arm raised high away from his body holding a single glowing golden master key. Three-quarter view, the entire figure visible, plain dark smoky background under a single soft spotlight, character sheet clarity. stylized 2D cartoon illustration in a film noir comic look, semi-cartoon proportions about 5 heads tall, clear readable silhouette with arms and props held away from the body, bold confident outer ink contours with tapered thinner interior lines, line art tinted in dark local colors (deep brown, burgundy, ink-navy) instead of pure black, warm worn-out desaturated vintage palette, high-contrast hard cel-shaded shadows combined with soft airbrushed volumes, subtle cyan-green tint in the shadows and warm amber-sepia highlights, thin soft rim light separating figures from the dark background, cinematic 1940s film noir atmosphere with vintage pinstripe fashion mixed with glowing green retro computer terminals and cables, playful and comedic tone --ar 2:3 --v 7 --no text, letters, words, numbers, logo, watermark, signature
```

### M04 — Süper Kullanıcı Sadri (Root Babası)

- **Portre dosyası:** `karakter-sadri.png`
- **Özet:** Sunucuların tahtında oturan yaşlı baba. Herkese "bu komutu bir çalıştır, gerisini dert etme" der.
- **Temsil ettiği tehdit:** sudo yetkisini kötüye kullanmak, chmod 777, okunmadan çalıştırılan komutlar
- **Fiziksel yapı:** 60'larında, iri ve ağır, tahtta oturuyor; ayakta 4.5 kafa boyu.
- **Yüz ve ifade:** Kel kafa, gür beyaz pala bıyık, sağ gözünde yeşil parlayan monokl, ağır göz kapakları, buyurgan ifade.
- **Poz ve silüet:** Sunucu kabinlerinden yapılmış tahtta yayılarak oturur; bir elinde yeşil terminal tableti uzatmış, diğer elinin parmakları yüzüklü.
- **Kıyafet ve aksesuar:** Siyah balıkçı yaka üzerine bordo kadife smokin ceket, kalın altın yüzükler; tahtta yanıp sönen yeşil ışıklar.
- **İmza detay:** Yeşil parlayan monokl ve sunucu tahtı.
- **Renk paleti:** ceket `#5A1C22` · balikci `#1B1A1A` · monokl `#5FD3A7` · yuzuk `#C9953B` · ten `#D29A79`

- **Hikâyedeki yeri:** Ailenin en yaşlısı. Yirmi yıl önce genç Eren'e ilk terminalini o açtı.

**Portre promptu (Midjourney):**

```text
Full-body character design portrait of Super Kullanici Sadri, a heavyset bald old system boss in his 60s with a bushy white handlebar mustache, heavy eyelids, a commanding expression and a glowing green monocle over his right eye, wearing a black turtleneck under a burgundy velvet smoking jacket and thick gold rings, sprawled on a throne built from server racks with blinking green lights, one arm extended away from his body holding out a glowing green terminal tablet. Three-quarter view, the entire figure visible, plain dark smoky background under a single soft spotlight, character sheet clarity. stylized 2D cartoon illustration in a film noir comic look, semi-cartoon proportions about 5 heads tall, clear readable silhouette with arms and props held away from the body, bold confident outer ink contours with tapered thinner interior lines, line art tinted in dark local colors (deep brown, burgundy, ink-navy) instead of pure black, warm worn-out desaturated vintage palette, high-contrast hard cel-shaded shadows combined with soft airbrushed volumes, subtle cyan-green tint in the shadows and warm amber-sepia highlights, thin soft rim light separating figures from the dark background, cinematic 1940s film noir atmosphere with vintage pinstripe fashion mixed with glowing green retro computer terminals and cables, playful and comedic tone --ar 2:3 --v 7 --no text, letters, words, numbers, logo, watermark, signature
```

### M05 — Dinleyici Nuri (Dinleyici)

- **Portre dosyası:** `karakter-nuri.png`
- **Özet:** Kafe Wi-Fi'sinin en sessiz müşterisi. Kimse ona dikkat etmez; o ise herkesin paketini dinler.
- **Temsil ettiği tehdit:** Ortak Wi-Fi'de trafik dinleme, ARP/DNS sahteciliği, ortadaki adam
- **Fiziksel yapı:** 30'larında, çok kısa ve sırım gibi, gergin; 4.5 kafa boyu.
- **Yüz ve ifade:** Kocaman yastıklı kulaklık, fal taşı gibi açık sinirli gözler, sivri burun, ince bıyık.
- **Poz ve silüet:** Bacaklar açık, sinsi çömelmiş duruş; bir koluyla parabolik dinleme çanağını gövdeden uzağa tutuyor, diğer elini kulaklığa bastırmış.
- **Kıyafet ve aksesuar:** Üstüne büyük gelen bej trençkot — içi kablolar, küçük telsizler ve antenlerle dolu; antenli fötr şapka.
- **İmza detay:** Kablo dolu trençkot astarı ve parabolik çanak.
- **Renk paleti:** trenckot `#A08B6B` · astar `#2E3A36` · kablo `#5FD3A7` · sapka `#3B302B` · ten `#D9A07F`

- **Hikâyedeki yeri:** Celal'in kuzeni. Fırının Wi-Fi'ını dinleyen kulak.

**Portre promptu (Midjourney):**

```text
Full-body character design portrait of Dinleyici Nuri, a very short wiry nervous listener in his 30s with huge padded headphones, wide twitchy eyes, a pointed nose and a thin mustache, crouching with legs apart, wearing an oversized beige trench coat held open to reveal a lining stuffed with tangled glowing green cables, tiny radios and antennas, a fedora with a small antenna, one arm extended away from his body holding a parabolic listening dish, the other hand pressed to his headphones. Three-quarter view, the entire figure visible, plain dark smoky background under a single soft spotlight, character sheet clarity. stylized 2D cartoon illustration in a film noir comic look, semi-cartoon proportions about 5 heads tall, clear readable silhouette with arms and props held away from the body, bold confident outer ink contours with tapered thinner interior lines, line art tinted in dark local colors (deep brown, burgundy, ink-navy) instead of pure black, warm worn-out desaturated vintage palette, high-contrast hard cel-shaded shadows combined with soft airbrushed volumes, subtle cyan-green tint in the shadows and warm amber-sepia highlights, thin soft rim light separating figures from the dark background, cinematic 1940s film noir atmosphere with vintage pinstripe fashion mixed with glowing green retro computer terminals and cables, playful and comedic tone --ar 2:3 --v 7 --no text, letters, words, numbers, logo, watermark, signature
```

### M06 — Çerezci Celal (Oturum Hırsızı)

- **Portre dosyası:** `karakter-celal.png`
- **Özet:** "Fırıncı" lakaplı oturum hırsızı. Çaldığı her çerezle başkası olarak sisteme girer; tarifini kimseye vermez.
- **Temsil ettiği tehdit:** Oturum çerezi çalma, yetki kontrolü eksik API'ler (IDOR), sahte alan adları
- **Fiziksel yapı:** 40'larında, iri göbekli, geniş omuzlu, neşeli ama tehlikeli; 5 kafa boyu.
- **Yüz ve ifade:** Kalın siyah bıyık, kırmızı yanaklar, yamuk şef şapkası altında göz kırpan bakış, sırıtış.
- **Poz ve silüet:** Bir elinde parlayan çerezlerle dolu tepsiyi gövdeden uzak tutuyor, diğer elinde merdane omzuna dayalı.
- **Kıyafet ve aksesuar:** Koyu çizgili takımın üstüne beyaz fırıncı önlüğü, yamuk şef şapkası, unlu parmaklar; çerezlerin üstünde anahtar deseni.
- **İmza detay:** Parlayan anahtar desenli çerez tepsisi.
- **Renk paleti:** takim `#2C2623` · onluk `#E6DDD3` · cerez `#C9953B` · yanak `#C0584A` · ten `#DBA07C`

- **Hikâyedeki yeri:** Kampüs yanındaki fırın-kafenin sahibi; ailenin buluşma noktası onun arka odası.

**Portre promptu (Midjourney):**

```text
Full-body character design portrait of Cerezci Celal, a burly big-bellied cheerful but sly baker in his 40s with a thick black mustache, rosy cheeks and a winking grin under a tilted chef hat, wearing a white baker apron over a dark pinstripe suit, flour-dusted fingers, one arm held away from his body balancing a tray of glowing cookies each stamped with a small key pattern, the other hand resting a rolling pin on his shoulder like a club. Three-quarter view, the entire figure visible, plain dark smoky background under a single soft spotlight, character sheet clarity. stylized 2D cartoon illustration in a film noir comic look, semi-cartoon proportions about 5 heads tall, clear readable silhouette with arms and props held away from the body, bold confident outer ink contours with tapered thinner interior lines, line art tinted in dark local colors (deep brown, burgundy, ink-navy) instead of pure black, warm worn-out desaturated vintage palette, high-contrast hard cel-shaded shadows combined with soft airbrushed volumes, subtle cyan-green tint in the shadows and warm amber-sepia highlights, thin soft rim light separating figures from the dark background, cinematic 1940s film noir atmosphere with vintage pinstripe fashion mixed with glowing green retro computer terminals and cables, playful and comedic tone --ar 2:3 --v 7 --no text, letters, words, numbers, logo, watermark, signature
```

### M07 — Kuklacı Orhan (Bot Ustası)

- **Portre dosyası:** `karakter-orhan.png`
- **Özet:** Binlerce küçük botu iplerle yöneten kuklacı. Kodunda açık bırakılan her satırı kendi ipine bağlar.
- **Temsil ettiği tehdit:** Botnet'ler, kötü niyetli script'ler, koda gömülü anahtarlar, eval/komut enjeksiyonu
- **Fiziksel yapı:** 50'lerinde, uzun ve ince, uzun parmaklı, teatral; 5.5 kafa boyu.
- **Yüz ve ifade:** Geriye taranmış gümüş saç, sivri keçi sakalı, ince kaşlar, teatral sinsi gülümseme.
- **Poz ve silüet:** Kollar iki yana açık, uzun parmaklarından yeşil parlayan kukla ipleri aşağıdaki küçük robot sürüsüne iniyor.
- **Kıyafet ve aksesuar:** Siyah kapüşonlu üst üzerine uzun frak, kırmızı astar; manşetlerde küçük devre kartı düğmeler.
- **İmza detay:** Yeşil parlayan kukla ipleri ve robot sürüsü.
- **Renk paleti:** frak `#1E1B1A` · astar `#8F1D24` · ip `#5FD3A7` · sac `#B9B4AE` · ten `#D6A182`

- **Hikâyedeki yeri:** Jasmine'in çırağı. Bot ordusunu onun verdiği kodla kurdu.

**Portre promptu (Midjourney):**

```text
Full-body character design portrait of Kuklaci Orhan, a tall thin theatrical puppeteer in his 50s with slicked-back silver hair, a pointed goatee, thin eyebrows and a sly showman grin, wearing a black hoodie under a long tailcoat with a red lining and circuit-board cufflinks, both arms spread wide away from his body, glowing green marionette strings descending from his long fingers to a swarm of tiny boxy robots below. Three-quarter view, the entire figure visible, plain dark smoky background under a single soft spotlight, character sheet clarity. stylized 2D cartoon illustration in a film noir comic look, semi-cartoon proportions about 5 heads tall, clear readable silhouette with arms and props held away from the body, bold confident outer ink contours with tapered thinner interior lines, line art tinted in dark local colors (deep brown, burgundy, ink-navy) instead of pure black, warm worn-out desaturated vintage palette, high-contrast hard cel-shaded shadows combined with soft airbrushed volumes, subtle cyan-green tint in the shadows and warm amber-sepia highlights, thin soft rim light separating figures from the dark background, cinematic 1940s film noir atmosphere with vintage pinstripe fashion mixed with glowing green retro computer terminals and cables, playful and comedic tone --ar 2:3 --v 7 --no text, letters, words, numbers, logo, watermark, signature
```

### M08 — Kasa Kıran Kadir (Kasa Hırsızı)

- **Portre dosyası:** `karakter-kadir.png`
- **Özet:** Eski usul kasa hırsızı, yeni usul parola kırıcı. Gökkuşağı renkli defterinde milyonlarca hazır şifre özeti taşır.
- **Temsil ettiği tehdit:** Parola kırma, zayıf hash'ler, tuzsuz parolalar, sızmış parola listeleri
- **Fiziksel yapı:** 60'larında, kısa ve kompakt kaslı; 4.5 kafa boyu.
- **Yüz ve ifade:** Siyah örgü bere, alnında saatçi büyüteci, kalın gri kaşlar, odaklanmış kısık gözler, kırçıl sakal.
- **Poz ve silüet:** Dizleri kırık, öne eğilmiş; stetoskopu parlayan bir kasaya dayamış, diğer elinde gökkuşağı renkli defteri gövdeden ayrı tutuyor.
- **Kıyafet ve aksesuar:** Çizgili hırsız kazağı, askılar, koyu kumaş pantolon; arka cebinde renkli defter.
- **İmza detay:** Stetoskop ve gökkuşağı defteri.
- **Renk paleti:** kazak `#3B302B` · cizgi `#D8CBB8` · bere `#1B1A1A` · defter `#C9953B` · ten `#D0957A`

- **Hikâyedeki yeri:** Rıza'nın koğuş arkadaşı. Kasaları — artık parolaları — o açar.

**Portre promptu (Midjourney):**

```text
Full-body character design portrait of Kasa Kiran Kadir, a short compact muscular old vault mechanic in his 60s with a black knit beanie, a jeweler's loupe pushed up on his forehead, thick gray eyebrows, focused squinting eyes and a grizzled beard, wearing a striped knit sweater with suspenders, crouched forward with knees bent, carefully listening with a stethoscope to the dial of a glowing antique safe like a master watchmaker, the other arm held away from his body holding a rainbow-colored notebook. Three-quarter view, the entire figure visible, plain dark smoky background under a single soft spotlight, character sheet clarity. stylized 2D cartoon illustration in a film noir comic look, semi-cartoon proportions about 5 heads tall, clear readable silhouette with arms and props held away from the body, bold confident outer ink contours with tapered thinner interior lines, line art tinted in dark local colors (deep brown, burgundy, ink-navy) instead of pure black, warm worn-out desaturated vintage palette, high-contrast hard cel-shaded shadows combined with soft airbrushed volumes, subtle cyan-green tint in the shadows and warm amber-sepia highlights, thin soft rim light separating figures from the dark background, cinematic 1940s film noir atmosphere with vintage pinstripe fashion mixed with glowing green retro computer terminals and cables, playful and comedic tone --ar 2:3 --v 7 --no text, letters, words, numbers, logo, watermark, signature
```

### M09 — Maskeli Mine (Bilgi Tüccarı)

- **Portre dosyası:** `karakter-mine.png`
- **Özet:** Herkesin hakkında bir dosyası olan bilgi tüccarı. Her ilan için yeni bir yüz, her hedef için yeni bir maske takar.
- **Temsil ettiği tehdit:** Kişisel bilgi toplama (doxxing), sahte profiller, sahte ilanlar
- **Fiziksel yapı:** 30'larında, uzun boylu ve zarif, dik duruşlu; 5.5 kafa boyu. Cinselleştirilmemiş, soğuk ve kontrollü.
- **Yüz ve ifade:** Keskin kesim koyu küt saç, çıkık elmacık kemikleri, buz gibi hesapçı bakış, ince ölçülü gülümseme.
- **Poz ve silüet:** 3/4 cephe; bir elinde yelpaze gibi açılmış birkaç porselen maske (her biri farklı kurgusal yüz), diğer eli dürbünü tutuyor.
- **Kıyafet ve aksesuar:** Yakası kalkık bordo trençkot, siyah deri eldivenler, boynunda dürbün; cebinden fotoğraf köşeleri taşıyor.
- **İmza detay:** Yelpaze gibi açılmış maskeler.
- **Renk paleti:** trenckot `#4A252B` · golge `#2E161A` · eldiven `#1B1A1A` · maske `#E6DDD3` · ten `#DFAA8B`

- **Hikâyedeki yeri:** Don'un kızı. Babasının tahtına göz dikmiş; Baron'u kimsenin görmemesini fırsat sayıyor.

**Portre promptu (Midjourney):**

```text
Full-body character design portrait of Maskeli Mine, a tall elegant information broker woman in her 30s, non-sexualized and composed, with a sharp dark bob haircut, high cheekbones, an ice-cold calculating gaze and a thin measured smile, wearing a burgundy trench coat with the collar turned up and black leather gloves, binoculars around her neck, in a 3/4 pose holding a fan of several porcelain masks with different fictional faces away from her body. Three-quarter view, the entire figure visible, plain dark smoky background under a single soft spotlight, character sheet clarity. stylized 2D cartoon illustration in a film noir comic look, semi-cartoon proportions about 5 heads tall, clear readable silhouette with arms and props held away from the body, bold confident outer ink contours with tapered thinner interior lines, line art tinted in dark local colors (deep brown, burgundy, ink-navy) instead of pure black, warm worn-out desaturated vintage palette, high-contrast hard cel-shaded shadows combined with soft airbrushed volumes, subtle cyan-green tint in the shadows and warm amber-sepia highlights, thin soft rim light separating figures from the dark background, cinematic 1940s film noir atmosphere with vintage pinstripe fashion mixed with glowing green retro computer terminals and cables, playful and comedic tone --ar 2:3 --v 7 --no text, letters, words, numbers, logo, watermark, signature
```

### M10 — Fidyeci Ferhat (Fidye Patronu)

- **Portre dosyası:** `karakter-ferhat.png`
- **Özet:** Ailenin kas gücü ve en korkulan tahsildarı. Dosyaları zincire vurur, anahtarı en yüksek fiyatı verene satar.
- **Temsil ettiği tehdit:** Fidye yazılımı, zararlı yazılım, saldırı zinciri (kill chain), DDoS
- **Fiziksel yapı:** 40'larında, ailenin en iri adamı; devasa ters üçgen gövde, kalın boyun; 5 kafa boyu.
- **Yüz ve ifade:** Kazınmış kafa, kaşının üstünden geçen yara izi, köşeli çene, çatık kaşlar, soğuk tehditkâr bakış.
- **Poz ve silüet:** Bacaklar omuz genişliğinde, yıkılmaz duvar duruşu; bir elinde içinden zincirli dosya simgeleri taşan evrak çantası, diğer eli yumruk.
- **Kıyafet ve aksesuar:** Koyu gömlek üstüne siyah deri palto, omuzlarına asılı asma kilitli ağır zincirler.
- **İmza detay:** Asma kilitli zincirler.
- **Renk paleti:** palto `#1F1C1A` · gomlek `#33362F` · zincir `#8A8F94` · kilit `#C9953B` · ten `#D99B78` · yara `#9E4F42`

- **Hikâyedeki yeri:** Don'un sağ kolu. Sadakati Baron'a değil, Don'a.

**Portre promptu (Midjourney):**

```text
Full-body character design portrait of Fidyeci Ferhat, a massive broad-shouldered bodyguard in his 40s with a huge inverted-triangle torso, a thick neck, a shaved head, a scar across one eyebrow, a square jaw and a cold intimidating scowl, wearing a black leather coat over a dark shirt with heavy chains and padlocks draped over his shoulders, wide immovable stance, one arm held away from his body gripping a briefcase spilling glowing chained file icons, the other hand clenched into a fist. Three-quarter view, the entire figure visible, plain dark smoky background under a single soft spotlight, character sheet clarity. stylized 2D cartoon illustration in a film noir comic look, semi-cartoon proportions about 5 heads tall, clear readable silhouette with arms and props held away from the body, bold confident outer ink contours with tapered thinner interior lines, line art tinted in dark local colors (deep brown, burgundy, ink-navy) instead of pure black, warm worn-out desaturated vintage palette, high-contrast hard cel-shaded shadows combined with soft airbrushed volumes, subtle cyan-green tint in the shadows and warm amber-sepia highlights, thin soft rim light separating figures from the dark background, cinematic 1940s film noir atmosphere with vintage pinstripe fashion mixed with glowing green retro computer terminals and cables, playful and comedic tone --ar 2:3 --v 7 --no text, letters, words, numbers, logo, watermark, signature
```

### M11 — Don Gölge (Ailenin Başı)

- **Portre dosyası:** `karakter-don.png`
- **Özet:** Gölge Ağ Ailesi'nin başı. Çok az konuşur; tek kaşını kaldırması yeter. Mini CTF'te karşına çıkan son dosya.
- **Temsil ettiği tehdit:** Final — tüm tekniklerin birleştiği mini CTF
- **Fiziksel yapı:** 50'lerinin sonunda, dik ve uzun bacaklı, ince belli zarif ama ağırbaşlı silüet; 5.5 kafa boyu.
- **Yüz ve ifade:** Şakakları gümüşlenmiş geriye taranmış koyu saç, ince bıyık, kemerli burun, yarı kısık sakin delici gözler, otoriter biçimde kalkık tek kaş.
- **Poz ve silüet:** Hafif açılı cepheden, rahat ama güç yayan merkez duruşu; bir eli cebinde, diğer elinde dumanı tüten puro gövdeden ayrık.
- **Kıyafet ve aksesuar:** Kruvaze koyu antrasit çizgili takım, beyaz gömlek, koyu bordo kravat, cep mendili, rugan ayakkabı; arkasında soluk yeşil kod yağmuru.
- **İmza detay:** Kalkık tek kaş ve puro.
- **Renk paleti:** takim `#2C2623` · golge `#1B2220` · kravat `#6E1E1E` · gomlek `#E6DDD3` · ten `#D89E7A` · ten_golge `#9E6347`

- **Hikâyedeki yeri:** Liman'ın eski kaçakçılık ailesinin reisi. Ailesini dijitale Baron'un parasıyla taşıdı; kendini patron sanıyor.

**Portre promptu (Midjourney):**

```text
Full-body character design portrait of Don Golge, the head of the family, an elegant family patriarch in his late 50s with slick dark hair graying at the temples, a thin mustache, an aquiline nose, calm piercing half-closed eyes and one eyebrow raised authoritatively, tall upright silhouette with long legs and a slim waist, wearing a double-breasted dark charcoal pinstripe suit, white shirt, deep burgundy tie, pocket square and polished shoes, one hand in his pocket and the other held slightly away from his body holding a smoking cigar, faint glowing green code drifting in the darkness behind him. Three-quarter view, the entire figure visible, plain dark smoky background under a single soft spotlight, character sheet clarity. stylized 2D cartoon illustration in a film noir comic look, semi-cartoon proportions about 5 heads tall, clear readable silhouette with arms and props held away from the body, bold confident outer ink contours with tapered thinner interior lines, line art tinted in dark local colors (deep brown, burgundy, ink-navy) instead of pure black, warm worn-out desaturated vintage palette, high-contrast hard cel-shaded shadows combined with soft airbrushed volumes, subtle cyan-green tint in the shadows and warm amber-sepia highlights, thin soft rim light separating figures from the dark background, cinematic 1940s film noir atmosphere with vintage pinstripe fashion mixed with glowing green retro computer terminals and cables, playful and comedic tone --ar 2:3 --v 7 --no text, letters, words, numbers, logo, watermark, signature
```

### Yol A — Tek Tırnak Jasmine (Veritabanı Kraliçesi)

- **Portre dosyası:** `karakter-jasmine.png`
- **Özet:** Tek bir tırnak işaretiyle veritabanlarının bütün çekmecelerini açan kadın. Baron'un güvendiği tek kişi; yüzünü gören az, adını anan daha az.
- **Temsil ettiği tehdit:** SQL enjeksiyonu, veritabanı sızıntıları, girdiyi doğrulamayan formlar
- **Fiziksel yapı:** 30'larının sonunda, uzun boylu, dimdik ve sakin; 5.5 kafa boyu.
- **Yüz ve ifade:** Yüksek atkuyruğu toplanmış uzun dalgalı koyu saç, saçında beyaz bir yasemin çiçeği, yeşil çizgiler yansıtan kedi gözü gözlük, tehlikeli yarım gülümseme.
- **Poz ve silüet:** 3/4 cephe; bir elinde gövdeden uzak tuttuğu dev antika dolma kalem, diğer eli kendiliğinden açılan kart katalog dolabının üstünde.
- **Kıyafet ve aksesuar:** Zümrüt yeşili, iyi kesilmiş pantolonlu takım; yüksek yakalı krem bluz; kesme işareti biçiminde parlayan küçük yeşil küpe. Cinselleştirilmez.
- **İmza detay:** Yasemin çiçeği ve kalemin ucundan damlayan parlayan yeşil damla.
- **Renk paleti:** takim `#1F5A45` · bluz `#E6DDD3` · sac `#1E1614` · cicek `#F3EEDF` · isik `#5FD3A7` · ten `#C98E6C`

- **Hikâyedeki yeri:** Kapüşonlular'ın üçüncüsü; o gece Eren'in yanında kaldı. Baron'un sağ eli, Kuklacı Orhan'ın ustası.

**Portre promptu (Midjourney):**

```text
Full-body character design portrait of Tek Tirnak Jasmine, the queen of databases, an elegant composed woman in her late 30s with long dark wavy hair tied in a high ponytail fastened with a white jasmine flower, sharp cat-eye glasses reflecting faint green glowing lines, a calm dangerous half-smile, tall upright posture, wearing a modest tailored emerald-green trouser suit with a high-collared cream blouse and a small glowing green apostrophe-shaped earring, one arm held away from her body holding an oversized antique fountain pen whose nib drips a single glowing green droplet, her other hand resting on a tall vintage wooden card-catalogue cabinet whose many small drawers slide open by themselves. Three-quarter view, the entire figure visible, plain dark smoky background under a single soft spotlight, character sheet clarity. stylized 2D cartoon illustration in a film noir comic look, semi-cartoon proportions about 5 heads tall, clear readable silhouette with arms and props held away from the body, bold confident outer ink contours with tapered thinner interior lines, line art tinted in dark local colors (deep brown, burgundy, ink-navy) instead of pure black, warm worn-out desaturated vintage palette, high-contrast hard cel-shaded shadows combined with soft airbrushed volumes, subtle cyan-green tint in the shadows and warm amber-sepia highlights, thin soft rim light separating figures from the dark background, cinematic 1940s film noir atmosphere with vintage pinstripe fashion mixed with glowing green retro computer terminals and cables, playful and comedic tone --ar 2:3 --v 7 --no text, letters, words, numbers, logo, watermark, signature
```

### Baron — Baron Eren (Ailenin En Büyüğü)

- **Portre dosyası:** `karakter-eren.png`
- **Özet:** Don Gölge dahil herkesin borçlu olduğu, yüzünü kimsenin görmediği adam. Yirmi yıl önce kapüşonlu bir gençti; bir gece doğru kapı yerine açık kapıyı seçti.
- **Temsil ettiği tehdit:** Hepsi — gelmiş geçmiş en iyi hacker; Gölge Ağ'ın kurucusu ve görünmez beyni
- **Fiziksel yapı:** 40'larının başında, uzun ve ince, kusursuz dik duruş; 5.5 kafa boyu.
- **Yüz ve ifade:** Geriye taranmış siyah saçta önden tek bir gümüş tutam, kısa düzgün siyah sakal, sakin keskin koyu gözler, her şeyi önceden bilmiş gibi hafif gülümseme.
- **Poz ve silüet:** Hafif açılı cepheden, kıpırtısız; bir elinde gövdeden uzak tuttuğu açık altın cep saati, diğer eli arkada.
- **Kıyafet ve aksesuar:** Siyah üç parça takım, koyu mürdüm ipek yelek; ceketin altında siyah kapüşonlu — kapüşon omuzlarında (geçmişinin imzası); küçük anahtar biçimli altın mühür yüzük.
- **İmza detay:** Takımın altındaki kapüşon ve kadranı yeşil terminal olan cep saati.
- **Renk paleti:** takim `#141213` · yelek `#3B1E33` · kapuson `#232022` · altin `#C9953B` · isik `#5FD3A7` · ten `#D3A07F`

- **Hikâyedeki yeri:** Gölge Ağ'ın kurucusu. Selim Hoca'nın yirmi yıl önceki en yakın arkadaşı. Don dahil herkes ona borçlu.

**Portre promptu (Midjourney):**

```text
Full-body character design portrait of Baron Eren, the legendary mastermind and greatest hacker of all time, a tall lean man in his early 40s with slicked-back black hair marked by a single silver streak at the front, a neatly trimmed short black beard, calm sharp dark eyes and a faint knowing smile, perfectly still upright posture, wearing a black three-piece suit with a deep plum silk vest and a black hoodie worn underneath the suit jacket with the hood resting on his shoulders, a small gold signet ring shaped like a key, one arm held away from his body holding an open antique gold pocket watch whose face is a tiny glowing green terminal screen, faint glowing green light particles drifting around him. Three-quarter view, the entire figure visible, plain dark smoky background under a single soft spotlight, character sheet clarity. stylized 2D cartoon illustration in a film noir comic look, semi-cartoon proportions about 5 heads tall, clear readable silhouette with arms and props held away from the body, bold confident outer ink contours with tapered thinner interior lines, line art tinted in dark local colors (deep brown, burgundy, ink-navy) instead of pure black, warm worn-out desaturated vintage palette, high-contrast hard cel-shaded shadows combined with soft airbrushed volumes, subtle cyan-green tint in the shadows and warm amber-sepia highlights, thin soft rim light separating figures from the dark background, cinematic 1940s film noir atmosphere with vintage pinstripe fashion mixed with glowing green retro computer terminals and cables, playful and comedic tone --ar 2:3 --v 7 --no text, letters, words, numbers, logo, watermark, signature
```

### Geçmiş — Kapüşon (genç Eren) (Baron'un geçmişi)

- **Portre dosyası:** `karakter-eren-genc.png`
- **Özet:** Yirmi yıl önce bir üniversitenin bodrum laboratuvarında yaşayan dâhi bir genç. Kendine Kapüşon diyordu; Selim ve Jasmine en yakın iki arkadaşıydı.
- **Temsil ettiği tehdit:** Yirmi yıl önceki ilk büyük sızma — hikâyenin başladığı gece
- **Fiziksel yapı:** 20 yaşında, zayıf ve ince uzun; omuzlar hafif çökük; 5 kafa boyu.
- **Yüz ve ifade:** Başa geçirilmiş kapüşonun altından görünen tek gümüş saç tutamı, laptop ışığıyla yarı aydınlanmış yüz, keskin koyu gözler, meydan okuyan sırıtış.
- **Poz ve silüet:** Bodrum zemininde bağdaş kurmuş, laptop dizlerinde; bir eli klavyede, diğeri gövdeden açık havada parmak şıklatıyor.
- **Kıyafet ve aksesuar:** Bol kömür grisi kapüşonlu, eskimiş kot, parmaksız eldiven; boynunda zincire takılı küçük altın anahtar (ileride yüzüğü olacak).
- **İmza detay:** Kapüşon altından görünen gümüş tutam ve boynundaki altın anahtar.
- **Renk paleti:** kapuson `#3A3836` · kot `#3D4A5A` · eldiven `#1E1C1B` · anahtar `#C9953B` · isik `#5FD3A7` · ten `#D3A07F`

- **Hikâyedeki yeri:** Kapüşonlular üçlüsünün lideri — Eren, Selim ve Jasmine.

**Portre promptu (Midjourney):**

```text
Full-body character design portrait of young Eren twenty years ago, a slim 20-year-old prodigy hacker with the hood of an oversized charcoal hoodie pulled up, a single silver streak of hair visible under the hood, his face half-lit by green laptop glow, sharp dark eyes and a defiant grin, worn jeans, fingerless gloves and a small gold key hanging on a chain around his neck, sitting cross-legged on a basement floor among tangled cables and empty cans with a battered laptop covered in stickers of simple abstract shapes, one hand on the keyboard and the other raised away from his body snapping his fingers. Three-quarter view, the entire figure visible, plain dark smoky background under a single soft spotlight, character sheet clarity. stylized 2D cartoon illustration in a film noir comic look, semi-cartoon proportions about 5 heads tall, clear readable silhouette with arms and props held away from the body, bold confident outer ink contours with tapered thinner interior lines, line art tinted in dark local colors (deep brown, burgundy, ink-navy) instead of pure black, warm worn-out desaturated vintage palette, high-contrast hard cel-shaded shadows combined with soft airbrushed volumes, subtle cyan-green tint in the shadows and warm amber-sepia highlights, thin soft rim light separating figures from the dark background, cinematic 1940s film noir atmosphere with vintage pinstripe fashion mixed with glowing green retro computer terminals and cables, playful and comedic tone --ar 2:3 --v 7 --no text, letters, words, numbers, logo, watermark, signature
```

### Yol B — Tünelci Tarık (Ağın Hayaleti)

- **Portre dosyası:** `karakter-tarik.png`
- **Özet:** Dördüncü Kapüşonlu. Ağı o kurardı; o gece Eren'in açtığı kapının suçu ona kaldı ve on yıl yattı. Şimdi duvarların arasından geçen bir hayalet.
- **Temsil ettiği tehdit:** Ağda yatay hareket, segmentasyon boşlukları, sahte erişim noktaları, tünelleme, zayıf sunucu yapılandırması
- **Fiziksel yapı:** 40'larının ortasında, uzun, kuru ve sırım gibi; hafif kambur tünelci duruşu; 5 kafa boyu.
- **Yüz ve ifade:** Yanları kazınmış kısa koyu saç, kirli sakal, çökük yanaklar, yorgun ama keskin gözler, nadiren gülümseyen ince dudaklar.
- **Poz ve silüet:** Yarım çömelmiş, bir dizi yerde; bir elinde gövdeden uzak tuttuğu parlayan fiber optik kablo kangalı, diğer elinde kablo pensesi.
- **Kıyafet ve aksesuar:** Soluk kapüşonlunun üstüne eskimiş koyu haki uzun parka, başında yeşil ışıklı madenci feneri, elinin üstünde küçük anahtar dövmesi (koğuş hatırası).
- **İmza detay:** Yeşil madenci feneri ve parlayan fiber kangalı.
- **Renk paleti:** parka `#3E4231` · kapuson `#4A4744` · fener `#5FD3A7` · kablo `#8FF0C8` · ten `#C99A78` · dovme `#2F4A5A`

- **Hikâyedeki yeri:** Dördüncü Kapüşonlu. O gecenin suçu ona kaldı; Rıza ve Kadir'le aynı koğuşta yattı. Baron'a çalışıyor ama ona borçlu değil, kin besliyor.

**Portre promptu (Midjourney):**

```text
Full-body character design portrait of Tunelci Tarik, a lean wiry ghost of the network in his mid 40s with short dark hair shaved at the sides, stubble, hollow cheeks and tired but sharp eyes, a slightly hunched tunneler's posture, wearing a worn long dark khaki parka over a faded hoodie, a miner's headlamp glowing green on his forehead and a small key tattoo on the back of one hand, half crouched with one knee on the ground, one arm held away from his body holding a coil of glowing green fiber-optic cable, the other hand gripping a pair of cable pliers. Three-quarter view, the entire figure visible, plain dark smoky background under a single soft spotlight, character sheet clarity. stylized 2D cartoon illustration in a film noir comic look, semi-cartoon proportions about 5 heads tall, clear readable silhouette with arms and props held away from the body, bold confident outer ink contours with tapered thinner interior lines, line art tinted in dark local colors (deep brown, burgundy, ink-navy) instead of pure black, warm worn-out desaturated vintage palette, high-contrast hard cel-shaded shadows combined with soft airbrushed volumes, subtle cyan-green tint in the shadows and warm amber-sepia highlights, thin soft rim light separating figures from the dark background, cinematic 1940s film noir atmosphere with vintage pinstripe fashion mixed with glowing green retro computer terminals and cables, playful and comedic tone --ar 2:3 --v 7 --no text, letters, words, numbers, logo, watermark, signature
```

### Yol C — Temizlikçi Tamer (İz Silici)

- **Portre dosyası:** `karakter-tamer.png`
- **Özet:** Gölge Ağ'ın her operasyonundan sonra gelir; logları siler, saatleri kaydırır, izleri süpürür. "Burada hiçbir şey olmadı" onun imzasıdır.
- **Temsil ettiği tehdit:** Log silme, iz gizleme (anti-forensics), saldırı sonrası kalıcılık, alarm yorgunluğu
- **Fiziksel yapı:** 50'lerinde, orta boylu, tıknaz ama sessiz adımlı; 5 kafa boyu.
- **Yüz ve ifade:** Kısa kesilmiş kır saç, kalın gri bıyık, ifadesiz sakin yüz, yorgun ama dikkatli gözler.
- **Poz ve silüet:** Bir elinde gövdeden uzak tuttuğu yeşil parlayan paspas, diğer elinde içinde kâğıt şeritlerin eridiği kova.
- **Kıyafet ve aksesuar:** Gri iş tulumu üstüne çizgili yelek, boynunda gevşek kravat, beline asılı anahtar destesi ve küçük el feneri; sarı lastik eldivenler.
- **İmza detay:** Değdiği yerde izleri silen parlayan paspas.
- **Renk paleti:** tulum `#5B5E5A` · yelek `#2F2A27` · eldiven `#C9953B` · isik `#5FD3A7` · ten `#D1A07E`

- **Hikâyedeki yeri:** Ailenin temizlikçisi; her operasyondan sonra izleri o siler. Don'un en eski adamlarından, ama raporunu doğrudan Baron'a verir.

**Portre promptu (Midjourney):**

```text
Full-body character design portrait of Temizlikci Tamer, a quiet stocky cleaner in his 50s with short gray hair, a thick gray mustache and a calm expressionless face with tired attentive eyes, wearing a gray work coverall under a striped vest with a loose tie, yellow rubber gloves, a ring of keys and a small flashlight on his belt, one arm held away from his body holding a mop whose head glows soft green and leaves a perfectly clean trail, the other hand holding a bucket in which paper strips dissolve into green light. Three-quarter view, the entire figure visible, plain dark smoky background under a single soft spotlight, character sheet clarity. stylized 2D cartoon illustration in a film noir comic look, semi-cartoon proportions about 5 heads tall, clear readable silhouette with arms and props held away from the body, bold confident outer ink contours with tapered thinner interior lines, line art tinted in dark local colors (deep brown, burgundy, ink-navy) instead of pure black, warm worn-out desaturated vintage palette, high-contrast hard cel-shaded shadows combined with soft airbrushed volumes, subtle cyan-green tint in the shadows and warm amber-sepia highlights, thin soft rim light separating figures from the dark background, cinematic 1940s film noir atmosphere with vintage pinstripe fashion mixed with glowing green retro computer terminals and cables, playful and comedic tone --ar 2:3 --v 7 --no text, letters, words, numbers, logo, watermark, signature
```

### Yol D — Bayrakçı Bedri (Sahte İzlerin Ustası)

- **Portre dosyası:** `karakter-bedri.png`
- **Özet:** Gölge Ağ'ın saldırılarını başkasının üstüne yıkan adam. Her operasyona başka bir grubun "imzasını" bırakır; analist yanlış kapıyı çalarken aile işini bitirir.
- **Temsil ettiği tehdit:** Sahte bayrak (yanlış atıf), dezenformasyon, sahte tehdit raporları, iz şaşırtma
- **Fiziksel yapı:** 60'larında, uzun boylu, geniş omuzlu eski denizci duruşu; 5.5 kafa boyu.
- **Yüz ve ifade:** Kısa beyaz sakal, rüzgârdan yıpranmış yüz, bir gözü kısık, sinsi yarım gülümseme.
- **Poz ve silüet:** Bir elinde gövdeden uzak tuttuğu, her biri farklı soyut simge taşıyan küçük bayraklardan bir demet; diğer eli arkada.
- **Kıyafet ve aksesuar:** Lacivert kaban, krem boğazlı kazak, koyu kaptan kasketi; kabanın cebinden taşan katlı haritalar ve yazısız kartlar.
- **İmza detay:** Hepsi farklı, hiçbiri gerçek olmayan bayrak demeti.
- **Renk paleti:** kaban `#1E2A3A` · kazak `#E6DDD3` · kasket `#2B2420` · isik `#5FD3A7` · ten `#C68E6A`

- **Hikâyedeki yeri:** Don'un babası zamanından kalma eski bir kaçakçılık kaptanı. Gölge Ağ'ın saldırılarını başkalarının üstüne yıkar.

**Portre promptu (Midjourney):**

```text
Full-body character design portrait of Bayrakci Bedri, a tall broad-shouldered former sailor in his 60s with a short white beard, a weathered face, one eye squinting and a sly half-smile, wearing a navy peacoat over a cream turtleneck and a dark captain's cap, folded maps and blank cards peeking from his coat pocket, one arm held away from his body holding a bundle of small signal flags each showing a different abstract geometric symbol, the other hand behind his back. Three-quarter view, the entire figure visible, plain dark smoky background under a single soft spotlight, character sheet clarity. stylized 2D cartoon illustration in a film noir comic look, semi-cartoon proportions about 5 heads tall, clear readable silhouette with arms and props held away from the body, bold confident outer ink contours with tapered thinner interior lines, line art tinted in dark local colors (deep brown, burgundy, ink-navy) instead of pure black, warm worn-out desaturated vintage palette, high-contrast hard cel-shaded shadows combined with soft airbrushed volumes, subtle cyan-green tint in the shadows and warm amber-sepia highlights, thin soft rim light separating figures from the dark background, cinematic 1940s film noir atmosphere with vintage pinstripe fashion mixed with glowing green retro computer terminals and cables, playful and comedic tone --ar 2:3 --v 7 --no text, letters, words, numbers, logo, watermark, signature
```

### Yol E — Vantrolog Veysel (Sesin Sahibi)

- **Portre dosyası:** `karakter-veysel.png`
- **Özet:** Konuşan her makineyi kendi sesiyle konuşturan vantrolog. Bir belgeye, bir web sayfasına, bir e-postaya fısıldar; sohbet robotu onun cümlelerini kendi düşüncesi sanır.
- **Temsil ettiği tehdit:** Prompt injection, dolaylı enjeksiyon, jailbreak, veri zehirleme, sahte ses ve görüntü
- **Fiziksel yapı:** 40'larında, çok uzun ve ince, uzun parmaklı; 5.5 kafa boyu.
- **Yüz ve ifade:** Geriye taranmış parlak siyah saç, ince bıyık, abartılı tiyatro gülümsemesi; dudakları hiç kıpırdamıyor.
- **Poz ve silüet:** Dizinde oturan yarı saydam robot kuklayı bir eliyle tutuyor; diğer elini gövdeden uzak, sahneye sunar gibi açmış.
- **Kıyafet ve aksesuar:** Bordo kadife smokin, siyah papyon, beyaz eldivenler; kuklanın ağzından yeşil ışık dökülüyor.
- **İmza detay:** Ağzı onun yerine konuşan parlayan robot kukla.
- **Renk paleti:** smokin `#5A1B24` · papyon `#14110F` · eldiven `#F3EEDF` · isik `#5FD3A7` · ten `#D8A585`

- **Hikâyedeki yeri:** Proje Ayna'nın sahnedeki yüzü. Jasmine'in çekmecelerden topladığı verilerle Ayna'yı konuşturur.

**Portre promptu (Midjourney):**

```text
Full-body character design portrait of Vantrolog Veysel, a very tall thin ventriloquist in his 40s with long fingers, glossy slicked-back black hair, a thin mustache and an exaggerated theatrical smile with perfectly still lips, wearing a burgundy velvet tuxedo with a black bow tie and white gloves, a translucent glowing robot puppet sitting on one knee with green light spilling from its open mouth, his other arm held away from his body in a grand presenting gesture. Three-quarter view, the entire figure visible, plain dark smoky background under a single soft spotlight, character sheet clarity. stylized 2D cartoon illustration in a film noir comic look, semi-cartoon proportions about 5 heads tall, clear readable silhouette with arms and props held away from the body, bold confident outer ink contours with tapered thinner interior lines, line art tinted in dark local colors (deep brown, burgundy, ink-navy) instead of pure black, warm worn-out desaturated vintage palette, high-contrast hard cel-shaded shadows combined with soft airbrushed volumes, subtle cyan-green tint in the shadows and warm amber-sepia highlights, thin soft rim light separating figures from the dark background, cinematic 1940s film noir atmosphere with vintage pinstripe fashion mixed with glowing green retro computer terminals and cables, playful and comedic tone --ar 2:3 --v 7 --no text, letters, words, numbers, logo, watermark, signature
```

### Yol F — Lehimci Leman (Devre Ustası)

- **Portre dosyası:** `karakter-leman.png`
- **Özet:** Kampüsteki her akıllı kilidin, kameranın ve telefonun içini bilen kadın. Varsayılan parola ona davetiye, açık bırakılmış bir hata ayıklama portu ise ön kapıdır.
- **Temsil ettiği tehdit:** Akıllı cihaz ve IoT açıkları, varsayılan parolalar, güvensiz mobil uygulamalar, açık bırakılan hata ayıklama portları, güvensiz güncellemeler
- **Fiziksel yapı:** 50'lerinde, kısa ve dinç, hızlı hareketli; 4.5 kafa boyu.
- **Yüz ve ifade:** Kısa kesilmiş kırçıl saç, alnında büyüteçli atölye gözlüğü, keskin dikkatli gözler, yarım alaycı gülümseme.
- **Poz ve silüet:** Bir elinde gövdeden uzak tuttuğu ucu parlayan havya, diğer elinde küçük bir devre kartı; omzunun üstünde süzülen minik bir dron.
- **Kıyafet ve aksesuar:** Koyu yeşil iş gömleği üstünde deri atölye önlüğü, önlük cebinde minik çipler ve kablolar. Cinselleştirilmez.
- **İmza detay:** Ucu yeşil parlayan havya ve omzunun üstündeki minik dron.
- **Renk paleti:** onluk `#5C3B27` · gomlek `#2E4436` · gozluk `#C9953B` · isik `#5FD3A7` · ten `#C99474`

- **Hikâyedeki yeri:** Süper Kullanıcı Sadri'nin kız kardeşi. Ayna'nın gözlerini ve kulaklarını (kamera, kilit, sensör) o kurar.

**Portre promptu (Midjourney):**

```text
Full-body character design portrait of Lehimci Leman, a short energetic hardware tinkerer woman in her 50s with short salt-and-pepper hair, magnifier workshop goggles pushed up on her forehead, sharp attentive eyes and a wry half-smile, wearing a modest dark green work shirt under a leather workshop apron with tiny chips and cables in its pocket, one arm held away from her body holding a soldering iron whose tip glows green, the other hand holding a small circuit board, a tiny drone hovering above her shoulder. Three-quarter view, the entire figure visible, plain dark smoky background under a single soft spotlight, character sheet clarity. stylized 2D cartoon illustration in a film noir comic look, semi-cartoon proportions about 5 heads tall, clear readable silhouette with arms and props held away from the body, bold confident outer ink contours with tapered thinner interior lines, line art tinted in dark local colors (deep brown, burgundy, ink-navy) instead of pure black, warm worn-out desaturated vintage palette, high-contrast hard cel-shaded shadows combined with soft airbrushed volumes, subtle cyan-green tint in the shadows and warm amber-sepia highlights, thin soft rim light separating figures from the dark background, cinematic 1940s film noir atmosphere with vintage pinstripe fashion mixed with glowing green retro computer terminals and cables, playful and comedic tone --ar 2:3 --v 7 --no text, letters, words, numbers, logo, watermark, signature
```

### Yol G — Saatçi Sabri (Mekanik Böceklerin Ustası)

- **Portre dosyası:** `karakter-sabri.png`
- **Özet:** Kampüs ağına bıraktığı her "böcek" bir saat kadar hassastır; belirli bir anda uyanır, saklanır, kopyalanır. Sabri yazılımı değil, sabrı silah olarak kullanır.
- **Temsil ettiği tehdit:** Zararlı yazılım (truva atı, solucan, fidye yazılımı), paketleme ve gizleme, kalıcılık, analizden kaçma
- **Fiziksel yapı:** 70'lerinde, ufak tefek, hafif kambur ama elleri kıpırtısız; 4.5 kafa boyu.
- **Yüz ve ifade:** Kel kafa, beyaz kaşlar, bir gözünde saatçi büyüteci, ince dudaklarında sabırlı bir gülümseme.
- **Poz ve silüet:** Avucunda gövdeden uzak tuttuğu kurmalı mekanik böcek, diğer elinde minik tornavida.
- **Kıyafet ve aksesuar:** Kahverengi yelek, kolları sıvalı beyaz gömlek, kol bantları, yelek cebinden sarkan altın köstek; omzunda tırmanan iki mekanik böcek.
- **İmza detay:** Gözündeki saatçi büyüteci ve avucundaki parlayan mekanik böcek.
- **Renk paleti:** yelek `#5A4030` · gomlek `#E6DDD3` · kostek `#C9953B` · isik `#5FD3A7` · ten `#D9A988`

- **Hikâyedeki yeri:** Ailenin en yaşlı ustası. Ayna'yı besleyen mekanik böcekleri yapar; yirmi yıl önce genç Eren'in boynundaki altın anahtarı da o yapmıştı.

**Portre promptu (Midjourney):**

```text
Full-body character design portrait of Saatci Sabri, a small slightly hunched watchmaker in his 70s with a bald head, white eyebrows and a jeweler's loupe over one eye, thin lips curved in a patient smile and perfectly steady hands, wearing a brown vest over a white shirt with rolled sleeves and sleeve garters, a gold watch chain hanging from his vest pocket, two tiny clockwork beetles climbing on his shoulder, one arm held away from his body showing a glowing clockwork beetle in his open palm, the other hand holding a tiny screwdriver. Three-quarter view, the entire figure visible, plain dark smoky background under a single soft spotlight, character sheet clarity. stylized 2D cartoon illustration in a film noir comic look, semi-cartoon proportions about 5 heads tall, clear readable silhouette with arms and props held away from the body, bold confident outer ink contours with tapered thinner interior lines, line art tinted in dark local colors (deep brown, burgundy, ink-navy) instead of pure black, warm worn-out desaturated vintage palette, high-contrast hard cel-shaded shadows combined with soft airbrushed volumes, subtle cyan-green tint in the shadows and warm amber-sepia highlights, thin soft rim light separating figures from the dark background, cinematic 1940s film noir atmosphere with vintage pinstripe fashion mixed with glowing green retro computer terminals and cables, playful and comedic tone --ar 2:3 --v 7 --no text, letters, words, numbers, logo, watermark, signature
```

## 4. Grup sahnesi

- Don Gölge kompozisyonun tam merkezinde; tüm karakterler aynı yatay zemine basar.
- Don'un hemen arkasında, yarı gölgede Baron Eren durur; bir eli Don'un omzunda (asıl patron odur). Yanında Tek Tırnak Jasmine.
- Don'un sağında Fidyeci Ferhat (iri silüet koruyucu duvar), solunda Maskeli Mine.
- Kanatlarda boy sırasına göre diğerleri; kısa Dinleyici Nuri ve oturan Süper Kullanıcı Sadri kanatlara yerleşir.
- Herkesin üzerine aynı açıdan tek, yumuşak bir ışık kaynağı düşer; Baron'un yüzü ışığın kenarında kalır.

**Grup promptu** (`karakter-aile.png`):

```text
Group lineup illustration of the members of a fictional shadowy noir family posing together as a group lineup standing on the dark harbor ground, the scene continuing to every edge: the gray-haired family patriarch with a cigar in the center, and right behind him, half in shadow, a calm tall mastermind in a black three-piece suit with a black hoodie under the jacket resting one hand on the boss's shoulder, beside him an elegant woman in an emerald trouser suit with a jasmine flower in her ponytail holding a giant fountain pen, a huge bald bodyguard with chains on one side, an elegant woman in a burgundy trench coat holding masks on the other, flanked by a slick con artist with two glowing phones, a portly lawyer with a briefcase, a gaunt locksmith with a giant keyring, a bald old boss seated on a throne of server racks, a small wiry listener in a cable-lined trench coat with headphones, a burly baker in an apron over a pinstripe suit, a tall puppeteer controlling tiny robots with glowing strings, and an old vault mechanic with a stethoscope. All figures stand on the same horizontal ground line, the boss exactly in the center, one shared soft light source from the same angle, overall warm dark color correction. stylized 2D cartoon illustration in a film noir comic look, semi-cartoon proportions about 5 heads tall, clear readable silhouette with arms and props held away from the body, bold confident outer ink contours with tapered thinner interior lines, line art tinted in dark local colors (deep brown, burgundy, ink-navy) instead of pure black, warm worn-out desaturated vintage palette, high-contrast hard cel-shaded shadows combined with soft airbrushed volumes, subtle cyan-green tint in the shadows and warm amber-sepia highlights, thin soft rim light separating figures from the dark background, cinematic 1940s film noir atmosphere with vintage pinstripe fashion mixed with glowing green retro computer terminals and cables, playful and comedic tone --ar 16:9 --v 7 --no text, letters, words, numbers, logo, watermark, signature
```

## 5. Hikâye — Gölge Ağ — Sezon 1

Öğrenciye anlatılan tam hikâye: [00-program/09-golge-ag.md](00-program/09-golge-ag.md). Her modül bir bölümdür: ilk sayfası 📼 bölüm girişini,
son sayfası 🔒 DOSYA KAPANDI kutusunu ve bir sonraki kötü adama uzanan ipucunu taşır.

| Bölüm | Kötü adam | Başlık | Sonunda ne olur? |
|---|---|---|---|
| 1 · M01 | Tatlı Dil Tevfik | Bursun Onaylandı | Tevfik'in tuzağı boşa çıktı, sahte site kapandı. Ama telefonundaki son arama bir avukat bürosuna gidiyor: "Kemal Bey, bir çocuk izimize düştü." |
| 2 · M02 | Avukat "Boşluk" Kemal | Yetki Belgesi | Tuzağa düşmedin; dosyandaki her delil imzalı ve izinli. Kemal masasındaki eski fotoğrafı çeviriyor: aynı koğuştan iki adam — bir çilingir ve bir kasa hırsızı. |
| 3 · M03 | Anahtarcı Rıza | Ana Anahtar | Arka kapı kapandı; makineler güncel ve kilitli. Rıza'nın düşürdüğü anahtarlıkta bir etiket var: "Sadri Usta'ya — sunucu odası." |
| 4 · M04 | Süper Kullanıcı Sadri | Kök | Sadri'nin tahtı devrildi. Loglarda unuttuğu tek satır kaldı: yirmi yıllık bir kullanıcı adı, "eren". Selim Hoca o satırı görünce uzun süre konuşmuyor. |
| 5 · M05 | Dinleyici Nuri | Fırındaki Kulak | Nuri'nin cihazı söküldü; trafik artık şifreli. Ama dinlediği son paket fırının kendi sunucusuna gidiyordu. Fırının sahibi kuzeni: Çerezci Celal. |
| 6 · M06 | Çerezci Celal | Taze Çerezler | Çerez tezgâhı kapandı; oturumlar güvende. Fırının arka odasında bir kablo yığını duruyor — iplerin hepsi tek bir kuklacıya uzanıyor. |
| 7 · M07 | Kuklacı Orhan | İpler | Loglardan bot ordusunu buldun; ipler kesildi. Orhan'ın sunucusunda çalınmış parola özetleri duruyor. Onları kırmaya çalışan adamın adı loglarda: Kasa Kıran Kadir. |
| 8 · M08 | Kasa Kıran Kadir | Kasa | Kadir'in açamadığı tek kasa güçlü, tuzlu parolalardı. Teslim olmadan önce tek bir isim veriyor: "Ben sadece açarım. Kime açtığımı Mine Hanım bilir." |
| 9 · M09 | Maskeli Mine | Maskeler | Sahte şirket açık kaynak bilgileriyle çöktü. Mine kaçarken bir dosya düşürüyor: babasının sağ kolu Ferhat'ın şehre kurduğu fidye ağının haritası. |
| 10 · M10 | Fidyeci Ferhat | Fidye | Zincir üçüncü halkada kırıldı; yedekler kurtarıldı. Ferhat sorguda tek cümle kuruyor: "Don'u yakalarsınız. Ama Baron'u asla." |
| 11 · M11 | Don Gölge | Son Masa | Don Gölge'nin dosyası kapandı. Tam o anda ekranında bir mesaj beliriyor, imza tek harf: "İyi oyundu Tilki. Selim'e selamımı söyle. — B." Selim Hoca çekmecesinden yirmi yıllık bir fotoğraf çıkarıyor: üç kapüşonlu genç. "Eren..." diyor. Sezon 2 uzmanlık yollarında başlıyor. |
| S2 · Yol A | Tek Tırnak Jasmine | Çekmeceler | Son çekmece kilitlendi; raporun okulun güvenlik ekibinin masasında. Laboratuvarın kapı kolunda bir yasemin çiçeği ve katlanmış bir not var: "Kapüşonlular hep üç kişi miydi sanıyorsun, Tilki? Selim'e dördüncüyü sor." |
| S2 · Yol B | Tünelci Tarık | Tüneller | Son tünel kapandı; ağ bölgelerine ayrıldı, sunucular sertleştirildi. Sunucu dolabının içinde fenerinin yeşil ışığıyla yazılmış bir not buluyorsun: "Eren beni o gece yaktı. Ona çalışıyorum, ama onun adamı değilim. Bir gün aynı tarafta olacağız, Tilki." |
| S2 · Yol C | Temizlikçi Tamer | Temizlik | Zaman çizelgesi tamamlandı; Tamer'in sildiği altı saat geri geldi. Kurtarılan son kayıtta tek bir kelime tekrar ediyor: AYNA. Selim Hoca kâğıdı katlayıp cebine koyuyor: "Bunu daha önce duymuştum." |
| S2 · Yol D | Bayrakçı Bedri | Sahte Bayraklar | Bayraklar söküldü; bütün altyapı tek bir şirkete çıkıyor: Ayna Teknoloji. Kâğıt üstünde kimse yok, ama bütün alan adları aynı gece, aynı saatte kaydedilmiş: Kapüşonlular'ın yirmi yıl önce buluştuğu saatte. |
| S2 · Yol E | Vantrolog Veysel | Ayna | Ayna'nın eğitim verisinde Gölge Ağ'ın yıllardır topladığı her şey var: sesler, yazışmalar, yüzler. Baron bir asistan değil, şehrin bir kopyasını kuruyor. Veysel sahneden inerken fısıldıyor: "Ayna'nın gözleri sizin cebinizde, Tilki." |
| S2 · Yol F | Lehimci Leman | Gözler | Kameralar kapandı, kilitler yeniden programlandı. Leman'ın tezgâhında yarım kalmış bir kart duruyor; içinde minik, mekanik bir böcek. Kartın arkasına kazınmış not: "Sabri Usta'ya teslim." |
| S2 · Yol G | Saatçi Sabri | Saat İşliyor | Saat durdu. Böceğin içindeki imza anahtarı yirmi yıl öncesine gidiyor: o gece liman bankasında kullanılan anahtar. Ve son satır yeni bir geri sayım başlatıyor; bitişi, Ayna'nın uyanacağı gece. Sezon 3: Ayna. |
