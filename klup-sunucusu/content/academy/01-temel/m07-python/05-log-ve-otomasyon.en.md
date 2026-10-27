---
id: m07-05
baslik: A program that reads logs and does the work for you
hedefler:
  - Summarise a log file with Python
  - Write a simple Bash automation
---

# A program that reads logs and does the work for you

> Logs are a system's diary. But nobody reads a 100,000-line diary —
> they read its **summary**. You're going to produce that summary.

::cizgi[m07-05-sahne]

## Recognise a log line

```text
Mar  3 15:31:02 kulup-srv sshd[40101]: Failed password for deploy from 203.0.113.66 port 50003 ssh2
└──── time ────┘ └ server ┘ └daemon┘   └──────────── event ────────────┘    └── source IP ─┘
```

## Failed logins per IP

```python
import re
from collections import Counter

sayac = Counter()
with open("/opt/akademi/auth.log", encoding="utf-8") as f:
    for satir in f:
        if "Failed password" in satir:
            m = re.search(r"from (\S+)", satir)
            if m:
                sayac[m.group(1)] += 1

for ip, n in sayac.most_common(5):
    print(f"{ip:16} {n}")
```

`Counter` is a dictionary, but specialised for counting; `most_common()` gives you the most frequent ones.

## The same thing in Bash (one line)

```bash
grep "Failed password" /opt/akademi/auth.log | grep -oE "from [0-9.]+" | sort | uniq -c | sort -nr | head -5
```

Bash for short jobs, Python once the logic grows.

## Automate it

![A wall clock rings at the same time every morning and a small robot reads the logbooks and prepares a report](../../gorseller/m07-05-b.webp)

To produce the report by itself every morning, Linux uses `cron`:

```bash
crontab -e
# run every day at 07:00, write the output to a file
0 7 * * * /usr/bin/python3 /home/ayse/log_ozet.py >> /home/ayse/rapor.txt 2>&1
```

## 🧪 Try it (5 min)

Run the Python program above on the lab VM. Which IP made the most failed attempts?
Did you get the same result with the Bash line?

## ✅ Remember

- A log line: time, source, event — recognise its structure first.
- `Counter.most_common()` answers the question "who is the most frequent?".
- Bash for a short job, Python for a growing one; cron for a regular one.
