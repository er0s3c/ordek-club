# Ördek Club sunum (deste) JSON biçimi

Eğitmen panelinde **“JSON içe aktar”** ve sunum sayfasındaki **“İçeriği değiştir”** bu biçimi kabul eder.
En kolay başlangıç: bir şablondan sunum oluşturun → **“JSON dışa aktar”** → dosyayı düzenleyin → geri yükleyin.

> Güvenlik: tüm metinler düz metin olarak gösterilir (HTML/Markdown yorumlanmaz). Animasyonlar yalnızca
> aşağıdaki kayıtlı kimliklerle seçilir; dosya hiçbir çalıştırılabilir içerik taşıyamaz. En fazla 200 slayt,
> slayt başına 12 blok, dosya başına 512 KB.

```json
{
  "schema": 1,
  "title": "HTTP Security 101",
  "description": "İsteğe bağlı açıklama",
  "slides": [
    {
      "title": "Slayt başlığı",
      "layout": "default",
      "notes": "Eğitmen notu — öğrencilere ASLA gönderilmez",
      "blocks": [
        { "type": "text", "text": "Paragraf metni" }
      ]
    }
  ]
}
```

`layout`: `default` · `title` (ortalanmış kapak) · `section` (bölüm ayracı)

## Bloklar

| type | Alanlar | Adımlar |
|---|---|---|
| `heading` | `text`, `level` (1 veya 2) | 1 |
| `text` | `text` (≤2000 karakter, satır sonları korunur) | 1 |
| `bullets` | `items` (1–12 madde), `reveal` (true → her adımda bir madde açılır) | `reveal` ise madde sayısı |
| `code` | `code`, `language`, `highlightSteps` (adım başına vurgulanacak satırlar, 1 tabanlı) | `highlightSteps.length + 1` |
| `terminal` | `lines: [{ "cmd": "…", "out": "…" }]`, `reveal` (varsayılan true) | satır sayısı |
| `callout` | `tone` (`info`/`warn`/`success`/`danger`), `text` | 1 |
| `animation` | `animation` (aşağıdaki kimliklerden biri) | animasyon adım sayısı + 1 |

Bir slaytın adım sayısı, bloklarından en çok adımı olanınkine eşittir. Eğitmen “İleri” dedikçe önce slaytın
adımları, sonra bir sonraki slayt gelir.

## Hazır animasyonlar

| Kimlik | Konu |
|---|---|
| `http-request` | HTTP istek / yanıt akışı |
| `dns-resolution` | DNS çözümleme |
| `tcp-handshake` | TCP üçlü el sıkışma |
| `tls-handshake` | Şifreleme ve anahtar değişimi (TLS 1.3) |
| `authentication` | Kimlik doğrulama, MFA, güvenli oturum çerezi |
| `sql-injection` | SQL Injection mantığı (güvensiz vs parametreli) |
| `xss` | Stored XSS çalışma prensibi ve savunması |
| `phishing` | Phishing yaşam döngüsü |
| `packet-journey` | Paketin ağdaki yolculuğu (kapsülleme, NAT) |
| `firewall-decision` | Güvenlik duvarı karar mekanizması |
| `vpn-tunnel` | VPN tüneli |
| `mitm` | Ortadaki adam (kavramsal) ve savunmalar |
| `secure-vs-insecure` | Güvenli/güvensiz kod: parola saklama |
| `network-topology` | Kurumsal ağ topolojisi ve bölgeler |
| `soc-alert` | SOC alarm işleme süreci |
