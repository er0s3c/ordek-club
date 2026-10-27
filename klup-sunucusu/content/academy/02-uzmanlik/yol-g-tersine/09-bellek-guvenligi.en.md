---
id: g-09
baslik: "Memory safety: how buffer overflow works"
hedefler:
  - Explain why a buffer overflow leads to a crash and a loss of control
  - Recognise unsafe C code and turn it into its safe form
---

# Memory safety: how buffer overflow works

> Pour more water into a glass than it holds and the table gets wet. Data overflowing in memory, though, corrupts **its neighbour**.
> ⚙️ **Cog 9:** Sabri's oldest bugs didn't use their own gears but a loose spring in someone else's machine. Professor Selim: "Finding that spring is the defender's job."

::cizgi[g-09-sahne]

## The problem

![An overflowing glass: the excess water runs into the neighbouring glasses and changes what's in them](../../gorseller/g-09-b.webp)

In C and C++ a buffer has a fixed size, and the language does no bounds checking:

```c
char ad[16];
strcpy(ad, girdi);   // what if girdi is longer than 16 bytes? It overflows.
```

On the stack, immediately past `ad`, sit the saved registers and the function's **return address**.
If the overflowing data corrupts it, `ret` returns to the wrong address: at best a crash, at worst the program's control passes to someone else.

## Other memory bugs

| Bug | In short |
|---|---|
| **Heap overflow** | A buffer on the heap overflowing |
| **Use-after-free** | Using memory again after it has been freed |
| **Integer overflow** | The size calculation wraps, the buffer is allocated too small |
| **Format string** | `printf(girdi)` — the input is interpreted as a format command |

## Layers of defence

![Memory like a castle: rooms that change place every day, rooms with locked doors, and bell strings strung between doors](../../gorseller/g-09-c.webp)

- **Bounded functions:** `snprintf`, `strncpy` / `strlcpy`; always check the length.
- **Memory-safe languages:** Rust, Go, C#, Java prevent most of this bug class from the start.
- **Compiler and operating system protections:** stack canary, DEP, ASLR — the next lesson.
- **Fuzzing and static code analysis:** find the bug before the attacker does.

## 🧪 Try it (5 min)

Do a code review: how many security bugs are in this function, and how would you fix them?

```c
void selamla(const char *isim) {
    char tampon[32];
    sprintf(tampon, "Hello %s, welcome here!", isim);
    printf(tampon);
}
```

<details><summary>Answer</summary>Two bugs: (1) <code>sprintf</code> writes without limit; a name longer than 10 characters overflows the buffer → <code>snprintf(tampon, sizeof tampon, ...)</code>. (2) <code>printf(tampon)</code> is a format string bug → <code>printf("%s", tampon)</code>.</details>

## ✅ Remember

- C doesn't check bounds; overflowing data can corrupt the return address.
- The solution is layered: bounded functions, memory-safe languages, compiler protections.
- Find the memory bug with fuzzing before the attacker does.
