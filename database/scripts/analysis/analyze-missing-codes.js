#!/usr/bin/env node

/**
 * Analyze Missing Codes from Barangay Migration
 * Identifies what city codes are missing and provides details
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
const BARANGAY_CSV = path.join(DATA_DIR, 'psgc_barangays.csv');
const CITIES_CSV = path.join(DATA_DIR, 'psgc_cities_municipalities.csv');

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

async function analyzeMissingCodes() {
  console.log('🔍 ANALYZING MISSING CITY CODES');
  console.log('===============================\n');
  
  try {
    // Step 1: Load CSV data
    console.log('📄 Loading CSV data...');
    const csvBarangays = await readCSV(BARANGAY_CSV);
    const csvCities = await readCSV(CITIES_CSV);
    
    console.log(`✅ Loaded ${csvBarangays.length.toLocaleString()} barangays from CSV`);
    console.log(`✅ Loaded ${csvCities.length.toLocaleString()} cities from CSV`);
    
    // Step 2: Get current database cities
    console.log('\n📊 Getting current database cities...');
    const { data: dbCities } = await supabase
      .from('psgc_cities_municipalities')
      .select('code, name, type');
    
    console.log(`✅ Current cities in database: ${dbCities.length.toLocaleString()}`);
    
    // Step 3: Analyze missing city codes
    const dbCityCodes = new Set(dbCities.map(c => c.code));
    const csvCityCodes = new Set(csvCities.map(c => c.code));
    const barangayReferencedCityCodes = new Set(csvBarangays.map(b => b.city_municipality_code));
    
    // Find missing cities that are referenced by barangays
    const missingCityCodes = Array.from(barangayReferencedCityCodes)
      .filter(code => !dbCityCodes.has(code))
      .sort();
    
    console.log(`\n📊 MISSING CITY CODES ANALYSIS`);
    console.log(`==============================`);
    console.log(`Total unique city codes referenced by barangays: ${barangayReferencedCityCodes.size.toLocaleString()}`);
    console.log(`Cities in database: ${dbCityCodes.size.toLocaleString()}`);
    console.log(`Missing city codes: ${missingCityCodes.length.toLocaleString()}`);
    
    // Step 4: Categorize missing codes
    const missingDetails = [];
    const availableInCSV = [];
    const notInCSV = [];
    
    missingCityCodes.forEach(code => {
      const csvCity = csvCities.find(c => c.code === code);
      const barangayCount = csvBarangays.filter(b => b.city_municipality_code === code).length;
      
      const detail = {
        code,
        name: csvCity?.name || 'Unknown',
        type: csvCity?.type || 'Unknown',
        province_code: csvCity?.province_code || 'Unknown',
        barangay_count: barangayCount,
        available_in_csv: !!csvCity
      };
      
      missingDetails.push(detail);
      
      if (csvCity) {
        availableInCSV.push(detail);
      } else {
        notInCSV.push(detail);
      }
    });
    
    console.log(`\n📋 MISSING CODES BREAKDOWN:`);
    console.log(`Available in cities CSV: ${availableInCSV.length} (can be imported)`);
    console.log(`Not in cities CSV: ${notInCSV.length} (need investigation)`);
    
    // Step 5: Show top missing codes by barangay count
    console.log(`\n🔝 TOP 20 MISSING CODES BY BARANGAY COUNT:`);
    console.log(`==========================================`);
    
    const sortedByBarangayCount = missingDetails
      .sort((a, b) => b.barangay_count - a.barangay_count)
      .slice(0, 20);
    
    sortedByBarangayCount.forEach((city, index) => {
      const status = city.available_in_csv ? '✅ Available' : '❌ Missing';
      console.log(`${index + 1}. ${city.code} - ${city.name} (${city.type})`);
      console.log(`   Province: ${city.province_code} | Barangays: ${city.barangay_count} | ${status}`);
    });
    
    // Step 6: Show missing codes by province
    console.log(`\n🗺️  MISSING CODES BY PROVINCE:`);
    console.log(`=============================`);
    
    const byProvince = {};
    missingDetails.forEach(city => {
      const province = city.province_code;
      if (!byProvince[province]) {
        byProvince[province] = { cities: [], barangays: 0, available: 0 };
      }
      byProvince[province].cities.push(city);
      byProvince[province].barangays += city.barangay_count;
      if (city.available_in_csv) byProvince[province].available++;
    });
    
    Object.entries(byProvince)
      .sort(([,a], [,b]) => b.barangays - a.barangays)
      .slice(0, 15)
      .forEach(([province, data]) => {
        console.log(`${province}: ${data.cities.length} cities, ${data.barangays} barangays (${data.available} available in CSV)`);
      });
    
    // Step 7: Calculate impact
    const totalMissingBarangays = missingDetails.reduce((sum, city) => sum + city.barangay_count, 0);
    const availableBarangays = availableInCSV.reduce((sum, city) => sum + city.barangay_count, 0);
    
    console.log(`\n📊 IMPACT ANALYSIS:`);
    console.log(`==================`);
    console.log(`Total barangays affected: ${totalMissingBarangays.toLocaleString()}`);
    console.log(`Barangays recoverable (cities in CSV): ${availableBarangays.toLocaleString()}`);
    console.log(`Barangays lost (cities not in CSV): ${(totalMissingBarangays - availableBarangays).toLocaleString()}`);
    
    const recoverablePercentage = Math.round((availableBarangays / totalMissingBarangays) * 100);
    console.log(`Recovery potential: ${recoverablePercentage}%`);
    
    // Step 8: Generate import candidates
    console.log(`\n🎯 IMPORT CANDIDATES (Cities available in CSV):`);
    console.log(`==============================================`);
    
    const topCandidates = availableInCSV
      .sort((a, b) => b.barangay_count - a.barangay_count)
      .slice(0, 10);
    
    topCandidates.forEach((city, index) => {
      console.log(`${index + 1}. ${city.code} - ${city.name}`);
      console.log(`   Type: ${city.type} | Province: ${city.province_code} | Barangays: ${city.barangay_count}`);
    });
    
    // Step 9: Show specific examples of the codes you mentioned
    console.log(`\n🔍 SPECIFIC CODE ANALYSIS:`);
    console.log(`=========================`);
    
    const specificCodes = ['074601', '086416', '0746'];
    specificCodes.forEach(code => {
      const detail = missingDetails.find(d => d.code === code);
      const csvCity = csvCities.find(c => c.code === code);
      
      if (detail) {
        console.log(`${code}: ${detail.name} (${detail.type})`);
        console.log(`   Province: ${detail.province_code} | Barangays: ${detail.barangay_count}`);
        console.log(`   Available in CSV: ${detail.available_in_csv ? 'Yes' : 'No'}`);
      } else if (csvCity) {
        console.log(`${code}: ${csvCity.name} (${csvCity.type}) - In CSV but no barangays reference it`);
      } else {
        console.log(`${code}: Not found in any data`);
      }
    });
    
    return {
      totalMissing: missingCityCodes.length,
      availableInCSV: availableInCSV.length,
      totalMissingBarangays,
      availableBarangays,
      topCandidates
    };
    
  } catch (error) {
    console.log(`❌ Analysis failed: ${error.message}`);
    return null;
  }
}

async function main() {
  const results = await analyzeMissingCodes();
  
  if (results) {
    console.log(`\n✅ ANALYSIS COMPLETED`);
    console.log(`====================`);
    console.log(`🎯 Summary: ${results.totalMissing} missing city codes`);
    console.log(`📈 Recovery potential: ${results.availableInCSV} cities (${results.availableBarangays.toLocaleString()} barangays)`);
    console.log(`💡 Recommendation: Import the top candidate cities to maximize barangay coverage`);
  }
}

// Run the analysis
if (require.main === module) {
  main();
}

module.exports = { main };