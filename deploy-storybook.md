# Storybook Deployment Guide

## Your Storybook is Ready for Deployment! 🎉

The static files have been successfully built in the `storybook-static` folder.

## Deployment Options:

### Option 1: Vercel Dashboard (Recommended)

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "Add New..." → "Project"
3. Import your GitHub repository `jasperlepardo/citizenly`
4. Create a **separate project** for Storybook with these settings:
   - **Name**: `citizenly-storybook`
   - **Framework**: `Other`
   - **Root Directory**: Leave empty (use root)
   - **Build Command**: `npm run build-storybook`
   - **Output Directory**: `storybook-static`
   - **Install Command**: `npm install`

### Option 2: Manual Upload

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Drag and drop the `storybook-static` folder directly

### Option 3: Vercel CLI (After Authentication)

```bash
# Login to Vercel first
npx vercel login

# Then deploy
cd storybook-static
npx vercel --prod
```

## Custom Domain Setup:

After deployment, add the custom domain:

1. Go to your Storybook project settings in Vercel
2. Navigate to "Domains"
3. Add `storybook.citizenly.co`
4. Follow the DNS configuration instructions

## Expected URLs:

- **Temporary**: `https://citizenly-storybook.vercel.app`
- **Custom Domain**: `https://storybook.citizenly.co`

Your Storybook contains 40+ component stories and is production-ready! ✨
