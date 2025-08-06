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

COPY --from=build-deps /app/node_modules ./node_modules
COPY --from=build-deps /app/package.json ./package.json
COPY . .

RUN npx prisma generate

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ARG MONGODB_URI
ENV MONGODB_URI=${MONGODB_URI}
ARG DATABASE_URL
ENV DATABASE_URL=${DATABASE_URL}

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

COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./package.json

# ✅ Copy normal build output
COPY --from=builder --chown=nextjs:nodejs /app/.next .next
COPY --from=builder --chown=nextjs:nodejs /app/public public
COPY --from=builder --chown=nextjs:nodejs /app/prisma prisma

# ✅ Copy generated Prisma Client
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma/client ./node_modules/@prisma/client

# ✅ Copy optional healthcheck
COPY --from=builder --chown=nextjs:nodejs /app/healthcheck.js ./healthcheck.js

USER nextjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js || exit 1

# ✅ Run via Next.js in normal (non-standalone) mode
CMD ["npm", "start"]
