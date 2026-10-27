---
id: m09-02
baslik: Search engines, WHOIS, DNS and the internet's memory
hedefler:
  - Carry out targeted searches with search operators
  - Read WHOIS and DNS records
  - Look at a site's past in a web archive
---

# Search engines, WHOIS, DNS and the internet's memory

> Things may disappear from the internet, but most of the time their **trace** stays. Whoever knows the right query finds that trace.

::cizgi[m09-02-sahne]

## Search operators

| Operator | Example | What does it do? |
|---|---|---|
| `"..."` | `"Kuzey Kıyı Üniversitesi"` | Exact phrase |
| `site:` | `site:kuzeykiyi.edu.example burs` | Only on that site |
| `filetype:` | `filetype:pdf yönetmelik` | A specific file type |
| `-` | `ördek -yemek` | Exclude the word |
| `before:` / `after:` | `after:2025-01-01` | Date range |

## WHOIS: the domain name's birth register

![A domain name's identity card; its date of birth is flashing red because it is new](../../gorseller/m09-02-c.webp)

```bash
whois example.com
```

What to look at: **registration date** (is it new?), **registrar**, **expiry date**. Personal details are usually hidden behind a privacy service.

> If the domain name of a "university scholarship" site was registered **3 days ago**, that on its own is a big sign.

## DNS records

```bash
nslookup -type=MX example.com     # mail servers
nslookup -type=TXT example.com    # verification records such as SPF
```

| Record | Meaning |
|---|---|
| `A` / `AAAA` | IPv4 / IPv6 address |
| `MX` | The server that accepts email |
| `TXT` | Verification and email security (SPF, DMARC) |
| `NS` | The domain name's name servers |

## The internet's memory: the web archive

You can see a site's **old versions** in web archives. This is very valuable for content that has been changed or deleted.

![Web archive calendar](../../gorseller/m09-02-a.webp)

## 🧪 Try it (5 min)

Run `whois example.com` (or use a WHOIS website). What is the registration date?
Then find the oldest record of `example.com` in the web archive. Do the two agree?

## ✅ Remember

- Operators narrow a search: `site:`, `filetype:`, `"..."`.
- A new registration date in WHOIS is a warning sign.
- A web archive shows a site's past.
