// Sınıf yönetimi ekranlarının ortak etiketleri.
export const KIND_LABEL: Record<string, string> = {
  TEXT: "Metin cevabı",
  SHORT_ANSWER: "Kısa cevap",
  FILE: "Dosya teslimi",
  PCAP: "PCAP analizi",
  LOG: "Log analizi",
  OSINT: "OSINT (laboratuvar)",
  CODE_REVIEW: "Kod inceleme",
  VMWARE: "VMware uygulaması",
};

export const DIFFICULTY_LABEL: Record<string, string> = { EASY: "Kolay", MEDIUM: "Orta", HARD: "Zor" };

export const ASSIGNMENT_STATUS: Record<string, { label: string; cls: string }> = {
  DRAFT: { label: "Taslak", cls: "badge badge-amber" },
  PUBLISHED: { label: "Yayında", cls: "badge badge-lime" },
  CLOSED: { label: "Kapalı", cls: "badge" },
};

export const SUBMISSION_STATUS: Record<string, { label: string; cls: string }> = {
  SUBMITTED: { label: "Değerlendirme bekliyor", cls: "badge badge-amber" },
  RETURNED: { label: "Düzeltme istendi", cls: "badge badge-red" },
  APPROVED: { label: "Onaylandı", cls: "badge badge-ok" },
  REJECTED: { label: "Reddedildi", cls: "badge badge-red" },
};

export const SCOPE_LABEL: Record<string, string> = { CLUB: "Tüm kulüp", USERS: "Seçili üyeler", ASSIGNMENT: "Görev eki", SUBMISSION: "Teslim" };

// files/store.ts ALLOWED_EXTENSIONS ile aynı tutulmalı (sunucu yine de içeriği doğrular).
export const FILE_ACCEPT = ".pdf,.png,.jpg,.jpeg,.webp,.zip,.pcap,.pcapng,.cap,.txt,.md,.csv,.log,.json,.jsonl,.yaml,.yml,.xml,.ini,.conf,.toml,.yar,.yara,.rules,.py,.js,.ts,.c,.h,.cpp,.hpp,.java,.go,.rs,.rb,.php,.sh,.ps1,.sql,.asm";
