---
id: e-05
tur: ders
baslik: "RAG güvenliği: zehirli belge bilgi tabanına nasıl girer?"
sure: 8
hedefler:
  - Zehirli belge türlerini ve veri zehirlemeyi tanımak
  - Belge künyesi, erişim filtresi ve kaynak doğrulamayla RAG'i korumak
gorseller:
  - id: e-05-a
    tur: ai
    karakter: veysel
    alt: "Vantrolog Veysel tekerlekli kütüphane merdiveninde, robot kuklanın kulağına akan dosya rafına yeşil mühürlü tek bir dosya sıkıştırıyor"
    prompt: "A vast archive hall with towering shelves of identical glowing folders; a brass funnel collects folders from the shelves and pours them into the ear of a translucent robot puppet sitting at the bottom. High up on a rolling library ladder, the villain carefully slips one single folder with a faint glowing green seal between the identical ones, while a large magnifying glass lies forgotten on the floor below."
---

# RAG güvenliği: zehirli belge bilgi tabanına nasıl girer?

> RAG'de saldırganın modelle konuşması bile gerekmez; **bilgi tabanına bir belge sokması** yeter.
> 🎭 **Ses 5:** Kampüs forumuna yazılan duyurular gece kendiliğinden Ayna'nın bilgi tabanına giriyor. Kimse kontrol etmiyor.

![Vantrolog Veysel tekerlekli kütüphane merdiveninde, robot kuklanın kulağına akan dosya rafına yeşil mühürlü tek bir dosya sıkıştırıyor](../../gorseller/e-05-a.webp)

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
