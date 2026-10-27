---
id: e-06
baslik: "Agent security: how far should the robot be able to reach?"
hedefler:
  - Recognise the three forms of excessive agency (tools, permissions, autonomy)
  - Design human approval and a sandbox for risky actions
---

# Agent security: how far should the robot be able to reach?

> A chatting model gets things wrong **in what it says**. An agent gets things wrong **in what it does**: it sends email, deletes records, spends money.
> 🎭 **Voice 6:** There is an email tool in Mirror's toolbox. Veysel made it read out an announcement; Mirror sent messages nobody asked for.

::cizgi[e-06-sahne]

## Excessive agency (LLM06)

| Excess | Example | Fix |
|---|---|---|
| Too many tools | The information bot has been given an email tool | Remove the tool you don't need |
| Too many permissions | The tool can read every student's grades | Run the tool with the user's identity |
| Too much autonomy | Sending to an external address without approval | Human approval for risky actions |

## On whose behalf does it work?

A tool runs with the **user's** authority, not the **model's**. On a `not_goster(2026-0417)` call the application
must ask: is the person signed in this student? This is the agent version of IDOR (*Insecure Direct Object Reference*) from Path A.

## Human approval and the sandbox

![A robot working inside a glass playpen with tools; every arm reaching out to the outside world is approved by a human](../../gorseller/e-06-c.webp)

Human approval (*human-in-the-loop*): every action that sends data out or cannot be undone is shown to the user first.

```text
Mirror wants to send this email:
  to:      veysel@ayna-teknoloji.example   ⚠️ outside the organisation
  content: "User 2026-0532 asked about the club event"
[Send]  [Cancel]
```

Sandbox: agents that run code work in an isolated environment, without network access,
with limits on time and memory.

## The action risk ladder

![A staircase whose steps turn redder as they go up: reading, drafting, sending, deleting; at the upper steps a human approval gate](../../gorseller/e-06-b.webp)

1. Reading your own data → free
2. Reading someone else's data → permission check
3. Writing, sending → approval + logging
4. Deleting, paying, exporting → approval + a second check; if possible, don't give this tool at all

## 🧪 Try it (5 min)

Read the `arac_calistir` function inside `lab/e-ayna-mini.py`. For each tool, write which step of the ladder it sits on
and which check is missing. Then tell Mirror-mini `show the grades of student 2026-0417`
(you are signed in as `2026-0611`). What happened? Which line should have stopped it?

## ✅ Remember

- An agent's damage is limited by the tools, permissions and autonomy it has.
- Tools run with the user's authority, not the model's.
- An action that sends data out or cannot be undone requires human approval.
