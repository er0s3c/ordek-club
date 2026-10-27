---
id: b-10
baslik: "Windows system security: services, registry, UAC"
hedefler:
  - Recognise common mistakes in Windows that lead to privilege escalation
  - Apply the basic hardening steps
---

# Windows system security: services, registry, UAC

> On Windows a lot of things run **automatically**: services, scheduled tasks, startup entries. That's where the attacker hides.
> 🕳️ **Tunnel 10:** On a lab Windows machine, the folder of a service that runs as SYSTEM on every boot is writable by everyone.

::cizgi[b-10-sahne]

## Typical mistakes

| Mistake | Why is it dangerous? |
|---|---|
| **Writable service file/folder** | The service runs as SYSTEM; whoever changes the file becomes SYSTEM |
| **Unquoted service path** | `C:\Program Files\Okul Yazilim\app.exe` can run a different file in the spaces |
| **Persistence points** | `Run` registry keys, scheduled tasks, the startup folder |
| **Everyone is an administrator** | An everyday user is a local administrator → so is every piece of malware |
| **UAC off** | Administrator actions are approved silently |

## Where do you look?

![Three hiding places in the mansion: a music box that starts by itself, the ledger cabinet and an alarm clock that rings every morning](../../gorseller/b-10-b.webp)

```powershell
Get-Service | Where-Object Status -eq Running
Get-ScheduledTask | Where-Object State -eq Ready
reg query HKLM\Software\Microsoft\Windows\CurrentVersion\Run
icacls "C:\Program Files\Okul Yazilim"
```

Sysinternals **Autoruns** shows everything that runs automatically in a single list.

## Hardening

- Users have a **standard account**; the administrator account is separate and used only when needed.
- UAC on, at least at the "default" level.
- Microsoft Defender plus attack surface reduction (ASR) rules, BitLocker.
- Updates automatic; unused services and legacy protocols (SMBv1) off.
- PowerShell and event logs (especially 4688 process creation) are collected.

## 🧪 Try it (5 min)

Run **Autoruns** on your own Windows computer (or on the lab VM).
How many startup entries do you not recognise? Investigate one of them: who is the publisher, is it signed, is it necessary?
⚠️ Don't delete any entry you're unsure about; just look.

## ✅ Remember

- Anything that runs automatically is a place to hide.
- Whoever can write to a file that runs as SYSTEM becomes SYSTEM.
- A standard account for everyday work; administrator rights only when needed.
