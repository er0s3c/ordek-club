---
id: e-07
baslik: "Model and API security: the key, the bill and the model file"
hedefler:
  - Store the API key safely and prevent unbounded consumption
  - Treat model files as a supply chain dependency
---

# Model and API security: the key, the bill and the model file

> Behind an AI application there is a **model** and an **API key**. Both can be taken over, poisoned, or used to inflate the bill.
> 🎭 **Voice 7:** There is a key sitting in Mirror's code, and no queue at the door. The thousands of requests Veysel sent overnight land on the club's bill.

::cizgi[e-07-sahne]

## API key management

- The key does **not** go in the code, the prompt or the client (the browser, the mobile app); use an environment variable
  or a secret manager on the server.
- A separate key for each environment (development ≠ production), the narrowest permission, a spending limit.
- A key that lands in a repository counts as leaked: **revoke it** first, then clean up the history.

```python
import os
API_ANAHTARI = os.environ["AYNA_API_ANAHTARI"]   # not in the code, in the environment
```

## Unbounded consumption (LLM10)

![A robot answering an endless queue of requests while the counter and the receipt roll beside it stretch to the ceiling](../../gorseller/e-07-b.webp)

Even a single long request is expensive; thousands of them bring the service down.

| Control | Example value |
|---|---|
| Rate limit per user | 10 requests per minute |
| Input length | At most 2,000 characters |
| Output length | At most 500 tokens |
| Budget alarm | At 80% of the monthly budget |

## Supply chain: a model file is software too (LLM03)

![Hidden gears and a small green bug visible inside a delivered brain jar](../../gorseller/e-07-c.webp)

- Some model formats (Python *pickle*) **can run code** when loaded; prefer formats that only carry data,
  such as `safetensors`.
- Download the model from a known publisher, verify its hash, and pin the version.
- Plugins, libraries and ready-made "prompt packs" are dependencies too; the supply chain rules from Path A apply here as well.

```bash
sha256sum model.safetensors   # compare it with the value the publisher gave
```

## 🧪 Try it (5 min)

Find the three flaws related to this lesson in `lab/e-ayna-mini.py` (hint: the key, the request limit, the length).
Write a one-line fix for each. Then fix your own copy so that it reads the key from an environment variable.

## ✅ Remember

- The key does not sit in the code, the prompt or the client; a leaked key is revoked immediately.
- An AI application with no rate, length or budget limit is an open invitation.
- Model files are dependencies too: a safe format, a known source, hash verification.
