---
id: a-02
tur: ders
baslik: "Keşif: hedefin nesi var?"
sure: 7
hedefler:
  - Pasif ve aktif keşfi ayırt etmek
  - Kapsam içinde bir varlık envanteri çıkarmak
gorseller:
  - id: a-02-b
    tur: ai
    alt: "Solda bina etrafında dürbünle uzaktan dolaşan öğrenci (pasif), sağda kapıları tek tek nazikçe yoklayan öğrenci (aktif)"
    prompt: "Split scene around the same campus building: on the left a student watches from across the street through binoculars, taking notes without moving closer; on the right the same student walks right up to the building and gently knocks on each door one by one, noting which ones answer."
---

# Keşif: hedefin nesi var?

> Saldırganlar en çok **unutulmuş** şeyleri sever: eski bir test sitesi, bir yedek dosya, kapatılmayı bekleyen bir API.
> 🗂️ **Çekmece 2:** Jasmine portalın haritasını çıkarıyor. Senin haritan onunkinden eksiksiz olmalı.

::cizgi[a-02-sahne]

## İki tür keşif

![Solda bina etrafında dürbünle uzaktan dolaşan öğrenci (pasif), sağda kapıları tek tek nazikçe yoklayan öğrenci (aktif)](../../gorseller/a-02-b.webp)

| | Pasif | Aktif |
|---|---|---|
| Hedefe dokunur mu? | Hayır | Evet |
| Örnek | Sertifika kayıtları, arama motoru, web arşivi | Dizin tarama, port tarama, form deneme |
| Ne zaman? | Kapsam belirlendikten sonra | **Yalnızca yazılı izinle**, kapsam içinde |

## Neye bakılır?

- **Alt alan adları:** `test.`, `eski-portal.`, `dev.` — sertifika şeffaflık kayıtları bunları ele verir.
- **Yol ipuçları:** `/robots.txt`, `sitemap.xml`, JavaScript dosyalarındaki API adresleri.
- **Unutulan dosyalar:** `.bak`, `.zip`, `.git/`, eski yedekler.
- **API dokümanı:** `/swagger.json`, `/api-docs` — bütün kapıların listesi.
- **Teknoloji:** sunucu başlıkları, çerez adları, hata sayfaları (hangi framework, hangi sürüm?).

## Envanter tablosu

Bulduğun her şeyi yaz; rapor bu tabloyla başlar.

| Varlık | Nasıl buldun? | Kapsamda mı? | Not |
|---|---|---|---|
| `/ftp` | robots.txt | ✅ | Dosya listesi açık |
| `/api/...` | app.js içinde | ✅ | Kimlik doğrulama yok mu? |

Kapsam dışındaki bir şey bulursan **dokunma**, yalnızca not al ve sorumluna bildir.

## 🧪 Dene (5 dk)

Yerel Juice Shop'ta `http://127.0.0.1:3000/robots.txt` adresine bak. Hangi yolu gizlemeye çalışıyorlar?
Sonra Burp'te `main.js` yanıtında `/api/` ve `/rest/` geçen yolları ara (*Ctrl+F*). Kaç uç nokta buldun?

## ✅ Akılda kalsın

- Pasif keşif hedefe dokunmaz; aktif keşif yalnızca izinle yapılır.
- robots.txt, JS dosyaları ve API dokümanları kapıların haritasıdır.
- Envanter tablosu raporun ilk sayfasıdır.
