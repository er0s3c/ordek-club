---
id: f-05
baslik: "Mobile API security: token storage and certificate validation"
hedefler:
  - Explain how a session token should be stored securely in a mobile app
  - Distinguish certificate validation from certificate pinning
---

# Mobile API security: token storage and certificate validation

> The mobile app is a shop window; the real door is the **API** behind it. Hiding the button in the window doesn't lock the door.
> 🔧 **Circuit 5:** Someone is getting in between the lock app and its server. Does the app notice?

::cizgi[f-05-sahne]

## Where does the token live?

| Method | Status |
|---|---|
| Plain text in `SharedPreferences` / `UserDefaults` | ❌ Readable on a rooted device and in backups |
| API key hardcoded in the code | ❌ Anyone can see it with JADX |
| Record protected by Android Keystore / iOS Keychain | ✅ The key stays in hardware |

In addition: a short-lived access token + a refresh token, revoked server-side on sign-out.

## Authorisation is checked on the server

The app can hide the "admin" button, but an attacker calls the API directly.
Every request is checked on the server: is this token authorised to open **this door**? (See IDOR, Path A.)

## Certificate validation

::animasyon[mitm]

- The app **must validate** the server's TLS certificate. A custom `TrustManager` that says "trust all certificates" is the most common mistake.
- Apps targeting Android 7+ don't trust user-added certificates by default.
- `network_security_config.xml` turns off cleartext traffic.

## Certificate pinning

![A phone accepts only an envelope stamped with the one seal it knows; it pushes back an envelope with a fake seal](../../gorseller/f-05-b.webp)

The app carries the server's **expected public key** with it; it rejects a valid but different certificate.

- Upside: it stops a man-in-the-middle proxy and a fake certificate.
- Downside: when the certificate is renewed the app can lock up → a **backup pin** and a renewal plan are essential.
- Pinning alone isn't enough; it doesn't replace authorisation checks on the server.

## 🧪 Try it (5 min)

Install the OWASP ZAP certificate on the emulator as a **user certificate** and configure the proxy.
Is the emulator browser's HTTPS traffic visible? And the lab test app's traffic? Explain the difference.

## ✅ Remember

- The token belongs in the Keystore/Keychain, short-lived and revocable.
- A hidden button is not security; authorisation is checked on the server.
- Certificate validation is mandatory, while pinning is an extra lock to add together with a backup plan.
