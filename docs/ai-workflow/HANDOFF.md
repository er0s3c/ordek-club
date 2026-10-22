# Modeller Arası Devir Notları

## Model değiştirme nasıl yapılır

Claude oturum içinde modeli kendiliğinden değiştiremez. Bir görev Opus 4.8 gerektirdiğinde:

1. Opus 5.5 mevcut işi commit'ler ve `IMPLEMENTATION_STATUS.md`'yi günceller.
2. `OPUS_48_TASKS.md`'ye kapsam bloğu dolu bir `L-XX` görevi ekler (durum: PROPOSED) ve aşağıya devir notu yazar.
3. **Kullanıcı** görevi onaylar (durum → APPROVED), Claude uygulamasında **yeni bir oturum** açar,
   model seçicisinden Opus 4.8'i seçer, `lab/authorized-validation` branch'inde çalıştırır ve şu mesajla başlatır:
   `docs/ai-workflow/OPUS_48_TASKS.md içindeki L-XX görevini, SECURITY_BOUNDARIES.md kurallarına uyarak yürüt.`
4. Opus 4.8 raporu `docs/ai-workflow/reports/L-XX.md`'ye yazar; başka dosyaya dokunmaz (görevde izin yoksa).
5. Savunma düzeltmesi/entegrasyon için iş Opus 5.5 oturumuna geri döner.

## Devir kayıtları

| Tarih | Kimden → Kime | Görev | Not |
|---|---|---|---|
| 2026-10-22 | — | C1-01…C1-09 | Faz 1 tamamlandı (Opus 5.5). Opus 4.8'e devir gerekmedi: işlerin tamamı savunma/uygulama. |
| 2026-10-22 | — | C2-01…C2-05, S-02 | Faz 2 tamamlandı (Opus 5.5). Devir gerekmedi. |
