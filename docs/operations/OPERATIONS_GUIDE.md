# RBI System - Operations Guide

## Performance Optimization, Maintenance, and Troubleshooting

---

## 🛠️ Operations Overview

### Operations Philosophy

- ✅ **Proactive monitoring** - Prevent issues before they occur
- ✅ **Performance optimization** - Maximize system efficiency
- ✅ **Cost management** - Optimize resource utilization
- ✅ **Reliability assurance** - Maintain high availability

### Operations Documentation

- **[MONITORING_GUIDE.md](./MONITORING_GUIDE.md)** - System health tracking and alerting
- **OPERATIONS_GUIDE.md** (this file) - Performance optimization and maintenance

---

## 🎯 Free Tier Optimization

### Key Optimization Areas

#### Database Performance

- **Index Management** - 12 essential indexes only
- **Query Optimization** - Simple queries vs complex JOINs
- **Data Structure** - Denormalized for performance
- **Size Management** - Stay under 500MB limit

#### Application Performance

- **Client-Side Calculations** - Reduce API calls
- **Caching Strategies** - Optimize React Query usage
- **Bundle Optimization** - Minimize JavaScript size
- **Mobile Performance** - Touch-friendly, fast loading

#### Cost Management

- **API Call Reduction** - Batch operations efficiently
- **Resource Monitoring** - Track usage patterns
- **Growth Planning** - Monitor approaching limits
- **Upgrade Triggers** - Know when to scale up

---

## ⚡ Quick Optimization Checklist

### Database Optimization

- [ ] **Monitor database size** - Stay under 500MB
- [ ] **Review slow queries** - Optimize queries >200ms
- [ ] **Check index usage** - Ensure indexes are being used
- [ ] **Analyze table growth** - Monitor data growth patterns
- [ ] **Update statistics** - Keep query planner current

### Application Optimization

- [ ] **Enable caching** - Configure React Query properly
- [ ] **Optimize images** - Use Next.js Image optimization
- [ ] **Bundle analysis** - Monitor JavaScript bundle size
- [ ] **Performance profiling** - Use browser dev tools
- [ ] **Mobile testing** - Test on actual mobile devices

### User Experience Optimization

- [ ] **Loading states** - Provide feedback during operations
- [ ] **Error handling** - Clear, actionable error messages
- [ ] **Form validation** - Real-time validation feedback
- [ ] **Search optimization** - Fast, relevant search results
- [ ] **Mobile responsiveness** - Touch-friendly interfaces

---

## 🚨 Troubleshooting Guide

### Database Performance Issues

#### Slow Query Performance

```sql
-- Symptoms: Queries taking >1 second
-- Diagnosis: Check pg_stat_statements
SELECT query, mean_exec_time FROM pg_stat_statements
WHERE mean_exec_time > 1000 ORDER BY mean_exec_time DESC;

-- Solutions:
-- 1. Add missing indexes
CREATE INDEX idx_residents_barangay ON residents(barangay_code);
CREATE INDEX idx_residents_created ON residents(created_at DESC);

-- 2. Optimize complex queries
-- Before: Complex JOIN
SELECT * FROM residents r
LEFT JOIN households h ON r.household_id = h.id
LEFT JOIN psgc_municipalities m ON r.municipality_code = m.code;

-- After: Simplified with selective columns
SELECT r.id, r.name, h.address, m.name as municipality
FROM residents r, households h, psgc_municipalities m
WHERE r.household_id = h.id
AND r.municipality_code = m.code;

-- 3. Use materialized views for complex aggregations
CREATE MATERIALIZED VIEW resident_statistics AS
SELECT barangay_code, COUNT(*) as total,
       COUNT(CASE WHEN sex = 'M' THEN 1 END) as male_count,
       COUNT(CASE WHEN sex = 'F' THEN 1 END) as female_count
FROM residents GROUP BY barangay_code;

-- Refresh periodically
REFRESH MATERIALIZED VIEW resident_statistics;
```

#### Database Size Growth

```sql
-- Symptoms: Approaching 500MB limit
-- Diagnosis: Check table sizes
SELECT
    tablename,
    pg_size_pretty(pg_total_relation_size(tablename::regclass)) as size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(tablename::regclass) DESC;

-- Solutions:
-- 1. Archive old data
CREATE TABLE residents_archive AS
SELECT * FROM residents WHERE created_at < NOW() - INTERVAL '2 years';
DELETE FROM residents WHERE created_at < NOW() - INTERVAL '2 years';

-- 2. Optimize data types
ALTER TABLE residents ALTER COLUMN middle_name TYPE VARCHAR(50);
ALTER TABLE residents ALTER COLUMN notes TYPE VARCHAR(500);

-- 3. Remove unused indexes
DROP INDEX IF EXISTS idx_residents_temp;

-- 4. Vacuum and analyze
VACUUM FULL residents;
ANALYZE residents;
```

### Application Performance Issues

#### Slow Page Load Times

**Symptoms**: Pages loading >3 seconds

**Diagnosis**:

```bash
# Run Lighthouse audit
npm run build
npm run start
# Open Chrome DevTools > Lighthouse > Generate report

# Check bundle size
npm run analyze
```

**Solutions**:

```typescript
// 1. Implement code splitting
const ResidentForm = dynamic(() => import('@/components/ResidentForm'), {
  loading: () => <LoadingSpinner />,
  ssr: false
});

// 2. Optimize images
import Image from 'next/image';
<Image
  src="/logo.png"
  alt="Logo"
  width={200}
  height={100}
  priority={false}
  loading="lazy"
/>

// 3. Enable caching
export const revalidate = 3600; // Cache for 1 hour

// 4. Minimize JavaScript
// next.config.js
module.exports = {
  swcMinify: true,
  compress: true,
};
```

#### Poor Mobile Performance

**Symptoms**: Slow response on mobile devices

**Solutions**:

```css
/* 1. Optimize touch targets */
.button {
  min-height: 44px;
  min-width: 44px;
  padding: 12px 16px;
}

/* 2. Reduce animations on mobile */
@media (max-width: 768px) {
  * {
    animation-duration: 0.3s !important;
    transition-duration: 0.3s !important;
  }
}

/* 3. Use CSS containment */
.card {
  contain: layout style paint;
}
```

### Common Error Fixes

#### Authentication Errors

```typescript
// Error: "Invalid refresh token"
// Solution: Clear and reset auth
await supabase.auth.signOut();
localStorage.clear();
window.location.href = '/login';

// Error: "JWT expired"
// Solution: Implement token refresh
const {
  data: { session },
} = await supabase.auth.getSession();
if (session?.expires_at && Date.now() > session.expires_at * 1000) {
  await supabase.auth.refreshSession();
}
```

#### Database Connection Errors

```typescript
// Error: "Too many connections"
// Solution: Use connection pooling
const supabase = createClient(url, key, {
  db: {
    poolSize: 10,
    maxPoolSize: 20,
    idleTimeoutMillis: 30000,
  },
});

// Error: "Connection timeout"
// Solution: Implement retry logic
async function queryWithRetry(query, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await query();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(r => setTimeout(r, 1000 * Math.pow(2, i)));
    }
  }
}
```

---

## 🔧 Maintenance Procedures

### Daily Tasks

- [ ] Check system health dashboard
- [ ] Review error logs for patterns
- [ ] Verify backup completion
- [ ] Monitor active user count

### Weekly Tasks

- [ ] Analyze slow query report
- [ ] Check database size growth
- [ ] Review performance metrics
- [ ] Update documentation if needed

### Monthly Tasks

- [ ] Full performance audit
- [ ] User feedback analysis
- [ ] Capacity planning review
- [ ] Security updates check

### Quarterly Tasks

- [ ] Disaster recovery test
- [ ] Cost optimization review
- [ ] Major version updates
- [ ] Architecture review

---

## 📈 Capacity Planning

### Growth Monitoring

```sql
-- Track growth trends
WITH monthly_growth AS (
  SELECT
    DATE_TRUNC('month', created_at) as month,
    COUNT(*) as new_residents,
    SUM(COUNT(*)) OVER (ORDER BY DATE_TRUNC('month', created_at)) as cumulative
  FROM residents
  GROUP BY month
)
SELECT
  month,
  new_residents,
  cumulative,
  ROUND(100.0 * new_residents / LAG(new_residents) OVER (ORDER BY month) - 100, 2) as growth_rate
FROM monthly_growth
ORDER BY month DESC
LIMIT 12;
```

### Scaling Triggers

#### Consider Standard Tier ($25/month) When:

- Database size > 400MB (80% of limit)
- Query performance > 500ms average
- Need for advanced features (reports, multi-barangay)
- User complaints about performance
- More than 100 daily active users

#### Consider Enterprise Tier ($100/month) When:

- Database size > 5GB
- Need real-time analytics
- API access requirements
- Mobile app deployment
- More than 500 daily active users

---

## 📞 Emergency Procedures

### System Outage

1. **Check service status**:
   - Vercel: status.vercel.com
   - Supabase: status.supabase.com
2. **Check health endpoint**: `/api/health`
3. **Review error logs** in Vercel dashboard
4. **Restart services** if needed
5. **Communicate** with users via status page

### Performance Degradation

```bash
# 1. Check database connections
SELECT count(*) FROM pg_stat_activity;

# 2. Kill idle connections
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE state = 'idle'
AND state_change < NOW() - INTERVAL '10 minutes';

# 3. Clear application cache
npm run cache:clear

# 4. Restart application
vercel redeploy --force
```

### Data Corruption

```bash
# 1. Stop writes immediately
ALTER DATABASE postgres SET default_transaction_read_only = on;

# 2. Backup current state
pg_dump $DATABASE_URL > backup-corruption-$(date +%Y%m%d).sql

# 3. Identify corrupted data
SELECT * FROM residents WHERE created_at IS NULL OR id IS NULL;

# 4. Restore from backup
psql $DATABASE_URL < backup-last-known-good.sql

# 5. Re-enable writes
ALTER DATABASE postgres SET default_transaction_read_only = off;
```

### Security Incident

1. **Isolate the system** - Enable maintenance mode
2. **Assess impact** - Check logs for unauthorized access
3. **Reset credentials** - Rotate all API keys and passwords
4. **Audit changes** - Review recent database modifications
5. **Restore security** - Apply patches and updates
6. **Document incident** - Create post-mortem report

---

## 📊 Performance Benchmarks

### Target Metrics

| Metric               | MVP Target | Standard Target | Enterprise Target |
| -------------------- | ---------- | --------------- | ----------------- |
| **Page Load**        | <3s        | <2s             | <1.5s             |
| **API Response**     | <500ms     | <300ms          | <200ms            |
| **Database Query**   | <200ms     | <100ms          | <50ms             |
| **Error Rate**       | <2%        | <1%             | <0.5%             |
| **Uptime**           | 99.5%      | 99.9%           | 99.95%            |
| **Concurrent Users** | 50         | 200             | 1000+             |

### Performance Testing

```bash
# Load testing with Artillery
npm install -g artillery

# Create test scenario
cat > load-test.yml << EOF
config:
  target: "https://your-app.vercel.app"
  phases:
    - duration: 60
      arrivalRate: 10
scenarios:
  - name: "Browse Dashboard"
    flow:
      - get:
          url: "/api/health"
      - get:
          url: "/api/residents"
EOF

# Run test
artillery run load-test.yml
```

---

**Operations Guide Status**: ✅ **Production Ready**  
This guide provides comprehensive operations procedures for maintaining optimal system performance and handling common issues.
