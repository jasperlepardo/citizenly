# RBI System - Complete Deployment Guide

## Production-Ready Deployment for All Implementation Tiers

---

## 🎯 **Deployment Overview**

This comprehensive guide covers deployment for all RBI System implementation tiers with platform-specific instructions.

### **Deployment Options**

| Tier                   | Cost        | Timeline  | Complexity | Best For                      |
| ---------------------- | ----------- | --------- | ---------- | ----------------------------- |
| **🟢 MVP Tier**        | $0/month    | 2-4 hours | Simple     | Quick start, proof of concept |
| **🟡 Standard Tier**   | $25+/month  | 4-6 hours | Moderate   | Growing organizations         |
| **🔴 Enterprise Tier** | $100+/month | 6-8 hours | Advanced   | Large-scale production        |

### **Platform Support**

| Platform                   | MVP         | Standard    | Enterprise  | Notes               |
| -------------------------- | ----------- | ----------- | ----------- | ------------------- |
| **Supabase Free**          | ✅ Primary  | ❌ Limited  | ❌ No       | Free tier optimized |
| **Supabase Pro**           | ✅ Enhanced | ✅ Primary  | ✅ Enhanced | Paid tier features  |
| **Self-Hosted PostgreSQL** | 🔶 Basic    | ✅ Full     | ✅ Primary  | Maximum control     |
| **Vercel Hosting**         | ✅ Included | ✅ Included | ✅ Enhanced | Frontend deployment |

---

## 🟢 **MVP Tier - Free Tier Deployment**

### **🎯 MVP Deployment Strategy**

- ✅ **Zero hosting costs** during development and MVP phase
- ✅ **All core features** available (95% functionality)
- ✅ **Production-ready** schema with free-tier optimizations
- ✅ **Easy scaling** when ready to upgrade

### **📋 Prerequisites**

#### **Required Accounts & Access**

- [ ] **Supabase Account** - [Create free account](https://supabase.com)
- [ ] **Vercel Account** - [Create free account](https://vercel.com)
- [ ] **GitHub Repository** - Code accessible
- [ ] **Node.js 18+** - [Download](https://nodejs.org/)

#### **Local Development Environment**

- [ ] **PostgreSQL Client** - psql command available
- [ ] **Git** - Version control access
- [ ] **Code Editor** - VS Code recommended

### **🚀 Step 1: Database Setup (15 minutes)**

#### **1.1 Create Supabase Project**

1. **Create New Project**
   - Go to [Supabase Dashboard](https://supabase.com/dashboard)
   - Click "New Project"
   - Choose organization and region
   - Set strong database password
   - Wait for project initialization (~2 minutes)

2. **Get Connection Details**

   ```bash
   Project URL: https://[project-id].supabase.co
   API Keys:
   - anon (public): eyJ... (for client-side)
   - service_role: eyJ... (for server-side, keep secret)

   Database Connection:
   - Host: db.[project-id].supabase.co
   - Port: 5432
   - Database: postgres
   - Username: postgres
   - Password: [your-password]
   ```

#### **1.2 Deploy Optimized Schema**

```bash
# Connect to your Supabase database
export SUPABASE_DB_URL="postgresql://postgres:[password]@db.[project-id].supabase.co:5432/postgres"

# Deploy the free-tier optimized schema
psql $SUPABASE_DB_URL -f database/schema.sql
```

**✅ MVP Schema Optimizations:**

- **10 essential indexes** (instead of 53+)
- **Simplified PSOC search** (2-table union vs 6-table JOIN)
- **Client-side calculations** for computed fields
- **No full-text search** (uses ILIKE for text matching)
- **Estimated size**: 200MB with 10K residents

#### **1.3 Import Reference Data**

```bash
cd database/migrations
npm install
npm run import
```

**Reference Data Includes:**

- **46,000+ PSGC records** (regions, provinces, cities, barangays)
- **9,000+ PSOC records** (occupation codes and titles)
- **Enumeration values** (education levels, civil status, etc.)

### **🚀 Step 2: Authentication Setup (10 minutes)**

#### **2.1 Configure Authentication**

1. **Enable Authentication**
   - Go to Supabase Dashboard → Authentication
   - Enable Email authentication
   - Set site URL: `https://your-domain.com`

2. **Create Admin User**

   ```sql
   -- Create admin user in SQL Editor
   INSERT INTO auth.users (
     id, email, encrypted_password, email_confirmed_at, role
   ) VALUES (
     gen_random_uuid(),
     'admin@yourdomain.com',
     crypt('secure-password', gen_salt('bf')),
     now(),
     'authenticated'
   );
   ```

3. **Set User Profile**
   ```sql
   -- Set user as super admin with barangay access
   INSERT INTO user_profiles (
     id, email, role, barangay_code
   ) VALUES (
     (SELECT id FROM auth.users WHERE email = 'admin@yourdomain.com'),
     'admin@yourdomain.com',
     'super_admin',
     'your-barangay-code'
   );
   ```

### **🚀 Step 3: Frontend Deployment (30 minutes)**

#### **3.1 Environment Configuration**

Create `.env.local`:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://[project-id].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...your-anon-key
SUPABASE_SERVICE_ROLE_KEY=eyJ...your-service-role-key

# Implementation Tier
NEXT_PUBLIC_IMPLEMENTATION_TIER=mvp

# Free Tier Optimizations
NEXT_PUBLIC_MAX_RECORDS_PER_PAGE=100
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_ENABLE_ADVANCED_SEARCH=false

# Security
CSRF_SECRET=your-32-character-secret-key
```

#### **3.2 Vercel Deployment**

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to Vercel
vercel --prod

# Add environment variables in Vercel dashboard
# Settings → Environment Variables
```

#### **3.3 Domain Configuration**

1. **Custom Domain** (Optional)
   - Vercel Dashboard → Domains
   - Add your custom domain
   - Configure DNS as instructed

2. **SSL Certificate**
   - Automatically provided by Vercel
   - HTTPS enforced by default

### **🚀 Step 4: Validation & Testing (15 minutes)**

#### **4.1 Database Validation**

```sql
-- Check essential tables exist
SELECT count(*) FROM residents; -- Should return 0 (empty)
SELECT count(*) FROM households; -- Should return 0 (empty)
SELECT count(*) FROM psgc_barangays; -- Should return 42,000+
SELECT count(*) FROM psoc_unit_groups; -- Should return 400+

-- Test user authentication
SELECT email, role FROM user_profiles; -- Should show admin user
```

#### **4.2 Frontend Validation**

- [ ] **Application loads** at your domain
- [ ] **Login works** with admin credentials
- [ ] **Dashboard displays** basic statistics (0 residents)
- [ ] **Navigation works** between pages
- [ ] **Forms load** for resident/household creation
- [ ] **PSOC search** returns occupation results

#### **4.3 Performance Validation**

```bash
# Check database size (should be <100MB for empty system)
SELECT pg_size_pretty(pg_database_size('postgres'));

# Check API response times (should be <500ms)
curl -w "@curl-format.txt" -o /dev/null -s https://your-domain.com/api/residents
```

---

## 🟡 **Standard Tier - Enhanced Deployment**

### **🎯 Standard Tier Features**

- ✅ **Enhanced search** with multi-field filtering
- ✅ **Server-side processing** for better performance
- ✅ **Basic analytics** and reporting
- ✅ **Automated calculations** for sectoral information
- ✅ **Export capabilities** (CSV, JSON)

### **📋 Prerequisites**

- **Supabase Pro Plan** ($25/month minimum)
- **Enhanced database resources** (4GB+ storage)
- **All MVP requirements** completed successfully

### **🚀 Enhanced Setup Steps**

#### **1. Upgrade Database Configuration**

```bash
# Enable additional database extensions
psql $SUPABASE_DB_URL -c "CREATE EXTENSION IF NOT EXISTS pg_trgm;"
psql $SUPABASE_DB_URL -c "CREATE EXTENSION IF NOT EXISTS unaccent;"

# Deploy enhanced indexes for better search
psql $SUPABASE_DB_URL -f database/enhancements/standard-indexes.sql
```

#### **2. Environment Configuration Updates**

```bash
# Update .env.local for Standard tier
NEXT_PUBLIC_IMPLEMENTATION_TIER=standard

# Enhanced Features
NEXT_PUBLIC_MAX_RECORDS_PER_PAGE=500
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_ADVANCED_SEARCH=true
NEXT_PUBLIC_ENABLE_REPORTS=false

# Database Optimizations
NEXT_PUBLIC_USE_SERVER_SIDE_PROCESSING=true
NEXT_PUBLIC_ENABLE_CACHING=true
```

#### **3. Deploy Enhanced Components**

```bash
# Enable enhanced search components
npm run build:standard

# Deploy with enhanced features
vercel --prod
```

#### **4. Configure Analytics**

```sql
-- Create analytics views for better performance
CREATE VIEW resident_analytics AS
SELECT
  COUNT(*) as total_residents,
  COUNT(CASE WHEN sex = 'Male' THEN 1 END) as male_count,
  COUNT(CASE WHEN sex = 'Female' THEN 1 END) as female_count,
  COUNT(CASE WHEN EXTRACT(year FROM age(birthdate)) < 18 THEN 1 END) as minor_count,
  COUNT(CASE WHEN EXTRACT(year FROM age(birthdate)) >= 60 THEN 1 END) as senior_count
FROM residents
WHERE barangay_code = auth.jwt() ->> 'barangay_code';
```

---

## 🔴 **Enterprise Tier - Full Feature Deployment**

### **🎯 Enterprise Tier Features**

- ✅ **Full-text search** with PostgreSQL capabilities
- ✅ **Complex analytics** and executive dashboards
- ✅ **Advanced reporting** with scheduled exports
- ✅ **AI-powered features** for data insights
- ✅ **Enterprise security** with audit logging
- ✅ **High availability** and backup strategies

### **📋 Prerequisites**

- **Supabase Pro/Team Plan** ($100+/month)
- **Dedicated database resources** (8GB+ storage)
- **Enterprise security requirements** validated
- **All Standard tier features** operational

### **🚀 Enterprise Setup Steps**

#### **1. Deploy Full Feature Schema**

```bash
# Deploy complete enterprise schema
psql $SUPABASE_DB_URL -f database/schema-enterprise.sql

# Enable full-text search capabilities
psql $SUPABASE_DB_URL -c "CREATE EXTENSION IF NOT EXISTS pg_trgm;"
psql $SUPABASE_DB_URL -c "CREATE EXTENSION IF NOT EXISTS fuzzystrmatch;"

# Deploy enterprise indexes and views
psql $SUPABASE_DB_URL -f database/enhancements/enterprise-features.sql
```

#### **2. Enterprise Environment Configuration**

```bash
# Update .env.local for Enterprise tier
NEXT_PUBLIC_IMPLEMENTATION_TIER=enterprise

# Full Feature Set
NEXT_PUBLIC_MAX_RECORDS_PER_PAGE=1000
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_ADVANCED_SEARCH=true
NEXT_PUBLIC_ENABLE_REPORTS=true
NEXT_PUBLIC_ENABLE_AI_FEATURES=true
NEXT_PUBLIC_ENABLE_AUDIT_LOGGING=true

# Performance Optimizations
NEXT_PUBLIC_USE_SERVER_SIDE_PROCESSING=true
NEXT_PUBLIC_ENABLE_CACHING=true
NEXT_PUBLIC_ENABLE_CDN=true

# Security Enhancements
NEXT_PUBLIC_ENABLE_2FA=true
NEXT_PUBLIC_SESSION_TIMEOUT=480 # 8 hours
```

#### **3. Deploy Enterprise Components**

```bash
# Build with full feature set
npm run build:enterprise

# Deploy with enterprise configuration
vercel --prod --env-file .env.enterprise
```

#### **4. Configure Enterprise Features**

##### **Advanced Analytics**

```sql
-- Create complex analytics views
CREATE MATERIALIZED VIEW population_analytics AS
SELECT
  barangay_code,
  COUNT(*) as population,
  EXTRACT(year FROM age(AVG(birthdate))) as avg_age,
  COUNT(CASE WHEN is_pwd THEN 1 END) as pwd_population,
  COUNT(CASE WHEN is_senior_citizen THEN 1 END) as senior_population,
  -- Add 20+ more analytics fields
FROM residents
GROUP BY barangay_code;

-- Refresh analytics daily
CREATE OR REPLACE FUNCTION refresh_analytics()
RETURNS void AS $$
BEGIN
  REFRESH MATERIALIZED VIEW population_analytics;
END;
$$ LANGUAGE plpgsql;
```

##### **Scheduled Reporting**

```bash
# Set up cron jobs for automated reports
# Add to your server cron tab:
0 6 * * * curl -X POST https://your-domain.com/api/reports/daily
0 6 * * 1 curl -X POST https://your-domain.com/api/reports/weekly
0 6 1 * * curl -X POST https://your-domain.com/api/reports/monthly
```

---

## 🔧 **Platform-Specific Configurations**

### **Vercel Configuration**

#### **vercel.json (All Tiers)**

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "/"
    }
  ],
  "env": {
    "NEXT_PUBLIC_IMPLEMENTATION_TIER": "@implementation_tier"
  },
  "functions": {
    "pages/api/**/*.js": {
      "maxDuration": 10
    }
  }
}
```

#### **Storybook Deployment (Optional)**

```json
{
  "version": 2,
  "name": "citizenly-storybook",
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "buildCommand": "npm run build-storybook"
      }
    }
  ],
  "routes": [
    {
      "handle": "filesystem"
    },
    {
      "src": "/(.*)",
      "dest": "/storybook-static/$1"
    }
  ]
}
```

### **GitHub Actions Configuration**

#### **.github/workflows/deploy.yml**

```yaml
name: Deploy RBI System

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test

      - name: Build application
        run: npm run build
        env:
          NEXT_PUBLIC_IMPLEMENTATION_TIER: ${{ secrets.IMPLEMENTATION_TIER }}

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: ./
```

---

## 🚨 **Troubleshooting Common Issues**

### **Database Connection Issues**

#### **Problem**: Connection timeout or refused

```bash
# Check connection string format
export SUPABASE_DB_URL="postgresql://postgres:PASSWORD@db.PROJECT-ID.supabase.co:5432/postgres"

# Test connection
psql $SUPABASE_DB_URL -c "SELECT version();"
```

#### **Problem**: Schema import fails

```bash
# Check for existing tables
psql $SUPABASE_DB_URL -c "\dt"

# Drop existing schema if needed (CAUTION: This deletes data!)
psql $SUPABASE_DB_URL -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"

# Re-run schema import
psql $SUPABASE_DB_URL -f database/schema.sql
```

### **Free Tier Limitations**

#### **Problem**: Database size exceeded

```sql
-- Check current database size
SELECT pg_size_pretty(pg_database_size('postgres'));

-- Find largest tables
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

#### **Solution**: Optimize for free tier

```sql
-- Remove unnecessary indexes
DROP INDEX IF EXISTS idx_residents_full_text_search;
DROP INDEX IF EXISTS idx_households_complex_search;

-- Use simplified queries
-- Replace complex JOINs with simple lookups
```

### **Authentication Issues**

#### **Problem**: Login fails

```sql
-- Check user exists
SELECT id, email, role FROM auth.users WHERE email = 'your-email@domain.com';

-- Check user profile
SELECT * FROM user_profiles WHERE email = 'your-email@domain.com';

-- Reset password if needed
UPDATE auth.users
SET encrypted_password = crypt('new-password', gen_salt('bf'))
WHERE email = 'your-email@domain.com';
```

### **Performance Issues**

#### **Problem**: Slow query performance

```sql
-- Enable query logging
ALTER SYSTEM SET log_statement = 'all';
SELECT pg_reload_conf();

-- Check slow queries
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 10;
```

#### **Solution**: Query optimization

```sql
-- Add missing indexes
CREATE INDEX CONCURRENTLY idx_residents_search
ON residents(last_name, first_name)
WHERE barangay_code = 'user-barangay';

-- Use LIMIT in queries
SELECT * FROM residents LIMIT 100;
```

---

## 📊 **Post-Deployment Validation**

### **Automated Testing Script**

```bash
#!/bin/bash
# deployment-test.sh

echo "🧪 Running deployment validation tests..."

# Test database connection
psql $SUPABASE_DB_URL -c "SELECT 'Database connection: OK';"

# Test essential tables
echo "📋 Checking essential tables..."
psql $SUPABASE_DB_URL -c "SELECT 'Residents table: ' || count(*) FROM residents;"
psql $SUPABASE_DB_URL -c "SELECT 'Households table: ' || count(*) FROM households;"
psql $SUPABASE_DB_URL -c "SELECT 'PSGC data: ' || count(*) FROM psgc_barangays;"

# Test API endpoints
echo "🌐 Testing API endpoints..."
curl -f https://your-domain.com/api/health || echo "❌ Health check failed"
curl -f https://your-domain.com/api/residents?limit=1 || echo "❌ Residents API failed"

# Test authentication
echo "🔐 Testing authentication..."
curl -X POST https://your-domain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}' || echo "❌ Auth test failed"

echo "✅ Deployment validation complete!"
```

### **Performance Monitoring**

```sql
-- Create monitoring queries
SELECT
  'Database Size' as metric,
  pg_size_pretty(pg_database_size('postgres')) as value
UNION ALL
SELECT
  'Active Connections',
  count(*)::text
FROM pg_stat_activity
WHERE state = 'active'
UNION ALL
SELECT
  'Average Query Time',
  round(avg(mean_exec_time))::text || 'ms'
FROM pg_stat_statements;
```

---

## 🎯 **Success Criteria**

### **MVP Tier Success**

- [ ] ✅ Database deployed with <100MB usage
- [ ] ✅ All reference data imported (46K+ records)
- [ ] ✅ Frontend deployed and accessible
- [ ] ✅ Authentication working
- [ ] ✅ Basic CRUD operations functional
- [ ] ✅ Page load times <2 seconds

### **Standard Tier Success**

- [ ] ✅ Enhanced search functional
- [ ] ✅ Server-side processing enabled
- [ ] ✅ Analytics dashboard operational
- [ ] ✅ Export features working
- [ ] ✅ Database <500MB usage
- [ ] ✅ API response times <500ms

### **Enterprise Tier Success**

- [ ] ✅ Full-text search operational
- [ ] ✅ Complex analytics functional
- [ ] ✅ Automated reporting active
- [ ] ✅ AI features enabled
- [ ] ✅ Audit logging functional
- [ ] ✅ High availability configured

---

**Deployment Guide Status**: ✅ Unified Guide Complete  
**Tier Coverage**: All tiers with platform-specific instructions  
**Next Steps**: Choose your implementation tier and follow the corresponding deployment path
