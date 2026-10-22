# syntax=docker/dockerfile:1
# ============================================================================
#  Ördek Club — üretim imajı
#  Çok aşamalı: bağımlılık → derleme → küçük çalışma imajı (root olmayan kullanıcı).
#  Bu imaj YALNIZCA Club sunucusunu içerir: docker.sock yok, lab hedefi yok.
# ============================================================================
ARG NODE_VERSION=22-bookworm-slim

FROM node:${NODE_VERSION} AS deps
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates && rm -rf /var/lib/apt/lists/*
COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN npm ci --no-audit --no-fund

FROM deps AS build
WORKDIR /app
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build && npm prune --omit=dev --no-audit --no-fund

FROM node:${NODE_VERSION} AS runtime
WORKDIR /app
RUN apt-get update && apt-get install -y --no-install-recommends openssl ca-certificates tini && rm -rf /var/lib/apt/lists/* \
  && mkdir -p /app/storage /app/.next/cache && chown -R node:node /app/storage /app/.next
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3100 \
    HOST=0.0.0.0 \
    STORAGE_DIR=/app/storage \
    ACADEMY_DIR=/app/content/academy
COPY --from=build --chown=root:root /app/package.json ./package.json
COPY --from=build --chown=root:root /app/node_modules ./node_modules
COPY --from=build --chown=root:root /app/.next ./.next
COPY --from=build --chown=root:root /app/dist ./dist
COPY --from=build --chown=root:root /app/prisma ./prisma
COPY --from=build --chown=root:root /app/public ./public
COPY --from=build --chown=root:root /app/next.config.ts ./next.config.ts
# Akademi içeriği (Markdown + görseller): başlangıçta veritabanına aktarılır, salt okunur
COPY --from=build --chown=root:root /app/content/academy ./content/academy
COPY --chown=root:root docker/entrypoint.sh /usr/local/bin/club-entrypoint
RUN chmod 0755 /usr/local/bin/club-entrypoint && chown -R node:node /app/.next/cache

USER node
EXPOSE 3100
HEALTHCHECK --interval=15s --timeout=5s --start-period=40s --retries=5 \
  CMD node -e "fetch('http://127.0.0.1:'+(process.env.PORT||3100)+'/api/health').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"
ENTRYPOINT ["/usr/bin/tini", "--", "club-entrypoint"]
CMD ["node", "dist/server.js"]
