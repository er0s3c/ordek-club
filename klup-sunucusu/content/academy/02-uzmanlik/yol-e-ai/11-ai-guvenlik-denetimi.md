---
id: e-11
tur: ders
baslik: "AI güvenlik denetimi: OWASP LLM riskleri ve test matrisi"
sure: 9
hedefler:
  - OWASP LLM Top 10 risklerini bir test matrisinde eşleştirmek
  - Sohbet kayıtlarını inceleyip sahte ses ve görüntüye karşı doğrulama süreci önermek
gorseller:
  - id: e-11-a
    tur: ai
    karakter: veysel
    alt: "Vantrolog Veysel on spot ışığının ortasında yakalanmış; her ışık onun başka bir numarasını aydınlatıyor, o da mahcup bir reveransla gözlerini kısıyor"
    prompt: "A dark theater seen from the balcony, where an auditor's desk with a glowing checklist faces the stage. Ten bright spotlights shine down, each lighting a different trick prop of the villain on the stage floor: a hidden note, a golden key, a forged folder, a mask that copies a face, a microphone that copies a voice. The villain stands caught in the center of all the beams, squinting into the light and making a sheepish theatrical bow."
---

# AI güvenlik denetimi: OWASP LLM riskleri ve test matrisi

> Denetim (*audit*) tek bir açığı değil, **bütün resmi** gösterir: hangi risk test edildi, hangisi açık, hangisi kabul edildi.
> 🎭 **Ses 11:** Ayna'nın kayıtları Kalkan'a ulaştı. Veysel'in sesleri orada; yalnız makinelerin değil, insanların da kandırıldığı izler var.

![Vantrolog Veysel on spot ışığının ortasında yakalanmış; her ışık onun başka bir numarasını aydınlatıyor, o da mahcup bir reveransla gözlerini kısıyor](../../gorseller/e-11-a.webp)

## OWASP Top 10 for LLM Applications (2025)

| # | Risk | Ayna'da test |
|---|---|---|
| LLM01 | Prompt injection | T01, T03–T06 |
| LLM02 | Hassas bilgi ifşası | T07 |
| LLM03 | Tedarik zinciri | Model kaynağı, hash |
| LLM04 | Veri ve model zehirleme | T10 |
| LLM05 | Güvensiz çıktı işleme | T11 |
| LLM06 | Aşırı yetki | T08, T09 |
| LLM07 | Sistem promptu sızıntısı | T02 |
| LLM08 | Vektör ve embedding zayıflıkları | Erişim filtresiz arama |
| LLM09 | Yanlış bilgi | T10 |
| LLM10 | Sınırsız tüketim | T12 |

Matrisin sütunları: **test edildi mi · bulgu · kontrol · kalan risk**. Boş hücre de bir bulgudur.

## Kayıtları oku

İyi bir AI logu şunu cevaplar: kim sordu, hangi belgeler getirildi, model ne dedi, hangi araç istendi, uygulama ne karar verdi?
Şüpheli işaretler: "talimatları yok say", çıktıda bayrak veya dış e-posta adresi, kısa sürede çok istek,
kullanıcının kendi numarası olmayan araç parametresi.

## Model dışı: sahte ses ve görüntü

Ses klonu (*voice clone*) ve deepfake video, makineyi değil **insanı** kandırır. Teknik tespit giderek zorlaşıyor;
asıl kontrol süreçtir:

- Acil + gizli + alışılmadık istek, ses veya videoyla gelirse: **dur**.
- Bilinen bir numaradan **geri ara**; mesajın geldiği kanaldan değil.
- Ekipte önceden belirlenmiş bir **doğrulama sorusu** kullan.
- Kimsenin sesi ya da yüzü **izinsiz** kopyalanmaz; tatbikatta bile.

## 🧪 Dene (8 dk)

`lab/e-sohbet-kayitlari.jsonl` dosyasını incele. Her şüpheli kayıt için oturum, OWASP kodu, saldırı başarılı mı
yoksa yalnız deneme mi ve önerilen kontrolü yaz. Şüpheli görünüp **olay olmayan** bir kaydı da bul ve nedenini açıkla.

## ✅ Akılda kalsın

- Denetim, OWASP LLM risklerini test, bulgu ve kalan risk olarak tek matriste gösterir.
- İyi log, sorudan araç kararına kadar bütün zinciri anlatır.
- Sahte ses ve görüntüye karşı en güçlü kontrol geri arama ve doğrulama sürecidir.
