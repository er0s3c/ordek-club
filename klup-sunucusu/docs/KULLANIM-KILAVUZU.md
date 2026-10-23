# Ördek Club — Kullanım Kılavuzu

Bu kılavuz platformu üç rolden anlatır: öğrenci, eğitmen ve yönetici. Kurulum ve sunucu işlemleri için
[README.md](../README.md), sunum JSON biçimi için [SUNUM-FORMATI.md](SUNUM-FORMATI.md).

---

## Öğrenci

| Ne yapmak istiyorum? | Nerede |
|---|---|
| Kaldığım dersten devam etmek | **Ana sayfa** → Akademi kartı → *Devam et* |
| Bana verilen görevleri görmek | **Görevler** (menüdeki sayı: bekleyen görev) |
| Görev teslim etmek | Görev sayfası → metin + en fazla 5 dosya → *Teslim et*. Değerlendirilene kadar güncelleyebilirsin. |
| Otomatik puanlanan test çözmek | Görev sayfasındaki sorular → *Cevapları gönder*. Geçersen hemen onaylanır ve XP alırsın; geçemezsen (hakkın varsa) tekrar dene. |
| Takım görevi | Görev sayfasında takımın ve arkadaşların yazar. Takımdan biri teslim eder; herkes görür, günceller. Onayda XP herkese. |
| Canlı derse katılmak | **Canlı ders** → eğitmenin verdiği 6 haneli kod ya da QR |
| Canlı quiz / anket | Ders sırasında ekranın altında çıkar. Tek seçim; süre bitince kapanır. Sonucu eğitmen açıklar; doğru cevap XP kazandırır. |
| VMware uygulama molası | Uygulama slaytında teslim formu açılır: ne yaptığını yaz, ekran görüntüsü ekle. Sanal makineyi eğitmenin hazırladığı ortamda sen çalıştırırsın; platform VM başlatmaz. |
| Etkinliğe kaydolmak | **Sınıflar** → Etkinlikler → *Kaydol* (kapasite dolduysa “Dolu”) |
| Ders dosyalarını indirmek | **Dosyalar** |
| Bildirimler | **Bildirimler** (zil sayısı). E-posta bildirimlerini **Hesabım**'dan kapatabilirsin. |
| Parolamı unuttum | Giriş sayfası → *Parolamı unuttum* (kulüpte e-posta açıksa). Bağlantı 30 dakika geçerli ve tek kullanımlıktır. |
| Başka cihazdaki oturumu kapatmak | **Hesabım** → Açık oturumlar |

---

## Eğitmen

### Sunum hazırlama (Club Studio)
1. **Eğitmen paneli** → bir şablondan oluştur ya da JSON içe aktar.
2. Sunum sayfası → **Club Studio**.
3. Solda slaytlar (ekle, çoğalt, taşı, sil), ortada bloklar, sağda canlı önizleme (adım adım).
4. Her değişiklik birkaç saniye içinde **taslağa** kaydedilir; öğrenciler ve canlı dersler taslağı görmez.
5. Hazır olunca **Yayınla** → yeni sürüm. Sorun varsa (boş başlık, eksik alt metin…) yayın düğmesinin altında listelenir.
6. **Sürümler**: eski bir sürümü taslağa yükleyip yeniden yayınlayabilirsin; geçmiş silinmez.
7. **Şablon olarak paylaş**: yayınlanmış sunum diğer eğitmenlerin şablon listesine girer.

Blok türleri: başlık, metin, madde listesi (adım adım açılır), kod (adım adım satır vurgusu), terminal,
bilgi kutusu, animasyon (15 hazır siber güvenlik animasyonu), görsel (PNG/JPEG/WebP), VMware uygulama molası.

### Canlı ders
- Sunum sayfası → *Canlı dersi başlat* → kodu/QR'ı paylaş, *Projeksiyon ekranı*nı açarak yansıt.
- **Quiz / anket** paneli: soru + seçenekler (ya da *Doğru/Yanlış*), süre → *Başlat*. Canlı dağılımı görürsün;
  *Sonucu açıkla* deyince öğrenciler sonucu görür ve doğru cevaplayanlara XP verilir. Anonim ankette kimin ne
  seçtiğini sen de görmezsin.
- **Uygulama molası** slaytına gelince bağlı görev otomatik açılır; panelde VM/snapshot notları ve teslim durumu görünür.

### Görevler
- **Görevler** → *Yeni görev*: tür, zorluk, son teslim, rubrik, XP.
- Kime: tüm öğrenciler, seçili öğrenciler, bir **sınıf/etkinlik** ya da **takımlar** (`Takım adı: kullanici1, kullanici2`).
- **Otomatik puanlanan test**: soru türleri tek/çoklu seçim, doğru/yanlış, kısa cevap, eşleştirme; geçme yüzdesi ve deneme hakkı.
- Değerlendirme: görev sayfası → *Değerlendir* → rubrik puanları + geri bildirim → *Onayla* / *Düzeltme iste* / *Reddet*.
  Bekleyenleri seçip toplu onaylayabilirsin. XP yalnız onayda verilir.
- Teslim alındıktan sonra takımlar ve test soruları değiştirilemez (önceki puanlar anlamsızlaşmasın).

### Sınıflar ve etkinlikler
- **Sınıflar** → *Sınıf ya da etkinlik oluştur*. Sınıf üyelerini sen eklersin; etkinlikte tarih, yer, kapasite ve
  “öğrenciler kendileri kaydolabilsin” seçeneği vardır.
- Görev ve dosyaları bir gruba hedefleyebilirsin; arşivlenen grubun görev/dosyaları üyelerine kapanır.

### Dosyalar
- **Dosyalar** → kulübe, seçili üyelere ya da bir sınıfa paylaş. Görev ekleri görev sayfasından yüklenir.
- İzin verilen türler: PDF, görsel, metin/log/kod, PCAP, ZIP. Çalıştırılabilir dosyalar, şifreli/iç içe ZIP'ler ve
  ZIP içinde çalıştırılabilir dosya reddedilir. Sunucuda ClamAV açıksa her dosya ayrıca taranır.

### Analitik
**Analitik**: haftalık aktif öğrenci, yol tamamlanma, en zorlayan quizler, görev katılımı, canlı ders katılımı,
XP kaynakları. Bireysel öğrenci listesi gösterilmez.

---

## Yönetici / kurucu

| İş | Nerede |
|---|---|
| Üyelik başvurularını onaylamak, rol vermek | **Yönetim** → Üyeler |
| Davet kodu | **Yönetim** → Davetler |
| Kayıt politikası, kotalar, dosya boyutu | **Yönetim** → Kulüp ayarları |
| E-posta durumu | Kulüp ayarları → E-posta (SMTP sunucudaki `.env`'de) |
| Sahipliği devretmek (yalnız kurucu) | Kulüp ayarları → *Sahiplik devri* (hedef önce ADMIN yapılmalı; parolan sorulur) |
| XP düzeltme, rozetler | **Yönetim** → XP ve seviyeler / Rozetler |
| Denetim kaydı | **Yönetim** → Denetim kaydı |
| Depolama ve sistem sağlığı | **Yönetim** → Sistem durumu |

### Sunucu tarafı (isteğe bağlı özellikler)
```bash
# E-posta: .env içine
SMTP_HOST=smtp.ornek.edu.tr
SMTP_PORT=587
SMTP_SECURE=0
SMTP_USER=kulup@ornek.edu.tr
SMTP_PASS=...
SMTP_FROM="Siber Kulüp <kulup@ornek.edu.tr>"

# Virüs taraması
CLAMAV_HOST=clamav
docker compose --profile clamav up -d
```

---

## Güvenlik notları
- Laboratuvar ve görev içerikleri yalnız izinli, izole ortamlarda kullanılmalıdır; gerçek kişi/kurum hedef alınmaz.
- Platform sanal makine başlatmaz ve Ördek Labs ile veritabanı/ağ paylaşmaz.
- Yüklenen dosyalar her zaman indirme olarak sunulur (görseller hariç); uygulama kökeninde çalıştırılmaz.
