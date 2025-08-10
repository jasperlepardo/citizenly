# RBI System Database Schema Documentation

## 📋 **Schema Overview**
**System**: Records of Barangay Inhabitant System  
**Version**: 2.2 - PII Encryption + Address Business Rules  
**Updated**: January 2025  
**Total Tables**: 27 tables organized by context  

---

## 🔐 **AUTHENTICATION CONTEXT (auth_*)**
*User management, roles, and permissions*

### **auth_roles**
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique role identifier |
| `name` | VARCHAR(50) | UNIQUE NOT NULL | Role name (e.g., admin, user) |
| `description` | TEXT | | Role description |
| `permissions` | JSONB | DEFAULT '{}' | Role permissions configuration |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

### **auth_user_profiles**
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, REFERENCES auth.users(id) | User ID from Supabase auth |
| `first_name` | VARCHAR(100) | NOT NULL | User's first name |
| `middle_name` | VARCHAR(100) | | User's middle name |
| `last_name` | VARCHAR(100) | NOT NULL | User's last name |
| `email` | VARCHAR(255) | NOT NULL | User's email address |
| `phone` | VARCHAR(20) | | User's phone number |
| `role_id` | UUID | NOT NULL, REFERENCES auth_roles(id) | Assigned role |
| `barangay_code` | VARCHAR(10) | REFERENCES psgc_barangays(code) | Primary barangay assignment |
| `city_municipality_code` | VARCHAR(10) | REFERENCES psgc_cities_municipalities(code) | City/municipality assignment |
| `province_code` | VARCHAR(10) | REFERENCES psgc_provinces(code) | Province assignment |
| `region_code` | VARCHAR(10) | REFERENCES psgc_regions(code) | Region assignment |
| `is_active` | BOOLEAN | DEFAULT true | User active status |
| `last_login` | TIMESTAMPTZ | | Last login timestamp |
| `created_by` | UUID | REFERENCES auth_user_profiles(id) | Creator user ID |
| `updated_by` | UUID | REFERENCES auth_user_profiles(id) | Last updater user ID |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

### **auth_barangay_accounts**
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique account identifier |
| `user_id` | UUID | NOT NULL, REFERENCES auth_user_profiles(id) | User reference |
| `barangay_code` | VARCHAR(10) | NOT NULL, REFERENCES psgc_barangays(code) | Barangay access |
| `is_primary` | BOOLEAN | DEFAULT false | Primary barangay flag |
| `created_by` | UUID | REFERENCES auth_user_profiles(id) | Creator user ID |
| `updated_by` | UUID | REFERENCES auth_user_profiles(id) | Last updater user ID |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |
| **UNIQUE** | | (user_id, barangay_code) | One account per user per barangay |

---

## 🔒 **SECURITY CONTEXT (system_encryption_*)**
*PII encryption and key management tables*

### **system_encryption_keys**
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique key identifier |
| `key_name` | VARCHAR(50) | NOT NULL, UNIQUE | Key name identifier |
| `key_version` | INTEGER | NOT NULL, DEFAULT 1 | Key version number |
| `encryption_algorithm` | VARCHAR(20) | DEFAULT 'AES-256-GCM' | Encryption algorithm used |
| `key_purpose` | VARCHAR(50) | NOT NULL, CHECK (key_purpose IN ('pii', 'documents', 'communications', 'system')) | Purpose of encryption key |
| `key_hash` | BYTEA | NOT NULL | Key hash (not actual key) |
| `is_active` | BOOLEAN | DEFAULT true | Active key status |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| `activated_at` | TIMESTAMPTZ | DEFAULT NOW() | Activation timestamp |
| `rotated_at` | TIMESTAMPTZ | | Last rotation timestamp |
| `expires_at` | TIMESTAMPTZ | | Key expiration date |
| `created_by` | UUID | REFERENCES auth_user_profiles(id) | Creator user ID |
| **UNIQUE** | | (key_name, is_active) WHERE is_active = true | One active key per name |

### **system_key_rotation_history**
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique rotation identifier |
| `key_name` | VARCHAR(50) | NOT NULL | Rotated key name |
| `old_key_version` | INTEGER | NOT NULL | Previous key version |
| `new_key_version` | INTEGER | NOT NULL | New key version |
| `rotation_reason` | TEXT | | Reason for rotation |
| `rotated_by` | UUID | REFERENCES auth_user_profiles(id) | User who rotated key |
| `rotated_at` | TIMESTAMPTZ | DEFAULT NOW() | Rotation timestamp |
| `records_migrated` | INTEGER | DEFAULT 0 | Number of records migrated |
| `migration_completed_at` | TIMESTAMPTZ | | Migration completion timestamp |

---

## 🌍 **GEOGRAPHIC CONTEXT (geo_*)**
*Local geographic subdivisions within barangays*

### **geo_subdivisions**
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique subdivision identifier |
| `name` | VARCHAR(100) | NOT NULL | Subdivision name |
| `type` | VARCHAR(20) | NOT NULL, CHECK (type IN ('Subdivision', 'Zone', 'Sitio', 'Purok')) | Subdivision type |
| `barangay_code` | VARCHAR(10) | NOT NULL, REFERENCES psgc_barangays(code) | Parent barangay |
| `description` | TEXT | | Subdivision description |
| `is_active` | BOOLEAN | DEFAULT true | Active status |
| `created_by` | UUID | REFERENCES auth_user_profiles(id) | Creator user ID |
| `updated_by` | UUID | REFERENCES auth_user_profiles(id) | Last updater user ID |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |
| **UNIQUE** | | (name, barangay_code) | Unique name per barangay |

### **geo_street_names**
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique street identifier |
| `name` | VARCHAR(100) | NOT NULL | Street name |
| `barangay_code` | VARCHAR(10) | NOT NULL, REFERENCES psgc_barangays(code) | Parent barangay |
| `subdivision_id` | UUID | REFERENCES geo_subdivisions(id) | Parent subdivision |
| `description` | TEXT | | Street description |
| `is_active` | BOOLEAN | DEFAULT true | Active status |
| `created_by` | UUID | REFERENCES auth_user_profiles(id) | Creator user ID |
| `updated_by` | UUID | REFERENCES auth_user_profiles(id) | Last updater user ID |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |
| **UNIQUE** | | (name, barangay_code, subdivision_id) | Unique street per location |

---

## 📍 **REFERENCE DATA (psgc_* & psoc_*)**
*Government standard reference data (read-only)*

### **Philippine Standard Geographic Code (PSGC) Tables**

#### **psgc_regions**
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `code` | VARCHAR(10) | PRIMARY KEY | Official PSGC region code |
| `name` | VARCHAR(100) | NOT NULL | Region name |
| `is_active` | BOOLEAN | DEFAULT true | Active status |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

#### **psgc_provinces**
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `code` | VARCHAR(10) | PRIMARY KEY | Official PSGC province code |
| `name` | VARCHAR(100) | NOT NULL | Province name |
| `region_code` | VARCHAR(10) | NOT NULL, REFERENCES psgc_regions(code) | Parent region |
| `is_active` | BOOLEAN | DEFAULT true | Active status |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

#### **psgc_cities_municipalities**
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `code` | VARCHAR(10) | PRIMARY KEY | Official PSGC city/municipality code |
| `name` | VARCHAR(200) | NOT NULL | City/municipality name |
| `province_code` | VARCHAR(10) | REFERENCES psgc_provinces(code) | Parent province (NULL for independent cities) |
| `type` | VARCHAR(50) | NOT NULL | Type (City, Municipality) |
| `is_independent` | BOOLEAN | DEFAULT false | Independent city flag |
| `is_active` | BOOLEAN | DEFAULT true | Active status |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |
| **CHECK** | | independence_rule | Independent cities have NULL province_code |

#### **psgc_barangays**
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `code` | VARCHAR(10) | PRIMARY KEY | Official PSGC barangay code |
| `name` | VARCHAR(100) | NOT NULL | Barangay name |
| `city_municipality_code` | VARCHAR(10) | NOT NULL, REFERENCES psgc_cities_municipalities(code) | Parent city/municipality |
| `is_active` | BOOLEAN | DEFAULT true | Active status |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |

### **Philippine Standard Occupational Classification (PSOC) Tables**

#### **psoc_major_groups**
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `code` | VARCHAR(10) | PRIMARY KEY | PSOC major group code |
| `title` | VARCHAR(200) | NOT NULL | Major group title |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |

#### **psoc_sub_major_groups**
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `code` | VARCHAR(10) | PRIMARY KEY | PSOC sub-major group code |
| `title` | VARCHAR(200) | NOT NULL | Sub-major group title |
| `major_code` | VARCHAR(10) | NOT NULL, REFERENCES psoc_major_groups(code) | Parent major group |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |

#### **psoc_minor_groups**
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `code` | VARCHAR(10) | PRIMARY KEY | PSOC minor group code |
| `title` | VARCHAR(200) | NOT NULL | Minor group title |
| `sub_major_code` | VARCHAR(10) | NOT NULL, REFERENCES psoc_sub_major_groups(code) | Parent sub-major group |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |

#### **psoc_unit_groups**
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `code` | VARCHAR(10) | PRIMARY KEY | PSOC unit group code |
| `title` | VARCHAR(200) | NOT NULL | Unit group title |
| `minor_code` | VARCHAR(10) | NOT NULL, REFERENCES psoc_minor_groups(code) | Parent minor group |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |

#### **psoc_unit_sub_groups**
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `code` | VARCHAR(10) | PRIMARY KEY | PSOC unit sub-group code |
| `title` | VARCHAR(200) | NOT NULL | Unit sub-group title |
| `unit_code` | VARCHAR(10) | NOT NULL, REFERENCES psoc_unit_groups(code) | Parent unit group |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |

#### **psoc_position_titles**
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique position identifier |
| `title` | VARCHAR(200) | NOT NULL | Position title |
| `unit_group_code` | VARCHAR(10) | NOT NULL, REFERENCES psoc_unit_groups(code) | Parent unit group |
| `is_primary` | BOOLEAN | DEFAULT false | Primary title flag |
| `description` | TEXT | | Position description |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |

#### **psoc_occupation_cross_references**
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique cross-reference identifier |
| `unit_group_code` | VARCHAR(10) | NOT NULL, REFERENCES psoc_unit_groups(code) | Primary unit group |
| `related_unit_code` | VARCHAR(10) | NOT NULL, REFERENCES psoc_unit_groups(code) | Related unit group |
| `related_occupation_title` | VARCHAR(200) | NOT NULL | Related occupation title |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |

---

## 🏠 **CORE DATA TABLES**
*Main entities for households and residents*

### **households**
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique household identifier |
| `code` | VARCHAR(50) | NOT NULL, UNIQUE | Hierarchical code (RRPPMMBBB-SSSS-TTTT-HHHH) |
| `household_number` | VARCHAR(50) | NOT NULL | Household number |
| `house_number` | VARCHAR(50) | NOT NULL | House number (REQUIRED) |
| `street_id` | UUID | NOT NULL, REFERENCES geo_street_names(id) | Street reference (REQUIRED) |
| `subdivision_id` | UUID | REFERENCES geo_subdivisions(id) | Subdivision reference (OPTIONAL) |
| `barangay_code` | VARCHAR(10) | NOT NULL, REFERENCES psgc_barangays(code) | Barangay location |
| `city_municipality_code` | VARCHAR(10) | NOT NULL, REFERENCES psgc_cities_municipalities(code) | City/municipality |
| `province_code` | VARCHAR(10) | REFERENCES psgc_provinces(code) | Province (NULL for independent cities) |
| `region_code` | VARCHAR(10) | NOT NULL, REFERENCES psgc_regions(code) | Region |
| `total_families` | INTEGER | DEFAULT 1 | Number of family units |
| `total_members` | INTEGER | DEFAULT 0 | Total household members (auto-calculated) |
| `total_migrants` | INTEGER | DEFAULT 0 | Total migrants (auto-calculated) |
| `household_type` | household_type_enum | | Household classification |
| `tenure_status` | tenure_status_enum | | Housing tenure status |
| `tenure_others_specify` | TEXT | | Other tenure specification |
| `household_unit` | household_unit_enum | | Type of housing unit |
| `household_name` | VARCHAR(100) | | Household name |
| `monthly_income` | DECIMAL(12,2) | DEFAULT 0.00 | Monthly household income |
| `income_class` | income_class_enum | | Economic classification |
| `household_head_id` | UUID | | Head of household reference |
| `is_active` | BOOLEAN | DEFAULT true | Active status |
| `created_by` | UUID | REFERENCES auth_user_profiles(id) | Creator user ID |
| `updated_by` | UUID | REFERENCES auth_user_profiles(id) | Last updater user ID |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |
| **CHECK** | | required_house_number | House number is NOT NULL and not empty |
| **CHECK** | | required_street | Street is NOT NULL (required) |
| **UNIQUE** | | (household_number, barangay_code) | Unique household number per barangay |

### **residents**
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique resident identifier |
| **IDENTIFICATION** |
| `philsys_card_number_hash` | BYTEA | | PhilSys card number (encrypted) |
| `philsys_last4` | VARCHAR(4) | | Last 4 digits of PhilSys card |
| **PERSONAL INFORMATION** |
| `first_name` | VARCHAR(100) | NOT NULL | First name |
| `middle_name` | VARCHAR(100) | | Middle name |
| `last_name` | VARCHAR(100) | NOT NULL | Last name |
| `extension_name` | VARCHAR(20) | | Name extension (Jr., Sr., etc.) |
| `birthdate` | DATE | NOT NULL | Date of birth |
| `age` | INTEGER | GENERATED ALWAYS AS (EXTRACT(YEAR FROM AGE(birthdate))) STORED | Auto-calculated age |
| `birth_place_code` | VARCHAR(10) | | PSGC code for birth place |
| `birth_place_level` | birth_place_level_enum | | PSGC level for birth place |
| `birth_place_text` | VARCHAR(200) | | Free text birth place |
| `birth_place_full` | TEXT | GENERATED ALWAYS AS (...) STORED | Complete birth place address |
| `sex` | sex_enum | NOT NULL | Biological sex |
| `civil_status` | civil_status_enum | DEFAULT 'single' | Civil status |
| `civil_status_others_specify` | TEXT | | Other civil status specification |
| `blood_type` | blood_type_enum | DEFAULT 'unknown' | Blood type |
| `height` | DECIMAL(5,2) | | Height in cm |
| `weight` | DECIMAL(5,2) | | Weight in kg |
| `complexion` | VARCHAR(50) | | Complexion description |
| **EDUCATION AND EMPLOYMENT** |
| `education_attainment` | education_level_enum | | Highest education level |
| `is_graduate` | BOOLEAN | DEFAULT false | Completed education level |
| `employment_status` | employment_status_enum | | Employment status |
| `psoc_code` | TEXT | | PSOC classification code |
| `psoc_level` | TEXT | | PSOC hierarchy level |
| `occupation_title` | TEXT | | Standardized occupation title |
| `job_title` | TEXT | | Specific job position |
| `workplace` | TEXT | | Company name and location |
| `occupation` | TEXT | | General occupation field |
| `occupation_details` | TEXT | | Detailed occupation information |
| **CONTACT INFORMATION** |
| `mobile_number` | VARCHAR(20) | | Mobile phone number |
| `telephone_number` | VARCHAR(20) | | Landline number |
| `email` | VARCHAR(255) | | Email address |
| **LOCATION AND HOUSEHOLD** |
| `household_id` | UUID | REFERENCES households(id) | Primary household |
| `household_code` | VARCHAR(50) | | Household code (auto-populated) |
| `street_id` | UUID | REFERENCES geo_street_names(id) | Street reference |
| `subdivision_id` | UUID | REFERENCES geo_subdivisions(id) | Subdivision reference |
| `barangay_code` | VARCHAR(10) | NOT NULL, REFERENCES psgc_barangays(code) | Barangay |
| `city_municipality_code` | VARCHAR(10) | NOT NULL, REFERENCES psgc_cities_municipalities(code) | City/municipality |
| `province_code` | VARCHAR(10) | REFERENCES psgc_provinces(code) | Province |
| `region_code` | VARCHAR(10) | NOT NULL, REFERENCES psgc_regions(code) | Region |
| **CIVIC INFORMATION** |
| `citizenship` | citizenship_enum | DEFAULT 'filipino' | Citizenship status |
| `is_registered_voter` | BOOLEAN | DEFAULT false | Voter registration |
| `is_resident_voter` | BOOLEAN | DEFAULT false | Resident voter status |
| `last_voted_year` | INTEGER | | Last voting year |
| **DEMOGRAPHICS** |
| `ethnicity` | ethnicity_enum | DEFAULT 'not_reported' | Ethnic background |
| `religion` | religion_enum | DEFAULT 'prefer_not_to_say' | Religious affiliation |
| `religion_others_specify` | TEXT | | Other religion specification |
| `mother_maiden_first` | TEXT | | Mother's maiden first name |
| `mother_maiden_middle` | TEXT | | Mother's maiden middle name |
| `mother_maiden_last` | TEXT | | Mother's maiden last name |
| **ENCRYPTED PII FIELDS (Secure Storage)** |
| `first_name_encrypted` | BYTEA | | Encrypted first name using AES-256 |
| `middle_name_encrypted` | BYTEA | | Encrypted middle name |
| `last_name_encrypted` | BYTEA | | Encrypted last name |
| `mobile_number_encrypted` | BYTEA | | Encrypted mobile number for privacy |
| `telephone_number_encrypted` | BYTEA | | Encrypted telephone number |
| `email_encrypted` | BYTEA | | Encrypted email address |
| `mother_maiden_first_encrypted` | BYTEA | | Encrypted mother maiden first name (highly sensitive) |
| `mother_maiden_middle_encrypted` | BYTEA | | Encrypted mother maiden middle name |
| `mother_maiden_last_encrypted` | BYTEA | | Encrypted mother maiden last name |
| **SEARCHABLE HASHES** |
| `first_name_hash` | VARCHAR(64) | | Searchable hash of first name (not reversible) |
| `last_name_hash` | VARCHAR(64) | | Searchable hash of last name |
| `mobile_number_hash` | VARCHAR(64) | | Searchable hash of mobile number |
| `email_hash` | VARCHAR(64) | | Searchable hash of email |
| `full_name_hash` | VARCHAR(64) | | Searchable hash of full name |
| **ENCRYPTION METADATA** |
| `is_data_encrypted` | BOOLEAN | DEFAULT false | Flag indicating if PII is encrypted |
| `encryption_key_version` | INTEGER | DEFAULT 1 | Encryption key version used |
| `encrypted_at` | TIMESTAMPTZ | | When data was encrypted |
| `encrypted_by` | UUID | REFERENCES auth_user_profiles(id) | User who encrypted the data |
| **METADATA** |
| `created_by` | UUID | REFERENCES auth_user_profiles(id) | Creator user ID |
| `updated_by` | UUID | REFERENCES auth_user_profiles(id) | Last updater user ID |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |
| `search_text` | TEXT | GENERATED ALWAYS AS (...) STORED | Full-text search field |
| `search_vector` | tsvector | GENERATED ALWAYS AS (...) STORED | PostgreSQL search vector |

---

## 🔗 **SUPPLEMENTARY TABLES**
*Supporting tables for relationships and additional data*

### **household_members**
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique member identifier |
| `household_id` | UUID | NOT NULL, REFERENCES households(id) ON DELETE CASCADE | Household reference |
| `resident_id` | UUID | NOT NULL, REFERENCES residents(id) | Resident reference |
| `relationship_to_head` | VARCHAR(50) | NOT NULL | Relationship to household head |
| `family_position` | family_position_enum | | Position in family |
| `position_notes` | TEXT | | Additional position notes |
| `is_active` | BOOLEAN | DEFAULT true | Active member status |
| `created_by` | UUID | REFERENCES auth_user_profiles(id) | Creator user ID |
| `updated_by` | UUID | REFERENCES auth_user_profiles(id) | Last updater user ID |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |
| **UNIQUE** | | (household_id, resident_id) | One membership per resident per household |

### **resident_relationships**
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique relationship identifier |
| `resident_a_id` | UUID | NOT NULL, REFERENCES residents(id) | First resident |
| `resident_b_id` | UUID | NOT NULL, REFERENCES residents(id) | Second resident |
| `relationship_type` | VARCHAR(50) | NOT NULL, CHECK (...) | Type of relationship |
| `relationship_description` | TEXT | | Relationship description |
| `is_reciprocal` | BOOLEAN | DEFAULT true | Reciprocal relationship flag |
| `start_date` | DATE | DEFAULT CURRENT_DATE | Relationship start date |
| `end_date` | DATE | | Relationship end date |
| `created_by` | UUID | REFERENCES auth_user_profiles(id) | Creator user ID |
| `updated_by` | UUID | REFERENCES auth_user_profiles(id) | Last updater user ID |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |
| **CHECK** | | no_self_relationship | Resident cannot relate to themselves |
| **UNIQUE** | | (resident_a_id, resident_b_id, relationship_type) | Unique relationship per pair |

### **resident_sectoral_info**
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique sectoral identifier |
| `resident_id` | UUID | NOT NULL, REFERENCES residents(id) ON DELETE CASCADE | Resident reference |
| **LABOR FORCE STATUS** |
| `is_labor_force` | BOOLEAN | DEFAULT false | In labor force |
| `is_employed` | BOOLEAN | DEFAULT false | Currently employed |
| `is_unemployed` | BOOLEAN | DEFAULT false | Currently unemployed |
| **SPECIAL POPULATIONS** |
| `is_overseas_filipino_worker` | BOOLEAN | DEFAULT false | OFW status |
| `is_person_with_disability` | BOOLEAN | DEFAULT false | PWD status |
| `is_out_of_school_children` | BOOLEAN | DEFAULT false | OSC (ages 6-14) |
| `is_out_of_school_youth` | BOOLEAN | DEFAULT false | OSY (ages 15-24) |
| `is_senior_citizen` | BOOLEAN | DEFAULT false | Senior citizen (60+) |
| `is_registered_senior_citizen` | BOOLEAN | DEFAULT false | Registered senior citizen |
| `is_solo_parent` | BOOLEAN | DEFAULT false | Solo parent |
| `is_indigenous_people` | BOOLEAN | DEFAULT false | Indigenous person |
| `is_migrant` | BOOLEAN | DEFAULT false | Migrant status |
| `created_by` | UUID | REFERENCES auth_user_profiles(id) | Creator user ID |
| `updated_by` | UUID | REFERENCES auth_user_profiles(id) | Last updater user ID |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |
| **UNIQUE** | | (resident_id) | One sectoral record per resident |

### **resident_migrant_info**
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique migrant identifier |
| `resident_id` | UUID | NOT NULL, REFERENCES residents(id) ON DELETE CASCADE | Resident reference |
| **PREVIOUS LOCATION** |
| `previous_barangay_code` | VARCHAR(10) | REFERENCES psgc_barangays(code) | Previous barangay |
| `previous_city_municipality_code` | VARCHAR(10) | REFERENCES psgc_cities_municipalities(code) | Previous city/municipality |
| `previous_province_code` | VARCHAR(10) | REFERENCES psgc_provinces(code) | Previous province |
| `previous_region_code` | VARCHAR(10) | REFERENCES psgc_regions(code) | Previous region |
| **MIGRATION DETAILS** |
| `date_of_transfer` | DATE | | Migration date |
| `reason_for_transferring` | TEXT | | Migration reason |
| `duration_of_stay_current_months` | INTEGER | | Current stay duration |
| `intends_to_return` | BOOLEAN | | Return intention |
| `created_by` | UUID | REFERENCES auth_user_profiles(id) | Creator user ID |
| `updated_by` | UUID | REFERENCES auth_user_profiles(id) | Last updater user ID |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |
| **UNIQUE** | | (resident_id) | One migrant record per resident |

---

## 📊 **SYSTEM TABLES (system_*)**
*System-generated and administrative tables*

### **system_dashboard_summaries**
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique summary identifier |
| `barangay_code` | VARCHAR(10) | NOT NULL, REFERENCES psgc_barangays(code) | Barangay reference |
| `calculation_date` | DATE | DEFAULT CURRENT_DATE | Summary calculation date |
| **POPULATION STATISTICS** |
| `total_residents` | INTEGER | DEFAULT 0 | Total resident count |
| `total_households` | INTEGER | DEFAULT 0 | Total household count |
| `average_household_size` | DECIMAL(3,2) | DEFAULT 0 | Average household size |
| **DEMOGRAPHICS** |
| `male_count` | INTEGER | DEFAULT 0 | Male resident count |
| `female_count` | INTEGER | DEFAULT 0 | Female resident count |
| **AGE GROUPS** |
| `age_0_5` | INTEGER | DEFAULT 0 | Ages 0-5 |
| `age_6_14` | INTEGER | DEFAULT 0 | Ages 6-14 |
| `age_15_24` | INTEGER | DEFAULT 0 | Ages 15-24 |
| `age_25_59` | INTEGER | DEFAULT 0 | Ages 25-59 |
| `age_60_above` | INTEGER | DEFAULT 0 | Ages 60+ |
| **CIVIL STATUS** |
| `single_count` | INTEGER | DEFAULT 0 | Single residents |
| `married_count` | INTEGER | DEFAULT 0 | Married residents |
| `widowed_count` | INTEGER | DEFAULT 0 | Widowed residents |
| `divorced_separated_count` | INTEGER | DEFAULT 0 | Divorced/separated residents |
| **EMPLOYMENT** |
| `employed_count` | INTEGER | DEFAULT 0 | Employed residents |
| `unemployed_count` | INTEGER | DEFAULT 0 | Unemployed residents |
| `student_count` | INTEGER | DEFAULT 0 | Student residents |
| `retired_count` | INTEGER | DEFAULT 0 | Retired residents |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | Last update timestamp |
| **UNIQUE** | | (barangay_code, calculation_date) | One summary per barangay per date |

### **system_audit_logs**
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY, DEFAULT uuid_generate_v4() | Unique log identifier |
| `table_name` | VARCHAR(50) | NOT NULL | Table affected |
| `record_id` | UUID | NOT NULL | Record identifier |
| `operation` | VARCHAR(10) | NOT NULL, CHECK (operation IN ('INSERT', 'UPDATE', 'DELETE')) | Operation type |
| `old_values` | JSONB | | Previous field values |
| `new_values` | JSONB | | New field values |
| `user_id` | UUID | REFERENCES auth_user_profiles(id) | User who made change |
| `barangay_code` | VARCHAR(10) | REFERENCES psgc_barangays(code) | Barangay context |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | Log timestamp |

### **system_schema_versions**
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `version` | VARCHAR(10) | PRIMARY KEY | Schema version number |
| `applied_at` | TIMESTAMPTZ | DEFAULT NOW() | Version application timestamp |
| `description` | TEXT | | Version description |

---

## 📈 **SCHEMA STATISTICS**

| **Category** | **Count** | **Details** |
|--------------|-----------|-------------|
| **Total Tables** | 27 | Complete schema |
| **Authentication Context** | 3 | auth_* tables |
| **Security Context** | 2 | system_encryption_* tables |
| **Geographic Context** | 2 | geo_* tables |
| **Reference Data** | 11 | psgc_* (4) + psoc_* (7) |
| **Core Data** | 2 | households, residents |
| **Supplementary** | 4 | relationships, sectoral, migrant |
| **System** | 3 | system_* tables |
| **Functions** | 19 | Triggers, utilities + PII encryption |
| **Indexes** | 94 | Performance optimization + encryption |
| **RLS Policies** | 25 | Data security + encryption policies |
| **Views** | 11 | Data access helpers + encrypted views |

---

## 🔄 **ENUM TYPES**

| **Enum Type** | **Values** | **Usage** |
|---------------|------------|-----------|
| `sex_enum` | male, female | Biological sex |
| `civil_status_enum` | single, married, divorced, separated, widowed, others | Marital status |
| `citizenship_enum` | filipino, dual_citizen, foreign_national | Citizenship |
| `education_level_enum` | elementary, high_school, college, post_graduate, vocational | Education |
| `employment_status_enum` | employed, unemployed, underemployed, self_employed, student, retired, homemaker, unable_to_work, looking_for_work, not_in_labor_force | Employment |
| `blood_type_enum` | A+, A-, B+, B-, AB+, AB-, O+, O-, unknown | Blood type |
| `religion_enum` | roman_catholic, islam, iglesia_ni_cristo, christian, ... (20+ values) | Religion |
| `ethnicity_enum` | tagalog, cebuano, ilocano, bisaya, ... (16 values) | Ethnicity |
| `household_type_enum` | nuclear, single_parent, extended, childless, one_person, non_family, other | Household type |
| `tenure_status_enum` | owned, owned_with_mortgage, rented, occupied_for_free, occupied_without_consent, others | Housing tenure |
| `household_unit_enum` | single_house, duplex, apartment, townhouse, condominium, boarding_house, institutional, makeshift, others | Housing unit |
| `family_position_enum` | father, mother, son, daughter, grandmother, grandfather, ... (15 values) | Family role |
| `income_class_enum` | rich, high_income, upper_middle_income, middle_income, lower_middle_income, low_income, poor, not_determined | Economic class |
| `birth_place_level_enum` | region, province, city_municipality, barangay | PSGC level |

---

---

## ⚠️ **IMPORTANT: Version 2.2 Changes**

### **🔒 NEW: PII Encryption Security (CRITICAL)**
✅ **Encrypted Fields**: Names, contact info, mother's maiden names  
✅ **Searchable Hashes**: Performance-optimized encrypted search  
✅ **Access Views**: `residents_decrypted` (authorized) & `residents_masked` (public)  
✅ **Audit Logging**: All encrypt/decrypt operations logged  
✅ **Key Management**: Secure key rotation and version control  

### **🏠 Updated Address Business Rules:**
✅ **House Number**: REQUIRED for all households  
✅ **Street**: REQUIRED for all households  
✅ **Subdivision**: OPTIONAL (households can be directly on streets)  
✅ **Geographic Hierarchy**: Barangay → City → Province → Region (ALL REQUIRED)

### **🛡️ Security Implementation:**
- **27 Total Tables** (added 2 encryption management tables)
- **AES-256-GCM Encryption** for all PII fields  
- **Hash-based Search** maintains performance while protecting data
- **Row Level Security** policies for encryption key access
- **Automatic Encryption** via database triggers
- **Data Masking Views** for different access levels

### **📊 Application Usage:**
```sql
-- For authorized full access (decrypts PII)
SELECT * FROM residents_decrypted WHERE barangay_code = '137404001';

-- For public/limited access (masks PII)  
SELECT * FROM residents_masked WHERE barangay_code = '137404001';

-- Original table (contains both plain text and encrypted fields during transition)
SELECT * FROM residents WHERE barangay_code = '137404001';
```

**See**: `security-implementation-pii-encryption.sql` and `security-migration-script.sql` for complete implementation

---

*This documentation provides a comprehensive overview of the RBI System database schema with organized tables by context, complete field specifications, PII encryption security, and updated address business rules.*