# Schema Alignment Resolution Options

## **OPTION 1: Remove Added Fields from Formatted File**
*Restore alignment by removing the 13 added fields*

### **What this means:**
- Keep original file as-is
- Remove all added fields from formatted file  
- Result: Both files have identical functionality, formatted file just has better organization

### **Specific fields to remove:**

#### **From `residents` table:**
```sql
-- REMOVE these 11 fields that were added:
sss_no VARCHAR(20),
gsis_no VARCHAR(20), 
tin_no VARCHAR(20),
philhealth_no VARCHAR(20),
pagibig_no VARCHAR(20),
drivers_license_no VARCHAR(20),
passport_no VARCHAR(20),
salary DECIMAL(10,2),
is_osc BOOLEAN DEFAULT false,
is_osy BOOLEAN DEFAULT false,
is_senior BOOLEAN DEFAULT false,
```

#### **From `household_members` table:**
```sql
-- REMOVE this 1 field that was added:
join_date DATE,
```

#### **From `psgc_cities_municipalities` table:**
```sql
-- REMOVE this 1 field that was added:
is_city BOOLEAN DEFAULT false,
```

### **Steps to implement:**
1. Edit formatted file to remove these 13 fields
2. Remove any indexes that reference these fields
3. Remove any functions/triggers that use these fields
4. Verify complete alignment with diff command

### **Pros:**
- ✅ **True alignment** with original file
- ✅ **No risk** to existing applications
- ✅ **Simple implementation** - just remove fields
- ✅ **Maintains original scope** - formatting only

### **Cons:**
- ❌ **Loses potentially useful government ID tracking**
- ❌ **Less comprehensive** resident information
- ❌ **May disappoint** if these fields were expected

---

## **OPTION 2: Add Fields to Original File** 
*Enhance original file with the 13 added fields*

### **What this means:**
- Add all 13 fields to original file
- Both files become enhanced with government ID tracking
- Result: Both files have expanded functionality

### **Specific fields to add:**

#### **To `residents` table in original file:**
```sql
-- ADD these 11 fields from formatted file:
sss_no VARCHAR(20),
gsis_no VARCHAR(20),
tin_no VARCHAR(20), 
philhealth_no VARCHAR(20),
pagibig_no VARCHAR(20),
drivers_license_no VARCHAR(20),
passport_no VARCHAR(20),
salary DECIMAL(10,2),
is_osc BOOLEAN DEFAULT false,
is_osy BOOLEAN DEFAULT false, 
is_senior BOOLEAN DEFAULT false,
```

#### **To `household_members` table in original file:**
```sql
-- ADD this 1 field from formatted file:
join_date DATE,
```

#### **To `psgc_cities_municipalities` table in original file:**
```sql
-- ADD this 1 field from formatted file:
is_city BOOLEAN DEFAULT false,
```

### **Additional changes needed:**
```sql
-- ADD corresponding indexes:
CREATE INDEX idx_residents_sss ON residents(sss_no);
CREATE INDEX idx_residents_gsis ON residents(gsis_no);
CREATE INDEX idx_residents_tin ON residents(tin_no);
CREATE INDEX idx_residents_philhealth ON residents(philhealth_no);
CREATE INDEX idx_residents_pagibig ON residents(pagibig_no);
CREATE INDEX idx_residents_license ON residents(drivers_license_no);
CREATE INDEX idx_residents_passport ON residents(passport_no);
CREATE INDEX idx_residents_salary ON residents(salary);
CREATE INDEX idx_residents_osc ON residents(is_osc);
CREATE INDEX idx_residents_osy ON residents(is_osy);
CREATE INDEX idx_residents_is_senior ON residents(is_senior);
CREATE INDEX idx_household_members_join_date ON household_members(join_date);
CREATE INDEX idx_cities_is_city ON psgc_cities_municipalities(is_city);

-- ADD validation constraints:
ALTER TABLE residents ADD CONSTRAINT chk_salary_positive 
    CHECK (salary IS NULL OR salary >= 0);
    
-- ADD any missing functions/triggers for these fields
```

### **Pros:**
- ✅ **Enhanced functionality** with comprehensive government ID tracking
- ✅ **More complete** resident profiles
- ✅ **Better government compliance** with ID requirements
- ✅ **Future-proof** schema

### **Cons:**
- ❌ **Changes original file** scope (was supposed to be formatting only)
- ❌ **Potential breaking changes** for existing applications
- ❌ **More complexity** added to system
- ❌ **Requires testing** of new fields

---

## **OPTION 3: Create Migration Script**
*Handle differences through proper database migration*

### **What this means:**
- Keep both files as-is
- Create migration script to transition between versions
- Allow controlled upgrade from original to enhanced schema

### **Implementation approach:**

#### **Migration script structure:**
```sql
-- File: migration_v2.0_government_ids.sql
-- =====================================================
-- MIGRATION: Add Government ID Tracking
-- From: Basic schema (v1.0)
-- To: Enhanced schema with gov't IDs (v2.0)
-- =====================================================

BEGIN;

-- Version check
INSERT INTO system_schema_versions (version, description) 
VALUES ('2.0', 'Added comprehensive government ID tracking');

-- Add new fields to residents
ALTER TABLE residents 
ADD COLUMN sss_no VARCHAR(20),
ADD COLUMN gsis_no VARCHAR(20),
ADD COLUMN tin_no VARCHAR(20),
ADD COLUMN philhealth_no VARCHAR(20),
ADD COLUMN pagibig_no VARCHAR(20),
ADD COLUMN drivers_license_no VARCHAR(20),
ADD COLUMN passport_no VARCHAR(20),
ADD COLUMN salary DECIMAL(10,2),
ADD COLUMN is_osc BOOLEAN DEFAULT false,
ADD COLUMN is_osy BOOLEAN DEFAULT false,
ADD COLUMN is_senior BOOLEAN DEFAULT false;

-- Add new fields to household_members
ALTER TABLE household_members 
ADD COLUMN join_date DATE;

-- Add new fields to psgc_cities_municipalities
ALTER TABLE psgc_cities_municipalities 
ADD COLUMN is_city BOOLEAN DEFAULT false;

-- Add indexes for new fields
CREATE INDEX idx_residents_sss ON residents(sss_no);
CREATE INDEX idx_residents_gsis ON residents(gsis_no);
-- ... (all other indexes)

-- Add validation constraints
ALTER TABLE residents ADD CONSTRAINT chk_salary_positive 
    CHECK (salary IS NULL OR salary >= 0);

-- Update any existing data logic
-- (e.g., populate is_osc/is_osy based on age/education)

COMMIT;
```

#### **Rollback script:**
```sql
-- File: rollback_v2.0_government_ids.sql
-- =====================================================
-- ROLLBACK: Remove Government ID Tracking  
-- From: Enhanced schema (v2.0)
-- Back to: Basic schema (v1.0)
-- =====================================================

BEGIN;

-- Remove indexes
DROP INDEX IF EXISTS idx_residents_sss;
DROP INDEX IF EXISTS idx_residents_gsis;
-- ... (all added indexes)

-- Remove fields
ALTER TABLE residents 
DROP COLUMN IF EXISTS sss_no,
DROP COLUMN IF EXISTS gsis_no,
-- ... (all added fields)

-- Update version
DELETE FROM system_schema_versions WHERE version = '2.0';

COMMIT;
```

### **Deployment options:**
1. **Original schema**: Use `schema-full-feature.sql` for basic deployment
2. **Enhanced schema**: Use `schema-full-feature-formatted-organized.sql` for full deployment  
3. **Upgrade path**: Deploy original first, then run migration script

### **Pros:**
- ✅ **Preserves both versions** for different use cases
- ✅ **Controlled upgrade path** with proper versioning
- ✅ **Rollback capability** if issues arise
- ✅ **Clear documentation** of what changed and why
- ✅ **Flexible deployment** options

### **Cons:**
- ❌ **More complex** to maintain two versions
- ❌ **Additional files** to manage
- ❌ **Requires migration testing** before production
- ❌ **Version management** overhead

---

## **RECOMMENDATION SUMMARY:**

| Approach | Best for | Risk Level | Complexity |
|----------|----------|------------|------------|
| **Option 1** | Quick alignment, existing systems | LOW | SIMPLE |
| **Option 2** | Enhanced functionality, new systems | MEDIUM | MEDIUM |  
| **Option 3** | Production environments, flexibility | LOW | COMPLEX |

## **Questions to help decide:**

1. **Do you need government ID tracking?** (If no → Option 1, If yes → Option 2/3)
2. **Are there existing applications?** (If yes → Option 1/3, If no → Option 2)
3. **Is this for production?** (If yes → Option 3, If no → Option 1/2)
4. **Do you want migration capability?** (If yes → Option 3, If no → Option 1/2)