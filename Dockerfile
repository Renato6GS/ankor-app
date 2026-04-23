# syntax=docker/dockerfile:1

# ============================================================
# Stage 1: deps
# ============================================================
FROM node:22.12-alpine AS deps

RUN apk add --no-cache libc6-compat

WORKDIR /app

RUN npm install -g pnpm@10.30.1

COPY package.json pnpm-lock.yaml ./

RUN pnpm install --frozen-lockfile --ignore-scripts


# ============================================================
# Stage 2: builder
# ============================================================
FROM node:22.12-alpine AS builder

RUN apk add --no-cache libc6-compat

WORKDIR /app

RUN npm install -g pnpm@10.30.1

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# DATABASE_URL dummy solo para satisfacer al config loader de Prisma 7.
# prisma generate no conecta a la DB, solo necesita que el env var exista.
# En runtime, la URL real viene del docker-compose (POSTGRES_USER/PASS/DB).
ARG DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"

RUN pnpm exec prisma generate
RUN pnpm build


# ============================================================
# Stage 3: runner
# ============================================================
FROM node:22.12-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

RUN addgroup -S -g 1001 ankor && \
    adduser  -S -u 1001 -G ankor ankor

COPY --from=builder --chown=ankor:ankor /app/public            ./public
COPY --from=builder --chown=ankor:ankor /app/.next/standalone  ./
COPY --from=builder --chown=ankor:ankor /app/.next/static      ./.next/static

USER ankor

EXPOSE 3000

CMD ["node", "server.js"]