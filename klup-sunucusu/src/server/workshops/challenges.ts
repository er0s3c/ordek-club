// Yetkinlik gösterme görevleri: konuyu önceden bilen öğrenci uygulamalı bir değerlendirmeye doğrudan başvurur.
// Otomatik puan yalnız ön elemedir; kabul ve olası ders muafiyeti öğretmen kararıdır. Kabul edilen gösterim beceri kanıtı olur.
import { z } from "zod";
import { db } from "@/server/db";
import { badRequest, conflict, forbidden, notFound, tooMany } from "@/server/errors";
import { canManageClassroom, type Actor } from "@/server/auth/policy";
import { hit } from "@/server/rate-limit";
import { award } from "@/server/xp/engine";
import { notify } from "@/server/classroom/notifications";

type Q = { text: string; options: string[]; answer: number };
export type Challenge = { key: string; skill: string; title: string; summary: string; minutes: number; questions: Q[]; evidencePrompt: string };

export const CHALLENGES: Challenge[] = [
  { key: "net-basics", skill: "network", title: "Ağ temelleri gösterimi", summary: "Adres, port ve protokol kararlarını kanıta dayanarak ver.", minutes: 20, evidencePrompt: "Bir web isteğinin tarayıcıdan sunucuya giderken hangi adımlardan geçtiğini kendi cümlelerinle anlat (DNS, TCP, TLS, HTTP).", questions: [
    { text: "192.0.2.10:443 adresine giden trafik büyük olasılıkla hangi hizmettir?", options: ["SSH", "HTTPS", "DNS"], answer: 1 },
    { text: "Bir istemci alan adını çözemezse ilk incelenecek katman hangisidir?", options: ["DNS çözümlemesi", "TLS sertifika zinciri", "HTTP durum kodu"], answer: 0 },
    { text: "TCP el sıkışmasının doğru sırası hangisidir?", options: ["SYN → ACK → SYN-ACK", "SYN → SYN-ACK → ACK", "ACK → SYN → FIN"], answer: 1 },
    { text: "Aynı yerel ağdaki cihazın MAC adresini bulmak için hangi protokol kullanılır?", options: ["ARP", "ICMP", "NTP"], answer: 0 },
    { text: "Güvenlik duvarında yalnız 443'e izin verilen bir sunucuya 22'den bağlanma denemesi ne olur?", options: ["Bağlantı kurulur ama yavaştır", "Kural gereği engellenir", "DNS hatası verir"], answer: 1 },
  ] },
  { key: "linux-basics", skill: "linux", title: "Linux kabuğu gösterimi", summary: "İzin, süreç ve dosya kararlarını komut çıktısına göre ver.", minutes: 20, evidencePrompt: "Bir dosyanın neden okunamadığını hangi komutlarla ve hangi sırayla incelerdin? Çıktıyı nasıl yorumlardın?", questions: [
    { text: "-rw-r----- izinli dosyayı grup dışındaki kullanıcı okuyabilir mi?", options: ["Evet", "Hayır", "Yalnız çalıştırabilir"], answer: 1 },
    { text: "Çalışan süreçleri listelemek için hangisi uygundur?", options: ["ps aux", "ls -la", "chmod 755"], answer: 0 },
    { text: "chmod 640 rapor.txt sonrası sahibin izni nedir?", options: ["okuma+yazma", "okuma+çalıştırma", "yalnız okuma"], answer: 0 },
    { text: "Bir komutun çıktısını dosyaya eklemek (üzerine yazmadan) için hangisi kullanılır?", options: [">", ">>", "|"], answer: 1 },
    { text: "En az ayrıcalık ilkesine en uygun yaklaşım hangisidir?", options: ["Her işi root ile yapmak", "Gereken komutu sudo ile sınırlı çalıştırmak", "Dosyalara 777 vermek"], answer: 1 },
  ] },
  { key: "web-basics", skill: "web", title: "Web güvenliği gösterimi", summary: "İstek, oturum ve yetkilendirme hatalarını ayırt et.", minutes: 25, evidencePrompt: "Kimlik doğrulama ile yetkilendirme arasındaki farkı bir IDOR örneğiyle açıkla ve düzeltme öner.", questions: [
    { text: "/api/orders/1042 yerine 1043 yazınca başka kullanıcının siparişi görünüyor. Bu hangi zafiyettir?", options: ["XSS", "IDOR", "CSRF"], answer: 1 },
    { text: "Çerezde HttpOnly bayrağı neyi engeller?", options: ["Çerezin JavaScript ile okunmasını", "Çerezin HTTPS dışında gönderilmesini", "Çerezin süresinin dolmasını"], answer: 0 },
    { text: "SQL enjeksiyonuna karşı birincil önlem hangisidir?", options: ["Girdiyi büyük harfe çevirmek", "Parametreli sorgu", "Hata mesajlarını gizlemek"], answer: 1 },
    { text: "403 durum kodu ne anlatır?", options: ["Kaynak yok", "Kimlik var ama yetki yok", "Sunucu hatası"], answer: 1 },
    { text: "Saklanan XSS'i önlemek için çıktı tarafında ne yapılır?", options: ["Bağlama uygun kaçış (encoding)", "Parolayı hash'lemek", "CORS'u kapatmak"], answer: 0 },
  ] },
  { key: "crypto-basics", skill: "crypto", title: "Kriptografi gösterimi", summary: "Hash, şifreleme ve imza kavramlarını doğru yerde kullan.", minutes: 20, evidencePrompt: "Hash ile şifreleme neden aynı şey değildir? Parola saklama örneğiyle anlat.", questions: [
    { text: "Parolaları saklamak için en uygun yöntem hangisidir?", options: ["AES ile şifrelemek", "Tuzlu, yavaş parola hash'i (argon2/bcrypt)", "Base64"], answer: 1 },
    { text: "Dijital imza hangi güvenceyi sağlar?", options: ["Gizlilik", "Bütünlük ve kaynak doğrulama", "Erişilebilirlik"], answer: 1 },
    { text: "Base64 nedir?", options: ["Şifreleme", "Kodlama", "Hash"], answer: 1 },
    { text: "TLS'te sertifika doğrulaması neyi kontrol eder?", options: ["Sunucunun iddia ettiği alan adına ait olduğunu", "Sunucunun hızını", "İstemcinin parolasını"], answer: 0 },
    { text: "Simetrik şifrelemede taraflar neyi paylaşır?", options: ["Aynı gizli anahtarı", "Yalnız açık anahtarı", "Hash değerini"], answer: 0 },
  ] },
  { key: "incident-basics", skill: "incident", title: "Olay inceleme gösterimi", summary: "Logdan zaman çizelgesi çıkar, kanıtı ve varsayımı ayır.", minutes: 25, evidencePrompt: "Şüpheli bir girişte hangi kanıtları hangi sırayla toplardın? Kanıt ile varsayımı nasıl ayırırsın?", questions: [
    { text: "Aynı IP'den 2 dakikada 300 başarısız giriş, sonra 1 başarılı giriş. En olası yorum?", options: ["Normal kullanım", "Parola deneme saldırısı ve olası ele geçirme", "DNS arızası"], answer: 1 },
    { text: "Delil kopyasının değişmediğini nasıl gösterirsin?", options: ["Dosya adını karşılaştırarak", "Özet (hash) değerlerini karşılaştırarak", "Dosya boyutuna bakarak"], answer: 1 },
    { text: "Olay müdahalesinde kapsamı belirlemeden sistemi silmek neden risklidir?", options: ["Kanıt kaybolur", "Lisans biter", "Ağ hızlanır"], answer: 0 },
    { text: "Tek başına bir IOC (ör. alan adı) her ortamda kesin ihlal kanıtı mıdır?", options: ["Evet", "Hayır, bağlamla doğrulanmalı", "Yalnız hafta sonu"], answer: 1 },
    { text: "Zaman çizelgesi kurarken farklı sistemlerin saatleri nasıl ele alınır?", options: ["Saat dilimi ve sapma normalleştirilir", "Yok sayılır", "En geç saat esas alınır"], answer: 0 },
  ] },
  { key: "ethics-basics", skill: "ethics", title: "Etik ve kapsam gösterimi", summary: "İzinli test sınırlarını gerçek durumlarda uygula.", minutes: 15, evidencePrompt: "Kapsam dışı bir sistemde açık bulduğunu düşün. Ne yaparsın, ne yapmazsın? Neden?", questions: [
    { text: "Kapsam yalnız lab.example ise komşu IP'ler taranabilir mi?", options: ["Evet, aynı ağdaysa", "Hayır, yazılı izin yoksa", "Gece taranabilir"], answer: 1 },
    { text: "Test sırasında gerçek kişisel veriye rastlarsan ilk adım?", options: ["İndirip saklamak", "Durup kapsam sahibine bildirmek", "Paylaşmak"], answer: 1 },
    { text: "Sorumlu bildirim (responsible disclosure) neyi amaçlar?", options: ["Açığı önce kamuya duyurmayı", "Sahibine düzeltme fırsatı vermeyi", "Ödül almayı garanti etmeyi"], answer: 1 },
    { text: "Bir arkadaşının hesabına onun izni olmadan 'test için' girmek?", options: ["Kabul edilebilir", "İzinsiz erişimdir", "Kulüp içinde serbesttir"], answer: 1 },
    { text: "Yetkili test belgesinde mutlaka ne bulunur?", options: ["Hedefler, yöntemler, zaman ve sınırlar", "Yalnız hedef IP", "Sadece sözlü onay"], answer: 0 },
  ] },
];

export function gradeChallenge(c: Challenge, answers: number[]) {
  const correct = c.questions.filter((q, i) => answers[i] === q.answer).length;
  return Math.round((correct / c.questions.length) * 100);
}

export const publicChallenges = () => CHALLENGES.map(({ questions, ...c }) => ({ ...c, questions: questions.map(({ text, options }) => ({ text, options })) }));

export const challengeSchema = z.object({ answers: z.array(z.number().int().min(0).max(5)), evidence: z.string().trim().min(80, "Açıklaman en az birkaç cümle olmalı.").max(4000) });

export async function submitChallenge(actor: Actor, key: string, input: z.output<typeof challengeSchema>) {
  const c = CHALLENGES.find((x) => x.key === key);
  if (!c) throw notFound();
  if (input.answers.length !== c.questions.length) throw badRequest("Bütün soruları yanıtla.");
  const r = hit(`challenge:${actor.id}:${key}`, 2, 7 * 86_400_000);
  if (!r.ok) throw tooMany(r.retryAfterSec);
  if (await db.challengeAttempt.findFirst({ where: { userId: actor.id, challengeKey: key, status: { in: ["SUBMITTED", "ACCEPTED"] } } })) throw conflict("Bu gösterim için bekleyen ya da kabul edilmiş başvurun var.");
  const score = gradeChallenge(c, input.answers);
  const passed = score >= 80;
  const row = await db.challengeAttempt.create({ data: { userId: actor.id, challengeKey: key, answers: input.answers, evidence: input.evidence, score, status: passed ? "SUBMITTED" : "REJECTED", note: passed ? "" : "Otomatik ön eleme: en az %80 gerekiyor. Konuyu çalışıp bir hafta içinde yeniden başvurabilirsin." } });
  return { id: row.id, score, passed };
}

export const decisionSchema = z.object({ accept: z.boolean(), exemption: z.boolean().default(false), note: z.string().trim().max(1000).default("") });

export async function decideChallenge(actor: Actor, id: string, input: z.output<typeof decisionSchema>) {
  if (!canManageClassroom(actor)) throw forbidden();
  return db.$transaction(async (tx) => {
    const a = await tx.challengeAttempt.findUnique({ where: { id } });
    if (!a) throw notFound();
    if (a.status !== "SUBMITTED") throw conflict("Bu başvuru için karar verilmiş.");
    const c = CHALLENGES.find((x) => x.key === a.challengeKey)!;
    await tx.challengeAttempt.update({ where: { id }, data: { status: input.accept ? "ACCEPTED" : "REJECTED", exemption: input.accept && input.exemption, note: input.note, decidedById: actor.id, decidedAt: new Date() } });
    if (input.accept) await award(tx, { userId: a.userId, ruleKey: "challenge.accepted", key: `challenge:${a.userId}:${a.challengeKey}`, source: "TASK", reason: c.title, refType: "ChallengeAttempt", refId: id });
    await notify(tx, [a.userId], { type: "REVIEW", title: `${c.title}: ${input.accept ? "kabul edildi" : "kabul edilmedi"}`, body: input.note || (input.exemption ? "İlgili dersler için muafiyet verildi." : ""), link: "/academy/workshops#challenges" });
  });
}

export async function myChallenges(userId: string) {
  return db.challengeAttempt.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, select: { id: true, challengeKey: true, score: true, status: true, exemption: true, note: true, createdAt: true } });
}

export async function pendingChallenges() {
  const rows = await db.challengeAttempt.findMany({ where: { status: "SUBMITTED" }, orderBy: { createdAt: "asc" }, include: { user: { select: { displayName: true } } } });
  return rows.map((r) => ({ id: r.id, user: r.user.displayName, title: CHALLENGES.find((c) => c.key === r.challengeKey)?.title ?? r.challengeKey, score: r.score, evidence: r.evidence, createdAt: r.createdAt.toISOString() }));
}
