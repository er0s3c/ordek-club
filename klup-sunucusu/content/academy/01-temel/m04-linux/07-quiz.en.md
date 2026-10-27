---
id: m04-07
baslik: "M04 Quiz: Linux and the command line"
gecme: 70
sorular:
  - soru: In which directory are log files usually found on Linux?
    tur: coktan
    secenekler: ["/etc", "/var/log", "/home", "/bin"]
    dogru: 1
    aciklama: /var/log is the standard place for system and service logs.
  - soru: "What does the \"grep -c Failed auth.log\" command do?"
    tur: coktan
    secenekler:
      - 'Deletes the lines containing "Failed"'
      - 'Gives the number of lines containing "Failed"'
      - Copies the file under the name Failed
      - Encrypts the file
    dogru: 1
    aciklama: The -c option counts the matching lines instead of showing them.
  - soru: What can a user in the "others" group do with a file with the permissions -rw-r-----?
    tur: coktan
    secenekler: ["Read it", "Write it", "Execute it", "Do nothing at all"]
    dogru: 3
    aciklama: The last three characters (---) show that others have no permission at all.
  - soru: Which of the following is usually a security mistake?
    tur: coktan
    secenekler: ["chmod 600 anahtar.pem", "chmod u+x betik.sh", "chmod -R 777 /var/www", "chmod o-r notlar.txt"]
    dogru: 2
    aciklama: 777 gives read, write and execute permission to everyone.
  - soru: What should you do before running a "curl address | bash" command found on the internet?
    tur: coktan
    secenekler:
      - Adding sudo to the start
      - Downloading the script and reading its contents
      - Running the command twice
      - Turning off the firewall
    dogru: 1
    aciklama: Running code you haven't read can mean running a program you know nothing about as an administrator.
  - soru: A text encoded with Base64 cannot be decoded without a key.
    tur: dogru-yanlis
    dogru: false
    aciklama: Base64 is an encoding, not encryption; anyone can decode it.
---

# M04 Quiz: Linux and the command line

6 questions · pass mark 70%.

> 🔒 **CASE CLOSED: Superuser Sadri** · *when you pass the quiz with 70%*
>
> ::cizgi[sadri-kapanis]
>
> ➡️ *Next case file: **Listener Nuri** (M05)*
