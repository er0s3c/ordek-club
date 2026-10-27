---
id: a-03
baslik: "Access control and IDOR: can I see someone else's data?"
hedefler:
  - Explain the IDOR flaw and horizontal/vertical privilege escalation
  - Test access control with two accounts
---

# Access control and IDOR: can I see someone else's data?

> Signing in may be correct; the real question is whether **"is this data yours?"** is ever asked.
> 🗂️ **Drawer 3:** The note card address on the portal is `/notlar/1001`. The number in Jasmine's head: 1002.

::cizgi[a-03-sahne]

## What is IDOR?

**Insecure Direct Object Reference:** the server does not check whether the requested object (a note, a basket, an invoice)
belongs to the person asking. Change the identifier → someone else's data comes back.

```http
GET /api/notlar/1001   → your notes           ✅
GET /api/notlar/1002   → someone else's notes ❌ (but the server returns them)
```

## Two directions

![Horizontal movement in a hotel corridor (entering the next room) and vertical movement (taking the lift to the manager's floor)](../../gorseller/a-03-b.webp)

| Type | Example |
|---|---|
| **Horizontal** | Student A sees student B's data |
| **Vertical** | A student does work only a manager should be able to do (`/admin/kullanici-sil`) |

## How do you test it?

1. Create **two test accounts** in the lab: A and B.
2. Make a request as A (e.g. view your basket) and send it to Repeater.
3. Repeat the same request **with B's session**, or with B's identifier inside A's session.
4. If the response doesn't change, or B's data comes back: that's a finding.

The identifier isn't only in the URL; it can also be in a JSON body, a cookie or a hidden form field.

## Defence

- The server checks ownership **on every request**: `WHERE id = ? AND sahip_id = oturumdaki_kullanici`.
- Unpredictable identifiers (UUIDs) make it harder but are **not a solution on their own**.
- Authorisation rules live in one place and are applied automatically at every endpoint.

## 🧪 Try it (5 min)

Create an account on your local Juice Shop and add a product to the basket. In Burp, find the `/rest/basket/<number>` request,
lower the number by one in Repeater and send it. Whose basket did you see? What should the server have checked?

## ✅ Remember

- IDOR = the server doesn't ask "is this yours?".
- Test with two accounts: replay A's request through B's eyes.
- Random identifiers help; the real fix is an ownership check on every request.
