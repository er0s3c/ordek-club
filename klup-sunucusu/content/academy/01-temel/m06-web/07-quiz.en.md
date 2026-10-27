---
id: m06-07
baslik: "M06 Quiz: Web technologies"
sorular:
  - soru: "What is the real domain name of https://kuzeykiyi.edu.example.guvenli-giris.com/login?"
    tur: coktan
    secenekler: [kuzeykiyi.edu.example, edu.example, guvenli-giris.com, login]
    dogru: 2
    aciklama: The domain name is read from right to left; the real registered domain is guvenli-giris.com.
  - soru: Which HTTP method is generally used to create a record (e.g. upload an assignment)?
    tur: coktan
    secenekler: [GET, POST, DELETE, HEAD]
    dogru: 1
    aciklama: POST is used to send new data to the server.
  - soru: When a signed-in user tries to reach a page they aren't authorised for, which code is usually returned?
    tur: coktan
    secenekler: ["200", "301", "403", "500"]
    dogru: 2
    aciklama: 403 Forbidden states that permission is missing even though the identity is known.
  - soru: Which setting stops the cookie being read by JavaScript?
    tur: coktan
    secenekler: [Secure, HttpOnly, SameSite, Expires]
    dogru: 1
    aciklama: HttpOnly makes stealing the cookie through XSS harder.
  - soru: "\"Student A can see student B's grade\" — which check is missing?"
    tur: coktan
    secenekler: [Authentication, Authorization, Encryption, Caching]
    dogru: 1
    aciklama: Making sure a user whose identity is known reaches only their own data is authorization.
  - soru: A sign-in check done only with JavaScript (e.g. a grade between 0 and 100) is enough for security.
    tur: dogru-yanlis
    dogru: false
    aciklama: The frontend is in the user's hands; the check must always be repeated in the backend.
  - soru: A publicly accessible storage area that is misconfigured in the cloud is the cloud provider's responsibility.
    tur: dogru-yanlis
    dogru: false
    aciklama: In the shared responsibility model, settings and data are the customer's responsibility.
---

# M06 Quiz: Web technologies

7 questions · pass mark 70%.

> 🔒 **CASE CLOSED: Cookie-Baker Celal** · *when you pass the quiz with 70%*
>
> ::cizgi[celal-kapanis]
>
> ➡️ *Next case file: **Puppeteer Orhan** (M07)*
