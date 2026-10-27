---
id: a-01
baslik: "Web lab: catch the request, change it, send it again"
hedefler:
  - Explain what an intercepting proxy is for
  - Catch a request with Burp Suite, change it and send it again
animasyonlar: [http-request]
---

# Web lab: catch the request, change it, send it again

> The browser only shows you the result. Jasmine reads **the letter in between** — and you need to be able to read it too.
> 🗂️ **Drawer 1:** The lab copy of the Campus Portal is ready. Your test permission is signed, your scope is written down.

::cizgi[a-01-sahne]

## Proxy: the post clerk in between

![A postal clerk with a desk between the browser and the server; opening envelopes, reading them, changing them and sending them on](../../gorseller/a-01-c.webp)

You put an **intercepting proxy** between the browser and the server. Every request passes through it first:
you read it, change it, send it again. Every field the browser hides in the interface is visible here.

::animasyon[http-request]

## Set up the lab (once)

1. Training target: the portal copy in Ördek Lab, or **OWASP Juice Shop** locally:

```bash
docker run --rm -p 127.0.0.1:3000:3000 bkimminich/juice-shop
```

2. Install **Burp Suite Community** (free) → *Proxy → Open browser*. No certificate setup needed.
3. In the Burp browser, open `http://127.0.0.1:3000`.

![Burp Suite HTTP history](../../gorseller/a-01-b.webp)

## The four basic tabs

| Tab | What is it for? |
|---|---|
| **Proxy → HTTP history** | Every request that passed, in order |
| **Intercept** | Stop a request on the way, edit it, let it go |
| **Repeater** | Send one request again and again with changes, compare the responses |
| **Decoder** | Decode formats such as Base64 and URL encoding |

## Scope first

Add **only** the lab address to *Target → Scope* and tick "Show only in-scope items".
That way not a single request goes to another site by mistake.

## 🧪 Try it (5 min)

Search for any product in Juice Shop. Find the search request in HTTP history → right-click → *Send to Repeater*.
Change the search term and press **Send**. How did the size and content of the response change?

## ✅ Remember

- A proxy lets you read every letter between the browser and the server.
- The Repeater formula: change, send, compare.
- Tell Burp the scope too; not one request should leave the lab.
