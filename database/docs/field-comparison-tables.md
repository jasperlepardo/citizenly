# Field Comparison in Table Format

## 1. USER_PROFILES Table

| # | Field Name | Current Schema | Enhanced Schema | Status |
|---|------------|---------------|-----------------|---------|
| 1 | id | UUID PRIMARY KEY | UUID PRIMARY KEY | ✅ KEPT |
| 2 | email | TEXT UNIQUE NOT NULL | TEXT UNIQUE NOT NULL | ✅ KEPT |
| 3 | full_name | TEXT NOT NULL | TEXT NOT NULL | ✅ KEPT |
| 4 | role_id | UUID | UUID | ✅ KEPT |
| 5 | barangay_code | TEXT | TEXT | ✅ KEPT |
| 6 | is_active | - | BOOLEAN DEFAULT true | 🆕 NEW |
| 7 | phone_number | - | TEXT | 🆕 NEW |
| 8 | position | - | TEXT | 🆕 NEW |
| 9 | department | - | TEXT | 🆕 NEW |
| 10 | avatar_url | - | TEXT | 🆕 NEW |
| 11 | metadata | - | JSONB DEFAULT '{}' | 🆕 NEW |
| 12 | created_at | TIMESTAMPTZ | TIMESTAMPTZ | ✅ KEPT |
| 13 | updated_at | TIMESTAMPTZ | TIMESTAMPTZ | ✅ KEPT |
| 14 | created_by | - | UUID | 🆕 NEW |
| 15 | updated_by | - | UUID | 🆕 NEW |

**Summary**: 7 → 15 fields (+8 new fields)

---

## 2. HOUSEHOLDS Table

| # | Field Name | Current Schema | Enhanced Schema | Status |
|---|------------|---------------|-----------------|---------|
| 1 | id | UUID PRIMARY KEY | UUID PRIMARY KEY | ✅ KEPT |
| 2 | household_number | TEXT NOT NULL | TEXT NOT NULL | ✅ KEPT |
| 3 | barangay_code | TEXT NOT NULL | TEXT NOT NULL | ✅ KEPT |
| 4 | purok | TEXT | TEXT | ✅ KEPT |
| 5 | street_name | TEXT | - | ❌ REMOVED |
| 6 | subdivision_id | - | UUID | 🆕 NEW |
| 7 | street_id | - | UUID | 🆕 NEW |
| 8 | house_number | TEXT | TEXT | ✅ KEPT |
| 9 | building_name | - | TEXT | 🆕 NEW |
| 10 | unit_number | - | TEXT | 🆕 NEW |
| 11 | floor_number | - | TEXT | 🆕 NEW |
| 12 | block_number | - | TEXT | 🆕 NEW |
| 13 | lot_number | - | TEXT | 🆕 NEW |
| 14 | latitude | DECIMAL(10, 8) | DECIMAL(10, 8) | ✅ KEPT |
| 15 | longitude | DECIMAL(11, 8) | DECIMAL(11, 8) | ✅ KEPT |
| 16 | ownership_status | - | ownership_status_enum | 🆕 NEW |
| 17 | structure_type | - | structure_type_enum | 🆕 NEW |
| 18 | year_constructed | - | INTEGER | 🆕 NEW |
| 19 | number_of_rooms | - | INTEGER | 🆕 NEW |
| 20 | has_electricity | - | BOOLEAN | 🆕 NEW |
| 21 | has_water_supply | - | BOOLEAN | 🆕 NEW |
| 22 | has_toilet | - | BOOLEAN | 🆕 NEW |
| 23 | monthly_income_bracket | - | TEXT | 🆕 NEW |
| 24 | receives_4ps | - | BOOLEAN DEFAULT false | 🆕 NEW |
| 25 | metadata | - | JSONB DEFAULT '{}' | 🆕 NEW |
| 26 | notes | - | TEXT | 🆕 NEW |
| 27 | created_at | TIMESTAMPTZ | TIMESTAMPTZ | ✅ KEPT |
| 28 | updated_at | TIMESTAMPTZ | TIMESTAMPTZ | ✅ KEPT |
| 29 | created_by | UUID | UUID | ✅ KEPT |
| 30 | updated_by | - | UUID | 🆕 NEW |

**Summary**: 11 → 29 fields (+19 new, -1 removed)

---

## 3. RESIDENTS Table

| # | Field Name | Current Schema | Enhanced Schema | Status |
|---|------------|---------------|-----------------|---------|
| **BASIC INFO** | | | | |
| 1 | id | UUID PRIMARY KEY | UUID PRIMARY KEY | ✅ KEPT |
| 2 | household_id | UUID NOT NULL | UUID NOT NULL | ✅ KEPT |
| 3 | barangay_code | TEXT NOT NULL | TEXT NOT NULL | ✅ KEPT |
| 4 | first_name | TEXT NOT NULL | TEXT NOT NULL | ✅ KEPT |
| 5 | middle_name | TEXT | TEXT | ✅ KEPT |
| 6 | last_name | TEXT NOT NULL | TEXT NOT NULL | ✅ KEPT |
| 7 | suffix | TEXT | TEXT | ✅ KEPT |
| 8 | nickname | - | TEXT | 🆕 NEW |
| **DEMOGRAPHICS** | | | | |
| 9 | sex | TEXT | sex_enum | ✅ KEPT (typed) |
| 10 | birth_date | DATE NOT NULL | DATE NOT NULL | ✅ KEPT |
| 11 | birth_place | TEXT | TEXT | ✅ KEPT |
| 12 | civil_status | TEXT | civil_status_enum | ✅ KEPT (typed) |
| 13 | citizenship | - | citizenship_enum | 🆕 NEW |
| **CONTACT** | | | | |
| 14 | mobile_number | TEXT | TEXT | ✅ KEPT |
| 15 | email | - | TEXT | 🆕 NEW |
| **EDUCATION** | | | | |
| 16 | education_level | - | education_level_enum | 🆕 NEW |
| 17 | education_status | - | education_status_enum | 🆕 NEW |
| 18 | school_name | - | TEXT | 🆕 NEW |
| **EMPLOYMENT** | | | | |
| 19 | employment_status | - | employment_status_enum | 🆕 NEW |
| 20 | occupation | TEXT | TEXT | ✅ KEPT |
| 21 | occupation_code | - | TEXT (FK to PSOC) | 🆕 NEW |
| 22 | employer_name | - | TEXT | 🆕 NEW |
| 23 | employer_address | - | TEXT | 🆕 NEW |
| 24 | monthly_income | - | DECIMAL(12, 2) | 🆕 NEW |
| **HEALTH** | | | | |
| 25 | blood_type | - | blood_type_enum | 🆕 NEW |
| 26 | has_disability | - | BOOLEAN | 🆕 NEW |
| 27 | disability_type | - | disability_enum[] | 🆕 NEW |
| 28 | is_pregnant | - | BOOLEAN | 🆕 NEW |
| **IDENTITY** | | | | |
| 29 | religion | - | religion_enum | 🆕 NEW |
| 30 | is_registered_voter | BOOLEAN | BOOLEAN | ✅ KEPT |
| 31 | voter_id_number | - | TEXT | 🆕 NEW |
| 32 | precinct_number | - | TEXT | 🆕 NEW |
| **GOVERNMENT IDS** | | | | |
| 33 | national_id_number | - | TEXT | 🆕 NEW |
| 34 | philhealth_number | - | TEXT | 🆕 NEW |
| 35 | sss_number | - | TEXT | 🆕 NEW |
| 36 | gsis_number | - | TEXT | 🆕 NEW |
| 37 | tin_number | - | TEXT | 🆕 NEW |
| **ADDITIONAL** | | | | |
| 38 | is_ofw | - | BOOLEAN | 🆕 NEW |
| 39 | country_of_work | - | TEXT | 🆕 NEW |
| 40 | metadata | - | JSONB | 🆕 NEW |
| 41 | photo_url | - | TEXT | 🆕 NEW |
| **AUDIT** | | | | |
| 42 | created_at | TIMESTAMPTZ | TIMESTAMPTZ | ✅ KEPT |
| 43 | updated_at | TIMESTAMPTZ | TIMESTAMPTZ | ✅ KEPT |
| 44 | created_by | - | UUID | 🆕 NEW |
| 45 | updated_by | - | UUID | 🆕 NEW |

**Summary**: 16 → 45 fields (+29 new fields)

---

## 4. RESIDENT_RELATIONSHIPS Table

| # | Field Name | Current Schema | Enhanced Schema | Status |
|---|------------|---------------|-----------------|---------|
| 1 | id | UUID PRIMARY KEY | UUID PRIMARY KEY | ✅ KEPT |
| 2 | resident_id | UUID NOT NULL | UUID NOT NULL | ✅ KEPT |
| 3 | related_resident_id | UUID NOT NULL | UUID NOT NULL | ✅ KEPT |
| 4 | relationship_type | TEXT NOT NULL | TEXT NOT NULL | ✅ KEPT |
| 5 | created_at | TIMESTAMPTZ | TIMESTAMPTZ | ✅ KEPT |

**Summary**: 5 → 5 fields (no changes)

---

## 🆕 NEW TABLES (Not in Current Schema)

### 5. BARANGAY_ACCOUNTS
| # | Field Name | Data Type | Description |
|---|------------|-----------|-------------|
| 1 | id | UUID PRIMARY KEY | Unique identifier |
| 2 | barangay_code | TEXT NOT NULL | Links to barangay |
| 3 | user_id | UUID NOT NULL | Links to user |
| 4 | role_id | UUID NOT NULL | User's role |
| 5 | is_active | BOOLEAN | Active status |
| 6 | assigned_at | TIMESTAMPTZ | When assigned |
| 7 | assigned_by | UUID | Who assigned |

### 6. HOUSEHOLD_MEMBERS
| # | Field Name | Data Type | Description |
|---|------------|-----------|-------------|
| 1 | id | UUID PRIMARY KEY | Unique identifier |
| 2 | household_id | UUID NOT NULL | Links to household |
| 3 | resident_id | UUID NOT NULL | Links to resident |
| 4 | relationship_to_head | household_relationship_enum | Relationship type |
| 5 | is_head | BOOLEAN | Is household head |
| 6 | moved_in_date | DATE | When moved in |
| 7 | moved_out_date | DATE | When moved out |
| 8 | is_active | BOOLEAN | Currently living |
| 9 | created_at | TIMESTAMPTZ | Created timestamp |
| 10 | updated_at | TIMESTAMPTZ | Updated timestamp |

### 7. SUBDIVISIONS
| # | Field Name | Data Type | Description |
|---|------------|-----------|-------------|
| 1 | id | UUID PRIMARY KEY | Unique identifier |
| 2 | barangay_code | TEXT NOT NULL | Links to barangay |
| 3 | name | TEXT NOT NULL | Subdivision name |
| 4 | type | TEXT | Type (village, etc) |
| 5 | total_units | INTEGER | Number of units |
| 6 | year_established | INTEGER | Year established |
| 7 | developer_name | TEXT | Developer name |
| 8 | created_at | TIMESTAMPTZ | Created timestamp |
| 9 | updated_at | TIMESTAMPTZ | Updated timestamp |

### 8. STREET_NAMES
| # | Field Name | Data Type | Description |
|---|------------|-----------|-------------|
| 1 | id | UUID PRIMARY KEY | Unique identifier |
| 2 | barangay_code | TEXT NOT NULL | Links to barangay |
| 3 | street_name | TEXT NOT NULL | Street name |
| 4 | alternative_name | TEXT | Alternative name |
| 5 | created_at | TIMESTAMPTZ | Created timestamp |
| 6 | updated_at | TIMESTAMPTZ | Updated timestamp |

### 9. SECTORAL_INFORMATION
| # | Field Name | Data Type | Description |
|---|------------|-----------|-------------|
| 1 | id | UUID PRIMARY KEY | Unique identifier |
| 2 | resident_id | UUID NOT NULL | Links to resident |
| 3 | sector | sectoral_group_enum | Sector type |
| 4 | registration_number | TEXT | Registration ID |
| 5 | registration_date | DATE | Date registered |
| 6 | expiry_date | DATE | Expiry date |
| 7 | is_active | BOOLEAN | Active status |
| 8 | created_at | TIMESTAMPTZ | Created timestamp |
| 9 | updated_at | TIMESTAMPTZ | Updated timestamp |

### 10. MIGRANT_INFORMATION
| # | Field Name | Data Type | Description |
|---|------------|-----------|-------------|
| 1 | id | UUID PRIMARY KEY | Unique identifier |
| 2 | resident_id | UUID NOT NULL | Links to resident |
| 3 | origin_province | TEXT | Origin province |
| 4 | origin_city | TEXT | Origin city |
| 5 | origin_barangay | TEXT | Origin barangay |
| 6 | date_arrived | DATE | Arrival date |
| 7 | reason_for_migration | TEXT | Migration reason |
| 8 | intended_length_of_stay | TEXT | Stay duration |
| 9 | created_at | TIMESTAMPTZ | Created timestamp |
| 10 | updated_at | TIMESTAMPTZ | Updated timestamp |

### 11. AUDIT_LOGS
| # | Field Name | Data Type | Description |
|---|------------|-----------|-------------|
| 1 | id | UUID PRIMARY KEY | Unique identifier |
| 2 | table_name | TEXT NOT NULL | Table modified |
| 3 | record_id | UUID NOT NULL | Record modified |
| 4 | action | TEXT NOT NULL | INSERT/UPDATE/DELETE |
| 5 | old_values | JSONB | Previous values |
| 6 | new_values | JSONB | New values |
| 7 | user_id | UUID | User who made change |
| 8 | ip_address | INET | IP address |
| 9 | user_agent | TEXT | Browser/client |
| 10 | created_at | TIMESTAMPTZ | When changed |

### 12. BARANGAY_DASHBOARD_SUMMARIES
| # | Field Name | Data Type | Description |
|---|------------|-----------|-------------|
| 1 | id | UUID PRIMARY KEY | Unique identifier |
| 2 | barangay_code | TEXT NOT NULL | Links to barangay |
| 3 | summary_date | DATE NOT NULL | Date of summary |
| 4 | total_population | INTEGER | Total residents |
| 5 | total_households | INTEGER | Total households |
| 6 | total_families | INTEGER | Total families |
| 7 | male_count | INTEGER | Male count |
| 8 | female_count | INTEGER | Female count |
| 9 | age_0_5 | INTEGER | Ages 0-5 |
| 10 | age_6_12 | INTEGER | Ages 6-12 |
| 11 | age_13_17 | INTEGER | Ages 13-17 |
| 12 | age_18_35 | INTEGER | Ages 18-35 |
| 13 | age_36_59 | INTEGER | Ages 36-59 |
| 14 | age_60_plus | INTEGER | Ages 60+ |
| 15 | senior_citizens | INTEGER | Senior count |
| 16 | pwd_count | INTEGER | PWD count |
| 17 | solo_parents | INTEGER | Solo parents |
| 18 | ofw_count | INTEGER | OFW count |
| 19 | students_count | INTEGER | Students |
| 20 | out_of_school_youth | INTEGER | OSY count |
| 21 | employed_count | INTEGER | Employed |
| 22 | unemployed_count | INTEGER | Unemployed |
| 23 | registered_voters | INTEGER | Voters |
| 24 | owned_housing | INTEGER | Owned houses |
| 25 | renting_count | INTEGER | Renting |
| 26 | created_at | TIMESTAMPTZ | Created timestamp |
| 27 | updated_at | TIMESTAMPTZ | Updated timestamp |

### 13. SCHEMA_VERSION
| # | Field Name | Data Type | Description |
|---|------------|-----------|-------------|
| 1 | version | INTEGER PRIMARY KEY | Version number |
| 2 | applied_at | TIMESTAMPTZ | When applied |
| 3 | description | TEXT | Description |

---

## 📊 OVERALL STATISTICS

| Category | Current Schema | Enhanced Schema | Change |
|----------|---------------|-----------------|--------|
| **Existing Tables** | | | |
| user_profiles | 7 fields | 15 fields | +8 fields |
| households | 11 fields | 29 fields | +18 fields |
| residents | 16 fields | 45 fields | +29 fields |
| resident_relationships | 5 fields | 5 fields | No change |
| **New Tables** | | | |
| barangay_accounts | - | 7 fields | +7 fields |
| household_members | - | 10 fields | +10 fields |
| subdivisions | - | 9 fields | +9 fields |
| street_names | - | 6 fields | +6 fields |
| sectoral_information | - | 9 fields | +9 fields |
| migrant_information | - | 10 fields | +10 fields |
| audit_logs | - | 10 fields | +10 fields |
| barangay_dashboard_summaries | - | 27 fields | +27 fields |
| schema_version | - | 3 fields | +3 fields |
| **TOTAL** | **39 fields** | **185 fields** | **+146 fields** |

## 🔑 KEY ENHANCEMENTS BY CATEGORY

| Category | New Fields Added |
|----------|-----------------|
| **Government IDs** | National ID, PhilHealth, SSS, GSIS, TIN |
| **Health Data** | Blood type, disability, pregnancy |
| **Education** | Level, status, school name |
| **Employment** | Status, employer, income, PSOC code |
| **Housing** | Ownership, utilities, 4Ps beneficiary |
| **Voter Info** | Voter ID, precinct number |
| **Contact** | Email, phone number |
| **Administrative** | Audit logs, user tracking, metadata |
| **Geographic** | Subdivisions, street names |
| **Demographics** | Sectoral groups, migrants, OFWs |