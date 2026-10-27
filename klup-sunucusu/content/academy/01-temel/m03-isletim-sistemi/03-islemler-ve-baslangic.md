---
id: m03-03
tur: ders
baslik: Bilgisayarında şu an neler çalışıyor?
sure: 6
hedefler:
  - İşlem (process), servis ve başlangıç programı kavramlarını açıklamak
  - Şüpheli bir başlangıç öğesini fark etmek
gorseller:
  - id: m03-03-b
    tur: ekran
    alt: Windows Görev Yöneticisi'nde "Başlangıç uygulamaları" sekmesi
    nasil: "Ctrl+Shift+Esc ile Görev Yöneticisi'ni açın → sol menüden 'Başlangıç uygulamaları'. Ad, Yayımcı, Durum ve 'Başlangıç etkisi' sütunları görünsün. 'Yayımcı' sütununu kehribar (#C9953B) çerçeveyle işaretleyin. Listede kişisel bilgi veya kurumsal yazılım adı varsa bulanıklaştırın."
  - id: m03-03-c
    tur: ai
    alt: "Bir fabrika vardiyası: önde çalışan robotlar (işlem), arka odada sessizce çalışan robotlar (servis) ve kapı açılır açılmaz fırlayan robotlar (başlangıç programı)"
    prompt: "A cozy retro factory floor at the start of a shift: in the front small boxy robots busily work at a conveyor belt, in a dim back room other robots quietly work alone with nobody watching, and at the entrance door a few robots spring into action the moment the door opens and the morning light comes in. A hidden extra robot clings to the door frame trying to sneak in with them."
---

# Bilgisayarında şu an neler çalışıyor?

> Bilgisayar açıldığında sen hiçbir şeye tıklamadan onlarca program çalışmaya başlar.
> Zararlı yazılımlar da oraya, **başlangıca** saklanmayı sever.

::cizgi[m03-03-sahne]

## Üç kavram

![Bir fabrika vardiyası: önde çalışan robotlar (işlem), arka odada sessizce çalışan robotlar (servis) ve kapı açılır açılmaz fırlayan robotlar (başlangıç programı)](../../gorseller/m03-03-c.webp)

- **İşlem (process)** — Çalışan bir programın kendisi. Her tarayıcı sekmesi bile ayrı bir işlem olabilir.
- **Servis (service)** — Arka planda, çoğu zaman sen oturum açmadan çalışan işlem (ör. Windows Update).
- **Başlangıç programı** — Oturum açılınca otomatik başlayan uygulama.

Bir saldırganın amacı çoğu zaman **kalıcılık**tır (persistence): bilgisayar yeniden başlasa bile
çalışmaya devam etmek. Başlangıç öğeleri ve servisler bunun en bilinen yollarıdır.

## Görev Yöneticisi ile bak

![Görev Yöneticisi başlangıç sekmesi](../../gorseller/m03-03-b.webp)

Şüphe uyandıranlar:
- **Yayımcısı boş** veya tanımadığın bir isim
- Rastgele harflerden oluşan adlar (`xk27qa.exe`)
- `AppData\Roaming` veya `Temp` gibi tuhaf yerlerden çalışanlar
- Tanıdık bir adın küçük farklı yazımı (`svch0st.exe`)

Bilmediğin bir öğeyi silmek yerine önce adını araştır; çoğu zaman sadece bir sürücü yardımcısıdır.

## 🧪 Dene (3 dk)

Görev Yöneticisi → Başlangıç uygulamaları. Gerçekten **her açılışta** gerekmeyen bir uygulamayı devre dışı bırak.
Bilgisayarının daha hızlı açıldığını fark edeceksin.

## ✅ Akılda kalsın

- İşlem = çalışan program; servis = arka plandaki işlem.
- Zararlılar kalıcılık için başlangıca ve servislere yerleşir.
- Yayımcısız, tuhaf adlı, tuhaf konumdan çalışan öğe = incele.
