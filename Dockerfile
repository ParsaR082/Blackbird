# --- Base image ---
FROM node:20-alpine AS base

RUN apk add --no-cache libc6-compat
WORKDIR /app

# --- Install dependencies for build ---
FROM base AS build-deps

COPY package.json package-lock.json* ./
RUN npm ci && npm cache clean --force

# --- Build the application ---
FROM base AS builder

# Copy dependencies
COPY --from=build-deps /app/node_modules ./node_modules
COPY --from=build-deps /app/package.json ./package.json

# Copy full source
COPY . .

# Generate Prisma client
RUN npx prisma generate

# ✅ Inject environment variables needed at build time
ARG MONGODB_URI
ARG DATABASE_URL
ENV MONGODB_URI=${MONGODB_URI}
ENV DATABASE_URL=${DATABASE_URL}
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Build the Next.js app
RUN npm run build

# --- Final runtime image ---
FROM base AS runner

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# Create app user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

WORKDIR /app

# Copy only required files for runtime
COPY --from=build-deps /app/node_modules ./node_modules
COPY --from=build-deps /app/package.json ./package.json

# Build output and public assets
COPY --from=builder --chown=nextjs:nodejs /app/.next .next
COPY --from=builder --chown=nextjs:nodejs /app/public public
COPY --from=builder --chown=nextjs:nodejs /app/prisma prisma

# Prisma Client runtime
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma/client ./node_modules/@prisma/client

# Healthcheck script (optional)
COPY --from=builder --chown=nextjs:nodejs /app/healthcheck.js ./healthcheck.js

# Startup scripts
COPY scripts/ ./scripts/
COPY wait-for-it.sh ./wait-for-it.sh
RUN chmod +x ./wait-for-it.sh ./scripts/start-app.sh

USER nextjs

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js || exit 1

CMD ["./scripts/start-app.sh"]
