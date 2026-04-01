# ── Stage 1: Install dependencies ──────────────────────────────────────────
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package*.json ./
RUN npm ci

# ── Stage 2: Build ──────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

ENV NEXT_TELEMETRY_DISABLED=1

# Payload needs these present at build time (type generation, config resolve).
# Placeholder values are safe here — real secrets are injected at runtime only.
ARG PAYLOAD_SECRET=build-placeholder-secret
ARG DATABASE_URI=postgresql://placeholder:placeholder@placeholder/placeholder
ENV PAYLOAD_SECRET=$PAYLOAD_SECRET
ENV DATABASE_URI=$DATABASE_URI

RUN npm run build

# ── Stage 3: Production runner ───────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
