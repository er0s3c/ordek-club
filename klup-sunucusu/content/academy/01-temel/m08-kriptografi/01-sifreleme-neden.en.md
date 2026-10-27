---
id: m08-01
baslik: How do you hide a secret in plain sight?
hedefler:
  - Tell cryptography and cryptanalysis apart
  - Compare symmetric and asymmetric encryption
---

# How do you hide a secret in plain sight?

> Every message on the internet passes through dozens of computers.
> **Encryption** makes sure that those who see the message cannot read it.

::cizgi[m08-01-sahne]

> 🕴️ **FILE: Safecracker Kadir** · *Vault Thief*
>
> ![Safecracker Kadir — Vault Thief](../../gorseller/karakter-kadir.webp)
>
> **Threat:** Password cracking, weak hashes, unsalted passwords, leaked password lists. · [Shadow Network story →](../../00-program/09-golge-ag.md)

::cizgi[kadir-acilis]

## Two sides

- **Cryptography** — Designing the methods that protect information.
- **Cryptanalysis** — Trying to break those methods (finding their weaknesses).

The rule: **don't invent your own encryption algorithm.** Use standards that have been analysed for years (AES, RSA, ECC).

## Symmetric encryption: one key

![Two friends locking and unlocking the same chest with two copies of the same key; the courier carrying the key is being watched on the way](../../gorseller/m08-01-b.webp)

The **same** key locks and unlocks.

```text
"Merhaba" + key K  →  encryption →  "x9#Lq2…"
"x9#Lq2…" + key K  →  decryption →  "Merhaba"
```

- ✅ Very fast (disks, files, large data)
- ❌ How do you get the key to the other side **safely**?
- Example: **AES**

## Asymmetric encryption: a key pair

![Public padlocks handed out to everyone and a single key that hangs only around its owner's neck](../../gorseller/m08-01-c.webp)

- **Public key** (public) — given to everyone; it **locks** the message.
- **Private key** (private) — only in your hands; it **opens** the lock.

It's like handing out open padlocks to everyone and keeping the key yourself.

- ✅ The key-sharing problem is solved
- ❌ Slow
- Example: **RSA**, **ECC**

## Both together in real life

In HTTPS, first a shared key is agreed with an asymmetric method, then the data travels with fast symmetric encryption (M05-06).

## 🧪 Try it (3 min)

Which is suitable? (a) encrypting a laptop disk, (b) starting a secret conversation over the internet for the first time with someone you've never met.

<details><summary>Answer</summary>(a) Symmetric — one person, lots of data. (b) First a key agreement with asymmetric, then symmetric.</details>

## ✅ Remember

- Don't invent your own algorithm; use standards.
- Symmetric: one key, fast. Asymmetric: a key pair, easy to share.
- Real systems use both together.
