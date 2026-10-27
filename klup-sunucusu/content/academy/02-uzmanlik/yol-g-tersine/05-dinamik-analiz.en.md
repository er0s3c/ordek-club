---
id: g-05
baslik: "Dynamic analysis: debugger, breakpoints and API monitoring"
hedefler:
  - Set a breakpoint in a debugger and step through a program
  - Recognise anti-analysis traces as findings
---

# Dynamic analysis: debugger, breakpoints and API monitoring

> Static analysis says "what could it do?"; a debugger answers "what is it doing right now?".
> ⚙️ **Cog 5:** Sabri's bug wakes up when the winding handle is turned. Professor Selim: "You can stop it at every gear, Fox."

::cizgi[g-05-sahne]

## What is a debugger?

A debugger executes a program instruction by instruction, stops it, and shows the registers and memory.
On Windows you use **x64dbg**, on Linux **gdb**.

| Key | Action |
|---|---|
| `F2` | Set / remove a breakpoint |
| `F7` | Step into — go inside the call |
| `F8` | Step over — pass over the call in one step |
| `F9` | Run to the next breakpoint |

## Types of breakpoint

![Small stopping hooks attached to the gears of a mechanical toy; the analyst inspects the parts at every stop](../../gorseller/g-05-b.webp)

- **Software breakpoint:** stop at a particular address.
- **API breakpoint:** `bp CreateFileW` — stop the moment the program wants to open a file and read the arguments.
- **Hardware / memory breakpoint:** stop when an address is read or written.

If a debugger is tedious, an API monitor or Procmon lists what the program asks Windows for.

## The analyst's eye: anti-analysis

Some samples behave themselves if they realise they're being watched. Traces to write in the report as **findings**:

- `IsDebuggerPresent`, `CheckRemoteDebuggerPresent` imports
- `Sleep` calls lasting minutes (to exhaust a sandbox's patience)
- Strings that look for virtual machine drivers or analysis tool process names

## 🧪 Try it (8 min)

Open the instructor's training crackme in x64dbg in the isolated VM:

```text
1. Find strcmp / lstrcmpA in the Symbols tab → F2
2. Run with F9, enter any password
3. When it stops, read the two strings RCX and RDX point to (Dump window)
```

Which one is your input, which one is the correct password? Then search the fictional sample's dump for anti-analysis traces:

```bash
grep -Ei "debugger|kafes|vbox|vmtools|procmon|x64dbg" /opt/akademi/g-saat-bocegi-strings.txt
```

## ✅ Remember

- A debugger stops time: breakpoint, step into, step over.
- An API breakpoint catches the program's intent at that exact moment.
- Anti-debug and long Sleep traces are findings; they go in the report.
