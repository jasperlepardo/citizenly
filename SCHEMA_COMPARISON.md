# Schema Alignment Analysis

## Original schema.sql vs Current Database

### ✅ **ALIGNED COMPONENTS**

#### **1. Enums**
- All enum types match exactly
- sex_enum, civil_status_enum, citizenship_enum, etc.

#### **2. PSGC Tables** 
- psgc_regions, psgc_provinces, psgc_cities_municipalities, psgc_barangays
- Structure matches original schema

#### **3. PSOC Tables**
- psoc_major_groups, psoc_sub_major_groups, etc.
- Occupation search view aligned

#### **4. Core Tables (Base Structure)**
- residents table structure matches
- households table structure matches
- resident_relationships table matches

---

### ❌ **MISALIGNED COMPONENTS**

#### **1. user_profiles Table**

**Original schema.sql:**
```sql
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role_id UUID NOT NULL REFERENCES roles(id),
    barangay_code VARCHAR(10) REFERENCES psgc_barangays(code),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Current database (after our fixes):**
```sql
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    role_id UUID REFERENCES roles(id),  -- ⚠️ NOW NULLABLE (was NOT NULL)
    barangay_code VARCHAR(10) REFERENCES psgc_barangays(code),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- ➕ ADDED COLUMNS (not in original):
    mobile_number VARCHAR(20),
    status VARCHAR(50) DEFAULT 'pending_approval'
);
```

#### **2. Missing Table: barangay_accounts**

**Not in original schema.sql but EXISTS in current database:**
```sql
CREATE TABLE barangay_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    barangay_code VARCHAR(10) NOT NULL REFERENCES psgc_barangays(code),
    role_id UUID REFERENCES roles(id),
    status VARCHAR(50) DEFAULT 'pending_approval',
    approved_by UUID,
    approved_at TIMESTAMPTZ,
    is_primary BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### **3. RLS Policies**

**Original schema.sql has basic RLS:**
```sql
-- Basic RLS Policies (Barangay-scoped)
CREATE POLICY residents_barangay_policy ON residents...
CREATE POLICY households_barangay_policy ON households...
CREATE POLICY user_profiles_own_policy ON user_profiles...
```

**Current database has enhanced RLS:**
- Additional policies for signup (insert, select, update)
- Policies for barangay_accounts table
- More granular permission controls

---

### 🔄 **SCHEMA EVOLUTION SUMMARY**

The current schema has **evolved beyond** the original schema.sql to support:

1. **Enhanced User Management**
   - User signup workflow with approval status
   - Mobile number tracking
   - Multi-barangay account support

2. **Improved Access Control**
   - Barangay account assignments
   - Approval workflows
   - Primary account designation

3. **Better User Experience**
   - Nullable role_id for signup flow
   - Status tracking for account approval
   - Enhanced RLS for secure operations

---

### 📋 **RECOMMENDATIONS**

#### **Option 1: Update schema.sql to match current (Recommended)**
- Update the schema.sql file to reflect current working structure
- Include barangay_accounts table
- Update user_profiles with new columns
- Add enhanced RLS policies

#### **Option 2: Reset to original schema**
- Drop added columns and tables
- Revert to original structure
- Will break current signup workflow

#### **Option 3: Hybrid approach**
- Keep current working structure
- Document differences clearly
- Maintain both versions for different deployment scenarios

---

### 🎯 **CURRENT STATUS**

**The database is FUNCTIONALLY CORRECT** for the application requirements but **STRUCTURALLY DIFFERENT** from the original schema.sql file.

**Recommendation: Update schema.sql to match the working database structure.**