---
id: d-01
tur: ders
baslik: "OSINT metodolojisi: önce soru, sonra arama"
sure: 7
hedefler:
  - Bir OSINT çalışmasını araştırma sorusu ve yazılı kapsamla başlatmak
  - Bulguları kaynak, tarih ve kanıtla kayda geçirmek
gorseller:
  - id: d-01-a
    tur: ai
    karakter: bedri
    alt: "Bayrakçı Bedri bir harita masasına onlarca sahte bayrak iğnesi saçıyor; masanın kenarında pergel ve tek bir düzgün rota bekliyor"
    prompt: "A captain's chart table under a hanging brass lamp, covered with a wide sea map. The villain leans over it with a sly half-smile, scattering dozens of tiny decoy flag pins across the map in every direction, while at the edge of the table a neat compass, a ruler and one carefully drawn route lie untouched, waiting to be used."
---

# OSINT metodolojisi: önce soru, sonra arama

> Sorusu olmayan araştırmacı, her bayrağın peşinden koşar. Bedri tam olarak bunu ister.
> 🚩 **Bayrak 1:** Kampüse yapılan saldırıdan bir gün sonra herkes aynı ismi söylüyor: MERCAN-7. Selim Hoca sadece soruyor: "Sorun ne, Tilki?"

![Bayrakçı Bedri bir harita masasına onlarca sahte bayrak iğnesi saçıyor; masanın kenarında pergel ve tek bir düzgün rota bekliyor](../../gorseller/d-01-a.webp)

## Araştırma sorusu

"MERCAN-7 hakkında her şeyi bul" bir soru değil, bir kuyudur. İyi soru **dar, cevaplanabilir ve amaca bağlıdır**:

| ❌ Belirsiz | ✅ Araştırılabilir |
|---|---|
| Saldırıyı kim yaptı? | Saldırıda kullanılan alan adları kimin altyapısına bağlı? |
| Bu grup tehlikeli mi? | Bu grubun bilinen teknikleri bizim ağımızda görüldü mü? |

## Kapsam ve etik

Başlamadan önce yaz, imzalat:

```text
Soru     : Kampanya altyapısı daha önce görülmüş bir altyapıyla örtüşüyor mu?
Hedef    : Yalnızca vaka dosyasındaki alan adları ve IP'ler (lab/d-*)
Yasak    : Gerçek kişileri araştırmak, hedefe giriş denemesi, sahte hesapla etkileşim
Veri     : Soruya yetecek kadar; kişisel veri toplanmaz (KVKK/GDPR — M02)
Süre     : 2 gün, sonra Selim Hoca'ya ara rapor
```

## OSINT döngüsü

1. **Planla** — soru, kapsam, olası kaynaklar
2. **Topla** — pasif yöntemler önce (arama, arşiv, kayıtlar)
3. **İşle** — tekrarları ayıkla, tarihleri hizala
4. **Doğrula** — en az iki bağımsız kaynak
5. **Raporla** — bulgu + kanıt + güven düzeyi

## Araştırma günlüğü (research log)

Bulduğun her şey için: **ne, nerede, ne zaman, nasıl**. Ekran görüntüsü al, sayfa arşivlenmişse bağlantısını yaz.
Bir hafta sonra "bunu nereden bulmuştum?" sorusunun cevabı günlükte olmalı; yoksa bulgu kanıt değil, söylentidir.

## 🧪 Dene (4 dk)

`lab/d-tehdit-raporlari.md` dosyasının yalnızca başlıklarını oku. Bu vaka için **bir** araştırılabilir soru ve
yukarıdaki şablona göre beş satırlık bir kapsam yaz. "Yasak" satırına en az iki madde ekle.

## ✅ Akılda kalsın

- Önce soru: dar, cevaplanabilir, amaca bağlı.
- Kapsam yazılı olur; gerçek kişiler ve izinsiz hedefler her zaman dışarıda.
- Günlüğe yazılmayan bulgu, kanıt değil söylentidir.
