"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Flag, Heart, Lock, MessageSquare, Plus, Users2 } from "lucide-react";
import { api } from "@/lib/api-client";
import { useToast } from "@/components/providers";
import { Tabs } from "@/components/ui/Tabs";
import { EmptyState, StatusPill } from "@/components/ui/states";
import { useT } from "@/i18n/client";

type Reply = { id: string; body: string; author: string; authorId: string; mine: boolean; createdAt: string };
type Post = { id: string; topic: string; body: string; skill: string | null; status: string; flags?: number; createdAt: string; expiresAt: string; author: string; authorId: string; mine: boolean; replies: Reply[]; replyCount: number };
type Circle = { id: string; name: string; topic: string; plan: string; member: boolean; owner: boolean; full: boolean; members: { id: string; name: string; week: number | null }[] };

function useAct() {
  const router = useRouter();
  const toast = useToast();
  return async (fn: () => Promise<unknown>, ok?: string) => {
    try { await fn(); if (ok) toast("ok", ok); router.refresh(); return true; } catch (e) { toast("error", (e as Error).message); return false; }
  };
}

function PostCard({ p, staff }: { p: Post; staff: boolean }) {
  const t = useT();
  const act = useAct();
  const [reply, setReply] = useState("");
  return (
    <article className="card" aria-labelledby={`p-${p.id}`}>
      <div className="card-h">
        <h2 id={`p-${p.id}`} style={{ textTransform: "none", letterSpacing: 0, fontFamily: "var(--font-sans)", fontSize: 16 }}>{p.topic}</h2>
        {p.status === "OPEN" ? <StatusPill tone="ok">{t("açık")}</StatusPill> : p.status === "HIDDEN" ? <StatusPill tone="err">{t("gizlendi")}{staff && p.flags ? t(" · {flags} bildirim", { flags: p.flags }) : ""}</StatusPill> : <StatusPill tone="neutral">{t("kapandı")}</StatusPill>}
      </div>
      <div className="card-b stack-sm">
        <span className="tiny faint">{p.author} · {new Date(p.createdAt).toLocaleDateString(t.intl)} · {t("{date} tarihine kadar", { date: new Date(p.expiresAt).toLocaleDateString(t.intl) })}</span>
        <p style={{ margin: 0, whiteSpace: "pre-wrap" }}>{p.body}</p>
        {p.replies.length > 0 && (
          <ul className="qa-list" style={{ gap: 8 }}>
            {p.replies.map((r) => (
              <li key={r.id} className="qa-answer">
                <span className="tiny faint">{r.author}</span>
                <p style={{ margin: "2px 0 0", whiteSpace: "pre-wrap" }}>{r.body}</p>
                {p.mine && !r.mine && <button type="button" className="btn btn-ghost btn-sm" onClick={() => act(() => api("/api/study/thanks", { body: { toId: r.authorId, context: `reply:${r.id}`, message: "" } }), t("Teşekkür notun gönderildi."))}><Heart size={13} aria-hidden />{" "}{t("Teşekkür et")}</button>}
              </li>
            ))}
          </ul>
        )}
        {!p.mine && p.status === "OPEN" && (
          <div className="row">
            <input className="input" style={{ flex: 1, minWidth: 200 }} aria-label={t("Yanıt")} maxLength={1000} value={reply} onChange={(e) => setReply(e.target.value)} placeholder={t("Ben de çalışıyorum; salı akşamı birlikte tekrar yapalım mı?")} />
            <button type="button" className="btn btn-sm" disabled={reply.trim().length < 2} onClick={async () => { if (await act(() => api(`/api/study/buddies/${p.id}`, { body: { body: reply } }), t("Yanıtın yalnız ilan sahibine görünür."))) setReply(""); }}><MessageSquare size={14} aria-hidden />{" "}{t("Yanıtla")}</button>
          </div>
        )}
        <div className="row">
          {p.mine && p.status === "OPEN" && <button type="button" className="btn btn-ghost btn-sm" onClick={() => act(() => api(`/api/study/buddies/${p.id}`, { method: "PATCH", body: { action: "close" } }), t("İlan kapatıldı."))}><Lock size={13} aria-hidden />{" "}{t("İlanı kapat")}</button>}
          {!p.mine && p.status === "OPEN" && <button type="button" className="btn btn-ghost btn-sm" onClick={() => act(() => api(`/api/study/buddies/${p.id}`, { method: "PATCH", body: { action: "flag" } }), t("Bildirimin alındı."))}><Flag size={13} aria-hidden />{" "}{t("Uygunsuz bildir")}</button>}
          {staff && <button type="button" className="btn btn-ghost btn-sm" onClick={() => act(() => api(`/api/study/buddies/${p.id}`, { method: "PATCH", body: { action: p.status === "HIDDEN" ? "show" : "hide" } }))}>{p.status === "HIDDEN" ? t("Geri aç") : t("Gizle")}</button>}
          {!p.mine && <span className="tiny faint">{t("{replyCount} yanıt", { replyCount: p.replyCount })}</span>}
        </div>
      </div>
    </article>
  );
}

function NewPost() {
  const t = useT();
  const act = useAct();
  const [topic, setTopic] = useState("");
  const [body, setBody] = useState("");
  return (
    <section className="card card-primary" aria-labelledby="np-h">
      <div className="card-h"><h2 id="np-h"><Plus size={16} aria-hidden />{" "}{t("İlan aç")}</h2></div>
      <div className="card-b stack">
        <label className="field">{t("Konu")}<input className="input" maxLength={120} value={topic} onChange={(e) => setTopic(e.target.value)} placeholder={t("Linux izinleri tekrarı")} /></label>
        <label className="field">{t("Ne arıyorsun?")}<textarea className="textarea" rows={3} maxLength={1000} value={body} onChange={(e) => setBody(e.target.value)} placeholder={t("M04’ü çalışıyorum; haftada iki akşam birlikte tekrar yapacak birini arıyorum.")} /></label>
        <p className="tiny faint" style={{ margin: 0 }}>{t("Telefon, e-posta, sosyal medya adı ve dış bağlantı yazma — kabul edilmez. İlan 14 gün sonra kendiliğinden kapanır.")}</p>
        <div><button type="button" className="btn btn-primary btn-sm" disabled={topic.trim().length < 3 || body.trim().length < 10} onClick={async () => { if (await act(() => api("/api/study/buddies", { body: { topic, body, skill: null } }), t("İlanın yayında."))) { setTopic(""); setBody(""); } }}>{t("Yayınla")}</button></div>
      </div>
    </section>
  );
}

function Circles({ circles }: { circles: Circle[] }) {
  const t = useT();
  const act = useAct();
  const [name, setName] = useState("");
  const [topic, setTopic] = useState("");
  const [plans, setPlans] = useState<Record<string, string>>({});
  return (
    <div className="stack">
      <section className="card"><div className="card-b row">
        <input className="input" style={{ flex: 1, minWidth: 160 }} aria-label={t("Grup adı")} maxLength={60} value={name} onChange={(e) => setName(e.target.value)} placeholder={t("Grup adı (örn. Salı Ağ Ekibi)")} />
        <input className="input" style={{ flex: 2, minWidth: 200 }} aria-label={t("Konu")} maxLength={140} value={topic} onChange={(e) => setTopic(e.target.value)} placeholder={t("Konu (örn. M05 Ağlar)")} />
        <button type="button" className="btn btn-sm btn-primary" disabled={name.trim().length < 3} onClick={async () => { if (await act(() => api("/api/study/circles", { body: { name, topic } }), t("Grup oluşturuldu."))) { setName(""); setTopic(""); } }}><Users2 size={14} aria-hidden />{" "}{t("Grup kur")}</button>
      </div></section>
      {circles.length === 0 ? <EmptyState duck="wave" title={t("Henüz çalışma grubu yok")} text={t("İlk grubu sen kur; en fazla 5 kişi katılabilir.")} /> : (
        <div className="grid-2">
          {circles.map((c) => (
            <article key={c.id} className="card" aria-labelledby={`c-${c.id}`}>
              <div className="card-h"><h2 id={`c-${c.id}`}><Users2 size={15} aria-hidden /> {c.name}</h2><span className="tiny faint">{c.members.length}/5</span></div>
              <div className="card-b stack-sm">
                {c.topic && <span className="small muted">{c.topic}</span>}
                <ul className="list-tight">{c.members.map((m) => <li key={m.id}><span style={{ flex: 1 }}>{m.name}</span>{m.week !== null && <span className="tiny faint">{t("bu hafta {week} çalışma", { week: m.week })}</span>}</li>)}</ul>
                {c.member ? (
                  <>
                    <label className="field"><span className="tiny faint">{t("Ortak plan")}</span><textarea className="textarea" rows={3} maxLength={3000} value={plans[c.id] ?? c.plan} onChange={(e) => setPlans((p) => ({ ...p, [c.id]: e.target.value }))} placeholder={t("Bu hafta: M05 3–5. dersler, perşembe tekrar kartları")} /></label>
                    <div className="row"><button type="button" className="btn btn-sm" disabled={(plans[c.id] ?? c.plan) === c.plan} onClick={() => act(() => api(`/api/study/circles/${c.id}`, { method: "PUT", body: { plan: plans[c.id] ?? "" } }), "Plan kaydedildi.")}>{t("Planı kaydet")}</button><button type="button" className="btn btn-ghost btn-sm" onClick={() => act(() => api(`/api/study/circles/${c.id}`, { method: "PATCH", body: { join: false } }), t("Gruptan ayrıldın."))}>{t("Ayrıl")}</button></div>
                  </>
                ) : <div><button type="button" className="btn btn-sm btn-primary" disabled={c.full} onClick={() => act(() => api(`/api/study/circles/${c.id}`, { method: "PATCH", body: { join: true } }), t("Gruba katıldın."))}>{t("Katıl")}</button></div>}
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}

export function BuddyBoard({ posts, circles, staff, thanks }: { posts: Post[]; circles: Circle[]; staff: boolean; thanks: number }) {
  const t = useT();
  return (
    <>
      {thanks > 0 && <p className="small"><Heart size={14} aria-hidden />{" "}{t("Yardımların için {thanks} teşekkür notu aldın.", { thanks })}</p>}
      <Tabs label={t("Çalışma arkadaşları")} tabs={[
        { id: "posts", label: t("İlanlar ({length})", { length: posts.filter((p) => p.status === "OPEN").length }), content: (
          <div className="grid-2" style={{ alignItems: "start" }}>
            <NewPost />
            <div className="stack">{posts.length ? posts.map((p) => <PostCard key={p.id} p={p} staff={staff} />) : <EmptyState duck="search" title={t("Henüz ilan yok")} text={t("İlk ilanı sen aç.")} />}</div>
          </div>
        ) },
        { id: "circles", label: t("Çalışma grupları ({length})", { length: circles.filter((c) => c.member).length }), content: <Circles circles={circles} /> },
      ]} />
    </>
  );
}
