-- Uygulama mantığına ek olarak veritabanı düzeyinde değişmezler (savunma derinliği).
ALTER TABLE "ClubSettings" ADD CONSTRAINT "ClubSettings_singleton" CHECK ("id" = 1);
ALTER TABLE "ClubSettings" ADD CONSTRAINT "ClubSettings_ranges" CHECK (
  "maxUploadMb" BETWEEN 1 AND 500 AND "sessionMaxAgeDays" BETWEEN 1 AND 90 AND "sessionIdleHours" BETWEEN 1 AND 720
);
ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_counts" CHECK (
  "useCount" >= 0 AND ("maxUses" IS NULL OR ("maxUses" > 0 AND "useCount" <= "maxUses"))
);
ALTER TABLE "Invitation" ADD CONSTRAINT "Invitation_not_owner" CHECK ("role" <> 'OWNER');
