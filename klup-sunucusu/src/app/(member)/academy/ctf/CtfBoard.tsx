"use client";
// CTFd'den esinlenen pano: kategoriye göre görev kartları, görev penceresi (açıklama, kanıt, ipuçları, bayrak),
// birey ve takım skor tablosu. Doğrulama her zaman sunucuda; istemci bayrak özetini bilmez.
import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Droplet, Flag, Lightbulb, Lock, Trophy, Users } from "lucide-react";
import { api } from "@/lib/api-client";
import { useToast } from "@/components/providers";
import { Drawer } from "@/components/ui/Drawer";
import { StatusPill } from "@/components/ui/states";
import { AnimatedList } from "@/components/motion/AnimatedList";
import { AnimatedNumber } from "@/components/motion/Primitives";
import { SuccessCheck } from "@/components/presentation/LottiePlayer";
import { useT } from "@/i18n/client";

type Hint = { index: number; cost: number; text: string | null };
type Ch = { key: string; title: string; category: string; categoryTr: string; difficulty: 1 | 2 | 3; value: number; solves: number; description: string; artifact: string; firstBlood: string | null; solved: boolean; hints: Hint[] };
type Board = {
  challenges: Ch[];
  scoreboard: { users: { userId: string; name: string; username: string; score: number; solves: number; rank: number }[]; teams: { teamId: string; name: string; score: number; solves: number; rank: number }[] };
  me: { score: number; rank: number | null; team: { id: string; name: string } | null };
};

const DIFF = { 1: "Kolay", 2: "Orta", 3: "Zor" } as const;

export function CtfBoard({ data }: { data: Board }) {
  const tl = useT();
  const router = useRouter();
  const toast = useToast();
  const [open, setOpen] = useState<Ch | null>(null);
  const [flag, setFlag] = useState("");
  const [busy, setBusy] = useState(false);
  const [wrong, setWrong] = useState(false);
  const [tab, setTab] = useState<"users" | "teams">("users");
  const cats = useMemo(() => [...new Set(data.challenges.map((c) => c.categoryTr))], [data.challenges]);
  const current = open ? data.challenges.find((c) => c.key === open.key) ?? open : null;

  async function submit() {
    if (!current) return;
    setBusy(true);
    setWrong(false);
    try {
      const r = await api<{ correct: boolean; value?: number; xp?: number }>(`/api/ctf/${current.key}/flag`, { body: { flag } });
      if (r.correct) { toast("ok", tl("Doğru bayrak! +{value} puan{v0}", { value: r.value, v0: r.xp ? ` · +${r.xp} XP` : "" })); setFlag(""); router.refresh(); }
      else setWrong(true);
    } catch (e) { toast("error", (e as Error).message); } finally { setBusy(false); }
  }

  async function hint(h: Hint) {
    if (!current || !window.confirm(tl("Bu ipucu CTF puanından {cost} düşer. Açılsın mı?", { cost: h.cost }))) return;
    try { await api(`/api/ctf/${current.key}/hint`, { body: { index: h.index } }); router.refresh(); }
    catch (e) { toast("error", (e as Error).message); }
  }

  return (
    <div className="ctf">
      <div className="ctf-main stack-lg">
        {cats.map((cat) => (
          <section key={cat} aria-labelledby={`cat-${cat}`} className="stack-sm">
            <h2 id={`cat-${cat}`} className="eyebrow">{cat}</h2>
            <div className="ctf-grid">
              {data.challenges.filter((c) => c.categoryTr === cat).map((c) => (
                <button key={c.key} type="button" className={`ctf-card${c.solved ? " is-solved" : ""}`} onClick={() => { setOpen(c); setFlag(""); setWrong(false); }} aria-haspopup="dialog">
                  <span className="ctf-value mono">{c.value}</span>
                  <strong>{c.title}</strong>
                  <span className="tiny faint">{tl("{v0} · {solves} çözüm", { v0: DIFF[c.difficulty], solves: c.solves })}</span>
                  {c.solved && <span className="ctf-solved"><Flag size={12} aria-hidden />{" "}{tl("çözdün")}</span>}
                </button>
              ))}
            </div>
          </section>
        ))}
      </div>

      <aside className="ctf-side stack">
        <section className="card card-b stack-sm" aria-label={tl("Durumun")}>
          <div className="row-between"><strong>{tl("Puanın")}</strong><span className="ctf-score mono"><AnimatedNumber value={data.me.score} /></span></div>
          <span className="small muted">{data.me.rank ? tl("Sıralamada {rank}.", { rank: data.me.rank }) : tl("Henüz bayrak yok — kolay görevlerden başla.")}</span>
          <span className="small"><Users size={14} aria-hidden /> {data.me.team ? <>{tl("Takım:")}{" "}<strong>{data.me.team.name}</strong></> : <>{tl("Takımın yok ·")}{" "}<Link href="/academy/practice">{tl("Uygulama meydanından")}</Link>{" "}{tl("kur ya da katıl")}</>}</span>
        </section>
        <section className="card" aria-label={tl("Skor tablosu")}>
          <div className="card-h"><h2><Trophy size={16} aria-hidden />{" "}{tl("Skor tablosu")}</h2>
            <div className="seg" role="group" aria-label={tl("Tablo")}><button type="button" aria-pressed={tab === "users"} onClick={() => setTab("users")}>{tl("Bireysel")}</button><button type="button" aria-pressed={tab === "teams"} onClick={() => setTab("teams")}>{tl("Takım")}</button></div>
          </div>
          <div className="card-b">
            {(tab === "users" ? data.scoreboard.users : data.scoreboard.teams).length === 0 ? <p className="small muted" style={{ margin: 0 }}>{tl("İlk bayrağı sen yakala.")}</p> : (
              <AnimatedList as="ol" className="ctf-rank">
                {tab === "users"
                  ? data.scoreboard.users.map((u) => <li key={u.userId}><span className="mono">{u.rank}</span><a href={`/u/${u.username}`}>{u.name}</a><span className="mono">{u.score}</span></li>)
                  : data.scoreboard.teams.map((t) => <li key={t.teamId}><span className="mono">{t.rank}</span><span>{t.name}</span><span className="mono">{t.score}</span></li>)}
              </AnimatedList>
            )}
          </div>
        </section>
      </aside>

      <Drawer open={!!current} onClose={() => setOpen(null)} title={current ? tl("{title} · {value} puan", { title: current.title, value: current.value }) : ""}>
        {current && (
          <div className="stack">
            <div className="row" style={{ flexWrap: "wrap", gap: 6 }}>
              <StatusPill tone="info">{current.categoryTr}</StatusPill><StatusPill tone="neutral">{DIFF[current.difficulty]}</StatusPill>
              {current.firstBlood && <span className="tiny faint"><Droplet size={12} aria-hidden />{" "}{tl("İlk çözen: {firstBlood}", { firstBlood: current.firstBlood })}</span>}
            </div>
            <p style={{ margin: 0 }}>{current.description}</p>
            <pre className="ctf-artifact" tabIndex={0} aria-label="Görev kanıtı">{current.artifact}</pre>
            {current.hints.length > 0 && (
              <div className="stack-sm">
                {current.hints.map((h) => h.text
                  ? <div key={h.index} className="alert alert-info small"><Lightbulb size={14} aria-hidden /> {h.text}</div>
                  : <button key={h.index} type="button" className="btn btn-sm btn-ghost" onClick={() => hint(h)}><Lock size={13} aria-hidden />{" "}{tl("{v0}. ipucunu aç (−{cost} puan)", { v0: h.index + 1, cost: h.cost })}</button>)}
              </div>
            )}
            {current.solved ? <div className="row"><SuccessCheck size={32} /><strong>{tl("Bu bayrağı yakaladın.")}</strong></div> : (
              <form className="stack-sm" onSubmit={(e) => { e.preventDefault(); void submit(); }}>
                <label className="field">{tl("Bayrak")}<input className={`input mono${wrong ? " is-invalid" : ""}`} value={flag} maxLength={200} autoComplete="off" spellCheck={false} placeholder="ordek{...}" onChange={(e) => { setFlag(e.target.value); setWrong(false); }} aria-invalid={wrong} /></label>
                {wrong && <span className="small" role="alert" style={{ color: "var(--err)" }}>{tl("Bu bayrak değil. Biçimi ve büyük/küçük harfi kontrol et.")}</span>}
                <div><button className="btn btn-primary btn-sm" disabled={busy || !flag.trim()}><Flag size={14} aria-hidden />{" "}{tl("Gönder")}</button></div>
              </form>
            )}
          </div>
        )}
      </Drawer>
    </div>
  );
}
