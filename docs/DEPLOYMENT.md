# Deployment Configuration

This document outlines the automated deployment setup for both the main Next.js application and the Storybook component library.

## 🚀 Deployment Overview

### Main Application

- **Project**: `citizenly`
- **Domain**: https://www.citizenly.co
- **Framework**: Next.js
- **Config**: `vercel.json`
- **Auto-deploy**: `main` and `develop` branches

### Storybook Component Library

- **Project**: `citizenly-storybook`
- **Domain**: https://storybook-static-jasper-lepardos-projects.vercel.app
- **Framework**: Static build
- **Config**: `vercel-storybook.json`
- **Auto-deploy**: Component changes on `main` and `develop`

## 🔧 Automated Deployment Setup

### Prerequisites

1. **Vercel Projects Created**:
   - `citizenly` (main app)
   - `citizenly-storybook` (component library)

2. **GitHub Secrets Required**:
   ```
   VERCEL_TOKEN=your-vercel-token
   VERCEL_ORG_ID=your-org-id
   VERCEL_STORYBOOK_PROJECT_ID=your-storybook-project-id
   ```

### Setting Up GitHub Secrets

1. **Get Vercel Token**:

   ```bash
   # Login to Vercel CLI
   vercel login

   # Get your token from: https://vercel.com/account/tokens
   ```

2. **Get Organization ID**:

   ```bash
   # From .vercel/project.json or Vercel dashboard
   cat .vercel/project.json
   ```

3. **Get Storybook Project ID**:

   ```bash
   # List projects to find the Storybook project ID
   vercel projects list
   ```

4. **Add to GitHub Secrets**:
   - Go to: Repository → Settings → Secrets and Variables → Actions
   - Add the three secrets above

### Deployment Triggers

#### Main App (`citizenly`)

- **Auto-deploys on**:
  - Push to `develop` → Preview deployment
  - Push to `main` → Production deployment
- **Config**: Uses `vercel.json`
- **Build**: `npm run build` (Next.js only)

#### Storybook (`citizenly-storybook`)

- **Auto-deploys on**:
  - Changes to components, stories, or Storybook config
  - Push to `main` or `develop` branches
  - Pull requests (creates preview)
- **Config**: Uses `vercel-storybook.json`
- **Build**: `npm run build-storybook`

## 📁 Configuration Files

### vercel.json (Main App)

```json
{
  "version": 2,
  "buildCommand": "npm run build",
  "installCommand": "npm install",
  "framework": "nextjs",
  "github": {
    "enabled": true,
    "autoAlias": false
  },
  "git": {
    "deploymentEnabled": {
      "develop": true
    }
  }
}
```

### vercel-storybook.json (Storybook)

```json
{
  "name": "citizenly-storybook",
  "version": 2,
  "buildCommand": "npm run build-storybook",
  "outputDirectory": "storybook-static",
  "installCommand": "npm ci",
  "framework": null,
  "public": true,
  "github": {
    "enabled": true,
    "autoAlias": true
  },
  "git": {
    "deploymentEnabled": {
      "main": true,
      "develop": true
    }
  }
}
```

## 🔄 GitHub Actions Workflow

### Main App Workflow

- **File**: `.github/workflows/vercel-build.yml`
- **Triggers**: Push to any branch
- **Actions**: Build, test, deploy to Vercel

### Storybook Workflow

- **File**: `.github/workflows/deploy-storybook.yml`
- **Triggers**:
  - Component file changes
  - Manual trigger
  - Pull requests
- **Actions**:
  - Build Storybook
  - Deploy to Vercel
  - Comment on PR with preview link

## 🎯 Branch Strategy

### Main App

```
main     → Production (citizenly.co)
develop  → Preview (develop-citizenly.vercel.app)
feature/* → Preview deployments
```

### Storybook

```
main     → Production Storybook
develop  → Development Storybook
PR       → Preview with comment
```

## 🚀 Manual Deployment Commands

### Deploy Main App

```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

### Deploy Storybook

```bash
# Using specific config
vercel --local-config vercel-storybook.json --prod

# Or use npm script
npm run deploy:storybook
```

## 📊 Monitoring Deployments

### Vercel Dashboard

- Monitor build status and logs
- View deployment history
- Manage domains and environment variables

### GitHub Actions

- Check workflow runs in Actions tab
- View build logs and errors
- Monitor deployment status

### Commands

```bash
# List recent deployments
vercel ls

# Check deployment status
vercel inspect <deployment-url>

# View logs
vercel logs <deployment-url>
```

## 🔍 Troubleshooting

### Common Issues

1. **Build Failures**:
   - Check environment variables
   - Verify build commands in config
   - Review GitHub Actions logs

2. **Deployment Not Triggering**:
   - Check GitHub webhook settings
   - Verify branch names in config
   - Ensure path filters are correct

3. **Storybook Not Updating**:
   - Check if component files are in trigger paths
   - Verify Storybook build command
   - Check GitHub secrets are set

### Debug Commands

```bash
# Test local builds
npm run build
npm run build-storybook

# Check Vercel CLI linking
vercel status

# Validate configuration
vercel --local-config vercel.json --confirm
vercel --local-config vercel-storybook.json --confirm
```

## 🔄 Updating Deployment

To modify deployment behavior:

1. **Update config files** (`vercel.json`, `vercel-storybook.json`)
2. **Modify GitHub workflows** (`.github/workflows/`)
3. **Update package.json scripts** if needed
4. **Test with preview deployment** before merging to main

## 📝 Environment Variables

### Required for Main App

```
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-key
CSRF_SECRET=your-csrf-secret
```

### Required for Storybook

```
NODE_ENV=production (auto-set during build)
```

This setup ensures both your main application and component library are automatically deployed whenever relevant changes are made, providing seamless CI/CD for your development workflow.
