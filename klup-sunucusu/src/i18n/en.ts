import type { Messages } from "./tr";

type DeepPartial<T> = { [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K] };

// İngilizce çeviri iskeleti — kapsam büyüdükçe doldurulacak; eksik anahtarlar Türkçeye düşer.
export const en: DeepPartial<Messages> = {
  common: { save: "Save", cancel: "Cancel", loading: "Loading…", search: "Search", all: "All" },
  nav: { home: "Home", academy: "Academy", leaderboard: "Leaderboard", profile: "My profile", xp: "XP & levels", badges: "Badges", account: "My account", admin: "Admin", members: "Members", logout: "Sign out" },
  roles: { OWNER: "Owner", ADMIN: "Admin", INSTRUCTOR: "Instructor", STUDENT: "Student" },
  statuses: { PENDING: "Pending", ACTIVE: "Active", REJECTED: "Rejected", DISABLED: "Disabled" },
  auth: { loginTitle: "Sign in", loginButton: "Sign in", password: "Password", registerTitle: "Join the club" },
};
