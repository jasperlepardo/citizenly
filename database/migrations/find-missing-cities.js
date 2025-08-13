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
  return psgcCode.substring(0, 6);
}

async function findMissingCities() {
  console.log('🔍 FINDING MISSING CITIES FROM OFFICIAL PSGC');
  console.log('=============================================\n');
  
  try {
    // Load official PSGC data
    console.log('📄 Loading official PSGC data...');
    const psgcData = await loadPSGCData();
    
    // Filter for cities, municipalities, and sub-municipalities
    const officialCities = psgcData
      .filter(record => ['City', 'Mun', 'SubMun'].includes(record['Geographic Level']))
      .map(record => ({
        code: extractCityCode(record['10-digit PSGC']),
        name: record['Name'],
        level: record['Geographic Level'],
        cityClass: record['City Class'] || '',
        psgcCode: record['10-digit PSGC']
      }));
    
    console.log(`✅ Found ${officialCities.length} official cities/municipalities\n`);
    
    // Get current database cities
    console.log('📊 Getting current database cities...');
    const { data: dbCities } = await supabase
      .from('psgc_cities_municipalities')
      .select('code, name');
    
    console.log(`✅ Found ${dbCities?.length || 0} cities in database\n`);
    
    // Create sets for comparison
    const officialCodes = new Set(officialCities.map(c => c.code));
    const dbCodes = new Set(dbCities?.map(c => c.code) || []);
    
    // Find missing cities (in official but not in database)
    const missingCities = officialCities.filter(city => !dbCodes.has(city.code));
    
    // Find extra cities (in database but not in official)
    const extraCities = dbCities?.filter(city => !officialCodes.has(city.code)) || [];
    
    console.log('🔍 COMPARISON RESULTS:');
    console.log('======================');
    console.log(`Official PSGC cities: ${officialCities.length}`);
    console.log(`Database cities: ${dbCities?.length || 0}`);
    console.log(`Missing cities: ${missingCities.length}`);
    console.log(`Extra cities: ${extraCities.length}\n`);
    
    if (missingCities.length > 0) {
      console.log('❌ MISSING CITIES (in official PSGC but not in database):');
      console.log('='.repeat(60));
      missingCities
        .slice(0, 20) // Show first 20
        .forEach((city, index) => {
          console.log(`${(index + 1).toString().padStart(2)}. ${city.code} - ${city.name} (${city.level})`);
        });
      
      if (missingCities.length > 20) {
        console.log(`... and ${missingCities.length - 20} more cities`);
      }
      
      // Group missing cities by type
      const missingByType = {};
      missingCities.forEach(city => {
        const type = city.level;
        missingByType[type] = (missingByType[type] || 0) + 1;
      });
      
      console.log('\nMissing cities by type:');
      Object.entries(missingByType).forEach(([type, count]) => {
        const name = type === 'City' ? 'Cities' : 
                     type === 'Mun' ? 'Municipalities' : 
                     'Sub-Municipalities';
        console.log(`  ${name}: ${count}`);
      });
    }
    
    if (extraCities.length > 0) {
      console.log('\n➕ EXTRA CITIES (in database but not in official PSGC):');
      console.log('='.repeat(60));
      extraCities
        .slice(0, 20) // Show first 20
        .forEach((city, index) => {
          console.log(`${(index + 1).toString().padStart(2)}. ${city.code} - ${city.name}`);
        });
      
      if (extraCities.length > 20) {
        console.log(`... and ${extraCities.length - 20} more cities`);
      }
    }
    
    console.log('\n💡 RECOMMENDATIONS:');
    console.log('===================');
    
    if (missingCities.length > 0) {
      console.log(`1. Import ${missingCities.length} missing cities from official PSGC`);
      
      // Save missing cities to file for import
      const missingForImport = missingCities.map(city => ({
        code: city.code,
        name: city.name,
        psgcCode: city.psgcCode,
        level: city.level,
        cityClass: city.cityClass
      }));
      
      const outputFile = path.join(__dirname, 'missing-cities.json');
      fs.writeFileSync(outputFile, JSON.stringify(missingForImport, null, 2));
      console.log(`   Saved details to: missing-cities.json`);
    }
    
    if (extraCities.length > 0) {
      console.log(`2. Review ${extraCities.length} extra cities - may need removal`);
    }
    
    if (missingCities.length === 0 && extraCities.length === 0) {
      console.log('✅ Perfect match! Database contains exactly the official PSGC cities.');
    }
    
  } catch (error) {
    console.error('❌ Error finding missing cities:', error.message);
    process.exit(1);
  }
}

// Run the analysis
if (require.main === module) {
  findMissingCities();
}

module.exports = { findMissingCities };