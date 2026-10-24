import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle2, Clock, Target } from "lucide-react";
import { requirePageSession } from "@/server/auth/page-guard";
import { HttpError } from "@/server/errors";
import { openLesson } from "@/server/academy/service";
import { availableImages } from "@/server/academy/images";
import { Markdown } from "@/components/academy/Markdown";
import { CompleteButton, MissionLock, QuizForm } from "@/components/academy/LessonActions";
import { LabThemeToggle } from "@/components/academy/LabThemeToggle";
import { KIND_BADGE, KIND_LABEL } from "@/components/academy/labels";

export const metadata: Metadata = { title: "Ders" };

export default async function LessonPage({ params }: { params: Promise<{ slug: string }> }) {
  const { user } = await requirePageSession();
  const slug = (await params).slug;
  if (!/^[a-z0-9-]{1,40}$/.test(slug)) notFound();
  const l = await openLesson({ id: user.id, role: user.role, status: user.status }, slug).catch((e) => {
    if (e instanceof HttpError && e.status === 404) return null;
    throw e;
  });
  if (!l) notFound();
  const done = l.status === "COMPLETED";

  const hasMission = l.missions.length > 0;
  const pct = l.count ? Math.round((l.trackDone / l.count) * 100) : 0;

  return (
    <article className="lesson lab-room fade-up">
      <div className="lab-top">
        <nav className="lab-crumbs" aria-label="Konum">
          <Link href="/academy">Akademi</Link>
          <span aria-hidden>›</span>
          <Link href={`/academy/${l.track.key}`}>{l.track.code}</Link>
          <span aria-hidden>›</span>
          <span aria-current="page">Ders {l.index + 1}</span>
        </nav>
        <LabThemeToggle />
      </div>

      <header className="lab-head">
        <div className="lab-icon" aria-hidden>{l.track.code}</div>
        <div>
          <h1 className="lab-title">{l.title}</h1>
          <div className="lab-meta">
            <span className={KIND_BADGE[l.kind]}>{KIND_LABEL[l.kind]}</span>
            <span className="lab-meta-item"><Clock size={14} aria-hidden /> {l.minutes} dk</span>
            <span className="lab-meta-item">{l.track.title}</span>
            {done && <span className="lab-done"><CheckCircle2 size={14} aria-hidden /> Tamamlandı</span>}
          </div>
        </div>
      </header>

      <div className={`lab-progress${pct >= 100 ? " is-full" : ""}`}>
        <div className="lab-progress-rail" role="progressbar" aria-label={`${l.track.code} ilerlemesi`} aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}>
          <div className="lab-progress-fill" style={{ width: `${pct}%` }} />
        </div>
        <span className="lab-progress-label">{l.trackDone}/{l.count} ders · %{pct}</span>
      </div>

      {l.goals.length > 0 && (
        <section className={`lab-goals${done ? " is-done" : ""}`} aria-label="Bu sayfada">
          <div className="lab-goals-title"><Target size={14} aria-hidden /> Bu sayfada</div>
          <ul>{l.goals.map((g, i) => <li key={i}>{g}</li>)}</ul>
        </section>
      )}

      <div className="lab-prose">
        <Markdown
          source={l.body}
          images={availableImages()}
          revealEnding={done}
          missions={hasMission ? { slug: l.slug, items: l.missions, next: l.next ? { href: `/academy/lesson/${l.next.slug}`, title: l.next.title } : null, trackHref: `/academy/${l.track.key}` } : undefined}
        />
      </div>

      <section className="lesson-actions" aria-label="Ders sonu">
        {l.kind === "QUIZ" && l.questions ? (
          <QuizForm
            slug={l.slug}
            questions={l.questions}
            passPercent={l.passPercent ?? 70}
            note={l.lastAttempt ? `Son denemen: %${l.lastAttempt.score} · ${l.lastAttempt.passed ? "geçti" : "geçmedi"} · geçme notu %${l.passPercent}` : undefined}
          />
        ) : hasMission ? (
          <MissionLock done={done} left={l.missions.filter((m) => !m.solved).length} target={(l.missions.find((m) => !m.solved) ?? l.missions[0]!).id} />
        ) : (
          <CompleteButton slug={l.slug} done={done} />
        )}
      </section>

      <nav className="lesson-nav" aria-label="Dersler arası">
        {l.prev ? (
          <Link className="btn" href={`/academy/lesson/${l.prev.slug}`}><ArrowLeft size={16} aria-hidden /> <span className="lesson-nav-t">{l.prev.title}</span></Link>
        ) : <span />}
        {l.next ? (
          <Link className="btn" href={`/academy/lesson/${l.next.slug}`}><span className="lesson-nav-t">{l.next.title}</span> <ArrowRight size={16} aria-hidden /></Link>
        ) : (
          <Link className="btn" href={`/academy/${l.track.key}`}>Yola dön <ArrowRight size={16} aria-hidden /></Link>
        )}
      </nav>
    </article>
  );
}
