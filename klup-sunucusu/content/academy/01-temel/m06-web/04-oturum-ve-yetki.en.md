---
id: m06-04
baslik: How does the server remember you? Cookie, session, token
hedefler:
  - Distinguish the concepts of cookie, session and token
  - Tell authentication apart from authorization
animasyonlar: [authentication]
---

# How does the server remember you? Cookie, session, token

> HTTP is forgetful: on every request it sees you for the first time. What makes it remember you is
> a small **ticket** your browser shows on every request.

::cizgi[m06-04-sahne]

## Three concepts

- **Cookie** — A small note the server leaves in your browser, which comes back with every request.
- **Session** — The record the server keeps saying "this ticket belongs to that person". Only a random identifier sits in the cookie.
- **Token** — A signed ticket that carries information inside itself (e.g. JWT). Usually used in APIs.

Whoever holds the ticket, the server takes them to be **you**. That's why a session cookie is no different from a password.

## The sign-in flow

::animasyon[authentication]

## The cookie's security settings

![The cookie table in the browser](../../gorseller/m06-04-a.webp)

| Setting | What it protects |
|---|---|
| `HttpOnly` | JavaScript can't read the cookie → it's harder to steal through XSS |
| `Secure` | Only sent over HTTPS |
| `SameSite` | Not attached to requests coming from other sites → against CSRF |

## Two different questions

![Two checks at the club door: the first host checks an ID card, the second host inside checks the VIP room's list](../../gorseller/m06-04-c.webp)

| | Authentication | Authorization |
|---|---|---|
| Question | **Who are you?** | **Are you allowed to do this?** |
| Example | Signing in with a password + MFA | A student can't see someone else's grade |
| If it fails | Someone else signs in as you | Everyone who signs in sees everything |

One of the most common web flaws is the second one: the sign-in is correct, but **the authorization check is missing**.
Like seeing someone else's grade by changing `/notlar/1001` in the URL to `/notlar/1002` (Path A: IDOR).

## 🧪 Try it (3 min)

Look at a site's cookies in your own browser. Are `HttpOnly` and `Secure` ticked on the session cookie?
⚠️ Never share cookie **values** with anyone, and never put them in a screenshot.

## ✅ Remember

- Session cookie = a ticket worth as much as a password.
- HttpOnly, Secure and SameSite protect the cookie.
- Authentication asks "who are you?", authorization asks "are you allowed?".
