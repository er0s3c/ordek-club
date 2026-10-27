---
id: m08-02
baslik: Hash is not encryption — and why are passwords salted?
hedefler:
  - Explain the difference between hash and encryption
  - Understand why passwords are stored with a salted, slow hash
---

# Hash is not encryption

> Encrypted data **opens back up** with the key. Hashed data **never comes back**.
> The right way to store passwords is the second one.

::cizgi[m08-02-sahne]

## Make the difference clear

![On the left a box locked and opened with a key (encryption), on the right a press that turns a fruit into juice and can't turn it back (hash)](../../gorseller/m08-02-b.webp)

| | Encryption | Hash |
|---|---|---|
| Reversibility | Decrypted with the key | **Never comes back** |
| Output length | Proportional to the input | Always fixed |
| Purpose | Confidentiality | Integrity, storing passwords |
| Example | AES, RSA | SHA-256, scrypt, Argon2 |

## How is a password verified?

The site **doesn't store** your password. It stores its hash. When you sign in, it hashes the password you entered with the same method and compares them.

## Two problems, two solutions

![Sprinkling a different salt on the same two plates of food brings out completely different patterns](../../gorseller/m08-02-c.webp)

1. **Same password → same hash.** An attacker matches millions of common passwords instantly with ready-made tables ("rainbow table").
   → **Salt:** a random value unique to each user is added. Even the same password produces a different hash.
2. **Fast hash = fast cracking.** SHA-256 allows billions of guesses per second.
   → **A slow, memory-hard KDF:** bcrypt, scrypt, Argon2. One guess takes milliseconds; billions of them take years.

See insecure and secure password storage side by side:

::animasyon[secure-vs-insecure]

## What should you look for in a breach report?

"Passwords were stored in **plain text**" → very bad. "With **MD5**" → bad.
"With **salted bcrypt/Argon2**" → very expensive for the attacker; change your password anyway.

## 🧪 Try it (3 min)

In the terminal, hash the same text twice, then change one letter:

```bash
echo -n "ordek" | sha256sum
echo -n "ordek" | sha256sum
echo -n "Ordek" | sha256sum
```

## ✅ Remember

- Encryption opens back up, a hash doesn't.
- Salt makes identical passwords different.
- Passwords are stored with a slow KDF (bcrypt/scrypt/Argon2), not a fast hash.
