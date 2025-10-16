#!/bin/sh
set -e

echo "🚀 Starting GPU Agent Development Container..."

# Change to web app directory
cd /app/apps/web

# Run Prisma migrations (will fail fast if PostgreSQL isn't ready)
echo "🔄 Running Prisma migrations..."
npx prisma migrate deploy

echo "🌱 Seeding database..."
npm run prisma-seed

# Prepare assets for development
echo "🛠️ Preparing development assets..."
npm run prep

# Start the Next.js development server with hot reloading
echo "🎬 Starting Next.js development server with HMR..."
npx --no -- next --version
cd /app
exec npm run dev --workspace=apps/web
