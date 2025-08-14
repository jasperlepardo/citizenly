#!/usr/bin/env node

/**
 * PSGC Data Import via Supabase API
 * =================================
 * 
 * Imports PSGC data using Supabase client when direct PostgreSQL connection
 * is not available (common with new Supabase projects).
 */

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { createClient } = require('@supabase/supabase-js');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const fs = require('fs');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const path = require('path');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const csv = require('csv-parser');
// eslint-disable-next-line @typescript-eslint/no-require-imports
require('dotenv').config();

// Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// File paths
const DATA_DIR = path.join(__dirname, '../sample data/psgc/updated');
const files = {
  regions: path.join(DATA_DIR, 'psgc_regions.updated.csv'),
  provinces: path.join(DATA_DIR, 'psgc_provinces.updated.csv'),
  cities: path.join(DATA_DIR, 'psgc_cities_municipalities.updated.fixed.csv'),
  barangays: path.join(DATA_DIR, 'psgc_barangays.updated.csv')
};

/**
 * Parse CSV file and return array of records
 */
function parseCSV(filePath) {
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
 * Clear existing PSGC data
 */
async function clearExistingData() {
  console.log('🗑️  Clearing existing PSGC data...');
  
  const tables = ['psgc_barangays', 'psgc_cities_municipalities', 'psgc_provinces', 'psgc_regions'];
  
  for (const table of tables) {
    const { error } = await supabase
      .from(table)
      .delete()
      .neq('code', ''); // Delete all records
    
    if (error && !error.message.includes('No rows found')) {
      console.log(`Warning clearing ${table}:`, error.message);
    }
  }
  
  console.log('✅ Existing data cleared');
}

/**
 * Import regions data
 */
async function importRegions(data) {
  console.log(`📍 Importing ${data.length} regions...`);
  
  const { error } = await supabase
    .from('psgc_regions')
    .insert(data.map(row => ({
      code: row.code,
      name: row.name
    })));
  
  if (error) {
    throw new Error(`Failed to import regions: ${error.message}`);
  }
  
  console.log('✅ Regions imported');
}

/**
 * Import provinces data
 */
async function importProvinces(data) {
  console.log(`🏔️  Importing ${data.length} provinces...`);
  
  const { error } = await supabase
    .from('psgc_provinces')
    .insert(data.map(row => ({
      code: row.code,
      name: row.name,
      region_code: row.region_code,
      is_active: row.is_active === 'True' || row.is_active === 'true' || row.is_active === '1'
    })));
  
  if (error) {
    throw new Error(`Failed to import provinces: ${error.message}`);
  }
  
  console.log('✅ Provinces imported');
}

/**
 * Import cities and municipalities data
 */
async function importCities(data) {
  console.log(`🏙️  Importing ${data.length} cities/municipalities...`);
  
  const { error } = await supabase
    .from('psgc_cities_municipalities')
    .insert(data.map(row => {
      const isIndependent = row.is_independent === 'True' || row.is_independent === 'true' || row.is_independent === '1';
      // Missing province codes that should be independent cities: NCR districts and special cases
      const missingProvinceCodes = ['0997', '1298', '1339', '1374', '1375', '1376', '1538'];
      const hasMissingProvince = missingProvinceCodes.includes(row.province_code);
      
      return {
        code: row.code,
        name: row.name,
        // Set to NULL if: officially independent, has missing province code, or empty
        province_code: (isIndependent || hasMissingProvince || row.province_code === '') ? null : row.province_code,
        type: row.type,
        // Mark as independent if officially marked OR has missing province (likely HUC/ICC)
        is_independent: isIndependent || hasMissingProvince
      };
    }));
  
  if (error) {
    throw new Error(`Failed to import cities/municipalities: ${error.message}`);
  }
  
  console.log('✅ Cities/municipalities imported');
}

/**
 * Import barangays data (in batches for performance)
 * Skip barangays that reference non-existent cities
 */
async function importBarangays(data) {
  console.log(`🏘️  Importing ${data.length} barangays...`);
  
  // First, get list of valid city codes
  const { data: cities, error: citiesError } = await supabase
    .from('psgc_cities_municipalities')
    .select('code');
  
  if (citiesError) {
    throw new Error(`Failed to get city list: ${citiesError.message}`);
  }
  
  const validCityCodes = new Set(cities.map(c => c.code));
  console.log(`   Found ${validCityCodes.size} valid cities`);
  
  // Filter out barangays with invalid city references
  const validBarangays = data.filter(row => validCityCodes.has(row.city_municipality_code));
  
  const skippedCount = data.length - validBarangays.length;
  if (skippedCount > 0) {
    console.log(`   ⚠️  Skipping ${skippedCount} barangays with invalid city references`);
  }
  
  const batchSize = 1000;
  let processed = 0;
  
  for (let i = 0; i < validBarangays.length; i += batchSize) {
    const batch = validBarangays.slice(i, i + batchSize);
    
    const { error } = await supabase
      .from('psgc_barangays')
      .insert(batch.map(row => ({
        code: row.code,
        name: row.name,
        city_municipality_code: row.city_municipality_code
      })));
    
    if (error) {
      throw new Error(`Failed to import barangays batch at ${i}: ${error.message}`);
    }
    
    processed += batch.length;
    console.log(`   📊 Progress: ${processed}/${validBarangays.length} valid barangays`);
  }
  
  console.log(`✅ Barangays imported (${validBarangays.length} valid, ${skippedCount} skipped)`);
}

/**
 * Validate data integrity
 */
async function validateData() {
  console.log('🔍 Validating data integrity...');
  
  const tables = ['psgc_regions', 'psgc_provinces', 'psgc_cities_municipalities', 'psgc_barangays'];
  const counts = {};
  
  // Get record counts
  for (const table of tables) {
    const { count, error } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.log(`Warning getting count for ${table}:`, error.message);
      counts[table] = 'Unknown';
    } else {
      counts[table] = count;
    }
  }
  
  console.log('\\n📊 Record Counts:');
  console.log(`   Regions: ${counts.psgc_regions}`);
  console.log(`   Provinces: ${counts.psgc_provinces}`);
  console.log(`   Cities/Municipalities: ${counts.psgc_cities_municipalities}`);
  console.log(`   Barangays: ${counts.psgc_barangays}`);
  
  // Basic integrity check - verify some relationships exist
  const { data: sampleProvince, error } = await supabase
    .from('psgc_provinces')
    .select('code, region_code, psgc_regions(name)')
    .limit(1)
    .single();
  
  if (error) {
    console.log('❌ Relationship validation failed:', error.message);
    return false;
  } else {
    console.log(`✅ Sample relationship check: Province ${sampleProvince.code} → Region ${sampleProvince.psgc_regions?.name || 'linked'}`);
  }
  
  return true;
}

/**
 * Main import function
 */
async function main() {
  try {
    console.log('🚀 Starting PSGC data import via Supabase API...');
    console.log('=================================================');
    
    // Clear existing data
    await clearExistingData();
    
    // Import data in correct order (respecting foreign keys)
    const regionsData = await parseCSV(files.regions);
    await importRegions(regionsData);
    
    const provincesData = await parseCSV(files.provinces);
    await importProvinces(provincesData);
    
    const citiesData = await parseCSV(files.cities);
    await importCities(citiesData);
    
    const barangaysData = await parseCSV(files.barangays);
    await importBarangays(barangaysData);
    
    // Validate data
    const isValid = await validateData();
    
    if (!isValid) {
      throw new Error('Data integrity validation failed');
    }
    
    console.log('\\n=================================================');
    console.log('✅ PSGC data import completed successfully!');
    console.log('Next step: Your database is ready for application data');
    console.log('=================================================');
    
  } catch (error) {
    console.error('\\n❌ Import failed:', error.message);
    process.exit(1);
  }
}

// Run the import
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main };