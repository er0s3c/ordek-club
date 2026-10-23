import { Download, FileText } from "lucide-react";
import { formatBytes } from "@/components/ui/format";

// Dosya bağlantıları her zaman yetki kontrollü indirme rotasına gider.
export function FileList({ files, empty = "Dosya yok." }: { files: { id: string; name: string; size: number }[]; empty?: string }) {
  if (!files.length) return <p className="small muted" style={{ margin: 0 }}>{empty}</p>;
  return (
    <ul className="list-tight">
      {files.map((f) => (
        <li key={f.id}>
          <FileText size={15} aria-hidden />
          <span style={{ flex: 1, minWidth: 0, overflowWrap: "anywhere" }}>{f.name}</span>
          <span className="tiny faint mono">{formatBytes(f.size)}</span>
          <a className="btn btn-sm btn-ghost" href={`/api/files/${f.id}`} download aria-label={`${f.name} indir`}><Download size={14} aria-hidden /></a>
        </li>
      ))}
    </ul>
  );
}
