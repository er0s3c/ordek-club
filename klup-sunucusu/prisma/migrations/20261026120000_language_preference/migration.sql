-- Dil tercihi: "auto" tarayıcı/sistem diline göre seçer. Eski satırlardaki "tr" yalnızca
-- varsayılandı (öğrenci seçmemişti); bilinçli "en" seçimleri korunur.
ALTER TABLE "LearningPreference" ALTER COLUMN "locale" SET DEFAULT 'auto';
UPDATE "LearningPreference" SET "locale" = 'auto' WHERE "locale" <> 'en';
