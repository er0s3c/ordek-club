---
id: a-07
baslik: "File handling: uploads, path traversal, LFI/RFI"
hedefler:
  - List the reasons file upload flaws happen
  - Explain path traversal and file inclusion (LFI/RFI) flaws
---

# File handling: uploads, path traversal, LFI/RFI

> The "upload your profile photo" button is permission to **leave a file** on the server. And if that file isn't a photo?
> 🗂️ **Drawer 7:** A package called "ödev.pdf" has arrived on the portal's document upload page.

::cizgi[a-07-sahne]

## File upload

| Mistake | Why is it dangerous? |
|---|---|
| Trusting the extension or the `Content-Type` | The client sets both |
| Storing the file in the web root under its original name | The server **can run** it |
| No size or count limit | The disk fills, the service stops |
| Publishing image/PDF content without processing it | Embedded script, metadata leak |

## Path traversal

![Staircases in an archive maze following the arrow signs up one floor, and from there to the locked manager's office](../../gorseller/a-07-b.webp)

If `../` isn't cleaned when a file name is added to a path, the user climbs **up** out of the folder:

```http
GET /dosya?ad=../../../../etc/passwd
```

## LFI / RFI

If the application **includes the file named in the parameter into the code** (`include`):

- **LFI:** another file on the server is read or run.
- **RFI:** a remote file is fetched and run (rare today, but still around).

## Defence

- An **allow list** for the extension + check the file's real content.
- Give the file a **random name**, store it **outside** the web root, serve it from a separate domain.
- After joining the path, **normalise** it and verify it stays inside the allowed folder.
- Never put user input into `include`/`require`.

## 🧪 Try it (5 min)

Open the `http://127.0.0.1:3000/ftp` page on your local Juice Shop. Which files are listed?
Try downloading a `.md` file, then a file with a different extension. By what rule does the server decide?

## ✅ Remember

- The extension and MIME type come from the client; neither can be trusted on its own.
- Uploaded files are stored under a random name, outside the web root.
- After joining a path, normalise it and verify it hasn't left the folder.
