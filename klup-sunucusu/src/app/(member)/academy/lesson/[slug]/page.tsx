import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Clock, Target } from "lucide-react";
import { requirePageSession } from "@/server/auth/page-guard";
import { HttpError } from "@/server/errors";
import { openLesson } from "@/server/academy/service";
import { availableImages } from "@/server/academy/images";
import { Markdown } from "@/components/academy/Markdown";
import { CompleteButton, QuizForm } from "@/components/academy/LessonActions";
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

  return (
    <article className="lesson fade-up">
      <nav className="row lesson-crumbs small" aria-label="Konum">
        <Link href="/academy">Akademi</Link>
        <span aria-hidden>/</span>
        <Link href={`/academy/${l.track.key}`}>{l.track.code}</Link>
      </nav>

      <header className="page-head lesson-head">
        <div className="eyebrow">{l.track.code} · {l.index + 1}/{l.count}</div>
        <h1 className="page-title">{l.title}</h1>
        <div className="row" style={{ gap: 10, flexWrap: "wrap" }}>
          <span className={KIND_BADGE[l.kind]}>{KIND_LABEL[l.kind]}</span>
          <span className="tiny faint"><Clock size={13} aria-hidden /> {l.minutes} dk</span>
          {done && <span className="stamp stamp-ok">Tamamlandı</span>}
        </div>
        {l.goals.length > 0 && (
          <div className="lesson-goals">
            <div className="eyebrow"><Target size={13} aria-hidden /> Bu sayfada</div>
            <ul>{l.goals.map((g, i) => <li key={i}>{g}</li>)}</ul>
          </div>
        )}
      </header>

      <Markdown source={l.body} images={availableImages()} revealEnding={done} />

      <section className="lesson-actions" aria-label="Ders sonu">
        {l.kind === "QUIZ" && l.questions ? (
          <>
            {l.lastAttempt && (
              <p className="small faint">Son denemen: %{l.lastAttempt.score} · {l.lastAttempt.passed ? "geçti" : "geçmedi"} · geçme notu %{l.passPercent}</p>
            )}
            <QuizForm slug={l.slug} questions={l.questions} passPercent={l.passPercent ?? 70} />
          </>
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
