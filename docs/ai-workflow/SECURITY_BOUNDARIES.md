# Güvenlik Sınırları ve İzolasyon Kuralları

## 1. Çalışma alanları

| | Çalışma alanı A — Club | Çalışma alanı B — Ördek Labs |
|---|---|---|
| Klasör | `klup-sunucusu/` | Kök dizin (`app/`, `lib/`, `docker/`, `internal/`, `proxy/` …) |
| Sorumlu | Opus 5.5 | Mimari/savunma: Opus 5.5 · Yetkili lab doğrulaması: Opus 4.8 |
| İçerebilir | Eğitim platformu, savunma kodu, savunma testleri | Kasıtlı zafiyetli hedefler, lab senaryoları |
| İçeremez | Saldırı lab'ı, exploit çalıştırıcı, flag sistemi, docker.sock, VMware otomasyonu | Club veritabanı bağlantısı, Club gizli anahtarları |

Aralarında **otomatik erişim, ortak veritabanı, ortak `.env`, ortak Docker ağı veya ortak volume yoktur.**
Club XP'si ile Lab XP'si ayrı sistemlerdir.

## 2. Opus 4.8 görevleri için zorunlu kapsam

Her `OPUS_48_TASKS.md` görevi başlamadan önce şunları yazılı olarak içermelidir:

- **Hedef:** yalnızca yerel veya açıkça yetkilendirilmiş Ördek Labs hedefi (ör. `ordek-lab:latest` imajından başlatılmış tek bir makine).
- **Yetki:** repository sahibinin (kullanıcı) görev dosyasındaki açık onayı.
- **Kapsam dışı (her zaman):** Club sunucusu (geliştirme dahil), gerçek öğrenci hesapları, gerçek kişisel veri,
  üretim gizli anahtarları, üçüncü taraf sistemler, internet üzerindeki herhangi bir host, host Docker soketi.
- **Ortam:** ayrı VM ya da izole container ağı; `internal: true` Docker ağı veya egress engelli VM.
- **Veri:** yalnızca sentetik test verisi ve tek kullanımlık test kimlik bilgileri.
- **Durdurma koşulu:** lab ağı dışına herhangi bir bağlantı denemesi, beklenmeyen host erişimi veya kapsam belirsizliği → dur, raporla.
- **Temizlik:** test sonunda konteyner/VM/volume'ler silinir; çıktı yalnızca rapor dosyasıdır.

## 3. Club tarafı savunma ilkeleri (Opus 5.5)

- Yetkilendirme sunucu tarafında, her handler'da; istemciye güvenilmez (rol, XP, kullanıcı ID'si istemciden alınmaz).
- Nesne erişimi her zaman sahiplik/hedef kontrolüyle (IDOR/BOLA).
- Oturum token'ları DB'de yalnızca SHA-256 hash olarak saklanır; çerez `HttpOnly`, `SameSite=Lax`, HTTPS'te `Secure`.
- Mutasyon yapan API çağrılarında Origin/Host eşleşmesi (CSRF) + JSON content-type zorunluluğu.
- CSP (nonce'lu), `X-Content-Type-Options: nosniff`, `Referrer-Policy`, `frame-ancestors 'none'`.
- Yüklenen dosyalar public dizine yazılmaz; imza (magic byte) + boyut + MIME kontrolü; `Content-Disposition` ile servis.
- Admin işlemleri `AuditLog`'a yazılır.
- Docker: root olmayan kullanıcı, `no-new-privileges`, salt-okunur kök FS (yazılabilir yalnız `storage`), docker.sock bağlanmaz.

## 4. Lab doğrulamasında yasak olanlar

- Club sunucusuna (localhost dahil) karşı exploit denemesi. Club'ın güvenlik testleri Opus 5.5'in savunma
  regresyon testleridir (`klup-sunucusu/tests/`), saldırı lab'ı değildir.
- Üretim/canlı ortamda exploit doğrulaması.
- Model değişikliğini güvenlik kontrollerini aşmak için kullanmak.
