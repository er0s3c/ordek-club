# design.md — Uluslararası Kıbrıs Üniversitesi (ciu.edu.tr) tabanlı tasarım sistemi

> Kulübün kendi tasarım belgesi (UKÜ Siber Güvenlik Kulübü / CIU Cyber Security Club). Kaynak: https://ciu.edu.tr/tr
> ana sayfası (23.10.2026); değerler sayfanın hesaplanmış stillerinden okunmuştur. Uygulamadaki karşılıkları:
> `src/styles/globals.css` (`--ciu-*` belirteçleri), terminal için `.ciu-terminal`, lab/ders odası için `.lab-*`.
> Kulüp logosu: `public/brand/club-logo.png`.

---

## 1. Marka karakteri

- **Slogan / ton:** "Açık Fikirlere Açık" — kendinden emin, genç, uluslararası.
- **Görsel dil:** Derin mor ana renk + neon yeşil eylem rengi + sıcak krem zemin. Başlıklar çok geniş, kalın ve
  **BÜYÜK HARF** bir grotesk (Lexend Tera) ile, sıkı negatif harf aralığıyla yazılır.
- **Biçimler:** Hap (pill) butonlar, 20px yuvarlatılmış kartlar, mor→macenta "galaxy" degradesi.
- **Hareket:** Kısa ve yumuşak (300ms ease-in-out); oklar hover'da kayar, kart görselleri hafifçe büyür, bölümler kaydırırken belirir.

## 2. Renkler

| Token | Hex | Kullanım |
|---|---|---|
| `--ciu-purple` | `#5C1FE2` | Ana marka rengi: header, alt menü linkleri, ikincil buton çerçevesi, rozetler, etiketler, odak çerçevesi |
| `--ciu-purple-dark` | `#4C1ABA` | Header degradesinin koyu ucu |
| `--ciu-magenta` | `#ED04FA` | Galaxy degradesinin vurgu ucu |
| `--ciu-green` | `#17FF74` | Birincil CTA arka planı, koyu zeminde hover/odak vurgusu |
| `--ciu-green-hover` | `#13D15F` | Birincil buton hover/active |
| `--ciu-green-soft` | `#79ECA7` | İkincil butonların hover dolgusu |
| `--ciu-ink` | `#2E2E2E` | Gövde metni, başlıklar, footer zemini |
| `--ciu-cream` | `#FFFCF2` | Hero zemini, mega menü, açılır menüler, nav hover |
| `--ciu-white` | `#FFFFFF` | Sayfa zemini, koyu zeminde metin |
| `--ciu-mist` | `#EAEFF5` | Üst yardımcı bar zemini, akordeon hover |
| `--ciu-gray-50` | `#F3F3F3` | Input hover, devre dışı buton zemini, input odak halkası |
| `--ciu-ink-60/40/20` | `rgba(46,46,46,.6/.4/.2)` | Odak çerçevesi / input çerçevesi / ayraç |
| `--ciu-success` | `#427A43` | Geçerli input, etiket, yardımcı metin |
| `--ciu-error` | `#BD2F25` | Hatalı input, zorunlu alan yıldızı |

Degradeler: `--ciu-gradient-header` (90.72deg #4C1ABA→#5C1FE2), `--ciu-gradient-galaxy` (150.09deg #5C1FE2 35.51% → #ED04FA 156.57%),
`--ciu-gradient-galaxy-60`, `--ciu-gradient-card-overlay` (187.33deg rgba(71,71,71,.29) 39.7% → #5C1FE2 86.58%).

**Kurallar:** Neon yeşil yalnızca eylem içindir (beyaz zeminde metin rengi değil). Yeşil buton üzerindeki metin daima
`--ciu-ink`. Mor zemin üzerindeki metin beyaz; mor metin yalnız beyaz/krem zeminde. Ham `#000` yerine `--ciu-ink`.

## 3. Tipografi

| Rol | Aile | Ağırlıklar | Notlar |
|---|---|---|---|
| Display / başlık | Lexend Tera | 700 | Daima `uppercase`, `letter-spacing: -0.12em` |
| Gövde / arayüz | Readex Pro | 300, 400, 500, 700 | `letter-spacing: 0.02em` |

Başlık ölçeği (<992 / ≥992): H1 38/52, H2 28/40, H3 24/32, H4 18/24, H5–H6 16. Gövde 16/24; nav 18; small 14; micro 12/300 uppercase.
Uygulamada fontlar `@fontsource` ile kendi sunucumuzdan yüklenir (CSP: `font-src 'self'`).

## 4. Yerleşim

- Container en fazla **1100px** (hero ve mega menü 1440px), yan boşluk 16px. 8px ritim: 4 · 8 · 12 · 16 · 20 · 24 · 28 · 32 · 40 · 48 · 56 · 72 · 104.
- Köşe: buton 30px (hap), etiket 52px, kart 20px, input 16px, liste görseli 10px, sekme 8px, "Öne çıkan" rozeti `0 0 0 20px`.
- Gölge yalnız açılır katmanlarda: `0 4px 12px 0 rgba(18,18,18,.21)`. Kartlar gölgesizdir.

## 5. Bileşenler (özet)

- **Header:** header degradesi, beyaz metin; menü linki hover'da krem zemin + mürekkep metin; mega menü krem, mor linkler;
  mobilde aktif öğe mor zemin + beyaz; koyu zemindeki ikon butonları hover'da yeşil.
- **Butonlar:** birincil yeşil dolgu + koyu metin (hover #13D15F + altı çizili); ikincil şeffaf + 2px mor çerçeve
  (hover #79ECA7 dolgu); koyu zeminde beyaz çerçeve; üçüncül galaxy degradeli metin + ok; devre dışı #F3F3F3. Bölümde tek birincil eylem.
- **Kartlar:** 20px, gölgesiz; "Öne çıkan" rozeti sağ üstte mor zemin, sol-alt 20px köşe. Etiket: beyaz zemin, 1px mor çerçeve, 52px köşe.
- **Duyuru bandı:** 1px mor çerçeve, solda megafon ikonu, sağda küçük ikincil buton.
- **Sekmeler:** alt kenarda 3px mor çizgi; aktif → galaxy zemin + beyaz metin.
- **Form alanları:** beyaz zemin, 1px rgba(46,46,46,.4), 16px köşe; hover #F3F3F3; odak mor çerçeve + 4px #F3F3F3 halka;
  geçerli #427A43, hatalı #BD2F25.
- **Footer:** mürekkep zemin, beyaz metin, 56px dolgu.

### 5.14 Terminal bloğu (`.ciu-terminal`)

Projedeki tüm terminal görünümleri bu kalıbı kullanır. Ölçü ve davranış bir eğitim platformundaki terminal bloğu
incelenerek not edildi (yaygın UI kalıbı); HTML/CSS ve sınıf adları bu proje için sıfırdan yazılmıştır, başka sitenin
CSS'i, ikonları, logosu ve metni kopyalanmaz. İkonlar Lucide (ISC).

| Token | Değer | Kullanım |
|---|---|---|
| `--term-bar-bg` | `#3E4552` | Başlık çubuğu |
| `--term-bar-fg` | `#FFFFFF` | Başlık metni |
| `--term-bg` | `#0F1923` | Gövde |
| `--term-fg` | `#BAC8D4` | Varsayılan metin / çıktı / kullanıcı / komut |
| `--term-fg-bright` | `#F8F8F2` | Yol, parametre, noktalama |
| `--term-prompt-symbol` | `#FD971F` | `#` / `$` (700) |
| `--term-keyword` | `#FFAF00` | Alt komut / fonksiyon / sayı |
| `--term-dot-red/yellow/green` | `#FF4444` / `#FF9C07` / `#B2E028` | Başlık noktaları |
| `--term-control-icon` | `#8B9BB4` | Kontrol ikonu (hover beyaz) |
| `--term-control-hover/pressed` | `rgba(255,255,255,.12/.16)` | Kontrol zemini |
| `--term-success` | `#3BC81E` | "Kopyalandı" |
| `--term-focus` | `#719CF9` | Kontrol odak halkası |
| `--term-bg-attacker` / `--term-bg-defender` | `#512323` / `#1E3C61` | Makine varyantları |

Başlık çubuğu 35px, 16px Readex Pro, üst köşeler 6px; noktalar 9px, 6px aralık, soldan 12px. Gövde `padding: 15px`,
alt köşeler 6px, alt boşluk 18px, `overflow: auto`. Kod: `Consolas, Monaco, "Andale Mono", "Ubuntu Mono", monospace`
15px / 1.8 / 600. Varsayılan `white-space: pre`; "kaydır" açıkken `pre-wrap`. Kontroller (kopyala, kaydır) 26×26,
5px köşe, sağ üstte, varsayılan gizli; hover/odakta 180ms ile belirir; kopyala yalnız komut+çıktıyı alır, 2 sn onay
ikonu; kaydır `aria-pressed`. Terminal her temada koyu kalır. Gerçek IP/parola/token örneklere konmaz (`MACHINE_IP`, `10.10.x.x`).

## 5A. Lab / eğitim odası arayüzü

Uygulamalı derslerdeki "oda" sayfası: başlık, görev akordeonu, ders içeriği, terminal blokları, soru-cevap. Bir eğitim
platformundaki bilgi mimarisi incelenip CIU diline çevrilmiştir; o platformun adı, logosu, ikonları, metinleri ve terimleri kullanılmaz.

| Token | Değer | Kullanım |
|---|---|---|
| `--lab-bg` | `#15112B` | Sayfa zemini |
| `--lab-surface` | `#1E1840` | Görev satırı, kartlar |
| `--lab-surface-2` | `#272052` | Açık görev içeriği, hover |
| `--lab-border` | `#3A3170` | Çerçeve, ayraç |
| `--lab-text` | `#F5F3FB` | Başlık, birincil metin |
| `--lab-text-muted` | `#BDB6D6` | Gövde |
| `--lab-text-subtle` | `#8E86AD` | Yardımcı, placeholder |
| `--lab-code-bg` | `#3A3170` | Satır içi kod |
| `--lab-accent` | `--ciu-green` | Tamamlandı, doğru cevap, birincil eylem |
| `--lab-progress` | galaxy | İlerleme dolgusu |
| `--lab-danger` | `#FF5B6B` | Yanlış cevap |

- **Düzen:** breadcrumb (Yol › Modül › Oda), 96px ikon (20px köşe), Lexend Tera başlık (28/40), 16px açıklama,
  meta satırı (zorluk rozeti: Kolay yeşil, Orta #FFB020, Zor `--lab-danger`, Uzman macenta), kompakt eylem butonları.
- **İlerleme:** 12px ray (`--lab-surface`, 30px köşe), galaxy dolgu (%100'de yeşil), etiket çubuğun sağında, `role="progressbar"`.
- **Görev akordeonu:** 56px satır, 16px köşe, solda 4px durum şeridi (tamamlandı yeşil, devam galaxy, başlanmadı border);
  "GÖREV n" 14px/500 uppercase; açık içerik `--lab-surface-2`, `padding: 32px`; `<h3><button aria-expanded>`.
- **Ders içeriği (`.lab-prose`):** 16/26 Readex Pro, en fazla 75ch; ara başlıklar Readex Pro 500 (24/20px; Lexend Tera
  içerikte kullanılmaz); liste işareti yeşil; link yeşil; satır içi kod `--lab-code-bg`; not kutusu solda 4px şerit
  (bilgi mor, uyarı #FFB020, tehlike `--lab-danger`), 10px köşe; tablo dönüşümlü satır.
- **Soru-cevap (`.lab-qa`):** "SORULARI CEVAPLAYIN" 14px/500 uppercase yeşil; cevap inputu 44px, `--lab-bg`, 16px köşe,
  monospace; odak mor + 4px rgba(92,31,226,.35); Gönder kompakt yeşil, İpucu kompakt lab butonu; doğru → kilitli + yeşil
  çerçeve + "✓ Doğru cevap"; yanlış → `--lab-danger` çerçeve + 300ms sallanma (azaltılmış harekette yok) + "Tekrar dene";
  sonuç `aria-live="polite"`.
- **Kompakt buton:** 40px yükseklik, `0 18px`; lab varyantı `--lab-surface` zemin, 1px `--lab-border`.
- **Açık tema (isteğe bağlı):** `--lab-bg → #FFF`, `--lab-surface → cream`, `--lab-text → ink`; terminal her temada koyu.

### 5A.1 Uygulama kararları (tasarım konseyi, `docs/design-council/03`, `04`, `07`)

- **Varsayılan açık oda.** Ders gövdesi "C · Friendly Academy" dilindedir: krem/beyaz yüzey, tek kolon. §5A koyu odası
  öğrencinin tercihiyle açılır ("Koyu oda" düğmesi, `localStorage`), `.lab-room[data-theme="dark"]`. Koyu yüzey açık odada
  yalnız terminal/log gibi kanıt nesnelerinde kullanılır; ilk görevde koyu öğe yoktur.
- **Açık odada yeşil metin yok.** Doğru durum çizgisi/metni `--lab-ok` (açıkta `--ciu-success`, koyuda `--ciu-green`),
  vurgu metni `--lab-accent-ink` (açıkta mor, koyuda yeşil). Neon yeşil yalnız eylem dolgusudur, üzerinde `--ciu-ink`.
- **Ders gövdesi başlık istisnası (§3'e istisna).** Lexend Tera + uppercase yalnız sayfa başlığı (`.lab-title`), hero ve
  kapanış damgasında kullanılır. Ders içeriğindeki `h2–h4` ve görev kartı başlıkları Readex Pro 500, cümle düzeninde
  (sentence case) yazılır. Gerekçe: okunabilirlik ve sıfır bilgili öğrenci (konsey P0 #14).
- **Mini görev (`mission.css`).** Posta maketi gerçeğe yakın ve sade (marka renkleri maketin içine girmez); B atmosferi
  (galaxy bandı, saat damgası, "DOSYA KAPANDI" damgası, kötü adam portresi) yalnız kancada ve kapanış kartında.
  Maket içinde bağlantı (`<a href>`) ve input yoktur; sabit rozet: "SİMÜLASYON · Gerçek e-posta değil…".

## 6–8. İkonografi, hareket, erişilebilirlik

- Tek renkli çizgi ikonlar; 300ms geçişler; `prefers-reduced-motion`'da ölçekleme/kaydırma kapalı.
- Odak her zaman görünür (butonda 4px koyu outline, koyu zeminde yeşil, inputta mor + açık halka); hover altı çizgiyle de belirtilir;
  ikon butonlarında gizli metin ve 48px dokunma alanı. `#17FF74` üzerinde yalnız koyu metin.

## 10. Yap / Yapma

- **Yap:** Lexend Tera + uppercase + -0.12em başlık, sakin Readex Pro gövde; bölümde tek yeşil eylem; kart 20px, buton hap;
  vurgulu bölümde galaxy, sakin bölümde krem.
- **Yapma:** yeşili metin/geniş zemin yapma; kartlara gölge ekleme; gövdeyi uppercase yapma; container'ı 1100px'in üzerine çıkarma.
