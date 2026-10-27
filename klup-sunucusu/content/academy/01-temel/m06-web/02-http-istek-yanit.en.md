---
id: m06-02
baslik: HTTP — the language of the browser and the server
hedefler:
  - Recognise HTTP methods and status codes
  - Read the important headers
---

# HTTP — the language of the browser and the server

> Every click is a short letter written to the server. Anyone who can read these letters
> sees how a web application works — and where it goes wrong.

::cizgi[m06-02-sahne]

## Request and response

```http
GET /profil HTTP/1.1
Host: portal.kuzeykiyi.edu.example
Cookie: oturum=Vx8kq…
User-Agent: Mozilla/5.0

HTTP/1.1 200 OK
Content-Type: text/html; charset=utf-8
Set-Cookie: oturum=Vx8kq…; HttpOnly; Secure; SameSite=Lax
```

## Methods (verbs)

| Method | Meaning | Example |
|---|---|---|
| `GET` | Fetch | Show the profile page |
| `POST` | Send something new | Upload an assignment, sign in |
| `PUT` / `PATCH` | Update (fully / partly) | Change profile information |
| `DELETE` | Delete | Delete a post |

## Status codes

![Four coloured trays coming out of a service hatch: a green plate, a signpost, an empty plate and a burnt pan](../../gorseller/m06-02-c.webp)

| Code | Meaning | Remember |
|---|---|---|
| **2xx** | Successful | 200 OK, 201 Created |
| **3xx** | Redirect | 301/302: "go over there" |
| **4xx** | Your mistake | 401 not signed in, 403 no permission, 404 not found, 429 too fast |
| **5xx** | The server's mistake | 500: the server ran into an unexpected situation |

For a security person even the difference between `403` and `404` is a clue: is it "doesn't exist", or "exists but it's forbidden to you"?

## Look for yourself

![Network tab](../../gorseller/m06-02-a.webp)

## Security headers

| Header | What is it for? |
|---|---|
| `Strict-Transport-Security` | Forces the browser to always use HTTPS |
| `Content-Security-Policy` | Limits which scripts can run on the page |
| `X-Frame-Options` | Stops the page being shown secretly on other sites |

## 🧪 Try it (4 min)

F12 → Network → reload the home page of your school or a site you like.
What's the status code of the first request? Which of the three security headers above are present?

## ✅ Remember

- Request: method + address + headers (+ body); response: status code + headers + body.
- 4xx is a client error, 5xx is a server error; 401 ≠ 403.
- Security headers give the browser extra protection rules.
