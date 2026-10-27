# Ördek Club slayt dönüştürücü — LibreOffice headless (yalnız Impress) + Node.js.
# Üretimde taban imajı digest ile sabitleyin:  --build-arg BASE_IMAGE='node:22-bookworm-slim@sha256:...'
ARG BASE_IMAGE=node:22-bookworm-slim
FROM ${BASE_IMAGE}

# Yalnız sunum bileşeni (GUI'siz); önerilen paketler (Java, betik köprüleri) kurulmaz. Microsoft yazı tipleriyle
# ölçü uyumlu açık yazı tipleri (Carlito ≈ Calibri, Caladea ≈ Cambria, Liberation ≈ Arial/Times) slayt düzenini korur.
RUN set -eux; \
    apt-get update; \
    apt-get install -y --no-install-recommends \
      libreoffice-impress-nogui libreoffice-core-nogui \
      fonts-dejavu-core fonts-liberation2 fonts-crosextra-carlito fonts-crosextra-caladea; \
    rm -rf /var/lib/apt/lists/* /usr/share/doc /usr/share/man

WORKDIR /srv
COPY package.json policy.mjs server.mjs ./

# Root olmayan kullanıcı; kök dosya sistemi compose'da salt-okunur, yazılabilir tek yer /tmp (tmpfs).
USER node
ENV NODE_ENV=production PORT=8080 TMPDIR=/tmp SOFFICE=soffice
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s --retries=3 CMD ["node", "-e", "fetch('http://127.0.0.1:8080/health').then(r=>process.exit(r.ok?0:1),()=>process.exit(1))"]
CMD ["node", "server.mjs"]
