# Partitioned Database Architecture for RBI System

## 🔄 **What is Database Partitioning?**

Database partitioning divides large tables into smaller, more manageable pieces called **partitions**, while logically appearing as a single table. Each partition can be stored separately and queried independently or together.

---

## 📊 **Partitioning Strategies for RBI System**

### **1. Range Partitioning by Date**
*Split tables by time periods*

#### **Example: Partitioned `system_audit_logs` by Month**

```sql
-- Parent table (partitioned)
CREATE TABLE system_audit_logs (
    id UUID DEFAULT uuid_generate_v4(),
    table_name VARCHAR(50) NOT NULL,
    record_id UUID NOT NULL,
    operation VARCHAR(10) NOT NULL,
    old_values JSONB,
    new_values JSONB,
    user_id UUID REFERENCES auth_user_profiles(id),
    barangay_code VARCHAR(10) REFERENCES psgc_barangays(code),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (id, created_at)  -- Include partition key in PK
) PARTITION BY RANGE (created_at);

-- Monthly partitions
CREATE TABLE system_audit_logs_2025_01 PARTITION OF system_audit_logs
    FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');

CREATE TABLE system_audit_logs_2025_02 PARTITION OF system_audit_logs
    FOR VALUES FROM ('2025-02-01') TO ('2025-03-01');

CREATE TABLE system_audit_logs_2025_03 PARTITION OF system_audit_logs
    FOR VALUES FROM ('2025-03-01') TO ('2025-04-01');

-- Future partitions (can be created automatically)
CREATE TABLE system_audit_logs_2025_04 PARTITION OF system_audit_logs
    FOR VALUES FROM ('2025-04-01') TO ('2025-05-01');
```

**File Structure:**
```
📁 Database Storage
├── 📄 system_audit_logs_2025_01  (Jan data only)
├── 📄 system_audit_logs_2025_02  (Feb data only)  
├── 📄 system_audit_logs_2025_03  (Mar data only)
└── 📄 system_audit_logs_2025_04  (Apr data only)
```

---

### **2. Hash Partitioning by Geographic Location**
*Split tables by barangay for load distribution*

#### **Example: Partitioned `residents` by Barangay Code**

```sql
-- Parent table (partitioned by barangay)
CREATE TABLE residents (
    id UUID DEFAULT uuid_generate_v4(),
    first_name VARCHAR(100) NOT NULL,
    middle_name VARCHAR(100),
    last_name VARCHAR(100) NOT NULL,
    birthdate DATE NOT NULL,
    barangay_code VARCHAR(10) NOT NULL,
    -- ... all other fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (id, barangay_code)  -- Include partition key
) PARTITION BY HASH (barangay_code);

-- Hash partitions (4 partitions for load balancing)
CREATE TABLE residents_p0 PARTITION OF residents
    FOR VALUES WITH (modulus 4, remainder 0);
    
CREATE TABLE residents_p1 PARTITION OF residents
    FOR VALUES WITH (modulus 4, remainder 1);
    
CREATE TABLE residents_p2 PARTITION OF residents
    FOR VALUES WITH (modulus 4, remainder 2);
    
CREATE TABLE residents_p3 PARTITION OF residents
    FOR VALUES WITH (modulus 4, remainder 3);
```

**Distribution:**
```
📊 Resident Distribution
├── 📄 residents_p0 (25% of all barangays)
├── 📄 residents_p1 (25% of all barangays)
├── 📄 residents_p2 (25% of all barangays)
└── 📄 residents_p3 (25% of all barangays)
```

---

### **3. List Partitioning by Region**
*Split tables by specific geographic regions*

#### **Example: Partitioned `households` by Region**

```sql
-- Parent table (partitioned by region)
CREATE TABLE households (
    id UUID DEFAULT uuid_generate_v4(),
    code VARCHAR(50) NOT NULL,
    household_number VARCHAR(50) NOT NULL,
    region_code VARCHAR(10) NOT NULL,
    barangay_code VARCHAR(10) NOT NULL,
    -- ... all other fields
    created_at TIMESTAMPTZ DEFAULT NOW(),
    PRIMARY KEY (id, region_code)  -- Include partition key
) PARTITION BY LIST (region_code);

-- Region-specific partitions
CREATE TABLE households_ncr PARTITION OF households
    FOR VALUES IN ('13');  -- NCR region

CREATE TABLE households_region4a PARTITION OF households
    FOR VALUES IN ('04');  -- CALABARZON

CREATE TABLE households_region3 PARTITION OF households
    FOR VALUES IN ('03');  -- Central Luzon
    
CREATE TABLE households_other PARTITION OF households
    FOR VALUES IN ('01', '02', '05', '06', '07', '08', '09', '10', '11', '12', '14', '15', '16', '17');
```

**Geographic Distribution:**
```
🗺️ Geographic Partitions
├── 📄 households_ncr (Metro Manila only)
├── 📄 households_region4a (CALABARZON only)
├── 📄 households_region3 (Central Luzon only)
└── 📄 households_other (All other regions)
```

---

## 🏗️ **Complete Partitioned RBI System Architecture**

### **Recommended Partitioning Strategy:**

```sql
-- =====================================================
-- PARTITIONED RBI SYSTEM SCHEMA
-- =====================================================

-- 1. RESIDENTS: Hash partitioned by barangay (for load balancing)
CREATE TABLE residents (
    -- All existing fields
    PRIMARY KEY (id, barangay_code)
) PARTITION BY HASH (barangay_code);

CREATE TABLE residents_p0 PARTITION OF residents FOR VALUES WITH (modulus 8, remainder 0);
CREATE TABLE residents_p1 PARTITION OF residents FOR VALUES WITH (modulus 8, remainder 1);
CREATE TABLE residents_p2 PARTITION OF residents FOR VALUES WITH (modulus 8, remainder 2);
CREATE TABLE residents_p3 PARTITION OF residents FOR VALUES WITH (modulus 8, remainder 3);
CREATE TABLE residents_p4 PARTITION OF residents FOR VALUES WITH (modulus 8, remainder 4);
CREATE TABLE residents_p5 PARTITION OF residents FOR VALUES WITH (modulus 8, remainder 5);
CREATE TABLE residents_p6 PARTITION OF residents FOR VALUES WITH (modulus 8, remainder 6);
CREATE TABLE residents_p7 PARTITION OF residents FOR VALUES WITH (modulus 8, remainder 7);

-- 2. HOUSEHOLDS: List partitioned by region
CREATE TABLE households (
    -- All existing fields  
    PRIMARY KEY (id, region_code)
) PARTITION BY LIST (region_code);

-- Major regions get their own partitions
CREATE TABLE households_ncr PARTITION OF households FOR VALUES IN ('13');
CREATE TABLE households_r4a PARTITION OF households FOR VALUES IN ('04');
CREATE TABLE households_r3 PARTITION OF households FOR VALUES IN ('03');
CREATE TABLE households_other PARTITION OF households FOR VALUES IN (DEFAULT);

-- 3. SYSTEM_AUDIT_LOGS: Range partitioned by date
CREATE TABLE system_audit_logs (
    -- All existing fields
    PRIMARY KEY (id, created_at)
) PARTITION BY RANGE (created_at);

-- Monthly partitions (auto-managed)
CREATE TABLE system_audit_logs_2025_01 PARTITION OF system_audit_logs
    FOR VALUES FROM ('2025-01-01') TO ('2025-02-01');
-- ... continue for each month

-- 4. SYSTEM_DASHBOARD_SUMMARIES: List partitioned by region
CREATE TABLE system_dashboard_summaries (
    -- All existing fields
    PRIMARY KEY (id, barangay_code)
) PARTITION BY LIST (LEFT(barangay_code, 2)); -- First 2 digits = region

CREATE TABLE dashboard_ncr PARTITION OF system_dashboard_summaries
    FOR VALUES IN ('13');
CREATE TABLE dashboard_r4a PARTITION OF system_dashboard_summaries  
    FOR VALUES IN ('04');
-- ... continue for each region
```

---

## 📈 **Partition Management Examples**

### **1. Automatic Partition Creation**
```sql
-- Function to auto-create monthly audit log partitions
CREATE OR REPLACE FUNCTION create_monthly_audit_partition()
RETURNS void AS $$
DECLARE
    start_date date;
    end_date date;
    partition_name text;
BEGIN
    start_date := date_trunc('month', CURRENT_DATE + interval '1 month');
    end_date := start_date + interval '1 month';
    partition_name := 'system_audit_logs_' || to_char(start_date, 'YYYY_MM');
    
    EXECUTE format('CREATE TABLE %I PARTITION OF system_audit_logs
                    FOR VALUES FROM (%L) TO (%L)',
                   partition_name, start_date, end_date);
END;
$$ LANGUAGE plpgsql;

-- Schedule this to run monthly
```

### **2. Partition Pruning (Dropping Old Data)**
```sql
-- Drop audit logs older than 2 years
DROP TABLE IF EXISTS system_audit_logs_2023_01;
DROP TABLE IF EXISTS system_audit_logs_2023_02;
-- ... continue
```

### **3. Partition-wise Operations**
```sql
-- Query specific partition (faster)
SELECT COUNT(*) FROM residents_p0;

-- Query all partitions (automatic)
SELECT COUNT(*) FROM residents;  -- Queries all 8 partitions

-- Insert (automatically routed to correct partition)
INSERT INTO residents (first_name, last_name, barangay_code, ...)
VALUES ('Juan', 'Dela Cruz', '137404001', ...);
-- Automatically goes to correct partition based on barangay_code hash
```

---

## 🎯 **Benefits for RBI System**

### **Performance Benefits:**
```
📊 Query Performance
├── ✅ Parallel queries across partitions
├── ✅ Partition elimination (only query relevant partitions)
├── ✅ Smaller indexes per partition
└── ✅ Faster maintenance operations

🔧 Maintenance Benefits  
├── ✅ Vacuum/analyze individual partitions
├── ✅ Backup specific regions/time periods
├── ✅ Drop old data without affecting current data
└── ✅ Independent partition maintenance

⚖️ Load Distribution
├── ✅ Distribute I/O across multiple disks
├── ✅ Balance query load
├── ✅ Parallel processing
└── ✅ Reduced contention
```

### **Real-world Example Queries:**

```sql
-- 1. Query residents from specific barangay (hits 1 partition)
SELECT * FROM residents WHERE barangay_code = '137404001';
-- PostgreSQL automatically queries only the correct partition

-- 2. Query audit logs from last month (hits 1 partition)
SELECT * FROM system_audit_logs 
WHERE created_at >= '2025-01-01' AND created_at < '2025-02-01';
-- Only queries system_audit_logs_2025_01 partition

-- 3. Query households in NCR (hits 1 partition)
SELECT * FROM households WHERE region_code = '13';
-- Only queries households_ncr partition

-- 4. Cross-partition query (hits multiple partitions automatically)
SELECT COUNT(*) FROM residents WHERE age BETWEEN 18 AND 65;
-- Queries all 8 partitions in parallel
```

---

## 📁 **Physical Storage Structure**

### **File System Layout:**
```
📁 PostgreSQL Data Directory
├── 📁 base/
│   ├── 📁 16384/  (database OID)
│   │   ├── 📄 residents_p0_data
│   │   ├── 📄 residents_p1_data  
│   │   ├── 📄 residents_p2_data
│   │   ├── 📄 residents_p3_data
│   │   ├── 📄 households_ncr_data
│   │   ├── 📄 households_r4a_data
│   │   ├── 📄 audit_2025_01_data
│   │   ├── 📄 audit_2025_02_data
│   │   └── 📄 audit_2025_03_data
```

### **Monitoring Partitions:**
```sql
-- View all partitions
SELECT 
    schemaname,
    tablename,
    attname as partition_key,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables 
WHERE tablename LIKE 'residents_p%' OR tablename LIKE 'households_%'
ORDER BY tablename;

-- Partition information
SELECT 
    t.relname as table_name,
    p.relname as partition_name,
    pg_get_expr(c.relpartbound, c.oid) as partition_bounds
FROM pg_class t
JOIN pg_inherits i ON i.inhparent = t.oid
JOIN pg_class c ON i.inhrelid = c.oid  
JOIN pg_class p ON p.oid = c.oid
WHERE t.relname IN ('residents', 'households', 'system_audit_logs');
```

This shows how your RBI System would look with strategic partitioning for optimal performance and management! 🚀