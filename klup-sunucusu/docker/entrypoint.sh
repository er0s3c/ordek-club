#!/bin/sh
# Konteyner başlangıcı: veritabanını bekle → migration'ları uygula → sunucuyu başlat.
set -eu

echo "[club] veritabanı bekleniyor…"
i=0
until node -e "const{PrismaClient}=require('@prisma/client');const p=new PrismaClient();p.\$queryRaw\`SELECT 1\`.then(()=>process.exit(0)).catch(()=>process.exit(1))" 2>/dev/null; do
  i=$((i + 1))
  if [ "$i" -ge 60 ]; then
    echo "[club] HATA: PostgreSQL'e 60 saniyede bağlanılamadı. DATABASE_URL / db servisini kontrol edin." >&2
    exit 1
  fi
  sleep 1
done

echo "[club] migration'lar uygulanıyor…"
node node_modules/prisma/build/index.js migrate deploy

exec "$@"
