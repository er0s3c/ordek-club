---
id: a-05
tur: ders
baslik: "Injection: tek bir tırnak neden bu kadar tehlikeli?"
sure: 8
hedefler:
  - SQL ve NoSQL enjeksiyonunun nedenini açıklamak
  - Parametreli sorgu ile açığı kapatmak
animasyonlar: [sql-injection]
gorseller:
  - id: a-05-b
    tur: ai
    alt: "Kütüphaneciye verilen istek fişinin sonuna eklenmiş küçük bir ek emir; robot kütüphaneci bütün dolapları açıyor"
    prompt: "A library request slip handed to a robot librarian: the slip has a normal request and then a small extra glowing green clause squeezed in after a quote-mark-shaped tear, and the robot obediently pulls open every drawer of the giant card catalog at once, cards flying everywhere."
  - id: a-05-c
    tur: ai
    alt: "İstek ve veri iki ayrı kutuda veriliyor; robot kütüphaneci yalnızca şablon formu uygulayıp veriyi kutudan çıkarmıyor"
    prompt: "The same robot librarian now receives a printed request form with a fixed empty slot, and the visitor's request sealed in a separate small box placed into the slot; the robot opens only the one correct drawer while the box stays sealed, no matter what is written inside it."
---

# Injection: tek bir tırnak neden bu kadar tehlikeli?

> Sunucu, senin yazdığını **veri** sanıyor. Ya yazdığın şey **komut** gibi davranırsa?
> 🗂️ **Çekmece 5:** Jasmine'in adı buradan geliyor. Bugün onun imzasını tanıyacaksın.

::cizgi[a-05-sahne]

## Sorun: veri ve komut aynı cümlede

![Kütüphaneciye verilen istek fişinin sonuna eklenmiş küçük bir ek emir; robot kütüphaneci bütün dolapları açıyor](../../gorseller/a-05-b.webp)

```python
sorgu = "SELECT * FROM ogrenciler WHERE ad = '" + girdi + "'"
```

Girdi `Ali` ise sorun yok. Girdi tek bir **`'`** içeriyorsa cümlenin yapısı bozulur;
sonrasına yazılan her şey SQL'in parçası olur. Klasik `' OR '1'='1` mantığı, koşulu her zaman doğru yapar.

::animasyon[sql-injection]

## Belirtiler (laboratuvarda)

- Tek tırnak eklenince **500 hatası** ya da veritabanı hata mesajı.
- Aynı aramada `'--` ile normal sonuç → yorum satırı işe yaradı.
- Yanıt boyutunda **ani büyüme** → fazladan veri dönüyor.

## NoSQL de muaf değil

JSON gövdede `{"sifre": {"$ne": null}}` gibi bir operatör, "parola boş değilse" anlamına gelip
kontrolü atlatabilir. Sebep aynı: girdi sorgunun **yapısını** değiştiriyor.

## Savunma: parametreli sorgu

![İstek ve veri iki ayrı kutuda veriliyor; robot kütüphaneci yalnızca şablon formu uygulayıp veriyi kutudan çıkarmıyor](../../gorseller/a-05-c.webp)

```python
cur.execute("SELECT * FROM ogrenciler WHERE ad = %s", (girdi,))
```

Sorgu ile veri **ayrı** gider; veritabanı girdiyi asla komut olarak çalıştırmaz. Ek katmanlar:

- ORM'in güvenli metotları (ham sorgu yerine)
- Uygulamanın veritabanı kullanıcısına **en az yetki**
- Kullanıcıya ayrıntılı veritabanı hatası gösterilmez
- NoSQL'de girdinin türü doğrulanır (nesne değil metin bekleniyorsa)

## 🧪 Dene (5 dk)

Yalnızca yerel Juice Shop'ta: giriş formunda e-posta alanına tek bir `'` yazıp dene.
Burp'te yanıtı incele. Hata ne söylüyor? Bu hata mesajı saldırgana neyi öğretir?

## ✅ Akılda kalsın

- Enjeksiyon = girdinin sorgunun yapısını değiştirmesi.
- Parametreli sorgu veriyi komuttan ayırır; asıl çözüm budur.
- Ayrıntılı hata mesajları saldırgana yol gösterir.
