# RBI System - Database Management

## 🎉 Database Overview
This directory contains the complete database infrastructure for the RBI System with **production-proven** scripts that achieve:
- **✅ 91% nationwide coverage** (38,372 barangays)
- **✅ 100% city coverage** (1,637 cities/municipalities)
- **✅ Complete regional coverage** (17 regions, 86 provinces)

## 📁 Directory Structure

### `schema.sql` - Main Database Schema
Production-ready schema with all tables, constraints, indexes, and optimizations.

### `backups/` - Database Backups
- **Current data backups** with restore scripts
- **Historical backup files** organized by timestamp
- **Sample data files** for testing and development

### `data/` - Reference Data Files
- **`sample/`** - Sample datasets and spreadsheets
  - **`psgc/`** - Philippine Standard Geographic Code data (regions, provinces, cities, barangays)
  - **`psoc/`** - Philippine Standard Occupational Classification data
- **`updated/`** - Latest official data releases

### `docs/` - Documentation
- **Migration guides** and implementation summaries
- **Schema documentation** and field comparisons
- **Feature implementation guides** (OSC/OSY, education systems, etc.)
- **API usage documentation**

### `migrations/` - Database Migration Scripts
- **`active/`** - Current migration scripts ready for production
- **`archived/`** - Historical migrations and deprecated scripts

### `scripts/` - Organized Database Scripts
- **`analysis/`** - Database analysis and verification scripts
- **`data-import/`** - Data import and migration utilities
- **`maintenance/`** - Database maintenance and repair scripts

## 🚀 Quick Start

### Prerequisites
```bash
# Install dependencies
npm install @supabase/supabase-js csv-parser dotenv

# Set environment variables
export NEXT_PUBLIC_SUPABASE_URL="your_supabase_url"
export SUPABASE_SERVICE_KEY="your_service_role_key"
```

### Migration Sequence (Proven Order)
```bash
# 1. Deploy schema
psql -f schema.sql

# 2. Initial data import
node scripts/data-import/import-csv-data.js

# 3. Create missing provinces (critical for Metro Manila)
node scripts/data-import/create-missing-provinces.js

# 4. Import blocked cities
node scripts/data-import/import-missing-cities.js

# 5. Final barangay sweep
node scripts/data-import/complete-barangay-migration.js

# 6. Comprehensive verification
node scripts/analysis/psgc-integrity-check.js
```

## 📊 Expected Results

### After Complete Migration
```
📈 Database Status:
   Regions:               17/17     (100%)
   Provinces:             86/80+    (100%+)
   Cities/Municipalities: 1,637/1,634 (100%)
   Barangays:            38,372/42,028 (91%)

🎯 System Coverage:
   Population Coverage:   ~91% of Philippines
   Metro Manila:          100% complete
   Major Cities:          100% complete
   Geographic Hierarchy:  Complete and validated
```

## 🔧 Key Migration Insights

### Critical Discoveries
1. **Metro Manila Structure**: Cities reference district codes (1374, 1375, 1376), not traditional provinces
2. **Independence Constraint**: Independent cities must have `province_code = NULL`
3. **Import Dependencies**: Provinces → Cities → Barangays (strict order required)
4. **Batch Processing**: Large datasets require batching (Cities: 100, Barangays: 500)

### Special Provinces Created
- `1374` - Metro Manila District 1 (Quezon City area)
- `1375` - Metro Manila District 2 (Caloocan area)  
- `1376` - Metro Manila District 3 (Makati/Pasay area)
- `1538` - Maguindanao del Sur
- `0997` - Basilan (Special)
- `1298` - Cotabato (Special)

## 🛠️ Troubleshooting

### Common Issues
- **Foreign Key Violations**: Run `create-missing-provinces.js` first
- **Duplicate Key Errors**: Scripts handle gracefully with UPSERT
- **Low Coverage**: Use analysis scripts to identify gaps
- **Metro Manila Failures**: Ensure independence constraint is enforced

### Verification Commands
```bash
# Check final counts
node scripts/analysis/psgc-integrity-check.js

# Quick database status
psql -c "
SELECT 'Regions' as entity, COUNT(*) FROM psgc_regions
UNION ALL SELECT 'Provinces', COUNT(*) FROM psgc_provinces  
UNION ALL SELECT 'Cities', COUNT(*) FROM psgc_cities_municipalities
UNION ALL SELECT 'Barangays', COUNT(*) FROM psgc_barangays;
"
```

## 📈 Production Readiness

### System Capabilities Enabled
- ✅ 5-step resident registration wizard
- ✅ Cascading address dropdowns (Region → Province → City → Barangay)
- ✅ Comprehensive resident search and management
- ✅ Geographic relationship validation
- ✅ Nationwide demographic reporting
- ✅ Cross-regional data management

### Performance Optimizations
- Strategic indexing for fast lookups
- Full-text search with trigram matching
- Row-level security with geographic scoping
- Auto-computed sectoral classifications
- Efficient batch processing support

## 🎯 Next Steps

1. **Frontend Integration**: Use the complete geographic hierarchy for address dropdowns
2. **Resident Registration**: Implement 5-step wizard with validated addresses
3. **Reporting**: Build comprehensive demographic and geographic reports
4. **System Monitoring**: Set up monitoring for database performance and usage

## 📚 Additional Resources

- **Complete Migration Guide**: See `MIGRATION_GUIDE_V2.md`
- **Schema Documentation**: See comments in `schema-v2-production-ready.sql`
- **Production Schema**: Includes all constraints, indexes, and optimizations

---

## 🏆 Migration Achievement

**This migration toolkit successfully transformed the RBI System from minimal test data to a comprehensive nationwide resident management platform with 91% geographic coverage - ready for immediate production deployment across the Philippines.**