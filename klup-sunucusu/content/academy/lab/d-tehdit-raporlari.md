# Vaka dosyası: "Sis Düdüğü" — kampüs laboratuvarına yapılan saldırı

> **SENTETİK VERİ — Yol D (Tehdit İstihbaratı) alıştırma dosyası.**
> Bütün kişi, kurum, grup, alan adı ve IP adresleri kurgusaldır. Alan adları `.example` / `.test`,
> IP adresleri RFC 5737 belgelendirme aralıklarındandır. **MERCAN-7** ve **Mercan Kolektifi** gerçek bir
> grubu temsil etmez. Bu dosyadaki hiçbir bilgiyi gerçek bir kişi veya kurum hakkında kullanma.

Saatler Türkiye saatidir (UTC+3). Kaynaklar **zaman sırasına göre değil**, dosyaya eklendiği sıraya göre verilmiştir.

---

## K1 — Kalkan ekibi SIEM özeti (iç kaynak)

- **Yazan:** Kalkan ekibi, Selim Hoca onayıyla · **Tarih:** 2026-10-03 11:30
- **Kaynağın geçmişi:** Ekibin kendi izleme sistemi; geçmiş raporları doğrulanmış.

> 03 Ekim 09:12'de LAB-PC-07'de, 09:47'de LAB-PC-12'de aynı olay zinciri görüldü: e-postayla gelen
> `Burs_Sonuclari_2026.docm` açıldı → Word, gizli pencerede kodlanmış (`-enc`) PowerShell başlattı →
> `mercan-guncelleme.example` (203.0.113.45) adresinden ikinci aşama indirildi → `%APPDATA%\mrcn\svc_update.dll`
> yazıldı → `MercanSync` adlı zamanlanmış görev oluşturuldu → `rundll32` yaklaşık 15 dakikada bir
> `cdn-mercan.example` (203.0.113.46) adresine HTTPS ile bağlandı. Gönderen adres: `burs-ofisi@kampus-destek.example`.
> Ham olaylar: `d-av-olaylari.jsonl`.

---

## K2 — "Kıyı Siber Notları" blog yazısı

- **Yazan:** Anonim blog · **Tarih:** 2026-10-04 08:10
- **Kaynağın geçmişi:** Blog 2026-09-28'de açılmış; bu, ikinci yazısı. Yazar bilgisi yok.

> **KAMPÜS SALDIRISI %100 MERCAN-7!** Zararlı yazılımın içinde açıkça `MERCAN-7 was here` ve `mrcn_v2` yazıyor,
> klasör adı `mrcn`, görev adı `MercanSync`. Başka kim olabilir? Mercan Kolektifi de sorumluluğu üstlendi.
> Hemen engelleyin: `198.51.100.200`, `203.0.113.45`, `mercan-guncelleme.example` ve
> `e2a9db82d0b999e8955f31262c5262f72eff4b85c539c31082585ffaea208602` (SHA-256).
> IOC'ler topluluk beslemesine STIX olarak da gönderildi (`d-stix-paketi.json`).

---

## K3 — Sosyal medya hesabı `@gercek_analist_x`

- **Tarih:** 2026-10-04 08:12 · **Hesap açılışı:** 2026-10-01 · **Takipçi:** 41
- **Profil fotoğrafı:** yüz hatları kusursuz, kulak ve gözlük sapı bulanık; tersine görsel aramada eşleşme yok.

> "Kaynaklarım doğruladı: kampüs saldırısı MERCAN-7. Bunu kimse söylemeyecek, ben söylüyorum." (+ K2 bağlantısı)

**Not:** Aynı cümle 08:12–08:17 arasında 12 farklı hesaptan, aynı yazım hatasıyla ("söylemiycek") paylaşıldı.
Bu hesapların 9'u son iki hafta içinde açılmış; hepsi aynı 30 hesabı takip ediyor.

---

## K4 — "Mercan Kolektifi" sorumluluk iddiası

- **Kanal:** Herkese açık bir mesajlaşma kanalı · **Tarih:** 2026-10-04 07:55
- **Kaynağın geçmişi:** Kanal 2026-10-02'de açılmış; tek gönderi.

> "Kampüs ağına biz girdik. MERCAN-7 her yerde. İşte ofisimiz:" (ekte `ofisimiz.jpg`)

`ofisimiz.jpg` için laboratuvarda alınan çıktı:

```text
$ exiftool ofisimiz.jpg
File Name                       : ofisimiz.jpg
Image Size                      : 4000x2667
Make                            : KameraX
Camera Model Name               : KameraX 200
Date/Time Original              : 2019:06:11 14:22:05
Create Date                     : 2019:06:11 14:22:05
Modify Date                     : 2026:10:04 07:41:18
Software                        : Fotoduzen 3.1
GPS Position                    : (yok)
Copyright                       : Liman Stok Gorsel Arsivi
```

Tersine görsel arama: aynı fotoğraf `liman-ofis-stok.example` sitesinde 2019'dan beri "modern ofis, deniz manzaralı" başlığıyla satılıyor.

---

## K5 — Fener Tehdit Laboratuvarı teknik raporu

- **Yazan:** Fener Tehdit Laboratuvarı (kurgusal güvenlik şirketi) · **Tarih:** 2026-10-06 16:00
- **Kaynağın geçmişi:** Beş yıldır yayın yapıyor; MERCAN-7'yi ilk 2024'te belgeleyen ekip. Önceki raporları bağımsız olarak doğrulanmış.

> **Özet:** `svc_update.dll` örnekleri, 2025 Mart'ında herkese açık bir forumda **sızdırılan MrcnLoader derleyicisi
> (builder)** ile üretilmiştir: imphash değeri derleyicinin varsayılan çıktısıyla aynıdır. Örneklerdeki `MERCAN-7 was here`
> dizisi, derleyicinin "imza" alanına elle yazılmıştır; MERCAN-7'nin 2024 örneklerinde böyle bir dize yoktur.
>
> **Davranış farkı:** MERCAN-7 tarihsel olarak kalıcılık için WMI olay aboneliği, komuta-kontrol için DNS tünelleme
> kullanır ve altyapısını `198.51.100.0/24` bloğunda, Kıyı Kayıt Ltd. üzerinden kurar. Bu kampanya zamanlanmış görev,
> HTTPS ve farklı bir kayıt şirketi kullanıyor.
>
> **Sonuç:** MERCAN-7 ile ilişkilendirme için yeterli kanıt yok (**düşük güven**). Derleyiciye erişimi olan herkes
> bu örnekleri üretebilir.

**Ek — örnek karşılaştırması (sandbox ve benzerlik analizi):**

| Örnek | SHA-256 (ilk 12) | imphash (ilk 8) | ssdeep benzerliği (H1'e göre) |
|---|---|---|---|
| H1 — kampanya `svc_update.dll` (LAB-PC-07) | `b310d596c237` | `5d41e68e` | — |
| H3 — kampanya `svc_update.dll` (LAB-PC-12) | `b64cef74e3d6` | `5d41e68e` | %94 |
| H5 — sızdırılan derleyicinin varsayılan çıktısı | `1bdc8f31c7f8` | `5d41e68e` | %88 |
| H4 — MERCAN-7 MrcnLoader (2024) | `a5e9ff6524c0` | `9bd7f5f8` | %12 |

---

## K6 — "Liman Gazetesi" haberi

- **Tarih:** 2026-10-04 09:30

> "Uzmanlara göre kampüs saldırısının arkasında MERCAN-7 var." (Kaynak bağlantısı: K2 blog yazısı)

## K7 — "Kampüs Haber" haberi

- **Tarih:** 2026-10-04 10:05

> "Birçok kaynak saldırıyı MERCAN-7'ye bağlıyor." (Kaynak bağlantıları: K2 blog yazısı ve K6 haberi)

---

## K8 — Altyapı kayıtları

WHOIS/RDAP, DNS, pasif DNS ve sertifika şeffaflığı (Certificate Transparency) kayıtları: `d-altyapi-kayitlari.txt`.
Bütün göstergelerin listesi: `d-ioc-listesi.csv`.
