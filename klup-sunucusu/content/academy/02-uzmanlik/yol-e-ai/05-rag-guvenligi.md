---
id: e-05
tur: ders
baslik: "RAG güvenliği: zehirli belge bilgi tabanına nasıl girer?"
sure: 8
hedefler:
  - Zehirli belge türlerini ve veri zehirlemeyi tanımak
  - Belge künyesi, erişim filtresi ve kaynak doğrulamayla RAG'i korumak
gorseller:
  - id: e-05-b
    tur: ai
    alt: "Kütüphanenin giriş kapısında belgeleri tek tek kontrol eden görevli; zehirli yeşil sızan bir belge geri çevriliyor"
    prompt: "A librarian guard stands at the delivery door of a library, inspecting each incoming document with a magnifying lens and checking a source stamp, rejecting one that drips with glowing green ink while clean documents go onto the shelves."
---

# RAG güvenliği: zehirli belge bilgi tabanına nasıl girer?

> RAG'de saldırganın modelle konuşması bile gerekmez; **bilgi tabanına bir belge sokması** yeter.
> 🎭 **Ses 5:** Kampüs forumuna yazılan duyurular gece kendiliğinden Ayna'nın bilgi tabanına giriyor. Kimse kontrol etmiyor.

::cizgi[e-05-sahne]

## Zehirli belge türleri

| Tür | Ne yapar? | Örnek |
|---|---|---|
| Gizli talimat | Dolaylı enjeksiyon | HTML yorumu, beyaz zemine beyaz yazı |
| Yanlış bilgi | Kullanıcıyı yanıltır | "Parolanı şu adrese e-postayla gönder" |
| Arama tuzağı | Her soruda getirilmek için popüler kelimeler doldurur | "burs sınav yurt kütüphane…" |

Veri zehirleme (*data poisoning*, LLM04) aynı fikrin eğitim tarafıdır: modeli eğitmek veya
ince ayar (*fine-tuning*) için kullanılan veriye kötü örnekler sokmak.

## Kaynağı doğrula

Her belgeye bir **künye** (*metadata*) ekle ve getirirken kullan:

- `kaynak`: resmi birim mi, forum mu, bilinmeyen bir yükleme mi?
- `tarih` ve `yukleyen`: kim, ne zaman ekledi?
- `erisim`: herkes mi, yalnız personel mi?

Kullanıcı içeriğini ve resmi içeriği **ayrı koleksiyonlarda** tut. Cevapta kaynağı göster ki kullanıcı kontrol edebilsin.

## Bilgi tabanının giriş kapısı

![Kütüphanenin giriş kapısında belgeleri tek tek kontrol eden görevli; zehirli yeşil sızan bir belge geri çevriliyor](../../gorseller/e-05-b.webp)

```text
yükleme → temizle (HTML yorumu, gizli stil, görünmez karakter) → tara (talimat kalıbı) → onay → indeksle
```

- Resmi koleksiyona yalnız yetkili birimler yazar.
- Getirme (*retrieval*) sırasında kullanıcının yetkisi filtrelenir (E04). Vektör aramasında
  bu filtre unutulursa "benzer" diye gizli belge de gelir (LLM08).
- Şüpheli her belge loglanır ve geri alınabilir.

## 🧪 Dene (5 dk)

`lab/e-ayna-belgeler.jsonl` dosyasını bir metin editöründe aç (hiçbir şey çalıştırmadan):

1. Gizli talimat taşıyan belgeyi bul.
2. Yanlış bilgi içeren belgeyi bul. Hangi künye alanı seni uyardı? Hangi belge onu yalanlıyor?
3. Yetkisi olmayan herkese getirilebilecek belge hangisi?

## ✅ Akılda kalsın

- RAG'de bilgi tabanına giren her belge, modele verilen bir talimat adayıdır.
- Kaynak, tarih ve erişim yetkisi künyede tutulur ve getirmede kullanılır.
- Bilgi tabanına giriş, bir yazılım dağıtımı gibi temizlenir, onaylanır ve geri alınabilir.
