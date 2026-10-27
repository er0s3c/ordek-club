---
id: a-04
baslik: "Account and session: password reset, JWT and MFA"
hedefler:
  - Recognise the typical mistakes in password reset and MFA flows
  - Decode the structure of a JWT and explain what isn't secret in it
animasyonlar: [authentication]
---

# Account and session: password reset, JWT and MFA

> Breaking the door is hard. **Asking for the spare key** is usually easier.
> 🗂️ **Drawer 4:** Jasmine is interested in the portal's "Forgot my password" page. Why?

::cizgi[a-04-sahne]

::animasyon[authentication]

## Common mistakes

| Flow | Mistake | Result |
|---|---|---|
| Sign-in | "No such user" and "Wrong password" differ | Usernames get collected |
| Sign-in | No attempt limit | Brute force |
| Reset | A short, guessable or non-expiring link | The account is taken over |
| Reset | The link address is built from the `Host` header | The link goes to the attacker |
| MFA | The session is opened even when the code step is skipped | MFA becomes decoration |
| Sign-out | The server doesn't delete the session | The old cookie still works |

## JWT: a signed ticket anyone can read

![An entry ticket in a glass envelope: anyone can read the inside, but the seal underneath exposes forgery](../../gorseller/a-04-b.webp)

`xxxxx.yyyyy.zzzzz` → **header . payload . signature**. The first two parts are only Base64; they are not encrypted.

```json
{ "sub": "ogrenci.ali", "rol": "ogrenci", "exp": 1767225600 }
```

- **Anyone can read** the contents → you don't put secrets in there.
- Security comes from the **signature**; if the server doesn't verify it, `rol` can be changed.
- Tokens that accept `alg: none`, use a weak key, or have no expiry (`exp`) are classic findings.

## Defence

The same error message, an attempt limit, a single-use reset link with a short lifetime,
MFA verified on the server side, and a token whose signature is checked on every request.

## 🧪 Try it (5 min)

Sign in to your local Juice Shop. In Burp, take the token in a request's `Authorization: Bearer ...` header and
decode its middle part as Base64 in **Decoder**. What's inside? Do you see anything that shouldn't be there?
⚠️ Don't paste tokens into online sites.

## ✅ Remember

- Error messages and attempt limits decide how easy username collection and brute force are.
- A JWT's payload isn't secret; trust comes from the signature.
- A reset link should be single-use and short-lived.
