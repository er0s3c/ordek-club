---
id: c-03
tur: ders
baslik: "Wazuh laboratuvarı: ajan, kural ve uyarı"
sure: 9
hedefler:
  - Wazuh ajanı ile yöneticinin nasıl çalıştığını açıklamak
  - Basit bir özel kural yazıp laboratuvarda test etmek
gorseller:
  - id: c-03-b
    tur: ekran
    alt: "Wazuh panelinde Threat Hunting ekranı; bir laboratuvar ajanından gelen yüksek seviyeli uyarılar ve kural kimliği sütunu"
    nasil: "Kulüp laboratuvarındaki Wazuh panelinde (tek ajanlı test VM'i) Threat Hunting → Events sekmesini açın. Laboratuvar VM'inde birkaç kez yanlış parolayla SSH denemesi yapıp uyarıları üretin. rule.level ≥ 10 filtresini uygulayın; rule.id ve rule.description sütunlarını ve en üstteki uyarı satırını kehribar (#C9953B) çerçeveyle işaretleyin. Ajan adı ve IP'ler laboratuvara ait olmalı; gerçek kullanıcı adı veya kampüs adresi görünüyorsa bulanıklaştırın."
  - id: c-03-c
    tur: ai
    alt: "Her bilgisayarın yanında küçük bir muhabir robot; hepsi raporlarını merkezdeki yöneticiye boru postasıyla gönderiyor"
    prompt: "Several computers on separate desks, each with a tiny reporter robot sitting beside it taking notes, all sending their notes through pneumatic tubes to a central manager desk where a calm operator reviews them under a lamp."
---

# Wazuh laboratuvarı: ajan, kural ve uyarı

> Teori bitti; kendi SIEM'ini çalıştırma zamanı. **Wazuh** açık kaynaklı, laboratuvarda kurması kolay bir SIEM/XDR platformudur.
> 🧹 **İz 3:** Tamer bir ajanın sesini kıstı. Ama susan ajan da bir alarmdır.

::cizgi[c-03-sahne]

## Mimari

![Her bilgisayarın yanında küçük bir muhabir robot; hepsi raporlarını merkezdeki yöneticiye boru postasıyla gönderiyor](../../gorseller/c-03-c.webp)

| Parça | Görev |
|---|---|
| **Ajan (agent)** | Uç noktada logları, dosya bütünlüğünü, yapılandırmayı izler |
| **Yönetici (manager)** | Logları çözer (decoder), kurallarla eşleştirir, uyarı üretir |
| **İndeksleyici + panel** | Uyarıları saklar, aranabilir ve görselleştirilebilir yapar |

Kurallar 0–15 arası **seviye (level)** taşır. 10 ve üstü genelde hemen bakılması gerekenlerdir.

## Kendi kuralını yaz

Laboratuvar yöneticisinde `/var/ossec/etc/rules/local_rules.xml` dosyasına:

```xml
<group name="kulup,">
  <rule id="100100" level="12">
    <if_sid>5716</if_sid>
    <srcip>203.0.113.66</srcip>
    <description>Kulüp: izlenen IP'den SSH kimlik doğrulama hatası</description>
  </rule>
</group>
```

Kuralı yükledikten sonra yöneticiyi yeniden başlat; test aracıyla örnek bir log satırını dene:

```bash
sudo systemctl restart wazuh-manager
sudo /var/ossec/bin/wazuh-logtest
```

## Bir uyarıyı okumak

Her uyarıda önce şu alanlara bak:

- `rule.level` ve `rule.description` — ne kadar ciddi, ne diyor?
- `agent.name` — hangi cihaz?
- `data.srcip`, `data.dstuser` — kim, kime?
- `rule.mitre.id` — hangi saldırı tekniğine (MITRE ATT&CK) eşleniyor?
- `full_log` — ham satır; yorum değil, kanıt budur.

## Susan ajan

Ajan bağlantısı kesilirse Wazuh bunu da kaydeder (*agent disconnected*). Bir uç noktadan **hiç log gelmemesi**
de bir bulgudur: ajan durdurulmuş, servis kapatılmış ya da cihazın saati oynanmış olabilir.

![Wazuh panelinde Threat Hunting ekranı](../../gorseller/c-03-b.webp)

## 🧪 Dene (5 dk)

Yalnızca kulüp laboratuvarındaki Wazuh'ta: `wazuh-logtest` aracına `/opt/akademi/auth.log` içinden bir "Failed password" satırını yapıştır.
Hangi kural kimliği ve seviye eşleşiyor? Sonra kendi kuralını, satırdaki IP'yi değiştirerek eşleştirmeye çalış.

## ✅ Akılda kalsın

- Ajan toplar, yönetici çözer ve eşleştirir, panel gösterir.
- Özel kurallar `local_rules.xml`'e yazılır ve `wazuh-logtest` ile denenir.
- Sessizleşen ajan da bir alarmdır.
