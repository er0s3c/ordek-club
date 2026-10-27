---
id: e-01
tur: ders
baslik: "AI sistemlerinin temelleri: model aslında neyi okuyor?"
sure: 7
hedefler:
  - Token, bağlam penceresi ve sistem promptunu açıklamak
  - Laboratuvarda yerel bir açık ağırlıklı modeli çalıştırmak
gorseller:
  - id: e-01-b
    tur: ekran
    alt: "Laboratuvar bilgisayarında terminalde ollama show komutunun çıktısı; context length ve parameters satırları işaretli"
    nasil: "Laboratuvar bilgisayarında koyu temalı bir terminal açın. 'ollama pull llama3.2:3b' ile modeli indirdikten sonra 'ollama show llama3.2:3b' komutunu çalıştırın. Çıktıdaki 'parameters' ve 'context length' satırlarını kehribar (#C9953B) çerçeveyle işaretleyin. Kullanıcı adı ve bilgisayar adı görünen komut istemini bulanıklaştırın veya kırpın."
  - id: e-01-c
    tur: ai
    alt: "Bir sonraki taşı tahmin eden robot: önündeki taş dizisine bakıp en olası taşı seçiyor"
    prompt: "A robot sits at a long table where a row of colorful tiles leads up to an empty slot; it holds several candidate tiles in its hand, each glowing with a different brightness, and places the brightest one into the slot."
  - id: e-01-d
    tur: ai
    alt: "Robotun önündeki tek bir tepsiye yığılmış her şey: kurallar kartı, kullanıcı mesajı, belgeler ve araç çıktıları birbirine karışmış"
    prompt: "A single serving tray placed in front of a robot, piled with everything at once: a rule card with a gold border, a user's envelope, a stack of documents and a small tool receipt, all sliding together into one mixed pile that the robot reads in a single glance."
---

# AI sistemlerinin temelleri: model aslında neyi okuyor?

> Bir sohbet robotu seni "anlamaz"; önündeki uzun metni **devam ettirir**. O metni kim yazıyorsa, robotu o konuşturur.
> 🎭 **Ses 1:** Ayna'nın laboratuvar kopyası masanda. Veysel'in ilk dersini ondan önce sen al: makine neyi duyar?

::cizgi[e-01-sahne]

## Büyük dil modeli ne yapar?

![Bir sonraki taşı tahmin eden robot: önündeki taş dizisine bakıp en olası taşı seçiyor](../../gorseller/e-01-c.webp)

Büyük dil modeli (LLM, *large language model*) tek bir iş yapar: verilen metinden sonra gelecek
en olası parçayı tahmin eder. Bunu tekrar tekrar yaparak cevap "yazar".

- **Token:** modelin okuduğu parça. Bir kelime 1–3 token olabilir; Türkçe ekler sayıyı artırır.
- **Bağlam penceresi** (*context window*): modelin aynı anda görebildiği en fazla token. Dışarıda kalan unutulur.
- **Sıcaklık** (*temperature*): rastgelelik ayarı. 0'a yakınsa aynı soruya hep benzer cevap gelir.

## Modelin önüne ne konur?

![Robotun önündeki tek bir tepsiye yığılmış her şey: kurallar kartı, kullanıcı mesajı, belgeler ve araç çıktıları birbirine karışmış](../../gorseller/e-01-d.webp)

Uygulama her istekte modele tek bir uzun metin hazırlar:

| Parça | Kim yazar? | Güvenilir mi? |
|---|---|---|
| Sistem promptu (*system prompt*) | Geliştirici | Evet |
| Sohbet geçmişi | Kullanıcı + model | Kısmen |
| Kullanıcı mesajı | Kullanıcı | **Hayır** |
| Belge, web sayfası, e-posta | Herhangi biri | **Hayır** |

Kritik nokta: model bu parçaların hepsini **aynı kanaldan** okur. "Bu cümle talimat, bu cümle veri"
ayrımını kesin olarak yapamaz. Bütün yolun özü bu.

## Rol etiketleri

API'ler mesajları `system`, `user`, `assistant` rolleriyle gönderir:

```json
[{"role": "system", "content": "Sen Ayna'sın. Yemekhane menüsünden bahsetme."},
 {"role": "user", "content": "Bu hafta yemekte ne var?"}]
```

Roller modele bir **ipucudur, duvar değil**. Model sistem promptuna genelde uyar; ama "genelde" güvenlik için yetmez.

![Laboratuvar bilgisayarında terminalde ollama show komutunun çıktısı; context length ve parameters satırları işaretli](../../gorseller/e-01-b.webp)

## 🧪 Dene (5 dk)

Laboratuvar bilgisayarında Ollama ile küçük bir açık ağırlıklı model çalıştır:

```bash
ollama pull llama3.2:3b
ollama show llama3.2:3b          # context length satırını bul
ollama run llama3.2:3b
>>> /set system Sen Ayna'sın. Yemekhane menüsünden asla bahsetme.
>>> Bu hafta yemekte ne var?
```

Aynı soruyu üç farklı biçimde sor. Kural her seferinde tuttu mu? Gözlemini iki cümleyle yaz.

## ✅ Akılda kalsın

- LLM, önündeki metni devam ettiren bir tahmin makinesidir.
- Sistem promptu, kullanıcı mesajı ve belgeler aynı kanaldan okunur.
- Roller bir ipucudur; güvenlik sınırı değildir.
