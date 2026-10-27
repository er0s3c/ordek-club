---
id: m04-06
tur: uygulama
baslik: "Uygulama: Kayıp Dosya"
sure: 30
hedefler:
  - Terminal komutlarıyla gizlenmiş bir dosyayı bulmak
  - Bulunan mesajı çözmek ve yolu açıklamak
gorseller:
  - id: m04-06-b
    tur: ai
    alt: "El feneriyle karanlık bir arşiv rafında saklı noktalı bir kutuyu arayan öğrenci"
    prompt: "A student with a flashlight searches a dark archive with endless shelves of boxes, the beam revealing one small hidden box tucked behind others, faint glowing footprints on the dusty floor leading to it."
---

# Uygulama: Kayıp Dosya

> Kurgusal kulüp sunucusundaki yöneticinin notu: *"Yıl sonu etkinlik şifresini bir dosyaya sakladım,
> nereye koyduğumu unuttum. Dosya adında 'etkinlik' geçiyordu, son bir haftada değiştirmiştim."*

::cizgi[m04-06-sahne]

## Görev

![El feneriyle karanlık bir arşiv rafında saklı noktalı bir kutuyu arayan öğrenci](../../gorseller/m04-06-b.webp)

Laboratuvardaki **akademi-linux** VM'inde, yalnızca terminal kullanarak:

1. Dosyayı bul.
2. İçeriğini oku — mesaj kodlanmış olabilir.
3. Mesajı çöz.
4. Kullandığın komutları ve **neden** onları seçtiğini 5 satırda yaz.

## İpuçları (takılırsan sırayla aç)

<details><summary>İpucu 1</summary>Ad kalıbı biliyorsan: <code>find / -iname "*etkinlik*" 2>/dev/null</code></details>
<details><summary>İpucu 2</summary>Sonuç çok fazlaysa son 7 günü ekle: <code>-mtime -7</code>. Gizli klasörleri unutma.</details>
<details><summary>İpucu 3</summary>Sonu <code>=</code> ile biten harf karışımı genellikle Base64'tür: <code>base64 -d dosya</code></details>

## Teslim

```text
Bulunan dosya yolu:
Çözülen mesaj:
Komutlar (sırayla):
Neden bu komutlar?
```

<details><summary>Eğitmen notu: VM'de görevi hazırlama</summary>

```bash
# akademi-linux VM'inde root olarak bir kez çalıştırın
mkdir -p /srv/kulup/.arsiv/2026 /srv/kulup/eski
for i in $(seq 1 40); do echo "eski not $i" > /srv/kulup/eski/etkinlik-$i.txt; done
touch -d "60 days ago" /srv/kulup/eski/*
echo "Tebrikler! Etkinlik sifresi: ORDEK-YILSONU-2026" | base64 > /srv/kulup/.arsiv/2026/.etkinlik_final.txt
chmod 644 /srv/kulup/.arsiv/2026/.etkinlik_final.txt
```
Beklenen çözüm: <code>find / -iname "*etkinlik*" -mtime -7 2>/dev/null</code> → gizli dosya → <code>base64 -d</code>.
</details>

## ✅ Akılda kalsın

- Bildiğin her ipucu (ad, tarih, tür) bir `find` filtresine dönüşür.
- Gizli dosyalar nokta ile başlar; aramayı ona göre yap.
- Base64 şifreleme değil, kodlamadır — anahtarsız çözülür.
