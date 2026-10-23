// Akademi içeriğini (content/academy) okuyup içe aktarılabilir yapıya çevirir. DB'ye dokunmaz.
// Yazarlık kuralları scripts/academy.mjs check ile denetlenir; burada yalnızca platformun
// güvenle çalışması için gereken yapı doğrulanır ve hatalar toplanır.
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import YAML from "yaml";
import { z } from "zod";
import type { LessonKind, TrackKind } from "@prisma/client";
import { missionProblems, missionSchema, type Mission } from "./missions";

export type QuizQuestion =
  | { kind: "choice"; text: string; options: string[]; answer: number; explanation: string }
  | { kind: "truefalse"; text: string; answer: boolean; explanation: string };

export type Villain = { id: string; ad: string; unvan: string; tehdit: string; ozet: string; bolum: string | null; giris: string | null };

export type ParsedLesson = {
  slug: string;
  position: number;
  kind: LessonKind;
  title: string;
  minutes: number;
  goals: string[];
  body: string;
  quiz: QuizQuestion[] | null;
  missions: Mission[] | null;
  passPercent: number | null;
  sourcePath: string;
  contentHash: string;
};

export type ParsedTrack = {
  key: string;
  code: string;
  kind: TrackKind;
  title: string;
  summary: string;
  position: number;
  villain: Villain | null;
  lessons: ParsedLesson[];
};

const KIND: Record<string, LessonKind> = { bilgi: "INFO", ders: "LESSON", uygulama: "PRACTICE", quiz: "QUIZ" };
const TRACK_KIND: Record<string, TrackKind> = { program: "PROGRAM", temel: "CORE", uzmanlik: "SPECIALIZATION" };

const manifestSchema = z.object({
  yollar: z
    .array(
      z.object({
        anahtar: z.string().regex(/^[a-z0-9-]{1,40}$/),
        kod: z.string().min(1).max(20),
        klasor: z.string().regex(/^[a-z0-9/-]+$/),
        tur: z.enum(["program", "temel", "uzmanlik"]),
        baslik: z.string().min(1).max(200),
        ozet: z.string().max(500).default(""),
      }),
    )
    .min(1),
});

const questionSchema = z.union([
  z.object({ soru: z.string().min(1), tur: z.literal("coktan"), secenekler: z.array(z.coerce.string()).min(2).max(6), dogru: z.number().int().min(0), aciklama: z.string().min(1) }),
  z.object({ soru: z.string().min(1), tur: z.literal("dogru-yanlis"), dogru: z.boolean(), aciklama: z.string().min(1) }),
]);

const metaSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]{1,40}$/),
  tur: z.enum(["bilgi", "ders", "uygulama", "quiz"]),
  baslik: z.coerce.string().min(1).max(200),
  sure: z.number().int().min(1).max(600),
  hedefler: z.array(z.coerce.string()).default([]),
  gecme: z.number().int().min(1).max(100).optional(),
  sorular: z.array(questionSchema).optional(),
  gorevler: z.array(missionSchema).max(3).optional(),
});

// Gövdedeki görev yerleştirme ayracı: ::gorev[id]
export const MISSION_DIRECTIVE = /^::gorev\[([a-z0-9-]{1,40})\]$/;

function splitFrontMatter(raw: string): { meta: unknown; body: string } {
  const m = raw.replace(/\r\n/g, "\n").match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
  if (!m) throw new Error("front-matter (--- … ---) bulunamadı");
  return { meta: YAML.parse(m[1]!) ?? {}, body: m[2]! };
}

function loadVillains(dir: string): Map<string, Villain> {
  const file = path.join(dir, "karakterler.yaml");
  const out = new Map<string, Villain>();
  if (!fs.existsSync(file)) return out;
  const raw = YAML.parse(fs.readFileSync(file, "utf8")) as {
    karakterler?: { id: string; ad: string; unvan: string; modul: string; tehdit: string; ozet: string }[];
    hikaye?: { bolumler?: Record<string, { baslik?: string; giris?: string }> };
  };
  for (const k of raw.karakterler ?? []) {
    const b = raw.hikaye?.bolumler?.[k.id];
    out.set(String(k.modul), {
      id: k.id,
      ad: k.ad,
      unvan: k.unvan,
      tehdit: k.tehdit,
      ozet: k.ozet,
      bolum: b?.baslik ?? null,
      giris: b?.giris ? b.giris.replace(/\s+/g, " ").trim() : null,
    });
  }
  return out;
}

// Gövdedeki göreli bağlantıları platform adreslerine çevirir:
//   ../x/02-y.md   → /academy/lesson/<slug>
//   ../../gorseller/a.webp → /api/academy/images/a.webp
// Çözülemeyen göreli bağlantılar olduğu gibi kalır; çizici bunları bağlantı olarak göstermez.
function rewriteLinks(body: string, fileDir: string, slugByFile: Map<string, string>, trackByDir: Map<string, string>, imagesDir: string, rootDir: string): string {
  return body.replace(/(!?)\[([^\]]*)\]\(([^)\s]+)\)/g, (all, bang: string, label: string, target: string) => {
    if (/^(https?:|mailto:|#|\/)/i.test(target)) return all;
    const [p, hash] = target.split("#") as [string, string | undefined];
    const abs = path.resolve(fileDir, decodeURIComponent(p));
    if (bang && path.dirname(abs) === imagesDir) return `![${label}](/api/academy/images/${path.basename(abs)})`;
    const slug = slugByFile.get(abs);
    if (!bang && slug) return `[${label}](/academy/lesson/${slug}${hash ? `#${hash}` : ""})`;
    // Klasör bağlantısı: yol klasörü → yol sayfası, diğer içerik klasörleri → akademi ana sayfası
    if (!bang && fs.existsSync(abs) && fs.statSync(abs).isDirectory() && (abs + path.sep).startsWith(rootDir + path.sep))
      return `[${label}](/academy${trackByDir.has(abs) ? `/${trackByDir.get(abs)}` : ""})`;
    return all;
  });
}

export function loadAcademy(dir: string): { tracks: ParsedTrack[]; problems: string[] } {
  const problems: string[] = [];
  const manifestFile = path.join(dir, "akademi.yaml");
  if (!fs.existsSync(manifestFile)) return { tracks: [], problems: [`akademi.yaml bulunamadı (${dir})`] };
  const manifest = manifestSchema.safeParse(YAML.parse(fs.readFileSync(manifestFile, "utf8")));
  if (!manifest.success) return { tracks: [], problems: [`akademi.yaml geçersiz: ${manifest.error.issues[0]?.path.join(".")} ${manifest.error.issues[0]?.message}`] };

  const villains = loadVillains(dir);
  const imagesDir = path.join(dir, "gorseller");

  // 1) Dosyaları oku ve yolları sayfa kimlikleriyle eşle (bağlantılar başka yollara da işaret eder).
  type Raw = { track: number; file: string; raw: string };
  const raws: Raw[] = [];
  const slugByFile = new Map<string, string>();
  const trackByDir = new Map<string, string>();
  manifest.data.yollar.forEach((t, ti) => {
    const folder = path.join(dir, t.klasor);
    if (!path.resolve(folder).startsWith(path.resolve(dir) + path.sep)) return problems.push(`${t.anahtar}: klasör içerik dizininin dışında`);
    if (!fs.existsSync(folder)) return problems.push(`${t.anahtar}: klasör yok (${t.klasor})`);
    trackByDir.set(path.resolve(folder), t.anahtar);
    for (const name of fs.readdirSync(folder).filter((n) => n.endsWith(".md")).sort()) {
      const file = path.join(folder, name);
      const raw = fs.readFileSync(file, "utf8");
      const id = raw.match(/^---\r?\n[\s\S]*?^id:\s*([a-z0-9-]+)\s*$/m)?.[1];
      if (id) slugByFile.set(file, id);
      raws.push({ track: ti, file, raw });
    }
  });

  // 2) Sayfaları ayrıştır.
  const tracks: ParsedTrack[] = manifest.data.yollar.map((t, i) => ({
    key: t.anahtar,
    code: t.kod,
    kind: TRACK_KIND[t.tur]!,
    title: t.baslik,
    summary: t.ozet,
    position: i,
    villain: villains.get(t.kod) ?? null,
    lessons: [],
  }));
  const seen = new Map<string, string>();
  for (const r of raws) {
    const rel = path.relative(dir, r.file).replace(/\\/g, "/");
    try {
      const { meta, body } = splitFrontMatter(r.raw);
      const m = metaSchema.safeParse(meta);
      if (!m.success) {
        const i = m.error.issues[0];
        problems.push(`${rel}: ${i?.path.join(".") || "front-matter"} — ${i?.message}`);
        continue;
      }
      const d = m.data;
      if (seen.has(d.id)) problems.push(`${rel}: id tekrar ediyor (${seen.get(d.id)})`);
      seen.set(d.id, rel);
      let quiz: QuizQuestion[] | null = null;
      if (d.tur === "quiz") {
        if (!d.sorular?.length) problems.push(`${rel}: quiz sorusu yok`);
        quiz = (d.sorular ?? []).map((q) =>
          q.tur === "coktan"
            ? { kind: "choice" as const, text: q.soru, options: q.secenekler, answer: q.dogru, explanation: q.aciklama }
            : { kind: "truefalse" as const, text: q.soru, answer: q.dogru, explanation: q.aciklama },
        );
        quiz.forEach((q, qi) => {
          if (q.kind === "choice" && q.answer >= q.options.length) problems.push(`${rel}: soru ${qi + 1} doğru cevap indeksi geçersiz`);
        });
      }
      let missions: Mission[] | null = null;
      if (d.gorevler?.length) {
        if (d.tur === "quiz" || d.tur === "bilgi") problems.push(`${rel}: görev yalnızca ders/uygulama sayfasında olabilir`);
        missions = d.gorevler;
        const ids = new Set<string>();
        for (const g of missions) {
          if (ids.has(g.id)) problems.push(`${rel}: görev id tekrar ediyor (${g.id})`);
          ids.add(g.id);
          problems.push(...missionProblems(g).map((x) => `${rel}: ${x}`));
        }
      }
      const refs = body.split("\n").map((line) => line.trim().match(MISSION_DIRECTIVE)?.[1]).filter((x): x is string => !!x);
      for (const id of refs) if (!missions?.some((g) => g.id === id)) problems.push(`${rel}: ::gorev[${id}] tanımlı değil`);
      for (const g of missions ?? []) if (!refs.includes(g.id)) problems.push(`${rel}: ${g.id} görevi gövdede ::gorev[${g.id}] ile yerleştirilmemiş`);
      const track = tracks[r.track]!;
      const finalBody = rewriteLinks(body, path.dirname(r.file), slugByFile, trackByDir, imagesDir, path.resolve(dir)).trim();
      track.lessons.push({
        slug: d.id,
        position: track.lessons.length,
        kind: KIND[d.tur]!,
        title: d.baslik,
        minutes: d.sure,
        goals: d.hedefler,
        body: finalBody,
        quiz,
        missions,
        passPercent: d.tur === "quiz" ? (d.gecme ?? 70) : null,
        sourcePath: rel,
        // Ham dosya + yeniden yazılmış gövde: başka bir sayfa taşınınca bağlantıları değişen ders de güncellenir.
        contentHash: crypto.createHash("sha256").update(r.raw).update("\0").update(finalBody).digest("hex"),
      });
    } catch (e) {
      problems.push(`${rel}: ${(e as Error).message.split("\n")[0]}`);
    }
  }
  return { tracks, problems };
}
