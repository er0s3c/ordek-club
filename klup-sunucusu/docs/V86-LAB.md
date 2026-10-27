# Tarayıcıda Linux (v86) kurulumu

`/academy/labs/browser` sayfası, öğrencinin tarayıcısında WebAssembly ile çalışan küçük bir Linux sanal makinesi açar
(v86, BSD-2-Clause). Emülatör (`libv86.mjs`, `v86.wasm`) `npm run vendor:assets` ile `public/vendor/v86/` altına kopyalanır.
BIOS ve işletim sistemi görüntüsü **depoya eklenmez**; lisanslarını kontrol edip yönetici kendisi yerleştirir.

## Gerekli dosyalar

`public/vendor/v86-images/` klasörüne:

| Dosya | Ne | Nereden |
| --- | --- | --- |
| `seabios.bin` | PC BIOS (SeaBIOS, LGPLv3) | v86 deposundaki `bios/` klasörü ya da SeaBIOS derlemesi |
| `vgabios.bin` | VGA BIOS (LGPL) | v86 deposundaki `bios/` klasörü |
| `linux.iso` (ya da `disk.img`) | Küçük bir Linux (ör. Buildroot ile derlenmiş, 32-bit x86) | Kendi Buildroot derlemeniz önerilir |

Ardından `manifest.json`:

```json
{
  "title": "Ördek Linux (Buildroot)",
  "bios": "seabios.bin",
  "vgaBios": "vgabios.bin",
  "cdrom": "linux.iso",
  "memoryMb": 128,
  "notes": "kullanıcı: root, parola yok"
}
```

`cdrom` yerine `hda` (disk görüntüsü) da kullanılabilir. Dosya adları yalnız harf, rakam, `.`, `_`, `-` içerebilir;
alt klasör kabul edilmez.

## Güvenlik notları

- Sanal makinede ağ kartı tanımlı değildir; dışarıya trafik çıkamaz. Her şey öğrencinin tarayıcısında çalışır.
- Görüntüler `public/` altında olduğu için oturum açmamış ziyaretçiler de indirebilir; gizli içerik koymayın.
- Görüntüyü güncelledikten sonra tarayıcı önbelleği nedeniyle dosya adını değiştirmek (ör. `linux-2.iso`) en kolay yoldur.
