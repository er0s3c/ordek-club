// İstemci ve sunucu ortak doğrulama şemaları. Sunucu her zaman yeniden doğrular.
import { z } from "zod";

// Kontrol karakterlerini ve görünmez yön işaretlerini temizler (görüntü sahteciliğine karşı).
const clean = (s: string) => s.replace(/[\u0000-\u001f\u007f​-‏‪-‮⁦-⁩]/g, "").trim();

export const usernameSchema = z
  .string()
  .transform((s) => s.trim().toLowerCase())
  .pipe(
    z
      .string()
      .min(3, "Kullanıcı adı en az 3 karakter olmalı.")
      .max(32, "Kullanıcı adı en fazla 32 karakter olabilir.")
      .regex(/^[a-z0-9](?:[a-z0-9._-]*[a-z0-9])?$/, "Yalnızca küçük harf, rakam, nokta, alt çizgi ve tire kullan."),
  );

export const emailSchema = z
  .string()
  .transform((s) => s.trim().toLowerCase())
  .pipe(z.string().max(254, "E-posta çok uzun.").email("Geçerli bir e-posta adresi gir."));

export const displayNameSchema = z
  .string()
  .transform(clean)
  .pipe(z.string().min(2, "Ad en az 2 karakter olmalı.").max(60, "Ad en fazla 60 karakter olabilir."));

export const passwordSchema = z.string().min(1, "Parola gerekli.").max(128, "Parola en fazla 128 karakter olabilir.");

const optionalText = (max: number) =>
  z
    .string()
    .transform(clean)
    .pipe(z.string().max(max, `En fazla ${max} karakter.`))
    .optional()
    .transform((v) => (v ? v : undefined));

export const invitationCodeSchema = z
  .string()
  .transform((s) => s.toUpperCase().replace(/[^A-Z0-9]/g, ""))
  .pipe(z.string().min(8, "Davet kodu geçersiz.").max(32, "Davet kodu geçersiz."));

export const registerSchema = z.object({
  username: usernameSchema,
  email: emailSchema,
  displayName: displayNameSchema,
  password: passwordSchema,
  studentNumber: optionalText(32),
  department: optionalText(80),
  applicationNote: optionalText(500),
  invitationCode: z
    .string()
    .optional()
    .transform((v) => (v && v.trim() ? v : undefined))
    .pipe(invitationCodeSchema.optional()),
});
export type RegisterInput = z.input<typeof registerSchema>;

export const loginSchema = z.object({
  login: z.string().trim().toLowerCase().min(1, "Kullanıcı adı veya e-posta gerekli.").max(254),
  password: passwordSchema,
});

export const changePasswordSchema = z.object({
  currentPassword: passwordSchema,
  newPassword: passwordSchema,
});

export const ROLES = ["OWNER", "ADMIN", "INSTRUCTOR", "STUDENT"] as const;
export const REGISTRATION_POLICIES = ["OPEN", "APPROVAL", "INVITE_ONLY", "CLOSED"] as const;

// IANA saat dilimi doğrulaması (Intl ile).
export const timezoneSchema = z.string().refine((tz) => {
  try {
    new Intl.DateTimeFormat("en", { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}, "Geçersiz saat dilimi.");

export const appUrlSchema = z
  .string()
  .trim()
  .url("Geçerli bir URL gir (ör. https://club.ornek.edu.tr).")
  .refine((u) => /^https?:\/\//.test(u), "URL http:// veya https:// ile başlamalı.")
  .transform((u) => u.replace(/\/+$/, ""));

export const clubInfoSchema = z.object({
  clubName: z.string().transform(clean).pipe(z.string().min(2, "Kulüp adı gerekli.").max(80)),
  description: z.string().transform(clean).pipe(z.string().max(500)).default(""),
  universityName: z.string().transform(clean).pipe(z.string().max(120)).default(""),
  appUrl: appUrlSchema,
  timezone: timezoneSchema.default("Europe/Istanbul"),
  registrationPolicy: z.enum(REGISTRATION_POLICIES).default("APPROVAL"),
});

export const setupSchema = z.object({
  token: z.string().trim().min(10, "Kurulum anahtarı gerekli.").max(200),
  club: clubInfoSchema,
  owner: z.object({
    username: usernameSchema,
    email: emailSchema,
    displayName: displayNameSchema,
    password: passwordSchema,
  }),
});

export const settingsUpdateSchema = clubInfoSchema
  .extend({
    locale: z.enum(["tr", "en"]),
    maxUploadMb: z.number().int().min(1).max(500),
    storageQuotaMb: z.number().int().min(100).max(1_000_000),
    userQuotaMb: z.number().int().min(1).max(100_000),
    sessionMaxAgeDays: z.number().int().min(1).max(90),
    sessionIdleHours: z.number().int().min(1).max(24 * 30),
  })
  .partial();

export const memberActionSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("approve"), note: optionalText(300) }),
  z.object({ action: z.literal("reject"), note: optionalText(300) }),
  z.object({ action: z.literal("disable"), note: optionalText(300) }),
  z.object({ action: z.literal("enable") }),
  z.object({ action: z.literal("role"), role: z.enum(ROLES) }),
]);

export const invitationCreateSchema = z.object({
  label: z.string().transform(clean).pipe(z.string().min(1, "Etiket gerekli.").max(80)),
  role: z.enum(["ADMIN", "INSTRUCTOR", "STUDENT"]).default("STUDENT"),
  autoApprove: z.boolean().default(false),
  maxUses: z.number().int().min(1).max(10_000).nullable().default(null),
  expiresInDays: z.number().int().min(1).max(365).nullable().default(30),
});

export const memberListQuerySchema = z.object({
  q: z.string().trim().max(100).optional(),
  status: z.enum(["PENDING", "ACTIVE", "REJECTED", "DISABLED"]).optional(),
  role: z.enum(ROLES).optional(),
  page: z.coerce.number().int().min(1).max(10_000).default(1),
});
