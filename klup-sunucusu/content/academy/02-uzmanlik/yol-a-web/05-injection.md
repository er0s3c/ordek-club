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
  - id: a-05-a
    tur: ai
    karakter: jasmine
    alt: "Tek Tırnak Jasmine kütüphane masasına son satırı yeşil parlayan bir istek fişi bırakıyor; kütüphaneci robot bütün çekmeceleri boşaltmaya başlıyor"
    prompt: "A grand dim library with a tall wooden card-catalogue cabinet behind the front desk. The villain leans on the desk and slides a request slip toward a small librarian robot; the last line of the slip glows bright green. The robot reads it obediently and starts pulling out every single drawer of the cabinet, piles of glowing index cards spilling onto the floor."
---

# Injection: tek bir tırnak neden bu kadar tehlikeli?

> Sunucu, senin yazdığını **veri** sanıyor. Ya yazdığın şey **komut** gibi davranırsa?
> 🗂️ **Çekmece 5:** Jasmine'in adı buradan geliyor. Bugün onun imzasını tanıyacaksın.

![Tek Tırnak Jasmine kütüphane masasına son satırı yeşil parlayan bir istek fişi bırakıyor; kütüphaneci robot bütün çekmeceleri boşaltmaya başlıyor](../../gorseller/a-05-a.webp)

## Sorun: veri ve komut aynı cümlede

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
