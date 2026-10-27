"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import Link from "next/link";
import { Archive, BookmarkPlus, Copy, Download, Eye, EyeOff, FileUp, PenTool, Play } from "lucide-react";
import { useToast } from "@/components/providers";
import { api } from "@/lib/api-client";
import { useT } from "@/i18n/client";

export function PresentationActions({ id, status, canEdit, isTemplate, hasDraft }: { id: string; status: string; canEdit: boolean; isTemplate: boolean; hasDraft: boolean }) {
  const t = useT();
  const toast = useToast();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const file = useRef<HTMLInputElement>(null);

  async function run<T>(fn: () => Promise<T>, ok?: string): Promise<T | undefined> {
    setBusy(true);
    try {
      const r = await fn();
      if (ok) toast("ok", ok);
      return r;
    } catch (e) {
      toast("error", (e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  const enc = encodeURIComponent(id);

  return (
    <div className="console-controls">
      <button
        className="btn btn-primary"
        disabled={busy}
        onClick={async () => {
          const r = await run(() => api<{ id: string }>("/api/live", { body: { presentationId: id } }));
          if (r) router.push(`/teach/live/${r.id}`);
        }}
      >
        <Play size={16} aria-hidden />{" "}{t("Canlı dersi başlat")}
      </button>
      {canEdit && (
        <Link className="btn" href={`/teach/presentations/${enc}/studio`}>
          <PenTool size={16} aria-hidden />{" "}Club Studio{hasDraft ? t(" (yayınlanmamış taslak var)") : ""}
        </Link>
      )}
      {canEdit && (
        <button
          className="btn"
          disabled={busy}
          aria-pressed={isTemplate}
          title={t("Şablonlar listesinde diğer eğitmenlere (sunum yayındaysa) görünür")}
          onClick={async () => {
            await run(() => api(`/api/presentations/${enc}`, { method: "PATCH", body: { isTemplate: !isTemplate } }), isTemplate ? t("Şablonlardan çıkarıldı.") : t("Şablon olarak paylaşıldı."));
            router.refresh();
          }}
        >
          <BookmarkPlus size={16} aria-hidden /> {isTemplate ? t("Şablondan çıkar") : t("Şablon olarak paylaş")}
        </button>
      )}
      {canEdit && (
        <button
          className="btn"
          disabled={busy}
          onClick={async () => {
            const next = status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
            await run(() => api(`/api/presentations/${enc}`, { method: "PATCH", body: { status: next } }), next === "PUBLISHED" ? t("Yayınlandı: diğer eğitmenler de kullanabilir.") : t("Taslağa alındı."));
            router.refresh();
          }}
        >
          {status === "PUBLISHED" ? <><EyeOff size={16} aria-hidden />{" "}{t("Taslağa al")}</> : <><Eye size={16} aria-hidden />{" "}{t("Yayınla")}</>}
        </button>
      )}
      <a className="btn" href={`/api/presentations/${enc}/export`} download>
        <Download size={16} aria-hidden />{" "}{t("JSON dışa aktar")}
      </a>
      <button
        className="btn"
        disabled={busy}
        onClick={async () => {
          const r = await run(() => api<{ id: string }>(`/api/presentations/${enc}/duplicate`, { method: "POST" }), t("Kopya oluşturuldu."));
          if (r) router.push(`/teach/presentations/${r.id}`);
        }}
      >
        <Copy size={16} aria-hidden />{" "}{t("Kopyala")}
      </button>
      {canEdit && (
        <>
          <input
            ref={file}
            type="file"
            accept="application/json,.json"
            className="sr-only"
            tabIndex={-1}
            aria-hidden
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              let content: unknown;
              try {
                content = JSON.parse(await f.text());
              } catch {
                toast("error", t("Dosya geçerli bir JSON değil."));
                return;
              }
              await run(() => api(`/api/presentations/${enc}`, { method: "PATCH", body: { content } }), t("Yeni sürüm yüklendi."));
              if (file.current) file.current.value = "";
              router.refresh();
            }}
          />
          <button className="btn" disabled={busy} onClick={() => file.current?.click()}>
            <FileUp size={16} aria-hidden />{" "}{t("İçeriği değiştir")}
          </button>
          <button
            className="btn btn-danger"
            disabled={busy}
            onClick={async () => {
              if (!window.confirm(t("Sunum arşivlensin mi? Listeden kaldırılır; geçmiş ders özetleri korunur."))) return;
              const ok = await run(() => api(`/api/presentations/${enc}`, { method: "DELETE" }), t("Sunum arşivlendi."));
              if (ok !== undefined) router.push("/teach");
            }}
          >
            <Archive size={16} aria-hidden />{" "}{t("Arşivle")}
          </button>
        </>
      )}
    </div>
  );
}
