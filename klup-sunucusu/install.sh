#!/usr/bin/env bash
# ============================================================================
#  Ördek Club — tek komutla kurulum (Linux sunucu)
#
#    ./install.sh                          # etkileşimli
#    ./install.sh --domain club.ornek.edu  # HTTPS (Caddy + Let's Encrypt)
#    ./install.sh --http --port 3100       # yalnızca HTTP (yerel ağ / deneme)
#
#  Yaptıkları: Docker kontrolü → güçlü rastgele sırlarla .env → imaj derleme →
#  PostgreSQL + uygulama başlatma (migration otomatik) → kurulum anahtarını gösterme.
# ============================================================================
set -euo pipefail
cd "$(dirname "$0")"

green() { printf '\033[1;32m%s\033[0m\n' "$*"; }
yellow() { printf '\033[1;33m%s\033[0m\n' "$*"; }
red() { printf '\033[1;31m%s\033[0m\n' "$*" >&2; }
die() { red "HATA: $*"; exit 1; }

DOMAIN=""
MODE=""
PORT=3100
while [ $# -gt 0 ]; do
  case "$1" in
    --domain) DOMAIN="${2:-}"; MODE=https; shift 2 ;;
    --http) MODE=http; shift ;;
    --port) PORT="${2:-3100}"; shift 2 ;;
    -h|--help) sed -n '2,12p' "$0"; exit 0 ;;
    *) die "Bilinmeyen seçenek: $1 (yardım: ./install.sh --help)" ;;
  esac
done

green "▶ Ördek Club kurulumu"

# ── 1. Ön koşullar ──────────────────────────────────────────────────────────
command -v docker >/dev/null 2>&1 || die "Docker bulunamadı. Kurulum: https://docs.docker.com/engine/install/"
docker compose version >/dev/null 2>&1 || die "Docker Compose v2 bulunamadı ('docker compose' komutu)."
docker info >/dev/null 2>&1 || die "Docker çalışmıyor ya da bu kullanıcının yetkisi yok (sudo ile deneyin veya kullanıcıyı 'docker' grubuna ekleyin)."

rand() { # URL-güvenli rastgele dize
  if command -v openssl >/dev/null 2>&1; then openssl rand -base64 "$1" | tr -d '\n=+/' | cut -c1-"$2"
  else head -c "$1" /dev/urandom | base64 | tr -d '\n=+/' | cut -c1-"$2"; fi
}

# ── 2. .env ─────────────────────────────────────────────────────────────────
if [ -f .env ]; then
  yellow "• Mevcut .env korunuyor (sırlar değiştirilmedi)."
else
  if [ -z "$MODE" ]; then
    if [ -t 0 ]; then
      read -r -p "Alan adı (HTTPS için, ör. club.ornek.edu.tr — boş bırakırsan yalnız HTTP): " DOMAIN
    fi
    MODE=$([ -n "$DOMAIN" ] && echo https || echo http)
  fi
  [ "$MODE" = https ] && [ -z "$DOMAIN" ] && die "--domain değeri gerekli."
  if [ "$MODE" = https ]; then
    APP_URL="https://$DOMAIN"; APP_BIND=127.0.0.1; TRUST_PROXY=1; PROFILES=https
  else
    HOST_IP=$( (hostname -I 2>/dev/null || true) | awk '{print $1}')
    APP_URL="http://${HOST_IP:-localhost}:$PORT"; APP_BIND=0.0.0.0; TRUST_PROXY=0; PROFILES=""
  fi
  umask 077
  cat > .env <<EOF
# install.sh tarafından $(date -u +%Y-%m-%dT%H:%MZ) üretildi. Bu dosyayı GİZLİ tutun ve yedekleyin.
APP_URL=$APP_URL
APP_PORT=$PORT
APP_BIND=$APP_BIND
TRUST_PROXY=$TRUST_PROXY
DOMAIN=$DOMAIN
COMPOSE_PROFILES=$PROFILES
POSTGRES_USER=club
POSTGRES_DB=ordek_club
POSTGRES_PASSWORD=$(rand 48 40)
APP_SECRET=$(rand 64 64)
EOF
  green "• .env oluşturuldu (izinler: 600). Adres: $APP_URL"
fi

# ── 3. Derle ve başlat ──────────────────────────────────────────────────────
green "▶ İmaj derleniyor ve servisler başlatılıyor (ilk seferde birkaç dakika sürebilir)…"
docker compose up -d --build --wait || die "Servisler sağlıklı başlamadı. Ayrıntı: ./scripts/club.sh logs"

# ── 4. Kurulum anahtarı ─────────────────────────────────────────────────────
APP_URL=$(grep '^APP_URL=' .env | cut -d= -f2-)
TOKEN=$(docker compose exec -T app sh -c 'cat /app/storage/setup-token.txt 2>/dev/null' || true)
echo
green "✔ Ördek Club çalışıyor: $APP_URL"
if [ -n "$TOKEN" ]; then
  echo
  echo "  Tarayıcıda $APP_URL/setup adresini açın ve şu kurulum anahtarını girin:"
  echo
  printf '      \033[1;32m%s\033[0m\n' "$TOKEN"
  echo
  echo "  (24 saat geçerli. Yeniden görmek için: ./scripts/club.sh setup-token)"
else
  echo "  Kurulum daha önce tamamlanmış. Giriş: $APP_URL/login"
fi
echo
echo "  Yönetim komutları: ./scripts/club.sh help"
