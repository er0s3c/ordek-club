// Denetim kaydı eylem kodlarının Türkçe karşılıkları (bilinmeyen kod olduğu gibi gösterilir).
const LABELS: Record<string, string> = {
  "setup.complete": "Kurulum tamamlandı",
  "auth.login": "Giriş yapıldı",
  "auth.login.failed": "Başarısız giriş denemesi",
  "auth.logout": "Çıkış yapıldı",
  "auth.password.change": "Parola değiştirildi",
  "member.register.active": "Yeni üye kaydı (aktif)",
  "member.register.pending": "Yeni üyelik başvurusu",
  "member.approve": "Üyelik onaylandı",
  "member.reject": "Üyelik reddedildi",
  "member.disable": "Hesap devre dışı bırakıldı",
  "member.enable": "Hesap yeniden etkinleştirildi",
  "member.role": "Rol değiştirildi",
  "invitation.create": "Davet kodu oluşturuldu",
  "invitation.revoke": "Davet kodu iptal edildi",
  "settings.update": "Kulüp ayarları güncellendi",
  "settings.logo.update": "Logo güncellendi",
  "settings.logo.remove": "Logo kaldırıldı",
};

export const actionLabel = (code: string) => LABELS[code] ?? code;
export const AUDIT_ACTION_PREFIXES = ["auth", "member", "invitation", "settings", "setup"];
