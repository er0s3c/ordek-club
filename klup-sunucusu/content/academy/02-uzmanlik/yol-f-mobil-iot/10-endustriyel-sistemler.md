---
id: f-10
tur: ders
baslik: "Endüstriyel sistemler: IT/OT, SCADA ve Modbus"
sure: 8
hedefler:
  - IT ve OT güvenlik önceliklerinin neden farklı olduğunu açıklamak
  - Modbus'ın kimlik doğrulamasız yapısını simülasyon üzerinde göstermek
gorseller:
  - id: f-10-b
    tur: ai
    alt: "Solda ofis masaları ve bilgisayarlar, sağda dev borular ve vanalarla çalışan fabrika; aralarında kalın bir güvenlik duvarı"
    prompt: "A wide cutaway scene: on the left a calm office with desks and computers, on the right a large factory floor with huge pipes, valves and pumps, a thick wall with one guarded gate separating the two halves."
  - id: f-10-c
    tur: ai
    alt: "Fabrikadaki bir makine, kim sorarsa sorsun her soruya kimlik sormadan cevap veriyor"
    prompt: "An old factory machine with a friendly speaker grille answers anyone who walks up and asks it a question, even a hooded stranger, without checking any badge, a supervisor watching in alarm from a window."
---

# Endüstriyel sistemler: IT/OT, SCADA ve Modbus

> Ofiste bir sunucu çökerse e-posta gecikir. Fabrikada bir vana yanlış açılırsa **fiziksel dünya** etkilenir.
> 🔧 **Devre 10:** Leman'ın listesinde bir de "ısıtma panosu" var. Biz ona laboratuvardaki maketinde bakacağız.

::cizgi[f-10-sahne]

## IT ve OT

![Solda ofis masaları ve bilgisayarlar, sağda dev borular ve vanalarla çalışan fabrika; aralarında kalın bir güvenlik duvarı](../../gorseller/f-10-b.webp)

| | IT (bilgi teknolojisi) | OT (operasyonel teknoloji) |
|---|---|---|
| Öncelik | Gizlilik | **Emniyet ve süreklilik** |
| Ömür | 3–5 yıl | 15–30 yıl |
| Yama | Düzenli | Nadiren, planlı duruşta |
| Tarama | Rutin | Hassas cihazı **durdurabilir** |

## Parçalar

- **PLC** (Programmable Logic Controller): sahadaki motoru, vanayı süren küçük bilgisayar.
- **HMI** (Human-Machine Interface): operatörün ekranı.
- **SCADA**: birçok sahayı uzaktan izleyen ve yöneten sistem.
- Katmanlı ağ (Purdue modeli): ofis ağı ile saha ağı arasında ayrı bir ara bölge (DMZ).

## Modbus: soru sorana cevap verir

![Fabrikadaki bir makine, kim sorarsa sorsun her soruya kimlik sormadan cevap veriyor](../../gorseller/f-10-c.webp)

Modbus TCP (port 502) 1970'lerin tasarımıdır: **kimlik doğrulama ve şifreleme yok.**
Ağa erişen herkes register okuyabilir, yazma komutu da gönderebilir.

```bash
# yalnızca laboratuvar VM'indeki Modbus simülatörüne; yalnızca OKUMA
mbpoll -m tcp -a 1 -r 1 -c 5 -t 4 -1 192.0.2.50
```

Savunma: OT ağı internetten ve ofis ağından ayrı, Modbus'a yalnızca HMI'dan izin, OT'yi anlayan IDS ile izleme.

## ⚠️ Kesin kural

Gerçek bir endüstriyel sisteme, kampüsün ısıtma/enerji/su sistemlerine veya bina otomasyonuna **asla** dokunulmaz,
taranmaz. Bu yol yalnızca **simülatör** ve kulüp maketleriyle çalışır. Sahada tek bir paket bile insanları etkileyebilir.

## 🧪 Dene (4 dk)

Laboratuvar VM'inde Wireshark açıkken simülatöre yukarıdaki okuma isteğini gönder.
Pakette kullanıcı adı, parola ya da imza alanı var mı? Bir saldırganın aynı ağdan neler yapabileceğini yaz.

## ✅ Akılda kalsın

- OT'de öncelik emniyet ve sürekliliktir; tarama bile risk olabilir.
- Modbus kimlik sormaz; koruma ağ ayrımından gelir.
- Endüstriyel testler yalnızca simülasyonda yapılır.
