# Field Comparison with Purpose & Function

## 1. USER_PROFILES Table
*Purpose: Store system user information and their barangay assignments*

| # | Field Name | Current | Enhanced | Status | Purpose/Function |
|---|------------|---------|----------|---------|-----------------|
| 1 | id | UUID PK | UUID PK | ✅ KEPT | Links to auth.users for authentication |
| 2 | email | VARCHAR(255) | VARCHAR(255) | ✅ KEPT | User's email for login and communication |
| 3 | full_name | TEXT | - | ❌ REMOVED | Split into first_name/last_name |
| 4 | first_name | - | VARCHAR(100) | 🆕 NEW | User's first name |
| 5 | last_name | - | VARCHAR(100) | 🆕 NEW | User's last name |
| 6 | role_id | UUID | UUID | ✅ KEPT | Determines user permissions (admin, encoder, viewer) |
| 7 | barangay_code | VARCHAR(10) | VARCHAR(10) | ✅ KEPT | Primary barangay assignment |
| 8 | region_code | - | VARCHAR(10) | 🆕 NEW | User's region for multi-level access |
| 9 | province_code | - | VARCHAR(10) | 🆕 NEW | User's province for provincial admins |
| 10 | city_municipality_code | - | VARCHAR(10) | 🆕 NEW | User's city/municipality for city admins |
| 11 | is_active | - | BOOLEAN | 🆕 NEW | Enable/disable user without deletion |
| 12 | phone_number | - | TEXT | 🆕 NEW | Contact for emergencies/notifications |
| 13 | position | - | TEXT | 🆕 NEW | Job title (e.g., "Barangay Secretary") |
| 14 | department | - | TEXT | 🆕 NEW | Office/department assignment |
| 15 | avatar_url | - | TEXT | 🆕 NEW | Profile picture for user interface |
| 16 | metadata | - | JSONB | 🆕 NEW | Flexible storage for custom attributes |
| 17 | created_at | TIMESTAMP | TIMESTAMP | ✅ KEPT | Track when user was added |
| 18 | updated_at | TIMESTAMP | TIMESTAMP | ✅ KEPT | Track last profile update |
| 19 | created_by | - | UUID | 🆕 NEW | Audit: who created this user |
| 20 | updated_by | - | UUID | 🆕 NEW | Audit: who last modified |

---

## 2. HOUSEHOLDS Table
*Purpose: Register all residential units in the barangay*

| # | Field Name | Current | Enhanced | Status | Purpose/Function |
|---|------------|---------|----------|---------|-----------------|
| 1 | id | UUID PK | UUID PK | ✅ KEPT | Unique household identifier |
| 2 | household_number | TEXT | TEXT | ✅ KEPT | Official household number (e.g., "HH-001-2024") |
| 3 | barangay_code | TEXT | TEXT | ✅ KEPT | Links to PSGC barangay |
| 4 | purok | TEXT | TEXT | ✅ KEPT | Zone/purok location within barangay |
| 5 | street_name | TEXT | - | ❌ REMOVED | Replaced by street_id for normalization |
| 6 | subdivision_id | - | UUID | 🆕 NEW | Links to subdivisions table for villages |
| 7 | street_id | - | UUID | 🆕 NEW | Links to street_names table (normalized) |
| 8 | house_number | TEXT | TEXT | ✅ KEPT | House/lot number |
| 9 | building_name | - | TEXT | 🆕 NEW | For apartments/condos (e.g., "Tower A") |
| 10 | unit_number | - | TEXT | 🆕 NEW | Apartment/condo unit (e.g., "12B") |
| 11 | floor_number | - | TEXT | 🆕 NEW | Floor level for multi-story buildings |
| 12 | block_number | - | TEXT | 🆕 NEW | Subdivision block identifier |
| 13 | lot_number | - | TEXT | 🆕 NEW | Subdivision lot identifier |
| 14 | latitude | DECIMAL | DECIMAL | ✅ KEPT | GPS coordinate for mapping |
| 15 | longitude | DECIMAL | DECIMAL | ✅ KEPT | GPS coordinate for mapping |
| 16 | ownership_status | - | ENUM | 🆕 NEW | Track if owned/renting/informal for housing programs |
| 17 | structure_type | - | ENUM | 🆕 NEW | House/apartment/condo for census |
| 18 | year_constructed | - | INTEGER | 🆕 NEW | Building age for safety assessment |
| 19 | number_of_rooms | - | INTEGER | 🆕 NEW | Overcrowding analysis |
| 20 | has_electricity | - | BOOLEAN | 🆕 NEW | Basic utilities for development planning |
| 21 | has_water_supply | - | BOOLEAN | 🆕 NEW | Water access for health programs |
| 22 | has_toilet | - | BOOLEAN | 🆕 NEW | Sanitation for health programs |
| 23 | monthly_income_bracket | - | TEXT | 🆕 NEW | Economic profiling for aid programs |
| 24 | receives_4ps | - | BOOLEAN | 🆕 NEW | Pantawid Pamilya beneficiary tracking |
| 25 | metadata | - | JSONB | 🆕 NEW | Flexible storage for additional data |
| 26 | notes | - | TEXT | 🆕 NEW | Special circumstances/observations |
| 27 | created_at | TIMESTAMP | TIMESTAMP | ✅ KEPT | Track when registered |
| 28 | updated_at | TIMESTAMP | TIMESTAMP | ✅ KEPT | Track last update |
| 29 | created_by | UUID | UUID | ✅ KEPT | Who registered household |
| 30 | updated_by | - | UUID | 🆕 NEW | Who last updated |

---

## 3. RESIDENTS Table
*Purpose: Complete resident registration with government compliance*

| # | Field Name | Current | Enhanced | Status | Purpose/Function |
|---|------------|---------|----------|---------|-----------------|
| **PERSONAL INFORMATION** |||||
| 1 | id | UUID PK | UUID PK | ✅ KEPT | Unique resident identifier |
| 2 | household_id | UUID | UUID | ✅ KEPT | Links to household |
| 3 | barangay_code | TEXT | TEXT | ✅ KEPT | Denormalized for faster queries |
| 4 | first_name | TEXT | TEXT | ✅ KEPT | Legal first name |
| 5 | middle_name | TEXT | TEXT | ✅ KEPT | Legal middle name |
| 6 | last_name | TEXT | TEXT | ✅ KEPT | Legal surname |
| 7 | suffix | TEXT | TEXT | ✅ KEPT | Jr., Sr., III, etc. |
| 8 | nickname | - | TEXT | 🆕 NEW | Common name for easier identification |
| **DEMOGRAPHICS** |||||
| 9 | sex | TEXT | sex_enum | ✅ TYPED | Biological sex for health programs |
| 10 | birth_date | DATE | DATE | ✅ KEPT | Age calculation for programs |
| 11 | birth_place | TEXT | TEXT | ✅ KEPT | For birth certificate verification |
| 12 | civil_status | TEXT | civil_status_enum | ✅ TYPED | For social services eligibility |
| 13 | citizenship | - | citizenship_enum | 🆕 NEW | Filipino/dual/foreign for voting |
| **CONTACT** |||||
| 14 | mobile_number | TEXT | TEXT | ✅ KEPT | Emergency contact/notifications |
| 15 | email | - | TEXT | 🆕 NEW | Digital communication/services |
| **EDUCATION** |||||
| 16 | education_level | - | education_enum | 🆕 NEW | Highest education for statistics |
| 17 | education_status | - | education_enum | 🆕 NEW | Currently studying/graduated |
| 18 | school_name | - | TEXT | 🆕 NEW | Track students per school |
| **EMPLOYMENT** |||||
| 19 | employment_status | - | employment_enum | 🆕 NEW | Employed/unemployed for labor stats |
| 20 | occupation | TEXT | TEXT | ✅ KEPT | Job title/profession |
| 21 | occupation_code | - | TEXT (PSOC) | 🆕 NEW | Links to PSOC for standard classification |
| 22 | employer_name | - | TEXT | 🆕 NEW | Company/employer tracking |
| 23 | employer_address | - | TEXT | 🆕 NEW | Work location for transport planning |
| 24 | monthly_income | - | DECIMAL | 🆕 NEW | Income for poverty threshold analysis |
| **HEALTH INFORMATION** |||||
| 25 | blood_type | - | blood_enum | 🆕 NEW | Emergency medical information |
| 26 | has_disability | - | BOOLEAN | 🆕 NEW | PWD identification |
| 27 | disability_type | - | Array | 🆕 NEW | Types of disabilities for programs |
| 28 | is_pregnant | - | BOOLEAN | 🆕 NEW | Maternal health monitoring |
| **IDENTITY & VOTING** |||||
| 29 | religion | - | religion_enum | 🆕 NEW | Religious services planning |
| 30 | is_registered_voter | BOOLEAN | BOOLEAN | ✅ KEPT | Voter status |
| 31 | voter_id_number | - | TEXT | 🆕 NEW | COMELEC voter ID |
| 32 | precinct_number | - | TEXT | 🆕 NEW | Voting precinct assignment |
| **GOVERNMENT IDS** |||||
| 33 | national_id_number | - | TEXT | 🆕 NEW | Philippine National ID (PhilSys) |
| 34 | philhealth_number | - | TEXT | 🆕 NEW | Health insurance tracking |
| 35 | sss_number | - | TEXT | 🆕 NEW | Social security for private workers |
| 36 | gsis_number | - | TEXT | 🆕 NEW | Government employee insurance |
| 37 | tin_number | - | TEXT | 🆕 NEW | Tax identification |
| **ADDITIONAL** |||||
| 38 | is_ofw | - | BOOLEAN | 🆕 NEW | Overseas Filipino Worker status |
| 39 | country_of_work | - | TEXT | 🆕 NEW | OFW destination country |
| 40 | metadata | - | JSONB | 🆕 NEW | Flexible additional data |
| 41 | photo_url | - | TEXT | 🆕 NEW | ID photo for verification |
| **AUDIT** |||||
| 42 | created_at | TIMESTAMP | TIMESTAMP | ✅ KEPT | Registration date |
| 43 | updated_at | TIMESTAMP | TIMESTAMP | ✅ KEPT | Last update date |
| 44 | created_by | - | UUID | 🆕 NEW | Who registered resident |
| 45 | updated_by | - | UUID | 🆕 NEW | Who last updated |

---

## 🆕 NEW TABLES - Purpose & Function

### 5. BARANGAY_ACCOUNTS
*Purpose: Allow users to manage multiple barangays*

| # | Field Name | Data Type | Function |
|---|------------|-----------|----------|
| 1 | id | UUID PK | Unique record identifier |
| 2 | barangay_code | TEXT FK | Which barangay user can access |
| 3 | user_id | UUID FK | Which user has access |
| 4 | role_id | UUID FK | Role for this specific barangay |
| 5 | is_active | BOOLEAN | Enable/disable access |
| 6 | assigned_at | TIMESTAMP | When access was granted |
| 7 | assigned_by | UUID | Who granted access |

**Use Case**: City admin can access multiple barangays with different roles

---

### 6. HOUSEHOLD_MEMBERS
*Purpose: Track who lives in each household and their relationships*

| # | Field Name | Data Type | Function |
|---|------------|-----------|----------|
| 1 | id | UUID PK | Unique record identifier |
| 2 | household_id | UUID FK | Which household |
| 3 | resident_id | UUID FK | Which resident |
| 4 | relationship_to_head | ENUM | Father/mother/child/helper etc. |
| 5 | is_head | BOOLEAN | Designate household head |
| 6 | moved_in_date | DATE | Track migration patterns |
| 7 | moved_out_date | DATE | Track when left household |
| 8 | is_active | BOOLEAN | Currently living there |

**Use Case**: Track family composition, identify household heads

---

### 7. SUBDIVISIONS
*Purpose: Registry of villages and subdivisions*

| # | Field Name | Data Type | Function |
|---|------------|-----------|----------|
| 1 | id | UUID PK | Unique identifier |
| 2 | barangay_code | TEXT FK | Which barangay |
| 3 | name | TEXT | Subdivision name |
| 4 | type | TEXT | Village/subdivision/compound |
| 5 | total_units | INTEGER | Number of housing units |
| 6 | year_established | INTEGER | Age of subdivision |
| 7 | developer_name | TEXT | Developer information |

**Use Case**: Organize addresses, track gated communities

---

### 8. STREET_NAMES
*Purpose: Standardize street names for addresses*

| # | Field Name | Data Type | Function |
|---|------------|-----------|----------|
| 1 | id | UUID PK | Unique identifier |
| 2 | barangay_code | TEXT FK | Which barangay |
| 3 | street_name | TEXT | Official street name |
| 4 | alternative_name | TEXT | Common/old name |

**Use Case**: Consistent addressing, navigation, emergency response

---

### 9. SECTORAL_INFORMATION
*Purpose: Track special sector memberships*

| # | Field Name | Data Type | Function |
|---|------------|-----------|----------|
| 1 | id | UUID PK | Unique identifier |
| 2 | resident_id | UUID FK | Which resident |
| 3 | sector | ENUM | Senior/PWD/Solo Parent/Indigenous |
| 4 | registration_number | TEXT | ID number from agency |
| 5 | registration_date | DATE | When registered |
| 6 | expiry_date | DATE | ID expiration |
| 7 | is_active | BOOLEAN | Current status |

**Use Case**: Track senior citizens, PWDs for benefits distribution

---

### 10. MIGRANT_INFORMATION
*Purpose: Track internal migration and transients*

| # | Field Name | Data Type | Function |
|---|------------|-----------|----------|
| 1 | id | UUID PK | Unique identifier |
| 2 | resident_id | UUID FK | Which resident |
| 3 | origin_province | TEXT | Where from (province) |
| 4 | origin_city | TEXT | Where from (city) |
| 5 | origin_barangay | TEXT | Where from (barangay) |
| 6 | date_arrived | DATE | When arrived |
| 7 | reason_for_migration | TEXT | Work/study/family |
| 8 | intended_length_of_stay | TEXT | Permanent/temporary |

**Use Case**: Population movement analysis, service planning

---

### 11. AUDIT_LOGS
*Purpose: Track all database changes for accountability*

| # | Field Name | Data Type | Function |
|---|------------|-----------|----------|
| 1 | id | UUID PK | Unique identifier |
| 2 | table_name | TEXT | Which table changed |
| 3 | record_id | UUID | Which record changed |
| 4 | action | TEXT | INSERT/UPDATE/DELETE |
| 5 | old_values | JSONB | Previous data |
| 6 | new_values | JSONB | New data |
| 7 | user_id | UUID | Who made change |
| 8 | ip_address | INET | Where from |
| 9 | user_agent | TEXT | Browser/device |
| 10 | created_at | TIMESTAMP | When changed |

**Use Case**: Security, compliance, dispute resolution, undo changes

---

### 12. BARANGAY_DASHBOARD_SUMMARIES
*Purpose: Pre-calculated statistics for fast dashboards*

| # | Field Name | Data Type | Function |
|---|------------|-----------|----------|
| 1-3 | Basic info | - | Barangay, date, ID |
| 4-8 | Population | INTEGER | Total counts by gender |
| 9-14 | Age groups | INTEGER | Age distribution |
| 15-18 | Special sectors | INTEGER | Senior/PWD/Solo/OFW |
| 19-20 | Education | INTEGER | Students/out-of-school |
| 21-22 | Employment | INTEGER | Employed/unemployed |
| 23 | Voters | INTEGER | Registered voters |
| 24-25 | Housing | INTEGER | Owned vs renting |

**Use Case**: Instant dashboard loading, trend analysis, reports

---

### 13. SCHEMA_VERSION
*Purpose: Track database migrations*

| # | Field Name | Data Type | Function |
|---|------------|-----------|----------|
| 1 | version | INTEGER | Version number |
| 2 | applied_at | TIMESTAMP | When migrated |
| 3 | description | TEXT | What changed |

**Use Case**: Database version control, migration tracking

---

## 🎯 KEY BENEFITS BY USE CASE

| Use Case | Fields/Tables Used | Benefit |
|----------|-------------------|---------|
| **Emergency Response** | blood_type, mobile_number, disabilities | Quick medical info access |
| **Social Services** | 4Ps status, income, education | Target aid distribution |
| **Health Programs** | pregnancy, PWD, senior citizens | Identify beneficiaries |
| **Elections** | voter_id, precinct, citizenship | Voter management |
| **Economic Planning** | employment, income, occupation_code | Labor statistics |
| **Housing Programs** | ownership, utilities, structure_type | Identify needs |
| **Education** | school_name, education_status | School enrollment tracking |
| **Security** | audit_logs, created_by, updated_by | Track all changes |
| **Performance** | dashboard_summaries | Fast reporting |