# CSRF_SECRET Environment Setup

This document explains how to properly configure the `CSRF_SECRET` environment variable for all environments.

## What is CSRF_SECRET?

The `CSRF_SECRET` is a security token used to protect against Cross-Site Request Forgery (CSRF) attacks. It's required in production builds and must be a secure random string of at least 32 characters.

## Environment Configuration

### 1. Local Development

The development environment uses `.env.development` with a safe development placeholder:

```bash
CSRF_SECRET=dev-csrf-secret-32-chars-long-for-development
```

### 2. Staging Environment

For staging deployments, you need to set the actual secret in Vercel:

1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add environment variable:
   - **Name**: `CSRF_SECRET`
   - **Value**: A secure random string (32+ characters)
   - **Environment**: Production, Preview, Development (select Staging/Preview)

### 3. Production Environment

For production deployments, you need to set a different secret in Vercel:

1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add environment variable:
   - **Name**: `CSRF_SECRET`
   - **Value**: A secure random string (32+ characters)
   - **Environment**: Production

## Generating Secure Secrets

Use one of these methods to generate secure secrets:

### Option 1: Using Node.js

```javascript
require('crypto').randomBytes(32).toString('hex');
```

### Option 2: Using OpenSSL

```bash
openssl rand -hex 32
```

### Option 3: Using online generator

- Visit a secure password generator
- Generate 32+ character random string
- Use only alphanumeric characters for compatibility

## Vercel Environment Variables Setup

### Step-by-Step Guide:

1. **Access Vercel Dashboard**
   - Go to [vercel.com](https://vercel.com)
   - Navigate to your `citizenly` project

2. **Environment Variables**
   - Click Settings → Environment Variables
   - Add the following:

   | Variable      | Value                               | Environment |
   | ------------- | ----------------------------------- | ----------- |
   | `CSRF_SECRET` | `[your-production-secret-32-chars]` | Production  |
   | `CSRF_SECRET` | `[your-staging-secret-32-chars]`    | Preview     |
   | `CSRF_SECRET` | `[your-dev-secret-32-chars]`        | Development |

3. **Branch Mapping**
   - `main` branch → Production environment
   - `staging` branch → Preview environment
   - `develop` branch → Development environment
   - `feature/*` branches → Preview environment

## Security Best Practices

1. **Different secrets per environment** - Never reuse the same secret across environments
2. **Secure generation** - Use cryptographically secure random generators
3. **No hardcoding** - Never commit actual secrets to the repository
4. **Regular rotation** - Consider rotating secrets periodically
5. **Team access** - Limit access to environment variables to authorized team members

## Troubleshooting

### Build Failing with "CSRF_SECRET must be set"

This error occurs when the environment variable is not properly configured:

1. **Local builds**: Ensure `.env.local` or `.env.development` has CSRF_SECRET
2. **Vercel builds**: Check that environment variable is set in Vercel dashboard
3. **GitHub Actions**: Verify CSRF_SECRET is set in workflow files (already configured)

### Different Environments Not Working

1. Verify branch-to-environment mapping in `vercel.json`
2. Check that correct environment variables are set for each environment
3. Ensure deployment branch matches expected environment

## Implementation Details

The CSRF protection is implemented in `src/lib/csrf.ts` and:

- Throws an error if CSRF_SECRET is not set in production
- Uses a development fallback for non-production environments
- Validates tokens to prevent CSRF attacks
- Integrates with forms and API endpoints

## Related Files

- `.env.production` - Production environment config
- `.env.staging` - Staging environment config
- `.env.development` - Development environment config
- `vercel.json` - Vercel deployment configuration
- `src/lib/csrf.ts` - CSRF protection implementation
- `.github/workflows/*.yml` - GitHub Actions with build environment setup
