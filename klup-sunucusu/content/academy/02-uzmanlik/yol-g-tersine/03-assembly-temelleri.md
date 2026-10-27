---
id: g-03
tur: ders
baslik: "Assembly temelleri: register, stack ve kontrol akışı"
sure: 8
hedefler:
  - Temel x86/x64 register'larını ve stack'i açıklamak
  - Kısa bir assembly parçasındaki koşul ve döngüyü okumak
gorseller:
  - id: g-03-b
    tur: ai
    alt: "Üst üste konmuş tabaklar: son konan ilk alınıyor; bir garson tabakları tek tek ekleyip çıkarıyor"
    prompt: "A waiter in a noir diner stacks plates one on top of another and takes them off again from the top only, the last plate placed being the first one removed, a cook watching the stack grow and shrink."
  - id: g-03-c
    tur: ai
    alt: "Raylı bir yol haritası: makaslar ve dönüşlerle program akışını gösteren tren hattı"
    prompt: "A model railway layout on a large table with switches, loops and branching tracks, a small glowing train moving along one route while an analyst traces the path with a pencil on a matching paper map."
---

# Assembly temelleri: register, stack ve kontrol akışı

> Kaynak kod gitmiş olabilir ama işlemcinin okuduğu komutlar duruyor. Assembly, o komutların insan okuyabilen hâlidir.
> ⚙️ **Çark 3:** Böceğin dişlileri makine dilinde dönüyor. Selim Hoca gülümsüyor: "Sabri'nin sabrına sabırla cevap vereceksin."

::cizgi[g-03-sahne]

## Register'lar: işlemcinin cep defteri

| x64 | x86 | Tipik kullanım |
|---|---|---|
| `RAX` | `EAX` | Hesap, fonksiyonun **dönüş değeri** |
| `RCX` `RDX` `R8` `R9` | — | Windows x64'te ilk 4 fonksiyon argümanı |
| `RSP` | `ESP` | Stack'in tepesi |
| `RIP` | `EIP` | Sıradaki komutun adresi |

## Stack

![Üst üste konmuş tabaklar: son konan ilk alınıyor; bir garson tabakları tek tek ekleyip çıkarıyor](../../gorseller/g-03-b.webp)

Stack (yığın) üst üste dizilen tabaklar gibidir (LIFO): `push` koyar, `pop` alır.
`call` dönüş adresini stack'e iter ve fonksiyona atlar; `ret` o adresi alıp geri döner.

## Sık görülen komutlar

```asm
mov  eax, 5        ; eax = 5
add  eax, 3        ; eax = eax + 3
cmp  eax, 8        ; karşılaştır, bayrakları ayarla
jne  yanlis        ; eşit değilse "yanlis"a atla
call kontrol_et    ; fonksiyonu çağır
xor  eax, eax      ; eax = 0 (kısa yol)
```

## Kontrol akışını okumak

![Raylı bir yol haritası: makaslar ve dönüşlerle program akışını gösteren tren hattı](../../gorseller/g-03-c.webp)

- `cmp` / `test` + koşullu atlama (`je`, `jne`, `jg`, `jl`) = bir **if**.
- Geriye doğru atlayan bir atlama çoğu zaman **döngüdür**.
- Crackme'lerde parola kontrolü genellikle tek bir karşılaştırma ve tek bir `jne`'dir.

## 🧪 Dene (5 dk)

Kâğıt kalemle çalıştır:

```asm
    mov  ecx, 0
    mov  eax, 1
dongu:
    add  eax, eax
    inc  ecx
    cmp  ecx, 4
    jl   dongu
```

Döngü kaç kez döner, sonunda `eax` kaçtır? Aynı işi yapan üç satırlık Python kodunu yaz.

<details><summary>Cevap</summary>4 kez döner; eax = 16. Python: <code>eax = 1</code> · <code>for _ in range(4):</code> · <code>eax += eax</code></details>

## ✅ Akılda kalsın

- Register'lar işlemcinin cep defteri; `RIP` sıradaki komutu gösterir.
- `call` stack'e dönüş adresini koyar, `ret` onu alıp geri döner.
- Karşılaştırma + koşullu atlama = if; geriye atlama = döngü.
