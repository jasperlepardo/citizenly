#!/usr/bin/env node

/**
 * PSGC Data Import Script for Supabase - Updated Schema v3.0.0
 * ============================================================
 * 
 * Imports PSGC (Philippine Standard Geographic Code) data from CSV files
 * into Supabase database using the new schema.sql structure.
 * 
 * Prerequisites:
 * - Node.js with required packages: npm install csv-parser dotenv @supabase/supabase-js
 * - Supabase project with schema.sql applied
 * - CSV files in: database/sample data/psgc/updated/
 * - Environment variables set in .env.local
 * 
 * Usage:
 * cd database/migrations
 * node import-psgc-data-for-supabase.js
 * 
 * Environment Variables Required:
 * - NEXT_PUBLIC_SUPABASE_URL
 * - SUPABASE_SERVICE_KEY
 */

const { createClient } = require('@supabase/supabase-js');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '../../.env.local' });

// Validate environment variables
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing required environment variables:');
  console.error('   - NEXT_PUBLIC_SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_KEY');
  console.error('   Please set these in your .env.local file');
  process.exit(1);
}

// Initialize Supabase client with service role
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Data file paths
const DATA_PATH = '../sample data/psgc/updated';
const files = {
  regions: 'psgc_regions.updated.csv',
  provinces: 'psgc_provinces.updated.csv', 
  cities: 'psgc_cities_municipalities.updated.fixed.csv',
  barangays: 'psgc_barangays.updated.csv'
};

/**
 * Load CSV file into memory
 */
async function loadCSV(fileName) {
  const filePath = path.join(__dirname, DATA_PATH, fileName);
  
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => {
        // Clean up data - remove empty strings and trim whitespace
        const cleanData = {};
        for (const [key, value] of Object.entries(data)) {
          const cleanValue = typeof value === 'string' ? value.trim() : value;
          cleanData[key] = cleanValue === '' ? null : cleanValue;
        }
        results.push(cleanData);
      })
      .on('end', () => {
        console.log(`📄 Loaded ${results.length} records from ${fileName}`);
        resolve(results);
      })
      .on('error', reject);
  });
}

/**
 * Import data with batch processing and error handling
 */
async function importTable(tableName, data, batchSize = 1000) {
  console.log(`📊 Importing ${data.length} records into ${tableName}...`);
  
  let imported = 0;
  let errors = 0;
  
  // Process in batches to avoid timeout and memory issues
  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize);
    
    try {
      const { error } = await supabase
        .from(tableName)
        .upsert(batch, {
          onConflict: 'code',
          ignoreDuplicates: false
        });
      
      if (error) {
        console.error(`❌ Error importing batch ${Math.floor(i/batchSize) + 1}:`, error);
        errors += batch.length;
      } else {
        imported += batch.length;
        console.log(`✅ Imported batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(data.length/batchSize)} (${imported}/${data.length})`);
      }
    } catch (err) {
      console.error(`❌ Batch import failed:`, err.message);
      errors += batch.length;
    }
  }
  
  console.log(`📈 ${tableName}: ${imported} imported, ${errors} errors`);
  return { imported, errors };
}

/**
 * Transform regions data for new schema
 */
function transformRegions(data) {
  return data.map(row => ({
    code: row.code || row.region_code,
    name: row.name || row.region_name,
    is_active: true
  })).filter(row => row.code && row.name);
}

/**
 * Transform provinces data for new schema
 */
function transformProvinces(data) {
  return data.map(row => ({
    code: row.code || row.province_code,
    name: row.name || row.province_name,
    region_code: row.region_code,
    is_active: true
  })).filter(row => row.code && row.name && row.region_code);
}

/**
 * Transform cities/municipalities data for new schema
 */
function transformCities(data, validProvinceCodes = new Set()) {
  return data.map(row => {
    const cityCode = row.code || row.city_municipality_code;
    const isIndependent = row.is_independent === 'true' || row.is_independent === true;
    let provinceCode = row.province_code;
    
    // Extrapolate province code from city code if missing
    // PSGC structure: RRPPMMBB (RR=Region, PP=Province, MM=City/Municipality, BB=Additional)
    if ((!provinceCode || provinceCode === '') && cityCode && cityCode.length >= 4) {
      const derivedProvinceCode = cityCode.substring(0, 4);
      console.log(`🔍 Deriving province code ${derivedProvinceCode} for city ${cityCode} (${row.name || row.city_municipality_name})`);
      provinceCode = derivedProvinceCode;
    }
    
    // Handle different scenarios:
    // 1. Independent cities (is_independent = true) - always null province_code
    // 2. Cities with null/empty province_code after derivation - keep null if truly independent
    // 3. Cities with valid province_code - keep if province exists
    // 4. Cities with derived province_code - include if province exists
    
    if (isIndependent) {
      // Independent cities should have null province
      return {
        code: cityCode,
        name: row.name || row.city_municipality_name,
        province_code: null,
        type: row.type || 'City',
        is_independent: true,
        is_active: true
      };
    } else if (!provinceCode || provinceCode === '') {
      // Cities without province and not marked as independent - skip
      console.log(`⚠️  Skipping ${cityCode} - no province code and not independent`);
      return null;
    } else {
      // Cities with province (original or derived) - include if province exists
      if (validProvinceCodes.size === 0 || validProvinceCodes.has(provinceCode)) {
        return {
          code: cityCode,
          name: row.name || row.city_municipality_name,
          province_code: provinceCode,
          type: row.type || (row.is_city === 'true' || row.is_city === true ? 'City' : 'Municipality'),
          is_independent: false,
          is_active: true
        };
      } else {
        console.log(`❌ Skipping ${cityCode} (${row.name || row.city_municipality_name}) - province ${provinceCode} not found`);
        return null;
      }
    }
  }).filter(row => row !== null && row.code && row.name);
}

/**
 * Transform barangays data for new schema
 */
function transformBarangays(data, validCityCodes = new Set()) {
  return data.map(row => {
    const cityCode = row.city_municipality_code;
    
    // Only include if city exists or if validCityCodes is empty (first run)
    if (validCityCodes.size === 0 || validCityCodes.has(cityCode)) {
      return {
        code: row.code || row.barangay_code,
        name: row.name || row.barangay_name,
        city_municipality_code: cityCode,
        is_active: true
      };
    }
    return null;
  }).filter(row => row !== null && row.code && row.name && row.city_municipality_code);
}

/**
 * Verify data integrity after import
 */
async function verifyImport() {
  console.log('\n🔍 Verifying import...');
  
  const tables = ['psgc_regions', 'psgc_provinces', 'psgc_cities_municipalities', 'psgc_barangays'];
  
  for (const table of tables) {
    const { count, error } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.error(`❌ Error checking ${table}:`, error);
    } else {
      console.log(`📊 ${table}: ${count} records`);
    }
  }
  
  // Check referential integrity
  console.log('\n🔗 Checking referential integrity...');
  
  // Check provinces -> regions
  const { data: provincesWithoutRegion } = await supabase
    .from('psgc_provinces')
    .select('code, name, region_code')
    .not('region_code', 'in', supabase.from('psgc_regions').select('code'));
  
  if (provincesWithoutRegion?.length > 0) {
    console.warn(`⚠️  Found ${provincesWithoutRegion.length} provinces with invalid region codes`);
  } else {
    console.log('✅ All provinces have valid region references');
  }
  
  // Check cities -> provinces  
  const { data: citiesWithoutProvince } = await supabase
    .from('psgc_cities_municipalities')
    .select('code, name, province_code')
    .not('province_code', 'in', supabase.from('psgc_provinces').select('code'));
  
  if (citiesWithoutProvince?.length > 0) {
    console.warn(`⚠️  Found ${citiesWithoutProvince.length} cities with invalid province codes`);
  } else {
    console.log('✅ All cities have valid province references');
  }
  
  // Sample barangays check (they're too many to check all)
  const { data: sampleBarangays } = await supabase
    .from('psgc_barangays')
    .select('code, name, city_municipality_code')
    .limit(1000);
  
  if (sampleBarangays?.length > 0) {
    const validCityReferences = await Promise.all(
      sampleBarangays.slice(0, 100).map(async (barangay) => {
        const { data } = await supabase
          .from('psgc_cities_municipalities')
          .select('code')
          .eq('code', barangay.city_municipality_code)
          .single();
        return !!data;
      })
    );
    
    const validCount = validCityReferences.filter(Boolean).length;
    console.log(`✅ Sample check: ${validCount}/100 barangays have valid city references`);
  }
}

/**
 * Main import function
 */
async function main() {
  try {
    console.log('🚀 Starting PSGC data import for Supabase (Schema v3.0.0)...');
    console.log(`📂 Data source: ${path.resolve(__dirname, DATA_PATH)}`);
    
    // Load all CSV files
    console.log('\n📥 Loading CSV files...');
    const [regionsData, provincesData, citiesData, barangaysData] = await Promise.all([
      loadCSV(files.regions),
      loadCSV(files.provinces), 
      loadCSV(files.cities),
      loadCSV(files.barangays)
    ]);
    
    // Get existing valid codes for referential integrity
    console.log('\n🔍 Getting existing valid codes...');
    const { data: existingProvinces } = await supabase.from('psgc_provinces').select('code');
    const { data: existingCities } = await supabase.from('psgc_cities_municipalities').select('code');
    
    const validProvinceCodes = new Set(existingProvinces?.map(p => p.code) || []);
    const validCityCodes = new Set(existingCities?.map(c => c.code) || []);
    
    console.log(`📋 Found ${validProvinceCodes.size} existing provinces, ${validCityCodes.size} existing cities`);

    // Transform data according to new schema
    console.log('\n🔄 Transforming data...');
    const transformedData = {
      regions: transformRegions(regionsData),
      provinces: transformProvinces(provincesData),
      cities: transformCities(citiesData, validProvinceCodes),
      barangays: transformBarangays(barangaysData, validCityCodes)
    };
    
    console.log('📊 Transformed data summary:');
    console.log(`   - Regions: ${transformedData.regions.length}`);
    console.log(`   - Provinces: ${transformedData.provinces.length}`);
    console.log(`   - Cities/Municipalities: ${transformedData.cities.length}`);
    console.log(`   - Barangays: ${transformedData.barangays.length}`);
    
    // Import in order (respecting foreign key dependencies)
    console.log('\n📤 Starting import process...');
    
    const results = {
      regions: await importTable('psgc_regions', transformedData.regions),
      provinces: await importTable('psgc_provinces', transformedData.provinces),
      cities: await importTable('psgc_cities_municipalities', transformedData.cities),
      barangays: await importTable('psgc_barangays', transformedData.barangays, 2000) // Larger batch for barangays
    };
    
    // Verify the import
    await verifyImport();
    
    // Summary
    console.log('\n📋 Import Summary:');
    console.log('='.repeat(50));
    let totalImported = 0;
    let totalErrors = 0;
    
    for (const [table, result] of Object.entries(results)) {
      console.log(`${table}: ${result.imported} imported, ${result.errors} errors`);
      totalImported += result.imported;
      totalErrors += result.errors;
    }
    
    console.log('='.repeat(50));
    console.log(`Total: ${totalImported} imported, ${totalErrors} errors`);
    
    if (totalErrors === 0) {
      console.log('🎉 PSGC data import completed successfully!');
    } else {
      console.log(`⚠️  PSGC data import completed with ${totalErrors} errors`);
    }
    
  } catch (error) {
    console.error('💥 Import failed:', error);
    process.exit(1);
  }
}

// Run the import
if (require.main === module) {
  main().then(() => {
    console.log('👋 Import script finished');
    process.exit(0);
  }).catch(error => {
    console.error('💥 Unhandled error:', error);
    process.exit(1);
  });
}

module.exports = { main, loadCSV, transformRegions, transformProvinces, transformCities, transformBarangays };