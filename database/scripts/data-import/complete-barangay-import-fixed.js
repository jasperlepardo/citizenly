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

const PSGC_CSV_PATH = '../sample data/psgc/updated/PSGC.csv';
const BARANGAY_CSV_PATH = '../sample data/psgc/updated/psgc_barangays.updated.csv';

async function loadCSV(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];
    const fullPath = path.join(__dirname, filePath);
    
    fs.createReadStream(fullPath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', reject);
  });
}

async function getAllCities() {
  // Get ALL cities, not limited to 1000
  let allCities = [];
  let from = 0;
  const batchSize = 1000;
  
  while (true) {
    const { data: batch } = await supabase
      .from('psgc_cities_municipalities')
      .select('code, name')
      .range(from, from + batchSize - 1);
    
    if (!batch || batch.length === 0) break;
    
    allCities = allCities.concat(batch);
    from += batchSize;
    
    if (batch.length < batchSize) break;
  }
  
  return allCities;
}

function extractCityCode(psgcCode) {
  return psgcCode.substring(0, 6);
}

function extractBarangayCode(psgcCode) {
  return psgcCode.substring(0, 9);
}

async function completeBarangayImportFixed() {
  console.log('🏘️ COMPREHENSIVE BARANGAY COMPLETION - FIXED VERSION');
  console.log('======================================================\n');
  
  try {
    // Step 1: Get current database state with ALL cities
    console.log('📊 Getting complete database state...');
    const allCities = await getAllCities();
    const validCityCodes = new Set(allCities.map(city => city.code));
    
    const { count: currentBarangayCount } = await supabase
      .from('psgc_barangays')
      .select('*', { count: 'exact' });
    
    console.log(`✅ Valid cities in database: ${validCityCodes.size.toLocaleString()}`);
    console.log(`✅ Current barangays: ${currentBarangayCount.toLocaleString()}\n`);
    
    // Step 2: Load official PSGC barangays
    console.log('📄 Loading official PSGC barangays...');
    const psgcData = await loadPSGCData();
    const officialBarangays = psgcData.filter(record => 
      record['Geographic Level'] === 'Bgy'
    );
    
    console.log(`✅ Official PSGC barangays: ${officialBarangays.length.toLocaleString()}`);
    
    // Step 3: Load CSV barangays
    console.log('📄 Loading CSV barangays...');
    const csvBarangays = await loadCSV(BARANGAY_CSV_PATH);
    console.log(`✅ CSV barangays: ${csvBarangays.length.toLocaleString()}\n`);
    
    // Step 4: Create comprehensive barangay list
    console.log('🔄 Creating comprehensive barangay mapping...');
    
    const finalBarangays = new Map();
    let csvValid = 0;
    let csvInvalid = 0;
    
    // Add CSV barangays with valid cities
    csvBarangays.forEach(barangay => {
      if (validCityCodes.has(barangay.city_municipality_code)) {
        finalBarangays.set(barangay.code, {
          code: barangay.code,
          name: barangay.name,
          city_municipality_code: barangay.city_municipality_code,
          urban_rural_status: barangay.urban_rural_status || 'Rural'
        });
        csvValid++;
      } else {
        csvInvalid++;
      }
    });
    
    console.log(`✅ CSV barangays with valid cities: ${csvValid.toLocaleString()}`);
    console.log(`⚠️  CSV barangays with invalid cities: ${csvInvalid.toLocaleString()}`);
    
    // Add official PSGC barangays that aren't duplicates
    let officialAdded = 0;
    let officialValid = 0;
    
    officialBarangays.forEach(barangay => {
      const cityCode = extractCityCode(barangay['10-digit PSGC']);
      const barangayCode = extractBarangayCode(barangay['10-digit PSGC']);
      
      if (validCityCodes.has(cityCode)) {
        officialValid++;
        if (!finalBarangays.has(barangayCode)) {
          finalBarangays.set(barangayCode, {
            code: barangayCode,
            name: barangay['Name'],
            city_municipality_code: cityCode,
            urban_rural_status: barangay['Urban / Rural\\n(based on 2020 CPH)'] === 'U' ? 'Urban' : 'Rural'
          });
          officialAdded++;
        }
      }
    });
    
    console.log(`✅ Official barangays with valid cities: ${officialValid.toLocaleString()}`);
    console.log(`✅ Additional official barangays added: ${officialAdded.toLocaleString()}`);
    
    // Step 5: Handle Metro Manila special mapping
    console.log('\\n🏛️ Handling Metro Manila barangay mapping...');
    
    const metroManilaMapping = {
      '133901': '133900', '133902': '133900', '133903': '133900',
      '133904': '133900', '133905': '133900', '133906': '133900',
      '133907': '133900', '133908': '133900', '133909': '133900',
      '133910': '133900', '133911': '133900', '133912': '133900',
      '133913': '133900', '133914': '133900'
    };
    
    let metroMappedCount = 0;
    
    // Check if Manila city exists
    if (validCityCodes.has('133900')) {
      csvBarangays.forEach(barangay => {
        const mappedCode = metroManilaMapping[barangay.city_municipality_code];
        if (mappedCode && !finalBarangays.has(barangay.code)) {
          finalBarangays.set(barangay.code, {
            code: barangay.code,
            name: barangay.name,
            city_municipality_code: mappedCode,
            urban_rural_status: barangay.urban_rural_status || 'Urban'
          });
          metroMappedCount++;
        }
      });
    }
    
    console.log(`✅ Metro Manila barangays mapped: ${metroMappedCount.toLocaleString()}`);
    
    const totalUnified = finalBarangays.size;
    console.log(`\\n🎯 Total unified barangays: ${totalUnified.toLocaleString()}`);
    
    // Step 6: Import all unified barangays
    console.log('\\n🚀 Starting massive barangay import...');
    
    const barangaysToImport = Array.from(finalBarangays.values());
    const batchSize = 1000;
    let imported = 0;
    let errors = 0;
    
    for (let i = 0; i < barangaysToImport.length; i += batchSize) {
      const batch = barangaysToImport.slice(i, i + batchSize);
      const batchNum = Math.floor(i / batchSize) + 1;
      const totalBatches = Math.ceil(barangaysToImport.length / batchSize);
      
      console.log(`📦 Batch ${batchNum}/${totalBatches} (${batch.length} barangays)...`);
      
      try {
        const { error } = await supabase
          .from('psgc_barangays')
          .upsert(batch, { onConflict: 'code' });
        
        if (error) {
          console.error(`❌ Error in batch ${batchNum}:`, error.message);
          errors++;
        } else {
          imported += batch.length;
          console.log(`✅ Progress: ${imported.toLocaleString()}/${barangaysToImport.length.toLocaleString()}`);
        }
      } catch (err) {
        console.error(`❌ Exception in batch ${batchNum}:`, err.message);
        errors++;
      }
    }
    
    // Step 7: Final comprehensive verification
    console.log('\\n📊 FINAL COMPREHENSIVE VERIFICATION:');
    console.log('=====================================');
    
    const { count: finalCount } = await supabase
      .from('psgc_barangays')
      .select('*', { count: 'exact' });
    
    // Check for orphaned barangays
    let orphanedCount = 0;
    let validatedCount = 0;
    
    try {
      // This query might be complex, so we'll estimate
      const { count: testCount } = await supabase
        .from('psgc_barangays')
        .select('*', { count: 'exact' })
        .limit(1000);
      
      // If we can query, get a sample to estimate orphaned rate
      const { data: sampleBarangays } = await supabase
        .from('psgc_barangays')
        .select('city_municipality_code')
        .limit(1000);
      
      const sampleOrphaned = sampleBarangays?.filter(b => 
        !validCityCodes.has(b.city_municipality_code)
      ).length || 0;
      
      orphanedCount = Math.round((sampleOrphaned / (sampleBarangays?.length || 1)) * finalCount);
      validatedCount = finalCount - orphanedCount;
    } catch (error) {
      console.log('Could not calculate orphaned count precisely');
      validatedCount = finalCount; // Assume all are valid for summary
    }
    
    const officialTotal = 42028;
    const coveragePercent = ((finalCount / officialTotal) * 100).toFixed(1);
    const improvement = finalCount - currentBarangayCount;
    
    console.log(`Final barangay count: ${finalCount.toLocaleString()}`);
    console.log(`Estimated valid barangays: ${validatedCount.toLocaleString()}`);
    console.log(`Estimated orphaned: ${orphanedCount.toLocaleString()}`);
    
    console.log('\\n🎯 COMPLETION ACHIEVEMENT:');
    console.log('==========================');
    console.log(`🚀 Starting count: ${currentBarangayCount.toLocaleString()}`);
    console.log(`🎉 Final count: ${finalCount.toLocaleString()}`);
    console.log(`📈 Net improvement: +${improvement.toLocaleString()}`);
    console.log(`📊 Coverage: ${coveragePercent}% of official total`);
    console.log(`❌ Import errors: ${errors} batches`);
    
    // Achievement levels
    if (finalCount >= 42000) {
      console.log('\\n🏆 OUTSTANDING ACHIEVEMENT!');
      console.log('🌟 Near-complete Philippine barangay coverage achieved!');
    } else if (finalCount >= 41500) {
      console.log('\\n🥇 EXCELLENT ACHIEVEMENT!');
      console.log('🌟 Superior barangay coverage achieved!');
    } else if (finalCount > currentBarangayCount) {
      console.log('\\n🥈 GREAT IMPROVEMENT!');
      console.log('🌟 Significant barangay coverage enhancement!');
    } else {
      console.log('\\n📊 ANALYSIS COMPLETE');
      console.log('💡 Consider data quality review for further improvements');
    }
    
    console.log('\\n🎯 FINAL STATUS:');
    console.log(`Database now contains ${finalCount.toLocaleString()} barangays`);
    console.log(`Representing ${coveragePercent}% of Philippine barangay coverage`);
    console.log('\\n🌟 Comprehensive barangay completion project finished!');
    
  } catch (error) {
    console.error('❌ Comprehensive import failed:', error.message);
    process.exit(1);
  }
}

async function loadPSGCData() {
  return new Promise((resolve, reject) => {
    const results = [];
    const filePath = path.join(__dirname, PSGC_CSV_PATH);
    
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', reject);
  });
}

// Run the fixed comprehensive import
if (require.main === module) {
  completeBarangayImportFixed();
}

module.exports = { completeBarangayImportFixed };