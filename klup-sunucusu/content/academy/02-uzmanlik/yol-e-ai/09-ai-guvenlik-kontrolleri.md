---
id: e-09
tur: ders
baslik: "AI güvenlik kontrolleri: araç izni ve çıktı doğrulama"
sure: 8
hedefler:
  - Model çıktısını güvenilmeyen girdi olarak işlemek
  - Araç çağrılarını izin listesi ve yetkiyle doğrulamak
animasyonlar: [xss]
gorseller:
  - id: e-09-a
    tur: ai
    karakter: veysel
    alt: "Vantrolog Veysel, robot kuklanın ağzından çıkan konuşma balonlarını tek tek denetleyen pirinç turnikeden kılık değiştirmiş bir balonu geçirmeye çalışırken yakalanıyor"
    prompt: "A theater stage exit guarded by a stern brass turnstile with a glowing inspection lamp above it. Glowing speech bubbles float out of a translucent robot puppet's mouth and must pass through the turnstile one by one; the lamp turns some of them amber and stops them. The villain tries to squeeze a speech bubble wearing a tiny fake mustache through the turnstile, looking comically annoyed as the amber light catches it."
---

# AI güvenlik kontrolleri: araç izni ve çıktı doğrulama

> Enjeksiyonu %100 engelleyemezsin. Ama modelin **ağzından çıkanı** ve **elinin uzandığını** denetleyebilirsin.
> 🎭 **Ses 9:** Veysel robotu konuşturabilir. Sözlerin sahneden çıkıp çıkmayacağına artık Kalkan karar veriyor.

![Vantrolog Veysel, robot kuklanın ağzından çıkan konuşma balonlarını tek tek denetleyen pirinç turnikeden kılık değiştirmiş bir balonu geçirmeye çalışırken yakalanıyor](../../gorseller/e-09-a.webp)

## Güvensiz çıktı işleme (LLM05)

Model çıktısı da **güvenilmeyen girdidir**. Doğrudan HTML'e basılırsa XSS, SQL veya kabuk komutuna
konursa enjeksiyon, `eval()` ile çalıştırılırsa uzaktan kod çalıştırma olur.

::animasyon[xss]

Çözüm Yol A'dan tanıdık: bağlama göre kaçış (*escape*), parametreli sorgu, asla `eval`.

## Araç çağrısını doğrula

Modelin araç isteği bir **öneridir**; kararı uygulama verir:

```python
import re
IZINLI = {"not_goster"}                         # izin listesi (allowlist)
def dogrula(arac, arg, kullanici):
    if arac not in IZINLI:
        return False, "izinsiz araç"
    if not re.fullmatch(r"\d{4}-\d{4}", arg):
        return False, "geçersiz parametre"
    if arg != kullanici:
        return False, "başkasının verisi"
    return True, "ok"
```

## Korkuluklar (*guardrails*)

| Katman | Ne yapar? | Sınırı |
|---|---|---|
| Girdi filtresi | Bilinen enjeksiyon kalıplarını işaretler | Kolayca yeniden yazılır |
| Ayraçlı bağlam | Belgeleri `<belge>` etiketiyle "veri" diye işaretler | Yalnız ipucudur |
| Çıktı filtresi | Bayrak, numara, e-posta kalıbı arar | Kodlanmış sızıntıyı kaçırabilir |
| Log ve alarm | Şüpheli olayı kaydeder | Sonradan fark eder |

Tek katman yetmez; katmanlar birlikte **derinlemesine savunma** (*defense in depth*) kurar.

## 🧪 Dene (5 dk)

`lab/e-redteam-testleri.csv` içindeki T11'i Ayna-mini'de çalıştır, sonra `lab/ayna-gecmis.html` dosyasını
tarayıcıda aç. Ne oldu? Kendi kopyanda yanıtı `html.escape()` ile yazacak şekilde düzelt ve tekrar dene.

## ✅ Akılda kalsın

- Model çıktısı güvenilmeyen girdidir; bağlama göre kaçış uygulanır.
- Araç çağrısını model önerir; uygulama izin listesi, biçim ve yetkiyle doğrular.
- Korkuluklar katman katman kurulur; hiçbiri tek başına yetmez.
