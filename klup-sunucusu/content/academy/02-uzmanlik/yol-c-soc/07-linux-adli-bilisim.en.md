---
id: c-07
baslik: "Linux forensics: auth.log, journald, auditd and persistence"
hedefler:
  - Examine logon and privilege logs on Linux
  - Check the common persistence locations
---

# Linux forensics: auth.log, journald, auditd and persistence

> Linux servers are quiet, but they don't forget. Whoever opens the right file sees who got in and **when**.
> 🧹 **Trace 7:** On the club server, the `deploy` account signed in with a password one day. Yet that account always uses a key.

::cizgi[c-07-sahne]

## Where do you look?

| Source | What does it tell you? |
|---|---|
| `/var/log/auth.log` (Debian/Ubuntu) | SSH logons, `sudo` usage |
| `journalctl` (journald) | The binary log of services and the system |
| `last`, `lastb` | Successful and failed logon history |
| auditd (`/var/log/audit/audit.log`) | File access and command execution, according to rules |
| `~/.bash_history` | Command history; easy to delete, not trustworthy on its own |

```bash
grep "Accepted password" /var/log/auth.log
journalctl -u ssh --since "2026-03-03 15:00" --until "2026-03-03 16:00"
sudo ausearch -k kulup-izle -i
```

When you investigate on a live server, first take a **copy** of the logs and hash it; do the analysis on the copy.
Note your commands and the time: everything you do also leaves a trace.

## Persistence locations

![Four hidden corners of a house: a spare key hung by the door, a recurring appointment added to the calendar, a music box that plays at startup, and a stranger's name added to the guest book](../../gorseller/c-07-b.webp)

The attacker wants to come back. The checklist:

- `~/.ssh/authorized_keys` — is there a key you don't recognise?
- `crontab -l`, `/etc/cron.*` — a new scheduled job?
- `systemctl list-unit-files --state=enabled` — a service you don't recognise?
- `/etc/passwd` — a second account with UID 0?

## The trace of a deleted log

An attacker can truncate `auth.log` or run `history -c`. What does the defender see?

- A **gap in time** in the log file, or an unexpected shrinking
- A **mismatch** between the journald records and `auth.log`
- An attempt to write to the log file, if there is an auditd rule
- The **copy** sent to the central SIEM over syslog

## 🧪 Try it (5 min)

With the synthetic log:

```bash
grep -c "Failed password" /opt/akademi/auth.log
grep "Failed password" /opt/akademi/auth.log | grep -oE "from [0-9.]+" | sort | uniq -c | sort -rn | head -3
grep "Accepted password" /opt/akademi/auth.log
```

Which IP made the most attempts? Is the successful password logon from the same IP? Do you also see this IP in the Windows records (`c-windows-olaylar.jsonl`)?

## ✅ Remember

- auth.log, journald and auditd corroborate each other; if one is deleted, another speaks up.
- For persistence, look at keys, cron, services and UID 0 accounts.
- A log gap and a mismatch are the deletion attempt itself.
