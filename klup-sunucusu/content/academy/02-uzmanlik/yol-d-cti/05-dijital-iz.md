---
id: d-05
tur: ders
baslik: "Dijital iz ve sahte kimlikler: kim konuşuyor?"
sure: 7
hedefler:
  - Sahte hesap ve koordineli paylaşım göstergelerini tanımak
  - Araştırmacının kendi güvenliğini ve dijital izini yönetmek
animasyonlar: [phishing]
gorseller:
  - id: d-05-a
    tur: ai
    karakter: bedri
    alt: "Bayrakçı Bedri liman kafesindeki aynı yüzlü karton figürlerin şapkalarını tek tek değiştiriyor; hepsi aynı anda bardak kaldırıyor"
    prompt: "A small harbor cafe table at night where a dozen flat cardboard cutout figures sit side by side, every one of them with the exact same painted face, all raising their teacups at the very same moment. The villain walks behind the row, cheerfully swapping their hats one by one, a sailor cap, a beret, a bowler, a scarf, so they look like different people."
---

# Dijital iz ve sahte kimlikler: kim konuşuyor?

> Kalabalık gibi görünen şey, tek bir adamın on iki şapkası olabilir.
> 🚩 **Bayrak 5:** Blog yazısından iki dakika sonra on iki hesap aynı cümleyi, aynı yazım hatasıyla paylaşıyor.

![Bayrakçı Bedri liman kafesindeki aynı yüzlü karton figürlerin şapkalarını tek tek değiştiriyor; hepsi aynı anda bardak kaldırıyor](../../gorseller/d-05-a.webp)

## Sahte kimlik göstergeleri

| Gösterge | Örnek |
|---|---|
| **Yaş** | Hesap olaydan birkaç gün önce açılmış |
| **Yüz** | Kusursuz ama kulak, gözlük, saç kenarı bozuk (yapay üretim) ya da stok fotoğraf |
| **Zamanlama** | Dakikalar içinde aynı içerik, aynı saat dilimi |
| **Dil** | Kopyala-yapıştır metin, ortak yazım hatası |
| **Ağ** | Hesaplar hep birbirini ve aynı küçük grubu takip ediyor |

Tek gösterge bir şey kanıtlamaz; **birkaçı birlikte** koordineli sahte davranışa (coordinated inauthentic behavior) işaret eder.

## Sosyal mühendislik araştırmacıyı da hedefler

Bedri analistlere de yem atar: "sızdırılmış rapor" bağlantısı, "kaynak" olmayı teklif eden bir hesap.

::animasyon[phishing]

## Araştırmacının güvenliği (OPSEC)

- Kişisel hesabınla araştırma yapma; laboratuvar tarayıcısı veya ayrı bir sanal makine kullan.
- Şüpheli bağlantıyı tıklama; arşiv veya kum havuzu (sandbox) üzerinden incele.
- Sahte hesapla **gerçek kişilerle etkileşime girme**; Akademide yalnızca pasif gözlem yapılır.

## Kendi izin

Saldırgan seni nasıl görüyor? Kendi dijital izini (digital footprint) düzenli kontrol et:
adının arama sonuçları, herkese açık profiller, eski kullanıcı adları, fotoğraflardaki konumlar.

## 🧪 Dene (5 dk)

1. `lab/d-tehdit-raporlari.md` → K3. Tablodaki göstergelerden kaçı `@gercek_analist_x` için geçerli?
2. Kendi adını tırnak içinde ara: ilk iki sayfada **istemediğin** bir şey var mı? Gizlilik ayarlarını gözden geçir.

## ✅ Akılda kalsın

- Tek gösterge değil, göstergelerin birlikteliği sahte kalabalığı ele verir.
- Araştırmacı da hedeftir: ayrı ortam, kişisel hesap yok, tıklamadan önce düşün.
- Kendi dijital izini, saldırgandan önce sen incele.
