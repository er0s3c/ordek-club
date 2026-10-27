---
id: e-12
baslik: "Final: Mirror's security assessment"
hedefler:
  - Assess the Mirror copy in the lab from threat model to before/after measurement
  - Map the findings to OWASP LLM risks and prioritise the controls
---

# Final: Mirror's security assessment

> Assessing an AI application is not fooling it; it is **showing with evidence what is protected, from whom, and how**.
> 🎭 **Final voice:** The Mirror copy in the lab is yours. Silence Veysel's voice; let Mirror speak only with its own.

::cizgi[e-12-sahne]

## Mission

Only in the lab, with `lab/e-ayna-mini.py` and the local model, **under a written scope**:

1. **Architecture and threat model** — a data flow diagram, trust boundaries, the four questions (E01, E02, E08)
2. **Testing** — the 12 tests in `e-redteam-testleri.csv` + at least 4 tests you wrote yourself; 5 repetitions each (E03–E07)
3. **Findings** — at least 6 findings, each with an OWASP LLM code; evidence: input, output, success rate
4. **Controls** — at least 6 controls in `ayna_guvenli.py` (E09, E10)
5. **Before/after** — the same tests on the secure version; was legitimate use broken?
6. **Log review** — an incident summary for `e-sohbet-kayitlari.jsonl` (E11)

## Report skeleton

| Section | Content |
|---|---|
| **Executive summary** | The 3 biggest risks, their impact, the first things to do |
| **Architecture** | Flow diagram, trust boundaries, protected assets |
| **Test matrix** | LLM01–LLM10 × tested / finding / control / residual risk |
| **Findings** | Title, OWASP code, severity, evidence, recommendation |
| **Before/after** | Success rate per test: insecure ↔ secure |
| **The human layer** | A verification procedure against fake voice/video (one paragraph) |
| **Residual risks** | What could not be fixed, and why it was accepted |

## Assessment

| Criterion | Points |
|---|---:|
| The scope was respected; lab only, harmless evidence (fake flag) | 2 |
| The threat model and the architecture are clear | 2 |
| The findings are evidenced, repeatable and prioritised | 3 |
| The controls work and were measured before/after | 2 |
| The residual risks are written honestly | 1 |

## ✅ Remember

- An AI assessment starts with the threat model and ends with a before/after measurement.
- Every finding carries repeatable evidence and a success rate.
- A model can be fooled; good design limits the damage even when it is.

> 🔒 **CASE CLOSED: Ventriloquist Veysel** · *when you submit your report*
>
> ::cizgi[veysel-kapanis]
>
> ➡️ *Season 2 is under way: other files of the Shadow Network are waiting for you on the other specialisation paths.*
