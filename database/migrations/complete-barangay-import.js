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

function extractCityCode(psgcCode) {
  // Extract 6-digit city code from 10-digit PSGC code
  return psgcCode.substring(0, 6);
}

function extractBarangayCode(psgcCode) {
  // Extract full 9-digit barangay code from 10-digit PSGC
  return psgcCode.substring(0, 9);
}

async function completeBarangayImport() {
  console.log('🏘️ COMPREHENSIVE BARANGAY COMPLETION PROJECT');
  console.log('==============================================\n');
  
  try {
    // Step 1: Load official PSGC barangay data
    console.log('📄 Loading official PSGC data...');
    const psgcData = await loadPSGCData();
    const officialBarangays = psgcData.filter(record => 
      record['Geographic Level'] === 'Bgy'
    );
    
    console.log(`✅ Found ${officialBarangays.length.toLocaleString()} official barangays in PSGC\n`);
    
    // Step 2: Load CSV barangay data
    console.log('📄 Loading CSV barangay data...');
    const csvBarangays = await loadCSV(BARANGAY_CSV_PATH);
    console.log(`✅ Found ${csvBarangays.length.toLocaleString()} barangays in CSV\n`);
    
    // Step 3: Get current database state
    console.log('📊 Analyzing current database state...');
    const { count: currentBarangayCount } = await supabase
      .from('psgc_barangays')
      .select('*', { count: 'exact' });
    
    const { data: currentCities } = await supabase
      .from('psgc_cities_municipalities')
      .select('code, name');
    
    const validCityCodes = new Set(currentCities?.map(city => city.code) || []);
    
    console.log(`✅ Current barangays in database: ${currentBarangayCount.toLocaleString()}`);
    console.log(`✅ Valid cities in database: ${validCityCodes.size.toLocaleString()}\n`);
    
    // Step 4: Create comprehensive barangay mapping
    console.log('🔄 Creating comprehensive barangay mapping...');
    
    // First, use CSV data as primary source
    const csvBarangayMap = new Map();
    csvBarangays.forEach(barangay => {
      const key = `${barangay.city_municipality_code}_${barangay.name.toLowerCase().trim()}`;
      csvBarangayMap.set(key, {
        code: barangay.code,
        name: barangay.name,
        city_municipality_code: barangay.city_municipality_code,
        urban_rural_status: barangay.urban_rural_status || 'Rural',
        source: 'csv'
      });
    });
    
    // Then, supplement with official PSGC data
    const officialBarangayMap = new Map();
    officialBarangays.forEach(barangay => {
      const cityCode = extractCityCode(barangay['10-digit PSGC']);
      const barangayCode = extractBarangayCode(barangay['10-digit PSGC']);
      const key = `${cityCode}_${barangay['Name'].toLowerCase().trim()}`;
      
      officialBarangayMap.set(key, {
        code: barangayCode,
        name: barangay['Name'],
        city_municipality_code: cityCode,
        urban_rural_status: barangay['Urban / Rural\\n(based on 2020 CPH)'] === 'U' ? 'Urban' : 'Rural',
        source: 'official',
        psgcCode: barangay['10-digit PSGC']
      });
    });
    
    console.log(`✅ CSV barangays mapped: ${csvBarangayMap.size.toLocaleString()}`);
    console.log(`✅ Official barangays mapped: ${officialBarangayMap.size.toLocaleString()}\n`);
    
    // Step 5: Create unified barangay list with multiple strategies
    console.log('🎯 Creating unified barangay dataset...');
    
    const unifiedBarangays = new Map();
    
    // Strategy 1: Add all CSV barangays with valid cities
    let csvValid = 0;
    let csvInvalid = 0;
    
    csvBarangayMap.forEach((barangay, key) => {
      if (validCityCodes.has(barangay.city_municipality_code)) {
        unifiedBarangays.set(barangay.code, barangay);
        csvValid++;
      } else {
        csvInvalid++;
      }
    });
    
    console.log(`✅ CSV barangays with valid cities: ${csvValid.toLocaleString()}`);
    console.log(`⚠️  CSV barangays with invalid cities: ${csvInvalid.toLocaleString()}`);
    
    // Strategy 2: Add official PSGC barangays with valid cities (non-duplicates)
    let officialAdded = 0;
    let officialSkipped = 0;
    
    officialBarangayMap.forEach((barangay, key) => {
      if (validCityCodes.has(barangay.city_municipality_code)) {
        if (!unifiedBarangays.has(barangay.code)) {
          unifiedBarangays.set(barangay.code, barangay);
          officialAdded++;
        } else {
          officialSkipped++;
        }
      }
    });
    
    console.log(`✅ Additional official barangays added: ${officialAdded.toLocaleString()}`);
    console.log(`⚠️  Official barangays skipped (duplicates): ${officialSkipped.toLocaleString()}`);
    
    // Strategy 3: Try to map invalid city codes using fuzzy matching
    console.log('\\n🔍 Attempting city code mapping for orphaned barangays...');
    
    const invalidBarangays = [];
    csvBarangayMap.forEach((barangay, key) => {
      if (!validCityCodes.has(barangay.city_municipality_code)) {
        invalidBarangays.push(barangay);
      }
    });
    
    // Create city name mapping for fuzzy matching
    const cityNameMap = new Map();
    currentCities?.forEach(city => {
      const normalizedName = city.name.toLowerCase()
        .replace(/city of /i, '')
        .replace(/municipality of /i, '')
        .trim();
      cityNameMap.set(normalizedName, city.code);
    });
    
    let mappedInvalid = 0;
    const cityCodeMapping = new Map();
    
    // Try to map some known problem codes
    const knownMappings = {
      '133901': '133900', // Tondo I/II -> Manila
      '133902': '133900', // Binondo -> Manila  
      '133903': '133900', // Quiapo -> Manila
      '133904': '133900', // San Nicolas -> Manila
      '133905': '133900', // Santa Cruz -> Manila
      '133906': '133900', // Sampaloc -> Manila
      '133907': '133900', // San Miguel -> Manila
      '133908': '133900', // Ermita -> Manila
      '133909': '133900', // Intramuros -> Manila
      '133910': '133900', // Malate -> Manila
      '133911': '133900', // Paco -> Manila
      '133912': '133900', // Pandacan -> Manila
      '133913': '133900', // Port Area -> Manila
      '133914': '133900', // Santa Ana -> Manila
    };
    
    Object.entries(knownMappings).forEach(([oldCode, newCode]) => {
      if (validCityCodes.has(newCode)) {
        cityCodeMapping.set(oldCode, newCode);
      }
    });
    
    // Apply mappings
    invalidBarangays.forEach(barangay => {
      const mappedCode = cityCodeMapping.get(barangay.city_municipality_code);
      if (mappedCode) {
        const mappedBarangay = {
          ...barangay,
          city_municipality_code: mappedCode,
          source: 'csv_mapped'
        };
        unifiedBarangays.set(barangay.code, mappedBarangay);
        mappedInvalid++;
      }
    });
    
    console.log(`✅ Invalid barangays successfully mapped: ${mappedInvalid.toLocaleString()}`);
    
    const finalUnifiedCount = unifiedBarangays.size;
    console.log(`\\n🎯 Final unified barangay count: ${finalUnifiedCount.toLocaleString()}`);
    
    // Step 6: Import unified barangays
    console.log('\\n🚀 Starting comprehensive barangay import...');
    
    const barangaysToImport = Array.from(unifiedBarangays.values());
    const batchSize = 1000;
    let imported = 0;
    let errors = 0;
    
    for (let i = 0; i < barangaysToImport.length; i += batchSize) {
      const batch = barangaysToImport.slice(i, i + batchSize);
      const batchNum = Math.floor(i / batchSize) + 1;
      const totalBatches = Math.ceil(barangaysToImport.length / batchSize);
      
      console.log(`📦 Processing batch ${batchNum}/${totalBatches} (${batch.length} barangays)...`);
      
      try {
        const { error } = await supabase
          .from('psgc_barangays')
          .upsert(batch, { onConflict: 'code' });
        
        if (error) {
          console.error(`❌ Error in batch ${batchNum}:`, error.message);
          errors++;
        } else {
          imported += batch.length;
          console.log(`✅ Imported ${imported.toLocaleString()}/${barangaysToImport.length.toLocaleString()} barangays`);
        }
      } catch (err) {
        console.error(`❌ Exception in batch ${batchNum}:`, err.message);
        errors++;
      }
    }
    
    // Step 7: Final verification and cleanup
    console.log('\\n📊 FINAL VERIFICATION:');
    console.log('======================');
    
    const { count: finalBarangayCount } = await supabase
      .from('psgc_barangays')
      .select('*', { count: 'exact' });
    
    const { count: orphanedCount } = await supabase
      .from('psgc_barangays')
      .select('*', { count: 'exact' })
      .not('city_municipality_code', 'in', `(SELECT code FROM psgc_cities_municipalities)`);
    
    console.log(`Final barangay count: ${finalBarangayCount.toLocaleString()}`);
    console.log(`Orphaned barangays: ${orphanedCount.toLocaleString()}`);
    console.log(`Valid barangays: ${(finalBarangayCount - orphanedCount).toLocaleString()}`);
    
    // Calculate coverage
    const officialTotal = 42028; // Official PSGC total
    const coveragePercent = ((finalBarangayCount / officialTotal) * 100).toFixed(1);
    
    console.log('\\n🎯 COMPLETION SUMMARY:');
    console.log('======================');
    console.log(`✅ Starting barangays: ${currentBarangayCount.toLocaleString()}`);
    console.log(`✅ Final barangays: ${finalBarangayCount.toLocaleString()}`);
    console.log(`✅ Net increase: +${(finalBarangayCount - currentBarangayCount).toLocaleString()}`);
    console.log(`✅ Coverage: ${coveragePercent}% of official total`);
    console.log(`✅ Batch errors: ${errors}`);
    
    if (orphanedCount > 0) {
      console.log(`\\n⚠️  Found ${orphanedCount.toLocaleString()} orphaned barangays`);
      console.log('💡 Consider creating missing cities or reviewing data quality');
    }
    
    if (finalBarangayCount >= 42000) {
      console.log('\\n🎉 EXCELLENT! Achieved near-complete barangay coverage');
    } else if (finalBarangayCount >= 41000) {
      console.log('\\n✅ VERY GOOD! Strong barangay coverage achieved');
    } else {
      console.log('\\n📈 PROGRESS! Significant improvement in barangay coverage');
    }
    
    console.log('\\n🌟 Barangay completion project finished!');
    
  } catch (error) {
    console.error('❌ Barangay import failed:', error.message);
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

// Run the comprehensive import
if (require.main === module) {
  completeBarangayImport();
}

module.exports = { completeBarangayImport };