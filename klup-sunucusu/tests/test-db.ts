// Entegrasyon testleri AYRI bir veritabanında çalışır (ordek_club_test); geliştirme verisine dokunmaz.
export const TEST_DATABASE_URL =
  process.env.TEST_DATABASE_URL ?? "postgresql://club:change-me-local-dev-only@localhost:5433/ordek_club_test?schema=public";
