import type { LessonKind } from "@prisma/client";

export const KIND_LABEL: Record<LessonKind, string> = { INFO: "Bilgi", LESSON: "Ders", PRACTICE: "Uygulama", QUIZ: "Quiz" };
export const KIND_BADGE: Record<LessonKind, string> = { INFO: "badge", LESSON: "badge badge-blue", PRACTICE: "badge badge-gold", QUIZ: "badge badge-violet" };
