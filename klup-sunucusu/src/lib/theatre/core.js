// @theatre/core'un tip tanımları global Object.entries'i değiştirdiği için modül bu ince kabukla, elle yazılmış
// sınırlı tiplerle (core.d.ts) kullanılır. Çalışma zamanında doğrudan paketi yeniden dışa aktarır.
export { getProject, types, onChange, val } from "@theatre/core";
