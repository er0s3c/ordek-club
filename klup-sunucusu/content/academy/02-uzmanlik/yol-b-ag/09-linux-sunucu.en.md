---
id: b-09
baslik: "Linux server security: SSH, sudo, SUID and hardening"
hedefler:
  - Make SSH and sudo configuration secure
  - Audit SUID files and unnecessary services
---

# Linux server security: SSH, sudo, SUID and hardening

> The front door may be steel. The attacker still looks for the **forgotten service hatch**.
> 🕳️ **Tunnel 9:** On the lab server, the `find` command runs with root privileges. Why?

::cizgi[b-09-sahne]

## SSH

![A key-operated lock on the server door; a second door that used to open with a password has been bricked up](../../gorseller/b-09-b.webp)

In `/etc/ssh/sshd_config`:

```text
PermitRootLogin no
PasswordAuthentication no      # key only
MaxAuthTries 3
AllowUsers deploy yonetici
```

In addition: a limit on attempts with `fail2ban`, passphrases on keys, and exposing SSH only to the management network.

## sudo

```bash
sudo -l      # what can this user run as root?
```

`ALL=(ALL) NOPASSWD: ALL` grants everything. The sneakier version: sudo permission for a **seemingly harmless** program.
Programs such as `find`, `vim`, `less` and `tar` can run commands from inside themselves → a root shell.

## SUID

A file with the SUID bit runs with the privileges of its owner (usually root).

```bash
find / -perm -4000 -type f 2>/dev/null
```

The list will contain expected entries such as `passwd` and `sudo`. An **unexpected** file (e.g. `find`, `python3`) is a serious finding.

## Hardening checklist

| Area | Check |
|---|---|
| Updates | Are automatic security updates on? |
| Services | `ss -tulpn` — is every listening service necessary? |
| Users | Are unused accounts locked, is there an account without a password? |
| Files | World-writable (`777`) directories, the SUID list |
| Logs | Is `auth.log` going to a central location? |
| Firewall | Default deny with `ufw`/`nftables` |

## 🧪 Try it (5 min)

On the lab server, run `sudo -l`, `ss -tulpn` and the SUID scan.
For each one, answer the question "does this need to be here?" and suggest a fix.

## ✅ Remember

- SSH: root login off, keys only, a limit on attempts.
- Giving sudo or SUID to a harmless-looking program is giving away root.
- Every listening service and every SUID file needs a justification.
