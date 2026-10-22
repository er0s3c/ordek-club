# Akademi laboratuvar dosyaları

Derslerde kullanılan **sentetik** dosyalar. Gerçek kişi, kurum veya trafik verisi içermez;
IP adresleri yalnızca belgelendirme için ayrılmış aralıklardandır (RFC 5737: 192.0.2.0/24, 198.51.100.0/24, 203.0.113.0/24).

| Dosya | Kullanıldığı yer | Laboratuvar VM'indeki yeri |
|---|---|---|
| `auth.log` | M04-03 (grep), M07 (Log Dedektifi), M10 | `/opt/akademi/auth.log` |
| `access.log` | Yol A — A11 (loglarda saldırı izi) | `/opt/akademi/access.log` |

Kurulum (laboratuvar VM'inde, bir kez):

```bash
sudo mkdir -p /opt/akademi
sudo cp auth.log access.log /opt/akademi/
sudo chmod 644 /opt/akademi/auth.log /opt/akademi/access.log
```

> **Eğitmen için:** `auth.log` içinde tek bir IP'den kısa sürede yoğun başarısız giriş denemesi ve
> ardından başarılı bir parola girişi vardır (kaba kuvvet başarıya ulaşmış). Öğrencilerin bunu
> kendilerinin bulması beklenir; cevabı derste vermeyin.
>
> **Eğitmen için (`access.log`):** saldırgan 203.0.113.77 önce keşif yapar (robots.txt, yedek dosya, API dokümanı),
> sonra arama parametresinde SQL enjeksiyonu dener. Başarılı olan satır: UNION sorgusu, yanıt boyutu
> normalin (~2 KB) çok üstünde (186442 bayt). Ardından path traversal (403 ile engellenmiş), yansıyan XSS denemesi,
> kaba kuvvet (429 ile hız sınırına takılmış) ve ardışık öğrenci kimlikleriyle IDOR taraması gelir.
