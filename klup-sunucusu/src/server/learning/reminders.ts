import { db } from "@/server/db";
import { getSettings } from "@/server/settings";
import { dayKey } from "@/server/xp/time";
import { featureEnabled } from "./features";
import { enqueueMail } from "@/server/mail/outbox";
import { tFor } from "@/i18n/catalog";
import { isLocale } from "@/i18n/locale";
export async function processLearningReminders(now = new Date()) {
  if (!await featureEnabled("learning")) return 0;
  const { timezone } = await getSettings();
  const day = dayKey(now, timezone);
  const time = new Intl.DateTimeFormat("en-GB", { timeZone: timezone, hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(now);
  const users = await db.learningPreference.findMany({ where: { reminderEnabled: true, reminderTime: { lte: time }, user: { status: "ACTIVE" } }, include: { user: { select: { email: true, emailNotifications: true } } } });
  let sent = 0;
  for (const p of users) {
    await db.$transaction(async tx => {
      const count = await tx.learningEvent.count({ where: { userId: p.userId, day } });
      if (count >= p.dailyGoal) return;
      const receipt = await tx.learningReminder.createMany({ data: [{ userId: p.userId, day }], skipDuplicates: true });
      if (!receipt.count) return;
      const title = "Bugünkü öğrenme hedefin seni bekliyor";
      const body = `${count}/${p.dailyGoal} etkinlik tamamlandı. Kaldığın yerden devam edebilirsin.`;
      await tx.notification.create({ data: { userId: p.userId, type: "ANNOUNCEMENT", title, body, link: "/academy/workspace" } });
      const t = tFor(isLocale(p.locale) ? p.locale : "tr");
      if (p.reminderEmail && p.user.emailNotifications) await enqueueMail(tx, [{ to: p.user.email, subject: t(title), text: t("{count}/{goal} etkinlik tamamlandı. Kaldığın yerden devam edebilirsin.", { count, goal: p.dailyGoal }) }]);
      sent++;
    });
  }
  return sent;
}
