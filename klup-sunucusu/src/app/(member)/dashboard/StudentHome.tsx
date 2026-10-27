// Öğrenci ana sayfası (bilgi sırası): 1) devam edilen ders, yanında seri + günlük hedef; 2) yaklaşan teslimler;
// 3) sakin duyurular ve kulüp hedefi. Kartların görsel ağırlığı önemlerini yansıtır.
import Link from "next/link";
import type { ClubSettings } from "@prisma/client";
import { ArrowRight, CalendarClock, ClipboardList, Flame, Megaphone, Pin, Radio, Target, Timer } from "lucide-react";
import { db } from "@/server/db";
import { listActiveSessions } from "@/server/live/service";
import { listAssignmentsForStudent } from "@/server/classroom/assignments";
import { listAnnouncements } from "@/server/classroom/announcements";
import { xpSummary } from "@/server/xp/profile";
import { streakStrip } from "@/server/learning/insights";
import { enabledFeatures } from "@/server/learning/features";
import { clubGoalProgress } from "@/server/community/goals";
import { ProgressBar } from "@/components/academy/Progress";
import { LevelBar } from "@/components/xp/LevelBar";
import { StatusPill } from "@/components/ui/states";
import { formatDate, formatDateTime } from "@/components/ui/format";
import { WeekStrip } from "@/components/learning/WeekStrip";
import { PrecheckCard } from "@/components/learning/PrecheckCard";
import { openPrechecks } from "@/server/teaching/precheck";
import { ProgressFill } from "@/components/motion/ProgressFill";
import { AnimatedList } from "@/components/motion/AnimatedList";
import { StreakMilestone } from "@/components/motion/StreakMilestone";
import { getT } from "@/i18n/server";

type User = { id: string; role: "OWNER" | "ADMIN" | "INSTRUCTOR" | "STUDENT"; status: "ACTIVE" | "PENDING" | "REJECTED" | "DISABLED"; username: string; displayName: string };

export async function StudentHome({ user, firstName, settings: s, academy, next, learning }: { user: User; firstName: string; settings: ClubSettings; academy: { total: number; completed: number }; next: { slug: string; title: string; track: { code: string }; resume: boolean } | null; learning: boolean }) {
  const t = await getT();
  const actor = { id: user.id, role: user.role, status: user.status };
  const f = await enabledFeatures(["community", "study", "teacher-plus"]);
  const prechecks = f["teacher-plus"] ? await openPrechecks(actor) : [];
  const [live, tasks, anns, xp, strip, resumeAt, goals] = await Promise.all([
    listActiveSessions(), listAssignmentsForStudent(actor), listAnnouncements(actor, 3), xpSummary(user.id, user.role), streakStrip(user.id),
    next?.resume ? db.lessonPersonal.findFirst({ where: { userId: user.id, lesson: { slug: next.slug } }, select: { lastSection: true } }) : null,
    f.community ? clubGoalProgress() : Promise.resolve([]),
  ]);
  const now = Date.now();
  const todo = tasks
    .filter((a) => a.status === "PUBLISHED" && (!a.mine || a.mine.status === "RETURNED"))
    .sort((a, b) => (a.dueAt?.getTime() ?? Infinity) - (b.dueAt?.getTime() ?? Infinity))
    .slice(0, 5);
  const goalPct = Math.min(100, Math.round((strip.doneToday / strip.dailyGoal) * 100));
  const nextHref = next ? `/academy/lesson/${next.slug}${resumeAt?.lastSection ? `#${resumeAt.lastSection}` : ""}` : "/academy";

  return (
    <div className="stack-lg fade-up">
      <header className="page-head" style={{ marginBottom: 0 }}>
        <div className="eyebrow">{s.clubName}</div>
        <h1 className="page-title">{t("Merhaba,")}{" "}<em>{firstName}</em></h1>
      </header>

      {live.length > 0 && (
        <section className="card card-featured" data-tag="Canlı" aria-labelledby="live-h">
          <div className="card-h"><h2 id="live-h"><Radio size={16} aria-hidden />{" "}{t("Şu an canlı")}</h2></div>
          <div className="card-b">
            <ul className="list-tight">
              {live.map((x) => (
                <li key={x.id}>
                  <span className="dot on" aria-hidden />
                  <span style={{ flex: 1 }}><strong>{x.title}</strong><span className="tiny faint">{" "}{t("· {v0} · {online} çevrimiçi", { v0: x.host?.displayName ?? "—", online: x.online })}</span></span>
                  <Link className="btn btn-sm btn-primary" href={`/live/${x.code}`}>{t("Derse katıl")}</Link>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      <PrecheckCard checks={prechecks.filter((c) => !c.answered)} />

      <div className="home-top">
        <section className="card card-primary home-continue" aria-labelledby="continue-h">
          <div className="card-b stack">
            <div className="eyebrow" id="continue-h">{next?.resume ? t("Kaldığın yer") : next ? t("Sıradaki ders") : t("Bütün dosyalar kapandı")}</div>
            {next ? <div className="continue-title home-continue-title">{next.title} <span className="tiny faint">· {next.track.code}</span></div> : <p className="muted">{t("Tüm dersleri bitirdin. Atölyelere ya da tekrar kartlarına göz at.")}</p>}
            <ProgressBar value={academy.completed} max={academy.total} label={t("Akademi ilerlemesi")} />
            <div className="row-between">
              <span className="tiny faint">{t("{completed}/{total} ders tamamlandı", { completed: academy.completed, total: academy.total })}</span>
              <Link className="btn btn-primary" href={nextHref}>{next?.resume ? t("Devam et") : next ? t("Başla") : t("Akademi")} <ArrowRight size={16} aria-hidden /></Link>
            </div>
          </div>
        </section>
        <section className="card home-streak" aria-labelledby="streak-h">
          <div className="card-b stack">
            <div className="row-between">
              <h2 id="streak-h" className="home-streak-h"><Flame size={18} aria-hidden />{" "}{t("{current} günlük seri", { current: strip.current })}</h2>
              <StreakMilestone count={strip.current} day={strip.days.find(d => d.today)?.day ?? ""} active={strip.doneToday > 0} />
              {strip.remainingProtection > 0 && <StatusPill tone="info">{t("Telafi hakkı var")}</StatusPill>}
            </div>
            <WeekStrip days={strip.days} interactive={learning} />
            <div>
              <div className="row-between small"><span><Target size={14} aria-hidden />{" "}{t("Günlük hedef")}</span><span>{Math.min(strip.doneToday, strip.dailyGoal)}/{strip.dailyGoal}</span></div>
              <div className="bar" role="img" aria-label={t("Günlük hedefin yüzde {goalPct}'i tamam", { goalPct })}><ProgressFill value={goalPct} /></div>
            </div>
            {learning && <Link className="small" href="/academy/workspace">{t("Öğrenme alanım →")}</Link>}
          </div>
        </section>
      </div>

      <section className="card" aria-labelledby="tasks-h">
        <div className="card-h"><h2 id="tasks-h"><ClipboardList size={16} aria-hidden />{" "}{t("Yaklaşan teslimler")}</h2><Link className="small" href="/tasks">{t("Tümü →")}</Link></div>
        <div className="card-b">
          {todo.length ? (
            <AnimatedList as="ul" className="list-tight">
              {todo.map((a) => {
                const left = a.dueAt ? a.dueAt.getTime() - now : null;
                return (
                  <li key={a.id}>
                    <span style={{ flex: 1, minWidth: 0 }}><Link href={`/tasks/${a.id}`}>{a.title}</Link>{a.mine?.status === "RETURNED" && <> <StatusPill tone="warn">{t("düzeltme istendi")}</StatusPill></>}</span>
                    {left !== null && left < 0 ? <StatusPill tone="err">{t("süresi geçti")}</StatusPill> : left !== null && left < 48 * 3600_000 ? <StatusPill tone="warn">{formatDateTime(a.dueAt, s.timezone, t.intl)}</StatusPill> : <span className="tiny faint">{a.dueAt ? formatDateTime(a.dueAt, s.timezone, t.intl) : t("süresiz")}</span>}
                  </li>
                );
              })}
            </AnimatedList>
          ) : <p className="muted" style={{ margin: 0 }}>{t("Bekleyen görevin yok.")}</p>}
        </div>
      </section>

      <div className="grid-2">
        <section className="card card-quiet" aria-labelledby="ann-h">
          <div className="card-h"><h2 id="ann-h"><Megaphone size={14} aria-hidden />{" "}{t("Duyurular")}</h2><Link className="small" href="/announcements">{t("Tümü →")}</Link></div>
          <div className="card-b">
            {anns.length ? (
              <ul className="list-tight">
                {anns.map((a) => (
                  <li key={a.id}>
                    {a.pinned && <Pin size={13} aria-label={t("sabitlenmiş")} />}
                    <span style={{ flex: 1, minWidth: 0, overflowWrap: "anywhere" }}><Link href={`/announcements#a-${a.id}`}>{a.title}</Link></span>
                    <span className="tiny faint">{formatDate(a.createdAt, s.timezone, t.intl)}</span>
                  </li>
                ))}
              </ul>
            ) : <p className="muted small" style={{ margin: 0 }}>{t("Henüz duyuru yok.")}</p>}
          </div>
        </section>
        <section className="card card-quiet" aria-labelledby="xp-h">
          <div className="card-h"><h2 id="xp-h">{t("Kalkan dosyan")}</h2><Link className="small" href={`/u/${user.username}`}>{t("Profilim →")}</Link></div>
          <div className="card-b stack-sm">
            <LevelBar level={xp.level} total={xp.total} />
            <span className="tiny faint">{t("Bu ay")}{" "}{xp.month.toLocaleString(t.intl)}{" "}{t("XP · en uzun seri {longest} gün", { longest: strip.longest })}</span>
          </div>
        </section>
      </div>

      {(goals.length > 0 || f.study) && (
        <div className="grid-2">
          {goals.map((g) => (
            <section key={g.id} className="card card-quiet" aria-label={t("Kulüp hedefi: {title}", { title: g.title })}>
              <div className="card-h"><h2><Target size={14} aria-hidden />{" "}{t("Kulüp hedefi")}</h2><span className="tiny faint">{t("{date} tarihine kadar", { date: formatDate(new Date(`${g.endsOn}T12:00:00Z`), s.timezone, t.intl) })}</span></div>
              <div className="card-b stack-sm">
                <strong>{g.title}</strong>
                <div className="bar" role="img" aria-label={t("Hedefin yüzde {pct}'i tamam", { pct: g.pct })}><span style={{ width: `${g.pct}%` }} /></div>
                <span className="tiny faint">{g.value.toLocaleString(t.intl)} / {g.target.toLocaleString(t.intl)}{" "}{t("· herkesin katkısı birlikte sayılır")}</span>
              </div>
            </section>
          ))}
          {f.study && (
            <Link className="card card-b learning-link" href="/study">
              <span><strong><Timer size={15} aria-hidden />{" "}{t("Çalışma oturumu başlat")}</strong><p className="muted small">{t("15, 25 ya da 45 dakika odaklan; sonunda kısa bir değerlendirme yap.")}</p></span><ArrowRight aria-hidden />
            </Link>
          )}
        </div>
      )}
      <p className="tiny faint no-print"><CalendarClock size={12} aria-hidden />{" "}{t("İpucu:")}{" "}<span className="kbd">Ctrl K</span>{" "}{t("ile her şeyi ara,")}{" "}<span className="kbd">?</span>{" "}{t("ile kısayolları gör.")}</p>
    </div>
  );
}
