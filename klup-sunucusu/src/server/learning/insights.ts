// Kişisel öğrenme içgörüleri: 7 günlük seri şeridi, gün açıklaması (neden korundu?) ve haftalık karşılaştırma.
// Yalnız kişinin kendi verisi; başkalarıyla karşılaştırma yapılmaz.
import { db } from "@/server/db";
import { getSettings } from "@/server/settings";
import { dayKey } from "@/server/xp/time";
import { learningCalendar, shiftDay, type DayState } from "./calendar";

const KIND_LABEL: Record<string, string> = { lesson: "Ders tamamlandı", quiz: "Quiz geçildi", review: "Tekrar kartı", activity: "Etkinlik çözüldü", lab: "Lab tamamlandı", daily: "Günün Kanıtı", soc: "Nöbet Masası kararı", study: "Çalışma oturumu değerlendirildi", workshop: "Atölye tamamlandı", mission: "Ders görevi çözüldü", exam: "Yol sınavı geçildi", assignment: "Görev onaylandı" };
export const kindLabel = (k: string) => KIND_LABEL[k] ?? "Öğrenme etkinliği";

async function baseCalendar(userId: string, now: Date) {
  const { timezone } = await getSettings();
  const today = dayKey(now, timezone);
  const [active, prefs, exams] = await Promise.all([
    db.activityDay.findMany({ where: { userId }, select: { day: true } }),
    db.learningPreference.findUnique({ where: { userId }, select: { protectionStart: true, dailyGoal: true } }),
    db.examProtection.findMany({ where: { memberIds: { has: userId } }, select: { startsOn: true, endsOn: true } }),
  ]);
  const cal = learningCalendar(active.map((a) => a.day), today, prefs?.protectionStart ?? today, exams);
  return { today, timezone, cal, exams, dailyGoal: prefs?.dailyGoal ?? 1 };
}

export async function streakStrip(userId: string, now = new Date()) {
  const { today, cal, dailyGoal } = await baseCalendar(userId, now);
  const states = new Map(cal.days.map((d) => [d.day, d.state]));
  const doneToday = await db.learningEvent.count({ where: { userId, day: today } });
  return {
    current: cal.current,
    longest: cal.longest,
    remainingProtection: cal.remainingProtection,
    dailyGoal,
    doneToday,
    days: Array.from({ length: 7 }, (_, i) => { const day = shiftDay(today, i - 6); return { day, state: (states.get(day) ?? (day === today ? "pending" : "missed")) as DayState, today: day === today }; }),
  };
}

// Bir günün açıklaması: yapılan çalışmalar ve serinin neden korunduğu.
export async function dayDetail(userId: string, day: string, now = new Date()) {
  const { today, cal, exams } = await baseCalendar(userId, now);
  const state: DayState = cal.days.find((d) => d.day === day)?.state ?? (day === today ? "pending" : "missed");
  const events = await db.learningEvent.findMany({ where: { userId, day }, orderBy: { createdAt: "asc" }, select: { key: true, kind: true, createdAt: true } });
  // Anahtarlar "lesson:<dersId>", "quiz:<dersId>", "activity:<dersId>:<etkinlik>" biçiminde.
  const lessonId = (key: string) => key.match(/^(?:lesson|quiz|activity|mission):([^:]+)/)?.[1];
  const ids = [...new Set(events.map((e) => lessonId(e.key)).filter(Boolean) as string[])];
  const lessons = ids.length ? await db.lesson.findMany({ where: { id: { in: ids } }, select: { id: true, title: true } }) : [];
  const titles = new Map(lessons.map((l) => [l.id, l.title]));
  const exam = exams.find((e) => day >= e.startsOn && day <= e.endsOn);
  const reason =
    state === "active" ? "Bu gün en az bir doğrulanmış çalışma yaptın; seri bu günle uzadı."
    : state === "protected" ? "Bu gün çalışma yoktu. Haftalık telafi hakkın otomatik kullanıldı; seri korundu."
    : state === "exam" ? `Sınav koruması etkindi (${exam?.startsOn} – ${exam?.endsOn}); seri korundu ve telafi hakkı harcanmadı.`
    : state === "pending" ? "Bugün henüz bitmedi. Bir ders, quiz, tekrar ya da lab tamamladığında seri devam eder."
    : "Bu gün çalışma yoktu ve telafi hakkı o hafta kullanılmıştı; seri sıfırlandı.";
  return {
    day, state, reason,
    events: events.map((e) => ({ kind: kindLabel(e.kind), title: titles.get(lessonId(e.key) ?? "") ?? "", at: e.createdAt.toISOString() })),
  };
}

// Bu hafta ile geçen haftanın karşılaştırması (pazartesi başlangıçlı değil, son 7 gün / önceki 7 gün).
export async function weekCompare(userId: string, now = new Date()) {
  const { timezone } = await getSettings();
  const today = dayKey(now, timezone);
  const from = shiftDay(today, -13), mid = shiftDay(today, -6);
  const [events, days, minutes] = await Promise.all([
    db.learningEvent.findMany({ where: { userId, day: { gte: from, lte: today } }, select: { day: true, kind: true } }),
    db.activityDay.findMany({ where: { userId, day: { gte: from, lte: today } }, select: { day: true } }),
    db.studySession.findMany({ where: { userId, status: "DONE", startedAt: { gte: new Date(`${from}T00:00:00Z`) } }, select: { minutes: true, startedAt: true } }),
  ]);
  const split = <T,>(rows: T[], day: (r: T) => string) => [rows.filter((r) => day(r) < mid).length, rows.filter((r) => day(r) >= mid).length] as const;
  const metric = (label: string, [prev, cur]: readonly [number, number]) => ({ label, prev, cur, delta: cur - prev });
  const studyDay = (r: { startedAt: Date }) => dayKey(r.startedAt, timezone);
  return [
    metric("Aktif gün", split(days, (d) => d.day)),
    metric("Tamamlanan çalışma", split(events.filter((e) => e.kind !== "review"), (e) => e.day)),
    metric("Tekrar kartı", split(events.filter((e) => e.kind === "review"), (e) => e.day)),
    metric("Çalışma dakikası", [minutes.filter((m) => studyDay(m) < mid).reduce((a, m) => a + m.minutes, 0), minutes.filter((m) => studyDay(m) >= mid).reduce((a, m) => a + m.minutes, 0)]),
  ];
}
