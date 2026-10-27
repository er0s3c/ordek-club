"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api-client";
import { useToast } from "@/components/providers";
import { DataTable } from "@/components/ui/DataTable";
import { StatusPill, type Tone } from "@/components/ui/states";
import { useT } from "@/i18n/client";

type Row = { id: string; no: string; kind: string; status: string; body: string; location: string; createdAt: string; reporter: string; lesson: { slug: string; title: string } | null; history: { status: string; note: string; at: string }[] };
const LABEL: Record<string, string> = { RECEIVED: "Alındı", REVIEWING: "İnceleniyor", FIXED: "Düzeltildi", REJECTED: "Değişiklik gerekmedi" };
const TONE: Record<string, Tone> = { RECEIVED: "info", REVIEWING: "warn", FIXED: "ok", REJECTED: "neutral" };
const KIND: Record<string, string> = { CONTENT: "İçerik", TECHNICAL: "Teknik", TRANSLATION: "Çeviri" };

function Detail({ row }: { row: Row }) {
  const t = useT();
  const router = useRouter();
  const toast = useToast();
  const [status, setStatus] = useState(row.status);
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  async function save() {
    setBusy(true);
    try { await api(`/api/issues/${row.id}`, { method: "PATCH", body: { status, note } }); toast("ok", t("Güncellendi; bildiren kişiye bildirim gitti.")); setNote(""); router.refresh(); }
    catch (e) { toast("error", (e as Error).message); } finally { setBusy(false); }
  }
  return (
    <div className="stack">
      <p style={{ whiteSpace: "pre-wrap", margin: 0 }}>{row.body}</p>
      <dl className="kv"><dt>{t("Bildiren")}</dt><dd>{row.reporter}</dd><dt>{t("Konum")}</dt><dd className="mono tiny">{row.location || "—"}</dd>{row.lesson && <><dt>{t("Ders")}</dt><dd><Link href={`/academy/lesson/${row.lesson.slug}`}>{row.lesson.title}</Link></dd></>}</dl>
      <ol className="timeline">{row.history.map((h, i) => <li key={i}><time>{new Date(h.at).toLocaleString(t.intl)}</time><span>{t(LABEL[h.status] ?? h.status)}{h.note && ` · ${h.note}`}</span></li>)}</ol>
      <label className="field">{t("Yeni durum")}<select className="select" value={status} onChange={(e) => setStatus(e.target.value)}>{Object.entries(LABEL).map(([k, v]) => <option key={k} value={k}>{t(v)}</option>)}</select></label>
      <label className="field">{t("Öğrenciye not")}<textarea className="textarea" rows={3} maxLength={1000} value={note} onChange={(e) => setNote(e.target.value)} placeholder={t("Örn. “Teşekkürler, örnek düzeltildi.”")} /></label>
      <button type="button" className="btn btn-primary btn-sm" disabled={busy} onClick={save}>{t("Durumu kaydet")}</button>
    </div>
  );
}

export function IssueQueue({ rows }: { rows: Row[] }) {
  const t = useT();
  return (
    <DataTable
      label={t("Sorun bildirimleri")}
      rows={rows}
      searchText={(r) => `${r.no} ${r.body} ${r.reporter} ${r.lesson?.title ?? ""}`}
      filters={{ label: t("Durum"), options: Object.entries(LABEL).map(([value, label]) => ({ value, label: t(label) })), value: (r) => r.status }}
      columns={[
        { key: "no", label: t("No"), render: (r) => <span className="mono">{r.no}</span>, sort: (r) => r.no },
        { key: "kind", label: t("Tür"), render: (r) => t(KIND[r.kind] ?? r.kind) },
        { key: "body", label: t("Özet"), render: (r) => <span style={{ display: "block", maxWidth: 420, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.body}</span> },
        { key: "status", label: t("Durum"), render: (r) => <StatusPill tone={TONE[r.status] ?? "neutral"}>{t(LABEL[r.status] ?? r.status)}</StatusPill>, sort: (r) => r.status },
        { key: "at", label: t("Tarih"), render: (r) => new Date(r.createdAt).toLocaleDateString(t.intl), sort: (r) => r.createdAt },
      ]}
      detail={{ title: (r) => `${r.no} · ${t(KIND[r.kind] ?? r.kind)}`, render: (r) => <Detail row={r} /> }}
      empty={t("Sorun bildirimi yok.")}
    />
  );
}
