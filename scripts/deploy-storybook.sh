#!/bin/bash

# Deploy Storybook to Production
# Usage: ./scripts/deploy-storybook.sh

set -e

echo "🚀 Deploying Storybook to Production..."

# Build Storybook
echo "📦 Building Storybook..."
npm run build-storybook

# Check if Vercel CLI is available
if ! command -v vercel &> /dev/null; then
    echo "📥 Installing Vercel CLI..."
    npm install -g vercel
fi

# Deploy to Vercel
echo "🌐 Deploying to Vercel..."
cd storybook-static
vercel --prod --yes

echo "✅ Storybook deployed successfully!"
echo "🔗 Your Storybook should be available at:"
echo "   - Vercel URL: Check the output above"
echo "   - Custom Domain: https://storybook.citizenly.co (after DNS setup)"