# Akademi laboratuvar dosyaları

Derslerde kullanılan **sentetik** dosyalar. Gerçek kişi, kurum veya trafik verisi içermez;
IP adresleri yalnızca belgelendirme için ayrılmış aralıklardandır (RFC 5737: 192.0.2.0/24, 198.51.100.0/24, 203.0.113.0/24),
alan adları `.test` / `.example` uzantılıdır (hiçbir zaman gerçek bir sunucuya çözülmez). Gizli anahtar, parola ve
hash'lerin hepsi sahtedir. **Hiçbir dosya çalıştırılabilir zararlı kod içermez**; tek betik `e-ayna-mini.py`
bilerek güvensiz bırakılmış, yalnız yerel modelle çalışan bir oyuncak uygulamadır.

| Dosya | Kullanıldığı yer | Laboratuvar VM'indeki yeri |
|---|---|---|
| `auth.log` | M04-03 (grep), M07 (Log Dedektifi), M10, Yol C — C03, C07 | `/opt/akademi/auth.log` |
| `access.log` | Yol A — A11 (loglarda saldırı izi) | `/opt/akademi/access.log` |
| `c-alarmlar.csv` | Yol C — C01 (triyaj), C12 | `/opt/akademi/c-alarmlar.csv` |
| `c-windows-olaylar.jsonl` | Yol C — C02, C06, C07, C12 | `/opt/akademi/c-windows-olaylar.jsonl` |
| `c-sysmon.csv` | Yol C — C05, C06, C11, C12 | `/opt/akademi/c-sysmon.csv` |
| `c-dns.log` | Yol C — C08, C12 | `/opt/akademi/c-dns.log` |
| `c-bakim-strings.txt` | Yol C — C09, C12 | `/opt/akademi/c-bakim-strings.txt` |
| `d-tehdit-raporlari.md` | Yol D — D01, D02, D04, D05, D09, D11, D12 | `/opt/akademi/d-tehdit-raporlari.md` |
| `d-altyapi-kayitlari.txt` | Yol D — D03, D08, D11, D12 | `/opt/akademi/d-altyapi-kayitlari.txt` |
| `d-ioc-listesi.csv` | Yol D — D06, D09, D12 | `/opt/akademi/d-ioc-listesi.csv` |
| `d-stix-paketi.json` | Yol D — D08, D12 | `/opt/akademi/d-stix-paketi.json` |
| `d-av-olaylari.jsonl` | Yol D — D10, D12 (av veri seti) | `/opt/akademi/d-av-olaylari.jsonl` |
| `e-ayna-mini.py` | Yol E — E02–E10, E12 (bilerek güvensiz oyuncak RAG sohbet robotu; yerel Ollama) | `/opt/akademi/ayna/` |
| `e-ayna-belgeler.jsonl` | Yol E — E02–E05, E10, E12 (Ayna-mini bilgi tabanı) | `/opt/akademi/ayna/` |
| `e-redteam-testleri.csv` | Yol E — E08–E12 (red team test listesi) | `/opt/akademi/ayna/` |
| `e-sohbet-kayitlari.jsonl` | Yol E — E11, E12 (sohbet kaydı incelemesi) | `/opt/akademi/ayna/` |
| `f-AndroidManifest.xml` | Yol F — F02, F03, F05 | `/opt/akademi/f-AndroidManifest.xml` |
| `f-mqtt.log` | Yol F — F07, F09, F11 | `/opt/akademi/f-mqtt.log` |
| `f-firmware-listesi.txt` | Yol F — F08, F11 | `/opt/akademi/f-firmware-listesi.txt` |
| `f-cihaz-config.txt` | Yol F — F11, F12 | `/opt/akademi/f-cihaz-config.txt` |
| `g-saat-bocegi-pe.txt` | Yol G — G02, G04, G10 | `/opt/akademi/g-saat-bocegi-pe.txt` |
| `g-saat-bocegi-strings.txt` | Yol G — G04, G05, G07, G11 | `/opt/akademi/g-saat-bocegi-strings.txt` |
| `g-saat-bocegi-sandbox.json` | Yol G — G08 (`jq` gerekir) | `/opt/akademi/g-saat-bocegi-sandbox.json` |
| `g-yara-alistirma.yar` | Yol G — G11 (`yara` gerekir) | `/opt/akademi/g-yara-alistirma.yar` |

Kurulum (laboratuvar VM'inde, bir kez):

```bash
sudo mkdir -p /opt/akademi/ayna
sudo cp auth.log access.log c-* d-* f-* g-* /opt/akademi/
sudo cp e-* /opt/akademi/ayna/
sudo chmod 644 /opt/akademi/* /opt/akademi/ayna/*
ollama pull llama3.2:3b        # Yol E için (yerel model)
```

Ayna-mini kendi klasörüne `ayna-gecmis.html` yazar; öğrenciler klasörü ev dizinlerine kopyalayıp orada çalıştırır.

## Eğitmenin hazırlaması gerekenler (henüz depoda yok)

| Ders | Gereken |
|---|---|
| C04 | `/opt/akademi/ornek.pcap` — IDS alıştırması için örnek trafik kaydı |
| C10 | `ws07-disk.E01`, `ws07-bellek.raw` — KLP-WS07 olayına uygun disk ve bellek imajı (`bakim.exe`, ebeveyni `services.exe`, 198.51.100.200 bağlantısı) |
| C03 | Wazuh kuralı `if_sid 5716`'ya dayanır; laboratuvardaki Wazuh sürümünde kontrol et |
| F10 | `192.0.2.50` üzerinde Modbus simülatörü ve laboratuvar VM'inde `mbpoll` |
| F12 | (A seçeneği) kulübün ESP32 kilit kiti |
| F03 | DIVA eğitim uygulaması (paket adı ve ekran adlarını derse girmeden doğrula) |
| G01, G05, G06, G12 | EICAR test dosyası, eğitim crackme'si, .NET eğitim örneği, final için zararsız örnek |

## Eğitmen notları (cevaplar — derste vermeyin)

> **`auth.log`:** tek bir IP'den (203.0.113.66) kısa sürede yoğun başarısız giriş, ardından `deploy` hesabıyla başarılı
> parola girişi (Mar 3 15:34:14): kaba kuvvet başarıya ulaşmış. Aynı IP, Yol C'de KLP-WS07'ye giren adrestir.

> **`access.log`:** saldırgan 203.0.113.77 önce keşif yapar (robots.txt, yedek dosya, API dokümanı), sonra arama
> parametresinde SQL enjeksiyonu dener. Başarılı satır: UNION sorgusu, yanıt boyutu normalin (~2 KB) çok üstünde
> (186442 bayt). Ardından path traversal (403), yansıyan XSS denemesi, kaba kuvvet (429) ve ardışık kimliklerle IDOR taraması.

> **Yol C (KLP-WS07, 2026-03-14):**
> - Alarm kuyruğu 23 alarm; 13 "IDS: Port taraması" gürültüsü (alarm yorgunluğu). Gerçek olanlar KLP-WS07'de: AL-1005/1006
>   (RDP kaba kuvvet ve başarı), AL-1008, AL-1009 (yeni yönetici), AL-1011 (hizmet), AL-1019 (denetim politikası),
>   AL-1021 (log temizlendi), AL-1022 (saat değişti). Yanlış pozitifler: AL-1001 (yedek), AL-1014 (antivirüs güncellemesi).
> - Gerçek zaman çizelgesi: 02:03–02:09 on iki 4625 → 02:10:02 lab-admin 4624 tür 10 → 02:12 `bakim.ps1`, DNS, 198.51.100.200:443
>   → 02:13 `bakim.exe` → 02:14 `yardim.masasi` yönetici yapılır (4720/4732) → 02:15 `WinBakimSvc` (7045) ve Run `WinBakim`
>   → 02:38 denetim kapatılır (4719) → 02:40 `wevtutil cl Security` + 1102 → 02:41 saat 6 saat ileri (4616)
>   → 02:42 timestomp (Sysmon 2) → 02:43 `bakim.ps1` silinir (Sysmon 23) → 04:10 GPO denetimi geri açar → 08:41 NTP saati düzeltir.
>   08:52 deniz.kaya'nın konsol girişi meşrudur. Ana bilgisayar saatine göre 02:40–08:41 arası boş: "altı saatlik boşluk".
> - Beacon her 30 dk (02:16–08:46, 14 bağlantı). DNS: `guncelleme.kotu.test` (taklit: `guncelleme.kampus.test`);
>   TXT alt alanları hex → `KLP-WS07`, `lab-admin`, `temizlik`, `yardim.masasi`. Son kayıtta `ayna` ×3 (hikâye ipucu).

> **Yol D (kurgusal "MERCAN-7" vakası):**
> - D02: sıra K4 (07:55) → K2 (08:10) → K3 (08:12–08:17) → K6 (09:30) → K7 (10:05); kaynak K4, K6/K7 döngüsel haber.
> - D03: üç kampanya alan adı 2026-09-14 03:17–03:18'de aynı kayıt kuruluşu ve `ns1/ns2.ayna-dns.example` ile kaydedilmiş;
>   `mrcn-sync.example` hiçbirini paylaşmaz. Sertifikada `panel.ayna-teknoloji.example` de var.
> - D04: fotoğraf 2019'dan, paylaşımdan 14 dk önce düzenlenmiş, stok arşivde. D05: `@gercek_analist_x` sahte hesap.
> - D07: MERCAN-7'nin bilinen teknikleri (T1546.003, T1071.004) kampanyayla (T1053.005, T1071.001) örtüşmez.
> - D08: STIX'teki `attributed-to` güveni 95 ve anonim blogdan; `198.51.100.200` paylaşımlı CDN, `e2a9db…` meşru yazıcı
>   sürücüsü → ikisi de yanlış pozitif. D09: ortak imphash "sızan builder" demektir, "MERCAN-7" değil.
> - D10: etkilenen LAB-PC-07 (09:12) ve LAB-PC-12 (09:47); beacon ~15 dk; LAB-PC-07 10:13'te `203.0.113.47:8443`'e bağlanır.
>   `-enc` metni çözülünce `mercan-guncelleme.example` indirme satırı çıkar (alan adı çözülmez, yalnız veri).
> - D11/D12: en az çelişkiyi H2 ("başkası, sahte bayrakla") alır. MERCAN-7 olasılıkla yazar değil; altyapı muhtemelen
>   Ayna Teknoloji ile bağlantılı (orta güven). Önerilen engelleme listesinden iki yanlış pozitif çıkarılmalı.

> **Yol E (Ayna-mini):**
> - Belgeler: d06 HTML yorumunda gizli talimat (dolaylı enjeksiyon); d08 parola isteyen zehirli belge (d03 ile çelişir);
>   d05 personel belgesi ama erişim alanı kontrol edilmez.
> - Betikteki açıklar `# Açık` ile işaretli: sistem isteminde sahte bayrak `KALKAN{ayna-ilk-ses}`, koda gömülü sahte anahtar,
>   erişim kontrolü yok, belge metni ham giriyor, araçlar onaysız (not_goster her öğrencinin notunu gösterir),
>   HTML kaçışlanmıyor, hız/uzunluk sınırı ve loglama yok.
> - Sohbet kayıtları: s-03 bayrak sızdı (LLM01/07), s-04 sistem istemi sızdı (LLM07), s-06 dolaylı enjeksiyon + dışarıya
>   e-posta (en ciddi, LLM01/06), s-07 başka öğrencinin notu (LLM06), s-09 personel listesi (LLM02/08), s-10 zehirli belge
>   (LLM04/09), s-11 XSS (LLM05), s-12 aşırı istek (LLM10). s-02, s-08 deneme; s-05 yanlış pozitif tuzağı.
> - Red team: güvensiz sürümde T06, T07, T08, T10, T11 güvenilir şekilde başarılı; T01–T05 modele bağlı.

> **Yol F:**
> - `f-AndroidManifest.xml`: `debuggable`, `allowBackup`, `usesCleartextTraffic` true; kilit uygulamasına uymayan izinler
>   (rehber, SMS, mikrofon, arka plan konumu, kamera); sahte API anahtarı, `http://` taban adresi; izinsiz dışa açık
>   `YoneticiPaneliActivity`, `KapiAcActivity`, `KomutAlici`, `KayitSaglayici`. `BleKilitServisi` doğru biçimde kapalı.
> - `f-mqtt.log`: TLS yok (1883), kilit ve sensör anonim, kamera `admin/admin` ve RTSP parolası açık; `x9` (203.0.113.66)
>   `#` ve `$SYS/#`'e abone olur, 23:40'ta `{"komut":"ac"}` mesajını `retain=1` ile yayınlar → 02:04 elektrik kesintisinden
>   sonra kilit yeniden bağlanınca kapı tekrar açılır.
> - `f-firmware-listesi.txt`: root parolası boş, telnet parolasız, UART konsolu açık, UPnP ile 80/554 açılıyor,
>   güncelleme HTTP ve imzasız, `admin/admin`, düz metin anahtarlar, eski BusyBox/OpenSSL.
> - `f-cihaz-config.txt`: OWASP IoT Top 10 eşlemesi I1–I10 (varsayılan parola, açık servisler, güvensiz API, imzasız
>   güncelleme, eski bileşen, kişisel veri loglama, güvensiz MQTT, uzaktan log yok, UART/JTAG açık; düz ağ).

> **Yol G (kurgusal `kampus-saat-guncelleme.exe`):**
> - G02: x64, imzasız; `.cark` bölümü RWX, entropi 7,91, giriş noktası `.cark` içinde; derleme zamanı sahte (2006-10-22 03:00);
>   `DYNAMIC_BASE` ve `GUARD_CF` yok.
> - G04: IOC'ler `zamanlayici.kurmali-sabri.test`, `yedek.kurmali-sabri.test`, 198.51.100.23, 203.0.113.45, `/cark/kur`,
>   `/cark/teslim`, UA `SaatKulesi/1.0 (Kurgu; Windows NT 10.0)`, mutex `Global\SaatIsliyor-03`, Run `KampusSaat`.
> - G05: `IsDebuggerPresent`, 600 sn `Sleep`, sanal makine ve analiz aracı araması.
> - G07: truva atı + bilgi toplayıcı + yükleyici; kalıcılık HKCU Run `KampusSaat` ve `KampusSaatSenkron` görevi.
> - G08: süreç ağacı explorer.exe → kampus-saat-guncelleme.exe → cmd.exe → schtasks.exe ve saatkulesi.exe;
>   `%TEMP%\cark.dat`, POST `/cark/teslim`. Böcek her gün 03:00'te uyanır.
> - G11 YARA: mutex, görev adı, UA, alan adı ve `4B 55 52 47 55` ("KURGU"). Kötü kuralın sorunları: `http`/`Software`
>   fazla genel, IP kolay değişir, `any of them` gevşek, MZ kontrolü yok. İpuçları: `AYNA_BESLE`, `imza=LMN-2006-ALTIN`.
