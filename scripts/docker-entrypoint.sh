#!/bin/sh
set -e

echo "🚀 Starting GPU Agent Docker container..."

# Change to web app directory
cd /app/packages/web-app

# Run Prisma migrations (will fail fast if PostgreSQL isn't ready)
echo "🔄 Running Prisma migrations..."
npx prisma migrate deploy

echo "🌱 Seeding database..."
npm run prisma-seed

# Start the application
echo "🎬 Starting Next.js application..."
cd /app
exec npm run start --workspace=packages/web-app
