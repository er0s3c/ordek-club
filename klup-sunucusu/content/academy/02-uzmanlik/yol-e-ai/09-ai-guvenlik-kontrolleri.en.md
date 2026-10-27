---
id: e-09
baslik: "AI security controls: tool permission and output validation"
hedefler:
  - Treat model output as untrusted input
  - Validate tool calls with an allowlist and authority
---

# AI security controls: tool permission and output validation

> You cannot block injection 100%. But you can inspect **what comes out of the model's mouth** and **what its hand reaches for**.
> 🎭 **Voice 9:** Veysel can make the robot talk. Whether the words leave the stage is now the Shield's decision.

::cizgi[e-09-sahne]

## Insecure output handling (LLM05)

Model output is **untrusted input** too. Printed straight into HTML it becomes XSS, put into SQL or a shell command
it becomes injection, run through `eval()` it becomes remote code execution.

::animasyon[xss]

The solution is familiar from Path A: escaping according to context, parameterised queries, never `eval`.

## Validate the tool call

![The order card the robot holds out being compared against an allowlist at a checkpoint before it reaches the real machine](../../gorseller/e-09-b.webp)

The model's tool request is a **proposal**; the application makes the decision:

```python
import re
IZINLI = {"not_goster"}                         # allowlist
def dogrula(arac, arg, kullanici):
    if arac not in IZINLI:
        return False, "unauthorised tool"
    if not re.fullmatch(r"\d{4}-\d{4}", arg):
        return False, "invalid parameter"
    if arg != kullanici:
        return False, "someone else's data"
    return True, "ok"
```

## Guardrails

![A robot car driving along a mountain road between guardrails; the guardrail keeps it away from the cliff](../../gorseller/e-09-c.webp)

| Layer | What does it do? | Its limit |
|---|---|---|
| Input filter | Flags known injection patterns | Easily rewritten |
| Delimited context | Marks documents as "data" with a `<belge>` tag | Only a hint |
| Output filter | Looks for flags, numbers, email patterns | Can miss encoded leaks |
| Logging and alerting | Records the suspicious event | Notices it after the fact |

One layer is not enough; together the layers build **defence in depth**.

## 🧪 Try it (5 min)

Run T11 from `lab/e-redteam-testleri.csv` on Mirror-mini, then open `lab/ayna-gecmis.html` in the browser.
What happened? Fix your own copy so that it writes the answer with `html.escape()` and try again.

## ✅ Remember

- Model output is untrusted input; escaping is applied according to context.
- The model proposes the tool call; the application validates it with an allowlist, a format and authority.
- Guardrails are built layer by layer; none of them is enough on its own.
