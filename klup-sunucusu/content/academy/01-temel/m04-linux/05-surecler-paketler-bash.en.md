---
id: m04-05
baslik: Processes, packages and staying safe in the terminal
hedefler:
  - Examine the running processes and services
  - Install safely with the package manager
  - Recognise dangerous command patterns
---

# Processes, packages and staying safe in the terminal

> Seeing what is running on Linux, knowing what you are installing, and
> not trusting commands you copied from the internet — three basic habits.

::cizgi[m04-05-sahne]

## Processes and services

```bash
ps aux | head            # running processes
top                      # live view (quit: q)
systemctl status ssh     # the status of a service
sudo systemctl stop xyz  # stop the service
kill 1234                # terminate the process with PID 1234
```

## The package manager: safe installation

![A safe warehouse where official sealed boxes arrive, next to a shady street vendor selling unsealed boxes](../../gorseller/m04-05-b.webp)

On Linux, programs are installed **from official repositories**, as signed packages:

```bash
sudo apt update          # refresh the package list
sudo apt upgrade         # install the updates
sudo apt install htop    # install a new package
```

The package manager verifies the signature of the downloaded package. A
`.deb` or a compiled program downloaded from a random site gives no such guarantee.

## Bash: combining commands

```bash
#!/bin/bash
# yedek.sh — back up the akademi folder with a date stamp
tar -czf ~/yedek-$(date +%F).tar.gz ~/akademi
echo "Yedek tamam"
```

```bash
chmod u+x yedek.sh && ./yedek.sh
```

## 🚩 Dangerous patterns

![A student about to drop a sealed envelope from the internet straight into the mouth of a machine, when a hand stops them](../../gorseller/m04-05-c.webp)

| Pattern | Why is it dangerous? |
|---|---|
| `curl … \| bash` | Runs a script downloaded from the internet **without reading it** |
| `rm -rf /` or `rm -rf ~` | Deletes everything |
| `chmod -R 777` | Every permission for everyone |
| A long base64 command you don't understand | What it does may be hidden |

The rule: **don't run a command you haven't read.** Download it first, read it, then decide.

## 🧪 Try it (5 min)

Create the `yedek.sh` script, run it and see the backup file with `ls -l ~`.
Then find your own shell with `ps aux | grep bash`.

## ✅ Remember

- Use `ps`, `top` and `systemctl` to see what is running.
- Install programs from the official repository, with the package manager.
- Don't run a command you haven't read, especially `curl | bash`.
