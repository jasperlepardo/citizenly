# PSGC Data Migration Guide

This directory contains migration scripts to populate the database with Philippine Standard Geographic Code (PSGC) reference data.

## 📁 Files Overview

| File | Purpose | Use Case |
|------|---------|----------|
| `populate-psgc-data.sql` | Basic SQL migration with sample data | Development/testing |
| `load-psgc-csv-data.sql` | Full CSV data loader using `\copy` | Direct PostgreSQL access |
| `import-psgc-data.js` | Node.js CSV importer | Cloud/containerized environments |
| `PSGC_MIGRATION_README.md` | This documentation | Reference |

## 📋 Prerequisites

1. **Database Schema**: Run `database/schema.sql` first
2. **CSV Files**: Ensure files exist in `database/sample data/psgc/updated/`
3. **Permissions**: Database write access and file system read access

## 🚀 Migration Options

### Option 1: SQL with COPY (Recommended for Local)

```bash
# Navigate to database directory
cd database/

# Run the CSV loader
psql -d your_database -f migrations/load-psgc-csv-data.sql
```

**Pros**: Fast, uses PostgreSQL's native COPY
**Cons**: Requires direct file system access

### Option 2: Node.js Importer (Recommended for Cloud)

```bash
# Install dependencies
npm install pg csv-parser

# Set environment variables
export DATABASE_URL="postgresql://user:pass@host:port/dbname"

# Run the importer  
node migrations/import-psgc-data.js
```

**Pros**: Works in any environment, better error handling
**Cons**: Slower than native COPY

### Option 3: Basic SQL Migration (Testing Only)

```bash
psql -d your_database -f migrations/populate-psgc-data.sql
```

**Pros**: No external dependencies
**Cons**: Contains only sample data, not complete dataset

## 📊 Data Files Structure

The migration expects these CSV files with the following columns:

### `psgc_regions.updated.csv`
```
code,name
01,Region I (Ilocos Region)
02,Region II (Cagayan Valley)
```

### `psgc_provinces.updated.csv`
```
code,name,region_code,is_active
0128,Ilocos Norte,01,True
0129,Ilocos Sur,01,True
```

### `psgc_cities_municipalities.updated.fixed.csv`
```
code,name,province_code,type,is_independent
012801,Adams,0128,municipality,False
137401,City of Manila,,highly urbanized city,True
```

### `psgc_barangays.updated.csv`
```
code,name,city_municipality_code,urban_rural_status
012801001,Adams,012801,Rural
012802001,Bani,012802,Rural
```

## ✅ Validation

All scripts include validation checks:

- **Record Counts**: Verify expected number of records imported
- **Foreign Key Integrity**: Ensure all relationships are valid
- **Orphaned Records**: Check for records without valid parents
- **Geographic Distribution**: Summary by region

## 🔧 Troubleshooting

### File Not Found Errors
```bash
# Verify file paths
ls -la "database/sample data/psgc/updated/"
```

### Permission Errors
```bash
# For PostgreSQL COPY
GRANT USAGE ON SCHEMA public TO your_user;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO your_user;
```

### Connection Errors
```bash
# Test database connection
psql $DATABASE_URL -c "SELECT version();"
```

## 📈 Performance Notes

- **Regions**: ~17 records (instant)
- **Provinces**: ~81 records (< 1 second)
- **Cities/Municipalities**: ~1,700 records (< 5 seconds)
- **Barangays**: ~42,000 records (30-60 seconds depending on method)

## 🔄 Re-running Migrations

All scripts safely handle re-runs by:
1. Using `TRUNCATE CASCADE` to clear existing data
2. Disabling triggers during import
3. Re-enabling constraints after completion
4. Validating data integrity

## 📋 Next Steps

After successful PSGC import:

1. **PSOC Data**: Import occupational classification data
2. **Validation**: Run full system validation tests
3. **Application Data**: Begin importing actual resident/household data
4. **Indexing**: Create additional indexes for performance

## 🆘 Support

If you encounter issues:

1. Check the validation output for specific errors
2. Verify CSV file formats match expected structure
3. Ensure database schema is up to date
4. Check PostgreSQL logs for detailed error messages

---

**Last Updated**: January 2025  
**Schema Version**: 2.8.0  
**PSGC Version**: 2Q 2025 Publication