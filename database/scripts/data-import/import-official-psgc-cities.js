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

function extractCityCode(psgcCode) {
  // Extract 6-digit city code from 10-digit PSGC code
  // Format: RRRPPPCCCCB (R=Region, P=Province, C=City, B=Barangay)
  return psgcCode.substring(0, 6);
}

function mapCityType(geoLevel, cityClass) {
  // Map official PSGC geographic level and city class to our types
  if (geoLevel === 'City') {
    if (cityClass === 'HUC') return 'highly urbanized city';
    if (cityClass === 'ICC') return 'independent component city';
    if (cityClass === 'CC') return 'component city';
    return 'component city'; // default for cities
  } else if (geoLevel === 'Mun') {
    return 'municipality';
  } else if (geoLevel === 'SubMun') {
    return 'sub-municipality';
  }
  return 'municipality'; // default
}

function determineProvinceCode(psgcCode, geoLevel, cityClass) {
  // Extract province code from PSGC code
  const provinceCode = psgcCode.substring(0, 4);
  
  // Independent cities and sub-municipalities should have null province_code
  if (cityClass === 'HUC' || cityClass === 'ICC' || geoLevel === 'SubMun') {
    return null;
  }
  
  return provinceCode;
}

function determineIndependence(geoLevel, cityClass) {
  // Determine if city/municipality is independent
  return cityClass === 'HUC' || cityClass === 'ICC' || geoLevel === 'SubMun';
}

async function importOfficialCities() {
  console.log('📊 IMPORTING OFFICIAL PSGC CITIES/MUNICIPALITIES');
  console.log('=================================================\n');
  
  try {
    // Load official PSGC data
    console.log('📄 Loading official PSGC data...');
    const psgcData = await loadPSGCData();
    console.log(`✅ Loaded ${psgcData.length.toLocaleString()} PSGC records\n`);
    
    // Filter for cities, municipalities, and sub-municipalities
    const cityRecords = psgcData.filter(record => 
      ['City', 'Mun', 'SubMun'].includes(record['Geographic Level'])
    );
    
    console.log('🏙️ OFFICIAL PSGC BREAKDOWN:');
    console.log('===========================');
    const breakdown = {};
    cityRecords.forEach(record => {
      const level = record['Geographic Level'];
      breakdown[level] = (breakdown[level] || 0) + 1;
    });
    
    Object.entries(breakdown).forEach(([level, count]) => {
      const name = level === 'City' ? 'Cities' : 
                   level === 'Mun' ? 'Municipalities' : 
                   'Sub-Municipalities';
      console.log(`${name}: ${count}`);
    });
    console.log(`Total: ${cityRecords.length}\n`);
    
    // Transform data for our database schema
    console.log('🔄 Transforming data for database import...');
    const transformedCities = cityRecords.map(record => {
      const psgcCode = record['10-digit PSGC'];
      const geoLevel = record['Geographic Level'];
      const cityClass = record['City Class'] || '';
      
      return {
        code: extractCityCode(psgcCode),
        name: record['Name'],
        province_code: determineProvinceCode(psgcCode, geoLevel, cityClass),
        type: mapCityType(geoLevel, cityClass),
        is_independent: determineIndependence(geoLevel, cityClass)
      };
    });
    
    console.log(`✅ Transformed ${transformedCities.length} city records\n`);
    
    // Check current database state
    console.log('📊 Checking current database state...');
    const { count: currentCount } = await supabase
      .from('psgc_cities_municipalities')
      .select('*', { count: 'exact' });
    
    console.log(`Current database count: ${currentCount}`);
    console.log(`Official PSGC count: ${cityRecords.length}`);
    console.log(`Expected after import: ${cityRecords.length} (will upsert)\n`);
    
    // Import in batches
    console.log('🚀 Starting import process...');
    const batchSize = 500;
    let processed = 0;
    let imported = 0;
    let errors = 0;
    
    for (let i = 0; i < transformedCities.length; i += batchSize) {
      const batch = transformedCities.slice(i, i + batchSize);
      const batchNum = Math.floor(i / batchSize) + 1;
      const totalBatches = Math.ceil(transformedCities.length / batchSize);
      
      console.log(`📦 Processing batch ${batchNum}/${totalBatches} (${batch.length} records)...`);
      
      try {
        const { data, error } = await supabase
          .from('psgc_cities_municipalities')
          .upsert(batch, { onConflict: 'code' });
        
        if (error) {
          console.error(`❌ Error in batch ${batchNum}:`, error.message);
          errors++;
        } else {
          imported += batch.length;
          console.log(`✅ Processed ${imported}/${transformedCities.length} records`);
        }
      } catch (err) {
        console.error(`❌ Exception in batch ${batchNum}:`, err.message);
        errors++;
      }
      
      processed += batch.length;
    }
    
    // Final verification
    console.log('\n📊 FINAL VERIFICATION:');
    console.log('======================');
    
    const { count: finalCount } = await supabase
      .from('psgc_cities_municipalities')
      .select('*', { count: 'exact' });
    
    // Get type breakdown
    const { data: finalCities } = await supabase
      .from('psgc_cities_municipalities')
      .select('type');
    
    const finalBreakdown = {};
    finalCities?.forEach(city => {
      finalBreakdown[city.type] = (finalBreakdown[city.type] || 0) + 1;
    });
    
    console.log(`Final database count: ${finalCount}`);
    console.log(`Official PSGC count: ${cityRecords.length}`);
    console.log(`Match status: ${finalCount === cityRecords.length ? '✅ PERFECT' : '⚠️  MISMATCH'}`);
    
    console.log('\nType breakdown:');
    Object.entries(finalBreakdown)
      .sort((a, b) => b[1] - a[1])
      .forEach(([type, count]) => {
        console.log(`  ${type}: ${count}`);
      });
    
    console.log('\n🎯 IMPORT SUMMARY:');
    console.log('==================');
    console.log(`✅ Records processed: ${processed}`);
    console.log(`✅ Records imported: ${imported}`);
    console.log(`❌ Batch errors: ${errors}`);
    console.log(`📊 Final count: ${finalCount}`);
    
    if (finalCount === 1656) {
      console.log('\n🎉 SUCCESS! Database now matches official PSGC 2Q 2025 data');
      console.log('✅ All 1,656 cities/municipalities imported');
      console.log('✅ Ready to import barangays with complete city coverage');
    } else {
      console.log(`\n⚠️  Count mismatch: expected 1,656, got ${finalCount}`);
      console.log('💡 Consider checking for data issues or running integrity check');
    }
    
  } catch (error) {
    console.error('❌ Import failed:', error.message);
    process.exit(1);
  }
}

// Run the import
if (require.main === module) {
  importOfficialCities();
}

module.exports = { importOfficialCities };