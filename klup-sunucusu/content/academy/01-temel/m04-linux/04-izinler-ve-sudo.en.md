---
id: m04-04
baslik: "rwxr-x---: reading Linux permissions"
hedefler:
  - Read the owner, group and others permissions
  - Use chmod and sudo safely
---

# rwxr-x---: reading Linux permissions

> Those strange letters at the start of the `ls -l` output tell you **who can do what** with the file.

::cizgi[m04-04-sahne]

## Learn to read it

![A cabinet with three doors: separate doors for the owner, the group and others; on each door, eye, pencil and run-lever symbols are open or locked](../../gorseller/m04-04-b.webp)

```text
-rwxr-x---  1 ayse  ogrenciler  2048  Mar 3  rapor.sh
 └┬┘└┬┘└┬┘     └┬─┘  └───┬────┘
  │  │  │      owner     group
  │  │  └── others:    --- (nothing)
  │  └───── group:     r-x (read, execute)
  └──────── owner:     rwx (read, write, execute)
```

| Letter | On a file | On a folder |
|---|---|---|
| `r` read | Read the contents | List |
| `w` write | Modify | Add/delete files |
| `x` execute | Run as a program | Enter it |

## Change it with chmod

```bash
chmod u+x betik.sh      # give the owner execute permission
chmod o-r gizli.txt     # remove read permission from others
chmod 600 anahtar.pem   # only the owner can read/write (r=4, w=2, x=1 → 6=rw)
```

🚩 **`chmod 777`** = anyone can do anything. "It didn't work, so I set 777" is a security flaw.

## sudo: a temporary administrator

![A glowing royal crown handed to a student for a short time; beside them an hourglass running fast](../../gorseller/m04-04-c.webp)

```bash
sudo apt update     # run this single command with root privileges
```

- It asks for your password and **keeps a record** (`/var/log/auth.log`).
- Any account with `sudo` rights is, in practice, an administrator account; it is given out carefully.
- If a command you copied from the internet starts with `sudo`, read it **twice**.

## 🧪 Try it (5 min)

```bash
touch deneme.txt
ls -l deneme.txt
chmod 600 deneme.txt
ls -l deneme.txt
```

How did the permissions change? For which files is this setting the right one?

## ✅ Remember

- Three groups (owner, group, others) × three permissions (r, w, x).
- `chmod 777` is almost always wrong.
- `sudo` is powerful and logged; don't use it blindly.
