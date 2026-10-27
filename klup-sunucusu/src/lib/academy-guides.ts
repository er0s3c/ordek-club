// Yol düzeyi rehberlik: önerilen önkoşullar ve modül sonu kaynaklar. Önkoşul bir öneridir, kilit değildir.
// Kaynaklar resmî proje/standart sayfalarıdır; içerik incelemesinde bağlantılar yeniden kontrol edilmelidir.
export const PREREQS: Record<string, string[]> = {
  m04: ["m03"], m05: ["m03"], m06: ["m05"], m07: ["m04"], m08: ["m05"], m09: ["m02"], m10: ["m05", "m06"], m11: ["m10"],
  "yol-a": ["m06"], "yol-b": ["m04", "m05"], "yol-c": ["m04", "m10"], "yol-d": ["m09"], "yol-e": ["m07"], "yol-f": ["m05", "m07"], "yol-g": ["m03", "m07"],
};

export type Resource = { title: string; url: string; note: string };
export const RESOURCES: Record<string, Resource[]> = {
  m01: [{ title: "CISA · Secure Our World", url: "https://www.cisa.gov/secure-our-world", note: "Günlük güvenlik alışkanlıkları (EN)" }],
  m02: [{ title: "KVKK resmî sitesi", url: "https://www.kvkk.gov.tr/", note: "Kişisel verilerin korunması mevzuatı ve rehberler" }],
  m03: [{ title: "Microsoft Learn · Windows güvenliği", url: "https://learn.microsoft.com/windows/security/", note: "İşletim sistemi güvenlik özellikleri (EN)" }],
  m04: [{ title: "The Linux Command Line (ücretsiz kitap)", url: "https://linuxcommand.org/tlcl.php", note: "Terminale giriş (EN)" }, { title: "Linux man sayfaları", url: "https://man7.org/linux/man-pages/", note: "Komut başvuru kaynağı" }],
  m05: [{ title: "Cloudflare Learning · Ağ temelleri", url: "https://www.cloudflare.com/learning/", note: "DNS, TCP/IP, HTTP kavramları (EN)" }],
  m06: [{ title: "OWASP Top 10", url: "https://owasp.org/www-project-top-ten/", note: "En yaygın web uygulaması riskleri" }, { title: "MDN · HTTP", url: "https://developer.mozilla.org/docs/Web/HTTP", note: "HTTP başvuru belgeleri" }],
  m07: [{ title: "Python resmî öğreticisi", url: "https://docs.python.org/3/tutorial/", note: "Dil temelleri" }],
  m08: [{ title: "NIST · Kriptografik standartlar", url: "https://csrc.nist.gov/projects/cryptographic-standards-and-guidelines", note: "Güncel algoritma ve anahtar uzunluğu önerileri (EN)" }],
  m09: [{ title: "OSINT Framework", url: "https://osintframework.com/", note: "Açık kaynak araç haritası — yalnız etik ve yasal kapsamda" }],
  m10: [{ title: "MITRE ATT&CK", url: "https://attack.mitre.org/", note: "Saldırgan teknikleri bilgi tabanı" }, { title: "CISA · StopRansomware", url: "https://www.cisa.gov/stopransomware", note: "Fidye yazılımına karşı rehber" }],
  m11: [{ title: "picoCTF kaynakları", url: "https://picoctf.org/resources", note: "Başlangıç CTF alıştırmaları (EN)" }],
  "yol-a": [{ title: "OWASP API Security Top 10", url: "https://owasp.org/API-Security/", note: "API'lere özgü riskler" }, { title: "PortSwigger Web Security Academy", url: "https://portswigger.net/web-security", note: "Ücretsiz, yasal web güvenliği labları" }],
  "yol-b": [{ title: "Nmap Network Scanning (resmî kitap)", url: "https://nmap.org/book/", note: "Yalnız izinli ağlarda kullan" }, { title: "NIST SP 800-115", url: "https://csrc.nist.gov/pubs/sp/800/115/final", note: "Güvenlik testi teknik rehberi" }],
  "yol-c": [{ title: "NIST SP 800-61 · Olay müdahalesi", url: "https://csrc.nist.gov/pubs/sp/800/61/r3/final", note: "Olay müdahalesi önerileri" }, { title: "Wazuh belgeleri", url: "https://documentation.wazuh.com/current/index.html", note: "Açık kaynak SIEM/XDR" }],
  "yol-d": [{ title: "MITRE ATT&CK", url: "https://attack.mitre.org/", note: "Tehdit avı için teknik eşleme" }, { title: "OASIS STIX/TAXII", url: "https://oasis-open.github.io/cti-documentation/", note: "Tehdit istihbaratı paylaşım biçimleri" }],
  "yol-e": [{ title: "OWASP Top 10 for LLM Applications", url: "https://genai.owasp.org/llm-top-10/", note: "Büyük dil modeli uygulama riskleri" }, { title: "MITRE ATLAS", url: "https://atlas.mitre.org/", note: "Yapay zekâ sistemlerine yönelik teknikler" }],
  "yol-f": [{ title: "OWASP Mobile Application Security", url: "https://mas.owasp.org/", note: "MASVS ve MASTG" }, { title: "OWASP IoT Project", url: "https://owasp.org/www-project-internet-of-things/", note: "IoT güvenlik riskleri" }],
  "yol-g": [{ title: "Ghidra", url: "https://ghidra-sre.org/", note: "NSA'nın açık kaynak tersine mühendislik aracı" }, { title: "YARA belgeleri", url: "https://yara.readthedocs.io/", note: "Kural yazma başvurusu" }],
};
