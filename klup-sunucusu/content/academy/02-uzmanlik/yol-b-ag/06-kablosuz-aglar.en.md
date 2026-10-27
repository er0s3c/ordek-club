---
id: b-06
baslik: "Wireless networks: WPA2, WPA3 and the fake access point"
hedefler:
  - Explain the differences between WPA2-Personal, WPA2/3-Enterprise and WPA3
  - List the precautions against a fake access point (Evil Twin) attack
---

# Wireless networks: WPA2, WPA3 and the fake access point

> Your phone is ready to connect **by itself** to any Wi-Fi with a familiar name. Including the fake one broadcasting the same name.
> 🕳️ **Tunnel 6:** Two networks called "Kampus-Misafir" show up in the lab. One is yours, one is Tarık's.

::cizgi[b-06-sahne]

## Security levels

| Mode | Authentication | Weak point |
|---|---|---|
| **Open network** | None | Traffic travels unencrypted over the air (unless OWE/Enhanced Open) |
| **WPA2-Personal** | Everyone shares the same password | Offline password guessing against a captured handshake |
| **WPA3-Personal** | Same password, with SAE | Resistant to offline guessing |
| **WPA2/3-Enterprise** | Each user with their own account (802.1X) | If the server certificate isn't validated, credentials can be stolen |

## Fake access point (Evil Twin)

![Two identical-looking antennas side by side in a café; one is real, a hidden listener sits behind the other](../../gorseller/b-06-b.webp)

The attacker broadcasts the same network name (SSID) with a stronger signal. Your device connects to it;
then a fake "login page" asks for your password, or traffic passes through the attacker.

## Defence

- On a corporate network, **WPA2/3-Enterprise** and **server certificate validation** on devices are mandatory.
- On personal networks, **WPA3**, a long and unguessable password; WPS turned off.
- The guest network lives in its own VLAN, **with client isolation**, and has no route to the internal network.
- Wireless IDS reports fake access points and duplicate SSIDs.
- Users: no sensitive transactions on a network you don't recognise; turn off **automatic connection** on your phone.

## Rule

Wireless testing is done only against **your own** access point in the lab.
Connecting to someone else's network, capturing their packets or trying their password is a crime.

## 🧪 Try it (4 min)

Look at the saved Wi-Fi list on your phone. How many networks are there? Which ones does it connect to **automatically**?
If an attacker copied one of those names, what would your phone do? Delete the unnecessary ones.

## ✅ Remember

- WPA3 and Enterprise mode close the weakness of a shared password.
- Evil Twin exploits the habit of connecting automatically to a network with a familiar name.
- The guest network should be separate and isolated.
