# Etkinlikler ve TR/EN içerik

Mevcut `.md` + YAML modeli korunur. `id` değiştirilmez. Yeni alanlar mevcut dersler için isteğe bağlıdır.

```yaml
id: sk101-m4-02
tur: ders
baslik: İzinleri hangi kullanıcı için değiştiriyorsun?
sure: 12
hedefler:
  - Dosya sahibi, grup ve diğer kullanıcı izinlerini ayırmak
beceriler: [linux]
ingilizce: translations/en/sk101-m4-02.md
inceleme:
  yazar: "Gerçek yazar adı"
  teknik: "Bağımsız teknik inceleyen"
  dil: "Dil inceleyen"
  tarih: "2026-10-24"
  onayli: false
etkinlikler:
  - id: owner-only
    kind: command
    prompt: Yalnız sahibine okuma ve yazma izni veren komutu yaz.
    answers: ["chmod 600 incident.txt"]
    explanation: 6 sahibi için okuma/yazma; sıfırlar grup ve diğer kullanıcıların izinsiz olduğunu belirtir.
```

Bu bir biçim örneğidir; yayımlanmış veya incelenmiş pilot dersi değildir. Gerçek inceleme tamamlanmadan adları/onayı doldurmayın. Pilot için yazar ve teknik inceleyen farklı olmalıdır.

İngilizce dosya aynı `id`, `baslik`, `hedefler`, `etkinlikler`, `inceleme` alanlarını taşır. Gövde İngilizce Markdown'dır. Çevirinin teknik ve dil incelemesi `onayli: true` olmadan içe aktarılmaz. Etkinlik kimlikleri, sırası ve seçenek indeksleri iki dilde aynı kalır; metin cevapları dile göre değişebilir.

| Tür | Girdi | Özel alanlar |
|---|---|---|
| choice | Bir seçenek | `options: [...]`, `answer: 0` |
| fill | Kısa metin | `answers: [...]`, isteğe bağlı `caseSensitive: false` |
| command | Tek satır komut doğrulama | `answers: [...]`; komut sunucuda çalıştırılmaz |
| log | Bir log satırı seçimi | `options: [...]`, `answer: 0` |
| match | Her sol öğeye sağ öğe seçimi | `left: [...]`, `right: [...]`, `answer: [1, 0]` |
| order | Yukarı/aşağı düğmeleriyle sıralama | `options: [...]`, `answer: [1, 0]` |
| http | HTTP isteği metni | `starter: ...`, `answers: [...]` |
| code | Kod satırı seçimi | `options: [...]`, `answer: 0` |

Her etkinlikte `id`, `prompt`, `explanation` gerekir. Cevaplar yalnız sunucuda tutulur. Doğru çözümün açıklaması cevap doğrulandığında gönderilir. Yanlış cevapta anahtar gösterilmez. Etkinlikli ders, bütün etkinlikleri doğrulanmadan tamamlanamaz.

Ders gövdesinde `::terim[dns]` veya `::terim[authorization]` bir TR/EN terim kartı açar. Diğer terimler `src/lib/academy-terms.ts` içindedir. HTML çalıştırılmaz; mevcut Markdown izin listesi uygulanır.

Yeni SK-101 yolu tek bir `akademi.yaml` girdisi altında 35 sayfayı toplar. Dersler `sk101-m1-01` … `sk101-m7-04`, uygulamalar `sk101-m1-lab` … `sk101-m7-lab` olur. Mevcut içerik ağacına, inceleme ve yayın kapısı tamamlandığında ekleyin. Eski yolları manifestten çıkarmayın.
