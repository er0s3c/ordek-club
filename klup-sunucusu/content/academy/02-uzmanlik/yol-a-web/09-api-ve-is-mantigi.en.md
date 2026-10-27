---
id: a-09
baslik: "API and business logic: OAuth, rate limiting, race conditions"
hedefler:
  - Recognise the typical flaws specific to APIs
  - Explain business logic mistakes and race conditions
---

# API and business logic: OAuth, rate limiting, race conditions

> The interface is only a shop window. The real door is the **API** behind it — and sometimes it counts the rules wrong.
> 🗂️ **Drawer 9:** The portal's meal-card coupon was used a hundred times in one night.

::cizgi[a-09-sahne]

## The classic API mistakes

![A robot carrying file after file of data out of the order window without anyone asking for ID; unlimited requests passing through a door with no rate limit](../../gorseller/a-09-c.webp)

| Mistake | Example |
|---|---|
| **Returning too much data** | A password hash, phone number and date of birth in the profile response |
| **Mass assignment** | Adding `"rol": "admin"` to a sign-up request is accepted |
| **No rate limit** | Thousands of attempts per minute against code verification |
| **Forgetting a version** | `/api/v2` is protected, `/api/v1` is still open |

## Business logic: not a technical flaw, a mistake in reasoning

Even if the browser won't allow it, the request **can be changed**:

- Quantity `-1` in the basket → the total drops.
- The payment step is skipped and a "order complete" request is sent directly.
- A discount code is applied twice, a refund twice.

## Race condition

![Five identical coupons reaching the till at the same moment; the cashier stamping the discount on all of them at once](../../gorseller/a-09-b.webp)

The server **checks** whether the coupon has been used, then **marks** it.
If 20 requests arriving at the same moment all pass the check together, the coupon is used 20 times.
The fix: make the check and the marking **one atomic operation** (a database lock, a unique constraint).

## Two critical settings in OAuth

- `redirect_uri` must be validated **exactly**; otherwise the authorisation code goes to the attacker.
- The `state` parameter must be used; otherwise an attacker can bind the victim to their own account.

## 🧪 Try it (5 min)

Add a product to the basket on your local Juice Shop. In Burp, send the `/api/BasketItems/` request to Repeater and
set `quantity` to `-1`. Did the server accept it? What happened to the total price? Where should the check have been?

## ✅ Remember

- Check separately in the API everything the interface blocks.
- A business logic mistake is closed not in the browser but in the server's rules.
- Check + mark must be one atomic operation; otherwise a race condition appears.
