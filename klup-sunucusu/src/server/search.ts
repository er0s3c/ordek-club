// Birleşik arama: ders, terim, görev, duyuru, uygulama alanı, çizgi roman ve Gölge Ağ karakteri.
// Her kaynak kullanıcının görme yetkisiyle süzülür. Arama dile duyarlıdır: İngilizce okurken İngilizce
// başlık/gövde/balon metni taranır ve sonuç bağlantıları ?lang=en taşır. Veri küçüktür (yüzlerce ders);
// adaylar bellekte puanlanır, sonuç önbelleği 60 saniyedir.
import { db } from "@/server/db";
import { type Actor } from "@/server/auth/policy";
import { visibleAssignmentsWhere } from "@/server/classroom/access";
import { visibleAnnouncementsWhere } from "@/server/classroom/announcements";
import { featureEnabled } from "@/server/learning/features";
import { TERMS } from "@/lib/academy-terms";
import { LAB_CATALOG } from "@/lib/labs-catalog";
import { fold, matchScore } from "@/lib/text";
import { translateFor } from "@/i18n/catalog";
import { localeForUser } from "@/i18n/request";
import type { Locale } from "@/i18n/locale";
import { allStrips } from "@/server/academy/comics";
import { storyFor } from "@/server/academy/story";
import { trackText } from "@/server/academy/content-i18n";

export type SearchHit = {
  kind: "lesson" | "term" | "task" | "announcement" | "lab" | "comic" | "character";
  id: string;
  title: string;
  detail: string;
  href: string;
  score: number;
};

type LessonRow = { slug: string; title: string; goals: string[]; body: string; track: { code: string; title: string } };

// Ders araması dile göre önbelleklenir: İngilizce metin LessonTranslation'da, Türkçe metin Lesson'da.
const lessonCache = new Map<Locale, { at: number; rows: LessonRow[]; stripOwner: Map<string, string> }>();

async function lessonRows(locale: Locale) {
  const hit = lessonCache.get(locale);
  if (hit && Date.now() - hit.at < 60_000) return hit;
  const rows = await db.lesson.findMany({
    where: { archivedAt: null, track: { archivedAt: null } },
    select: {
      slug: true,
      title: true,
      goals: true,
      body: true,
      track: { select: { code: true, title: true } },
      translations: { where: { locale: "en" }, select: { title: true, goals: true, body: true } },
    },
    orderBy: [{ track: { position: "asc" } }, { position: "asc" }],
  });
  const out: LessonRow[] = rows.map((l) => {
    const en = locale === "en" ? l.translations[0] : null;
    return {
      slug: l.slug,
      title: en?.title ?? l.title,
      goals: en?.goals ?? l.goals,
      body: en?.body ?? l.body,
      track: { code: l.track.code, title: l.track.title },
    };
  });
  // Şerit kimliği → ders kimliği: ders içi paneller aramadan o derse bağlanır.
  const stripOwner = new Map<string, string>();
  for (const l of out) for (const m of l.body.matchAll(/::cizgi\[([a-z0-9-]{1,60})\]/g)) if (!stripOwner.has(m[1]!)) stripOwner.set(m[1]!, l.slug);
  const entry = { at: Date.now(), rows: out, stripOwner };
  lessonCache.set(locale, entry);
  return entry;
}

export function resetSearchCache() {
  lessonCache.clear();
}

export async function search(actor: Actor, raw: string, limit = 24, locale?: Locale): Promise<SearchHit[]> {
  const q = raw.trim().slice(0, 80);
  if (fold(q).length < 2) return [];
  const lang: Locale = locale ?? (await localeForUser(actor.id));
  const tl = (s: string) => translateFor(lang, s);
  const suffix = lang === "en" ? "?lang=en" : "";
  const hits: SearchHit[] = [];
  const [academyV2, labs, workshops] = await Promise.all([featureEnabled("academy-v2"), featureEnabled("labs"), featureEnabled("workshops")]);
  const { rows, stripOwner } = await lessonRows(lang);

  for (const l of rows) {
    const trackTitle = trackText(l.track.code, l.track.title, "", lang).title;
    const s = Math.max(matchScore(l.title, q), matchScore(l.goals.join(" "), q) * 0.6, matchScore(`${l.track.code} ${trackTitle}`, q) * 0.5);
    if (s > 0) hits.push({ kind: "lesson", id: l.slug, title: l.title, detail: `${l.track.code} · ${trackTitle}`, href: `/academy/lesson/${l.slug}${suffix}`, score: s + 5 });
  }
  // Gövdede geçen ama başlıkta geçmeyen dersler (seçili dilin metni üzerinden).
  if (q.length >= 3) {
    const needle = fold(q);
    const seen = new Set(hits.filter((h) => h.kind === "lesson").map((h) => h.id));
    let n = 0;
    for (const l of rows) {
      if (n >= 8) break;
      if (seen.has(l.slug)) continue;
      if (fold(l.body).includes(needle)) {
        hits.push({ kind: "lesson", id: l.slug, title: l.title, detail: `${l.track.code} · ${tl("metinde geçiyor")}`, href: `/academy/lesson/${l.slug}${suffix}`, score: 20 });
        n++;
      }
    }
  }
  if (academyV2)
    for (const t of TERMS) {
      const s = Math.max(matchScore(t.tr, q), matchScore(t.en, q), matchScore(t.definitionTr, q) * 0.5);
      if (s > 0) hits.push({ kind: "term", id: t.id, title: `${t.tr} · ${t.en}`, detail: lang === "en" ? t.definitionEn : t.definitionTr, href: `/academy/terms#${t.id}`, score: s });
    }
  for (const lab of LAB_CATALOG) {
    if ((lab.feature === "labs" && !labs) || (lab.feature === "workshops" && !workshops)) continue;
    const label = tl(lab.title);
    const summary = tl(lab.summary);
    const s = Math.max(matchScore(lab.title, q), matchScore(lab.summary, q) * 0.6, lang === "en" ? Math.max(matchScore(label, q), matchScore(summary, q) * 0.6) : 0);
    if (s > 0) hits.push({ kind: "lab", id: lab.key, title: label, detail: summary, href: lab.href, score: s });
  }

  // Çizgi romanlar: panel anlatıcısı ve balon metni seçili dilde taranır. Bölüm şeritleri Gölge Ağ
  // okuyucusuna, ders içi sahneler o derse bağlanır.
  for (const strip of allStrips(lang)) {
    const texts = strip.panels.flatMap((p) => [p.caption ?? "", ...p.bubbles.map((b) => b.text)]).join(" ");
    const s = Math.max(matchScore(strip.title, q), matchScore(texts, q) * 0.8);
    if (s <= 0) continue;
    const isChapter = /-(acilis|kapanis)$/.test(strip.id);
    const chapter = strip.id.replace(/-(acilis|kapanis)$/, "");
    const owner = stripOwner.get(strip.id);
    const href = isChapter ? `/academy/golge-ag/${chapter}${suffix}` : owner ? `/academy/lesson/${owner}${suffix}` : `/academy/golge-ag${suffix}`;
    const needle = fold(q);
    const panel = strip.panels.find((p) => fold(`${p.caption ?? ""} ${p.bubbles.map((b) => b.text).join(" ")}`).includes(needle));
    const detail = panel?.caption || panel?.bubbles[0]?.text || tl("Çizgi roman");
    hits.push({ kind: "comic", id: strip.id, title: strip.title, detail: detail.slice(0, 120), href, score: s + (isChapter ? 1 : 0) });
  }

  // Gölge Ağ: karakter dosyaları ve bölüm girişleri (artık iki dilde).
  for (const c of storyFor(lang)?.chapters ?? []) {
    if (c.villain) {
      const s = Math.max(matchScore(c.villain.name, q), matchScore(c.villain.threat, q) * 0.6, matchScore(c.villain.summary, q) * 0.5);
      if (s > 0) hits.push({ kind: "character", id: c.villain.id, title: c.villain.name, detail: `${c.villain.title} — ${c.villain.threat}`.slice(0, 140), href: `/academy/golge-ag/${c.key}${suffix}`, score: s + 2 });
    }
    const cs = Math.max(matchScore(c.title, q), matchScore(c.intro, q) * 0.7);
    if (cs > 0) hits.push({ kind: "comic", id: `bolum-${c.key}`, title: c.title, detail: c.intro.slice(0, 120), href: `/academy/golge-ag/${c.key}${suffix}`, score: cs });
  }

  // Aynı sayfaya giden çizgi roman sonuçlarını tekilleştir: bir bölümün açılışı, kapanışı ve girişi
  // ayrı ayrı eşleşince listede dört satır olmasın; en yüksek puanlı olan kalır.
  const seenComic = new Map<string, SearchHit>();
  for (const h of hits) {
    if (h.kind !== "comic") continue;
    const prev = seenComic.get(h.href);
    if (!prev || h.score > prev.score) seenComic.set(h.href, h);
  }
  const deduped = hits.filter((h) => h.kind !== "comic" || seenComic.get(h.href) === h);
  hits.length = 0;
  hits.push(...deduped);

  const [tasks, announcements] = await Promise.all([
    db.assignment.findMany({ where: visibleAssignmentsWhere(actor), select: { id: true, title: true, dueAt: true, status: true }, orderBy: { createdAt: "desc" }, take: 300 }),
    db.announcement.findMany({ where: visibleAnnouncementsWhere(actor), select: { id: true, title: true, body: true }, orderBy: { createdAt: "desc" }, take: 200 }),
  ]);
  const staffTasks = actor.role !== "STUDENT";
  const dateLocale = lang === "en" ? "en-GB" : "tr-TR";
  for (const t of tasks) {
    const s = matchScore(t.title, q);
    if (s > 0) hits.push({ kind: "task", id: t.id, title: t.title, detail: t.dueAt ? tl("Son tarih {date}").replace("{date}", t.dueAt.toLocaleDateString(dateLocale)) : tl("Görev"), href: staffTasks ? `/teach/tasks/${t.id}` : `/tasks/${t.id}`, score: s });
  }
  for (const a of announcements) {
    const s = Math.max(matchScore(a.title, q), matchScore(a.body, q) * 0.5);
    if (s > 0) hits.push({ kind: "announcement", id: a.id, title: a.title, detail: tl("Duyuru"), href: `/announcements#a-${a.id}`, score: s });
  }
  return hits.sort((x, y) => y.score - x.score).slice(0, limit);
}
