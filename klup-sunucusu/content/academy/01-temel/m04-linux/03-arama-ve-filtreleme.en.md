---
id: m04-03
baslik: Finding a needle in a haystack — find and grep
hedefler:
  - Search for files with find
  - Filter text with grep and the pipe (|)
---

# Finding a needle in a haystack — find and grep

> A log file can be 100,000 lines long. The one line you are looking for is in there.
> Linux's superpower: **find, filter, count.**

::cizgi[m04-03-sahne]

## find — find the file

```bash
find ~ -name "*.txt"            # all .txt files in the home directory
find /tmp -type f -mmin -60     # files changed in the last 60 minutes
find / -name "*.conf" 2>/dev/null   # search while hiding error messages
```

## grep — find the line

```bash
grep "Failed" auth.log          # lines containing "Failed"
grep -i "error" app.log         # case-insensitive
grep -c "Failed" auth.log       # how many lines? (just the number)
grep -r "parola" ~/notlar       # search recursively inside the folder
```

## The pipe (|): combining commands

![Three machines connected to each other by pipes: the first sifts the hay, the second separates the needles, the third counts and lines them up](../../gorseller/m04-03-b.webp)

The output of one command becomes the input of the next:

```bash
grep "Failed password" auth.log | wc -l
#   ↑ find the failed logins       ↑ count the lines

cat erisim.log | sort | uniq -c | sort -nr | head
#   sort the lines → count the repeats → most frequent first → first 10
```

That last line is a classic of the security analyst: what is **repeated most often**?

## Other helpers

| Command | What does it do? |
|---|---|
| `head` / `tail` | The first / last lines (`tail -f` watches live) |
| `less` | Page through a large file |
| `wc -l` | Count the lines |
| `cut -d' ' -f1` | Split on the space and take the first column |

## 🧪 Try it (5 min)

In the lab VM:

```bash
grep -c "Failed password" /opt/akademi/auth.log
grep "Failed password" /opt/akademi/auth.log | tail -3
```

How many failed logins are there? At what times were the last three?

## ✅ Remember

- `find` finds the file, `grep` finds the line.
- `|` passes the output of one command to another.
- `sort | uniq -c | sort -nr` = the most frequently repeated ones.
