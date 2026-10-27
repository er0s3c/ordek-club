---
id: a-06
baslik: "Browser side: XSS, CSRF, CORS and CSP"
hedefler:
  - Explain how XSS and CSRF work
  - Tell apart which question CORS and CSP answer
animasyonlar: [xss]
---

# Browser side: XSS, CSRF, CORS and CSP

> Sometimes the attack runs not on the server but **in the victim's browser** — with their session, in their name.
> 🗂️ **Drawer 6:** Someone has left a strange note on the portal's noticeboard.

::cizgi[a-06-sahne]

## XSS: script that leaks into the page

If user input is printed onto the page **without escaping**, the browser runs it as code.

| Type | Where does the input sit? |
|---|---|
| **Reflected** | Inside the link; it runs when the victim clicks |
| **Stored** | In the database (a comment, an announcement); it runs for everyone who opens the page |
| **DOM-based** | JavaScript in the browser writes the input onto the page itself |

::animasyon[xss]

## CSRF: a request in your name

![A shadow holding a sleeping user's hand with puppet strings and making them sign the bank form](../../gorseller/a-06-b.webp)

Another site triggers a request in your name **with the cookies your browser adds automatically**
("change your password", "send the money"). Defence: `SameSite` cookies and a **CSRF token** per request.

## CORS and CSP: two separate questions

![Two separate door guards: one checks which neighbour may receive letters, the other checks which performer may draw on the page](../../gorseller/a-06-c.webp)

| | The question it asks | Typical mistake |
|---|---|---|
| **CORS** | Can another site **read** this response? | Allowing every origin + allowing credentials |
| **CSP** | **Which scripts** can run on this page? | `unsafe-inline` makes XSS protection pointless |

CORS doesn't stop an attack; set up wrongly, it **opens the door**. CSP is the second lock against XSS.

## Defence summary

Context-aware output escaping (the framework default), `HttpOnly` cookies, a strict CSP,
SameSite + a CSRF token, and only known origins in CORS.

## 🧪 Try it (5 min)

Type `<b>deneme</b>` into the search box on your local Juice Shop. Did the result heading appear bold,
or were the tags printed as they are? If it appeared bold, what does that mean?

## ✅ Remember

- XSS: input is printed onto the page without escaping.
- CSRF: the browser adds cookies automatically; a token and SameSite cut that off.
- CORS asks "who can read?", CSP asks "what can run?".
