#!/usr/bin/env node

/**
 * Import Missing Cities Migration Script
 * Imports the 633 missing cities available in CSV to unlock 13,719 additional barangays
 */

require('dotenv').config();

const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

const DATA_DIR = path.join(__dirname, '../sample data/psgc');
const CITIES_CSV = path.join(DATA_DIR, 'psgc_cities_municipalities.csv');
const BARANGAY_CSV = path.join(DATA_DIR, 'psgc_barangays.csv');

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

async function identifyMissingCities() {
  console.log('🔍 IDENTIFYING MISSING CITIES');
  console.log('=============================\n');
  
  try {
    // Step 1: Load CSV data
    console.log('📄 Loading data from CSV files...');
    const csvCities = await readCSV(CITIES_CSV);
    const csvBarangays = await readCSV(BARANGAY_CSV);
    
    console.log(`✅ Loaded ${csvCities.length.toLocaleString()} cities from CSV`);
    console.log(`✅ Loaded ${csvBarangays.length.toLocaleString()} barangays from CSV`);
    
    // Step 2: Get current database cities
    console.log('\n📊 Getting current database cities...');
    const { data: dbCities } = await supabase
      .from('psgc_cities_municipalities')
      .select('code, name, type');
    
    console.log(`✅ Current cities in database: ${dbCities.length.toLocaleString()}`);
    
    // Step 3: Identify missing cities that are referenced by barangays
    const dbCityCodes = new Set(dbCities.map(c => c.code));
    const barangayReferencedCityCodes = new Set(csvBarangays.map(b => b.city_municipality_code));
    
    const missingCitiesNeeded = csvCities.filter(city => 
      barangayReferencedCityCodes.has(city.code) && !dbCityCodes.has(city.code)
    );
    
    console.log(`\n📊 MISSING CITIES ANALYSIS`);
    console.log(`==============================`);
    console.log(`Total cities referenced by barangays: ${barangayReferencedCityCodes.size.toLocaleString()}`);
    console.log(`Cities already in database: ${dbCityCodes.size.toLocaleString()}`);
    console.log(`Missing cities available for import: ${missingCitiesNeeded.length.toLocaleString()}`);
    
    // Calculate impact
    const totalBarangaysUnlocked = missingCitiesNeeded.reduce((sum, city) => {
      const barangayCount = csvBarangays.filter(b => b.city_municipality_code === city.code).length;
      return sum + barangayCount;
    }, 0);
    
    console.log(`🎯 Barangays that will be unlocked: ${totalBarangaysUnlocked.toLocaleString()}`);
    
    return missingCitiesNeeded;
    
  } catch (error) {
    console.log(`❌ Identification failed: ${error.message}`);
    throw error;
  }
}

function validateCity(city, validProvinces, index) {
  const errors = [];
  const cleaned = { ...city };
  
  // Required fields
  if (!cleaned.code) {
    errors.push(`Row ${index + 1}: Missing city code`);
    return { cleaned: null, errors };
  }
  
  if (!cleaned.name) {
    errors.push(`Row ${index + 1}: Missing city name`);
    return { cleaned: null, errors };
  }
  
  // Clean and standardize data
  cleaned.name = cleaned.name.trim();
  cleaned.code = cleaned.code.trim();
  
  // Handle province_code
  if (cleaned.province_code) {
    cleaned.province_code = cleaned.province_code.trim();
  }
  
  // Handle independence status
  if (cleaned.is_independent === 'true' || cleaned.is_independent === true) {
    cleaned.is_independent = true;
    // Independent cities should not have province codes
    if (cleaned.province_code) {
      console.log(`   ⚠️  Warning: Independent city ${cleaned.name} has province code, will be nullified`);
      cleaned.province_code = null;
    }
  } else {
    cleaned.is_independent = false;
    // Non-independent cities should have valid province codes
    if (cleaned.province_code && !validProvinces.has(cleaned.province_code)) {
      console.log(`   ⚠️  Warning: City ${cleaned.name} has invalid province code ${cleaned.province_code}`);
      // Keep the province code for now, but mark as potential issue
    }
  }
  
  // Handle optional fields with safe defaults
  cleaned.type = cleaned.type?.trim() || 'municipality';
  
  return { cleaned, errors: [] };
}

async function getValidProvinces() {
  console.log('📊 Getting valid province codes...');
  
  const { data: provinces, error } = await supabase
    .from('psgc_provinces')
    .select('code, name');
  
  if (error) {
    throw new Error(`Failed to get provinces: ${error.message}`);
  }
  
  console.log(`✅ Valid provinces available: ${provinces.length.toLocaleString()}`);
  
  return new Set(provinces.map(p => p.code));
}

async function importCitiesBatch(cities, batchSize = 100) {
  console.log(`📤 Importing ${cities.length.toLocaleString()} cities in batches of ${batchSize}...`);
  
  const results = {
    total: cities.length,
    successful: 0,
    failed: 0,
    errors: []
  };
  
  for (let i = 0; i < cities.length; i += batchSize) {
    const batch = cities.slice(i, i + batchSize);
    const batchNumber = Math.floor(i / batchSize) + 1;
    const totalBatches = Math.ceil(cities.length / batchSize);
    
    console.log(`\n⏳ Processing batch ${batchNumber}/${totalBatches} (${batch.length} cities)...`);
    
    try {
      const { data, error } = await supabase
        .from('psgc_cities_municipalities')
        .upsert(batch, { 
          onConflict: 'code',
          ignoreDuplicates: false 
        })
        .select('code, name');
      
      if (error) {
        console.log(`❌ Batch ${batchNumber} failed: ${error.message}`);
        results.failed += batch.length;
        results.errors.push(`Batch ${batchNumber}: ${error.message}`);
      } else {
        const imported = data?.length || batch.length;
        console.log(`✅ Batch ${batchNumber} successful: ${imported} cities imported`);
        
        // Show some examples
        if (data && data.length > 0) {
          const examples = data.slice(0, 3);
          examples.forEach(city => {
            console.log(`   • ${city.code} - ${city.name}`);
          });
          if (data.length > 3) {
            console.log(`   ... and ${data.length - 3} more`);
          }
        }
        
        results.successful += imported;
      }
      
    } catch (err) {
      console.log(`❌ Batch ${batchNumber} exception: ${err.message}`);
      results.failed += batch.length;
      results.errors.push(`Batch ${batchNumber}: ${err.message}`);
    }
    
    // Small delay between batches to avoid rate limiting
    if (i + batchSize < cities.length) {
      await new Promise(resolve => setTimeout(resolve, 300));
    }
  }
  
  return results;
}

async function verifyImport() {
  console.log('\n🔍 Verifying import results...');
  
  const { count: finalCount } = await supabase
    .from('psgc_cities_municipalities')
    .select('*', { count: 'exact', head: true });
  
  console.log(`📊 Final city/municipality count: ${finalCount?.toLocaleString() || 0}`);
  
  // Check examples of newly imported cities
  const { data: recentCities } = await supabase
    .from('psgc_cities_municipalities')
    .select('code, name, type, is_independent, province_code')
    .order('code')
    .limit(10);
  
  if (recentCities && recentCities.length > 0) {
    console.log('\n📋 Sample of cities in database:');
    recentCities.forEach(city => {
      const independence = city.is_independent ? 'Independent' : 'Regular';
      const province = city.province_code ? `(Province: ${city.province_code})` : '(No Province)';
      console.log(`   ${city.code} - ${city.name} [${city.type}] ${independence} ${province}`);
    });
  }
  
  return finalCount;
}

async function main() {
  try {
    console.log('🚀 MISSING CITIES IMPORT MIGRATION');
    console.log('===================================\n');
    
    // Step 1: Identify missing cities
    const missingCities = await identifyMissingCities();
    
    if (missingCities.length === 0) {
      console.log('\n✅ No missing cities found. All cities are already imported!');
      await verifyImport();
      return;
    }
    
    // Step 2: Get valid provinces for validation
    const validProvinces = await getValidProvinces();
    
    // Step 3: Validate and clean cities data
    console.log('\n🔍 Validating and cleaning cities data...');
    
    const validCities = [];
    const validationErrors = [];
    
    missingCities.forEach((city, index) => {
      const { cleaned, errors } = validateCity(city, validProvinces, index);
      
      if (errors.length > 0) {
        validationErrors.push(...errors);
      } else if (cleaned) {
        validCities.push(cleaned);
      }
    });
    
    console.log(`✅ Valid cities to import: ${validCities.length.toLocaleString()}`);
    
    if (validationErrors.length > 0) {
      console.log(`⚠️  Validation errors: ${validationErrors.length}`);
      validationErrors.slice(0, 5).forEach(error => console.log(`   ${error}`));
      if (validationErrors.length > 5) {
        console.log(`   ... and ${validationErrors.length - 5} more errors`);
      }
    }
    
    if (validCities.length === 0) {
      console.log('\n❌ No valid cities to import after validation.');
      return;
    }
    
    // Step 4: Show preview of what will be imported
    console.log('\n🎯 TOP 10 CITIES TO BE IMPORTED:');
    console.log('================================');
    
    const preview = validCities
      .slice(0, 10)
      .map(city => ({
        ...city,
        barangay_count: 0 // We'll calculate this if needed
      }));
    
    preview.forEach((city, index) => {
      const independence = city.is_independent ? 'Independent' : 'Regular';
      const province = city.province_code ? `Province: ${city.province_code}` : 'No Province';
      console.log(`${index + 1}. ${city.code} - ${city.name}`);
      console.log(`   Type: ${city.type} | Status: ${independence} | ${province}`);
    });
    
    // Step 5: Import cities
    console.log('\n📤 Starting cities import...');
    const importResults = await importCitiesBatch(validCities);
    
    // Step 6: Report results
    console.log('\n🎉 IMPORT COMPLETED');
    console.log('==================');
    console.log(`📊 Total processed: ${importResults.total.toLocaleString()}`);
    console.log(`✅ Successfully imported: ${importResults.successful.toLocaleString()}`);
    console.log(`❌ Failed imports: ${importResults.failed.toLocaleString()}`);
    
    if (importResults.errors.length > 0) {
      console.log('\n❌ Import errors:');
      importResults.errors.forEach(error => console.log(`   ${error}`));
    }
    
    // Step 7: Verify final state
    const finalCount = await verifyImport();
    
    if (importResults.successful > 0) {
      console.log('\n🎯 CITIES IMPORT SUCCESS!');
      console.log(`Your database now has ${finalCount?.toLocaleString() || 0} cities/municipalities.`);
      console.log('This unlocks thousands of additional barangays for import!');
      console.log('\n💡 NEXT STEP: Run the barangay migration script to import the newly unlocked barangays.');
    }
    
  } catch (error) {
    console.log(`❌ Migration failed: ${error.message}`);
    console.error(error);
  }
}

// Run the migration
if (require.main === module) {
  main();
}

module.exports = { main };