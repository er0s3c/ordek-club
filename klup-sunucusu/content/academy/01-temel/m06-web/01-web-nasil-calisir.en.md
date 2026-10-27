---
id: m06-01
baslik: How does a web page open?
hedefler:
  - Tell a website apart from a web application
  - Explain the client-server model and the structure of a URL
animasyonlar: [http-request]
---

# How does a web page open?

> A web application is like a restaurant: you (the browser) place an order,
> the kitchen (the server) prepares it, the storeroom (the database) supplies the ingredients.

::cizgi[m06-01-sahne]

> 🕴️ **FILE: Cookie-Baker Celal** · *Session Thief*
>
> ![Cookie-Baker Celal — Session Thief](../../gorseller/karakter-celal.webp)
>
> **Threat:** Session cookie theft, APIs with missing authorization checks (IDOR), fake domain names. · [Shadow Network story →](../../00-program/09-golge-ag.md)

::cizgi[celal-acilis]

## Site or application?

- **Website** — Shows everyone the same content (the club's introduction page).
- **Web application** — Works just for you: you sign in, you send data (the student portal, Ördek Club).

From a security point of view the second is far more interesting: there's input, a session and data.

## The journey of a request

::animasyon[http-request]

## Learn to read a URL

![The address block on a parcel is read from right to left through a magnifying glass; the real building at the far right is glowing](../../gorseller/m06-01-b.webp)

```text
https://portal.kuzeykiyi.edu.example:443/notlar?donem=2026-guz#ozet
└─┬─┘   └────────────┬──────────────┘└┬┘└──┬──┘└─────┬─────┘└─┬─┘
scheme         domain name          port  path    query      fragment
```

| Part | Why does a security person look at it? |
|---|---|
| **Scheme** | `http` is unencrypted, `https` is encrypted |
| **Domain name** | Is it the real organisation? Read it right to left: `edu.example` → `kuzeykiyi` → `portal` |
| **Path and query** | The input sent to the server; most attacks start here |

🚩 `kuzeykiyi.edu.example.giris-dogrula.xyz` → the real domain name is **`giris-dogrula.xyz`**!
The domain name is always the **rightmost** part.

## 🧪 Try it (3 min)

Write the real domain name of these addresses:
1. `https://login.kuzeykiyi.edu.example/giris`
2. `https://kuzeykiyi.edu.example-guvenli.com/giris`

<details><summary>Answer</summary>1 → kuzeykiyi.edu.example · 2 → example-guvenli.com (fake!)</details>

## ✅ Remember

- The browser asks, the server prepares, the database stores.
- URL: scheme, domain name, port, path, query.
- Read the domain name from right to left; the real domain name is the rightmost part.
