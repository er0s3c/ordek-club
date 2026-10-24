// VMware uygulama molası: eğitmen practical slaytına ilk geçtiğinde o slayta bağlı bir görev oluşur.
// Öğrenciler canlı ekrandan teslim eder; değerlendirme normal görev akışıyla (onayda XP) yapılır.
import { db } from "@/server/db";
import type { Block } from "@/lib/deck-schema";

export type PracticalBlock = Extract<Block, { type: "practical" }>;

function describe(b: PracticalBlock) {
  const parts = [b.description.trim()];
  if (b.steps.length) parts.push(["Adımlar:", ...b.steps.map((s, i) => `${i + 1}. ${s}`)].join("\n"));
  if (b.files.length) parts.push(["Gerekli dosyalar:", ...b.files.map((f) => `- ${f}`)].join("\n"));
  parts.push("Not: Uygulama eğitmenin laboratuvar ortamında yapılır; sistem VM'leri başlatmaz veya yönetmez.");
  return parts.filter(Boolean).join("\n\n");
}

// Aynı oturum + slayt için tek görev (eşzamanlı çağrılarda da): (liveSessionId, slideId) benzersiz.
export async function ensurePracticalAssignment(sessionId: string, slideId: string, block: PracticalBlock, hostId: string | null) {
  const existing = await db.assignment.findUnique({ where: { liveSessionId_slideId: { liveSessionId: sessionId, slideId } }, select: { id: true, dueAt: true } });
  if (existing) return { assignmentId: existing.id, dueAt: existing.dueAt?.getTime() ?? Date.now() };
  const dueAt = new Date(Date.now() + block.durationMin * 60_000);
  const a = await db.assignment.upsert({
    where: { liveSessionId_slideId: { liveSessionId: sessionId, slideId } },
    update: {},
    create: {
      title: `Uygulama: ${block.title}`,
      description: describe(block),
      kind: "VMWARE",
      status: "PUBLISHED",
      audience: "ALL",
      dueAt,
      allowLate: true, // geç teslim kabul edilir ama işaretlenir
      requireText: true,
      xpRuleKey: "task.approved",
      createdById: hostId,
      liveSessionId: sessionId,
      slideId,
    },
    select: { id: true, dueAt: true },
  });
  return { assignmentId: a.id, dueAt: a.dueAt?.getTime() ?? dueAt.getTime() };
}
