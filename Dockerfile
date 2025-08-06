# --- Base image ---
FROM node:20-alpine AS base

# Install dependencies only when needed
RUN apk add --no-cache libc6-compat
WORKDIR /app

# --- Install dependencies ---
FROM base AS deps

# Copy dependency files
COPY package.json package-lock.json* ./
COPY prisma ./prisma/

# Install dependencies with exact versions
RUN npm ci --only=production && npm cache clean --force

# --- Build dependencies (includes dev dependencies) ---
FROM base AS build-deps

# Copy dependency files
COPY package.json package-lock.json* ./
COPY prisma ./prisma/

# Install all dependencies (including dev)
RUN npm ci && npm cache clean --force

# --- Build the app ---
FROM base AS builder

# Copy all dependencies
COPY --from=build-deps /app/node_modules ./node_modules
COPY --from=build-deps /app/prisma ./prisma
COPY --from=build-deps /app/package.json ./package.json

# Copy source code
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Set build environment variables
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Build the Next.js app
RUN npm run build

# --- Final runtime image ---
FROM base AS runner

# Set production environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Set working directory
WORKDIR /app

# Copy runtime dependencies (production only)
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./package.json

# Copy built application
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js || exit 1

# Start the application
CMD ["node", "server.js"]
