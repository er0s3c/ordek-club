/*
  Ördek Akademi — Yol G laboratuvar dosyası: YARA alıştırması (G11)
  KURGUSAL eğitim örneği "kampus-saat-guncelleme.exe" için tespit kuralı yazacaksın.

  Kaynaklar (analiz VM'inde):
    /opt/akademi/g-saat-bocegi-strings.txt
    /opt/akademi/g-saat-bocegi-pe.txt
    /opt/akademi/g-saat-bocegi-sandbox.json

  Kullanım:
    cp /opt/akademi/g-yara-alistirma.yar ~/kural.yar
    yara -s ~/kural.yar /opt/akademi/g-saat-bocegi-strings.txt
    yara -r ~/kural.yar /usr/bin/        # temiz dosyalar: HİÇ eşleşme olmamalı

  Not: Alıştırmanın hedefi bir metin dökümü olduğu için "MZ" kontrolü yorum satırında.
  Gerçek bir PE dosyasına karşı kullanırken o satırı aç.
*/

// ---------------------------------------------------------------------------
// BÖLÜM 1 — Boşlukları doldur. "____" yazan yerlere strings dökümünden
// DEĞİŞMESİ ZOR olan dizeleri koy.
// ---------------------------------------------------------------------------
rule Saat_Bocegi_Kurgusal
{
    meta:
        yazar       = "Tilki"
        aciklama    = "Kurgusal saat bocegi egitim ornegi (Yol G)"
        tarih       = "2026-10-21"
        tlp         = "CLEAR"
        referans    = "g-saat-bocegi-sandbox.json"

    strings:
        $mutex   = "____" ascii wide          // ipucu: Global\\... (ters bölüyü iki kez yaz)
        $gorev   = "____" ascii wide          // ipucu: zamanlanmış görevin adı
        $ua      = "____" ascii               // ipucu: User-Agent
        $alan    = "____" ascii wide          // ipucu: ana komuta sunucusunun alan adı
        $isaret  = { 4B 55 52 47 55 }         // .cark bölümünün başındaki işaret: hangi dize?

    condition:
        // uint16(0) == 0x5A4D and
        3 of them
}

// ---------------------------------------------------------------------------
// BÖLÜM 2 — Bu kural KÖTÜ. Neden? En az iki sorunu yaz, sonra düzelt.
// (Önce /usr/bin/ üzerinde çalıştırıp kaç eşleşme verdiğine bak.)
// ---------------------------------------------------------------------------
rule Kotu_Kural_Ornegi
{
    strings:
        $a = "http"
        $b = "Software"
        $c = "198.51.100.23"

    condition:
        any of them
}
