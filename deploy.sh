#!/bin/bash
set -e

# Target Virtualmin directory path
TARGET_DIR="/home/unclutter/domains/app.unclutter.com.ng/app"

echo "🚀 Starting UnclutterOS Production Deployment at $TARGET_DIR..."

cd $TARGET_DIR

# 1. Pull latest changes from git
echo "📥 Pulling latest git updates..."
git pull origin main

# 2. Install dependencies
echo "📦 Installing pnpm monorepo dependencies..."
pnpm install --frozen-lockfile

# 3. Build shared packages & API
echo "🔨 Building packages & API..."
pnpm --filter @unclutteros/shared run build
pnpm --filter @unclutteros/ui run build
pnpm --filter @unclutteros/api run build

# 4. Run Prisma database migrations
echo "🗄️ Running Prisma database migrations..."
npx prisma migrate deploy

# 5. Reload PM2 process
echo "🔄 Reloading PM2 process..."
pm2 reload ecosystem.config.js --env production || pm2 start ecosystem.config.js --env production

echo "✅ UnclutterOS API Deployed Successfully on app.unclutter.com.ng!"
