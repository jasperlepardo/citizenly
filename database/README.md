# Database Schema & Reference Data

Essential database files for the RBI System production deployment.

## 📁 Structure

### `schema.sql` - Production Database Schema
- **Authoritative schema** for PostgreSQL 15+ with Supabase
- Complete RBI system database definition
- DILG compliance with PSGC and PSOC integration
- Row Level Security (RLS) and audit trails

### `reference-data/` - Philippine Government Data

#### `psgc/` - Philippine Standard Geographic Codes
- `psgc_regions.updated.csv` - 17 regions
- `psgc_provinces.updated.csv` - 86 provinces  
- `psgc_cities_municipalities.updated.fixed.csv` - 1,637 cities/municipalities
- `psgc_barangays.updated.csv` - 42,028+ barangays
- `regions_corrected.csv` - Regional corrections

#### `psoc/` - Philippine Standard Occupational Classification
- `psoc_major_groups_clean_from_user.csv` - Major occupational groups
- `psoc_minor_groups_clean_from_user.csv` - Minor groups
- `psoc_sub_major_groups_clean_from_user.csv` - Sub-major groups
- `psoc_unit_groups_clean_from_user.csv` - Unit groups

## 🚀 Quick Deployment

```bash
# 1. Deploy schema to Supabase
psql $SUPABASE_URL -f schema.sql

# 2. Import reference data
cd reference-data && npm run import

# 3. Verify deployment
psql $SUPABASE_URL -c "SELECT COUNT(*) FROM psgc_barangays;"
```

## 📊 Data Coverage

- **91% barangay coverage** (38,372 of 42,028 barangays)
- **100% city/municipality coverage** (1,637 complete)
- **100% provincial coverage** (86 provinces + special administrative regions)
- **Complete PSOC hierarchy** (4-level occupational classification)

## 🔗 Integration

These files provide the foundation for:
- **Geographic dropdowns** (Region → Province → City → Barangay)
- **Address validation** and standardization
- **Occupational classification** with PSOC codes
- **Resident registration** with government compliance
- **Demographic reporting** and analytics

---

**Clean database structure** - Essential files only, ready for production deployment.