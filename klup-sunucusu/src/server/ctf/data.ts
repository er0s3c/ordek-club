// Kulüp CTF panosu (CTFd'den esinlenen özgün görevler): hepsi çevrimdışı çözülür, gerçek hedefe trafik yoktur.
// Bayraklar yalnız SHA-256 özeti olarak tutulur; istemciye özet de gönderilmez.
export type CtfCategory = "kripto" | "adli" | "web" | "linux" | "ag";
export type CtfChallenge = {
  key: string;
  title: string;
  category: CtfCategory;
  difficulty: 1 | 2 | 3;
  initial: number;
  minimum: number;
  decay: number;
  description: string;
  artifact: string;
  hints: { text: string; cost: number }[];
  flagSha256: string;
};

export const CATEGORY_TR: Record<CtfCategory, string> = { kripto: "Kriptografi", adli: "Adli bilişim", web: "Web", linux: "Linux", ag: "Ağ" };

export const CTF: CtfChallenge[] = [
  {
    key: "sezar-notu", title: "Sezar'ın notu", category: "kripto", difficulty: 1, initial: 100, minimum: 50, decay: 20,
    description: "Kulüp panosuna iliştirilmiş bir not bulundu. Harfler kaydırılmış gibi; rakam ve işaretler yerinde duruyor. Bayrak biçimi: ordek{...}",
    artifact: "vyklr{zlghy_ohsh_vrbubfvy}",
    hints: [{ text: "Her harf alfabede aynı sayıda adım kaydırılmış. 'vyklr' → 'ordek' kaç adım?", cost: 10 }],
    flagSha256: "6e8181b94bbe21d5d6c3cb941e2b4e480e78cc7043c0314b3dc436a97ba85351",
  },
  {
    key: "katmanlar", title: "Katman katman", category: "kripto", difficulty: 1, initial: 150, minimum: 60, decay: 20,
    description: "Bir öğrenci 'şifreledim' diyerek bu metni paylaştı. Gerçekten şifrelenmiş mi, yoksa yalnız kodlanmış mı?",
    artifact: "NmY3MjY0NjU2YjdiNmI2MTc0NmQ2MTZlNWY2YjYxNzQ2ZDYxNmU1ZjYzNmY3YTY0NzU2ZDdk",
    hints: [{ text: "Sondaki karakter kümesi Base64'ü çağrıştırıyor. Çözünce çıkan metin yalnız 0-9 ve a-f içeriyor.", cost: 15 }],
    flagSha256: "2778db68ef3408d163987a4d2d161219c575a18d00b7d9ba915ebec4b931147f",
  },
  {
    key: "log-avi", title: "Gece yarısı log avı", category: "adli", difficulty: 2, initial: 200, minimum: 80, decay: 15,
    description: "Lab sunucusunun kimlik doğrulama kaydından bir kesit. Kaba kuvvet denemesinin ardından giriş başarılı olmuş. Bayrak: ordek{IP_kullanıcı} (ör. ordek{10.0.0.1_ayse}).",
    artifact: [
      "Oct 21 02:11:04 lab sshd[811]: Failed password for root from 198.51.100.23 port 51022 ssh2",
      "Oct 21 02:11:06 lab sshd[811]: Failed password for admin from 198.51.100.23 port 51024 ssh2",
      "Oct 21 02:11:09 lab sshd[815]: Accepted publickey for ayse from 10.0.0.31 port 40112 ssh2",
      "Oct 21 02:11:11 lab sshd[818]: Failed password for backup from 198.51.100.23 port 51031 ssh2",
      "Oct 21 02:11:13 lab sshd[818]: Failed password for backup from 198.51.100.23 port 51033 ssh2",
      "Oct 21 02:11:20 lab sshd[822]: Failed password for invalid user test from 203.0.113.5 port 60001 ssh2",
      "Oct 21 02:11:24 lab sshd[818]: Accepted password for backup from 198.51.100.23 port 51040 ssh2",
      "Oct 21 02:11:25 lab sshd[818]: pam_unix(sshd:session): session opened for user backup",
    ].join("\n"),
    hints: [{ text: "'Accepted' satırlarına bak; hangisi kaba kuvvet denemeleriyle aynı kaynaktan geliyor?", cost: 20 }],
    flagSha256: "f5c60d8dbd28fa5836f03b79a690eccdd67973ec00fefe4f92728ffa87e79854",
  },
  {
    key: "kaynak-yorum", title: "Kaynağa bak", category: "web", difficulty: 1, initial: 100, minimum: 50, decay: 20,
    description: "Kulübün eski etkinlik sayfasının HTML kaynağı. Sayfada görünmeyen bir şey var.",
    artifact: [
      "<!doctype html>",
      "<html lang=\"tr\">",
      "<head><title>Bahar Şenliği</title></head>",
      "<body>",
      "  <h1>Bahar Şenliği'ne hoş geldin!</h1>",
      "  <!-- TODO: canlıya almadan sil -> galf: }ritkanyak_ad_ralmuroy{kedro -->",
      "  <p>Kayıtlar cuma günü açılıyor.</p>",
      "</body>",
      "</html>",
    ].join("\n"),
    hints: [{ text: "Yorum satırındaki 'galf' kelimesini tersten oku. Bayrak da öyle.", cost: 10 }],
    flagSha256: "e9607e9e91ba63008821f3edf32f28df1390ac7749f7677dc810163a27f12cee",
  },
  {
    key: "izin-bulmacasi", title: "İzin bulmacası", category: "linux", difficulty: 2, initial: 150, minimum: 60, decay: 15,
    description: "deniz kullanıcısı yalnız 'lab' grubunun üyesi. Aşağıdaki dosyalardan hangisini YALNIZ grup izni sayesinde okuyabilir? Bayrak: ordek{dosya_adı}",
    artifact: [
      "$ id deniz",
      "uid=1004(deniz) gid=1004(deniz) groups=1004(deniz),1010(lab)",
      "$ ls -l /srv/paylasim",
      "-rw-------  1 root  root    812 Oct 20 09:12 rapor-taslak.md",
      "-rw-r-----  1 ayse  lab    1204 Oct 20 10:40 rapor.md",
      "-rw-r-----  1 mert  ops     430 Oct 20 11:02 notlar.txt",
      "-rw-r--r--  1 root  root    221 Oct 19 17:55 genel.txt",
      "-rw--w----  1 ayse  lab     318 Oct 20 12:30 gunluk.log",
    ].join("\n"),
    hints: [{ text: "İzin dizisinin ortadaki üçlüsü grubu anlatır; okuma için 'r' gerekir. 'herkes' üçlüsüyle okunabilen dosya grup sayesinde okunmuş sayılmaz.", cost: 20 }],
    flagSha256: "5f2440a04772c6c5ddbc458af6b352021e0e0c41160ead5b6562dea4975d4e7b",
  },
  {
    key: "hangi-kapi", title: "Hangi kapı çalınıyor?", category: "ag", difficulty: 2, initial: 200, minimum: 80, decay: 15,
    description: "Güvenlik duvarı özetinde dışarıdan gelen yoğun bir tarama görünüyor. Saldırgan çoğunlukla hangi porta ve hangi hizmete yükleniyor? Bayrak: ordek{port_hizmet} (hizmet adı küçük harf kısaltma, ör. ordek{22_ssh}).",
    artifact: [
      "zaman     kaynak           hedef        port  bayrak  sonuç",
      "02:40:01  203.0.113.90     10.0.1.15    22    SYN     DROP",
      "02:40:01  203.0.113.90     10.0.1.15    3389  SYN     DROP",
      "02:40:02  203.0.113.90     10.0.1.16    3389  SYN     DROP",
      "02:40:02  203.0.113.90     10.0.1.17    3389  SYN     DROP",
      "02:40:03  10.0.0.31        10.0.1.15    443   SYN     ACCEPT",
      "02:40:03  203.0.113.90     10.0.1.18    3389  SYN     DROP",
      "02:40:04  203.0.113.90     10.0.1.19    3389  SYN     DROP",
      "02:40:04  203.0.113.90     10.0.1.15    80    SYN     DROP",
      "02:40:05  203.0.113.90     10.0.1.20    3389  SYN     DROP",
    ].join("\n"),
    hints: [{ text: "En sık hedeflenen portu say. O port Windows'ta uzak masaüstü için kullanılır.", cost: 20 }],
    flagSha256: "8b21e8aac43ceb52e8be5f94805dd28f19b506c0ae7aa5d15055a57d5b668b75",
  },
  {
    key: "tek-bayt", title: "Tek baytlık sır", category: "kripto", difficulty: 3, initial: 300, minimum: 100, decay: 12,
    description: "Bir uygulama 'gizli' alanları tek baytlık bir anahtarla XOR'layarak saklıyor. Aşağıdaki onaltılık dizi bir bayrak. Anahtarı bul. (İpucu satın almadan önce: bayrağın 'ordek{' ile başladığını biliyorsun.)",
    artifact: "45584e4f41515e4f4175484b535e7552455875504b53434c57",
    hints: [{ text: "Bilinen düz metin saldırısı: ilk bayt 0x45, 'o' harfi 0x6f. 0x45 XOR 0x6f = ?", cost: 40 }, { text: "Anahtar 0x2a. Her baytı 0x2a ile XOR'la.", cost: 80 }],
    flagSha256: "4ee01981c4471eeb09facfc0c2f9a1aaa7e21b9ab5f32e5d048eccbc1f22da4d",
  },
  {
    key: "sozluk", title: "Sözlükten gelen parola", category: "kripto", difficulty: 3, initial: 250, minimum: 90, decay: 12,
    description: "Sızan bir yedekte tuzsuz SHA-256 parola özeti bulundu. Kullanıcının parolası aşağıdaki kısa sözlükte. Bayrak: ordek{parola}. Bu görev, tuzsuz ve hızlı hash'in neden parola saklamaya uygun olmadığını gösterir.",
    artifact: [
      "özet: 8fcb8ed83ab115349eb2600a34965be6c4ad6d83770d239529ff7335fe3ecb3d",
      "sözlük: kalkan ordek nobet sifre123 gunes marmara tilki anahtar kale fener",
      "",
      "# Tarayıcı konsolunda deneyebilirsin:",
      "# const h = async (w) => [...new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(w)))].map((b) => b.toString(16).padStart(2, '0')).join('');",
    ].join("\n"),
    hints: [{ text: "Sözlükteki her kelimenin SHA-256 özetini hesaplayıp verilen özetle karşılaştır; bir denizin adı.", cost: 40 }],
    flagSha256: "9bb9e734bde19c3bdeb75a2c80b949ce2ee7b132035abb5b66a828e3ea47da8b",
  },
];

// CTFd dinamik puanlama: çözen sayısı arttıkça değer parabolik olarak düşer, en az `minimum` kalır.
// Görevin o anki değeri bütün çözenlere uygulanır.
export function dynamicValue(c: Pick<CtfChallenge, "initial" | "minimum" | "decay">, solves: number) {
  const s = Math.max(0, solves - 1);
  const v = Math.ceil(((c.minimum - c.initial) / (c.decay * c.decay)) * s * s + c.initial);
  return Math.max(c.minimum, Math.min(c.initial, v));
}
