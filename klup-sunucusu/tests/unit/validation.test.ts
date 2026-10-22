import { describe, expect, it } from "vitest";
import { invitationCodeSchema, registerSchema, setupSchema, settingsUpdateSchema } from "@/lib/validation";

const base = { username: "Ali.Veli", email: " Ali@Ornek.EDU.tr ", displayName: "  Ali Veli ", password: "uzun-guvenli-parola" };

describe("doğrulama şemaları", () => {
  it("kullanıcı adı ve e-postayı normalize eder", () => {
    const r = registerSchema.parse(base);
    expect(r.username).toBe("ali.veli");
    expect(r.email).toBe("ali@ornek.edu.tr");
    expect(r.displayName).toBe("Ali Veli");
    expect(r.invitationCode).toBeUndefined();
  });

  it("tehlikeli/uygunsuz kullanıcı adlarını reddeder", () => {
    for (const username of ["ab", "../admin", "a b c", "<script>", "ali--", "-ali", "x".repeat(33)]) {
      expect(registerSchema.safeParse({ ...base, username }).success, username).toBe(false);
    }
  });

  it("görünen addaki kontrol ve yön karakterlerini temizler", () => {
    const r = registerSchema.parse({ ...base, displayName: "Ali‮ileV\u0000" });
    expect(r.displayName).toBe("AliileV");
  });

  it("davet kodunu biçimden bağımsız normalize eder", () => {
    expect(invitationCodeSchema.parse(" abcd-efgh-jkmn ")).toBe("ABCDEFGHJKMN");
    expect(invitationCodeSchema.safeParse("abc").success).toBe(false);
  });

  it("ilave (beklenmeyen) alanlar sonuca taşınmaz — mass assignment'a karşı", () => {
    const r = registerSchema.parse({ ...base, role: "OWNER", status: "ACTIVE" }) as Record<string, unknown>;
    expect(r.role).toBeUndefined();
    expect(r.status).toBeUndefined();
  });

  it("kurulum: URL ve saat dilimi doğrulanır", () => {
    const ok = {
      token: "ABCDEFGH-ABCDEFGH",
      club: { clubName: "Kulüp", appUrl: "https://club.example.edu/", timezone: "Europe/Istanbul" },
      owner: { ...base },
    };
    expect(setupSchema.parse(ok).club.appUrl).toBe("https://club.example.edu");
    expect(setupSchema.safeParse({ ...ok, club: { ...ok.club, appUrl: "javascript:alert(1)" } }).success).toBe(false);
    expect(setupSchema.safeParse({ ...ok, club: { ...ok.club, timezone: "Mars/Olympus" } }).success).toBe(false);
  });

  it("ayar aralıkları sınırlıdır", () => {
    expect(settingsUpdateSchema.safeParse({ sessionMaxAgeDays: 0 }).success).toBe(false);
    expect(settingsUpdateSchema.safeParse({ maxUploadMb: 9999 }).success).toBe(false);
    expect(settingsUpdateSchema.safeParse({ registrationPolicy: "EVERYONE_ADMIN" }).success).toBe(false);
    expect(settingsUpdateSchema.parse({ sessionIdleHours: 24 })).toEqual({ sessionIdleHours: 24 });
  });
});
