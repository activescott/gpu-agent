FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine
# to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat wget
WORKDIR /app

# Install dependencies
# Copy all files needed for dependency resolution
COPY . .
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma client
RUN cd apps/web && npx prisma generate

# Build the application using turbo (it will build dependencies first)
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
# Uncomment the following line in case you want to disable telemetry during runtime.
# ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy built application
COPY --from=builder /app/apps/web/.next ./apps/web/.next
COPY --from=builder /app/apps/web/public ./apps/web/public
COPY --from=builder /app/apps/web/package.json ./apps/web/package.json

# Set ownership of .next directory to nextjs user for write permissions
RUN chown -R nextjs:nodejs /app/apps/web/.next

# Copy pre-generated sitemap (generated with Git info)
COPY --from=builder /app/apps/web/src/app/sitemap.static-pages.json ./apps/web/src/app/sitemap.static-pages.json

# Copy workspace dependencies
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Copy prisma schema and migrations
COPY --from=builder /app/apps/web/prisma ./apps/web/prisma

# Copy source files needed for seeding (TypeScript imports)
COPY --from=builder /app/apps/web/src ./apps/web/src
COPY --from=builder /app/apps/web/tsconfig.json ./apps/web/tsconfig.json

# Copy data files needed for seeding
COPY --from=builder /app/data ./data

# Copy and set up entrypoint script
COPY --from=builder /app/scripts/docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Add health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
