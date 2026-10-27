---
id: m09-03
baslik: What does a photo tell you? Metadata and verification
hedefler:
  - Examine image metadata (EXIF)
  - Verify a piece of information with more than one independent source
  - Recognise the signs of a fake profile
---

# What does a photo tell you?

> A photo taken with a phone can carry an invisible **byline**: date, device, even location.

::cizgi[m09-03-sahne]

## EXIF: the photo's byline

```bash
exiftool tatil.jpg | grep -Ei "date|model|gps"
```

| Field | Example |
|---|---|
| Date taken | 2026:03:02 18:41 |
| Device | Phone model |
| GPS | Latitude / longitude |

Most social media platforms **strip** EXIF from uploaded photos; but it can survive in photos sent by
email or as a file. **Delete it yourself before sharing** (Windows: Properties → Details → "Remove properties").

## The three questions of verification

![A detective examining one photo with three tools: a thread leading to the source, a comparison with a second photo, and a watch with a compass](../../gorseller/m09-03-b.webp)

1. **Who is the first source?** Who published the information first?
2. **Is there an independent second source?** Ten sites copying each other are a single source.
3. **Are time and place consistent?** Shadows, weather, signs, the date claimed…

With a **reverse image search** you can find where a photo was used before on the internet.
If a house photo described as "new" turns up in another country's listing years ago…

## Signs of a fake profile

![A profile that looks like a flawless mannequin in a shop window; behind it are cardboard supports and copy-pasted identical comments](../../gorseller/m09-03-c.webp)

- The account is very new but has thousands of followers
- The profile photo turns up under another name in a reverse search
- Posts are only campaign/offer content; there is no personal interaction
- The writing doesn't match the claimed location/identity
- The comments are identical to each other

A single sign is not proof; **several signs** together lower the level of confidence.

## 🧪 Try it (5 min)

Take a photo with your own phone, move it to your computer and look at its EXIF (exiftool or file Properties).
Is there location information? If so, do you want to turn off the camera location tag on your phone?

## ✅ Remember

- Photos can carry date, device and location; clean them before sharing.
- Verification: first source, independent second source, time/place consistency.
- One sign is not proof; signs are assessed together.
