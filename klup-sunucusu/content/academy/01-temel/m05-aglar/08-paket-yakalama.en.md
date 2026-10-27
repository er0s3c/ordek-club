---
id: m05-08
baslik: Seeing packets with Wireshark
hedefler:
  - Capture and filter traffic in Wireshark
  - List the basic principles of network security
---

# Seeing packets with Wireshark

> So far we've described packets. Now you'll **actually see them**.
> Wireshark is a microscope that records every packet passing through your network card.

::cizgi[m05-08-sahne]

## ⚠️ The rule first

Capture only the traffic of **your own** computer and **your own** network.
Listening to traffic on the campus network, in the dorm, or to someone else's traffic (eavesdropping) is against the law.

## Three panes

![Wireshark screen](../../gorseller/m05-08-a.webp)

1. **Filter box** — Cut down the noise.
2. **Packet list** — Time, source, destination, protocol, summary.
3. **Packet detail** — The envelopes of the selected packet, exactly the layers from M05-02.

## Your first filters

| Filter | Shows |
|---|---|
| `dns` | Name resolution queries |
| `tcp.flags.syn == 1 && tcp.flags.ack == 0` | New TCP connection attempts |
| `http` | Unencrypted web traffic |
| `tls.handshake` | HTTPS handshakes |
| `ip.addr == 192.168.1.1` | Conversations with a particular address |

On HTTPS traffic you **can't see** the content — you only see who you're talking to and the handshake. TLS is doing its job.

## The 5 basic principles of network security

![Five object guards standing in a row: a locked envelope, dividing doors, a single key, a watchtower's binoculars and a backup generator](../../gorseller/m05-08-c.webp)

1. **Least privilege** — Every person and every device should reach only what they need.
2. **Segmentation** — Guest, student and management networks should be separate.
3. **Encryption** — Everything travelling on the path should be encrypted.
4. **Deny by default** — Traffic that isn't explicitly permitted should be blocked.
5. **Visibility** — What isn't logged isn't noticed.

## 🧪 Try it (5 min)

Capture for 30 seconds on your own computer, open a website, stop. Find that site's query with the `dns` filter.

## ✅ Remember

- Capture only your own traffic, in a permitted environment.
- Filter → list → detail; the detail pane shows the layers.
- HTTPS hides the content; who you're talking to is still visible.
