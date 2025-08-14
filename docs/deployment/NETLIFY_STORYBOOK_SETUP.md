# Netlify Storybook Setup Instructions

## Overview

Storybook is now deployed to Netlify instead of Vercel for complete isolation from the main app deployment. This prevents rate limit issues and provides better performance for the component library.

## Setup Steps

### 1. Create Netlify Account & Site

1. Go to [netlify.com](https://netlify.com) and sign up/login
2. Click "New site from Git"
3. Connect to GitHub and select this repository
4. **Important**: Set build settings manually (don't use auto-detect)

### 2. Configure Build Settings in Netlify Dashboard

```bash
Build command: npm run build-storybook
Publish directory: storybook-static
```

### 3. Get Required Tokens

1. **Netlify Auth Token**:
   - Go to User Settings → Applications → Personal access tokens
   - Generate new token
   - Copy the token

2. **Site ID**:
   - In your site dashboard, go to Site settings → General
   - Copy the "Site ID" from the Site information section

### 4. Add GitHub Secrets

Add these secrets to your GitHub repository:

- Go to GitHub repo → Settings → Secrets and variables → Actions
- Add new repository secrets:
  ```
  NETLIFY_AUTH_TOKEN=your_personal_access_token_here
  NETLIFY_SITE_ID=your_site_id_here
  ```

### 5. Configure Environment Variables (Optional)

In Netlify dashboard → Site settings → Environment variables:

```bash
NODE_ENV=production
NEXT_PUBLIC_APP_ENV=development
NEXT_PUBLIC_SUPABASE_URL=https://placeholder.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=placeholder-key
CSRF_SECRET=placeholder-secret-for-storybook
```

## Deployment Triggers

### Automatic Deployment

Storybook will automatically deploy when:

- Push to `main`, `develop`, or `staging` branches
- Changes detected in:
  - `src/components/**`
  - `src/stories/**`
  - `.storybook/**`
  - `package.json`
  - `package-lock.json`

### Manual Deployment

You can manually trigger deployment via:

```bash
# GitHub Actions
gh workflow run "Deploy Storybook to Netlify"

# Or locally (if Netlify CLI installed)
npm run build-storybook
netlify deploy --prod --dir=storybook-static
```

## Benefits of Netlify vs Vercel

| Feature         | Netlify                         | Previous Vercel              |
| --------------- | ------------------------------- | ---------------------------- |
| **Isolation**   | ✅ Complete isolation           | ❌ Shared quota              |
| **Limits**      | ✅ 300 builds/month             | ❌ 100 deployments/day       |
| **Performance** | ✅ Global CDN                   | ✅ Global CDN                |
| **Cost**        | ✅ Free tier sufficient         | ❌ Easy to hit limits        |
| **Purpose**     | ✅ Perfect for static Storybook | ⚠️ Overkill for static sites |

## Troubleshooting

### Build Failures

1. Check the build log in Netlify dashboard
2. Verify environment variables are set
3. Test locally: `npm run build-storybook`

### Missing Secrets

If deployment fails with authentication errors:

1. Verify `NETLIFY_AUTH_TOKEN` is set in GitHub secrets
2. Verify `NETLIFY_SITE_ID` is set in GitHub secrets
3. Check token permissions in Netlify dashboard

### Domain Setup (Optional)

To use a custom domain like `storybook.citizenly.com`:

1. Go to Site settings → Domain management
2. Add custom domain
3. Follow DNS configuration instructions

## Migration Notes

- ✅ Old Vercel Storybook config backed up to `vercel-storybook.json.backup`
- ✅ Old workflow backed up to `deploy-storybook-vercel.yml.backup`
- ✅ Main app still uses Vercel (unchanged)
- ✅ Complete isolation achieved

## Next Steps

1. Set up Netlify account and site
2. Add GitHub secrets
3. Push changes to trigger first deployment
4. Verify Storybook is accessible at Netlify URL
