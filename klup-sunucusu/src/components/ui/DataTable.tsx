"use client";
// Öğretmen tabloları: sabit başlık, arama, durum filtresi, satır işlemleri ve ayrıntı paneli.
// Veri sunucuda yetkiyle süzülmüş gelir; bu bileşen yalnız görünümü yönetir.
import { useMemo, useState, type ReactNode } from "react";
import { Search } from "lucide-react";
import { Drawer } from "./Drawer";
import { EmptyState } from "./states";
import { useT } from "@/i18n/client";

export type Column<T> = { key: string; label: string; render: (row: T) => ReactNode; num?: boolean; sort?: (row: T) => string | number };

export function DataTable<T extends { id: string }>({
  rows, columns, searchText, filters, actions, detail, empty, label,
}: {
  rows: T[];
  columns: Column<T>[];
  searchText?: (row: T) => string;
  filters?: { label: string; options: { value: string; label: string }[]; value: (row: T) => string };
  actions?: (row: T) => ReactNode;
  detail?: { title: (row: T) => string; render: (row: T) => ReactNode };
  empty?: string;
  label: string;
}) {
  const t = useT();
  empty ??= t("Kayıt yok.");
  const [q, setQ] = useState("");
  const [f, setF] = useState("");
  const [sort, setSort] = useState<{ key: string; dir: 1 | -1 } | null>(null);
  const [open, setOpen] = useState<T | null>(null);
  const shown = useMemo(() => {
    const needle = q.trim().toLocaleLowerCase("tr");
    let out = rows.filter((r) => (!needle || (searchText?.(r) ?? "").toLocaleLowerCase("tr").includes(needle)) && (!f || filters?.value(r) === f));
    const col = sort && columns.find((c) => c.key === sort.key);
    if (col?.sort) out = [...out].sort((a, b) => { const x = col.sort!(a), y = col.sort!(b); return (x < y ? -1 : x > y ? 1 : 0) * sort!.dir; });
    return out;
  }, [rows, q, f, sort, columns, searchText, filters]);
  return (
    <div className="dt">
      {(searchText || filters) && (
        <div className="dt-tools">
          {searchText && <label className="dt-search"><Search size={15} aria-hidden /><span className="sr-only">{t("Ara")}</span><input className="input" type="search" value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("Ara…")} /></label>}
          {filters && (
            <label className="dt-filter"><span className="sr-only">{filters.label}</span>
              <select className="select" value={f} onChange={(e) => setF(e.target.value)}>
                <option value="">{t("{label}: tümü", { label: filters.label })}</option>
                {filters.options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </label>
          )}
          <span className="tiny faint" role="status">{shown.length} / {rows.length}</span>
        </div>
      )}
      {shown.length === 0 ? <EmptyState title={empty} /> : (
        <div className="table-wrap dt-wrap">
          <table className="table dt-table" aria-label={label}>
            <thead>
              <tr>
                {columns.map((c) => (
                  <th key={c.key} className={c.num ? "num" : undefined} aria-sort={sort?.key === c.key ? (sort.dir === 1 ? "ascending" : "descending") : undefined}>
                    {c.sort ? <button type="button" className="dt-sort" onClick={() => setSort((s) => ({ key: c.key, dir: s?.key === c.key && s.dir === 1 ? -1 : 1 }))}>{c.label}</button> : c.label}
                  </th>
                ))}
                {(actions || detail) && <th><span className="sr-only">{t("İşlemler")}</span></th>}
              </tr>
            </thead>
            <tbody>
              {shown.map((r) => (
                <tr key={r.id}>
                  {columns.map((c) => <td key={c.key} className={c.num ? "num" : undefined}>{c.render(r)}</td>)}
                  {(actions || detail) && <td className="dt-actions">{actions?.(r)}{detail && <button type="button" className="btn btn-ghost btn-sm" onClick={() => setOpen(r)}>{t("Ayrıntı")}</button>}</td>}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {detail && <Drawer open={!!open} onClose={() => setOpen(null)} title={open ? detail.title(open) : ""}>{open && detail.render(open)}</Drawer>}
    </div>
  );
}
