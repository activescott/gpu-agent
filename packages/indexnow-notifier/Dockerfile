# Build stage for dependencies
FROM node:20-alpine AS deps
WORKDIR /app

# Copy package files for the monorepo and this package
COPY package*.json ./
COPY packages/indexnow-notifier/package*.json ./packages/indexnow-notifier/

# Install dependencies (--ignore-scripts skips husky install from root package.json)
RUN npm ci --workspace=packages/indexnow-notifier --include-workspace-root --ignore-scripts

# Build stage
FROM node:20-alpine AS builder
WORKDIR /app

# Copy node_modules from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/indexnow-notifier/node_modules ./packages/indexnow-notifier/node_modules

# Copy source files
COPY packages/indexnow-notifier/ ./packages/indexnow-notifier/
COPY package*.json ./

# Build the package
WORKDIR /app/packages/indexnow-notifier
RUN npm run build

# Production stage
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production

# Create non-root user
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 notifier

# Copy built application
COPY --from=builder /app/packages/indexnow-notifier/dist ./dist
COPY --from=builder /app/packages/indexnow-notifier/package.json ./

# No production dependencies needed - all code is self-contained

# Create data directory for state files
RUN mkdir -p /data/pages && chown -R notifier:nodejs /data

USER notifier

# Run the CLI
ENTRYPOINT ["node", "dist/es/cli.js"]
