---
id: m06-02
tur: ders
baslik: HTTP — tarayıcı ile sunucunun dili
sure: 7
hedefler:
  - HTTP yöntemlerini ve durum kodlarını tanımak
  - Önemli başlıkları okumak
gorseller:
  - id: m06-02-a
    tur: ekran
    alt: Tarayıcı geliştirici araçlarında Network sekmesi; istek listesi ve seçili isteğin başlıkları
    nasil: "Chrome/Edge'de https://example.com açın → F12 → 'Network' sekmesi → sayfayı yenileyin (F5). Listede ilk isteği (example.com, Status 200) seçin; sağdaki 'Headers' panelinde 'Request Method', 'Status Code' ve 'Response Headers' görünsün. Method ve Status satırlarını kehribar (#C9953B) çerçeveyle işaretleyin. Tarayıcı eklentileri veya kişisel sekmeler görünmesin."
  - id: m06-02-c
    tur: ai
    alt: "Servis penceresinden dönen dört renkli tepsi: yeşil tabak, yön gösteren tabela, boş tabak ve yanmış tencere"
    prompt: "A bakery service window where four trays slide out in a row, each with a colored light above it: a green-lit tray with a perfect cake, a yellow-lit tray holding a small signpost pointing to another window, an orange-lit tray with an empty plate and a puzzled customer, and a red-lit tray with a smoking burnt pot from the kitchen."
---

# HTTP — tarayıcı ile sunucunun dili

> Her tıklama, sunucuya yazılan kısa bir mektuptur. Bu mektupları okuyabilen,
> bir web uygulamasının nasıl çalıştığını — ve nerede hata yaptığını — görür.

::cizgi[m06-02-sahne]

## İstek ve yanıt

```http
GET /profil HTTP/1.1
Host: portal.kuzeykiyi.edu.example
Cookie: oturum=Vx8kq…
User-Agent: Mozilla/5.0

HTTP/1.1 200 OK
Content-Type: text/html; charset=utf-8
Set-Cookie: oturum=Vx8kq…; HttpOnly; Secure; SameSite=Lax
```

## Yöntemler (fiiller)

| Yöntem | Anlamı | Örnek |
|---|---|---|
| `GET` | Getir | Profil sayfasını göster |
| `POST` | Yeni bir şey gönder | Ödev yükle, giriş yap |
| `PUT` / `PATCH` | Güncelle (tamamen / kısmen) | Profil bilgisini değiştir |
| `DELETE` | Sil | Gönderiyi sil |

## Durum kodları

![Servis penceresinden dönen dört renkli tepsi: yeşil tabak, yön gösteren tabela, boş tabak ve yanmış tencere](../../gorseller/m06-02-c.webp)

| Kod | Anlamı | Akılda kalsın |
|---|---|---|
| **2xx** | Başarılı | 200 OK, 201 Created |
| **3xx** | Yönlendirme | 301/302: "şuraya git" |
| **4xx** | Senin hatan | 401 giriş yok, 403 yetki yok, 404 bulunamadı, 429 çok hızlı |
| **5xx** | Sunucunun hatası | 500: sunucu beklenmedik bir durumla karşılaştı |

Güvenlikçi için `403` ile `404` farkı bile bir ipucudur: "yok" mu, yoksa "var ama sana yasak" mı?

## Kendin bak

![Network sekmesi](../../gorseller/m06-02-a.webp)

## Güvenlik başlıkları

| Başlık | Ne işe yarar? |
|---|---|
| `Strict-Transport-Security` | Tarayıcıyı hep HTTPS kullanmaya zorlar |
| `Content-Security-Policy` | Sayfada hangi betiklerin çalışabileceğini sınırlar |
| `X-Frame-Options` | Sayfanın başka sitelerde gizlice gösterilmesini engeller |

## 🧪 Dene (4 dk)

F12 → Network → okulunun veya sevdiğin bir sitenin ana sayfasını yenile.
İlk isteğin durum kodu ne? Yukarıdaki üç güvenlik başlığından hangileri var?

## ✅ Akılda kalsın

- İstek: yöntem + adres + başlıklar (+ gövde); yanıt: durum kodu + başlıklar + gövde.
- 4xx istemci, 5xx sunucu hatasıdır; 401 ≠ 403.
- Güvenlik başlıkları tarayıcıya ek koruma kuralları verir.
