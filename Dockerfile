# --- Base image ---
FROM node:20-alpine AS base

# Install dependencies only when needed
RUN apk add --no-cache libc6-compat
WORKDIR /app

# --- Install production dependencies ---
FROM base AS deps

# Copy dependency files
COPY package.json package-lock.json* ./

# Install production dependencies only
RUN npm ci --only=production && npm cache clean --force

# --- Install all dependencies for build ---
FROM base AS build-deps

# Copy dependency files
COPY package.json package-lock.json* ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci && npm cache clean --force

# --- Build the application ---
FROM base AS builder

# Copy all dependencies from build-deps stage
COPY --from=build-deps /app/node_modules ./node_modules
COPY --from=build-deps /app/package.json ./package.json

# Copy source code and Prisma schema
COPY . .

# Generate Prisma Client (requires prisma CLI from devDependencies)
RUN npx prisma generate

# Set build environment variables
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ARG MONGODB_URI
ENV MONGODB_URI=${MONGODB_URI}
ARG DATABASE_URL
ENV DATABASE_URL=${DATABASE_URL}

# Build the Next.js application
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

# Copy production dependencies and package.json
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/package.json ./package.json

# Copy built application from builder stage
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

# Copy generated Prisma Client (only the client, not the CLI)
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma/client ./node_modules/@prisma/client

# Copy Prisma schema for runtime (if needed for migrations)
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

# Copy healthcheck script
COPY --from=builder --chown=nextjs:nodejs /app/healthcheck.js ./healthcheck.js

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD node healthcheck.js || exit 1

# Next.js standalone mode automatically creates server.js in the standalone directory
CMD ["node", "server.js"]
