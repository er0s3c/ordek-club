---
id: m05-09
baslik: "Practice: What happens when you open a website?"
hedefler:
  - Observe DNS resolution and the TCP connection in traffic you generate yourself
  - Describe your observations in time order
---

# Practice: What happens when you open a website?

> Rebuild the **half second** between typing an address into the browser and the page appearing,
> packet by packet.

::cizgi[m05-09-sahne]

## Mission

On your own computer, with Wireshark:

1. Start the capture, open **`example.com`** in the browser, stop the capture.
2. **DNS:** With the `dns` filter, find the query for `example.com` and its answer. Which IP came back?
3. **TCP:** Find the first SYN packet going to that IP. Mark the three packets of the handshake:

![TCP handshake packets](../../gorseller/m05-09-a.webp)

4. **TLS:** With the `tls.handshake` filter, find the Client Hello. Can you see the name `example.com` in it (SNI)?
5. Note down the **time** of each step (the Time column).

## Submission: a timeline

![Four events arranged around a clock face: a directory question, a handshake, a locked capsule and a delivered page](../../gorseller/m05-09-c.webp)

```text
0.000 s  DNS query: example.com A ?
0.0xx s  DNS answer: ...
0.0xx s  TCP SYN → ...:443
...
```

Then answer 3 questions briefly:

1. How much time passed between the DNS answer and the TCP SYN?
2. Could you see the domain name in the TLS Client Hello? Is that a privacy problem?
3. Why couldn't you see the page's **content**?

<details><summary>Check</summary>Answer to question 3: the content is encrypted with TLS. The SNI (domain name) deliberately travels in the clear — which is why a network administrator can see which sites you visited but not what you did there.</details>

## ✅ Remember

- Opening a page: DNS → TCP handshake → TLS → HTTP.
- The time column is the key to putting events in order.
- HTTPS hides the content; the domain name visited (SNI) may be visible.
