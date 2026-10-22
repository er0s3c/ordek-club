#!/usr/bin/env bash
# ============================================================================
#  Ördek Club — yönetim komutları
#    ./scripts/club.sh <komut>
# ============================================================================
set -euo pipefail
cd "$(dirname "$0")/.."
export MSYS_NO_PATHCONV=1 # Windows Git Bash: konteyner yollarını (/app/...) dönüştürme

BACKUP_DIR=${BACKUP_DIR:-./backups}
dc() { docker compose "$@"; }
ts() { date +%Y%m%d-%H%M%S; }
green() { printf '\033[1;32m%s\033[0m\n' "$*"; }
red() { printf '\033[1;31m%s\033[0m\n' "$*" >&2; }
need_env() { [ -f .env ] || { red ".env yok. Önce ./install.sh çalıştırın."; exit 1; }; }
envval() { grep "^$1=" .env | cut -d= -f2-; }

cmd_help() {
  cat <<'EOF'
Kullanım: ./scripts/club.sh <komut>

  status            Servislerin ve uygulamanın durumu
  logs [servis]     Canlı loglar (varsayılan: app)
  start | stop | restart
  setup-token       İlk kurulum anahtarını göster (gerekirse yenisini üret)
  backup            Veritabanı + dosya deposunu backups/ altına yedekle
  restore <db.dump> [storage.tar.gz]
                    Yedekten geri yükle (MEVCUT VERİNİN ÜZERİNE YAZAR)
  update            Kodu güncelle (git pull), yedekle, yeniden derle, başlat
  revoke-sessions   Tüm kullanıcı oturumlarını sonlandır (güvenlik olayı sonrası)
EOF
}

cmd_status() {
  need_env
  dc ps
  echo
  dc exec -T app node dist/cli.js status || red "Uygulama yanıt vermiyor."
  curl -fsS "http://127.0.0.1:$(envval APP_PORT)/api/health" 2>/dev/null && echo || true
}

cmd_logs() { dc logs -f --tail=200 "${1:-app}"; }
cmd_start() { need_env; dc up -d --wait; }
cmd_stop() { dc stop; }
cmd_restart() { need_env; dc restart app; }

cmd_setup_token() {
  need_env
  local t
  t=$(dc exec -T app sh -c 'cat /app/storage/setup-token.txt 2>/dev/null' || true)
  if [ -n "$t" ]; then echo "Kurulum anahtarı: $t"; else dc exec -T app node dist/cli.js setup-token; fi
}

cmd_backup() {
  need_env
  mkdir -p "$BACKUP_DIR"
  chmod 700 "$BACKUP_DIR"
  local stamp db st
  stamp=$(ts)
  db="$BACKUP_DIR/club-db-$stamp.dump"
  st="$BACKUP_DIR/club-storage-$stamp.tar.gz"
  green "▶ Veritabanı yedekleniyor → $db"
  dc exec -T db sh -c 'pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Fc' > "$db"
  green "▶ Dosya deposu yedekleniyor → $st"
  dc exec -T app tar -C /app/storage -czf - . > "$st"
  chmod 600 "$db" "$st"
  [ -s "$db" ] || { red "Veritabanı yedeği boş!"; exit 1; }
  green "✔ Yedek tamam. .env dosyasını da (sırlar) güvenli bir yere kopyalayın."
  ls -lh "$db" "$st"
}

cmd_restore() {
  need_env
  local db=${1:-} st=${2:-}
  [ -f "$db" ] || { red "Kullanım: restore <db.dump> [storage.tar.gz]"; exit 1; }
  read -r -p "Mevcut veritabanı '$db' ile DEĞİŞTİRİLECEK. Devam için 'evet' yazın: " ok
  [ "$ok" = "evet" ] || { echo "İptal edildi."; exit 1; }
  dc stop app
  green "▶ Veritabanı geri yükleniyor…"
  dc exec -T db sh -c 'pg_restore -U "$POSTGRES_USER" -d "$POSTGRES_DB" --clean --if-exists --no-owner' < "$db"
  if [ -n "$st" ]; then
    [ -f "$st" ] || { red "Dosya yok: $st"; exit 1; }
    green "▶ Dosya deposu geri yükleniyor…"
    dc run --rm --no-deps -T --entrypoint sh app -c 'find /app/storage -mindepth 1 -delete && tar -C /app/storage -xzf -' < "$st"
  fi
  dc up -d --wait
  green "✔ Geri yükleme tamam."
}

cmd_update() {
  need_env
  if [ -d ../.git ] || [ -d .git ]; then
    green "▶ Kod güncelleniyor (git pull)…"
    git pull --ff-only
  fi
  cmd_backup
  green "▶ Yeniden derleniyor; migration'lar başlangıçta otomatik uygulanır…"
  dc up -d --build --wait
  green "✔ Güncelleme tamam."
}

cmd_revoke_sessions() { need_env; dc exec -T app node dist/cli.js revoke-sessions; }

case "${1:-help}" in
  status) cmd_status ;;
  logs) shift; cmd_logs "${1:-}" ;;
  start) cmd_start ;;
  stop) cmd_stop ;;
  restart) cmd_restart ;;
  setup-token) cmd_setup_token ;;
  backup) cmd_backup ;;
  restore) shift; cmd_restore "$@" ;;
  update) cmd_update ;;
  revoke-sessions) cmd_revoke_sessions ;;
  help|-h|--help) cmd_help ;;
  *) red "Bilinmeyen komut: $1"; cmd_help; exit 1 ;;
esac
