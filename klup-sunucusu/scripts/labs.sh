#!/usr/bin/env bash
# Linux lab host only. Does not alter Club's .env or enable the feature.
set -euo pipefail
cd "$(dirname "$0")/.."
export MSYS_NO_PATHCONV=1
dc() { docker compose --env-file .env.labs -f compose.lab.yaml "$@"; }
fail() { printf '%s\n' "$*" >&2; exit 1; }
runtime() {
  [ "$(uname -s)" = Linux ] || fail 'Ayrı Linux Docker hostu veya VM gerekir.'
  docker info --format '{{json .Runtimes}}' | grep -q '"runsc"' || fail 'Bu Docker motorunda runsc yok; standart konteynere geçiş yapılmadı.'
  [ "$(id -u)" = 1000 ] || fail 'Sertifika sahibi ve servis kullanıcısı için bu komutu UID 1000 ile çalıştırın.'
}
pin() {
  docker pull "$1" >&2
  local image
  image=$(docker image inspect "$1" --format '{{index .RepoDigests 0}}')
  [[ "$image" =~ @sha256:[a-f0-9]{64}$ ]] || fail 'İmaj digest doğrulanamadı.'
  printf '%s' "$image"
}
setup() {
  runtime
  local host=${1:-localhost} bind=${2:-127.0.0.1} socket=${DOCKER_HOST:-unix:///var/run/docker.sock}
  [[ "$host" =~ ^[a-zA-Z0-9]([a-zA-Z0-9.-]*[a-zA-Z0-9])?$ ]] || fail 'Sunucu adı IPv4 veya DNS adı olmalı.'
  [[ "$bind" =~ ^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$ ]] || fail 'Bağlama adresi IPv4 olmalı.'
  [[ "$socket" == unix:///* ]] || fail 'Bu komut lab hostunda yerel Unix Docker soketiyle çalıştırılmalı.'
  socket=${socket#unix://}
  [ -S "$socket" ] || fail 'Docker soketi bulunamadı.'
  [ ! -e .env.labs ] || fail '.env.labs zaten var; mevcut kurulumun üzerine yazılmadı.'
  [ ! -e storage/lab-pki ] || fail 'storage/lab-pki zaten var; mevcut sertifikalar korunuyor.'
  command -v openssl >/dev/null || fail 'openssl gerekli.'
  local node_image cli_image base_image image san
  node_image=$(pin node:22-bookworm-slim)
  cli_image=$(pin docker:29-cli)
  base_image=$(pin debian:bookworm-slim)
  docker build --network=host --build-arg "BASE_IMAGE=$base_image" -t ordek-linux-permissions:v1 lab-runner/images/linux-permissions
  image=$(docker image inspect ordek-linux-permissions:v1 --format '{{.Id}}')
  [[ "$image" =~ ^sha256:[a-f0-9]{64}$ ]] || fail 'Öğrenci imajı doğrulanamadı.'
  umask 077
  mkdir -p storage
  mkdir storage/lab-pki
  local pki="$PWD/storage/lab-pki"
  openssl req -x509 -newkey rsa:3072 -nodes -sha256 -days 1825 -subj '/CN=Ordek Lab Dedicated CA' \
    -addext 'basicConstraints=critical,CA:TRUE,pathlen:0' -addext 'keyUsage=critical,keyCertSign,cRLSign' \
    -keyout "$pki/ca-key.pem" -out "$pki/ca.pem" 2>/dev/null
  san='DNS:localhost,DNS:lab-runner,DNS:host.docker.internal,IP:127.0.0.1'
  if [[ "$host" =~ ^[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+$ ]]; then san="$san,IP:$host"; else san="$san,DNS:$host"; fi
  for name in server club-client probe; do
    local usage=clientAuth
    [ "$name" != server ] || usage=serverAuth
    printf 'basicConstraints=critical,CA:FALSE\nkeyUsage=critical,digitalSignature,keyEncipherment\nextendedKeyUsage=%s\n' "$usage" > "$pki/$name.ext"
    [ "$name" != server ] || printf 'subjectAltName=%s\n' "$san" >> "$pki/$name.ext"
    openssl req -new -newkey rsa:3072 -nodes -subj "/CN=ordek-lab-$name" -keyout "$pki/$name-key.pem" -out "$pki/$name.csr" 2>/dev/null
    openssl x509 -req -in "$pki/$name.csr" -CA "$pki/ca.pem" -CAkey "$pki/ca-key.pem" -set_serial "0x$(openssl rand -hex 16)" \
      -days 365 -sha256 -extfile "$pki/$name.ext" -out "$pki/$name.pem" 2>/dev/null
    openssl verify -CAfile "$pki/ca.pem" "$pki/$name.pem"
  done
  cat > .env.labs <<EOF
RUNNER_NODE_IMAGE=$node_image
DOCKER_CLI_IMAGE=$cli_image
LAB_IMAGE=$image
LAB_DOCKER_SOCKET=$socket
LAB_DOCKER_GID=$(stat -c %g "$socket")
LAB_BIND_IP=$bind
EOF
  cat > storage/lab-pki/club.env.example <<EOF
CLUB_LAB_URL=https://$host:9443
CLUB_LAB_CA=$pki/ca.pem
CLUB_LAB_CERT=$pki/club-client.pem
CLUB_LAB_KEY=$pki/club-client-key.pem
EOF
  printf '%s\n' 'Docker lab yapılandırması ve sertifikalar hazır. bash scripts/labs.sh up ile başlatın.' \
    'Club hostuna yalnız ca.pem, club-client.pem, club-client-key.pem aktarılır. CA özel anahtarını aktarmazsınız.'
}
case "${1:-help}" in
  setup) shift; setup "$@" ;;
  up) runtime; dc up -d --build --wait ;;
  status) dc ps ;;
  logs) dc logs --tail=100 lab-runner ;;
  stop) dc stop lab-runner ;;
  check) dc exec -T lab-runner node healthcheck.mjs ;;
  *) printf '%s\n' 'bash scripts/labs.sh setup <sertifika-DNS-veya-IP> [özel-bağlama-IP]' 'bash scripts/labs.sh up|status|logs|stop|check' ;;
esac
