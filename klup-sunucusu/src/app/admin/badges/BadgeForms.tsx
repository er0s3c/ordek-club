"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Award, Plus, UserMinus, UserPlus } from "lucide-react";
import { useToast } from "@/components/providers";
import { api } from "@/lib/api-client";
import { BadgeIcon } from "@/components/xp/BadgeIcon";
import { useT } from "@/i18n/client";

const RULE_TYPES = [
  { type: "manual", label: "Yönetici verir", param: null },
  { type: "lessons", label: "Ders sayısı", param: "count" },
  { type: "quizzes", label: "Geçilen quiz sayısı", param: "count" },
  { type: "streak", label: "Gün serisi", param: "days" },
  { type: "xp", label: "Toplam XP", param: "total" },
  { type: "track", label: "Belirli bir yolu bitirme", param: "track" },
  { type: "overall_rank", label: "Genel sıralamada ilk N", param: "rank" },
  { type: "monthly_rank", label: "Ayı ilk N içinde kapatma", param: "rank" },
] as const;

function useAction() {
  const router = useRouter();
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  async function run(fn: () => Promise<unknown>, ok: string) {
    setBusy(true);
    try {
      await fn();
      toast("ok", ok);
      router.refresh();
      return true;
    } catch (e) {
      toast("error", (e as Error).message);
      return false;
    } finally {
      setBusy(false);
    }
  }
  return { busy, run };
}

export function CreateBadgeForm({ icons, tracks }: { icons: readonly string[]; tracks: { key: string; code: string }[] }) {
  const tl = useT();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [icon, setIcon] = useState("award");
  const [type, setType] = useState<(typeof RULE_TYPES)[number]["type"]>("manual");
  const [num, setNum] = useState(5);
  const [track, setTrack] = useState(tracks[0]?.key ?? "");
  const { busy, run } = useAction();
  const def = RULE_TYPES.find((r) => r.type === type)!;
  const rule = def.param === null ? { type } : def.param === "track" ? { type, track } : { type, [def.param]: num };

  return (
    <form
      className="stack-sm"
      onSubmit={async (e) => {
        e.preventDefault();
        if (await run(() => api("/api/admin/badges", { body: { name, description, icon, rule } }), tl("Rozet oluşturuldu."))) {
          setName("");
          setDescription("");
        }
      }}
    >
      <div className="row">
        <input className="input" placeholder={tl("Rozet adı")} value={name} onChange={(e) => setName(e.target.value)} required minLength={2} maxLength={60} aria-label={tl("Rozet adı")} style={{ maxWidth: 260 }} />
        <select className="select" value={icon} onChange={(e) => setIcon(e.target.value)} aria-label={tl("Simge")} style={{ maxWidth: 170 }}>
          {icons.map((i) => <option key={i} value={i}>{i}</option>)}
        </select>
        <span className="badge-medal" aria-hidden><BadgeIcon icon={icon} /></span>
      </div>
      <input className="input" placeholder={tl("Açıklama (isteğe bağlı)")} value={description} onChange={(e) => setDescription(e.target.value)} maxLength={200} aria-label={tl("Açıklama")} />
      <div className="row">
        <select className="select" value={type} onChange={(e) => setType(e.target.value as typeof type)} aria-label={tl("Kazanma kuralı")} style={{ maxWidth: 260 }}>
          {RULE_TYPES.map((r) => <option key={r.type} value={r.type}>{tl(r.label)}</option>)}
        </select>
        {def.param === "track" ? (
          <select className="select" value={track} onChange={(e) => setTrack(e.target.value)} aria-label={tl("Yol")} style={{ maxWidth: 160 }}>
            {tracks.map((t) => <option key={t.key} value={t.key}>{t.code}</option>)}
          </select>
        ) : def.param ? (
          <input className="input input-num" type="number" min={1} value={num} onChange={(e) => setNum(Number(e.target.value))} aria-label={tl("Eşik")} />
        ) : null}
      </div>
      <div><button className="btn btn-primary" disabled={busy}><Plus size={16} aria-hidden />{" "}{tl("Rozet oluştur")}</button></div>
    </form>
  );
}

export function BadgeRowActions({ id, name, active }: { id: string; name: string; active: boolean }) {
  const t = useT();
  const { busy, run } = useAction();
  const ask = (verb: string) => {
    const username = window.prompt(t("{name} rozetini {verb} kullanıcı adı:", { name, verb }))?.trim();
    if (!username) return null;
    const reason = window.prompt(t("Gerekçe (en az 3 karakter):"))?.trim();
    return reason ? { username, reason } : null;
  };
  return (
    <div className="row" style={{ gap: 6, justifyContent: "flex-end" }}>
      <button className="btn btn-sm" disabled={busy} onClick={() => { const b = ask("verilecek"); if (b) void run(() => api(`/api/admin/badges/${id}/award`, { body: b }), "Rozet verildi."); }} aria-label={t("{name} rozetini ver", { name })}>
        <UserPlus size={14} aria-hidden />{" "}{t("Ver")}
      </button>
      <button className="btn btn-sm btn-ghost" disabled={busy} onClick={() => { const b = ask(t("geri alınacak")); if (b) void run(() => api(`/api/admin/badges/${id}/award`, { method: "DELETE", body: b }), t("Rozet geri alındı.")); }} aria-label={t("{name} rozetini geri al", { name })}>
        <UserMinus size={14} aria-hidden />
      </button>
      <button className="btn btn-sm btn-ghost" disabled={busy} onClick={() => void run(() => api(`/api/admin/badges/${id}`, { method: "PATCH", body: { active: !active } }), active ? t("Rozet kapatıldı.") : t("Rozet açıldı."))}>
        <Award size={14} aria-hidden /> {active ? t("Kapat") : t("Aç")}
      </button>
    </div>
  );
}
