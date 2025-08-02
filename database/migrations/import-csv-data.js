#!/usr/bin/env node

/**
 * CSV Data Import Script for Supabase
 * Imports PSGC and PSOC reference data from CSV files
 */

const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { createClient } = require('@supabase/supabase-js');

// Supabase configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY; // Service role key for admin operations

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// CSV file paths
const DATA_DIR = path.join(__dirname, '../sample data');
const csvFiles = {
  // PSGC data (Geographic codes)
  psgc_regions: path.join(DATA_DIR, 'psgc/psgc_regions.csv'),
  psgc_provinces: path.join(DATA_DIR, 'psgc/psgc_provinces.csv'), 
  psgc_cities_municipalities: path.join(DATA_DIR, 'psgc/psgc_cities_municipalities.csv'),
  psgc_barangays: path.join(DATA_DIR, 'psgc/psgc_barangays.csv'),
  
  // PSOC data (Occupation codes) - Import in hierarchical order
  psoc_major_groups: path.join(DATA_DIR, 'psoc/psoc_major_groups.csv'),
  psoc_sub_major_groups: path.join(DATA_DIR, 'psoc/psoc_sub_major_groups.csv'),
  psoc_minor_groups: path.join(DATA_DIR, 'psoc/psoc_minor_groups.csv'),
  psoc_unit_groups: path.join(DATA_DIR, 'psoc/psoc_unit_groups.csv'),
  psoc_unit_sub_groups: path.join(DATA_DIR, 'psoc/psoc_unit_sub_groups.csv'),
  psoc_occupation_cross_references: path.join(DATA_DIR, 'psoc/psoc_unit_group_related.csv')
};

/**
 * Read CSV file and return array of objects
 */
function readCSV(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];
    
    if (!fs.existsSync(filePath)) {
      reject(new Error(`File not found: ${filePath}`));
      return;
    }
    
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', reject);
  });
}

/**
 * Import data to Supabase table with batch processing
 */
async function importToTable(tableName, data, batchSize = 1000) {
  console.log(`📥 Importing ${data.length} records to ${tableName}...`);
  
  let imported = 0;
  let errors = 0;
  
  // Process in batches to avoid timeout
  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize);
    
    try {
      const { error } = await supabase
        .from(tableName)
        .insert(batch);
        
      if (error) {
        console.error(`❌ Error importing batch to ${tableName}:`, error);
        errors += batch.length;
      } else {
        imported += batch.length;
        console.log(`✅ Imported batch ${Math.ceil((i + batchSize) / batchSize)} to ${tableName} (${imported}/${data.length})`);
      }
    } catch (err) {
      console.error(`❌ Exception importing to ${tableName}:`, err);
      errors += batch.length;
    }
  }
  
  console.log(`📊 ${tableName}: ${imported} imported, ${errors} errors`);
  return { imported, errors };
}

/**
 * Transform cross-reference data to match our schema
 */
function transformCrossReferences(data) {
  return data.map(row => ({
    unit_group_code: row.unit_code,
    related_unit_code: row.related_unit_code,
    related_occupation_title: row.related_occupation_title
  }));
}

/**
 * Transform PSGC data to match schema (remove extra columns, ensure correct mapping)
 */
function transformPSGCData(tableName, data) {
  switch (tableName) {
    case 'psgc_regions':
      // Schema only has: code, name (created_at/updated_at auto-populated)
      return data.map(row => ({
        code: row.code,
        name: row.name
      }));
      
    case 'psgc_provinces':
      // Schema only has: code, name, region_code (no is_active column)
      return data.map(row => ({
        code: row.code,
        name: row.name,
        region_code: row.region_code
      }));
      
    case 'psgc_cities_municipalities':
      // Schema has: code, name, type, province_code (no is_independent column)
      return data.map(row => ({
        code: row.code,
        name: row.name,
        type: row.type,
        province_code: row.province_code
      }));
      
    case 'psgc_barangays':
      // Schema has: code, name, city_municipality_code (no urban_rural_status column)
      return data.map(row => ({
        code: row.code,
        name: row.name,
        city_municipality_code: row.city_municipality_code
      }));
      
    default:
      return data;
  }
}

/**
 * Main migration function
 */
async function main() {
  console.log('🚀 Starting CSV data import to Supabase...\n');
  
  const startTime = Date.now();
  const results = {};
  
  // Import order matters due to foreign key constraints
  const importOrder = [
    // PSGC data (no dependencies)
    'psgc_regions',
    'psgc_provinces', 
    'psgc_cities_municipalities',
    'psgc_barangays',
    
    // PSOC hierarchy (hierarchical dependencies)
    'psoc_major_groups',
    'psoc_sub_major_groups', 
    'psoc_minor_groups',
    'psoc_unit_groups',
    'psoc_unit_sub_groups',
    
    // Cross-references (depends on unit groups)
    'psoc_occupation_cross_references'
  ];
  
  for (const tableName of importOrder) {
    try {
      console.log(`\n📋 Processing ${tableName}...`);
      
      // Read CSV data
      let data = await readCSV(csvFiles[tableName]);
      
      // Transform data to match schema
      if (tableName === 'psoc_occupation_cross_references') {
        data = transformCrossReferences(data);
      } else if (tableName.startsWith('psgc_')) {
        data = transformPSGCData(tableName, data);
      }
      
      // Import to Supabase
      results[tableName] = await importToTable(tableName, data);
      
    } catch (error) {
      console.error(`❌ Failed to process ${tableName}:`, error);
      results[tableName] = { imported: 0, errors: -1 };
    }
  }
  
  // Summary
  const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log('\n' + '='.repeat(50));
  console.log('📊 IMPORT SUMMARY');
  console.log('='.repeat(50));
  
  let totalImported = 0;
  let totalErrors = 0;
  
  for (const [table, result] of Object.entries(results)) {
    console.log(`${table.padEnd(30)}: ${result.imported.toString().padStart(6)} imported, ${result.errors.toString().padStart(3)} errors`);
    totalImported += result.imported;
    totalErrors += result.errors;
  }
  
  console.log('-'.repeat(50));
  console.log(`${'TOTAL'.padEnd(30)}: ${totalImported.toString().padStart(6)} imported, ${totalErrors.toString().padStart(3)} errors`);
  console.log(`⏱️  Total time: ${totalTime}s`);
  console.log('\n✨ Migration completed!');
  
  // Test queries
  console.log('\n🧪 Running test queries...');
  await runTestQueries();
}

/**
 * Test the imported data
 */
async function runTestQueries() {
  try {
    // Test PSOC search for "Congressman"
    const { data: congressmanSearch, error: e1 } = await supabase
      .from('psoc_occupation_search')
      .select('*')
      .ilike('occupation_title', '%congressman%')
      .order('hierarchy_level');
    
    if (e1) console.error('❌ Congressman search error:', e1);
    else console.log(`✅ Found ${congressmanSearch.length} results for "Congressman"`);
    
    // Test cross-reference for Finance Managers (1211)
    const { data: crossRefTest, error: e2 } = await supabase
      .from('psoc_occupation_cross_references')
      .select('*')
      .eq('unit_group_code', '1211');
    
    if (e2) console.error('❌ Cross-reference test error:', e2);
    else console.log(`✅ Found ${crossRefTest.length} cross-references for Finance Managers (1211)`);
    
    // Test complete PSGC hierarchy
    const { data: psgcTest, error: e3 } = await supabase
      .from('address_hierarchy')
      .select('*')
      .limit(5);
    
    if (e3) console.error('❌ Address hierarchy test error:', e3);
    else console.log(`✅ Address hierarchy view working with ${psgcTest.length} sample records`);
    
  } catch (error) {
    console.error('❌ Test queries failed:', error);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main, readCSV, importToTable };