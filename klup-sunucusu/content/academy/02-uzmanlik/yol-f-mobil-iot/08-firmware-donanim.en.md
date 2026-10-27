---
id: f-08
baslik: "Firmware and hardware: binwalk, UART and secure updates"
hedefler:
  - Open a lab firmware image with binwalk and hunt for risk inside it
  - Explain hardware debugging interfaces and the principles of secure boot and updates
---

# Firmware and hardware: binwalk, UART and secure updates

> Firmware is the **little operating system** inside the device. Whoever opens the lid usually finds the key inside too.
> 🔧 **Circuit 8:** We have the lab camera's firmware image. Are the doors Leman left behind inside it?

::cizgi[f-08-sahne]

## Firmware with binwalk

```bash
binwalk gozcam-2.1.4.bin        # list the parts inside
binwalk -e gozcam-2.1.4.bin     # extract the file system
grep -rniE "pass|key|telnet|http://" _gozcam-2.1.4.bin.extracted/
```

What to look for: `/etc/shadow` (empty password), startup scripts (`rcS`), private keys, passwords hardcoded in the code, old component versions.

## Hardware interfaces

![Four small pins left exposed at the edge of a circuit board; a researcher connects fine probes to them](../../gorseller/f-08-b.webp)

| Interface | What is it for? | Risk |
|---|---|---|
| **UART** | Serial console (TX, RX, GND) | If left open, a passwordless root shell |
| **JTAG / SWD** | On-chip debugging | Reading memory, changing code |
| **SPI flash** | The chip the firmware lives on | The whole image is copied with a reader |
| **I2C** | Small EEPROMs, sensors | Settings and keys are read |

## Secure design

![An update parcel passes a seal check at the device's door; an unsealed parcel is sent back](../../gorseller/f-08-c.webp)

- **Secure boot:** each stage verifies the signature of the next.
- **Signed updates** over HTTPS, with rollback protection.
- UART/JTAG off in production (locked with eFuses), flash encrypted.

## ⚡ Electricity and the rules

Only the **club's lab boards**. Make the connection with the device switched off; don't mix 3.3 V with 5 V, and common the GNDs.
Wear an antistatic wrist strap, leave the soldering iron in its stand. No touching building systems, vehicles or medical devices.

## If you find a flaw in a real product

If you find a real flaw in your own device, don't share it — tell your **instructor** first. Together you make a responsible disclosure
to the manufacturer; details aren't published until a fix is released.

## 🧪 Try it (5 min)

Examine the file `content/academy/lab/f-firmware-listesi.txt`. Find at least **five** problems: from the password, service, update,
key and version fields. For each one, write your recommendation for secure boot / signed updates / hardening.

## ✅ Remember

- A firmware image is a file system; secrets are sought there too.
- An open UART/JTAG is the device's backdoor; it's closed in production.
- If the update isn't signed, whoever updates it owns the device.
