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
  - id: m03-03-a
    tur: ai
    karakter: riza
    alt: "Anahtarcı Rıza, fabrika bandındaki küçük robotların arasında takma bıyıkla robot kılığına girmiş"
    prompt: "A tidy factory conveyor line where tiny helper robots each carry a glowing box. At the end of the line, the villain crouches inside a cardboard robot costume with an obviously fake mustache, trying to blend in, his keyring poking out."
---

# Bilgisayarında şu an neler çalışıyor?

> Bilgisayar açıldığında sen hiçbir şeye tıklamadan onlarca program çalışmaya başlar.
> Zararlı yazılımlar da oraya, **başlangıca** saklanmayı sever.

![Anahtarcı Rıza, fabrika bandındaki küçük robotların arasında takma bıyıkla robot kılığına girmiş](../../gorseller/m03-03-a.webp)

## Üç kavram

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
