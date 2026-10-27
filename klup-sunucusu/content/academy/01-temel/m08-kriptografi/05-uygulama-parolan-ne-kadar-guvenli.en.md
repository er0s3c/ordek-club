---
id: m08-05
baslik: "Practice: How secure is your password?"
hedefler:
  - Calculate password strength from length and character set
  - Compare authentication methods according to the scenario
---

# Practice: How secure is your password?

> ⚠️ **Never** type your real password in this practice — work only with the fictional examples below.

::cizgi[m08-05-sahne]

## Part 1 — Calculate

![A short combination lock opens in a few seconds while, in front of a long combination lock, a robot grows old waiting](../../gorseller/m08-05-b.webp)

The number of possible combinations for a password: **(size of the character set) ^ (length)**

| Set | Size |
|---|---|
| Digits only | 10 |
| Lowercase letters | 26 |
| Upper + lower + digits | 62 |
| + special characters | ~94 |

Assume the attacker can make **10 billion** guesses per second (a breach with a fast hash).

```python
def kirma_suresi(kume: int, uzunluk: int, hiz: float = 1e10) -> str:
    saniye = kume ** uzunluk / hiz
    for birim, s in [("yıl", 31_536_000), ("gün", 86_400), ("saat", 3_600), ("dakika", 60)]:
        if saniye >= s:
            return f"{saniye / s:,.0f} {birim}"
    return f"{saniye:.3f} saniye"

print(kirma_suresi(10, 6))      # 6-digit PIN
```

Calculate the **worst-case** cracking time of the following fictional passwords and fill in the table:

| Fictional password | Set | Length | Time |
|---|---|---|---|
| `482913` | | | |
| `ordekk` | | | |
| `Ordek2026` | | | |
| `K!p2#vX9` | | | |
| `kumda yuruyen mavi ordek` | | | |

> Note: in reality attackers try **dictionaries and leaked password lists** first.
> A pattern like "name + year" such as `Ordek2026` cracks much faster than the calculation predicts.

## Part 2 — Compare

For each scenario, choose the most suitable authentication method and write in one sentence **why**:

1. An administrator connecting to the club server over SSH
2. A student signing in to the student portal from a phone
3. The club's social media account (shared by 5 people)

<details><summary>Discussion notes</summary>1: An SSH key (+ turn off password login). 2: A password manager + app-based MFA or a passkey. 3: A separate account/role for each person instead of a shared password; failing that, the password manager's sharing feature + MFA, and change the password when someone leaves.</details>

## ✅ Remember

- Every extra character multiplies the combinations: length wins.
- Predictable patterns (name + year) waste the maths.
- Choose the right method by scenario; separate identities instead of a shared account.
