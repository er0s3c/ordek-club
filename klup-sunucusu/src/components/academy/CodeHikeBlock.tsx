// Ders metnindeki kod blokları (sunucu bileşeni): Code Hike ile renklendirme ve yorum içi açıklamalar.
//   // !mark          → sonraki satırı vurgular       // !mark(1:3) → 1–3. satırlar
//   // !diff +  / -   → eklenen / çıkarılan satır      // !callout[/parola/] Açıklama → kelimeye bağlı not
// İçerik metin olarak işlenir; HTML yorumlanmaz.
import { highlight, Pre, InnerLine, type AnnotationHandler, type BlockAnnotation, type InlineAnnotation, type RawCode } from "codehike/code";

const mark: AnnotationHandler = {
  name: "mark",
  Line: ({ annotation, ...props }) => <div className={annotation ? "ch-line is-mark" : "ch-line"}><InnerLine merge={props} /></div>,
};

const diff: AnnotationHandler = {
  name: "diff",
  onlyIfAnnotated: true,
  transform: (a: BlockAnnotation) => [{ ...a, name: "mark" }, a],
  Line: ({ annotation, ...props }) => (
    <div className={annotation?.query === "-" ? "ch-line is-del" : annotation?.query === "+" ? "ch-line is-add" : "ch-line"}>
      <span className="ch-diff" aria-hidden>{annotation?.query ?? " "}</span>
      <InnerLine merge={props} />
    </div>
  ),
};

const callout: AnnotationHandler = {
  name: "callout",
  transform: (a: InlineAnnotation) => ({ ...a, fromLineNumber: a.lineNumber, toLineNumber: a.lineNumber, data: { ...a.data, column: (a.fromColumn + a.toColumn) / 2 } }),
  AnnotatedLine: ({ annotation, ...props }) => (
    <>
      <InnerLine merge={props} />
      <div className="ch-callout" style={{ marginLeft: `${Math.max(0, (annotation.data?.column as number ?? 0) - 2)}ch` }}>{annotation.query}</div>
    </>
  ),
};

export async function CodeHikeBlock({ code, lang }: { code: string; lang: string }) {
  const raw: RawCode = { value: code, lang: lang || "text", meta: "" };
  try {
    const highlighted = await highlight(raw, "github-dark", { annotationPrefix: "!" });
    return <Pre code={highlighted} handlers={[mark, diff, callout]} className="md-code ch-code" data-lang={lang || undefined} />;
  } catch {
    // Bilinmeyen dil vb.: düz kod kutusu
    return <pre className="md-code" data-lang={lang || undefined}><code>{code}</code></pre>;
  }
}
