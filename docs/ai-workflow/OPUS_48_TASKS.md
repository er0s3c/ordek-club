# Opus 4.8 Görevleri — Yetkili Lab Doğrulaması (yalnız Ördek Labs)

> Bu dosyadaki görevler **yalnızca** kök dizindeki Ördek Labs için ve `SECURITY_BOUNDARIES.md` §2'deki
> kapsam bloğu doldurulup kullanıcı tarafından onaylandıktan sonra çalıştırılır.
> Club sunucusu (`klup-sunucusu/`) hiçbir görevin hedefi olamaz.

## Şu anki durum

**Aktif görev yok.** Faz 1 tamamen savunma/uygulama işidir; saldırı odaklı bir ihtiyaç doğmadı.

## Görev şablonu

```markdown
### L-XX · <kısa başlık>
- **Model:** Opus 4.8 · **Durum:** PROPOSED | APPROVED | IN_PROGRESS | DONE
- **Neden saldırı odaklı:** <ör. Medium seviyesindeki bypass'ın gerçekten çalıştığını doğrulamak>
- **Hedef:** <tek lab makinesi, ör. ordek-lab:latest LAB_MACHINE=sql-injection, seviye=medium>
- **Yetki:** <kullanıcının onayı, tarih>
- **İzole ortam:** <ör. `docker network create --internal ordek_lab_val` + yalnız hedef + test konteyneri>
- **Kapsam dışı:** Club sunucusu, docker.sock, internet, gerçek kullanıcı verisi, üretim anahtarları
- **İlgili dosyalar:** <ör. app/sqli/route.js, lib/vulns.js>
- **İzin verilen değişiklikler:** <ör. yalnız `test/` altında doğrulama script'i; lab kodunda düzeltme YOK>
- **Yapılmaması gerekenler:** <ör. hedef dışı host'a istek, kalıcı veri bırakmak>
- **Kabul kriterleri:** <ör. low/medium'da flag alınır, high'da alınamaz; egress testi başarısız olur>
- **Test komutları:** <ör. node test/level-matrix.mjs --only sql-injection>
- **Durdurma koşulu:** lab ağı dışına bağlantı, kapsam belirsizliği
- **Temizlik:** `docker rm -f …; docker network rm ordek_lab_val`
- **Rapor:** `docs/ai-workflow/reports/L-XX.md`
```

## Aday görevler (kullanıcı onayı bekler — onaylanmadan başlatılmaz)

| ID | Başlık | Neden | Durum |
|---|---|---|---|
| L-01 | Lab seviye matrisi doğrulaması | Mevcut `test/level-matrix.mjs` low/medium/high beklentilerini izole ağda yeniden doğrulamak | PROPOSED |
| L-02 | Lab egress doğrulaması | Hedef konteynerlerin `ordek_internal` dışına çıkamadığını kanıtlamak | PROPOSED |
