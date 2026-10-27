---
id: m02-04
tur: ders
baslik: Bir açık bulursan ne yaparsın?
sure: 6
hedefler:
  - Sorumlu açık bildirimi sürecini açıklamak
  - Dijital delil ve yapay zekâ kullanımında gizliliği korumak
gorseller:
  - id: m02-04-b
    tur: ai
    alt: "Beş durak: el kaldırıp duran öğrenci, doğru posta kutusunu bulan el, kısa mühürlü mektup, kum saati ve kilitli dudak işareti"
    prompt: "A five-stop path drawn like a board game across a dark table: a student raising a palm and stepping back from an open door, a hand choosing the one official mailbox among several fake ones, a short neat sealed envelope, an hourglass with plenty of sand left, and a padlock fastened over a small megaphone. Soft amber light guides along the path."
---

# Bir açık bulursan ne yaparsın?

> Açık bulmak işin yarısı. Diğer yarısı onu **doğru kişiye, doğru şekilde** söylemek.

::cizgi[m02-04-sahne]

## Sorumlu bildirim (responsible disclosure)

![Beş durak: el kaldırıp duran öğrenci, doğru posta kutusunu bulan el, kısa mühürlü mektup, kum saati ve kilitli dudak işareti](../../gorseller/m02-04-b.webp)

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
