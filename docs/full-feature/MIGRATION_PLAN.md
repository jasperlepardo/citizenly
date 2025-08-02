# RBI System Migration Plan
## Records of Barangay Inhabitant System - Production Deployment Strategy

---

## 🎯 **Migration Overview**

This document outlines the complete migration strategy for deploying the RBI System from development to production environments.

### **Migration Scope**
- Database schema deployment with hierarchical household IDs
- Reference data import (PSGC + PSOC: ~47,000 records)
- Enhanced features activation (sectoral info, income classification)
- Data validation and performance optimization
- Multi-environment deployment support

---

## 📋 **Pre-Migration Checklist**

### **Environment Preparation**
- [ ] **Production Supabase project setup**
  - Database provisioned with sufficient storage
  - Service role key generated
  - Connection limits configured
  - SSL certificates verified

- [ ] **Environment Variables**
  ```env
  # Production
  NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
  SUPABASE_SERVICE_KEY=your_service_role_key
  
  # Staging  
  STAGING_SUPABASE_URL=https://staging-project.supabase.co
  STAGING_SERVICE_KEY=staging_service_role_key
  ```

- [ ] **Backup Strategy**
  - Current database backup created
  - Point-in-time recovery enabled
  - Backup retention policy configured (30 days minimum)

- [ ] **Performance Baseline**
  - Current query performance metrics recorded
  - Connection pool limits documented
  - Memory usage patterns analyzed

---

## 🚀 **Migration Execution Plan**

### **Phase 1: Schema Deployment** (30 minutes)
**Order of Execution:**

#### **Step 1.1: Core Schema Setup** ⏱️ 5 minutes
```bash
# Deploy production-ready schema
psql -h your-db-host -U postgres -d postgres -f database/schema.sql
```

**Validation Checkpoints:**
- [ ] All 30+ tables created successfully
- [ ] All enum types defined correctly  
- [ ] All indexes created (performance critical)
- [ ] RLS policies enabled on all tables
- [ ] Triggers and functions deployed

#### **Step 1.2: Schema Verification** ⏱️ 5 minutes
```sql
-- Verify schema version
SELECT * FROM schema_version;

-- Check table counts
SELECT 
    schemaname,
    tablename,
    hasindexes,
    hasrules,
    hastriggers
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- Verify RLS policies
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' AND rowsecurity = true;
```

### **Phase 2: Reference Data Import** (45 minutes)
**Critical Path - Must Complete Successfully**

#### **Step 2.1: PSGC Geographic Data** ⏱️ 25 minutes
```bash
cd database/migrations
npm install
npm run import
```

**Import Sequence & Validation:**
1. **Regions** (~17 records) ⏱️ 1 min
   ```sql
   SELECT COUNT(*) FROM psgc_regions; -- Expected: 17
   ```

2. **Provinces** (~81 records) ⏱️ 2 min
   ```sql
   SELECT COUNT(*) FROM psgc_provinces; -- Expected: 81
   SELECT COUNT(*) FROM psgc_provinces WHERE region_code IS NULL; -- Expected: 0
   ```

3. **Cities/Municipalities** (~1,634 records) ⏱️ 5 min
   ```sql
   SELECT COUNT(*) FROM psgc_cities_municipalities; -- Expected: ~1,634
   SELECT COUNT(*) FROM psgc_cities_municipalities WHERE province_code IS NULL; -- Expected: 0
   ```

4. **Barangays** (~42,046 records) ⏱️ 15 min
   ```sql
   SELECT COUNT(*) FROM psgc_barangays; -- Expected: ~42,046
   SELECT COUNT(*) FROM psgc_barangays WHERE city_municipality_code IS NULL; -- Expected: 0
   ```

#### **Step 2.2: PSOC Occupation Data** ⏱️ 15 minutes
**Import Sequence:**
1. **Major Groups** (~10 records) ⏱️ 1 min
2. **Sub-Major Groups** (~43 records) ⏱️ 1 min  
3. **Minor Groups** (~130 records) ⏱️ 2 min
4. **Unit Groups** (~436 records) ⏱️ 3 min
5. **Unit Sub-Groups** (~2,560 records) ⏱️ 5 min
6. **Cross-References** (~900 records) ⏱️ 3 min

**Validation Query:**
```sql
-- Test PSOC search functionality
SELECT * FROM psoc_occupation_search 
WHERE occupation_title ILIKE '%congressman%'
LIMIT 5;

-- Verify hierarchy integrity
SELECT 
    mg.title as major_group,
    COUNT(smg.code) as sub_major_count,
    COUNT(ming.code) as minor_count,
    COUNT(ug.code) as unit_count
FROM psoc_major_groups mg
LEFT JOIN psoc_sub_major_groups smg ON mg.code = smg.major_code
LEFT JOIN psoc_minor_groups ming ON smg.code = ming.sub_major_code  
LEFT JOIN psoc_unit_groups ug ON ming.code = ug.minor_code
GROUP BY mg.code, mg.title
ORDER BY mg.code;
```

#### **Step 2.3: Data Import Verification** ⏱️ 5 minutes
```sql
-- Comprehensive reference data check
SELECT 
    'psgc_regions' as table_name, COUNT(*) as record_count FROM psgc_regions
UNION ALL
SELECT 'psgc_provinces', COUNT(*) FROM psgc_provinces  
UNION ALL
SELECT 'psgc_cities_municipalities', COUNT(*) FROM psgc_cities_municipalities
UNION ALL
SELECT 'psgc_barangays', COUNT(*) FROM psgc_barangays
UNION ALL
SELECT 'psoc_major_groups', COUNT(*) FROM psoc_major_groups
UNION ALL
SELECT 'psoc_unit_groups', COUNT(*) FROM psoc_unit_groups
UNION ALL
SELECT 'psoc_occupation_search', COUNT(*) FROM psoc_occupation_search;

-- Expected totals: ~47,000+ records
```

### **Phase 3: Initial Data Setup** (15 minutes)

#### **Step 3.1: User Roles Setup** ⏱️ 5 minutes
```sql
-- Verify default roles created
SELECT name, description FROM roles ORDER BY name;

-- Expected roles:
-- - Super Admin, Barangay Admin, Clerk, Resident
```

#### **Step 3.2: Test User Account** ⏱️ 5 minutes
```sql
-- Create test barangay account for validation
-- (Actual user creation done through Supabase Auth UI)

-- Test query after user creation:
SELECT 
    up.email,
    r.name as role_name,
    ba.barangay_code,
    b.name as barangay_name
FROM user_profiles up
JOIN roles r ON up.role_id = r.id
LEFT JOIN barangay_accounts ba ON up.id = ba.user_id
LEFT JOIN psgc_barangays b ON ba.barangay_code = b.code
LIMIT 5;
```

#### **Step 3.3: System Health Check** ⏱️ 5 minutes
```sql
-- Test all major views
SELECT 'psoc_occupation_search' as view_name, COUNT(*) as record_count 
FROM psoc_occupation_search
UNION ALL
SELECT 'address_hierarchy', COUNT(*) FROM address_hierarchy
UNION ALL  
SELECT 'households_complete', COUNT(*) FROM households_complete
UNION ALL
SELECT 'residents_with_sectoral', COUNT(*) FROM residents_with_sectoral;

-- Test hierarchical ID generation
SELECT generate_hierarchical_household_id('042114014', NULL, NULL) as sample_household_id;
-- Expected format: 042114014-0000-0000-0001
```

---

## 🔄 **Rollback Procedures**

### **Emergency Rollback Plan**

#### **Level 1: Schema Issues** 
```bash
# Restore from backup
pg_restore -h your-db-host -U postgres -d postgres backup_file.sql

# Or selective rollback
DROP SCHEMA public CASCADE;
CREATE SCHEMA public;
# Re-run previous stable schema
```

#### **Level 2: Data Import Issues**
```sql
-- Clear reference data only
TRUNCATE TABLE psgc_barangays CASCADE;
TRUNCATE TABLE psgc_cities_municipalities CASCADE;  
TRUNCATE TABLE psgc_provinces CASCADE;
TRUNCATE TABLE psgc_regions CASCADE;
TRUNCATE TABLE psoc_unit_sub_groups CASCADE;
TRUNCATE TABLE psoc_unit_groups CASCADE;
TRUNCATE TABLE psoc_minor_groups CASCADE;
TRUNCATE TABLE psoc_sub_major_groups CASCADE;
TRUNCATE TABLE psoc_major_groups CASCADE;

-- Re-run import with corrected data
npm run import
```

#### **Level 3: Performance Issues**
```sql
-- Disable non-critical indexes temporarily
DROP INDEX IF EXISTS idx_residents_search_vector;
DROP INDEX IF EXISTS idx_audit_logs_created_at;

-- Re-create after optimization
```

---

## 📊 **Performance Monitoring**

### **Key Metrics to Monitor**

#### **During Migration**
- [ ] **Import Speed**: Target 1000 records/minute minimum
- [ ] **Memory Usage**: Should not exceed 80% of available RAM
- [ ] **Connection Count**: Monitor for connection exhaustion
- [ ] **Disk Space**: Ensure 2x current data size available

#### **Post-Migration Health Checks**
```sql
-- Query performance test
EXPLAIN ANALYZE 
SELECT * FROM psoc_occupation_search 
WHERE occupation_title ILIKE '%manager%'
LIMIT 10;
-- Target: < 50ms execution time

-- Index usage verification  
SELECT 
    schemaname,
    tablename,
    indexname,
    idx_scan,
    idx_tup_read,
    idx_tup_fetch
FROM pg_stat_user_indexes 
WHERE idx_scan = 0
ORDER BY tablename;
-- Target: No unused indexes on core tables
```

### **Performance Benchmarks**
- **PSGC Search**: < 100ms for any geographic lookup
- **PSOC Search**: < 50ms for occupation search with ILIKE
- **Household ID Generation**: < 10ms per ID
- **RLS Policy Overhead**: < 20% query time increase

---

## 🌍 **Environment-Specific Configurations**

### **Development Environment**
```env
# Relaxed constraints for testing
ENABLE_RLS=false
DEBUG_QUERIES=true
BATCH_SIZE=100
```

### **Staging Environment**  
```env
# Production-like with monitoring
ENABLE_RLS=true
DEBUG_QUERIES=true  
BATCH_SIZE=1000
MONITORING_ENABLED=true
```

### **Production Environment**
```env
# Maximum security and performance
ENABLE_RLS=true
DEBUG_QUERIES=false
BATCH_SIZE=1000
MONITORING_ENABLED=true
AUTO_VACUUM=true
```

---

## ✅ **Post-Migration Validation**

### **Functional Testing Checklist**

#### **Authentication & Authorization**
- [ ] User registration works
- [ ] RLS policies prevent cross-barangay access
- [ ] Role-based permissions enforced

#### **Core Functionality**
- [ ] Household creation with hierarchical ID
- [ ] Resident registration with auto-address population
- [ ] PSOC occupation search functional
- [ ] Sectoral information auto-population works
- [ ] Income classification triggers working

#### **Data Integrity**
- [ ] Foreign key constraints enforced
- [ ] Enum values validated
- [ ] Auto-calculated fields updating correctly
- [ ] Audit logging capturing all changes

### **Performance Validation**
```sql
-- Load testing queries
-- 1. Bulk household creation simulation
INSERT INTO households (household_number, barangay_code) 
SELECT 
    'TEST-' || generate_series,
    '042114014'
FROM generate_series(1, 1000);

-- 2. Mass resident search
SELECT COUNT(*) FROM residents_with_sectoral 
WHERE search_vector @@ to_tsquery('english', 'juan');

-- 3. Income analytics performance  
SELECT * FROM household_income_analytics 
WHERE barangay_code = '042114014';
```

---

## 📈 **Success Criteria**

### **Migration Success Indicators**
- [ ] **Schema Deployment**: 100% tables/views/functions created
- [ ] **Data Import**: 47,000+ reference records imported successfully
- [ ] **Functionality**: All core features operational
- [ ] **Performance**: All queries meet benchmark targets
- [ ] **Security**: RLS policies active and tested
- [ ] **Monitoring**: All health checks passing

### **Go-Live Criteria**
- [ ] **User Acceptance Testing**: Completed successfully
- [ ] **Load Testing**: System handles expected concurrent users
- [ ] **Backup/Recovery**: Verified and documented
- [ ] **Support Documentation**: Complete and accessible
- [ ] **Training**: Barangay staff trained on system

---

## 📞 **Support & Escalation**

### **Migration Team Contacts**
- **Technical Lead**: Database deployment and troubleshooting
- **Data Specialist**: Reference data import and validation
- **DevOps Engineer**: Infrastructure and performance monitoring
- **Product Manager**: Business requirements and acceptance criteria

### **Escalation Triggers**
- **Critical**: Migration fails completely (rollback immediately)
- **High**: Data import errors >5% of records
- **Medium**: Performance degradation >50% of benchmarks
- **Low**: Non-critical feature issues

---

## 📚 **Documentation References**

- **Schema Documentation**: `/database/schema.sql` (lines 1585-1664)
- **Field Mappings**: `/FIELD_MAPPING.md`
- **Data Import Guide**: `/database/migrations/README.md`
- **Performance Optimization**: `/database/FREE_TIER_OPTIMIZATION.md`

---

**Migration Plan Version**: 1.0  
**Last Updated**: Production Deployment Ready  
**Next Review**: Post-deployment within 48 hours

---

*This migration plan ensures zero-downtime deployment with comprehensive validation and rollback procedures for the RBI System production launch.*