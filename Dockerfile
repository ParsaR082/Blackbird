# --- Base image ---
FROM node:20-alpine AS base

RUN apk add --no-cache libc6-compat
WORKDIR /app

# --- Install production dependencies ---
FROM base AS deps

COPY package.json package-lock.json* ./
RUN npm ci --only=production && npm cache clean --force

# --- Install all dependencies for build ---
FROM base AS build-deps

COPY package.json package-lock.json* ./
RUN npm ci && npm cache clean --force

# --- Build the application ---
FROM base AS builder

# 🔹 ست کردن متغیرهای محیطی لازم برای بیلد
ENV NODE_ENV=production
ENV DATABASE_URL="mongodb://mongodb:27017/blackbird-db"
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=build-deps /app/node_modules ./node_modules
COPY --from=build-deps /app/package.json ./package.json
COPY . .

# Prisma generation before build
RUN npx prisma generate

# Build the Next.js app
RUN npm run build

# --- Final runtime image ---
FROM base AS runner

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

WORKDIR /app

# Copy production node_modules and package.json
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./package.json

# ✅ Copy compiled app
COPY --from=builder --chown=nextjs:nodejs /app/.next .next
COPY --from=builder --chown=nextjs:nodejs /app/public public
COPY --from=builder --chown=nextjs:nodejs /app/prisma prisma

# ✅ Copy generated Prisma client
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma/client ./node_modules/@prisma/client

# ✅ Healthcheck and startup scripts
COPY --from=builder /app/healthcheck.js ./healthcheck.js
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/wait-for-it.sh ./wait-for-it.sh
RUN chmod +x ./wait-for-it.sh ./scripts/start-app.sh

USER nextjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js || exit 1

CMD ["./scripts/start-app.sh"]
