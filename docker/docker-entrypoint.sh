#!/bin/sh
set -e

echo "Starting GPUPoet container..."

# Change to web app directory
cd /app/packages/web-app

# Run migrations (this also serves as our database readiness check)
# migrate deploy will:
# 1. Wait for database connection
# 2. Create migrations table if needed
# 3. Apply pending migrations
# 4. Preserve existing data (safe, no --accept-data-loss!)
echo "Waiting for database and applying migrations..."

# Keep trying migrate deploy until it succeeds
until npx prisma migrate deploy 2>&1; do
    echo "Database not ready yet or migration failed, waiting 2 seconds..."
    sleep 2
done

echo "Database is ready and migrations applied!"

# NOTE: Prisma client is pre-generated during Docker build (see Dockerfile)
# No need to regenerate at runtime - it would fail due to non-root user permissions

# Seed database
echo "Seeding database..."
npm run prisma-seed

# Prepare assets for development (only if in dev mode)
if [ "$NODE_ENV" = "development" ]; then
    echo "Preparing development assets..."
    npm run prep
fi

echo "Setup completed successfully!"

# Execute the original command
echo "Starting application with command: $@"
cd /app
exec "$@"
