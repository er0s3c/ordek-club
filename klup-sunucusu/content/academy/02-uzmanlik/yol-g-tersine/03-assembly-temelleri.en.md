---
id: g-03
baslik: "Assembly fundamentals: registers, the stack and control flow"
hedefler:
  - Explain the basic x86/x64 registers and the stack
  - Read the condition and loop in a short assembly snippet
---

# Assembly fundamentals: registers, the stack and control flow

> The source code may be gone, but the instructions the processor reads are still there. Assembly is those instructions in human-readable form.
> ⚙️ **Cog 3:** The bug's gears turn in machine language. Professor Selim smiles: "You'll answer Sabri's patience with patience."

::cizgi[g-03-sahne]

## Registers: the processor's pocket notebook

| x64 | x86 | Typical use |
|---|---|---|
| `RAX` | `EAX` | Calculation, the function's **return value** |
| `RCX` `RDX` `R8` `R9` | — | The first 4 function arguments on Windows x64 |
| `RSP` | `ESP` | The top of the stack |
| `RIP` | `EIP` | The address of the next instruction |

## The stack

![Stacked plates: the last one put on is the first taken off; a waiter adds and removes plates one by one](../../gorseller/g-03-b.webp)

The stack is like plates piled on top of each other (LIFO): `push` puts one on, `pop` takes one off.
`call` pushes the return address onto the stack and jumps to the function; `ret` takes that address and returns.

## Common instructions

```asm
mov  eax, 5        ; eax = 5
add  eax, 3        ; eax = eax + 3
cmp  eax, 8        ; compare, set the flags
jne  yanlis        ; if not equal, jump to "yanlis"
call kontrol_et    ; call the function
xor  eax, eax      ; eax = 0 (shortcut)
```

## Reading control flow

![A railway map: a train line showing program flow with switches and turns](../../gorseller/g-03-c.webp)

- `cmp` / `test` + a conditional jump (`je`, `jne`, `jg`, `jl`) = an **if**.
- A jump that goes backwards is usually a **loop**.
- In crackmes, the password check is often a single comparison and a single `jne`.

## 🧪 Try it (5 min)

Run it with pen and paper:

```asm
    mov  ecx, 0
    mov  eax, 1
dongu:
    add  eax, eax
    inc  ecx
    cmp  ecx, 4
    jl   dongu
```

How many times does the loop turn, and what is `eax` at the end? Write the three-line Python code that does the same job.

<details><summary>Answer</summary>It loops 4 times; eax = 16. Python: <code>eax = 1</code> · <code>for _ in range(4):</code> · <code>eax += eax</code></details>

## ✅ Remember

- Registers are the processor's pocket notebook; `RIP` points at the next instruction.
- `call` puts the return address on the stack, `ret` takes it and returns.
- Comparison + conditional jump = if; a backward jump = a loop.
