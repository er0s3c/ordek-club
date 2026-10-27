---
id: a-11
baslik: "Defence side: WAF, attack traces in logs, secure code"
hedefler:
  - Explain what a WAF can and cannot do
  - Find attack traces in web server logs
animasyonlar: [soc-alert]
---

# Defence side: WAF, attack traces in logs, secure code

> However careful an attacker is, they **leave traces**. The question is whether anyone looks at them.
> 🗂️ **Drawer 11:** The portal's night logs are on your desk. Jasmine's footprints are in them.

::cizgi[a-11-sahne]

## WAF: the guard at the door

![A guard at the door sorting out suspicious packages, but the vault lock inside is also solid on its own](../../gorseller/a-11-b.webp)

A **Web Application Firewall** blocks known attack patterns before the request arrives.

- ✅ It cuts off bulk, automated attacks and known patterns; it buys time until the flaw is closed.
- ❌ It can be bypassed with an encoding trick, and it **cannot see** business logic mistakes or IDOR.
- A WAF is not a patch; **it doesn't replace fixing the code.**

## What do you look for in logs?

| Trace | What does it point to? |
|---|---|
| `'`, `%27`, `UNION`, `ORDER BY` | An SQL injection attempt |
| `../`, `%2e%2e` | Path traversal |
| `<script`, `%3Cscript` | An XSS attempt |
| Many `401` / `429` from the same IP | Brute force |
| Sequential identifiers (`/1042`, `/1043`…) | IDOR scanning |
| A response size much larger than normal | Data may have leaked |

::animasyon[soc-alert]

```bash
grep -E "%27|'|union|order%20by" -i /opt/akademi/access.log
awk '{print $1}' /opt/akademi/access.log | sort | uniq -c | sort -rn
```

## Secure code checklist

Input validation · context-aware output escaping · parameterised queries · authorisation on every request ·
secrets kept out of the code · error messages without detail · security events logged.

## 🧪 Try it (8 min)

On the lab VM, examine the `/opt/akademi/access.log` file:

1. Which IP is the attacker? When was the first request, and what was it?
2. **Which** of the injection attempts succeeded? (Hint: look at the response size.)
3. Which attempts were blocked, and by which defence?

## ✅ Remember

- A WAF buys time; you close the flaw in the code.
- Attack traces: special characters, sequential identifiers, floods of 401/429, inflated responses.
- An attack you don't log you never see.
