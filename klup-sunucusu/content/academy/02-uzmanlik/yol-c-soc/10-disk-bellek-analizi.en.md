---
id: c-10
baslik: "Disk and memory analysis: Autopsy, MFT and Volatility 3"
hedefler:
  - Verify the integrity of an evidence image with a hash
  - Know where to look first in disk and memory analysis
---

# Disk and memory analysis: Autopsy, MFT and Volatility 3

> A log can be deleted, a file can be deleted. But the disk and the memory carry the **shadow** of what was deleted.
> 🧹 **Trace 10:** `bakim.exe` presents itself as having been created a year ago. The second time in the MFT says a different date.

::cizgi[c-10-sahne]

## Integrity first

You never work on the original disk. A **copy image** is taken, its hash is calculated, and the analysis is done on a copy of the copy.

```bash
sha256sum ws07-disk.E01 > ws07-disk.E01.sha256
sha256sum -c ws07-disk.E01.sha256
```

If the two hashes are the same, the image has not changed. This value is written on the chain of custody form (C11).

## Start with what is volatile

![A clue melting like ice on the table next to a clue carved in stone; the detective photographs the melting ice first](../../gorseller/c-10-c.webp)

Order of volatility for evidence collection: **memory → network connections → disk → backups.** If you power the device off, the memory is gone.
A **write blocker** is used while taking a disk image; so the examination does not write a single byte to the original disk.

## Disk: Autopsy and the MFT

**Autopsy** is the open-source forensic interface that opens a disk image: file system, deleted files, timeline, keyword search.

On NTFS, the record of every file lives in the **MFT (Master File Table)** and carries two sets of times:

| Attribute | Who can change it? |
|---|---|
| `$STANDARD_INFORMATION` | User-level tools change it easily |
| `$FILE_NAME` | The kernel manages it; changing it is much harder |

If there is a big difference between the two: the **timestamp may have been played with (timestomping)**.

![The Timeline view of the lab disk image in Autopsy](../../gorseller/c-10-b.webp)

## Memory: Volatility 3

In a memory image you can see running processes, network connections and code that was never written to disk.

```bash
vol -f ws07-bellek.raw windows.pslist
vol -f ws07-bellek.raw windows.pstree
vol -f ws07-bellek.raw windows.netscan
vol -f ws07-bellek.raw windows.cmdline
```

In `pstree` you look for a strange parent-child relationship, in `netscan` for an open connection to an external IP.

## 🧪 Try it (5 min)

With the synthetic lesson images the instructor provides: first verify integrity with `sha256sum -c`. Then, in the `windows.netscan` output,
find the name and PID of the process connected to `198.51.100.200`. Who is that process's parent in `pstree`?

## ✅ Remember

- Don't touch the original: take an image, hash it, work on the copy.
- There are two clocks in the MFT; the difference between them exposes timestamp manipulation.
- Memory shows what was never written to disk: pslist, pstree, netscan, cmdline.
