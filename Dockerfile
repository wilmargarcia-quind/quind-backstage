# syntax=docker/dockerfile:1
FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat git

# ── deps: only production + dev deps for build ───────────────────────────────
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ── builder: compile Next.js + clone docs ─────────────────────────────────────
FROM base AS builder
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

ARG DOCS_REPO=https://github.com/wilmargarcia-quind/quind-architecture-docs.git
RUN git clone --depth 1 "$DOCS_REPO" quind-architecture-docs

ENV DOCS_PATH=/app/quind-architecture-docs
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# ── runner: minimal production image ──────────────────────────────────────────
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV DOCS_PATH=/app/quind-architecture-docs

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder /app/quind-architecture-docs ./quind-architecture-docs
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

# Cloud Run injects PORT; Next.js standalone respects it
ENV PORT=8080
ENV HOSTNAME=0.0.0.0
EXPOSE 8080

CMD ["node", "server.js"]
