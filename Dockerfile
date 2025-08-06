# --- Base image ---
FROM node:20-alpine AS base

# Set working directory
WORKDIR /app

# --- Install dependencies ---
FROM base AS deps

# Add compatibility libs
RUN apk add --no-cache libc6-compat

# Copy only dependency files
COPY package.json package-lock.json* ./
COPY prisma ./prisma/

# Install deps & clean cache
RUN npm ci && npm cache clean --force

# --- Build the app ---
FROM base AS builder

# Copy deps from previous stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/prisma ./prisma
COPY --from=deps /app/package.json ./package.json
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Set production env for build
ENV NODE_ENV=production

# Build the Next.js app
RUN npm run build

# --- Final runtime image ---
FROM base AS runner

# Set environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Create app user
RUN addgroup --system --gid 1001 nodejs \
  && adduser --system --uid 1001 nextjs

# Set working directory
WORKDIR /app

# Copy built files & runtime deps
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/prisma ./prisma

# Set permissions
USER nextjs

# Expose app port
EXPOSE 3000

# Start app using Next.js
CMD ["npm", "start"]
