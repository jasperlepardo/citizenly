#!/usr/bin/env node

/**
 * Complete Barangay Migration Script
 * Imports remaining barangays from CSV with validation and error handling
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
const CSV_FILE = path.join(DATA_DIR, 'psgc_barangays.csv');

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

async function getCurrentBarangays() {
  console.log('📊 Getting current barangay data...');
  
  const { data: current, error } = await supabase
    .from('psgc_barangays')
    .select('code, name, city_municipality_code');
  
  if (error) {
    throw new Error(`Failed to get current barangays: ${error.message}`);
  }
  
  console.log(`✅ Current barangays in database: ${current.length.toLocaleString()}`);
  
  return new Set(current.map(b => b.code));
}

async function getValidCities() {
  console.log('📊 Getting valid city codes...');
  
  const { data: cities, error } = await supabase
    .from('psgc_cities_municipalities')
    .select('code, name');
  
  if (error) {
    throw new Error(`Failed to get cities: ${error.message}`);
  }
  
  console.log(`✅ Valid cities available: ${cities.length.toLocaleString()}`);
  
  return new Set(cities.map(c => c.code));
}

function validateBarangay(barangay, validCities, index) {
  const errors = [];
  const cleaned = { ...barangay };
  
  // Required fields
  if (!cleaned.code) {
    errors.push(`Row ${index + 1}: Missing barangay code`);
    return { cleaned: null, errors };
  }
  
  if (!cleaned.name) {
    errors.push(`Row ${index + 1}: Missing barangay name`);
    return { cleaned: null, errors };
  }
  
  if (!cleaned.city_municipality_code) {
    errors.push(`Row ${index + 1}: Missing city_municipality_code`);
    return { cleaned: null, errors };
  }
  
  // Validate city code exists
  if (!validCities.has(cleaned.city_municipality_code)) {
    errors.push(`Row ${index + 1}: Invalid city code ${cleaned.city_municipality_code}`);
    return { cleaned: null, errors };
  }
  
  // Clean and standardize data
  cleaned.name = cleaned.name.trim();
  cleaned.code = cleaned.code.trim();
  cleaned.city_municipality_code = cleaned.city_municipality_code.trim();
  
  // Handle optional fields
  if (cleaned.urban_rural_status) {
    cleaned.urban_rural_status = cleaned.urban_rural_status.trim();
  }
  
  return { cleaned, errors: [] };
}

async function importBarangaysBatch(barangays, batchSize = 500) {
  console.log(`📤 Importing ${barangays.length.toLocaleString()} barangays in batches of ${batchSize}...`);
  
  const results = {
    total: barangays.length,
    successful: 0,
    failed: 0,
    errors: []
  };
  
  for (let i = 0; i < barangays.length; i += batchSize) {
    const batch = barangays.slice(i, i + batchSize);
    const batchNumber = Math.floor(i / batchSize) + 1;
    const totalBatches = Math.ceil(barangays.length / batchSize);
    
    console.log(`\n⏳ Processing batch ${batchNumber}/${totalBatches} (${batch.length} barangays)...`);
    
    try {
      const { data, error } = await supabase
        .from('psgc_barangays')
        .upsert(batch, { 
          onConflict: 'code',
          ignoreDuplicates: false 
        })
        .select('code');
      
      if (error) {
        console.log(`❌ Batch ${batchNumber} failed: ${error.message}`);
        results.failed += batch.length;
        results.errors.push(`Batch ${batchNumber}: ${error.message}`);
      } else {
        const imported = data?.length || batch.length;
        console.log(`✅ Batch ${batchNumber} successful: ${imported} barangays imported`);
        results.successful += imported;
      }
      
    } catch (err) {
      console.log(`❌ Batch ${batchNumber} exception: ${err.message}`);
      results.failed += batch.length;
      results.errors.push(`Batch ${batchNumber}: ${err.message}`);
    }
    
    // Small delay between batches to avoid rate limiting
    if (i + batchSize < barangays.length) {
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }
  
  return results;
}

async function verifyImport() {
  console.log('\n🔍 Verifying import results...');
  
  const { count: finalCount } = await supabase
    .from('psgc_barangays')
    .select('*', { count: 'exact', head: true });
  
  console.log(`📊 Final barangay count: ${finalCount?.toLocaleString() || 0}`);
  
  // Check coverage by region
  const { data: coverage } = await supabase.rpc('exec_sql', {
    sql: `
    SELECT 
      r.name as region_name,
      COUNT(DISTINCT c.code) as cities_in_region,
      COUNT(b.code) as barangays_in_region
    FROM psgc_regions r
    LEFT JOIN psgc_provinces p ON r.code = p.region_code
    LEFT JOIN psgc_cities_municipalities c ON p.code = c.province_code OR c.is_independent = true
    LEFT JOIN psgc_barangays b ON c.code = b.city_municipality_code
    GROUP BY r.code, r.name
    ORDER BY barangays_in_region DESC;
    `
  });
  
  if (coverage) {
    console.log('\n📈 Barangay coverage by region (top 10):');
    coverage.slice(0, 10).forEach(region => {
      console.log(`   ${region.region_name}: ${region.barangays_in_region} barangays`);
    });
  }
  
  // Calculate completion percentage
  const targetBarangays = 42028;
  const completionPercentage = Math.round((finalCount / targetBarangays) * 100);
  
  console.log(`\n🎯 Completion Status:`);
  console.log(`   Target: ${targetBarangays.toLocaleString()} barangays`);
  console.log(`   Current: ${finalCount?.toLocaleString() || 0} barangays`);
  console.log(`   Completion: ${completionPercentage}%`);
  
  if (completionPercentage >= 95) {
    console.log('   ✅ EXCELLENT: Near-complete coverage achieved!');
  } else if (completionPercentage >= 85) {
    console.log('   ✅ GOOD: Strong coverage achieved');
  } else if (completionPercentage >= 70) {
    console.log('   ⚠️  MODERATE: Decent coverage, could be improved');
  } else {
    console.log('   ❌ NEEDS IMPROVEMENT: Low coverage detected');
  }
  
  return finalCount;
}

async function main() {
  try {
    console.log('🚀 COMPLETE BARANGAY MIGRATION');
    console.log('===============================\n');
    
    // Step 1: Load CSV data
    console.log('📄 Loading barangay data from CSV...');
    const csvBarangays = await readCSV(CSV_FILE);
    console.log(`✅ Loaded ${csvBarangays.length.toLocaleString()} barangays from CSV`);
    
    // Step 2: Get current database state
    const currentBarangayCodes = await getCurrentBarangays();
    const validCities = await getValidCities();
    
    // Step 3: Filter and validate new barangays
    console.log('\n🔍 Filtering and validating barangays...');
    
    const newBarangays = [];
    const validationErrors = [];
    let skippedExisting = 0;
    
    csvBarangays.forEach((barangay, index) => {
      // Skip if already exists
      if (currentBarangayCodes.has(barangay.code)) {
        skippedExisting++;
        return;
      }
      
      const { cleaned, errors } = validateBarangay(barangay, validCities, index);
      
      if (errors.length > 0) {
        validationErrors.push(...errors);
      } else if (cleaned) {
        newBarangays.push(cleaned);
      }
    });
    
    console.log(`✅ New barangays to import: ${newBarangays.length.toLocaleString()}`);
    console.log(`ℹ️  Skipped existing: ${skippedExisting.toLocaleString()}`);
    
    if (validationErrors.length > 0) {
      console.log(`⚠️  Validation errors: ${validationErrors.length}`);
      validationErrors.slice(0, 10).forEach(error => console.log(`   ${error}`));
      if (validationErrors.length > 10) {
        console.log(`   ... and ${validationErrors.length - 10} more errors`);
      }
    }
    
    if (newBarangays.length === 0) {
      console.log('\n✅ No new barangays to import. Database is up to date!');
      await verifyImport();
      return;
    }
    
    // Step 4: Import new barangays
    console.log('\n📤 Starting barangay import...');
    const importResults = await importBarangaysBatch(newBarangays);
    
    // Step 5: Report results
    console.log('\n🎉 IMPORT COMPLETED');
    console.log('==================');
    console.log(`📊 Total processed: ${importResults.total.toLocaleString()}`);
    console.log(`✅ Successfully imported: ${importResults.successful.toLocaleString()}`);
    console.log(`❌ Failed imports: ${importResults.failed.toLocaleString()}`);
    
    if (importResults.errors.length > 0) {
      console.log('\n❌ Import errors:');
      importResults.errors.forEach(error => console.log(`   ${error}`));
    }
    
    // Step 6: Verify final state
    await verifyImport();
    
    if (importResults.successful > 0) {
      console.log('\n🎯 MIGRATION SUCCESS!');
      console.log('Your barangay database has been significantly expanded.');
      console.log('The RBI System now has more comprehensive geographic coverage!');
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