// Uygulama alanları kataloğu: gerçek terminal labı ve tarayıcı içi atölyeler.
// Arama, beceri kanıtları ve yol sayfaları bu listeyi kullanır; atölye içerikleri src/server/workshops altında.
export type LabEntry = { key: string; title: string; summary: string; href: string; kind: "terminal" | "workshop"; skills: string[]; tracks: string[]; feature: "labs" | "workshops" };

export const LAB_CATALOG: LabEntry[] = [
  { key: "linux-permissions", title: "Komut Hattı: Linux izinleri", summary: "Gerçek, yalıtılmış bir Linux kabuğunda dosya izinlerini incele ve düzelt.", href: "/academy/labs", kind: "terminal", skills: ["linux"], tracks: ["m04", "yol-b"], feature: "labs" },
  { key: "browser-linux", title: "Tarayıcıda Linux", summary: "Tarayıcında çalışan, ağa çıkamayan küçük bir Linux sanal makinesinde komutları serbestçe dene.", href: "/academy/labs/browser", kind: "workshop", skills: ["linux"], tracks: ["m04", "yol-b"], feature: "workshops" },
  { key: "secure-code", title: "Güvenli kod düzeltme atölyesi", summary: "Zafiyetli satırı bul, düzeltmeyi yaz; hazır testler davranışın korunduğunu denetler.", href: "/academy/workshops/secure-code", kind: "workshop", skills: ["web"], tracks: ["m06", "yol-a"], feature: "workshops" },
  { key: "network", title: "Görsel ağ kurma alanı", summary: "İstemci, sunucu ve güvenlik duvarını yerleştir; paketlerin hangi kurallarla geçtiğini izle.", href: "/academy/workshops/network", kind: "workshop", skills: ["network"], tracks: ["m05", "yol-b"], feature: "workshops" },
  { key: "query", title: "Sorgu geliştirme atölyesi", summary: "Sentetik loglarda sorgu yaz, sonuçları incele ve sorgunu iyileştir.", href: "/academy/workshops/query", kind: "workshop", skills: ["incident"], tracks: ["yol-c", "m10"], feature: "workshops" },
  { key: "timeline", title: "Olay zaman çizelgesi", summary: "Kanıtları zaman sırasına diz ve olayın nasıl geliştiğini açıkla.", href: "/academy/workshops/timeline", kind: "workshop", skills: ["incident"], tracks: ["yol-c"], feature: "workshops" },
  { key: "evidence-map", title: "Kanıt ilişki haritası", summary: "IP, kullanıcı, dosya ve olaylar arasında gerekçeli bağlantılar kur.", href: "/academy/workshops/evidence-map", kind: "workshop", skills: ["incident"], tracks: ["yol-c", "yol-d"], feature: "workshops" },
];
