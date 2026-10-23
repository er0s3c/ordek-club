import { Award, BookOpen, Crown, Flame, Globe, GraduationCap, Key, Lock, Medal, Network, Search, Shield, Skull, Star, Target, Terminal, Trophy, Zap, type LucideIcon } from "lucide-react";

// Rozet simgeleri yalnız bu sabit listeden seçilir (BADGE_ICONS ile aynı anahtarlar).
const ICONS: Record<string, LucideIcon> = {
  award: Award, medal: Medal, trophy: Trophy, crown: Crown, flame: Flame, star: Star, shield: Shield, "book-open": BookOpen,
  "graduation-cap": GraduationCap, globe: Globe, network: Network, search: Search, target: Target, zap: Zap, key: Key, lock: Lock,
  skull: Skull, terminal: Terminal,
};

export function BadgeIcon({ icon, size = 22 }: { icon: string; size?: number }) {
  const Icon = ICONS[icon] ?? Award;
  return <Icon size={size} aria-hidden />;
}
