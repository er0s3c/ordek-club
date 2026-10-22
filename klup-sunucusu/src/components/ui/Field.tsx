import { useId, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from "react";

type Common = { label: string; hint?: ReactNode; error?: string };

function describe(fid: string, hint?: ReactNode, error?: string) {
  return [hint && !error ? `${fid}-hint` : null, error ? `${fid}-err` : null].filter(Boolean).join(" ") || undefined;
}

function Help({ fid, hint, error }: { fid: string; hint?: ReactNode; error?: string }) {
  return (
    <>
      {hint && !error && <span id={`${fid}-hint`} className="hint">{hint}</span>}
      {error && <span id={`${fid}-err`} className="err" role="alert">{error}</span>}
    </>
  );
}

// Etiket, ipucu ve hata metnini aria ile girdiye bağlayan erişilebilir alanlar.
export function Field({ label, hint, error, id, ...rest }: Common & InputHTMLAttributes<HTMLInputElement>) {
  const auto = useId();
  const fid = id ?? auto;
  return (
    <div className="field">
      <label htmlFor={fid}>{label}</label>
      <input id={fid} className="input" aria-invalid={error ? true : undefined} aria-describedby={describe(fid, hint, error)} {...rest} />
      <Help fid={fid} hint={hint} error={error} />
    </div>
  );
}

export function TextAreaField({ label, hint, error, id, ...rest }: Common & TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const auto = useId();
  const fid = id ?? auto;
  return (
    <div className="field">
      <label htmlFor={fid}>{label}</label>
      <textarea id={fid} className="textarea" aria-invalid={error ? true : undefined} aria-describedby={describe(fid, hint, error)} {...rest} />
      <Help fid={fid} hint={hint} error={error} />
    </div>
  );
}
