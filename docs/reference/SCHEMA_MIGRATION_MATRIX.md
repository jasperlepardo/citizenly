# Schema Migration Matrix & Decision Guide

> **Database schema evolution and migration guide for the Citizenly project**
> 
> This document helps you understand the current schema structure, migration paths, and evolution strategy.

## 📊 Current Schema Overview

### **Production Schema (schema.sql)**
The current production schema includes:

| Component | Status | Description |
|-----------|--------|-------------|
| **Core Tables** | ✅ Stable | residents, households, auth_user_profiles |
| **PSGC Integration** | ✅ Complete | Full Philippine geographic hierarchy |
| **RLS Security** | ✅ Production-ready | Multi-tenant data isolation |
| **Auto-calculations** | ✅ Implemented | Age, sectoral flags, dependencies |
| **Search Optimization** | ✅ Ready | Full-text search, indexes |
| **Audit Logging** | ✅ Enabled | Change tracking and compliance |

## 🔄 Migration History

### **Version 1.0 (Current Production)**
- **File**: `database/schema.sql`
- **Features**: 
  - Complete resident management
  - Household structure with hierarchical codes
  - PSGC geographic data integration
  - Row-level security (RLS)
  - Sectoral group auto-calculation
  - Full-text search capabilities
  - Audit trail system

### **Legacy Versions (Deprecated)**
- Multiple schema variants exist in development files
- **Recommendation**: Use only `database/schema.sql` for new deployments

## 🚀 Migration Paths

### **From Legacy to Current**
```sql
-- 1. Backup existing data
pg_dump existing_db > backup_$(date +%Y%m%d).sql

-- 2. Apply current schema
psql new_db < database/schema.sql

-- 3. Migrate data with transformation
-- (Custom migration scripts needed based on source schema)

-- 4. Verify RLS policies
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual 
FROM pg_policies 
WHERE schemaname = 'public';
```

### **Schema Updates (Production)**
```bash
# 1. Create migration file
create-migration.sh "add_new_feature"

# 2. Test migration locally
supabase db reset
supabase migration up

# 3. Apply to staging
supabase db push --environment staging

# 4. Deploy to production
supabase db push --environment production
```

## 🔧 Migration Commands

### **Local Development**
```bash
# Reset to clean schema
npm run db:reset

# Apply specific migration
npm run db:migrate -- --file=20240115_add_feature.sql

# Rollback last migration
npm run db:rollback

# Generate migration from changes
npm run db:diff -- migration_name
```

### **Production Deployment**
```bash
# Pre-deployment backup
npm run db:backup

# Deploy migration
npm run db:deploy -- --environment=production

# Verify deployment
npm run db:verify -- --environment=production

# Rollback if needed (emergency only)
npm run db:rollback -- --environment=production
```

## 📋 Schema Features by Category

### **🏠 Core Functionality**
| Feature | Current Status | Notes |
|---------|---------------|-------|
| Resident Registration | ✅ Complete | Full demographic data capture |
| Household Management | ✅ Advanced | Hierarchical household codes |
| PSGC Geographic Data | ✅ Complete | Full Philippine hierarchy |
| User & Role Management | ✅ Production | RBAC with audit trail |

### **📊 Data Management**
| Feature | Current Status | Performance |
|---------|---------------|-------------|
| Search Performance | ✅ Optimized | ~50ms average query time |
| Data Validation | ✅ Automated | Triggers + constraints |
| Auto-calculations | ✅ Complete | Age, sectoral, dependencies |
| Full-text Search | ✅ Indexed | GIN trigram + tsvector |

### **👥 Resident Features**
| Feature | Implementation | Details |
|---------|---------------|---------|
| Demographics | ✅ Complete | All standard fields |
| Sectoral Classification | ✅ Auto-calculated | 13 sectoral groups |
| Occupation (PSOC) | ✅ Full hierarchy | 5-level classification |
| Address Information | ✅ PSGC + Street | Complete addressing |
| Contact Management | ✅ Multi-contact | Phone, email, emergency |

### **🏘️ Household Features**
| Feature | Implementation | Capabilities |
|---------|---------------|-------------|
| Household Structure | ✅ UUID + Codes | Unique identification |
| Member Relationships | ✅ Detailed | Family relationship tracking |
| Address Management | ✅ Complete | PSGC + street addresses |
| Head Assignment | ✅ Automated | Auto-assign household head |

## 🔒 Security & Compliance

### **Row-Level Security (RLS)**
```sql
-- Barangay isolation
CREATE POLICY "barangay_isolation" ON residents
FOR ALL USING (barangay_code = get_user_barangay_code());

-- Role-based access
CREATE POLICY "role_based_access" ON residents
FOR ALL USING (
  CASE 
    WHEN get_user_role() = 'super_admin' THEN true
    WHEN get_user_role() = 'barangay_admin' THEN 
      barangay_code = get_user_barangay_code()
    ELSE id = auth.uid()
  END
);
```

### **Data Privacy & Compliance**
- **Encryption**: Sensitive fields encrypted at rest
- **Audit Trail**: All changes logged with user attribution
- **Data Retention**: Configurable retention policies
- **Access Control**: Role-based permissions

## 📈 Performance Optimizations

### **Current Indexes**
```sql
-- Search performance
CREATE INDEX idx_residents_search ON residents USING gin(search_vector);
CREATE INDEX idx_residents_name ON residents(last_name, first_name);
CREATE INDEX idx_residents_barangay ON residents(barangay_code);

-- Household relationships
CREATE INDEX idx_households_barangay ON households(barangay_code);
CREATE INDEX idx_households_head ON households(household_head_id);

-- Geographic lookups
CREATE INDEX idx_psgc_hierarchy ON psgc_barangays(region_code, province_code, city_code);
```

### **Query Performance**
- **Average Response**: < 50ms for standard queries
- **Search Queries**: < 100ms for full-text search
- **Dashboard Stats**: < 200ms for complex aggregations
- **Bulk Operations**: Optimized for 1000+ records

## 🎯 Migration Best Practices

### **Before Migration**
1. **Full backup** of existing data
2. **Test migration** on copy of production data
3. **Verify RLS policies** match business rules
4. **Performance test** with representative data
5. **Prepare rollback plan**

### **During Migration**
1. **Monitor query performance**
2. **Verify data integrity** at each step
3. **Check constraint violations**
4. **Validate RLS enforcement**
5. **Test authentication flows**

### **After Migration**
1. **Run full test suite**
2. **Verify all features working**
3. **Monitor error logs**
4. **Check performance metrics**
5. **Update documentation**

## 🚨 Common Migration Issues

### **RLS Policy Conflicts**
```sql
-- Issue: Policies too restrictive
-- Solution: Check policy conditions
SELECT * FROM pg_policies WHERE tablename = 'residents';

-- Fix: Update policy
DROP POLICY IF EXISTS "old_policy" ON residents;
CREATE POLICY "new_policy" ON residents FOR ALL USING (...);
```

### **Data Type Mismatches**
```sql
-- Issue: Column type changed
-- Solution: Cast or transform data
ALTER TABLE residents ALTER COLUMN age TYPE INTEGER USING age::INTEGER;
```

### **Constraint Violations**
```sql
-- Issue: New constraints fail on existing data
-- Solution: Clean data first
UPDATE residents SET email = NULL WHERE email = '';
ALTER TABLE residents ADD CONSTRAINT valid_email CHECK (email ~ '^[^@]+@[^@]+\.[^@]+$');
```

## 📋 Migration Checklist

### **Pre-Migration**
- [ ] Database backup completed
- [ ] Migration script tested locally
- [ ] Rollback plan prepared
- [ ] Downtime window scheduled
- [ ] Team notified

### **Migration**
- [ ] Application maintenance mode enabled
- [ ] Migration script executed
- [ ] Data integrity verified
- [ ] RLS policies tested
- [ ] Performance benchmarks met

### **Post-Migration**
- [ ] Application functionality verified
- [ ] User acceptance testing completed
- [ ] Monitoring alerts configured
- [ ] Documentation updated
- [ ] Team training completed

---

💡 **Remember**: Always test migrations thoroughly in a staging environment before applying to production.

🔗 **Related Documentation**: 
- [Database Schema Documentation](./DATABASE_SCHEMA_DOCUMENTATION.md) for detailed schema reference
- [Deployment Guide](./DEPLOYMENT_GUIDE.md) for deployment procedures
- [Backup Recovery](./BACKUP_RECOVERY.md) for backup and recovery processes