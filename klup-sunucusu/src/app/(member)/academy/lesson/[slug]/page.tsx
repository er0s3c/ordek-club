import { ActivityPanel } from "@/components/academy/ActivityPanel";
import { lessonActivities } from "@/server/academy/activities";
import { db } from "@/server/db";
import { NotesButton } from "@/components/academy/PersonalTools";
import { FocusToggle, IssueButton, LessonFeedbackForm, LessonQuestions, LessonToc, PrintButton } from "@/components/academy/LessonExtras";
import { SuccessPanel } from "@/components/academy/SuccessPanel";
import { SKILLS } from "@/server/academy/placement";
import { readingMinutes } from "@/lib/text";
import { isStaff } from "@/server/auth/policy";
import { featureEnabled } from "@/server/learning/features";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, BookOpenText, CheckCircle2, Clock, Target } from "lucide-react";
import { requirePageSession } from "@/server/auth/page-guard";
import { HttpError } from "@/server/errors";
import { openLesson } from "@/server/academy/service";
import { availableImages, labIconUrl } from "@/server/academy/images";
import { comicsFor } from "@/server/academy/comics";
import { Markdown, markdownHeadings } from "@/components/academy/Markdown";
import { CompleteButton, MissionLock, QuizForm } from "@/components/academy/LessonActions";
import { LabThemeToggle } from "@/components/academy/LabThemeToggle";
import { KIND_BADGE, KIND_LABEL } from "@/components/academy/labels";
import { getT } from "@/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  return { title: (await getT())("Ders") };
}

export default async function LessonPage({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ lang?: string }> }) {
  const t = await getT();
  const { user } = await requirePageSession();
  const slug = (await params).slug;
  if (!/^[a-z0-9-]{1,40}$/.test(slug)) notFound();
  // Ders dili site dilini izler; ?lang= ile o sayfa için diğer dil seçilebilir.
  const requestedLanguage = (await searchParams).lang;
  const lang = requestedLanguage === "tr" || requestedLanguage === "en" ? requestedLanguage : t.locale;
  const l = await openLesson({ id: user.id, role: user.role, status: user.status }, slug, lang).catch((e) => {
    if (e instanceof HttpError && e.status === 404) return null;
    throw e;
  });
  if (!l) notFound();
  const learning = await featureEnabled("learning");
  const academyV2 = await featureEnabled("academy-v2");
  const translated = l.lang === "en" || (await db.lessonTranslation.count({ where: { locale: "en", lesson: { slug } } })) > 0;
  const display = l;
  const exercises = academyV2 ? await lessonActivities(user.id, slug, l.lang) : null;
  const done = l.status === "COMPLETED";

  const hasMission = l.missions.length > 0;
  const pct = l.count ? Math.round((l.trackDone / l.count) * 100) : 0;
  const study = await featureEnabled("study");
  const headings = markdownHeadings(display.body);
  const readMin = readingMinutes(display.body, exercises?.activities.length ?? 0);
  const skillRow = done ? await db.lesson.findUnique({ where: { slug }, select: { skills: true } }) : null;
  const skillNames = (skillRow?.skills ?? []).map((k) => SKILLS.find((x) => x.key === k)?.[t.locale] ?? k);
  // Vaka labı dersleri (sk101-m2-lab gibi) kendi ikonunu taşır; yoksa yol kodu gösterilir.
  const labIcon = l.kind === "PRACTICE" ? labIconUrl(slug, availableImages()) : null;
  const nextLink = l.next ? { href: `/academy/lesson/${l.next.slug}?lang=${lang}`, title: l.next.title } : null;

  return (
    <article className="lesson lab-room fade-up" lang={l.lang}>
      <div className="lab-top">
        <nav className="lab-crumbs" aria-label={t("Konum")}>
          <Link href="/academy">{t("Akademi")}</Link>
          <span aria-hidden>›</span>
          <Link href={`/academy/${l.track.key}`}>{l.track.code}</Link>
          <span aria-hidden>›</span>
          <span aria-current="page">{t("Ders {v0}", { v0: l.index + 1 })}</span>
        </nav>
        <LabThemeToggle />
      </div>

      <header className="lab-head">
        {/* eslint-disable-next-line @next/next/no-img-element -- kendi API'mizden, optimizasyon kapalı */}
        {labIcon ? <img className="lab-icon lab-icon-img" src={labIcon} alt="" width={64} height={64} aria-hidden /> : <div className="lab-icon" aria-hidden>{l.track.code}</div>}
        <div>
          <h1 className="lab-title">{display.title}</h1>
          <div className="lab-meta">
            <span className={KIND_BADGE[l.kind]}>{t(KIND_LABEL[l.kind])}</span>
            <span className="lab-meta-item"><Clock size={14} aria-hidden />{" "}{t("{minutes} dk", { minutes: l.minutes })}</span>
            <span className="lab-meta-item">{l.track.title}</span>
            <span className="lab-meta-item read-meta" title={t("Kelime sayısı ve etkinliklere göre tahmin")}><BookOpenText size={14} aria-hidden />{" "}{t("~{readMin} dk okuma", { readMin })}</span>
            {done && <span className="lab-done"><CheckCircle2 size={14} aria-hidden />{" "}{t("Tamamlandı")}</span>}
          </div>
        </div>
      </header>

      <div className="row no-print lesson-tools">
        <FocusToggle />
        {learning && <NotesButton slug={slug} />}
        <PrintButton />
        <IssueButton slug={slug} location={`/academy/lesson/${slug}`} />
      </div>
      {/* Odak modunda yalnız ilerleme ve sonraki adım kalır */}
      <div className="focus-bar" aria-label={t("Odak modu")}>
        <span className="tiny faint">{t("{code} · {trackDone}/{count} ders", { code: l.track.code, trackDone: l.trackDone, count: l.count })}</span>
        <div className="bar" style={{ flex: 1 }}><span style={{ width: `${pct}%` }} /></div>
        {nextLink && <Link className="btn btn-sm" href={nextLink.href}>{t("Sonraki")}{" "}<ArrowRight size={14} aria-hidden /></Link>}
      </div>
      <LessonToc slug={slug} headings={headings} mobile />

      <div className={`lab-progress${pct >= 100 ? " is-full" : ""}`}>
        <div className="lab-progress-rail" role="progressbar" aria-label={t("{code} ilerlemesi", { code: l.track.code })} aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}>
          <div className="lab-progress-fill" style={{ width: `${pct}%` }} />
        </div>
        <span className="lab-progress-label">{t("{trackDone}/{count} ders · %{pct}", { trackDone: l.trackDone, count: l.count, pct })}</span>
      </div>

      {display.goals.length > 0 && (
        <section className={`lab-goals${done ? " is-done" : ""}`} aria-label={t("Bu sayfada")}>
          <div className="lab-goals-title"><Target size={14} aria-hidden />{" "}{t("Bu sayfada")}</div>
          <ul>{display.goals.map((g, i) => <li key={i}>{g}</li>)}</ul>
        </section>
      )}

      {translated ? (
        <nav className="learning-tabs" aria-label={t("Ders dili")}><Link className={`btn btn-sm ${l.lang === "tr" ? "btn-primary" : ""}`} href={`?lang=tr`} hrefLang="tr" lang="tr">Türkçe</Link><Link className={`btn btn-sm ${l.lang === "en" ? "btn-primary" : ""}`} href={`?lang=en`} hrefLang="en" lang="en">English</Link>{l.lang === "en" && !l.reviewed && <span className="small muted">{t("Bu çeviri henüz bir eğitmen tarafından incelenmedi.")}</span>}</nav>
      ) : lang === "en" ? (
        <p className="small muted" role="note">{t("Bu dersin İngilizce çevirisi henüz yayımlanmadı; Türkçe sürümü gösteriliyor.")}</p>
      ) : null}
      <div className="lesson-layout">
      <div style={{ minWidth: 0 }} className="stack">
      <div className="lab-prose">
        <Markdown
          source={display.body}
          images={availableImages()}
          comics={comicsFor(display.body, availableImages(), l.lang)}
          revealEnding={done}
          missions={hasMission ? { slug: l.slug, items: l.missions, next: l.next ? { href: `/academy/lesson/${l.next.slug}?lang=${lang}`, title: l.next.title } : null, trackHref: `/academy/${l.track.key}`, lang: l.lang } : undefined}
        />
      </div>

      {exercises && exercises.activities.length > 0 && <ActivityPanel slug={slug} hash={exercises.hash} locale={exercises.locale} activities={exercises.activities} />}
      <section className="lesson-actions" aria-label={t("Ders sonu")}>
        {l.kind === "QUIZ" && l.questions ? (
          <QuizForm
            slug={l.slug}
            questions={l.questions}
            passPercent={l.passPercent ?? 70}
            lang={l.lang}
            note={l.lastAttempt ? t("Son denemen: %{score} · {v0} · geçme notu %{passPercent}", { score: l.lastAttempt.score, v0: l.lastAttempt.passed ? t("geçti") : t("geçmedi"), passPercent: l.passPercent }) : undefined}
          />
        ) : null}
        {/* Ders sonu eylemi ve sonraki ders yan yana: öğrenci tamamladıktan sonra aynı yerden devam eder. */}
        <div className="lesson-actions-row">
          {l.kind === "QUIZ" && l.questions ? null : hasMission ? (
            <MissionLock done={done} left={l.missions.filter((m) => !m.solved).length} target={(l.missions.find((m) => !m.solved) ?? l.missions[0]!).id} />
          ) : (
            <CompleteButton slug={l.slug} done={done} />
          )}
          {l.next ? (
            <Link className="btn lesson-next" href={`/academy/lesson/${l.next.slug}?lang=${lang}`}><span className="lesson-nav-t">{l.next.title}</span> <ArrowRight size={16} aria-hidden /></Link>
          ) : (
            <Link className="btn lesson-next" href={`/academy/${l.track.key}`}>{t("Yola dön")}{" "}<ArrowRight size={16} aria-hidden /></Link>
          )}
        </div>
      </section>

      {done && <SuccessPanel eventId={`lesson:${l.slug}`} skills={skillNames} next={nextLink} trackHref={`/academy/${l.track.key}`} trackDone={l.trackDone} trackTotal={l.count} />}
      {study && <LessonFeedbackForm slug={slug} />}
      {study && <LessonQuestions slug={slug} headings={headings} staff={isStaff(user.role)} />}
      </div>
      <aside className="lesson-aside no-print">
        <LessonToc slug={slug} headings={headings} />
      </aside>
      </div>
      <nav className="lesson-nav" aria-label={t("Dersler arası")}>
        {l.prev ? (
          <Link className="btn" href={`/academy/lesson/${l.prev.slug}?lang=${lang}`}><ArrowLeft size={16} aria-hidden /> <span className="lesson-nav-t">{l.prev.title}</span></Link>
        ) : <span />}
      </nav>
    </article>
  );
}
