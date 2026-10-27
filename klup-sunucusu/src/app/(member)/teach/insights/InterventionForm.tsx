"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Send } from "lucide-react";
import { api } from "@/lib/api-client";
import { useToast } from "@/components/providers";
import { useT } from "@/i18n/client";

export function InterventionForm({ groupId, skills, students }: { groupId: string; skills: { key: string; tr: string }[]; students: { id: string; name: string; flagged: boolean }[] }) {
  const t = useT();
  const router = useRouter();
  const toast = useToast();
  const [skill, setSkill] = useState(skills[0]?.key ?? "");
  const [picked, setPicked] = useState<string[]>(students.filter((s) => s.flagged).map((s) => s.id));
  const [lessons, setLessons] = useState("");
  const [note, setNote] = useState("");
  async function send() {
    try {
      await api("/api/teach/planning", { body: { action: "intervention", data: { groupId, skill, userIds: picked, lessonSlugs: lessons.split(/[\s,]+/).filter(Boolean), note } } });
      toast("ok", t("Tekrar paketi atandı; öğrencilere bildirim gitti."));
      setLessons(""); setNote(""); router.refresh();
    } catch (e) { toast("error", (e as Error).message); }
  }
  return (
    <div className="stack-sm">
      <p className="small muted" style={{ margin: 0 }}>{t("Zorlanılan bir beceri için seçtiğin öğrencilere kısa bir tekrar paketi ata. Sonraki ölçümde beceri yüzdesindeki değişim aşağıda görünür.")}</p>
      <label className="field"><span className="tiny faint">{t("Beceri")}</span><select className="select" value={skill} onChange={(e) => setSkill(e.target.value)}>{skills.map((s) => <option key={s.key} value={s.key}>{s.tr}</option>)}</select></label>
      <fieldset className="field"><legend className="tiny faint">{t("Öğrenciler ({length})", { length: picked.length })}</legend><div className="chips">{students.map((s) => <button key={s.id} type="button" className="chip" aria-pressed={picked.includes(s.id)} onClick={() => setPicked((p) => (p.includes(s.id) ? p.filter((x) => x !== s.id) : [...p, s.id]))}>{s.name}{s.flagged ? " •" : ""}</button>)}</div></fieldset>
      <label className="field"><span className="tiny faint">{t("Tekrar dersleri (kimlikler, virgülle)")}</span><input className="input" value={lessons} onChange={(e) => setLessons(e.target.value)} placeholder="m05-03, m05-04" /></label>
      <label className="field"><span className="tiny faint">{t("Öğrencilere not")}</span><input className="input" maxLength={1000} value={note} onChange={(e) => setNote(e.target.value)} placeholder={t("Perşembe dersinden önce bu iki kısa dersi tekrar et.")} /></label>
      <div><button type="button" className="btn btn-sm btn-primary" disabled={!picked.length || !lessons.trim()} onClick={send}><Send size={14} aria-hidden />{" "}{t("Paketi ata")}</button></div>
    </div>
  );
}
