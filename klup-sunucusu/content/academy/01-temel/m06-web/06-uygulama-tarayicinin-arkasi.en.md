---
id: m06-06
baslik: "Practice: What's behind the browser?"
hedefler:
  - Inspect a web page's network requests with developer tools
  - Tell client-side and server-side components apart
---

# Practice: What's behind the browser?

> Get to know the training application in the lab without touching it at all — just by **watching**.
> This is the first step of every web security test: reconnaissance.

::cizgi[m06-06-sahne]

## Environment

The training application in Ördek Lab (the lab address is given by your instructor).
Sign in with a test account. **In this mission you don't change any request** — you only observe.

![Fetch/XHR and the JSON preview](../../gorseller/m06-06-a.webp)

## Mission

![A student outside a glass-walled browser house, watching the message tubes flowing between the rooms through binoculars without touching anything](../../gorseller/m06-06-c.webp)

With F12 → **Network** open, move around the application and fill in this table:

| # | Question | Your answer |
|---|---|---|
| 1 | What **method** and **address** does the request sent while signing in use? | |
| 2 | Which **cookie** did the server leave after a successful sign-in? Are HttpOnly/Secure set? | |
| 3 | Find an **API request** that fetches the data on the page. What's its address, and which JSON fields does it return? | |
| 4 | Which **security headers** are present in the responses, and which are missing? | |
| 5 | Which requests returned **4xx/5xx**? Why might that be? | |
| 6 | How many of the JavaScript files running on the page come from **another domain name**? | |

## Submission

The table plus a paragraph of comment: *"If I were an attacker in this application, where would I look first, and why?"*

<details><summary>Marking note</summary>There isn't a single right answer. Good comments point out: API addresses containing identity numbers (authorization checks), missing security headers, cookies without HttpOnly, detailed error messages.</details>

## ✅ Remember

- Reconnaissance = watching without touching; the first step of every test.
- The Network tab shows all of an application's conversations.
- API addresses carrying identity numbers raise the authorization question.
