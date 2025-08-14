# Field Comparison with V2 Enhancement Remarks

## 1. USER_PROFILES Table (V2 Enhanced)
*Purpose: Store system user information with geographic hierarchy for multi-level access*

| # | Field Name | Current | V2 Enhanced | Status | Purpose/Function |
|---|------------|---------|-------------|---------|-----------------|
| 1 | id | UUID PK | UUID PK | ✅ KEPT | Links to auth.users for authentication |
| 2 | email | VARCHAR(255) | VARCHAR(255) | ✅ KEPT | User's email for login and communication |
| 3 | full_name | TEXT | - | ❌ REMOVED | Split into first_name/last_name for better data structure |
| 4 | first_name | - | VARCHAR(100) | 🆕 NEW | User's first name for better identification |
| 5 | last_name | - | VARCHAR(100) | 🆕 NEW | User's last name for reporting/display |
| 6 | role_id | UUID | UUID | ✅ KEPT | Determines user permissions (admin, encoder, viewer) |
| 7 | barangay_code | VARCHAR(10) | VARCHAR(10) | ✅ KEPT | Primary barangay assignment |
| 8 | region_code | - | VARCHAR(10) | 🆕 **V2** | **For regional administrators managing multiple provinces** |
| 9 | province_code | - | VARCHAR(10) | 🆕 **V2** | **For provincial administrators managing multiple cities** |
| 10 | city_municipality_code | - | VARCHAR(10) | 🆕 **V2** | **For city administrators managing multiple barangays** |
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

**V2 Key Enhancement**: Geographic hierarchy allows hierarchical access control where national admin sees all, regional admin sees their region, etc.

---

## 2. HOUSEHOLDS Table (V2 Enhanced)
*Purpose: Register all residential units with auto-calculated member counts*

| # | Field Name | Current | V2 Enhanced | Status | Purpose/Function |
|---|------------|---------|-------------|---------|-----------------|
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
| 25 | total_members | - | INTEGER | 🆕 **V2** | **Auto-calculated count of active residents (trigger)** |
| 26 | metadata | - | JSONB | 🆕 NEW | Flexible storage for additional data |
| 27 | notes | - | TEXT | 🆕 NEW | Special circumstances/observations |
| 28 | created_at | TIMESTAMP | TIMESTAMP | ✅ KEPT | Track when registered |
| 29 | updated_at | TIMESTAMP | TIMESTAMP | ✅ KEPT | Track last update |
| 30 | created_by | UUID | UUID | ✅ KEPT | Who registered household |
| 31 | updated_by | - | UUID | 🆕 NEW | Who last updated |

**V2 Key Enhancement**: `total_members` auto-updates via trigger when residents are added/removed/deactivated.

---

## 3. RESIDENTS Table (V2 Enhanced)
*Purpose: Complete resident registration with auto-calculated sectoral indicators*

| # | Field Name | Current | V2 Enhanced | Status | Purpose/Function |
|---|------------|---------|-------------|---------|-----------------|
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
| **V2 LABOR FORCE INDICATORS** |||||
| 25 | is_in_labor_force | - | BOOLEAN | 🆕 **V2** | **Auto-calculated based on employment status & age** |
| 26 | is_employed | - | BOOLEAN | 🆕 **V2** | **Auto-calculated from employment_status** |
| 27 | is_unemployed | - | BOOLEAN | 🆕 **V2** | **Auto-calculated from employment_status** |
| **HEALTH INFORMATION** |||||
| 28 | blood_type | - | blood_enum | 🆕 NEW | Emergency medical information |
| 29 | has_disability | - | BOOLEAN | 🆕 NEW | PWD identification |
| 30 | disability_type | - | Array | 🆕 NEW | Types of disabilities for programs |
| 31 | is_pregnant | - | BOOLEAN | 🆕 NEW | Maternal health monitoring |
| **IDENTITY & VOTING** |||||
| 32 | religion | - | religion_enum | 🆕 NEW | Religious services planning |
| 33 | is_registered_voter | BOOLEAN | BOOLEAN | ✅ KEPT | Voter status |
| 34 | voter_id_number | - | TEXT | 🆕 NEW | COMELEC voter ID |
| 35 | precinct_number | - | TEXT | 🆕 NEW | Voting precinct assignment |
| **GOVERNMENT IDS** |||||
| 36 | national_id_number | - | TEXT | 🆕 NEW | Philippine National ID (PhilSys) |
| 37 | philhealth_number | - | TEXT | 🆕 NEW | Health insurance tracking |
| 38 | sss_number | - | TEXT | 🆕 NEW | Social security for private workers |
| 39 | gsis_number | - | TEXT | 🆕 NEW | Government employee insurance |
| 40 | tin_number | - | TEXT | 🆕 NEW | Tax identification |
| **V2 SECTORAL INDICATORS (AUTO-CALCULATED)** |||||
| 41 | is_ofw | - | BOOLEAN | 🆕 NEW | Overseas Filipino Worker status |
| 42 | is_person_with_disability | - | BOOLEAN | 🆕 **V2** | **Auto-synced with has_disability** |
| 43 | is_out_of_school_children | - | BOOLEAN | 🆕 **V2** | **Auto-calculated: ages 6-15 not studying** |
| 44 | is_out_of_school_youth | - | BOOLEAN | 🆕 **V2** | **Auto-calculated: ages 16-24 not studying** |
| 45 | is_senior_citizen | - | BOOLEAN | 🆕 **V2** | **Auto-calculated: age 60+ from birth_date** |
| 46 | is_registered_senior_citizen | - | BOOLEAN | 🆕 NEW | Has senior citizen ID |
| 47 | is_solo_parent | - | BOOLEAN | 🆕 NEW | Solo parent status |
| 48 | is_indigenous_people | - | BOOLEAN | 🆕 NEW | Indigenous people classification |
| **ADDITIONAL** |||||
| 49 | country_of_work | - | TEXT | 🆕 NEW | OFW destination country |
| 50 | metadata | - | JSONB | 🆕 NEW | Flexible additional data |
| 51 | photo_url | - | TEXT | 🆕 NEW | ID photo for verification |
| **V2 SEARCH OPTIMIZATION** |||||
| 52 | search_text | - | TEXT GENERATED | 🆕 **V2** | **Auto-generated full name for fast searching** |
| 53 | is_active | - | BOOLEAN | 🆕 NEW | Active/inactive status |
| **AUDIT** |||||
| 54 | created_at | TIMESTAMP | TIMESTAMP | ✅ KEPT | Registration date |
| 55 | updated_at | TIMESTAMP | TIMESTAMP | ✅ KEPT | Last update date (auto-updated) |
| 56 | created_by | - | UUID | 🆕 NEW | Who registered resident |
| 57 | updated_by | - | UUID | 🆕 NEW | Who last updated |

**V2 Key Enhancements**: 
- Auto-calculated sectoral flags via trigger
- Generated search_text column for fast name searches  
- Auto-updated timestamps
- Conditional indexes for performance

---

## 🆕 NEW TABLES - V2 Enhanced Purpose & Function

### 9. V2 ENHANCED: SECTORAL_INFORMATION (21 fields)
*Purpose: Complete sectoral tracking with registration details*

| # | Field Name | Data Type | V2 Function |
|---|------------|-----------|-------------|
| 1 | id | UUID PK | Unique identifier |
| 2 | resident_id | UUID FK | Links to resident |
| 3-10 | **All sectoral flags** | BOOLEAN | **Auto-synced from residents table** |
| 11-13 | **Registration IDs** | TEXT | Senior citizen ID, PWD ID, Solo parent ID |
| 14-16 | **Registration dates** | DATE | When IDs were issued |
| 17-19 | **Expiry dates** | DATE | ID expiration tracking |
| 20 | indigenous_group | TEXT | Specific indigenous group name |
| 21 | **Auto-sync trigger** | - | **Keeps data in sync with residents table** |

**V2 Enhancement**: Auto-synced with residents table via trigger, maintains registration details.

---

### 12. V2 ENHANCED: BARANGAY_DASHBOARD_SUMMARIES (32 fields)
*Purpose: Performance-optimized analytics with complete metrics*

| Category | Fields | V2 Enhancement |
|----------|--------|----------------|
| **Population** | 6 fields | Total, households, families, gender |
| **Age Distribution** | 6 fields | All age brackets for government reporting |
| **V2 Complete Sectoral** | 8 fields | **All sectoral groups with registered counts** |
| **Education** | 3 fields | Students, OSC, OSY counts |
| **V2 Labor Force** | 4 fields | **In labor force, employed, unemployed, not in LF** |
| **Voters** | 1 field | Registered voters |
| **V2 Housing Details** | 6 fields | **Utilities (electricity, water, toilet) tracking** |
| **Economic** | 1 field | 4Ps beneficiaries |

**V2 Enhancement**: Complete sectoral tracking, housing utilities, labor force statistics.

---

## 📊 V2 SUMMARY STATISTICS

| Table | Current | V2 Enhanced | Added | Key V2 Features |
|-------|---------|-------------|--------|-----------------|
| user_profiles | 7 | 20 | +13 | **Geographic hierarchy for multi-level access** |
| households | 11 | 31 | +20 | **Auto-calculated total_members via trigger** |
| residents | 16 | 57 | +41 | **Auto-calculated sectoral flags & search optimization** |
| resident_relationships | 5 | 5 | 0 | No changes |
| **NEW: barangay_accounts** | 0 | 7 | +7 | Multi-barangay user support |
| **NEW: household_members** | 0 | 10 | +10 | Family composition tracking |
| **NEW: subdivisions** | 0 | 9 | +9 | Address normalization |
| **NEW: street_names** | 0 | 6 | +6 | Street registry |
| **NEW: sectoral_information** | 0 | 21 | +21 | **Auto-synced sectoral tracking with IDs** |
| **NEW: migrant_information** | 0 | 10 | +10 | Migration pattern analysis |
| **NEW: audit_logs** | 0 | 10 | +10 | Change tracking & compliance |
| **NEW: barangay_dashboard_summaries** | 0 | 32 | +32 | **Complete performance analytics** |
| **NEW: schema_version** | 0 | 3 | +3 | Migration tracking |
| **TOTAL** | **39 fields** | **221 fields** | **+182 fields** |

## 🔑 V2 KEY ENHANCEMENTS BY CATEGORY

| Enhancement Category | V2 Features |
|---------------------|-------------|
| **🏛️ Multi-level Access** | Geographic hierarchy (region/province/city/barangay) |
| **🤖 Auto-calculations** | Senior citizens, OSC/OSY, labor force, household counts |
| **🔍 Search & Performance** | Generated search_text, conditional indexes, GIN indexes |
| **📊 Complete Analytics** | All sectoral groups, housing utilities, labor statistics |
| **🔄 Data Synchronization** | Auto-sync triggers between residents and sectoral tables |
| **📋 Government Compliance** | Independence constraints, PSOC codes, all ID types |
| **🎯 Smart Filtering** | Conditional indexes only where data exists |
| **📈 Real-time Updates** | Triggers update counts and flags automatically |

## 🎯 BUSINESS VALUE BY USE CASE

| Use Case | V2 Fields Used | V2 Benefit |
|----------|----------------|------------|
| **Multi-level Government** | Geographic hierarchy | Provincial/regional admins can manage multiple barangays |
| **Real-time Dashboards** | Auto-calculated summaries | Instant analytics without complex queries |
| **Sectoral Programs** | Auto-calculated flags | Automatic identification of beneficiaries |
| **Search & Navigation** | Generated search_text | Fast resident lookup by name |
| **Data Quality** | Auto-calculations & triggers | Consistent data without manual updates |
| **Performance** | Conditional indexes | Fast queries only where data exists |
| **Compliance** | Complete audit trail | Track all changes for accountability |