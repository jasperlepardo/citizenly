# RBI System - Complete Migration Guide

## System Migration, Upgrades, and Data Transfer Procedures

---

## 📋 **Migration Overview**

This guide covers all migration scenarios for the RBI System, from initial deployment to tier upgrades and data transfers.

### **Migration Types**

| Migration Type            | Scope                       | Timeline  | Complexity |
| ------------------------- | --------------------------- | --------- | ---------- |
| **🆕 Fresh Installation** | New deployment              | 2-4 hours | Simple     |
| **🔄 Tier Upgrade**       | MVP → Standard → Enterprise | 2-6 hours | Moderate   |
| **📊 Data Migration**     | System → System transfer    | 4-8 hours | Complex    |
| **🏢 Legacy Migration**   | Existing system → RBI       | 1-3 days  | Advanced   |

### **Migration Paths**

```
Legacy System ──→ RBI MVP ──→ RBI Standard ──→ RBI Enterprise
     ↓              ↓             ↓              ↓
   Manual         Free Tier    Enhanced      Full Features
  Migration      Optimized    Performance    & Analytics
   (1-3 days)     (0 cost)     ($25+/month)  ($100+/month)
```

---

## 🆕 **Fresh Installation Migration**

### **Scenario: New RBI System Deployment**

- **From**: No existing system
- **To**: RBI System (any tier)
- **Data**: Manual population or CSV import
- **Timeline**: 2-4 hours

### **Migration Steps**

#### **Phase 1: System Setup (30 minutes)**

```bash
# 1. Deploy database schema
psql $DATABASE_URL -f database/schema.sql

# 2. Import reference data (PSGC + PSOC)
cd database/migrations
npm install && npm run import

# 3. Configure authentication
# Follow deployment guide for tier-specific setup
```

#### **Phase 2: Initial Data Population (1-2 hours)**

```bash
# Option A: Manual data entry via UI
# - Start with household registration
# - Add residents to households
# - Verify data integrity

# Option B: CSV import (if you have existing data)
npm run import:residents -- --file=your-residents.csv
npm run import:households -- --file=your-households.csv
```

#### **Phase 3: User Setup & Training (1-2 hours)**

```sql
-- Create initial admin users
INSERT INTO user_profiles (email, role, barangay_code) VALUES
('admin@yourdomain.com', 'super_admin', 'your-barangay-code'),
('staff@yourdomain.com', 'barangay_staff', 'your-barangay-code');
```

### **Validation Checklist**

- [ ] ✅ All reference data imported (46K+ records)
- [ ] ✅ Authentication working
- [ ] ✅ Users can create households/residents
- [ ] ✅ Search functionality operational
- [ ] ✅ Data export working

---

## 🔄 **Tier Upgrade Migration**

### **MVP → Standard Tier Upgrade**

#### **Prerequisites**

- [ ] **MVP system operational** for at least 2 weeks
- [ ] **Supabase Pro plan** activated ($25+/month)
- [ ] **Data backup** completed
- [ ] **Maintenance window** scheduled (2-3 hours)

#### **Migration Steps**

##### **Phase 1: Database Enhancement (45 minutes)**

```bash
# 1. Create backup
pg_dump $SUPABASE_DB_URL > backup-pre-standard-upgrade.sql

# 2. Enable additional extensions
psql $SUPABASE_DB_URL -c "CREATE EXTENSION IF NOT EXISTS pg_trgm;"
psql $SUPABASE_DB_URL -c "CREATE EXTENSION IF NOT EXISTS unaccent;"

# 3. Deploy enhanced indexes
psql $SUPABASE_DB_URL -f database/enhancements/standard-indexes.sql

# 4. Create analytics views
psql $SUPABASE_DB_URL -f database/views/analytics-views.sql
```

##### **Phase 2: Application Configuration (30 minutes)**

```bash
# 1. Update environment variables
NEXT_PUBLIC_IMPLEMENTATION_TIER=standard
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_ADVANCED_SEARCH=true
NEXT_PUBLIC_MAX_RECORDS_PER_PAGE=500

# 2. Rebuild and deploy application
npm run build:standard
vercel --prod
```

##### **Phase 3: Feature Validation (30 minutes)**

- [ ] ✅ Enhanced search operational
- [ ] ✅ Analytics dashboard displays data
- [ ] ✅ Export features working
- [ ] ✅ Performance improved (verify query times)

#### **Rollback Procedure (if needed)**

```bash
# 1. Restore previous application version
vercel rollback

# 2. Revert database changes (if necessary)
# Remove new indexes
DROP INDEX IF EXISTS idx_residents_enhanced_search;
DROP INDEX IF EXISTS idx_households_analytics;

# 3. Revert environment variables
NEXT_PUBLIC_IMPLEMENTATION_TIER=mvp
```

### **Standard → Enterprise Tier Upgrade**

#### **Prerequisites**

- [ ] **Standard tier operational** for at least 1 month
- [ ] **Enterprise budget approved** ($100+/month)
- [ ] **Advanced features requirement** validated
- [ ] **Extended maintenance window** (4-6 hours)

#### **Migration Steps**

##### **Phase 1: Infrastructure Upgrade (2 hours)**

```bash
# 1. Upgrade to enterprise database plan
# - Increase storage allocation
# - Enable advanced compute resources
# - Configure high availability

# 2. Deploy enterprise schema enhancements
psql $SUPABASE_DB_URL -f database/enterprise/full-text-search.sql
psql $SUPABASE_DB_URL -f database/enterprise/advanced-analytics.sql
psql $SUPABASE_DB_URL -f database/enterprise/audit-logging.sql
```

##### **Phase 2: Advanced Features (2 hours)**

```bash
# 1. Configure AI-powered features
# Deploy machine learning models for:
# - Occupation classification
# - Address validation
# - Data quality scoring

# 2. Set up automated reporting
# Configure scheduled reports:
# - Daily population summary
# - Weekly migration reports
# - Monthly analytics dashboard

# 3. Enable enterprise security features
# - Two-factor authentication
# - Advanced session management
# - Audit trail logging
```

##### **Phase 3: Enterprise Configuration (1-2 hours)**

```bash
# Update environment for enterprise features
NEXT_PUBLIC_IMPLEMENTATION_TIER=enterprise
NEXT_PUBLIC_ENABLE_AI_FEATURES=true
NEXT_PUBLIC_ENABLE_AUDIT_LOGGING=true
NEXT_PUBLIC_ENABLE_SCHEDULED_REPORTS=true

# Deploy enterprise application
npm run build:enterprise
vercel --prod
```

---

## 📊 **Data Migration Between Systems**

### **RBI System → RBI System Migration**

#### **Scenario: Moving between environments or upgrading infrastructure**

- **Use Cases**: Development → Production, Server migration, Backup restore
- **Timeline**: 4-8 hours depending on data volume
- **Data Preservation**: 100% with referential integrity

#### **Migration Process**

##### **Phase 1: Source System Preparation (1 hour)**

```bash
# 1. Create comprehensive backup
pg_dump $SOURCE_DB_URL > full-system-backup.sql

# 2. Export user data separately
pg_dump $SOURCE_DB_URL --table=user_profiles --table=auth.users > users-backup.sql

# 3. Export application data
pg_dump $SOURCE_DB_URL --exclude-table=psgc_* --exclude-table=psoc_* > app-data-backup.sql

# 4. Validate backup integrity
psql -f full-system-backup.sql --set ON_ERROR_STOP=on --dry-run
```

##### **Phase 2: Target System Preparation (1-2 hours)**

```bash
# 1. Deploy fresh schema on target
psql $TARGET_DB_URL -f database/schema.sql

# 2. Import reference data
cd database/migrations
npm run import

# 3. Verify target system readiness
psql $TARGET_DB_URL -c "SELECT count(*) FROM psgc_barangays;" # Should be 42K+
```

##### **Phase 3: Data Transfer (2-4 hours)**

```bash
# 1. Transfer application data (excluding reference data)
pg_restore --data-only --exclude-table=psgc_* --exclude-table=psoc_* \
  -d $TARGET_DB_URL full-system-backup.sql

# 2. Transfer user accounts
psql $TARGET_DB_URL -f users-backup.sql

# 3. Verify data integrity
psql $TARGET_DB_URL -c "
  SELECT
    'Residents' as table_name, count(*) as record_count
  FROM residents
  UNION ALL
  SELECT 'Households', count(*) FROM households
  UNION ALL
  SELECT 'Users', count(*) FROM user_profiles;
"
```

##### **Phase 4: Validation & Cleanup (1 hour)**

```bash
# 1. Test critical functionality
curl -f https://target-domain.com/api/residents?limit=5
curl -f https://target-domain.com/api/households?limit=5

# 2. Verify relationships
psql $TARGET_DB_URL -c "
  SELECT h.id, count(r.id) as resident_count
  FROM households h
  LEFT JOIN residents r ON r.household_id = h.id
  GROUP BY h.id
  LIMIT 10;
"

# 3. Clean up backup files (after validation)
# rm -f *.sql (after confirming successful migration)
```

---

## 🏢 **Legacy System Migration**

### **Existing System → RBI System Migration**

#### **Common Legacy Systems**

- **Excel/Spreadsheet-based** records
- **Basic database** (MySQL, Access)
- **Paper-based** systems (digitization required)
- **Custom software** with export capabilities

#### **Migration Strategy**

##### **Phase 1: Data Assessment (1-2 days)**

```bash
# 1. Inventory existing data
# - Identify all data sources
# - Map fields to RBI schema
# - Assess data quality
# - Calculate migration scope

# 2. Create field mapping document
# Map legacy fields to RBI fields:
# Legacy Name -> residents.first_name + residents.last_name
# Legacy Address -> households.street + households.house_number
# etc.
```

##### **Phase 2: Data Extraction (1-2 days)**

```bash
# 1. Export from legacy system
# Export to CSV format with consistent encoding (UTF-8)

# 2. Data cleaning and transformation
npm run transform:legacy -- --source=legacy-data.csv --target=rbi-format.csv

# 3. Validate transformed data
npm run validate:csv -- --file=rbi-format.csv --schema=residents
```

##### **Phase 3: Migration Execution (4-8 hours)**

```bash
# 1. Deploy RBI system (fresh installation)
# Follow fresh installation guide

# 2. Import cleaned data
npm run import:residents -- --file=cleaned-residents.csv --validate
npm run import:households -- --file=cleaned-households.csv --validate

# 3. Resolve data conflicts
# Handle duplicates, missing relationships, validation errors
```

#### **Data Transformation Scripts**

##### **Excel/CSV to RBI Format**

```javascript
// transform-legacy.js
const csv = require('csv-parser');
const fs = require('fs');

function transformLegacyData(inputFile, outputFile) {
  const results = [];

  fs.createReadStream(inputFile)
    .pipe(csv())
    .on('data', row => {
      // Transform legacy format to RBI format
      const rbiRow = {
        // Personal Information
        first_name: row['First Name'] || row['FNAME'],
        middle_name: row['Middle Name'] || row['MNAME'],
        last_name: row['Last Name'] || row['LNAME'],
        birthdate: formatDate(row['Birth Date'] || row['BDATE']),
        sex: normalizeSex(row['Gender'] || row['SEX']),

        // Address Information
        household_id: generateHouseholdId(row['Address']),

        // Handle missing or invalid data
        civil_status: normalizeCivilStatus(row['Civil Status']) || 'single',
        citizenship: 'filipino', // Default for PH systems

        // Add validation flags
        _validation_source: 'legacy_import',
        _migration_date: new Date().toISOString(),
      };

      results.push(rbiRow);
    })
    .on('end', () => {
      // Write transformed data
      const csvWriter = createCsvWriter({
        path: outputFile,
        header: Object.keys(results[0]),
      });

      csvWriter.writeRecords(results);
      console.log(`✅ Transformed ${results.length} records`);
    });
}
```

##### **Data Quality Validation**

```javascript
// validate-migration.js
function validateMigrationData(data) {
  const errors = [];
  const warnings = [];

  data.forEach((row, index) => {
    // Required field validation
    if (!row.first_name || !row.last_name) {
      errors.push(`Row ${index}: Missing required name fields`);
    }

    if (!isValidDate(row.birthdate)) {
      errors.push(`Row ${index}: Invalid birthdate format`);
    }

    // Data quality warnings
    if (!row.mobile_number) {
      warnings.push(`Row ${index}: Missing contact information`);
    }

    if (!row.household_id) {
      warnings.push(`Row ${index}: No household association`);
    }
  });

  return { errors, warnings };
}
```

---

## 🔄 **Migration Utilities & Scripts**

### **Automated Migration Scripts**

#### **migration-helper.js**

```javascript
#!/usr/bin/env node

const { Command } = require('commander');
const program = new Command();

program.name('migration-helper').description('RBI System migration utilities').version('1.0.0');

program
  .command('backup')
  .description('Create system backup')
  .option('-o, --output <file>', 'output file name')
  .action(options => {
    createSystemBackup(options.output);
  });

program
  .command('restore')
  .description('Restore from backup')
  .option('-f, --file <file>', 'backup file to restore')
  .option('--confirm', 'confirm destructive operation')
  .action(options => {
    if (!options.confirm) {
      console.log('⚠️  Use --confirm flag for destructive operations');
      process.exit(1);
    }
    restoreFromBackup(options.file);
  });

program
  .command('upgrade')
  .description('Upgrade system tier')
  .option('-f, --from <tier>', 'current tier')
  .option('-t, --to <tier>', 'target tier')
  .action(options => {
    upgradeTier(options.from, options.to);
  });

program.parse();
```

### **Pre-Migration Checklist**

#### **For All Migrations**

```bash
#!/bin/bash
# pre-migration-check.sh

echo "🔍 Pre-migration validation checklist"

# 1. Check system resources
echo "💾 Checking available storage..."
df -h | grep -E "(database|postgres)"

# 2. Verify backup integrity
echo "💾 Verifying existing backups..."
pg_dump --version
psql $DATABASE_URL -c "SELECT version();"

# 3. Check application dependencies
echo "📦 Checking dependencies..."
npm audit
npm outdated

# 4. Validate environment configuration
echo "⚙️  Validating environment..."
env | grep -E "(SUPABASE|NEXT_PUBLIC)" | wc -l

# 5. Test database connection
echo "🔗 Testing database connectivity..."
psql $DATABASE_URL -c "SELECT 'Connection: OK';"

echo "✅ Pre-migration checks complete"
```

### **Post-Migration Validation**

#### **migration-validator.js**

```javascript
// Post-migration validation suite
async function validateMigration(sourceStats, targetStats) {
  const validationResults = [];

  // 1. Record count validation
  if (sourceStats.residents !== targetStats.residents) {
    validationResults.push({
      type: 'error',
      message: `Resident count mismatch: ${sourceStats.residents} -> ${targetStats.residents}`,
    });
  }

  // 2. Referential integrity validation
  const orphanedResidents = await checkOrphanedResidents();
  if (orphanedResidents.length > 0) {
    validationResults.push({
      type: 'error',
      message: `Found ${orphanedResidents.length} residents without households`,
    });
  }

  // 3. Data quality validation
  const missingCriticalData = await checkMissingCriticalData();
  if (missingCriticalData.length > 0) {
    validationResults.push({
      type: 'warning',
      message: `${missingCriticalData.length} records missing critical information`,
    });
  }

  return validationResults;
}
```

---

## 🚨 **Troubleshooting Migration Issues**

### **Common Migration Problems**

#### **Database Connection Issues**

```bash
# Problem: Connection timeout during migration
# Solution: Increase connection timeout
export PGCONNECT_TIMEOUT=300
export PGCOMMAND_TIMEOUT=0

# Problem: Out of memory during large imports
# Solution: Use streaming import with smaller batches
pg_restore --jobs=2 --single-transaction backup.dump
```

#### **Data Integrity Issues**

```sql
-- Check for duplicate residents
SELECT first_name, last_name, birthdate, count(*)
FROM residents
GROUP BY first_name, last_name, birthdate
HAVING count(*) > 1;

-- Fix orphaned residents (no household)
UPDATE residents
SET household_id = (
  SELECT id FROM households
  WHERE barangay_code = residents.barangay_code
  LIMIT 1
)
WHERE household_id IS NULL;
```

#### **Performance Issues After Migration**

```sql
-- Rebuild statistics after large data import
ANALYZE;

-- Rebuild indexes if performance is poor
REINDEX DATABASE postgres;

-- Check for slow queries
SELECT query, mean_exec_time, calls
FROM pg_stat_statements
ORDER BY mean_exec_time DESC
LIMIT 5;
```

### **Rollback Procedures**

#### **Emergency Rollback**

```bash
# 1. Stop application (prevent new data)
vercel rollback

# 2. Restore database from backup
dropdb $DATABASE_NAME
createdb $DATABASE_NAME
psql $DATABASE_NAME < pre-migration-backup.sql

# 3. Verify rollback success
psql $DATABASE_NAME -c "SELECT count(*) FROM residents;"

# 4. Restart application on previous version
# Update environment to previous tier settings
```

---

## 📊 **Migration Success Metrics**

### **Key Performance Indicators**

| Metric                  | Target   | Validation                        |
| ----------------------- | -------- | --------------------------------- |
| **Data Completeness**   | >95%     | All critical fields populated     |
| **Migration Time**      | <8 hours | Within planned maintenance window |
| **Data Accuracy**       | >99%     | Source vs target validation       |
| **System Availability** | >99.5%   | Minimal downtime during migration |
| **User Satisfaction**   | >90%     | Post-migration user feedback      |

### **Success Criteria Checklist**

#### **Technical Success**

- [ ] ✅ All data migrated without corruption
- [ ] ✅ Referential integrity maintained
- [ ] ✅ Performance meets or exceeds expectations
- [ ] ✅ All features functional in target system
- [ ] ✅ Backup and recovery tested

#### **Business Success**

- [ ] ✅ Users can perform daily tasks
- [ ] ✅ Reports generate correct data
- [ ] ✅ Data export/import functional
- [ ] ✅ System integrations operational
- [ ] ✅ Compliance requirements met

---

## 🎯 **Migration Planning Template**

### **Project Planning Checklist**

```markdown
# Migration Project: [PROJECT_NAME]

## Timeline: [START_DATE] - [END_DATE]

### Scope

- **Migration Type**: [ ] Fresh Install [ ] Tier Upgrade [ ] System Transfer [ ] Legacy Migration
- **Data Volume**: **\_** residents, **\_** households
- **Downtime Window**: **\_** hours on [DATE/TIME]

### Resources

- **Technical Lead**: [NAME]
- **Database Admin**: [NAME]
- **Testing Lead**: [NAME]
- **Backup Contact**: [NAME]

### Pre-Migration Tasks

- [ ] Stakeholder communication sent
- [ ] Backup procedures tested
- [ ] Migration scripts validated
- [ ] Rollback plan documented
- [ ] Test environment prepared

### Migration Day Tasks

- [ ] System backup created
- [ ] Users notified of maintenance
- [ ] Migration scripts executed
- [ ] Data validation completed
- [ ] User acceptance testing
- [ ] Go-live decision made

### Post-Migration Tasks

- [ ] Performance monitoring active
- [ ] User training completed
- [ ] Documentation updated
- [ ] Lessons learned captured
- [ ] Success metrics reported
```

---

**Migration Guide Status**: ✅ Complete Migration Framework  
**Migration Types Covered**: Fresh install, tier upgrades, data migration, legacy migration  
**Next Steps**: Choose your migration scenario and follow the corresponding procedure
