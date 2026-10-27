---
id: m04-01
baslik: Why is everyone talking about the Linux terminal?
hedefler:
  - Explain Linux's place in cyber security
  - Tell the terminal, the shell and a distribution apart
---

# Why is everyone talking about the Linux terminal?

> The vast majority of servers on the internet run Linux.
> Most security tools live there too. **Know the terminal, know the door.**

::cizgi[m04-01-sahne]

> 🕴️ **FILE: Superuser Sadri** · *Root Father*
>
> ![Superuser Sadri — Root Father](../../gorseller/karakter-sadri.webp)
>
> **Threat:** Abusing sudo rights, chmod 777, commands run without reading them. · [Shadow Network story →](../../00-program/09-golge-ag.md)

::cizgi[sadri-acilis]

## What is Linux?

A free and open-source operating system kernel. Tools are added around it to make **distributions**:

| Distribution | What for? |
|---|---|
| **Ubuntu** | The most common for beginners and desktops |
| **Debian** | Stable servers; the foundation of Ubuntu |
| **Kali Linux** | A ready toolbox for security testing |

> Kali isn't a "hacker system", it's a **toolbox**. Not for everyday use, but for the lab.

## Terminal and shell

![A student typing commands into a typewriter-terminal; a small interpreter inside the machine takes the command and turns the gears](../../gorseller/m04-01-b.webp)

- **Terminal** — The window where you type commands.
- **Shell** — The program that understands what you type and runs it. The most common is **Bash**.

Your first commands:

```bash
whoami        # who am I?
pwd           # which folder am I in right now?
ls            # what is here?
date          # date and time
```

The `$` sign in the command output shows a normal user, while `#` shows the **root** (administrator) user.

## Why the terminal instead of a graphical interface?

- Servers often have **no** graphical interface.
- Commands can be combined and **automated**.
- Exactly what you did is recorded; it is repeatable.

## 🧪 Try it (5 min)

Open the Ubuntu VM in the lab (WSL on Windows works too). Run the four commands above.
Then note the output of `whoami` and the output of `pwd`.

## ✅ Remember

- Most servers and security tools run on Linux.
- The terminal is the window, the shell (Bash) is the interpreter.
- `$` is a normal user, `#` is root.
