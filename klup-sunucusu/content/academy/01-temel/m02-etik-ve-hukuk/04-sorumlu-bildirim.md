---
id: m02-04
tur: ders
baslik: Bir açık bulursan ne yaparsın?
sure: 6
hedefler:
  - Sorumlu açık bildirimi sürecini açıklamak
  - Dijital delil ve yapay zekâ kullanımında gizliliği korumak
gorseller:
  - id: m02-04-a
    tur: ai
    karakter: kemal
    alt: "Avukat Kemal arka sokakta mühürlü zarfı satmayı teklif ediyor; arka planda resmî bildirim kutusu parlıyor"
    prompt: "A dark back alley at night: the villain holds out a sealed envelope with a tempting smile toward the viewer, as if offering to sell it. In the background at the end of the alley, a lit official secure mailbox with a small shield symbol glows invitingly."
---

# Bir açık bulursan ne yaparsın?

> Açık bulmak işin yarısı. Diğer yarısı onu **doğru kişiye, doğru şekilde** söylemek.

![Avukat Kemal arka sokakta mühürlü zarfı satmayı teklif ediyor; arka planda resmî bildirim kutusu parlıyor](../../gorseller/m02-04-a.webp)

## Sorumlu bildirim (responsible disclosure)

1. **Dur.** Açığı daha fazla kullanma, veri indirme.
2. **Doğru kanalı bul.** Sitede `security.txt` dosyası, "güvenlik bildirimi" sayfası veya bug bounty programı.
3. **Net ve kısa yaz.** Ne, nerede, etkisi ne, nasıl tekrar edilir — kişisel veri eklemeden.
4. **Süre tanı.** Kuruma düzeltmesi için makul zaman ver (genelde 90 gün).
5. **İzin almadan yayınlama.** Düzeltme yapılmadan detay paylaşmak kullanıcıları riske atar.

Kurum uzun süre cevap vermezse kulüp yöneticilerine danış; tek başına "kamuya açıklama" yapma.

## Dijital delillerin gizliliği

Testte veya bir olay incelemesinde gördüğün loglar, ekran görüntüleri ve dosyalar **gizlidir**.

- Yalnızca işin gerektirdiği kadar topla.
- Şifreli ve erişimi sınırlı yerde sakla.
- İş bitince kurala göre sil veya teslim et.

## Yapay zekâ ve mahremiyet

Bir log dosyasını veya rapor taslağını AI sohbet aracına yapıştırmak, onu **üçüncü bir tarafa göndermek** demektir.

- Gerçek kişisel veri, parola, iç IP veya kurum adı **yapıştırma**.
- Gerekirse veriyi önce maskele: `ogrenci@…` → `KULLANICI_1`.
- Kurumun AI kullanım politikasına uy.

## 🧪 Dene (3 dk)

Bir tarayıcıda `https://www.google.com/.well-known/security.txt` adresini aç.
Bir güvenlik araştırmacısı bu dosyadan ne öğrenir?

## ✅ Akılda kalsın

- Açığı bul, dur, doğru kanaldan bildir, süre tanı.
- Delil gizlidir: az topla, güvenle sakla, işi bitince temizle.
- AI aracına yapıştırdığın her şeyi dışarıya göndermiş sayılırsın.
