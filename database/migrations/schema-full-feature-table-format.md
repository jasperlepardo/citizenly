# Full-Feature Schema - Table Format Documentation

## 📋 1. ENUMS AND CUSTOM TYPES

### Personal Information Enums
| Enum Name | Values | Purpose |
|-----------|--------|---------|
| `sex_enum` | `male`, `female` | Gender classification |
| `civil_status_enum` | `single`, `married`, `widowed`, `divorced`, `separated`, `annulled`, `registered_partnership`, `live_in` | Marital status for social services |
| `citizenship_enum` | `filipino`, `dual_citizen`, `foreign_national` | Citizenship for voting eligibility |

### Education Enums
| Enum Name | Values | Purpose |
|-----------|--------|---------|
| `education_level_enum` | `no_formal_education`, `elementary`, `high_school`, `college`, `post_graduate`, `vocational`, `graduate`, `undergraduate` | Highest educational attainment |
| `education_status_enum` | `currently_studying`, `not_studying`, `graduated`, `dropped_out` | Current education status |

### Employment Enum
| Enum Name | Values | Purpose |
|-----------|--------|---------|
| `employment_status_enum` | `employed`, `unemployed`, `underemployed`, `self_employed`, `student`, `retired`, `homemaker`, `unable_to_work`, `looking_for_work`, `not_in_labor_force` | Labor force participation |

### Health and Identity Enums
| Enum Name | Values | Purpose |
|-----------|--------|---------|
| `blood_type_enum` | `A+`, `A-`, `B+`, `B-`, `AB+`, `AB-`, `O+`, `O-`, `unknown` | Medical emergency information |
| `religion_enum` | `roman_catholic`, `islam`, `iglesia_ni_cristo`, `christian`, etc. (25 total) | Religious affiliation tracking |
| `ethnicity_enum` | `tagalog`, `cebuano`, `ilocano`, `cordillera_peoples`, `chinese_filipino`, etc. | LGU Form 10 compliant ethnicity |

### Household Classification Enums
| Enum Name | Values | Purpose |
|-----------|--------|---------|
| `household_type_enum` | `nuclear`, `single_parent`, `extended`, `childless`, `grandparents`, `stepfamily` | Family structure classification |
| `tenure_status_enum` | `owner`, `renter`, `others` | Housing tenure status |
| `household_unit_enum` | `single_family_house`, `townhouse`, `condominium`, `duplex`, `mobile_home` | Housing unit type |
| `family_position_enum` | `father`, `mother`, `son`, `daughter`, `grandmother`, etc. | Family relationship roles |
| `income_class_enum` | `rich`, `high_income`, `upper_middle_income`, `middle_class`, `lower_middle_class`, `low_income`, `poor` | Economic classification |

---

## 📍 2. PSGC REFERENCE TABLES (Philippine Standard Geographic Code)

### psgc_regions
| Field | Type | Constraints | Purpose |
|-------|------|-------------|---------|
| `code` | VARCHAR(10) | PRIMARY KEY | Official region code (e.g., "01", "13") |
| `name` | VARCHAR(100) | NOT NULL | Region name (e.g., "NCR", "CALABARZON") |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

### psgc_provinces
| Field | Type | Constraints | Purpose |
|-------|------|-------------|---------|
| `code` | VARCHAR(10) | PRIMARY KEY | Official province code |
| `name` | VARCHAR(100) | NOT NULL | Province name |
| `region_code` | VARCHAR(10) | FK to regions | Parent region |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

### psgc_cities_municipalities
| Field | Type | Constraints | Purpose |
|-------|------|-------------|---------|
| `code` | VARCHAR(10) | PRIMARY KEY | Official city/municipality code |
| `name` | VARCHAR(200) | NOT NULL | City/municipality name |
| `province_code` | VARCHAR(10) | FK to provinces | Parent province (NULL for independent cities) |
| `type` | VARCHAR(50) | NOT NULL | "City" or "Municipality" |
| `is_independent` | BOOLEAN | DEFAULT false | Independent city flag |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| **V2 CONSTRAINT** | `independence_rule` | CHECK constraint | Validates independent cities have NULL province |

### psgc_barangays
| Field | Type | Constraints | Purpose |
|-------|------|-------------|---------|
| `code` | VARCHAR(10) | PRIMARY KEY | Official barangay code |
| `name` | VARCHAR(100) | NOT NULL | Barangay name |
| `city_municipality_code` | VARCHAR(10) | FK to cities | Parent city/municipality |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

---

## 🏢 3. PSOC REFERENCE TABLES (Philippine Standard Occupational Classification)

### psoc_major_groups
| Field | Type | Constraints | Purpose |
|-------|------|-------------|---------|
| `code` | VARCHAR(10) | PRIMARY KEY | Major group code (e.g., "1" = Managers) |
| `title` | VARCHAR(200) | NOT NULL | Major group title |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |

### psoc_sub_major_groups
| Field | Type | Constraints | Purpose |
|-------|------|-------------|---------|
| `code` | VARCHAR(10) | PRIMARY KEY | Sub-major group code (e.g., "11") |
| `title` | VARCHAR(200) | NOT NULL | Sub-major group title |
| `major_code` | VARCHAR(10) | FK to major groups | Parent major group |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |

### psoc_minor_groups
| Field | Type | Constraints | Purpose |
|-------|------|-------------|---------|
| `code` | VARCHAR(10) | PRIMARY KEY | Minor group code (e.g., "111") |
| `title` | VARCHAR(200) | NOT NULL | Minor group title |
| `sub_major_code` | VARCHAR(10) | FK to sub-major groups | Parent sub-major group |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |

### psoc_unit_groups
| Field | Type | Constraints | Purpose |
|-------|------|-------------|---------|
| `code` | VARCHAR(10) | PRIMARY KEY | Unit group code (e.g., "1111") |
| `title` | VARCHAR(200) | NOT NULL | Unit group title |
| `minor_code` | VARCHAR(10) | FK to minor groups | Parent minor group |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |

### psoc_unit_sub_groups
| Field | Type | Constraints | Purpose |
|-------|------|-------------|---------|
| `code` | VARCHAR(10) | PRIMARY KEY | Unit sub-group code (e.g., "111102") |
| `title` | VARCHAR(200) | NOT NULL | Unit sub-group title |
| `unit_code` | VARCHAR(10) | FK to unit groups | Parent unit group |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |

### psoc_position_titles
| Field | Type | Constraints | Purpose |
|-------|------|-------------|---------|
| `id` | UUID | PRIMARY KEY | Unique identifier |
| `title` | VARCHAR(200) | NOT NULL | Position title |
| `unit_group_code` | VARCHAR(10) | FK to unit groups | Related unit group |
| `is_primary` | BOOLEAN | DEFAULT false | Main title for unit group |
| `description` | TEXT | - | Position description |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |

### psoc_occupation_cross_references
| Field | Type | Constraints | Purpose |
|-------|------|-------------|---------|
| `id` | UUID | PRIMARY KEY | Unique identifier |
| `unit_group_code` | VARCHAR(10) | FK to unit groups | Source unit group |
| `related_unit_code` | VARCHAR(10) | FK to unit groups | Related unit group |
| `related_occupation_title` | VARCHAR(200) | NOT NULL | Related occupation title |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |

---

## 👥 4. ACCESS CONTROL AND USER MANAGEMENT

### roles
| Field | Type | Constraints | Purpose |
|-------|------|-------------|---------|
| `id` | UUID | PRIMARY KEY | Unique role identifier |
| `name` | VARCHAR(50) | UNIQUE NOT NULL | Role name |
| `description` | TEXT | - | Role description |
| `permissions` | JSONB | DEFAULT '{}' | Role permissions JSON |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

### user_profiles (V2 Enhanced)
| Field | Type | Constraints | Purpose |
|-------|------|-------------|---------|
| `id` | UUID | PRIMARY KEY, FK to auth.users | User identifier |
| `email` | VARCHAR(255) | NOT NULL | User email |
| `first_name` | VARCHAR(100) | NOT NULL | First name |
| `last_name` | VARCHAR(100) | NOT NULL | Last name |
| `middle_name` | VARCHAR(100) | - | Middle name |
| `phone` | VARCHAR(20) | - | Phone number |
| `role_id` | UUID | FK to roles | User role |
| **V2: Geographic Hierarchy** |||||
| `barangay_code` | VARCHAR(10) | FK to barangays | Primary barangay |
| `region_code` | VARCHAR(10) | FK to regions | Region access level |
| `province_code` | VARCHAR(10) | FK to provinces | Province access level |
| `city_municipality_code` | VARCHAR(10) | FK to cities | City access level |
| `is_active` | BOOLEAN | DEFAULT true | Active status |
| `last_login` | TIMESTAMPTZ | - | Last login time |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

### barangay_accounts
| Field | Type | Constraints | Purpose |
|-------|------|-------------|---------|
| `id` | UUID | PRIMARY KEY | Unique identifier |
| `user_id` | UUID | FK to user_profiles | User reference |
| `barangay_code` | VARCHAR(10) | FK to barangays | Barangay access |
| `is_primary` | BOOLEAN | DEFAULT false | Primary assignment flag |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| **CONSTRAINT** | UNIQUE(user_id, barangay_code) | - | One assignment per user-barangay |

---

## 🗺️ 5. ADDRESS AND GEOGRAPHY MANAGEMENT

### subdivisions
| Field | Type | Constraints | Purpose |
|-------|------|-------------|---------|
| `id` | UUID | PRIMARY KEY | Unique identifier |
| `name` | VARCHAR(100) | NOT NULL | Subdivision name |
| `type` | VARCHAR(20) | CHECK IN ('Subdivision', 'Zone', 'Sitio', 'Purok') | Subdivision type |
| `barangay_code` | VARCHAR(10) | FK to barangays | Parent barangay |
| `description` | TEXT | - | Additional description |
| `is_active` | BOOLEAN | DEFAULT true | Active status |
| `created_by` | UUID | FK to user_profiles | Creator user |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |
| **CONSTRAINT** | UNIQUE(name, barangay_code) | - | Unique name per barangay |

### street_names
| Field | Type | Constraints | Purpose |
|-------|------|-------------|---------|
| `id` | UUID | PRIMARY KEY | Unique identifier |
| `name` | VARCHAR(100) | NOT NULL | Street name |
| `barangay_code` | VARCHAR(10) | FK to barangays | Parent barangay |
| `subdivision_id` | UUID | FK to subdivisions | Parent subdivision (optional) |
| `description` | TEXT | - | Additional description |
| `is_active` | BOOLEAN | DEFAULT true | Active status |
| `created_by` | UUID | FK to user_profiles | Creator user |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |
| **CONSTRAINT** | UNIQUE(name, barangay_code, subdivision_id) | - | Unique name per barangay/subdivision |

---

## 🏠 6. CORE ENTITIES - HOUSEHOLDS

### households (V2 Enhanced)
| Field | Type | Constraints | Purpose |
|-------|------|-------------|---------|
| **IDENTIFIERS** |||||
| `id` | UUID | PRIMARY KEY | Unique identifier |
| `code` | VARCHAR(50) | UNIQUE NOT NULL | Hierarchical code (RRPPMMBBB-SSSS-TTTT-HHHH) |
| `household_number` | VARCHAR(50) | NOT NULL | Human-readable number |
| `household_head_id` | UUID | FK to residents | Household head reference |
| **V2: AUTO-CALCULATED** |||||
| `total_members` | INTEGER | DEFAULT 0 | Auto-updated member count |
| `creation_date` | DATE | DEFAULT CURRENT_DATE | Creation date |
| **GEOGRAPHIC HIERARCHY** |||||
| `barangay_code` | VARCHAR(10) | FK to barangays | Required barangay |
| `region_code` | VARCHAR(10) | FK to regions | Required region |
| `province_code` | VARCHAR(10) | FK to provinces | Required (except independent cities) |
| `city_municipality_code` | VARCHAR(10) | FK to cities | Required city/municipality |
| **ADDRESS RELATIONSHIPS** |||||
| `subdivision_id` | UUID | FK to subdivisions | Subdivision reference |
| `street_id` | UUID | FK to street_names | Street reference |
| `house_number` | VARCHAR(50) | - | House/lot number |
| **HOUSEHOLD CLASSIFICATION** |||||
| `household_type` | household_type_enum | - | Family structure type |
| `tenure_status` | tenure_status_enum | - | Ownership status |
| `tenure_others_specify` | TEXT | - | Other tenure details |
| `household_unit` | household_unit_enum | - | Housing unit type |
| **PROFILE INFORMATION** |||||
| `no_of_families` | INTEGER | DEFAULT 1 | Number of families |
| `no_of_members` | INTEGER | DEFAULT 0 | Auto-calculated members |
| `no_of_migrants` | INTEGER | DEFAULT 0 | Auto-calculated migrants |
| **FINANCIAL INFORMATION** |||||
| `monthly_income` | DECIMAL(12,2) | DEFAULT 0.00 | Total household income |
| `income_class` | income_class_enum | - | Auto-calculated income class |
| **DERIVED FIELDS** |||||
| `household_name` | VARCHAR(100) | - | Derived from head's last name |
| **STATUS** |||||
| `is_active` | BOOLEAN | DEFAULT true | Active status |
| **AUDIT** |||||
| `created_by` | UUID | FK to user_profiles | Creator user |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |
| **CONSTRAINTS** |||||
| **UNIQUE** | (household_number, barangay_code) | - | Unique number per barangay |

---

## 👤 7. CORE ENTITIES - RESIDENTS (V2 Enhanced)

### residents (Complete Profile)
| Field | Type | Constraints | Purpose |
|-------|------|-------------|---------|
| **IDENTIFIERS** |||||
| `id` | UUID | PRIMARY KEY | Unique identifier |
| **PHILSYS INTEGRATION** |||||
| `philsys_card_number_hash` | BYTEA | - | Hashed PhilSys card number |
| `philsys_last4` | VARCHAR(4) | - | Last 4 digits for lookup |
| **PERSONAL INFORMATION** |||||
| `first_name` | VARCHAR(100) | NOT NULL | First name |
| `middle_name` | VARCHAR(100) | - | Middle name |
| `last_name` | VARCHAR(100) | NOT NULL | Last name |
| `extension_name` | VARCHAR(20) | - | Name suffix (Jr., Sr., III) |
| `birthdate` | DATE | NOT NULL | Date of birth |
| `place_of_birth` | VARCHAR(200) | - | Birth place |
| `sex` | sex_enum | NOT NULL | Gender |
| `civil_status` | civil_status_enum | NOT NULL | Marital status |
| `citizenship` | citizenship_enum | DEFAULT 'filipino' | Citizenship status |
| **EDUCATION** |||||
| `education_level` | education_level_enum | - | Highest education level |
| `education_status` | education_status_enum | - | Current education status |
| **OCCUPATION & EMPLOYMENT** |||||
| `psoc_code` | VARCHAR(10) | - | PSOC classification code |
| `psoc_level` | VARCHAR(20) | CHECK IN ('major_group', 'sub_major_group', etc.) | PSOC hierarchy level |
| `occupation_title` | VARCHAR(200) | - | Denormalized occupation title |
| `occupation` | VARCHAR(200) | - | Additional occupation field |
| `job_title` | VARCHAR(200) | - | Job title |
| `workplace` | VARCHAR(255) | - | Workplace information |
| `occupation_details` | TEXT | - | Additional occupation details |
| `employment_status` | employment_status_enum | DEFAULT 'not_in_labor_force' | Employment status |
| **CONTACT INFORMATION** |||||
| `mobile_number` | VARCHAR(20) | - | Mobile phone number |
| `telephone_number` | VARCHAR(20) | - | Landline number |
| `email` | VARCHAR(255) | - | Email address |
| **LOCATION (HIERARCHY)** |||||
| `household_code` | VARCHAR(50) | FK to households | Primary household code |
| `household_id` | UUID | FK to households | Secondary household UUID |
| `barangay_code` | VARCHAR(10) | FK to barangays | Barangay code |
| `region_code` | VARCHAR(10) | FK to regions | Auto-populated region |
| `province_code` | VARCHAR(10) | FK to provinces | Auto-populated province |
| `city_municipality_code` | VARCHAR(10) | FK to cities | Auto-populated city |
| **PHYSICAL CHARACTERISTICS** |||||
| `height` | DECIMAL(5,2) | - | Height in cm |
| `weight` | DECIMAL(5,2) | - | Weight in kg |
| `complexion` | VARCHAR(50) | - | Complexion description |
| `blood_type` | blood_type_enum | DEFAULT 'unknown' | Blood type |
| **DEMOGRAPHICS** |||||
| `ethnicity` | ethnicity_enum | DEFAULT 'not_reported' | Ethnic background |
| `religion` | religion_enum | DEFAULT 'prefer_not_to_say' | Religious affiliation |
| `religion_others_specify` | TEXT | - | Other religion specification |
| **VOTING INFORMATION** |||||
| `voter_registration_status` | BOOLEAN | DEFAULT false | Voter registration status |
| `resident_voter_status` | BOOLEAN | DEFAULT false | Resident voter status |
| `voter_id_number` | VARCHAR(20) | - | Voter ID number |
| `last_voted_year` | INTEGER | - | Last voting year |
| `is_resident_voter` | BOOLEAN | DEFAULT false | Resident voter flag |
| **FAMILY INFORMATION** |||||
| `mother_maiden_first` | TEXT | - | Mother's maiden first name |
| `mother_maiden_middle` | TEXT | - | Mother's maiden middle name |
| `mother_maiden_last` | TEXT | - | Mother's maiden last name |
| **V2: SEARCH OPTIMIZATION** |||||
| `search_text` | TEXT | GENERATED ALWAYS AS (...) STORED | Auto-generated search text |
| `search_vector` | tsvector | GENERATED ALWAYS AS (...) STORED | Full-text search vector |
| **AUDIT** |||||
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

---

## 👪 8. RELATIONSHIP TABLES

### household_members
| Field | Type | Constraints | Purpose |
|-------|------|-------------|---------|
| `id` | UUID | PRIMARY KEY | Unique identifier |
| `household_id` | VARCHAR(22) | FK to households | Household reference |
| `resident_id` | UUID | FK to residents | Resident reference |
| `relationship_to_head` | VARCHAR(50) | NOT NULL | Relationship description |
| `family_position` | family_position_enum | - | Family position |
| `position_notes` | TEXT | - | Additional position notes |
| `join_date` | DATE | DEFAULT CURRENT_DATE | Date joined household |
| `leave_date` | DATE | - | Date left household |
| `is_active` | BOOLEAN | DEFAULT true | Active status |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |
| **CONSTRAINT** | UNIQUE(household_id, resident_id, join_date) | - | Unique membership per date |

### resident_relationships
| Field | Type | Constraints | Purpose |
|-------|------|-------------|---------|
| `id` | UUID | PRIMARY KEY | Unique identifier |
| `resident_a_id` | UUID | FK to residents | First resident |
| `resident_b_id` | UUID | FK to residents | Second resident |
| `relationship_type` | VARCHAR(50) | CHECK IN ('Spouse', 'Parent', etc.) | Relationship type |
| `relationship_description` | TEXT | - | Additional description |
| `is_reciprocal` | BOOLEAN | DEFAULT true | Reciprocal relationship flag |
| `start_date` | DATE | DEFAULT CURRENT_DATE | Relationship start date |
| `end_date` | DATE | - | Relationship end date |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |
| **CONSTRAINTS** |||||
| `no_self_relationship` | CHECK (resident_a_id != resident_b_id) | - | Prevent self-relationships |
| `unique_relationship` | UNIQUE(resident_a_id, resident_b_id, relationship_type) | - | Unique relationship per pair |

---

## 📊 9. SECTORAL AND ANALYTICS TABLES

### sectoral_information (V2 Enhanced with Auto-Sync)
| Field | Type | Constraints | Purpose |
|-------|------|-------------|---------|
| `id` | UUID | PRIMARY KEY | Unique identifier |
| `resident_id` | UUID | FK to residents | Resident reference |
| **LABOR FORCE STATUS** |||||
| `is_labor_force` | BOOLEAN | DEFAULT false | In labor force flag |
| `is_employed` | BOOLEAN | DEFAULT false | Employed flag |
| `is_unemployed` | BOOLEAN | DEFAULT false | Unemployed flag |
| **SPECIAL POPULATIONS** |||||
| `is_ofw` | BOOLEAN | DEFAULT false | Overseas Filipino Worker |
| `is_person_with_disability` | BOOLEAN | DEFAULT false | Person with disability |
| `is_out_of_school_children` | BOOLEAN | DEFAULT false | Out-of-school children (6-15) |
| `is_out_of_school_youth` | BOOLEAN | DEFAULT false | Out-of-school youth (16-24) |
| `is_senior_citizen` | BOOLEAN | DEFAULT false | Senior citizen (60+) |
| `is_registered_senior_citizen` | BOOLEAN | DEFAULT false | Registered senior citizen |
| `is_solo_parent` | BOOLEAN | DEFAULT false | Solo parent |
| `is_indigenous_people` | BOOLEAN | DEFAULT false | Indigenous people |
| `is_migrant` | BOOLEAN | DEFAULT false | Migrant |
| **ADDITIONAL** |||||
| `notes` | TEXT | - | Additional notes |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |
| **CONSTRAINT** | UNIQUE(resident_id) | - | One record per resident |

### migrant_information
| Field | Type | Constraints | Purpose |
|-------|------|-------------|---------|
| `id` | UUID | PRIMARY KEY | Unique identifier |
| `resident_id` | UUID | FK to residents | Resident reference |
| **PREVIOUS RESIDENCE** |||||
| `previous_region_code` | VARCHAR(10) | FK to regions | Previous region |
| `previous_province_code` | VARCHAR(10) | FK to provinces | Previous province |
| `previous_city_municipality_code` | VARCHAR(10) | FK to cities | Previous city |
| `previous_barangay_code` | VARCHAR(10) | FK to barangays | Previous barangay |
| `previous_street_name` | VARCHAR(200) | - | Previous street |
| `previous_house_number` | VARCHAR(50) | - | Previous house number |
| `previous_subdivision` | VARCHAR(100) | - | Previous subdivision |
| `previous_zip_code` | VARCHAR(10) | - | Previous ZIP code |
| `previous_complete_address` | TEXT | - | Complete previous address |
| **MIGRATION DETAILS** |||||
| `length_of_stay_previous_months` | INTEGER | - | Stay duration at previous (months) |
| `reason_for_leaving` | TEXT | - | Reason for leaving |
| `date_of_transfer` | DATE | - | Transfer date |
| `reason_for_transferring` | TEXT | - | Reason for transferring |
| `duration_of_stay_current_months` | INTEGER | - | Current stay duration (months) |
| **RETURN INTENTION** |||||
| `intention_to_return` | BOOLEAN | - | Intention to return |
| `intention_notes` | TEXT | - | Return intention notes |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |
| **CONSTRAINT** | UNIQUE(resident_id) | - | One record per resident |

### barangay_dashboard_summaries (V2 Enhanced)
| Field | Type | Constraints | Purpose |
|-------|------|-------------|---------|
| `id` | UUID | PRIMARY KEY | Unique identifier |
| `barangay_code` | VARCHAR(10) | FK to barangays | Barangay reference |
| `calculation_date` | DATE | DEFAULT CURRENT_DATE | Calculation date |
| **POPULATION STATISTICS** |||||
| `total_residents` | INTEGER | DEFAULT 0 | Total resident count |
| `total_households` | INTEGER | DEFAULT 0 | Total household count |
| `average_household_size` | DECIMAL(3,2) | DEFAULT 0 | Average household size |
| **DEMOGRAPHICS** |||||
| `male_count` | INTEGER | DEFAULT 0 | Male population |
| `female_count` | INTEGER | DEFAULT 0 | Female population |
| **AGE GROUPS** |||||
| `age_0_14` | INTEGER | DEFAULT 0 | Ages 0-14 |
| `age_15_64` | INTEGER | DEFAULT 0 | Ages 15-64 |
| `age_65_plus` | INTEGER | DEFAULT 0 | Ages 65+ |
| **CIVIL STATUS** |||||
| `single_count` | INTEGER | DEFAULT 0 | Single residents |
| `married_count` | INTEGER | DEFAULT 0 | Married residents |
| `widowed_count` | INTEGER | DEFAULT 0 | Widowed residents |
| `divorced_separated_count` | INTEGER | DEFAULT 0 | Divorced/separated |
| **EMPLOYMENT** |||||
| `employed_count` | INTEGER | DEFAULT 0 | Employed residents |
| `unemployed_count` | INTEGER | DEFAULT 0 | Unemployed residents |
| `student_count` | INTEGER | DEFAULT 0 | Student residents |
| `retired_count` | INTEGER | DEFAULT 0 | Retired residents |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| **CONSTRAINT** | UNIQUE(barangay_code, calculation_date) | - | One summary per barangay per date |

### audit_logs
| Field | Type | Constraints | Purpose |
|-------|------|-------------|---------|
| `id` | UUID | PRIMARY KEY | Unique identifier |
| `table_name` | VARCHAR(50) | NOT NULL | Table that was modified |
| `record_id` | UUID | NOT NULL | Record that was modified |
| `operation` | VARCHAR(10) | CHECK IN ('INSERT', 'UPDATE', 'DELETE') | Operation type |
| `old_values` | JSONB | - | Previous values |
| `new_values` | JSONB | - | New values |
| `user_id` | UUID | FK to user_profiles | User who made change |
| `barangay_code` | VARCHAR(10) | FK to barangays | Related barangay |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Change timestamp |

---

## 🔧 10. V2 ENHANCED FEATURES

### Key V2 Enhancements
| Enhancement | Tables Affected | Purpose |
|-------------|----------------|---------|
| **Geographic Hierarchy** | user_profiles | Multi-level government access |
| **Auto-calculations** | residents, households, sectoral_information | Smart data updates via triggers |
| **Independence Constraint** | psgc_cities_municipalities | Metro Manila validation |
| **Search Optimization** | residents | Generated search_text and vector |
| **Conditional Indexes** | Multiple | Performance optimization |
| **Auto-sync Triggers** | sectoral_information | Data consistency |

### V2 Trigger Functions
| Function | Purpose | Trigger On |
|----------|---------|-----------|
| `update_household_derived_fields()` | Auto-update member counts | household_members |
| `auto_populate_sectoral_info()` | Auto-calculate sectoral flags | residents |
| `update_resident_sectoral_status()` | Direct sectoral field updates | residents |
| `generate_household_id_trigger()` | Auto-generate hierarchical IDs | households |
| `auto_populate_resident_address()` | Auto-populate address hierarchy | residents |
| `create_audit_log()` | Create audit trail | Multiple tables |
| `update_updated_at_column()` | Auto-update timestamps | Multiple tables |
| `determine_income_class()` | Calculate income classification | Used by household triggers |

---

## 🛡️ 11. ROW LEVEL SECURITY (RLS) IMPLEMENTATION

### RLS-Enabled Tables
| Table Category | Tables | RLS Policy |
|----------------|--------|------------|
| **PSGC Reference** | regions, provinces, cities, barangays | Public read, admin write |
| **PSOC Reference** | All PSOC tables | Public read only |
| **User Management** | roles, user_profiles, barangay_accounts | Role-based access |
| **Core Data** | residents, households, household_members | Barangay-scoped access |
| **Supporting Data** | subdivisions, street_names, sectoral_information, migrant_information | Barangay-scoped access |
| **Analytics** | audit_logs, barangay_dashboard_summaries | Barangay-scoped read |

### Key RLS Policies
| Policy Name | Table | Logic |
|-------------|-------|-------|
| `"Barangay access for residents"` | residents | User can only see residents from their assigned barangay |
| `"Barangay access for households"` | households | User can only see households from their assigned barangay |
| `"Users can view own profile"` | user_profiles | Users can only see their own profile |
| `"Public read psgc_regions"` | psgc_regions | Anyone can read geographic data |
| `"Super admin only roles"` | roles | Only super admins can manage roles |

---

## 🎯 12. BUSINESS VALUE SUMMARY

### Government Compliance
- **PSGC Integration**: Complete Philippine geographic hierarchy
- **PSOC Integration**: Standard occupation classification
- **LGU Form 10**: Compliant data structure
- **PhilSys Ready**: Secure national ID integration

### Performance Features
- **Auto-calculations**: Household counts, sectoral flags, income class
- **Search Optimization**: Full-text search with generated columns
- **Conditional Indexes**: Performance optimization
- **Pre-calculated Analytics**: Dashboard summaries

### Security & Compliance
- **Row Level Security**: Complete data isolation
- **Audit Trail**: Full change tracking
- **Role-based Access**: Multi-level government hierarchy
- **Data Validation**: Comprehensive constraints

### Scalability Features
- **Hierarchical IDs**: PSGC-based unique identifiers
- **Normalized Addresses**: Subdivisions and streets tables
- **Flexible Sectoral Tracking**: Auto-synced sectoral information
- **Migration Tracking**: Complete resident movement history

**Total Schema**: 25 tables, 15+ enums, 60+ indexes, complete RLS implementation