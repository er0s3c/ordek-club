# Akademi içeriği — İngilizce çeviri kılavuzu

Bu dosya, Akademi derslerinin ve çizgi romanlarının İngilizce sürümünü üreten herkes için tek kaynaktır.
Çeviri, platformun şema denetimlerinden geçmek zorundadır: `npm run academy:check` ve `npm run i18n:check`.

## Dosya düzeni

| İçerik | Türkçe kaynak | İngilizce hedef |
| --- | --- | --- |
| Ders sayfası | `content/academy/<yol>/<ad>.md` | aynı klasörde `<ad>.en.md` |
| Çizgi roman | `content/academy/cizgi-roman.yaml` → `seritler.<id>` | aynı blokta `en:` alanları |
| Karakter | `content/academy/karakterler.yaml` → `karakterler[].id` | aynı kayıtta `en: { ad, unvan, tehdit, ozet }` |
| Gölge Ağ bölümü | `hikaye.bolumler.<id>` | aynı kayıtta `en: { baslik, giris }` |

`<ad>.en.md` **aynı `id`yi** taşır. Türkçe dosya hiçbir zaman değiştirilmez; çeviri yalnızca yeni dosya/alan olarak eklenir.

## Ders dosyası biçimi

```markdown
---
id: m06-03
baslik: Frontend, backend and the API in between
hedefler:
  - Explain what runs in the browser and what runs on the server
  - Follow one request from a click to the database
---

# Frontend, backend and the API in between

…gövde…
```

Kurallar:

- `id` Türkçe dosyayla **birebir** aynı olmalı.- `baslik`: başlığın çevirisi (markdown biçimi yok, düz metin).
- `hedefler`: Türkçe `hedefler` listesiyle **aynı sayıda ve aynı sırada**.
- `sorular` yalnızca quiz derslerinde bulunur: `soru`, `secenekler`, `aciklama` çevrilir; `tur`, `dogru` ve **seçenek sayısı/sırası** değişmez.
- `gorevler` (uygulama dersleri): `id`, `adimlar[].id`, `dogru` gibi yapısal alanlar korunur; yalnızca metin alanları çevrilir.
- `etkinlikler`: varsa aynı kimlik ve seçenek yapısıyla çevrilir; yoksa alan hiç eklenmez.
- `inceleme` bloğu **eklenmez** (çeviri "eğitmen incelemedi" olarak işaretli kalır).
- Gövde: Türkçe gövdenin **birebir iskeleti**. Başlık sayısı ve sırası, liste öğesi sayısı, tablo satır/sütun sayısı, kod blokları, `<details>` blokları korunur.

### Gövdede asla değişmeyenler

- `::cizgi[serit-id]` ayraçları (kimlik aynı kalır).
- Görsel yolları: `../../gorseller/...`
- Bağlantı hedefleri: `[metin](hedef)` → yalnız `metin` çevrilir, `hedef` aynı kalır.
- Kod sözdizimi: komutlar, değişken adları, anahtar sözcükler, dosya yolları, alan adları, IP'ler, portlar, HTTP başlıkları, regex'ler, bayraklar, hash'ler.
- Tablo hücrelerindeki sayılar, `✅`/`⚠️` gibi işaretler.
- Markdown vurguları (`**`, `*`, `` ` ``) ve blok alıntı `>` işaretleri.

### Kod blokları

Kod blokları **birebir** kopyalanır — komutlar, değişkenler, yorumlar ve örnek metinler dâhil. Nedeni: bu bloklar öğrencinin laboratuvarda yazdığı/karşılaştığı satırlardır ve bazıları `gorevler` doğrulamasında dize olarak aranır; çeviri görevi bozar. Yalnızca kod bloğunun **dışındaki** açıklama cümleleri çevrilir.

```bash
pwd           # şu an hangi klasördeyim?
```

### Yazım

- **British English** (mevcut çevirilerle tutarlı): *unauthorised, recognise, organisation, behaviour, centre, licence (noun)*.
- İkinci tekil şahıs, doğrudan hitap: "you", "your". Türkçedeki "sen" tonu korunur.
- Terimler ilk geçtiği yerde açılır: "domain name system (DNS)".
- "cyber security" iki kelime (mevcut metinlerle tutarlı).
- Kısa, düz cümle. Türkçe uzun zincir cümleleri İngilizcede iki cümleye bölünebilir; **anlam** birebir kalır.
- Deyim ve espriler birebir çevrilmek yerine aynı işlevi gören İngilizce karşılığıyla verilir; teknik iddia eklenmez.

## Çizgi roman biçimi

```yaml
  tevfik-acilis:
    baslik: "Chapter 1 — Your Scholarship Is Approved"
    en:
      baslik: "Chapter 1 — Your Scholarship Is Approved"
      devam: "You're one click away. Finish this chapter before you click."
    paneller:
      - gorsel: cizgi-tevfik-acilis-1
        en:
          alt: "One-line description of what the image shows"
          anlatici: "Caption box text"
          ses: "BEEP! BEEP!"
        balonlar:
          - kim: Mesaj
            en: "Your scholarship is approved! Confirm within 24 hours."
```

Sınırlar (`academy:check` zorunlu kılar):

- `en.baslik` ≤ 120, `en.devam` ≤ 200, `en.anlatici` ≤ 220, `en.ses` 1–16, `en` (balon) ≤ 100 karakter.
- `en.anlatici` yalnız Türkçe `anlatici` varsa yazılır.
- Ses efekti (`ses`) çoğu zaman evrenseldir (`BİP!` → `BEEP!`); Türkçe ses efekti 16 karakteri geçmiyorsa İngilizcesi de geçmemeli.
- `gorsel`, `prompt`, `karakter`, `yer`, `tur` alanları **değişmez**.
- Balon metni kısaysa (≤100) doğal İngilizce ile yeniden yazılır; kelime kelime çeviri zorlanmaz.

## Karakter adları (tek kaynak)

| id | Türkçe | İngilizce ad | Unvan |
| --- | --- | --- | --- |
| tevfik | Tatlı Dil Tevfik | Smooth-Talking Tevfik | Scammer |
| kemal | Avukat "Boşluk" Kemal | Lawyer "Loophole" Kemal | Crooked Lawyer |
| riza | Anahtarcı Rıza | Locksmith Rıza | The Lockpick |
| sadri | Süper Kullanıcı Sadri | Superuser Sadri | Root Father |
| nuri | Dinleyici Nuri | Listener Nuri | The Listener |
| celal | Çerezci Celal | Cookie-Baker Celal | Session Thief |
| orhan | Kuklacı Orhan | Puppeteer Orhan | Bot Master |
| kadir | Kasa Kıran Kadir | Safecracker Kadir | Vault Thief |
| mine | Maskeli Mine | Masked Mine | Information Broker |
| ferhat | Fidyeci Ferhat | Ransom Ferhat | Ransom Boss |
| don | Don Gölge | Don Shadow | Head of the Family |
| jasmine | Tek Tırnak Jasmine | Single-Quote Jasmine | Queen of Databases |
| eren | Baron Eren | Baron Eren | The Family's Elder |
| eren-genc | Kapüşon (genç Eren) | The Hood (young Eren) | The Baron's past |
| tarik | Tünelci Tarık | Tunneller Tarık | Ghost of the Network |
| tamer | Temizlikçi Tamer | Cleaner Tamer | Trace Eraser |
| bedri | Bayrakçı Bedri | Flag-Bearer Bedri | Master of False Trails |
| veysel | Vantrolog Veysel | Ventriloquist Veysel | Owner of the Voice |
| leman | Lehimci Leman | Solderer Leman | Circuit Master |
| sabri | Saatçi Sabri | Clockmaker Sabri | Master of Mechanical Bugs |

Destek karakterleri: **Professor Selim**, **Fox** (Tilki), **Jasmine** (Tek Tırnak Jasmine).
Aile adı: **Shadow Network** (Gölge Ağ). Akademi: **the Academy**. Kulüp: **the Club**.

## Terim sözlüğü

| Türkçe | İngilizce |
| --- | --- |
| siber güvenlik | cyber security |
| zafiyet | vulnerability |
| açık (zafiyet) | flaw / vulnerability |
| tehdit | threat |
| risk | risk |
| saldırı yüzeyi | attack surface |
| tehdit modeli | threat model |
| kimlik doğrulama | authentication |
| yetkilendirme | authorization |
| en az ayrıcalık | least privilege |
| oltalama | phishing |
| sosyal mühendislik | social engineering |
| fidye yazılımı | ransomware |
| zararlı yazılım | malware |
| arka kapı | backdoor |
| kalıcılık | persistence |
| yatay hareket | lateral movement |
| ortadaki adam | man-in-the-middle (MITM) |
| oturum çerezi | session cookie |
| güvenlik duvarı | firewall |
| paket yakalama | packet capture |
| adli bilişim | digital forensics |
| olay müdahalesi | incident response |
| tehdit istihbaratı | threat intelligence |
| saldırı zinciri | kill chain |
| gölge kopya | shadow copy |
| yedek | backup |
| parola | password |
| parola özeti | password hash |
| tuz | salt |
| anahtar | key |
| sertifika | certificate |
| dijital imza | digital signature |
| dijital ayak izi | digital footprint |
| sorgu | query |
| girdi doğrulama | input validation |
| komut enjeksiyonu | command injection |
| sistem enjeksiyonu | prompt injection |
| model | model |
| ajan | agent |
| laboratuvar | lab |
| uygulama (ders türü) | practice |
| quiz | quiz |
| görev | mission |
| adım | step |
| kanıt | evidence |
| kapsam | scope |
| izin | permission |
| rapor | report |
| öğrenci | student |
| eğitmen | instructor |
| kulüp | club |
| seviye | level |
| rozet | badge |
| liderlik tablosu | leaderboard |
| duyuru | announcement |
| ödev | assignment |

## Kalite kontrolü

1. `npm run i18n:coverage` — kapsam artmalı, eksik listesi küçülmeli.
2. `npm run academy:check` — `Hata yok` ve uyarı çıkmamalı.
3. `npm run i18n:check` — 0 eksik.
4. Gözle kontrol: İngilizce sayfada Türkçe cümle kalmamalı (özel adlar ve alıntılanan Türkçe mevzuat adları hariç).

## Toplu çeviri akışı (çok ajanlı)

Büyük YAML dosyalarına eşzamanlı yazmak kayıp üretir. Bu yüzden çeviri metni ayrı JSON parçaları
hâlinde toplanır, ardından tek geçişte YAML'a işlenir.

```bash
# 1) Bir partinin Türkçe metnini dışa aktar (ajan yalnız bunu okur)
node scripts/i18n-batch.mjs comics  tmp/comics-c1.src.json  a-00-sahne a-01-sahne
node scripts/i18n-batch.mjs characters tmp/chars.src.json   tevfik kemal

# 2) Ajanlar çeviriyi tmp/out/comics-c1.json biçiminde yazar

# 3) Parçaları kaynağa işle (şema + uzunluk denetimi ile)
node scripts/apply-i18n.mjs comics     tmp/out
node scripts/apply-i18n.mjs characters tmp/out/chars.json

# 4) Kapsamı doğrula
npm run i18n:coverage
```

`apply-i18n.mjs` panel/balon sayısı, karakter uzunlukları (`baslik` 120, `anlatici` 220, balon 100 …)
ve bilinmeyen kimlikler için hata verir; geçersiz JSON parçasını atlar, YAML yorumlarını korur.

## Animasyon metinleri

Ders içi diyagramlar (`src/animations/*.ts`) Türkçe tanımlanır; İngilizce görünen metin
`src/animations/en.ts` içinde, tanımdaki **sırayla** eşleşen diziler hâlinde durur
(`src/animations/locale.ts` uygular). Kod animasyonlarında kod satırları çevrilmez, yalnız panel
etiketleri değişir. Kapsam `tests/unit/animations-i18n.test.ts` ile denetlenir.
