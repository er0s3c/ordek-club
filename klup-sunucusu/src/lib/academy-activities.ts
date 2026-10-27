import { z } from "zod";
const base = { id: z.string().regex(/^[a-z0-9-]{1,40}$/), prompt: z.string().min(1).max(2000), explanation: z.string().min(1).max(4000) };
const text = z.object({ ...base, kind: z.enum(["fill", "command", "http"]), starter: z.string().max(4000).default(""), answers: z.array(z.string().min(1).max(4000)).min(1).max(12), caseSensitive: z.boolean().default(true) });
const choice = z.object({ ...base, kind: z.enum(["choice", "log", "code"]), options: z.array(z.string().min(1).max(2000)).min(2).max(30), answer: z.number().int().min(0) });
const order = z.object({ ...base, kind: z.literal("order"), options: z.array(z.string().min(1).max(1000)).min(2).max(12), answer: z.array(z.number().int().min(0)).min(2).max(12) });
const match = z.object({ ...base, kind: z.literal("match"), left: z.array(z.string().min(1).max(1000)).min(2).max(12), right: z.array(z.string().min(1).max(1000)).min(2).max(12), answer: z.array(z.number().int().min(0)).min(2).max(12) });
export const activitySchema = z.union([text, choice, order, match]).superRefine((a, ctx) => {
  const invalid = () => ctx.addIssue({ code: "custom", message: "Etkinliğin cevap anahtarı seçeneklerle uyumlu değil." });
  if ("answer" in a && typeof a.answer === "number" && "options" in a && a.answer >= a.options.length) invalid();
  if (a.kind === "order" && (a.answer.length !== a.options.length || new Set(a.answer).size !== a.options.length || a.answer.some(i => i >= a.options.length))) invalid();
  if (a.kind === "match" && (a.answer.length !== a.left.length || a.answer.some(i => i >= a.right.length))) invalid();
});
export const activitiesSchema = z.array(activitySchema).max(20).superRefine((items, ctx) => { if (new Set(items.map(i => i.id)).size !== items.length) ctx.addIssue({ code: "custom", message: "Etkinlik kimlikleri benzersiz olmalı." }); });
export type Activity = z.output<typeof activitySchema>;
export type PublicActivity = Omit<Activity, "answers" | "answer" | "explanation" | "caseSensitive">;
export function publicActivity(a: Activity): PublicActivity {
  // Explicit allow-list prevents answer keys leaking through nested union fields.
  const common = { id: a.id, kind: a.kind, prompt: a.prompt };
  if (a.kind === "match") return { ...common, left: a.left, right: a.right } as PublicActivity;
  if ("options" in a) return { ...common, options: a.options } as PublicActivity;
  return { ...common, starter: a.starter } as PublicActivity;
}
export type ActivityView = ReturnType<typeof publicActivity> & { options?: string[]; left?: string[]; right?: string[]; starter?: string };
const clean = (s: string) => s.replace(/\r\n/g, "\n").trim();
export function gradeActivity(a: Activity, values: string[]) {
  if (a.kind === "match" || a.kind === "order") return values.length === a.answer.length && a.answer.every((v, i) => values[i] === String(v));
  if ("answer" in a) return values.length === 1 && values[0] === String(a.answer);
  return values.length === 1 && a.answers.some(answer => a.caseSensitive ? clean(values[0]!) === clean(answer) : clean(values[0]!).toLocaleLowerCase("tr-TR") === clean(answer).toLocaleLowerCase("tr-TR"));
}
export function translationCompatible(original: Activity[], translated: Activity[]) {
  return original.length === translated.length && original.every((a, i) => {
    const b = translated[i]!;
    if (a.id !== b.id || a.kind !== b.kind) return false;
    if ("answer" in a && "answer" in b) return JSON.stringify(a.answer) === JSON.stringify(b.answer) && ("options" in a && "options" in b ? a.options.length === b.options.length : a.kind === "match" && b.kind === "match" && a.left.length === b.left.length && a.right.length === b.right.length);
    return "answers" in a && "answers" in b;
  });
}
