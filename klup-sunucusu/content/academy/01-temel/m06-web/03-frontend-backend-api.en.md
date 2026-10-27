---
id: m06-03
baslik: Frontend, backend and the API in between
hedefler:
  - Distinguish the roles of HTML, CSS and JavaScript
  - Explain how the frontend, backend, API and database relate
---

# Frontend, backend and the API in between

> The page you see is a theatre stage. The real work happens **behind the curtain** —
> and that's where the security decisions must be made too.

::cizgi[m06-03-sahne]

## On stage: the frontend

| Language | Job | Analogy |
|---|---|---|
| **HTML** | Content and structure | The set and the actors |
| **CSS** | Appearance | Costume and lighting |
| **JavaScript** | Behaviour | How the actors move |

The frontend runs **on your computer**. That means the user can see it, change it and skip it.

## Behind the curtain: the backend and the database

- **Backend** — Code running on the server. It decides who can do what.
- **Database** — Where the data is kept in tables (students, grades, assignments).

## The hatch in between: the API and JSON

![A small service hatch between a theatre stage and the backstage; order cards go in and tidy boxes come out](../../gorseller/m06-03-b.webp)

In modern applications the frontend talks to the backend through an **API**. The data is usually in **JSON** format:

```http
GET /api/odevler/42
```
```json
{ "id": 42, "baslik": "Ağ Temelleri", "teslim": "2026-03-10", "puan": 85 }
```

## The golden rule

> **A check in the frontend is a convenience, not security.**

If the rule "the grade field only accepts 0–100" exists only in JavaScript, the user can send the request
straight to the API saying `"puan": 1000`. Every check must be repeated **in the backend**.

## 🧪 Try it (3 min)

F12 → Network → select the **Fetch/XHR** filter and click something in a web application you use.
Did you manage to find an API request that returns JSON?

## ✅ Remember

- HTML is structure, CSS is appearance, JavaScript is behaviour.
- The frontend is in the user's hands; security decisions are made in the backend.
- APIs speak JSON and can be called directly.
