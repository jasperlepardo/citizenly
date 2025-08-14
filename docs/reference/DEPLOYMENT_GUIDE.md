# Deployment Guide

> **Environment-specific deployment procedures for the Citizenly project**
> 
> This document covers deployment strategies, environment configurations, and operational procedures for all environments from development to production.

## 📖 Table of Contents

1. [🏗️ Infrastructure Overview](#️-infrastructure-overview)
2. [🌍 Environment Setup](#-environment-setup)
3. [🚀 Deployment Pipeline](#-deployment-pipeline)
4. [📋 Pre-deployment Checklist](#-pre-deployment-checklist)
5. [🔧 Environment Configuration](#-environment-configuration)
6. [🗄️ Database Deployment](#️-database-deployment)
7. [🔄 CI/CD Workflows](#-cicd-workflows)
8. [🚨 Rollback Procedures](#-rollback-procedures)
9. [📊 Monitoring & Health Checks](#-monitoring--health-checks)
10. [🔒 Security Considerations](#-security-considerations)

---

## 🏗️ Infrastructure Overview

### **Technology Stack**
- **Frontend**: Next.js 14 (App Router)
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Hosting**: Vercel
- **Authentication**: Supabase Auth
- **Storage**: Supabase Storage
- **CDN**: Vercel Edge Network

### **Environment Architecture**
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Development   │    │     Staging     │    │   Production    │
│                 │    │                 │    │                 │
│ • Local dev     │───▶│ • Pre-prod test │───▶│ • Live system   │
│ • Feature dev   │    │ • QA testing    │    │ • Real users    │
│ • Unit testing  │    │ • Integration   │    │ • Full backup   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

---

## 🌍 Environment Setup

### **Development Environment**
- **Purpose**: Local development and feature work
- **URL**: `http://localhost:3000`
- **Database**: Local Supabase instance or shared dev DB
- **Authentication**: Development OAuth apps
- **Storage**: Local or dev storage bucket

### **Staging Environment**
- **Purpose**: Pre-production testing and QA
- **URL**: `https://staging.citizenly.app`
- **Database**: Staging Supabase project
- **Authentication**: Staging OAuth apps
- **Storage**: Staging storage bucket
- **Data**: Production-like test data

### **Production Environment**
- **Purpose**: Live application for end users
- **URL**: `https://citizenly.app`
- **Database**: Production Supabase project
- **Authentication**: Production OAuth apps
- **Storage**: Production storage bucket
- **Data**: Real user data (encrypted/protected)

---

## 🚀 Deployment Pipeline

### **Automated Deployment Flow**
```mermaid
graph LR
    A[Code Push] --> B[GitHub Actions]
    B --> C[Build & Test]
    C --> D{Environment?}
    D -->|develop| E[Deploy to Dev]
    D -->|staging| F[Deploy to Staging]
    D -->|main| G[Deploy to Production]
    E --> H[Dev Health Check]
    F --> I[Staging Health Check]
    G --> J[Production Health Check]
```

### **Deployment Triggers**
- **Development**: Automatic on push to `develop` branch
- **Staging**: Automatic on push to `staging` branch
- **Production**: Automatic on push to `main` branch (with approval)

---

## 📋 Pre-deployment Checklist

### **Code Quality Gates**
- [ ] All tests pass (unit, integration, e2e)
- [ ] Code review completed and approved
- [ ] Linting and formatting checks pass
- [ ] TypeScript compilation succeeds
- [ ] Bundle size within acceptable limits
- [ ] Security scan passed
- [ ] Performance benchmarks met

### **Database Checklist**
- [ ] Database migrations tested
- [ ] Backup taken before deployment
- [ ] Migration rollback plan ready
- [ ] Data validation scripts prepared
- [ ] Index performance verified

### **Configuration Checklist**
- [ ] Environment variables configured
- [ ] Feature flags set appropriately
- [ ] Third-party integrations configured
- [ ] SSL certificates valid
- [ ] Domain configuration correct

### **Documentation Checklist**
- [ ] Deployment notes updated
- [ ] API documentation current
- [ ] Changelog updated
- [ ] Release notes prepared
- [ ] Rollback procedures documented

---

## 🔧 Environment Configuration

### **Environment Variables**

#### **Common Variables**
```bash
# Application
NEXT_PUBLIC_APP_ENV=production
NEXT_PUBLIC_APP_VERSION=1.2.0
NEXT_PUBLIC_API_URL=https://api.citizenly.app

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Authentication
NEXTAUTH_URL=https://citizenly.app
NEXTAUTH_SECRET=your-nextauth-secret

# Feature Flags
FEATURE_ANALYTICS_ENABLED=true
FEATURE_NOTIFICATIONS_ENABLED=true
FEATURE_ADVANCED_SEARCH=true
```

#### **Development Environment**
```bash
# Development overrides
NEXT_PUBLIC_APP_ENV=development
NEXT_PUBLIC_SUPABASE_URL=http://localhost:54321
DATABASE_URL=postgresql://postgres:postgres@localhost:54322/postgres

# Debug settings
DEBUG=true
LOG_LEVEL=debug
MOCK_EXTERNAL_APIS=true
```

#### **Staging Environment**
```bash
# Staging configuration
NEXT_PUBLIC_APP_ENV=staging
NEXT_PUBLIC_SUPABASE_URL=https://staging-project.supabase.co

# Testing settings
ENABLE_TEST_ROUTES=true
LOG_LEVEL=info
ANALYTICS_SAMPLE_RATE=0.1
```

#### **Production Environment**
```bash
# Production configuration
NEXT_PUBLIC_APP_ENV=production
NEXT_PUBLIC_SUPABASE_URL=https://prod-project.supabase.co

# Production optimizations
LOG_LEVEL=warn
ANALYTICS_SAMPLE_RATE=1.0
ENABLE_PERFORMANCE_MONITORING=true
```

### **Vercel Configuration**
```json
// vercel.json
{
  "framework": "nextjs",
  "buildCommand": "npm run build",
  "devCommand": "npm run dev",
  "installCommand": "npm ci",
  "regions": ["sin1", "hnd1"],
  "functions": {
    "app/api/**": {
      "maxDuration": 30
    }
  },
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "/api/:path*"
    }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        }
      ]
    }
  ]
}
```

---

## 🗄️ Database Deployment

### **Migration Strategy**
```bash
# 1. Backup current database
npm run db:backup:create

# 2. Run migrations in transaction
npm run db:migrate:up

# 3. Verify data integrity
npm run db:verify

# 4. Update application deployment
npm run deploy

# 5. Run post-deployment checks
npm run db:post-deploy-check
```

### **Database Migration Scripts**
```javascript
// scripts/migrate.js
async function runMigrations() {
  try {
    console.log('🔄 Starting database migration...');
    
    // 1. Create backup
    await createBackup();
    
    // 2. Run pending migrations
    const pendingMigrations = await getPendingMigrations();
    console.log(`📦 Found ${pendingMigrations.length} pending migrations`);
    
    for (const migration of pendingMigrations) {
      console.log(`⚡ Running migration: ${migration.name}`);
      await runMigration(migration);
      await markMigrationComplete(migration);
    }
    
    // 3. Verify schema
    await verifySchema();
    
    console.log('✅ Database migration completed successfully');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    await rollbackMigrations();
    throw error;
  }
}
```

### **Supabase Deployment**
```sql
-- Migration: 2024-01-15_add_user_preferences.sql
BEGIN;

-- Add new columns
ALTER TABLE auth_user_profiles 
ADD COLUMN preferences JSONB DEFAULT '{}',
ADD COLUMN last_login_at TIMESTAMP WITH TIME ZONE;

-- Create index for better performance
CREATE INDEX idx_user_profiles_last_login 
ON auth_user_profiles(last_login_at);

-- Update RLS policies
CREATE POLICY "Users can update their own preferences" 
ON auth_user_profiles 
FOR UPDATE 
USING (auth.uid() = id);

COMMIT;
```

---

## 🔄 CI/CD Workflows

### **GitHub Actions Workflow**
```yaml
# .github/workflows/deploy-production.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm run test:coverage
      
      - name: Run linting
        run: npm run lint
      
      - name: Type check
        run: npm run type-check
      
      - name: Build application
        run: npm run build
      
      - name: Run E2E tests
        run: npm run test:e2e

  deploy:
    needs: test
    runs-on: ubuntu-latest
    environment: production
    steps:
      - uses: actions/checkout@v4
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
      
      - name: Run database migrations
        run: |
          npm run db:migrate
        env:
          DATABASE_URL: ${{ secrets.DATABASE_URL }}
      
      - name: Health check
        run: |
          curl -f https://citizenly.app/api/health || exit 1
      
      - name: Notify team
        uses: 8398a7/action-slack@v3
        with:
          status: ${{ job.status }}
          webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

### **Deployment Scripts**
```bash
#!/bin/bash
# scripts/deploy-production.sh

set -e

echo "🚀 Starting production deployment..."

# 1. Pre-deployment checks
echo "🔍 Running pre-deployment checks..."
npm run test
npm run lint
npm run type-check

# 2. Build application
echo "🏗️ Building application..."
npm run build

# 3. Database backup
echo "💾 Creating database backup..."
npm run db:backup

# 4. Deploy to Vercel
echo "☁️ Deploying to Vercel..."
vercel --prod

# 5. Run migrations
echo "🗄️ Running database migrations..."
npm run db:migrate

# 6. Health checks
echo "🏥 Running health checks..."
npm run health-check

# 7. Smoke tests
echo "🧪 Running smoke tests..."
npm run test:smoke

echo "✅ Production deployment completed successfully!"
```

---

## 🚨 Rollback Procedures

### **Application Rollback**
```bash
# Quick rollback to previous version
npm run rollback:production

# Rollback to specific version
npm run rollback:production -- --version=v1.2.3

# Manual Vercel rollback
vercel rollback https://citizenly.app --token=$VERCEL_TOKEN
```

### **Database Rollback**
```bash
# 1. Stop application traffic
npm run maintenance:enable

# 2. Restore from backup
npm run db:restore -- --backup-id=20240115_143022

# 3. Verify data integrity
npm run db:verify

# 4. Resume traffic
npm run maintenance:disable
```

### **Emergency Rollback Script**
```bash
#!/bin/bash
# scripts/emergency-rollback.sh

set -e

echo "🚨 EMERGENCY ROLLBACK INITIATED"

# 1. Enable maintenance mode
echo "🚧 Enabling maintenance mode..."
curl -X POST "https://api.vercel.com/v1/projects/$PROJECT_ID/env" \
  -H "Authorization: Bearer $VERCEL_TOKEN" \
  -d '{"key": "MAINTENANCE_MODE", "value": "true"}'

# 2. Rollback application
echo "↩️ Rolling back application..."
PREVIOUS_DEPLOYMENT=$(vercel ls --meta | head -2 | tail -1 | awk '{print $1}')
vercel promote $PREVIOUS_DEPLOYMENT --token=$VERCEL_TOKEN

# 3. Rollback database if needed
if [ "$DATABASE_ROLLBACK" = "true" ]; then
  echo "🗄️ Rolling back database..."
  npm run db:restore -- --backup-id=$BACKUP_ID
fi

# 4. Verify rollback
echo "🔍 Verifying rollback..."
curl -f https://citizenly.app/api/health || {
  echo "❌ Health check failed after rollback"
  exit 1
}

# 5. Disable maintenance mode
echo "✅ Disabling maintenance mode..."
curl -X DELETE "https://api.vercel.com/v1/projects/$PROJECT_ID/env/MAINTENANCE_MODE" \
  -H "Authorization: Bearer $VERCEL_TOKEN"

echo "✅ Emergency rollback completed successfully"
```

---

## 📊 Monitoring & Health Checks

### **Health Check Endpoint**
```typescript
// app/api/health/route.ts
export async function GET() {
  try {
    // Check database connectivity
    const dbHealth = await checkDatabaseHealth();
    
    // Check external services
    const supabaseHealth = await checkSupabaseHealth();
    
    // Check system resources
    const systemHealth = await checkSystemHealth();
    
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: process.env.NEXT_PUBLIC_APP_VERSION,
      environment: process.env.NEXT_PUBLIC_APP_ENV,
      checks: {
        database: dbHealth,
        supabase: supabaseHealth,
        system: systemHealth
      }
    };
    
    return Response.json(health);
  } catch (error) {
    return Response.json(
      { 
        status: 'unhealthy', 
        error: error.message,
        timestamp: new Date().toISOString()
      },
      { status: 503 }
    );
  }
}
```

### **Deployment Monitoring**
```typescript
// scripts/monitor-deployment.js
async function monitorDeployment(deploymentUrl) {
  const maxAttempts = 30;
  const delayMs = 10000; // 10 seconds
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await fetch(`${deploymentUrl}/api/health`);
      const health = await response.json();
      
      if (health.status === 'healthy') {
        console.log(`✅ Deployment healthy after ${attempt} attempts`);
        return true;
      }
      
      console.log(`⏳ Attempt ${attempt}/${maxAttempts} - Status: ${health.status}`);
    } catch (error) {
      console.log(`❌ Attempt ${attempt}/${maxAttempts} failed: ${error.message}`);
    }
    
    if (attempt < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }
  
  throw new Error('Deployment health check failed after maximum attempts');
}
```

### **Post-Deployment Verification**
```bash
#!/bin/bash
# scripts/verify-deployment.sh

echo "🔍 Verifying deployment..."

# 1. Health check
echo "🏥 Checking application health..."
HEALTH_STATUS=$(curl -s https://citizenly.app/api/health | jq -r '.status')
if [ "$HEALTH_STATUS" != "healthy" ]; then
  echo "❌ Health check failed: $HEALTH_STATUS"
  exit 1
fi

# 2. Critical functionality tests
echo "🧪 Testing critical functionality..."
npm run test:smoke:production

# 3. Performance check
echo "⚡ Checking performance..."
RESPONSE_TIME=$(curl -w '%{time_total}' -s -o /dev/null https://citizenly.app)
if (( $(echo "$RESPONSE_TIME > 2.0" | bc -l) )); then
  echo "⚠️ Slow response time: ${RESPONSE_TIME}s"
fi

# 4. Database connectivity
echo "🗄️ Checking database connectivity..."
curl -f https://citizenly.app/api/residents?limit=1 > /dev/null

echo "✅ Deployment verification completed successfully"
```

---

## 🔒 Security Considerations

### **Deployment Security**
- [ ] Secrets are stored securely (not in code)
- [ ] Environment variables are environment-specific
- [ ] SSL/TLS certificates are valid and up-to-date
- [ ] Database connections are encrypted
- [ ] API keys have appropriate permissions
- [ ] Access logs are monitored

### **Production Hardening**
```typescript
// Security headers configuration
const securityHeaders = {
  'X-Frame-Options': 'DENY',
  'X-Content-Type-Options': 'nosniff',
  'X-XSS-Protection': '1; mode=block',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'",
  'Referrer-Policy': 'strict-origin-when-cross-origin'
};
```

### **Secrets Management**
```bash
# Use Vercel secrets for sensitive data
vercel secret add database-url "postgresql://..."
vercel secret add jwt-secret "your-jwt-secret"
vercel secret add supabase-service-key "your-service-key"

# Reference in vercel.json
{
  "env": {
    "DATABASE_URL": "@database-url",
    "JWT_SECRET": "@jwt-secret",
    "SUPABASE_SERVICE_ROLE_KEY": "@supabase-service-key"
  }
}
```

---

## 🎯 Best Practices

### **Deployment Best Practices**
- Deploy small, frequent changes
- Use feature flags for risky features
- Always have a rollback plan
- Test deployments in staging first
- Monitor deployments closely
- Automate as much as possible

### **Database Best Practices**
- Always backup before migrations
- Test migrations on staging data
- Use transactions for atomic changes
- Have rollback scripts ready
- Monitor query performance
- Keep migration scripts in version control

### **Monitoring Best Practices**
- Set up alerts for failures
- Monitor key metrics continuously
- Log important events
- Track deployment success rates
- Monitor application performance
- Set up uptime monitoring

---

💡 **Remember**: Successful deployments require preparation, automation, and monitoring. Always have a rollback plan and test thoroughly before deploying to production.

🔗 **Related Documentation**: 
- [Development Workflow](./DEVELOPMENT_WORKFLOW.md) for the development process
- [Monitoring Setup](./MONITORING_SETUP.md) for detailed monitoring configuration
- [Backup Recovery](./BACKUP_RECOVERY.md) for backup and recovery procedures