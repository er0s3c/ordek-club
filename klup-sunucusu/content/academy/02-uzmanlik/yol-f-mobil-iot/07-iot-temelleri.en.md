---
id: f-07
baslik: "IoT fundamentals: ESP32, MQTT and Bluetooth"
hedefler:
  - Put the parts of an IoT system in order, from sensor to cloud
  - Explain the basic security risks in MQTT and BLE communication
---

# IoT fundamentals: ESP32, MQTT and Bluetooth

> The Internet of Things (IoT): locks, cameras, sensors… They're all a small computer and they all **talk**.
> 🔧 **Circuit 7:** The locks' messages are flowing through the lab broker. You're not the only one listening.

::cizgi[f-07-sahne]

## The chain

**Sensor → microcontroller (ESP32) → gateway / broker → cloud → mobile app.**
Every link is an attack surface. The ESP32 is a cheap microcontroller that carries Wi-Fi and Bluetooth on the same chip; we use it in the club kits.

## MQTT: publish / subscribe

![A broker like a notice board in the town square: devices pin their messages to the board, subscribers read their own topics](../../gorseller/f-07-b.webp)

Devices talk not to each other but to the **broker** in the middle. Messages are published under topic names.

```bash
# lab broker only
mosquitto_sub -h mqtt.lab-kampus.test -t 'kampus/#' -v
```

| Feature | Risk |
|---|---|
| Port 1883, no TLS | Messages are plain text on the network |
| Anonymous connection | Anyone publishes, anyone listens |
| Wildcard subscription `#` | A single client sees every topic |
| `retain` flag | The last message is kept and re-sent to a newly connecting device |

Defence: 8883 + TLS, per-device identity, topic-based access control lists (ACL).
**CoAP**, meanwhile, is a lightweight REST-like protocol over UDP (5683); it's protected with DTLS.

## BLE: Bluetooth Low Energy

- A device exposes its data as GATT **services** and **characteristics**.
- "Just Works" pairing doesn't authenticate; it's open to a man-in-the-middle.
- If the characteristic that unlocks the door is writable and unprotected, any nearby phone can unlock it.
- Examine your own device with a BLE scanner app on your phone; don't connect to anyone else's device.

## 🧪 Try it (5 min)

Read the file `content/academy/lab/f-mqtt.log`:

1. Is there a client using TLS?
2. In which messages is a password or token in plain text?
3. What is client `x9` doing, and why is the door opened again at 02:04 at night?

## ✅ Remember

- IoT is a chain; the weakest link opens the whole chain.
- In MQTT, without TLS, per-device identity and a topic ACL, the broker is a notice board open to everyone.
- In BLE, an unprotected writable characteristic is a remote control.
