# RBI System - Monitoring Guide

## System Health, Performance Tracking, and Alerting

---

## 📊 Monitoring Overview

### Monitoring Stack

- **Database**: PostgreSQL built-in stats + pg_stat_statements
- **Application**: Vercel Analytics + Custom metrics
- **Uptime**: Better Uptime or Uptime Robot (free tier)
- **Errors**: Sentry (free tier - 5K events/month)
- **Logs**: Vercel Logs + Supabase Logs

### Key Metrics to Track

| Metric Type       | Target | Alert Threshold | Check Frequency |
| ----------------- | ------ | --------------- | --------------- |
| **Uptime**        | 99.9%  | <99.5%          | Every 5 min     |
| **Response Time** | <500ms | >1000ms         | Every 5 min     |
| **Error Rate**    | <1%    | >2%             | Every 15 min    |
| **Database Size** | <400MB | >450MB          | Daily           |
| **Active Users**  | N/A    | Sudden drop     | Hourly          |

---

## 🔍 Database Monitoring

### Essential Queries

#### 1. Database Size Monitoring

```sql
-- Check total database size
SELECT
    pg_database.datname,
    pg_size_pretty(pg_database_size(pg_database.datname)) AS size
FROM pg_database
WHERE datname = current_database();

-- Check individual table sizes
SELECT
    schemaname AS schema,
    tablename AS table,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
    pg_size_pretty(pg_relation_size(schemaname||'.'||tablename)) AS data_size,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename) - pg_relation_size(schemaname||'.'||tablename)) AS index_size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
LIMIT 10;

-- Growth rate tracking
SELECT
    DATE_TRUNC('day', created_at) as day,
    COUNT(*) as new_records,
    SUM(COUNT(*)) OVER (ORDER BY DATE_TRUNC('day', created_at)) as total_records
FROM residents
WHERE created_at > NOW() - INTERVAL '30 days'
GROUP BY day
ORDER BY day DESC;
```

#### 2. Query Performance Monitoring

```sql
-- Enable pg_stat_statements (run once)
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;

-- Find slow queries
SELECT
    round(mean_exec_time::numeric, 2) AS avg_ms,
    calls,
    round(total_exec_time::numeric, 2) AS total_ms,
    round((100 * total_exec_time / sum(total_exec_time) OVER ())::numeric, 2) AS percentage,
    regexp_replace(query, '\s+', ' ', 'g') AS query_text
FROM pg_stat_statements
WHERE query NOT LIKE '%pg_stat_statements%'
ORDER BY mean_exec_time DESC
LIMIT 20;

-- Find most frequent queries
SELECT
    calls,
    round(mean_exec_time::numeric, 2) AS avg_ms,
    round((calls * mean_exec_time)::numeric, 2) AS total_time_ms,
    regexp_replace(query, '\s+', ' ', 'g') AS query_text
FROM pg_stat_statements
WHERE query NOT LIKE '%pg_stat_statements%'
ORDER BY calls DESC
LIMIT 20;
```

#### 3. Connection Monitoring

```sql
-- Current connections
SELECT
    datname,
    usename,
    application_name,
    client_addr,
    state,
    COUNT(*) as connection_count
FROM pg_stat_activity
WHERE datname = current_database()
GROUP BY datname, usename, application_name, client_addr, state
ORDER BY connection_count DESC;

-- Long-running queries
SELECT
    pid,
    now() - pg_stat_activity.query_start AS duration,
    query,
    state
FROM pg_stat_activity
WHERE (now() - pg_stat_activity.query_start) > interval '5 minutes'
AND state != 'idle'
ORDER BY duration DESC;
```

#### 4. Index Usage Analysis

```sql
-- Unused indexes (candidates for removal)
SELECT
    schemaname,
    tablename,
    indexname,
    idx_scan,
    pg_size_pretty(pg_relation_size(indexrelid)) AS index_size
FROM pg_stat_user_indexes
WHERE idx_scan = 0
AND indexrelname NOT LIKE '%_pkey'
ORDER BY pg_relation_size(indexrelid) DESC;

-- Missing indexes (based on sequential scans)
SELECT
    schemaname,
    tablename,
    seq_scan,
    seq_tup_read,
    idx_scan,
    seq_tup_read / GREATEST(seq_scan, 1) AS avg_seq_read
FROM pg_stat_user_tables
WHERE seq_scan > 1000
AND seq_tup_read > 100000
ORDER BY seq_tup_read DESC;
```

---

## 📱 Application Monitoring

### Frontend Metrics

#### Core Web Vitals Tracking

```javascript
// Add to _app.tsx or layout.tsx
export function reportWebVitals(metric) {
  const metrics = {
    FCP: 'First Contentful Paint',
    LCP: 'Largest Contentful Paint',
    CLS: 'Cumulative Layout Shift',
    FID: 'First Input Delay',
    TTFB: 'Time to First Byte',
  };

  console.log(`${metrics[metric.name]}: ${metric.value}ms`);

  // Send to analytics
  if (window.gtag) {
    window.gtag('event', metric.name, {
      value: Math.round(metric.name === 'CLS' ? metric.value * 1000 : metric.value),
      event_category: 'Web Vitals',
      event_label: metric.id,
      non_interaction: true,
    });
  }
}
```

#### API Performance Tracking

```typescript
// API middleware for response time tracking
export async function middleware(request: NextRequest) {
  const start = Date.now();

  const response = NextResponse.next();

  const duration = Date.now() - start;
  response.headers.set('X-Response-Time', `${duration}ms`);

  // Log slow requests
  if (duration > 1000) {
    console.warn(`Slow API request: ${request.url} took ${duration}ms`);
  }

  return response;
}
```

### Error Tracking

#### Sentry Integration

```javascript
// sentry.client.config.ts
import * as Sentry from '@sentry/nextjs';

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
  tracesSampleRate: 0.1, // 10% of transactions
  environment: process.env.NODE_ENV,
  beforeSend(event, hint) {
    // Filter out non-critical errors
    if (event.level === 'warning') return null;
    return event;
  },
});
```

---

## 📈 Dashboard Metrics

### Create Monitoring Dashboard

```sql
-- Create a monitoring view
CREATE OR REPLACE VIEW system_metrics AS
SELECT
    -- Database metrics
    (SELECT pg_size_pretty(pg_database_size(current_database()))) as database_size,
    (SELECT COUNT(*) FROM residents) as total_residents,
    (SELECT COUNT(*) FROM households) as total_households,
    (SELECT COUNT(*) FROM user_profiles WHERE last_login > NOW() - INTERVAL '24 hours') as daily_active_users,

    -- Performance metrics
    (SELECT ROUND(AVG(mean_exec_time)::numeric, 2) FROM pg_stat_statements) as avg_query_time_ms,
    (SELECT COUNT(*) FROM pg_stat_activity WHERE state = 'active') as active_connections,

    -- Growth metrics
    (SELECT COUNT(*) FROM residents WHERE created_at > NOW() - INTERVAL '24 hours') as residents_added_24h,
    (SELECT COUNT(*) FROM households WHERE created_at > NOW() - INTERVAL '24 hours') as households_added_24h,

    -- System health
    NOW() as last_checked;

-- Query the dashboard
SELECT * FROM system_metrics;
```

---

## 🚨 Alerting Setup

### Uptime Monitoring (Better Uptime)

1. Sign up for free account at betteruptime.com
2. Add monitor:
   - URL: `https://your-app.vercel.app/api/health`
   - Check frequency: 3 minutes
   - Alert after: 2 failures
3. Configure alerts:
   - Email notifications
   - SMS for critical (paid)
   - Slack integration

### Database Alerts

```sql
-- Create alert function for size monitoring
CREATE OR REPLACE FUNCTION check_database_size()
RETURNS void AS $$
DECLARE
    current_size bigint;
    max_size bigint := 500 * 1024 * 1024; -- 500MB in bytes
    warning_size bigint := 450 * 1024 * 1024; -- 450MB in bytes
BEGIN
    SELECT pg_database_size(current_database()) INTO current_size;

    IF current_size > max_size THEN
        RAISE EXCEPTION 'Database size critical: %', pg_size_pretty(current_size);
    ELSIF current_size > warning_size THEN
        RAISE WARNING 'Database size warning: %', pg_size_pretty(current_size);
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Schedule with pg_cron (if available)
SELECT cron.schedule('check-db-size', '0 */6 * * *', 'SELECT check_database_size();');
```

### Application Health Check

```typescript
// app/api/health/route.ts
export async function GET() {
  const checks = {
    database: false,
    auth: false,
    timestamp: new Date().toISOString(),
  };

  try {
    // Check database
    const { data, error } = await supabase.from('residents').select('count').limit(1);
    checks.database = !error;

    // Check auth
    const {
      data: { user },
    } = await supabase.auth.getUser();
    checks.auth = true;

    const healthy = checks.database && checks.auth;

    return NextResponse.json(
      {
        status: healthy ? 'healthy' : 'degraded',
        checks,
      },
      { status: healthy ? 200 : 503 }
    );
  } catch (error) {
    return NextResponse.json(
      { status: 'unhealthy', checks, error: error.message },
      { status: 503 }
    );
  }
}
```

---

## 📊 Monitoring Schedule

### Daily Checks

- [ ] Database size check
- [ ] Error rate review
- [ ] Active user count
- [ ] Slow query review

### Weekly Reviews

- [ ] Performance metrics analysis
- [ ] Query optimization opportunities
- [ ] Index usage analysis
- [ ] Storage growth projection

### Monthly Analysis

- [ ] Full performance audit
- [ ] Capacity planning review
- [ ] Cost optimization check
- [ ] User satisfaction metrics

---

## 🛠️ Troubleshooting Common Issues

### High Database Usage

```sql
-- Find large tables
SELECT tablename, pg_size_pretty(pg_total_relation_size(tablename::regclass)) AS size
FROM pg_tables WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(tablename::regclass) DESC;

-- Clean up old data
DELETE FROM audit_logs WHERE created_at < NOW() - INTERVAL '90 days';
VACUUM ANALYZE;
```

### Slow Queries

```sql
-- Reset query stats
SELECT pg_stat_statements_reset();

-- Wait for some traffic, then analyze
SELECT * FROM pg_stat_statements ORDER BY mean_exec_time DESC LIMIT 10;
```

### Connection Pool Exhaustion

```sql
-- Terminate idle connections
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE datname = current_database()
AND state = 'idle'
AND state_change < NOW() - INTERVAL '10 minutes';
```

---

## 📈 Success Metrics

### Target KPIs

- **Uptime**: >99.9% monthly
- **Page Load**: <2 seconds p95
- **API Response**: <500ms p95
- **Error Rate**: <1% of requests
- **Database Size**: <80% of limit
- **Query Time**: <200ms average

### Dashboard Display

Create a monitoring page at `/admin/monitoring` showing:

- Real-time system health
- Performance graphs (last 24h)
- Error logs (last 100)
- Database metrics
- Active user count
- Recent activity feed

---

**Monitoring Guide Status**: ✅ **Ready for Implementation**  
This guide provides comprehensive monitoring strategies for both database and application layers, ensuring system health and performance optimization.
