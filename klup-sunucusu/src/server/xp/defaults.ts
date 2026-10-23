// Oyunlaştırmanın varsayılanları. Eksik olanlar ilk kullanımda veritabanına eklenir;
// yöneticinin değiştirdiği değerlerin üzerine YAZILMAZ.
import { db } from "@/server/db";

export const DEFAULT_RULES = [
  { key: "lesson.complete", label: "Ders veya uygulama tamamlama", amount: 40 },
  { key: "info.read", label: "Bilgi sayfası okuma", amount: 10 },
  { key: "quiz.pass", label: "Quiz geçme (her quiz için bir kez)", amount: 30 },
  { key: "track.complete", label: "Öğrenme yolu tamamlama", amount: 200 },
  { key: "live.attend", label: "Canlı derse katılım (en az 10 dakika)", amount: 25 },
  { key: "task.daily", label: "Günlük görev (Faz 5)", amount: 20 },
  { key: "task.weekly", label: "Haftalık görev (Faz 5)", amount: 75 },
  { key: "task.approved", label: "Eğitmen onaylı uygulama (Faz 5)", amount: 120 },
] as const;

export type RuleKey = (typeof DEFAULT_RULES)[number]["key"];

// Artan zorlukta eşikler; unvanlar hikâyedeki "iyi taraf"tan (Kalkan) gelir.
export const DEFAULT_LEVELS = [
  { number: 1, minXp: 0, title: "Çaylak" },
  { number: 2, minXp: 150, title: "İz Sürücü" },
  { number: 3, minXp: 400, title: "Gözcü" },
  { number: 4, minXp: 800, title: "Analist" },
  { number: 5, minXp: 1400, title: "Dedektif" },
  { number: 6, minXp: 2200, title: "Kalkan Ajanı" },
  { number: 7, minXp: 3300, title: "Kıdemli Ajan" },
  { number: 8, minXp: 4700, title: "Baş Dedektif" },
  { number: 9, minXp: 6500, title: "Gölge Avcısı" },
  { number: 10, minXp: 9000, title: "Efsane Tilki" },
];

export const DEFAULT_BADGES = [
  { key: "first-lesson", name: "İlk Ders", description: "İlk dersini tamamladın.", icon: "book-open", rule: { type: "lessons", count: 1 } },
  { key: "first-quiz", name: "İlk Quiz", description: "İlk quizini geçtin.", icon: "target", rule: { type: "quizzes", count: 1 } },
  { key: "streak-7", name: "7 Günlük Seri", description: "7 gün üst üste çalıştın.", icon: "flame", rule: { type: "streak", days: 7 } },
  { key: "streak-30", name: "30 Günlük Seri", description: "30 gün üst üste çalıştın.", icon: "flame", rule: { type: "streak", days: 30 } },
  { key: "web-beginner", name: "Web Security Beginner", description: "M06 Web modülünü bitirdin.", icon: "globe", rule: { type: "track", track: "m06" } },
  { key: "network-explorer", name: "Network Explorer", description: "M05 Ağlar modülünü bitirdin.", icon: "network", rule: { type: "track", track: "m05" } },
  { key: "digital-detective", name: "Digital Detective", description: "M09 OSINT modülünü bitirdin.", icon: "search", rule: { type: "track", track: "m09" } },
  { key: "monthly-champion", name: "Monthly Champion", description: "Bir ayı liderlik tablosunun zirvesinde kapattın.", icon: "crown", rule: { type: "monthly_rank", rank: 1 } },
  { key: "top-10", name: "Top 10 Club Member", description: "Genel liderlik tablosunda ilk 10'a girdin.", icon: "trophy", rule: { type: "overall_rank", rank: 10 } },
  { key: "path-master", name: "Learning Path Master", description: "Bir uzmanlık yolunu baştan sona bitirdin.", icon: "graduation-cap", rule: { type: "track_kind", kind: "SPECIALIZATION", count: 1 } },
  { key: "season-1", name: "Gölge Ağ Çökertildi", description: "Sezon 1'in on bir dosyasını da kapattın.", icon: "shield", rule: { type: "track_kind", kind: "CORE", count: 11 } },
];

let ensured = false;

export async function ensureGamificationDefaults() {
  if (ensured) return;
  await db.xpRewardRule.createMany({ data: DEFAULT_RULES.map((r) => ({ ...r })), skipDuplicates: true });
  if ((await db.level.count()) === 0) await db.level.createMany({ data: DEFAULT_LEVELS, skipDuplicates: true });
  await db.badge.createMany({ data: DEFAULT_BADGES.map((b) => ({ ...b })), skipDuplicates: true });
  ensured = true;
}

// Testler veritabanını sıfırladığında varsayılanların yeniden eklenmesi için.
export function resetDefaultsCache() {
  ensured = false;
}
