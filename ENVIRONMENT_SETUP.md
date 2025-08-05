# Multi-Environment Setup Guide

This guide explains how to set up and manage multiple environments (development, staging, production) for the RBI System.

## Environment Structure

The project supports four environments:

- **Development** (`development`) - Local development and feature work
- **Staging** (`staging`) - Pre-production testing and validation
- **Production** (`production`) - Live production system
- **Test** (`test`) - Automated testing environment

## Environment Configuration Files

Each environment has its own configuration file:

```
.env.development   # Development environment (committed)
.env.staging      # Staging environment (committed)
.env.production   # Production environment (committed)
.env.test         # Test environment (committed)
.env.local        # Local overrides (gitignored)
```

## Local Development Setup

### 1. Create Local Environment File

Create `.env.local` (this file is gitignored):

```bash
# Local Development Overrides
NEXT_PUBLIC_SUPABASE_URL=your-local-or-dev-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-local-or-dev-anon-key
CSRF_SECRET=your-local-csrf-secret-32-characters

# Optional: Override environment
NEXT_PUBLIC_APP_ENV=development
```

### 2. Available Development Commands

```bash
# Standard development (uses .env.local + .env.development)
npm run dev

# Test with staging configuration
npm run dev:staging

# Test with production configuration
npm run dev:production

# Build for specific environments
npm run build:dev
npm run build:staging
npm run build:prod
```

## GitHub Environments Setup

### 1. Create GitHub Environments

Go to your repository Settings → Environments and create:

- `development`
- `staging`
- `production`

### 2. Configure Environment Secrets

For each environment, add these secrets:

**All Environments (using single Supabase instance):**

```
SUPABASE_ANON_KEY=your-supabase-anon-key
CSRF_SECRET=your-environment-specific-csrf-secret-32-chars-min
```

Note: While Supabase credentials are shared, CSRF secrets should still be different for each environment for security.

### 3. Configure Environment Variables

For each environment, add these variables (not secrets):

**All Environments:**

```
SUPABASE_URL=https://your-project-id.supabase.co
```

Note: All environments use the same Supabase project and database.

## Vercel Deployment Setup

### 1. Single Project with Multiple Domains

This project uses a single Vercel project with custom domain aliases:

- `main` branch → `app.citizenly.co` (Production)
- `staging` branch → `staging.citizenly.co` (Staging)
- `develop` branch → `dev.citizenly.co` (Development)
- `feature/*` → Feature previews (vercel.app URLs)

### 2. Custom Domain Setup

In your Vercel dashboard:

1. Go to Project Settings → Domains
2. Add these custom domains:
   - `app.citizenly.co` → assign to `main` branch
   - `staging.citizenly.co` → assign to `staging` branch
   - `dev.citizenly.co` → assign to `develop` branch

### 3. Vercel Environment Variables

Configure environment variables for each environment:

**Production Environment:**

- `NEXT_PUBLIC_SUPABASE_URL` = your Supabase URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your Supabase anon key
- `CSRF_SECRET` = your production CSRF secret
- `NEXT_PUBLIC_APP_ENV` = `production`

**Preview Environment (for staging/develop):**

- `NEXT_PUBLIC_SUPABASE_URL` = your Supabase URL (same as production)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` = your Supabase anon key (same as production)
- `CSRF_SECRET` = your staging/dev CSRF secret
- `NEXT_PUBLIC_APP_ENV` = `staging` (or `development` for dev branch)

Note: All environments share the same Supabase instance.

## Branch Strategy & Deployment Flow

**Controlled Deployment Strategy:**

### Automatic Deployments

- **`develop`** → Automatically deploys to `dev.citizenly.co` on every push

### Manual Releases

- **Staging Release**: Manually trigger via GitHub Actions
  - Merges `develop` → `staging` branch
  - Deploys to `staging.citizenly.co`
- **Production Release**: Manually trigger via GitHub Actions
  - Merges `staging` → `main` branch
  - Deploys to `app.citizenly.co`

### How to Deploy

**1. Development (Automatic):**

```bash
git push origin develop  # Auto-deploys to dev.citizenly.co
```

**2. Staging (Manual):**

- Go to GitHub → Actions → "Deploy & Release"
- Click "Run workflow"
- Select "staging" environment
- Click "Run workflow"

**3. Production (Manual):**

- Go to GitHub → Actions → "Deploy & Release"
- Click "Run workflow"
- Select "production" environment
- Click "Run workflow"

## Environment Detection in Code

The application automatically detects the current environment:

```typescript
import { getEnvironment, isProduction, isDevelopment } from '@/lib/environment';

// Get current environment
const env = getEnvironment(); // 'development' | 'staging' | 'production' | 'test'

// Environment checks
if (isProduction()) {
  // Production-only code
}

if (isDevelopment()) {
  // Development-only code
}

// Get environment configuration
const config = getEnvironmentConfig();
console.log(config.appName); // "RBI System (Development)"
```

## Supabase Single Instance Setup

All environments use the same Supabase instance. The client automatically configures itself:

```typescript
import { supabase, isSupabaseAvailable } from '@/lib/supabase';

// Check if Supabase is properly configured
if (isSupabaseAvailable()) {
  // Safe to use Supabase (same instance across all environments)
  const { data } = await supabase.from('table').select();
}
```

**Benefits of Single Instance:**

- Simplified data management
- No need to sync data between environments
- Cost-effective for smaller projects
- Real production data available in staging for testing

## Environment Validation

The system validates required environment variables on startup:

```typescript
import { validateEnvironment } from '@/lib/environment';

const validation = validateEnvironment();
if (!validation.isValid) {
  console.error('Environment validation failed:', validation.errors);
}
```

## Troubleshooting

### Build Fails with Missing Environment Variables

1. Check that environment files exist (`.env.development`, etc.)
2. Verify GitHub Environment secrets are configured
3. Ensure Vercel environment variables are set

### Environment Not Detected Correctly

1. Check `NEXT_PUBLIC_APP_ENV` is set correctly
2. Verify environment files are being loaded
3. Use `getEnvironment()` to debug current environment

### Supabase Connection Issues

1. Verify URL and key are correct (same across all environments)
2. Check `isSupabaseAvailable()` returns true
3. Ensure the single Supabase project is accessible

## Security Notes

- Never commit real secrets to `.env.*` files
- Use GitHub Environments for secret management
- Use different CSRF secrets for each environment
- Rotate secrets regularly
- Consider Row Level Security (RLS) in Supabase to isolate data by environment if needed
