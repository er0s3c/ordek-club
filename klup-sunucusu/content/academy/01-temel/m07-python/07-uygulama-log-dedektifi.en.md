---
id: m07-07
baslik: "Practice: The Security Log Detective"
hedefler:
  - Write a program that counts the failed sign-in records in a sample log file
  - Turn the finding into an attack story
---

# Practice: The Security Log Detective

> The administrator of the fictional **kulup-srv** server asks one morning:
> *"Did anything happen yesterday? Could you look at the logs?"* You have `/opt/akademi/auth.log`.

::cizgi[m07-07-sahne]

## Mission 1 — The program (required)

Write a program called `dedektif.py`. It should print:

1. The total number of failed logins
2. The number of failed logins per IP, from most to least (top 5)
3. Attempts made with **non-existent** usernames (`invalid user`)

## Mission 2 — The story (required)

![A long timeline pinned to the wall; countless red failed-attempt marks followed by a single green successful-login mark](../../gorseller/m07-07-b.webp)

Looking at your program's output, answer these questions:

- Which IP behaves **differently** from the others? How is it different?
- Over how long did this IP make its attempts?
- Is there a **successful** login after that IP? With which account, by which method?
- What would you recommend to the administrator? (at least 3 points)

## Mission 3 — Bonus

Add a rule that prints "ALARM" if there are **more than 10** failed attempts from the same IP **within 1 minute**.

## Submission

`dedektif.py` + the program's output + your answers to Mission 2 (200 words maximum).

<details><summary>Hint: finding the successful logins</summary>Successful logins start with <code>Accepted</code>. The difference between <code>Accepted publickey</code> and <code>Accepted password</code> is a hint too.</details>

<details><summary>Instructor note: expected findings</summary>135 failed logins. 203.0.113.66 makes 58 attempts in about 2–3 minutes (deploy and invalid user admin), followed by <code>Accepted password for deploy</code>: the brute force succeeded. Other users normally sign in with publickey. Expected recommendations: change deploy's password and close its sessions, turn off password login on SSH (keys only), fail2ban/rate limiting, block 203.0.113.66, and investigate what was done with the deploy account afterwards.</details>

## ✅ Remember

- Numbers answer "what happened?", time answers "how did it happen?".
- The single success after many failures is the most important line.
- A good finding ends with a recommendation.
