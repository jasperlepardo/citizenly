# Detailed Field-by-Field Comparison

## 📋 Table Field Listings

### 1. USER_PROFILES

#### Current Schema Fields (6 fields):
```
1. id                    UUID PRIMARY KEY
2. email                 TEXT UNIQUE NOT NULL
3. full_name            TEXT NOT NULL
4. role_id              UUID
5. barangay_code        TEXT
6. created_at           TIMESTAMPTZ
7. updated_at           TIMESTAMPTZ
```

#### Enhanced Schema Fields (14 fields):
```
1. id                    UUID PRIMARY KEY        [KEPT]
2. email                 TEXT UNIQUE NOT NULL    [KEPT]
3. full_name            TEXT NOT NULL           [KEPT]
4. role_id              UUID                    [KEPT]
5. barangay_code        TEXT                    [KEPT]
6. is_active            BOOLEAN                 [NEW ✅]
7. phone_number         TEXT                    [NEW ✅]
8. position             TEXT                    [NEW ✅]
9. department           TEXT                    [NEW ✅]
10. avatar_url          TEXT                    [NEW ✅]
11. metadata            JSONB                   [NEW ✅]
12. created_at          TIMESTAMPTZ             [KEPT]
13. updated_at          TIMESTAMPTZ             [KEPT]
14. created_by          UUID                    [NEW ✅]
15. updated_by          UUID                    [NEW ✅]
```
**Added: 8 new fields**

---

### 2. HOUSEHOLDS

#### Current Schema Fields (11 fields):
```
1. id                    UUID PRIMARY KEY
2. household_number      TEXT NOT NULL
3. barangay_code        TEXT NOT NULL
4. purok                TEXT
5. street_name          TEXT
6. house_number         TEXT
7. latitude             DECIMAL(10, 8)
8. longitude            DECIMAL(11, 8)
9. created_at           TIMESTAMPTZ
10. updated_at          TIMESTAMPTZ
11. created_by          UUID
```

#### Enhanced Schema Fields (30 fields):
```
1. id                    UUID PRIMARY KEY        [KEPT]
2. household_number      TEXT NOT NULL          [KEPT]
3. barangay_code        TEXT NOT NULL          [KEPT]
4. purok                TEXT                    [KEPT]
5. subdivision_id       UUID                    [NEW ✅ - replaces street_name]
6. street_id            UUID                    [NEW ✅ - replaces street_name]
7. house_number         TEXT                    [KEPT]
8. building_name        TEXT                    [NEW ✅]
9. unit_number          TEXT                    [NEW ✅]
10. floor_number        TEXT                    [NEW ✅]
11. block_number        TEXT                    [NEW ✅]
12. lot_number          TEXT                    [NEW ✅]
13. latitude            DECIMAL(10, 8)          [KEPT]
14. longitude           DECIMAL(11, 8)          [KEPT]
15. ownership_status    ownership_status_enum   [NEW ✅]
16. structure_type      structure_type_enum     [NEW ✅]
17. year_constructed    INTEGER                 [NEW ✅]
18. number_of_rooms     INTEGER                 [NEW ✅]
19. has_electricity     BOOLEAN                 [NEW ✅]
20. has_water_supply    BOOLEAN                 [NEW ✅]
21. has_toilet          BOOLEAN                 [NEW ✅]
22. monthly_income_bracket TEXT                 [NEW ✅]
23. receives_4ps        BOOLEAN                 [NEW ✅]
24. metadata            JSONB                   [NEW ✅]
25. notes               TEXT                    [NEW ✅]
26. created_at          TIMESTAMPTZ             [KEPT]
27. updated_at          TIMESTAMPTZ             [KEPT]
28. created_by          UUID                    [KEPT]
29. updated_by          UUID                    [NEW ✅]
```
**Added: 19 new fields** (removed street_name, added subdivision_id and street_id)

---

### 3. RESIDENTS

#### Current Schema Fields (14 fields):
```
1. id                    UUID PRIMARY KEY
2. household_id          UUID NOT NULL
3. barangay_code        TEXT NOT NULL
4. first_name           TEXT NOT NULL
5. middle_name          TEXT
6. last_name            TEXT NOT NULL
7. suffix               TEXT
8. sex                  TEXT
9. birth_date           DATE NOT NULL
10. birth_place         TEXT
11. civil_status        TEXT
12. mobile_number       TEXT
13. occupation          TEXT
14. is_registered_voter BOOLEAN
15. created_at          TIMESTAMPTZ
16. updated_at          TIMESTAMPTZ
```

#### Enhanced Schema Fields (44 fields):
```
== PERSONAL INFORMATION ==
1. id                    UUID PRIMARY KEY        [KEPT]
2. household_id          UUID NOT NULL          [KEPT]
3. barangay_code        TEXT NOT NULL          [KEPT]
4. first_name           TEXT NOT NULL          [KEPT]
5. middle_name          TEXT                   [KEPT]
6. last_name            TEXT NOT NULL          [KEPT]
7. suffix               TEXT                   [KEPT]
8. nickname             TEXT                   [NEW ✅]

== DEMOGRAPHICS ==
9. sex                  sex_enum               [KEPT - now typed enum]
10. birth_date          DATE NOT NULL          [KEPT]
11. birth_place         TEXT                   [KEPT]
12. civil_status        civil_status_enum      [KEPT - now typed enum]
13. citizenship         citizenship_enum       [NEW ✅]

== CONTACT INFORMATION ==
14. mobile_number       TEXT                   [KEPT]
15. email               TEXT                   [NEW ✅]

== EDUCATION ==
16. education_level     education_level_enum   [NEW ✅]
17. education_status    education_status_enum  [NEW ✅]
18. school_name         TEXT                   [NEW ✅]

== EMPLOYMENT ==
19. employment_status   employment_status_enum [NEW ✅]
20. occupation          TEXT                   [KEPT]
21. occupation_code     TEXT (FK to PSOC)      [NEW ✅]
22. employer_name       TEXT                   [NEW ✅]
23. employer_address    TEXT                   [NEW ✅]
24. monthly_income      DECIMAL(12, 2)         [NEW ✅]

== HEALTH INFORMATION ==
25. blood_type          blood_type_enum        [NEW ✅]
26. has_disability      BOOLEAN                [NEW ✅]
27. disability_type     disability_enum[]      [NEW ✅]
28. is_pregnant         BOOLEAN                [NEW ✅]

== IDENTITY & REGISTRATION ==
29. religion            religion_enum          [NEW ✅]
30. is_registered_voter BOOLEAN                [KEPT]
31. voter_id_number     TEXT                   [NEW ✅]
32. precinct_number     TEXT                   [NEW ✅]

== GOVERNMENT IDS ==
33. national_id_number  TEXT                   [NEW ✅]
34. philhealth_number   TEXT                   [NEW ✅]
35. sss_number          TEXT                   [NEW ✅]
36. gsis_number         TEXT                   [NEW ✅]
37. tin_number          TEXT                   [NEW ✅]

== ADDITIONAL INFORMATION ==
38. is_ofw              BOOLEAN                [NEW ✅]
39. country_of_work     TEXT                   [NEW ✅]
40. metadata            JSONB                  [NEW ✅]
41. photo_url           TEXT                   [NEW ✅]

== AUDIT FIELDS ==
42. created_at          TIMESTAMPTZ            [KEPT]
43. updated_at          TIMESTAMPTZ            [KEPT]
44. created_by          UUID                   [NEW ✅]
45. updated_by          UUID                   [NEW ✅]
```
**Added: 30 new fields**

---

### 4. RESIDENT_RELATIONSHIPS

#### Current Schema Fields (5 fields):
```
1. id                    UUID PRIMARY KEY
2. resident_id          UUID NOT NULL
3. related_resident_id  UUID NOT NULL
4. relationship_type    TEXT NOT NULL
5. created_at           TIMESTAMPTZ
```

#### Enhanced Schema Fields (5 fields):
```
1. id                    UUID PRIMARY KEY        [KEPT]
2. resident_id          UUID NOT NULL          [KEPT]
3. related_resident_id  UUID NOT NULL          [KEPT]
4. relationship_type    TEXT NOT NULL          [KEPT]
5. created_at           TIMESTAMPTZ            [KEPT]
```
**No changes - same structure**

---

## 🆕 COMPLETELY NEW TABLES (Not in current schema)

### 5. BARANGAY_ACCOUNTS (8 fields)
```
1. id                    UUID PRIMARY KEY
2. barangay_code        TEXT NOT NULL (FK)
3. user_id              UUID NOT NULL (FK)
4. role_id              UUID NOT NULL (FK)
5. is_active            BOOLEAN
6. assigned_at          TIMESTAMPTZ
7. assigned_by          UUID (FK)
```

### 6. HOUSEHOLD_MEMBERS (9 fields)
```
1. id                    UUID PRIMARY KEY
2. household_id          UUID NOT NULL (FK)
3. resident_id          UUID NOT NULL (FK)
4. relationship_to_head household_relationship_enum
5. is_head              BOOLEAN
6. moved_in_date        DATE
7. moved_out_date       DATE
8. is_active            BOOLEAN
9. created_at           TIMESTAMPTZ
10. updated_at          TIMESTAMPTZ
```

### 7. SUBDIVISIONS (8 fields)
```
1. id                    UUID PRIMARY KEY
2. barangay_code        TEXT NOT NULL (FK)
3. name                 TEXT NOT NULL
4. type                 TEXT
5. total_units          INTEGER
6. year_established     INTEGER
7. developer_name       TEXT
8. created_at           TIMESTAMPTZ
9. updated_at           TIMESTAMPTZ
```

### 8. STREET_NAMES (5 fields)
```
1. id                    UUID PRIMARY KEY
2. barangay_code        TEXT NOT NULL (FK)
3. street_name          TEXT NOT NULL
4. alternative_name     TEXT
5. created_at           TIMESTAMPTZ
6. updated_at           TIMESTAMPTZ
```

### 9. SECTORAL_INFORMATION (8 fields)
```
1. id                    UUID PRIMARY KEY
2. resident_id          UUID NOT NULL (FK)
3. sector               sectoral_group_enum
4. registration_number  TEXT
5. registration_date    DATE
6. expiry_date          DATE
7. is_active            BOOLEAN
8. created_at           TIMESTAMPTZ
9. updated_at           TIMESTAMPTZ
```

### 10. MIGRANT_INFORMATION (9 fields)
```
1. id                    UUID PRIMARY KEY
2. resident_id          UUID NOT NULL (FK)
3. origin_province      TEXT
4. origin_city          TEXT
5. origin_barangay      TEXT
6. date_arrived         DATE
7. reason_for_migration TEXT
8. intended_length_of_stay TEXT
9. created_at           TIMESTAMPTZ
10. updated_at          TIMESTAMPTZ
```

### 11. AUDIT_LOGS (10 fields)
```
1. id                    UUID PRIMARY KEY
2. table_name           TEXT NOT NULL
3. record_id            UUID NOT NULL
4. action               TEXT NOT NULL
5. old_values           JSONB
6. new_values           JSONB
7. user_id              UUID (FK)
8. ip_address           INET
9. user_agent           TEXT
10. created_at          TIMESTAMPTZ
```

### 12. BARANGAY_DASHBOARD_SUMMARIES (27 fields)
```
1. id                    UUID PRIMARY KEY
2. barangay_code        TEXT NOT NULL (FK)
3. summary_date         DATE NOT NULL
4. total_population     INTEGER
5. total_households     INTEGER
6. total_families       INTEGER
7. male_count           INTEGER
8. female_count         INTEGER
9. age_0_5              INTEGER
10. age_6_12            INTEGER
11. age_13_17           INTEGER
12. age_18_35           INTEGER
13. age_36_59           INTEGER
14. age_60_plus         INTEGER
15. senior_citizens     INTEGER
16. pwd_count           INTEGER
17. solo_parents        INTEGER
18. ofw_count           INTEGER
19. students_count      INTEGER
20. out_of_school_youth INTEGER
21. employed_count      INTEGER
22. unemployed_count    INTEGER
23. registered_voters   INTEGER
24. owned_housing       INTEGER
25. renting_count       INTEGER
26. created_at          TIMESTAMPTZ
27. updated_at          TIMESTAMPTZ
```

### 13. SCHEMA_VERSION (3 fields)
```
1. version              INTEGER PRIMARY KEY
2. applied_at           TIMESTAMPTZ
3. description          TEXT
```

---

## 📊 SUMMARY STATISTICS

| Table | Current Fields | Enhanced Fields | New Fields Added |
|-------|---------------|-----------------|-----------------|
| user_profiles | 7 | 15 | +8 |
| households | 11 | 29 | +18 |
| residents | 16 | 45 | +29 |
| resident_relationships | 5 | 5 | 0 |
| **NEW: barangay_accounts** | 0 | 7 | +7 |
| **NEW: household_members** | 0 | 10 | +10 |
| **NEW: subdivisions** | 0 | 9 | +9 |
| **NEW: street_names** | 0 | 6 | +6 |
| **NEW: sectoral_information** | 0 | 9 | +9 |
| **NEW: migrant_information** | 0 | 10 | +10 |
| **NEW: audit_logs** | 0 | 10 | +10 |
| **NEW: barangay_dashboard_summaries** | 0 | 27 | +27 |
| **NEW: schema_version** | 0 | 3 | +3 |
| **TOTAL** | **39 fields** | **185 fields** | **+146 fields** |

## 🎯 KEY IMPROVEMENTS BY CATEGORY

### Government Compliance
- National ID, PhilHealth, SSS, GSIS, TIN numbers
- Voter ID and precinct tracking
- 4Ps beneficiary monitoring
- PWD and senior citizen registration

### Health & Safety
- Blood type registry
- Disability tracking
- Pregnancy monitoring
- Housing conditions (water, electricity, toilet)

### Economic Data
- Employment status with PSOC codes
- Income brackets
- Housing ownership
- OFW tracking

### Administrative
- Audit logs for all changes
- User activity tracking
- Multi-barangay user support
- Performance-optimized dashboards