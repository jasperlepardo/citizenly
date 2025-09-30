#!/bin/bash
# Vercel build script that works around TypeScript worker issue
# Temporarily moves tsconfig.json during build

echo "🔧 Vercel Build: Working around TypeScript worker issue..."

# Backup tsconfig.json
if [ -f "tsconfig.json" ]; then
  echo "📦 Backing up tsconfig.json..."
  mv tsconfig.json tsconfig.json.backup
fi

# Run the build
echo "🏗️ Running Next.js build..."
npm run build

# Capture exit code
BUILD_EXIT_CODE=$?

# Restore tsconfig.json
if [ -f "tsconfig.json.backup" ]; then
  echo "♻️ Restoring tsconfig.json..."
  mv tsconfig.json.backup tsconfig.json
fi

# Exit with the build's exit code
exit $BUILD_EXIT_CODE