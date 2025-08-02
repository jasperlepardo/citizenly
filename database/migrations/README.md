# RBI System Data Migration

This directory contains scripts to import PSGC and PSOC reference data from CSV files into Supabase.

## Setup

1. **Install dependencies**:
   ```bash
   cd database/migrations
   npm install
   ```

2. **Configure environment variables**:
   Create `.env` file with your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_KEY=your_service_role_key
   ```

3. **Deploy schema first**:
   ```bash
   # Apply the schema to your Supabase database
   psql -h your-db-host -U postgres -d postgres -f ../schema.sql
   ```

## Import Data

Run the migration script:

```bash
npm run import
```

This will import data in the correct order:

### PSGC Data (Geographic Codes)
- ✅ Regions (17 records)
- ✅ Provinces (~80 records) 
- ✅ Cities/Municipalities (~1,600 records)
- ✅ Barangays (~42,000 records)

### PSOC Data (Occupation Codes)
- ✅ Major Groups (10 records)
- ✅ Sub-Major Groups (~40 records)
- ✅ Minor Groups (~130 records) 
- ✅ Unit Groups (~430 records)
- ✅ Unit Sub-Groups (~2,500 records)
- ✅ Cross-References (~900 records)

## Verification

The script automatically runs test queries to verify:

1. **Search functionality**: Tests "Congressman" search
2. **Cross-references**: Tests Finance Manager (1211) related occupations
3. **Address hierarchy**: Tests PSGC join performance

## Files

- `import-csv-data.js` - Main migration script
- `001_import_reference_data.sql` - SQL version (alternative)
- `package.json` - Dependencies
- `README.md` - This file

## Troubleshooting

**File not found errors**: 
- Ensure CSV files are in `../../sample data/` relative path
- Check file permissions

**Foreign key constraint errors**:
- Import runs in dependency order automatically
- Clear existing data: `TRUNCATE TABLE tablename CASCADE;`

**Memory issues with large files**:
- Script uses batch processing (1000 records per batch)
- Adjust `batchSize` parameter if needed

## Expected Results

After successful import, you should have:
- ~44,000 geographic reference records (PSGC)
- ~3,100 occupation reference records (PSOC)
- Working search functionality for both hierarchies