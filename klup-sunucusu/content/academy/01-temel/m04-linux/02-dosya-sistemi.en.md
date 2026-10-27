---
id: m04-02
baslik: Where are files stored on Linux?
hedefler:
  - Recognise the important folders in the Linux directory structure
  - Use the basic file and directory commands
---

# Where are files stored on Linux?

> Windows has `C:`, `D:` drives. On Linux, everything starts from **a single root**: `/`

::cizgi[m04-02-sahne]

## Important addresses

![An upside-down tree with its root at the top; on its branches are rooms shaped like a house, a locked fortress, a settings gear, a diary, an open bin and a toolbox](../../gorseller/m04-02-b.webp)

| Directory | What is in it? | Why does it matter to a security professional? |
|---|---|---|
| `/home/kullanici` | The user's files | Personal data lives here |
| `/root` | The home of the root user | Only root can access it |
| `/etc` | Configuration files | The user list (`/etc/passwd`), service settings |
| `/var/log` | Logs | The first stop in an incident investigation |
| `/tmp` | Temporary files | Anyone can write here → a favourite place for attackers |
| `/bin`, `/usr/bin` | Programs | Commands such as `ls`, `cat` |

## Getting around and handling files

```bash
cd /var/log          # go to the folder
cd ~                 # go back to your home directory
ls -la               # detailed list, including hidden files
mkdir proje          # create a folder
touch notlar.txt     # create an empty file
cp notlar.txt yedek.txt
mv yedek.txt proje/
cat notlar.txt       # show the file contents
rm proje/yedek.txt   # delete it (there is no recycle bin!)
```

Files whose name starts with a **dot** are hidden (`.bashrc`, `.ssh`). `ls -a` makes them visible.

⚠️ `rm` cannot be undone. **Never** copy and run a command starting with `rm -rf` without knowing what it does.

## 🧪 Try it (5 min)

In your home directory, create a folder called `akademi`, put a file called `hafta4.txt` inside it, and write something in the file:

```bash
echo "Linux haftası başladı" > ~/akademi/hafta4.txt
```

Then list the hidden files with `ls -la ~`. How many are there?

## ✅ Remember

- Everything starts from the `/` root.
- `/etc` holds settings, `/var/log` logs, `/tmp` is where anyone can write.
- `rm` cannot be undone; hidden files start with a dot.
