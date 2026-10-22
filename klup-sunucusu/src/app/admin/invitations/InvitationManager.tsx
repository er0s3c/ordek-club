"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Ticket, Ban } from "lucide-react";
import type { Role } from "@prisma/client";
import { useMessages, useToast } from "@/components/providers";
import { Field } from "@/components/ui/Field";
import { CopyButton } from "@/components/ui/CopyButton";
import { RoleBadge } from "@/components/ui/badges";
import { formatDateTime } from "@/components/ui/format";
import { ApiError, api } from "@/lib/api-client";

type Inv = {
  id: string; label: string; codePrefix: string; role: Role; autoApprove: boolean; maxUses: number | null; useCount: number;
  expiresAt: string | null; revokedAt: string | null; createdAt: string; createdBy: { username: string } | null;
  state: "ACTIVE" | "REVOKED" | "EXPIRED" | "EXHAUSTED";
};

const STATE: Record<Inv["state"], { label: string; cls: string }> = {
  ACTIVE: { label: "Geçerli", cls: "badge badge-lime" },
  REVOKED: { label: "İptal", cls: "badge badge-red" },
  EXPIRED: { label: "Süresi doldu", cls: "badge" },
  EXHAUSTED: { label: "Limit doldu", cls: "badge badge-amber" },
};

export function InvitationManager({ roles, timezone, appUrl }: { roles: Role[]; timezone: string; appUrl: string }) {
  const m = useMessages();
  const toast = useToast();
  const [items, setItems] = useState<Inv[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [fields, setFields] = useState<Record<string, string>>({});
  const [created, setCreated] = useState<{ code: string; label: string } | null>(null);

  const load = useCallback(async () => {
    try {
      setItems((await api<{ items: Inv[] }>("/api/admin/invitations")).items);
      setError(null);
    } catch (e) {
      setError((e as Error).message);
    }
  }, []);
  useEffect(() => void load(), [load]);

  async function create(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const f = new FormData(form);
    const maxUses = String(f.get("maxUses") ?? "").trim();
    const days = String(f.get("expiresInDays") ?? "").trim();
    setBusy(true);
    setFields({});
    try {
      const res = await api<{ id: string; code: string }>("/api/admin/invitations", {
        body: {
          label: f.get("label"),
          role: f.get("role"),
          autoApprove: f.get("autoApprove") === "on",
          maxUses: maxUses ? Number(maxUses) : null,
          expiresInDays: days ? Number(days) : null,
        },
      });
      setCreated({ code: res.code, label: String(f.get("label")) });
      form.reset();
      await load();
    } catch (err) {
      if (err instanceof ApiError && Object.keys(err.fields).length) setFields(err.fields);
      else toast("error", (err as Error).message);
    }
    setBusy(false);
  }

  async function revoke(inv: Inv) {
    if (!window.confirm(`"${inv.label}" daveti iptal edilsin mi? Bu kodla artık kayıt olunamaz.`)) return;
    try {
      await api(`/api/admin/invitations/${encodeURIComponent(inv.id)}`, { method: "DELETE" });
      toast("ok", "Davet iptal edildi.");
      await load();
    } catch (e) {
      toast("error", (e as Error).message);
    }
  }

  const base = appUrl || (typeof window !== "undefined" ? window.location.origin : "");
  const link = created ? `${base}/register?code=${encodeURIComponent(created.code)}` : "";

  return (
    <div className="stack">
      <section className="card" aria-labelledby="new-inv-h">
        <div className="card-h"><h2 id="new-inv-h">Yeni davet</h2></div>
        <div className="card-b">
          {created && (
            <div className="stack" style={{ marginBottom: 18 }}>
              <div className="alert alert-ok">
                <span><strong>{created.label}</strong> daveti oluşturuldu. Kodu şimdi kopyala — güvenlik nedeniyle tekrar gösterilmeyecek.</span>
              </div>
              <div className="code-box"><span>{created.code}</span><CopyButton value={created.code} /></div>
              <div className="row small"><span className="muted mono" style={{ wordBreak: "break-all" }}>{link}</span><CopyButton value={link} /></div>
            </div>
          )}
          <form className="stack" onSubmit={create} noValidate>
            <div className="form-grid">
              <Field label="Etiket" name="label" required maxLength={80} placeholder="ör. 2026 Güz tanışma etkinliği" error={fields.label} />
              <div className="field">
                <label htmlFor="inv-role">Rol</label>
                <select id="inv-role" name="role" className="select" defaultValue="STUDENT">
                  {roles.map((r) => <option key={r} value={r}>{m.roles[r]}</option>)}
                </select>
              </div>
              <Field label="Kullanım limiti" name="maxUses" type="number" min={1} max={10000} placeholder="sınırsız" error={fields.maxUses} />
              <Field label="Geçerlilik (gün)" name="expiresInDays" type="number" min={1} max={365} defaultValue={30} hint="Boş bırakılırsa süresiz." error={fields.expiresInDays} />
            </div>
            <label className="check">
              <input type="checkbox" name="autoApprove" />
              <span>Bu kodla kayıt olanları otomatik onayla<br /><span className="tiny faint">Kapalıysa ve kayıt politikası “Başvuru + onay” ise üyeler yine onay bekler.</span></span>
            </label>
            <div><button className="btn btn-primary" disabled={busy}>{busy ? <span className="spinner" aria-hidden /> : <Plus size={16} aria-hidden />} Davet oluştur</button></div>
          </form>
        </div>
      </section>

      <section className="card" aria-labelledby="inv-list-h">
        <div className="card-h"><h2 id="inv-list-h">Davetler</h2></div>
        <div className="card-b flush">
          {error ? (
            <div className="empty"><div className="alert alert-error" style={{ display: "inline-flex" }}>{error}</div></div>
          ) : !items ? (
            <div className="stack" style={{ padding: 18 }} aria-busy="true">{[1, 2, 3].map((i) => <div key={i} className="skeleton" style={{ height: 30 }} />)}</div>
          ) : items.length === 0 ? (
            <div className="empty"><Ticket size={28} aria-hidden /><div>Henüz davet yok.</div></div>
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead><tr><th>Etiket</th><th>Kod</th><th>Rol</th><th>Kullanım</th><th>Bitiş</th><th>Durum</th><th><span className="sr-only">İşlem</span></th></tr></thead>
                <tbody>
                  {items.map((i) => (
                    <tr key={i.id}>
                      <td>{i.label}<div className="tiny faint">{i.createdBy ? `@${i.createdBy.username} · ` : ""}{formatDateTime(i.createdAt, timezone)}{i.autoApprove ? " · otomatik onay" : ""}</div></td>
                      <td className="mono small">{i.codePrefix}-••••-••••</td>
                      <td><RoleBadge role={i.role} /></td>
                      <td className="num">{i.useCount}{i.maxUses !== null ? ` / ${i.maxUses}` : ""}</td>
                      <td className="tiny faint">{i.expiresAt ? formatDateTime(i.expiresAt, timezone) : "süresiz"}</td>
                      <td><span className={STATE[i.state].cls}>{STATE[i.state].label}</span></td>
                      <td style={{ textAlign: "right" }}>
                        {i.state === "ACTIVE" && roles.includes(i.role) && (
                          <button className="btn btn-sm btn-danger" onClick={() => revoke(i)} aria-label={`${i.label} davetini iptal et`}><Ban size={14} aria-hidden /> İptal</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
