---
id: d-09
baslik: "Malware intelligence: same family, same hand?"
hedefler:
  - Cluster samples with exact and fuzzy hashes
  - Explain how code reuse and leaked tools mislead attribution
---

# Malware intelligence: same family, same hand?

> The name on a piece of malware is a label; the structure inside it is a fingerprint.
> 🚩 **Flag 9:** There is a huge signature inside the DLL: `MERCAN-7 was here`. Why would a real group leave its signature so easy to find?

::cizgi[d-09-sahne]

## Hash types

| Hash | What does it tell you? | Limit |
|---|---|---|
| **MD5 / SHA-256** | Is this file exactly the same? | One changed byte changes it completely |
| **ssdeep / TLSH** (fuzzy) | How **similar** are the files? | Can mislead on a packed file |
| **imphash** | Which functions does it import, in which order? | Anything built with the same compiler comes out similar |

```bash
sha256sum svc_update.dll
strings -n 8 svc_update.dll | grep -i mercan
```

## Family and sample

A **sample** is a single file; a **family** is a set of samples that share common code.
With fuzzy hashes and imphash you cluster samples, and with sandbox reports you compare their behaviour.

## Cheap traces, expensive traces

![A hat and a fake moustache the attacker changes easily, and a way of walking they cannot; the detective is looking at the footprint pattern](../../gorseller/d-09-b.webp)

| Easy to imitate | Hard to imitate |
|---|---|
| Strings, folder and task names | Owning infrastructure and running it |
| Language setting, compile time | Long-standing procedure habits |
| Another group's leaked tool | Target selection and operational rhythm |

**Leaked builder:** once a group's tool becomes public, its "signature" belongs to everyone.
In that case, the same family does not mean the same hand.

## IOC sets

Record the domain names, IPs and mutex/task names that come out of samples **as a set**, not one by one.
If the set appears partly in a new sample, you can assess the likelihood of a relationship.

## 🧪 Try it (5 min)

`lab/d-tehdit-raporlari.md` → look at the table in the K5 appendix. Which samples does H1 resemble, and which does it not?
What does an imphash match prove, and what does it not prove? Is the string `MERCAN-7 was here` strong or weak for attribution? Why?

## ✅ Remember

- SHA-256 says "the same file", ssdeep/TLSH says "a similar file", imphash says "a similar build".
- Strings and names are cheap traces; they are the first flag Bedri plants.
- A leaked tool spreads the same family into different hands.
