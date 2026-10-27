---
id: m04-06
baslik: "Practice: The Missing File"
hedefler:
  - Find a hidden file with terminal commands
  - Decode the message you find and explain the path
---

# Practice: The Missing File

> Note from the administrator of the fictional club server: *"I hid the year-end event password in a file,
> but I've forgotten where I put it. The file name contained 'etkinlik', and I changed it in the last week."*

::cizgi[m04-06-sahne]

## Your mission

![A student with a flashlight searching a dark archive shelf for a hidden dotted box](../../gorseller/m04-06-b.webp)

On the **akademi-linux** VM in the lab, using only the terminal:

1. Find the file.
2. Read its contents — the message may be encoded.
3. Decode the message.
4. Write down the commands you used and **why** you chose them, in 5 lines.

## Hints (open them in order if you get stuck)

<details><summary>Hint 1</summary>If you know the name pattern: <code>find / -iname "*etkinlik*" 2>/dev/null</code></details>
<details><summary>Hint 2</summary>If there are too many results, add the last 7 days: <code>-mtime -7</code>. Don't forget the hidden folders.</details>
<details><summary>Hint 3</summary>A mixture of letters ending in <code>=</code> is usually Base64: <code>base64 -d dosya</code></details>

## Submission

```text
Path of the file found:
Decoded message:
Commands (in order):
Why these commands?
```

<details><summary>Instructor note: Preparing the mission in the VM</summary>

```bash
# run this once as root on the akademi-linux VM
mkdir -p /srv/kulup/.arsiv/2026 /srv/kulup/eski
for i in $(seq 1 40); do echo "eski not $i" > /srv/kulup/eski/etkinlik-$i.txt; done
touch -d "60 days ago" /srv/kulup/eski/*
echo "Tebrikler! Etkinlik sifresi: ORDEK-YILSONU-2026" | base64 > /srv/kulup/.arsiv/2026/.etkinlik_final.txt
chmod 644 /srv/kulup/.arsiv/2026/.etkinlik_final.txt
```
Expected solution: <code>find / -iname "*etkinlik*" -mtime -7 2>/dev/null</code> → the hidden file → <code>base64 -d</code>.
</details>

## ✅ Remember

- Every clue you know (name, date, type) turns into a `find` filter.
- Hidden files start with a dot; search accordingly.
- Base64 is not encryption but encoding — it is decoded without a key.
