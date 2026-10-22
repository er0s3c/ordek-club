"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Role } from "@prisma/client";
import { useMessages, useToast } from "@/components/providers";
import { api } from "@/lib/api-client";

type Action = "approve" | "reject" | "disable" | "enable";

const META: Record<Action, { label: string; done: string; cls: string; needsNote: boolean; confirm?: string }> = {
  approve: { label: "Üyeliği onayla", done: "Üyelik onaylandı.", cls: "btn btn-primary", needsNote: true },
  reject: { label: "Başvuruyu reddet", done: "Başvuru reddedildi.", cls: "btn btn-danger", needsNote: true },
  disable: { label: "Hesabı devre dışı bırak", done: "Hesap devre dışı bırakıldı; oturumları kapatıldı.", cls: "btn btn-danger", needsNote: true, confirm: "Hesap devre dışı bırakılsın mı? Üyenin tüm oturumları kapanır." },
  enable: { label: "Hesabı yeniden etkinleştir", done: "Hesap etkinleştirildi.", cls: "btn btn-primary", needsNote: false },
};

export function MemberActions(props: { memberId: string; name: string; actions: Action[]; roles: Role[]; currentRole: Role }) {
  const m = useMessages();
  const toast = useToast();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  const [role, setRole] = useState<Role>(props.currentRole);

  async function run(body: Record<string, unknown>, done: string) {
    setBusy(true);
    try {
      await api(`/api/admin/members/${encodeURIComponent(props.memberId)}`, { method: "PATCH", body });
      toast("ok", done);
      setNote("");
      router.refresh();
    } catch (e) {
      toast("error", (e as Error).message);
    }
    setBusy(false);
  }

  const anyNote = props.actions.some((a) => META[a].needsNote);

  return (
    <div className="stack">
      {props.actions.length > 0 && (
        <>
          {anyNote && (
            <div className="field">
              <label htmlFor="note">Not (isteğe bağlı, denetim kaydına yazılır)</label>
              <input id="note" className="input" value={note} maxLength={300} onChange={(e) => setNote(e.target.value)} />
            </div>
          )}
          <div className="row">
            {props.actions.map((a) => (
              <button
                key={a}
                className={META[a].cls}
                disabled={busy}
                onClick={() => {
                  if (META[a].confirm && !window.confirm(META[a].confirm)) return;
                  void run(META[a].needsNote ? { action: a, note } : { action: a }, META[a].done);
                }}
              >
                {META[a].label}
              </button>
            ))}
          </div>
        </>
      )}
      {props.roles.length > 0 && (
        <div className="field">
          <label htmlFor="role">Rol</label>
          <div className="row">
            <select id="role" className="select" style={{ width: 200 }} value={role} onChange={(e) => setRole(e.target.value as Role)}>
              {!props.roles.includes(props.currentRole) && <option value={props.currentRole}>{m.roles[props.currentRole]}</option>}
              {props.roles.map((r) => <option key={r} value={r}>{m.roles[r]}</option>)}
            </select>
            <button className="btn" disabled={busy || role === props.currentRole} onClick={() => run({ action: "role", role }, "Rol güncellendi; üyenin oturumları yenilenecek.")}>
              Rolü değiştir
            </button>
          </div>
          <span className="hint">Rol değişince üyenin açık oturumları kapanır.</span>
        </div>
      )}
      {props.actions.length === 0 && props.roles.length === 0 && <p className="muted" style={{ margin: 0 }}>Bu durumda uygulanabilecek işlem yok.</p>}
    </div>
  );
}
