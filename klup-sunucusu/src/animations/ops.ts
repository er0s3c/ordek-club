import type { AnimationDef } from "./types";

export const socAlert: AnimationDef = {
  kind: "flow",
  id: "soc-alert",
  title: "SOC alarm işleme süreci",
  summary: "Bir uç nokta olayından olay müdahalesine: tespit → triyaj → müdahale.",
  actors: [
    { id: "endpoint", label: "Uç nokta", sub: "EDR ajanı", icon: "laptop", x: 80, y: 180 },
    { id: "siem", label: "SIEM", sub: "korelasyon", icon: "siem", x: 270, y: 180, tone: "infra" },
    { id: "l1", label: "Analist (L1)", sub: "triyaj", icon: "analyst", x: 460, y: 90, tone: "good" },
    { id: "l2", label: "Olay müdahale", sub: "L2/IR", icon: "shield", x: 650, y: 180, tone: "good" },
    { id: "ticket", label: "Vaka kaydı", icon: "database", x: 460, y: 290, tone: "infra" },
  ],
  steps: [
    { from: "endpoint", to: "siem", label: "powershell -enc …", tone: "attack", note: "EDR, şüpheli kodlanmış PowerShell çalıştırmasını loglar ve SIEM'e gönderir." },
    { from: "siem", to: "siem", label: "kural eşleşti: T1059.001", tone: "info", note: "SIEM olayları ilişkilendirir (aynı kullanıcı, yeni süreç, dışa bağlantı) ve önem derecesi atar." },
    { from: "siem", to: "l1", label: "alarm: YÜKSEK", tone: "request", note: "Analist alarmı alır: bağlam toplar, yanlış pozitif mi değerlendirir." },
    { from: "l1", to: "ticket", label: "vaka aç + kanıt", tone: "info", note: "Zaman çizelgesi, etkilenen varlıklar ve göstergeler (IOC) vakaya kaydedilir." },
    { from: "l1", to: "l2", label: "eskalasyon", tone: "request", note: "Gerçek pozitif → olay müdahale ekibine devredilir." },
    { from: "l2", to: "endpoint", label: "izole et", tone: "secure", note: "Kapsama: cihaz ağdan izole edilir, kimlik bilgileri sıfırlanır." },
    { from: "l2", to: "ticket", label: "kök neden + ders", tone: "secure", note: "Temizlik, kurtarma ve 'öğrenilen dersler'. Yeni tespit kuralı SIEM'e eklenir." },
  ],
};

export const passwordStorage: AnimationDef = {
  kind: "code",
  id: "secure-vs-insecure",
  title: "Güvenli ve güvensiz kod: parola saklama",
  summary: "Aynı işi yapan iki kod — biri veri sızıntısında herkesin parolasını açığa çıkarır.",
  panels: [
    {
      label: "Güvensiz",
      tone: "bad",
      lines: [
        "// kayıt",
        "const hash = md5(password);",
        "db.insert({ user, hash });",
        "// giriş",
        "if (md5(input) == row.hash) login();",
      ],
    },
    {
      label: "Güvenli",
      tone: "good",
      lines: [
        "// kayıt",
        "const salt = randomBytes(16);",
        "const hash = await scrypt(password, salt, 64);",
        "db.insert({ user, salt, hash });",
        "// giriş",
        "if (timingSafeEqual(await scrypt(input, row.salt, 64), row.hash)) login();",
      ],
    },
  ],
  steps: [
    { note: "Her iki kod da parolayı düz metin saklamıyor. Fark ayrıntılarda.", highlight: [{ panel: 0, lines: [1] }, { panel: 1, lines: [2] }] },
    { note: "MD5 hızlıdır: tek bir GPU saniyede milyarlarca tahmin dener. Tuz yok → aynı parolalar aynı hash'i üretir, hazır tablolar işe yarar.", highlight: [{ panel: 0, lines: [1, 2] }], output: { panel: 0, text: "5f4dcc3b5aa765d61d8327deb882cf99 → \"password\" (saniyeler içinde)", tone: "bad" } },
    { note: "Kullanıcıya özel rastgele tuz: aynı parola bile farklı hash üretir.", highlight: [{ panel: 1, lines: [1] }] },
    { note: "scrypt bilerek yavaş ve bellek yoğundur: tahmin maliyeti binlerce kat artar.", highlight: [{ panel: 1, lines: [2, 3] }] },
    { note: "== karşılaştırması zamanlama farkı sızdırabilir; timingSafeEqual sabit sürede karşılaştırır.", highlight: [{ panel: 0, lines: [4] }, { panel: 1, lines: [5] }], output: { panel: 1, text: "sızıntı olsa bile her parola ayrı ayrı ve çok pahalı kırılmalı", tone: "good" } },
  ],
};
