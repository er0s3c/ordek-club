"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { RefreshCw } from "lucide-react";
import { useToast } from "@/components/providers";
import { api, ApiError } from "@/lib/api-client";
import { useT } from "@/i18n/client";

type Summary = { tracks: number; lessons: number; created: number; updated: number; unchanged: number; archived: number; problems: string[]; applied: boolean };

export function ImportButton() {
  const t = useT();
  const router = useRouter();
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const [problems, setProblems] = useState<string[]>([]);

  async function run() {
    setBusy(true);
    setProblems([]);
    try {
      const s = await api<Summary>("/api/admin/academy", { method: "POST" });
      toast("ok", t("{lessons} ders: {created} yeni, {updated} güncellenen, {archived} arşivlenen.", { lessons: s.lessons, created: s.created, updated: s.updated, archived: s.archived }));
      router.refresh();
    } catch (e) {
      toast("error", (e as Error).message);
      // 422: içerik hatalı, hiçbir şey uygulanmadı; sorunlar fields içinde gelir
      if (e instanceof ApiError && e.status === 422) setProblems(Object.values(e.fields));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="stack-sm">
      <div>
        <button className="btn btn-primary" onClick={run} disabled={busy}>
          {busy ? <span className="spinner" aria-hidden /> : <RefreshCw size={16} aria-hidden />}{" "}{t("İçeriği şimdi içe aktar")}
        </button>
      </div>
      {problems.length > 0 && (
        <div className="alert alert-error small" role="alert">
          <ul className="md-list" style={{ margin: 0 }}>{problems.map((p, i) => <li key={i}>{p}</li>)}</ul>
        </div>
      )}
    </div>
  );
}
