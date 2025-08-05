# 📚 Storybook Production Setup Guide

## ✅ Current Status

Your Storybook is **fully built and ready for deployment** with:

- 40+ interactive component stories
- Complete design system documentation
- Production-optimized build
- Multiple deployment options configured

## 🚀 Deployment Options

### Option 1: Vercel Dashboard (Quickest)

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Click "Add New..." → "Project"
3. Import your GitHub repository: `jasperlepardo/citizenly`
4. Configure the project:
   ```
   Name: citizenly-storybook
   Framework Preset: Other
   Root Directory: ./
   Build Command: npm run build-storybook
   Output Directory: storybook-static
   Install Command: npm install
   ```
5. Deploy!

### Option 2: Automated GitHub Actions

Your repository now includes automated deployment via GitHub Actions:

- Triggers on changes to components or stories
- Automatically builds and deploys to Vercel
- Requires these Vercel secrets in GitHub:
  - `VERCEL_TOKEN`
  - `VERCEL_ORG_ID`
  - `VERCEL_PROJECT_ID`

### Option 3: Local Script Deployment

Run the deployment script:

```bash
./scripts/deploy-storybook.sh
```

## 🌐 Custom Domain Setup

### Step 1: Deploy First

Complete any deployment option above to get your Vercel project.

### Step 2: Add Custom Domain

1. In your Vercel project dashboard
2. Go to "Settings" → "Domains"
3. Add domain: `storybook.citizenly.co`
4. Configure DNS with your domain provider:
   ```
   Type: CNAME
   Name: storybook
   Value: cname.vercel-dns.com
   ```

### Step 3: Verify

Your Storybook will be available at:

- **Production URL**: `https://storybook.citizenly.co`
- **Temp URL**: `https://citizenly-storybook.vercel.app`

## 📁 What Was Built

```
storybook-static/
├── index.html              # Main Storybook interface
├── assets/                 # Component stories and resources
├── iframe.html             # Story rendering frame
└── 40+ component stories   # Your complete design system
```

## 🛠 Maintenance

### Updating Storybook

1. Make changes to components in `src/components/`
2. Update stories if needed
3. Build: `npm run build-storybook`
4. Deploy using any option above

### Local Development

```bash
npm run storybook          # Start local server at localhost:6006
npm run build-storybook   # Build for production
```

## 🎯 Next Steps

1. **Deploy now** using Vercel Dashboard (recommended)
2. **Set up custom domain** `storybook.citizenly.co`
3. **Share with your team** - your complete design system is ready!

Your Storybook includes all RBI System components from atoms to complex form wizards. Perfect for development workflow! 🎨✨
