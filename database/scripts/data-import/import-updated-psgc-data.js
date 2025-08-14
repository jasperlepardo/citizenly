#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '../../.env.local' });

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const DATA_PATH = '../sample data/psgc/updated';

// Utility functions
function convertBoolean(value) {
  if (typeof value === 'string') {
    return value.toLowerCase() === 'true';
  }
  return Boolean(value);
}

async function loadCSV(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', reject);
  });
}

async function clearTable(tableName) {
  // Skip clearing - we'll use upsert to update/insert records
  console.log(`⚠️  Skipping clear of ${tableName} (will upsert instead)`);
}

async function importTable(tableName, csvFile, transformFn = null) {
  console.log(`\n📊 Importing ${tableName} from ${csvFile}...`);
  
  const filePath = path.join(__dirname, DATA_PATH, csvFile);
  const data = await loadCSV(filePath);
  
  console.log(`📄 Loaded ${data.length} records from CSV`);
  
  // Transform data if function provided and filter out null values
  const transformedData = transformFn ? 
    data.map(transformFn).filter(row => row !== null) : 
    data;
  
  // Import in batches to avoid timeouts
  const batchSize = 500;
  let imported = 0;
  
  for (let i = 0; i < transformedData.length; i += batchSize) {
    const batch = transformedData.slice(i, i + batchSize);
    
    const { data: result, error } = await supabase
      .from(tableName)
      .upsert(batch, { onConflict: 'code' });
    
    if (error) {
      console.error(`❌ Error importing batch ${i}-${i + batch.length}:`, error);
      throw error;
    }
    
    imported += batch.length;
    console.log(`✅ Imported ${imported}/${transformedData.length} records`);
  }
  
  // Verify import
  const { count } = await supabase.from(tableName).select('*', { count: 'exact' });
  console.log(`📊 Final count in ${tableName}: ${count}`);
  
  return count;
}

async function main() {
  console.log('🚀 IMPORTING UPDATED PSGC DATA TO SUPABASE');
  console.log('==========================================\n');
  
  try {
    // Using UPSERT strategy to preserve existing references
    console.log('🔄 USING UPSERT STRATEGY (preserving existing references)');
    console.log('--------------------------------------------------------');
    console.log('This will update existing records and add new ones without breaking foreign key constraints.\n');
    
    // Import in hierarchical order (top-down)
    
    // 1. Import Regions
    console.log('🌏 STEP 1: IMPORTING REGIONS');
    const regionCount = await importTable('psgc_regions', 'psgc_regions.updated.csv');
    
    // 2. Import Provinces
    console.log('\n🏞️ STEP 2: IMPORTING PROVINCES');
    const provinceCount = await importTable(
      'psgc_provinces', 
      'psgc_provinces.updated.csv',
      (row) => ({
        ...row,
        is_active: convertBoolean(row.is_active)
      })
    );
    
    // 3. Import Cities/Municipalities
    console.log('\n🏙️ STEP 3: IMPORTING CITIES/MUNICIPALITIES');
    const cityCount = await importTable(
      'psgc_cities_municipalities',
      'psgc_cities_municipalities.updated.fixed.csv',
      (row) => ({
        ...row,
        is_independent: convertBoolean(row.is_independent),
        // Handle independent cities (set province_code to null if independent)
        province_code: convertBoolean(row.is_independent) ? null : row.province_code
      })
    );
    
    // 4. Import Barangays (with validation)
    console.log('\n🏘️ STEP 4: IMPORTING BARANGAYS');
    console.log('⚠️  Note: Skipping barangays with invalid city references...');
    
    // Get list of valid city codes first
    const { data: validCities } = await supabase
      .from('psgc_cities_municipalities')
      .select('code');
    
    const validCityCodes = new Set(validCities.map(city => city.code));
    
    const barangayCount = await importTable(
      'psgc_barangays', 
      'psgc_barangays.updated.csv',
      (row) => {
        // Only return the row if the city exists
        if (validCityCodes.has(row.city_municipality_code)) {
          return row;
        } else {
          console.log(`⚠️  Skipping barangay ${row.name} (${row.code}) - invalid city: ${row.city_municipality_code}`);
          return null;
        }
      }
    );
    
    // Final verification
    console.log('\n🎉 MIGRATION COMPLETED SUCCESSFULLY!');
    console.log('===================================');
    console.log(`✅ Regions:               ${regionCount}`);
    console.log(`✅ Provinces:             ${provinceCount}`);
    console.log(`✅ Cities/Municipalities: ${cityCount}`);
    console.log(`✅ Barangays:             ${barangayCount}`);
    
    // Run integrity check
    console.log('\n🔍 Running integrity check...');
    const { data: orphanedProvinces } = await supabase
      .from('psgc_provinces')
      .select('code, name, region_code')
      .not('region_code', 'in', `(SELECT code FROM psgc_regions)`);
    
    const { data: orphanedCities } = await supabase
      .from('psgc_cities_municipalities')
      .select('code, name, province_code, is_independent')
      .eq('is_independent', false)
      .not('province_code', 'in', `(SELECT code FROM psgc_provinces)`);
    
    if (orphanedProvinces?.length > 0) {
      console.log(`⚠️  Found ${orphanedProvinces.length} provinces with invalid region codes`);
    } else {
      console.log('✅ All provinces have valid region references');
    }
    
    if (orphanedCities?.length > 0) {
      console.log(`⚠️  Found ${orphanedCities.length} cities with invalid province codes`);
    } else {
      console.log('✅ All non-independent cities have valid province references');
    }
    
    console.log('\n🌟 Updated PSGC data successfully imported to Supabase!');
    
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run the migration
if (require.main === module) {
  main();
}

module.exports = { main };