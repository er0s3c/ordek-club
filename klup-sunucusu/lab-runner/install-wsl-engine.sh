#!/usr/bin/env bash
# Local WSL development only: a separate daemon/socket; Docker Desktop is untouched.
# Production: use a maintained Docker Engine + runsc on a dedicated Linux host.
set -euo pipefail
[ "$(id -u)" = 0 ] || { echo 'Root gerekli.' >&2; exit 1; }
grep -qi microsoft /proc/sys/kernel/osrelease || { echo 'Bu yardımcı yalnız WSL geliştirme ortamı içindir.' >&2; exit 1; }
[ ! -e /etc/systemd/system/ordek-lab-docker.service ] || { echo 'Ayrı lab motoru zaten kurulu; üzerine yazılmadı.' >&2; exit 1; }
getent group docker >/dev/null || { echo 'docker grubu bulunamadı.' >&2; exit 1; }
case "$(uname -m)" in x86_64) arch=x86_64 ;; aarch64) arch=aarch64 ;; *) exit 1 ;; esac
cd "$(dirname "$0")/.."
mkdir -p storage/lab-runtime-downloads
cd storage/lab-runtime-downloads
apt-get update -qq
apt-get install -y --no-install-recommends iptables ca-certificates curl bzip2
curl --fail --location --proto '=https' --tlsv1.2 --retry 2 --max-time 300 \
  "https://download.docker.com/linux/static/stable/$arch/docker-29.8.0.tgz" -o docker.tgz
url="https://storage.googleapis.com/gvisor/releases/release/latest/$arch"
curl --fail --location --proto '=https' --tlsv1.2 --retry 2 --max-time 300 "$url/gvisor.tar.bz2" -o gvisor.tar.bz2
curl --fail --location --proto '=https' --tlsv1.2 --retry 2 --max-time 60 "$url/gvisor.tar.bz2.sha512" -o gvisor.tar.bz2.sha512
sha512sum -c gvisor.tar.bz2.sha512
sha256sum docker.tgz > docker.tgz.sha256
install -d -m 0755 /opt/ordek-lab-runtime/docker /opt/ordek-lab-runtime/gvisor /etc/ordek-lab
tar xzf docker.tgz -C /opt/ordek-lab-runtime/docker --strip-components=1
tar xjf gvisor.tar.bz2 -C /opt/ordek-lab-runtime/gvisor
test -x /opt/ordek-lab-runtime/gvisor/runsc
cat > /etc/ordek-lab/docker.json <<'EOF'
{
  "hosts": ["unix:///run/ordek-lab/docker.sock"],
  "group": "docker",
  "data-root": "/var/lib/ordek-lab-docker",
  "exec-root": "/run/ordek-lab/exec",
  "pidfile": "/run/ordek-lab/docker.pid",
  "bip": "10.245.255.1/24",
  "default-address-pools": [{"base":"10.244.0.0/16","size":24}],
  "features": {"containerd-snapshotter":false},
  "runtimes": {"runsc":{"path":"/opt/ordek-lab-runtime/gvisor/runsc","runtimeArgs":["--platform=systrap"]}},
  "log-driver":"local"
}
EOF
cat > /etc/systemd/system/ordek-lab-docker.service <<'EOF'
[Unit]
Description=Ordek isolated local lab Docker engine
After=network-online.target
Wants=network-online.target
[Service]
Type=notify
Group=docker
Environment=PATH=/opt/ordek-lab-runtime/docker:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
ExecStart=/opt/ordek-lab-runtime/docker/dockerd --config-file=/etc/ordek-lab/docker.json
RuntimeDirectory=ordek-lab
RuntimeDirectoryMode=0750
Restart=on-failure
RestartSec=5
TimeoutStartSec=90
TimeoutStopSec=120
Delegate=yes
KillMode=process
[Install]
WantedBy=multi-user.target
EOF
systemctl daemon-reload
systemctl enable --now ordek-lab-docker.service
echo 'Ayrı WSL lab motoru hazır. DOCKER_HOST=unix:///run/ordek-lab/docker.sock kullanın.'
