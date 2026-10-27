---
id: m07-04
baslik: Catch the pattern, take the fingerprint — regex and hash
hedefler:
  - Pull information out of text with regular expressions
  - Calculate the hash of a file
---

# Catch the pattern, take the fingerprint — regex and hash

> Pulling IP addresses out of a log and telling whether a file has been changed:
> two small superpowers.

::cizgi[m07-04-sahne]

## Regex: finding a pattern in text

![Only the matching pieces light up through the holes of a stencil card sliding over a long paper strip](../../gorseller/m07-04-b.webp)

```python
import re

satir = "Failed password for deploy from 203.0.113.66 port 50012 ssh2"

ip = re.search(r"from (\d+\.\d+\.\d+\.\d+)", satir)
if ip:
    print(ip.group(1))          # 203.0.113.66

kullanici = re.search(r"for (?:invalid user )?(\w+)", satir)
print(kullanici.group(1))       # deploy
```

| Pattern | Meaning |
|---|---|
| `\d` | a digit |
| `\w` | a letter, a digit or `_` |
| `+` | one or more |
| `( )` | capture it and use it later |
| `\.` | a real dot (a lone `.` = any character) |

When writing regex, test it in a playground such as [regex101.com](https://regex101.com).

## Hash: the file's fingerprint

![Two nearly identical documents go through a fingerprint machine; the fingerprints that come out are completely different](../../gorseller/m07-04-c.webp)

A hash function produces a digest of **fixed length** from any data. If a single bit changes, the digest changes completely.

```python
import hashlib

def sha256_dosya(yol: str) -> str:
    h = hashlib.sha256()
    with open(yol, "rb") as f:
        for parca in iter(lambda: f.read(8192), b""):
            h.update(parca)
    return h.hexdigest()

print(sha256_dosya("kurulum.iso"))
```

Where it's used: verifying that a downloaded file hasn't changed, proving evidence integrity,
recognising malware by its hash (M08, Path C).

> MD5 and SHA-1 are no longer considered secure; use **SHA-256**.

## 🧪 Try it (5 min)

Calculate the SHA-256 of a text file. Add a single space to the file and calculate it again. What changed?

## ✅ Remember

- Regex pulls a pattern out of text; try it first, then use it.
- Hash = the data's fingerprint; a small change, a completely different digest.
- For integrity use SHA-256; not MD5/SHA-1.
