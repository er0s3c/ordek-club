---
id: m07-01
baslik: Why does a security person write code?
hedefler:
  - Think through algorithm logic step by step
  - Run Python and use variables and data types
---

# Why does a security person write code?

> Counting failed logins by hand in a 10,000-line log takes an hour.
> A six-line Python program does it **in a second**.

::cizgi[m07-01-sahne]

> 🕴️ **FILE: Puppeteer Orhan** · *Bot Master*
>
> ![Puppeteer Orhan — Bot Master](../../gorseller/karakter-orhan.webp)
>
> **Threat:** Botnets, malicious scripts, keys hard-coded into code, eval/command injection. · [Shadow Network story →](../../00-program/09-golge-ag.md)

::cizgi[orhan-acilis]

## An algorithm = a recipe

![Step-by-step recipe cards on a kitchen counter and a small robot chef following them in order](../../gorseller/m07-01-b.webp)

A computer doesn't guess; you tell it **step by step** what to do.

> Task: "How many failed logins are there in the log file?"
> 1. Open the file. 2. Read each line. 3. If the line contains "Failed", add 1 to the counter. 4. At the end, print the counter.

Write the steps in plain words first, then turn them into code. This habit makes everything easier.

## Your first Python

Install: [python.org](https://www.python.org/downloads/) (tick "Add to PATH" on Windows) or it's ready on the lab VM.

```bash
python3 --version
python3 merhaba.py
```

```python
# merhaba.py
isim = "Deniz"          # str  (text)
hafta = 8               # int  (integer)
ortalama = 87.5         # float (decimal)
aktif = True            # bool (true/false)

print(f"Merhaba {isim}, Akademi'de {hafta}. haftadasın!")
print(type(ortalama))
```

Inside `f"..."` you put variables into text with curly braces.

## Trying things interactively

If you just type `python3` in the terminal, an **interactive shell** opens; it tries each line instantly:

```python
>>> 2 ** 10
1024
>>> "parola" * 3
'parolaparolaparola'
>>> len("ordek-club")
10
```

To leave, `exit()`.

## 🧪 Try it (4 min)

Write a program: it should put your name, your department and your favourite course into variables and print a single sentence.

## ✅ Remember

- Write the steps in words first, then code them.
- Basic types: `str`, `int`, `float`, `bool`.
- Build text with `f"...{degisken}..."`.
