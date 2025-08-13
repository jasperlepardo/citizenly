#!/usr/bin/env node

/**
 * Analyze Remaining Missing Cities
 * Shows which cities are still missing after the import attempts
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

async function analyzeRemainingMissingCities() {
  console.log('🔍 ANALYZING REMAINING MISSING CITIES');
  console.log('====================================\n');
  
  try {
    // Load data
    console.log('📄 Loading data from CSV files...');
    const csvCities = await readCSV(CITIES_CSV);
    const csvBarangays = await readCSV(BARANGAY_CSV);
    
    console.log(`✅ Loaded ${csvCities.length.toLocaleString()} cities from CSV`);
    console.log(`✅ Loaded ${csvBarangays.length.toLocaleString()} barangays from CSV`);
    
    // Get current database cities
    console.log('\n📊 Getting current database cities...');
    const { data: dbCities } = await supabase
      .from('psgc_cities_municipalities')
      .select('code, name, type');
    
    console.log(`✅ Current cities in database: ${dbCities.length.toLocaleString()}`);
    
    // Find cities referenced by barangays but not in database
    const dbCityCodes = new Set(dbCities.map(c => c.code));
    const barangayReferencedCityCodes = new Set(csvBarangays.map(b => b.city_municipality_code));
    const missingCityCodes = Array.from(barangayReferencedCityCodes).filter(code => !dbCityCodes.has(code));
    
    console.log(`\n📊 REMAINING MISSING CITIES ANALYSIS`);
    console.log(`===================================`);
    console.log(`Total cities still missing: ${missingCityCodes.length.toLocaleString()}`);
    
    if (missingCityCodes.length === 0) {
      console.log('\n🎉 EXCELLENT! No cities are missing. All barangays can now be imported!');
      return;
    }
    
    // Get details for missing cities
    const missingCityDetails = missingCityCodes.map(code => {
      const csvCity = csvCities.find(c => c.code === code);
      const barangayCount = csvBarangays.filter(b => b.city_municipality_code === code).length;
      
      return {
        code,
        name: csvCity?.name || 'Unknown',
        type: csvCity?.type || 'Unknown', 
        province_code: csvCity?.province_code || 'Unknown',
        is_independent: csvCity?.is_independent,
        barangay_count: barangayCount,
        available_in_csv: !!csvCity
      };
    }).sort((a, b) => b.barangay_count - a.barangay_count);
    
    console.log('\n🔝 TOP 20 MISSING CITIES BY BARANGAY IMPACT:');
    console.log('===========================================');
    
    missingCityDetails.slice(0, 20).forEach((city, index) => {
      const independence = city.is_independent === 'true' ? 'Independent' : 'Regular';
      const available = city.available_in_csv ? '✅ Available' : '❌ Not in CSV';
      console.log(`${index + 1}. ${city.code} - ${city.name} (${city.type})`);
      console.log(`   Province: ${city.province_code} | ${independence} | Barangays: ${city.barangay_count} | ${available}`);
    });
    
    // Group by province to see which provinces are missing
    const byProvince = {};
    missingCityDetails.forEach(city => {
      const province = city.province_code;
      if (!byProvince[province]) {
        byProvince[province] = { cities: [], totalBarangays: 0 };
      }
      byProvince[province].cities.push(city);
      byProvince[province].totalBarangays += city.barangay_count;
    });
    
    console.log('\n🗺️  MISSING CITIES BY PROVINCE:');
    console.log('===============================');
    
    Object.entries(byProvince)
      .sort(([,a], [,b]) => b.totalBarangays - a.totalBarangays)
      .slice(0, 10)
      .forEach(([province, data]) => {
        console.log(`${province}: ${data.cities.length} cities, ${data.totalBarangays} barangays`);
        data.cities.slice(0, 3).forEach(city => {
          console.log(`   • ${city.code} - ${city.name} (${city.barangay_count} barangays)`);
        });
        if (data.cities.length > 3) {
          console.log(`   ... and ${data.cities.length - 3} more cities`);
        }
      });
    
    // Check which provinces are missing from database
    console.log('\n🔍 CHECKING MISSING PROVINCES:');
    console.log('=============================');
    
    const { data: dbProvinces } = await supabase
      .from('psgc_provinces')
      .select('code, name');
    
    const dbProvinceCodes = new Set(dbProvinces.map(p => p.code));
    const missingProvinces = Array.from(new Set(missingCityDetails.map(c => c.province_code)))
      .filter(code => code !== 'Unknown' && !dbProvinceCodes.has(code));
    
    if (missingProvinces.length > 0) {
      console.log(`Missing provinces that need to be created: ${missingProvinces.length}`);
      missingProvinces.forEach(provinceCode => {
        const citiesInProvince = missingCityDetails.filter(c => c.province_code === provinceCode);
        const totalBarangays = citiesInProvince.reduce((sum, c) => sum + c.barangay_count, 0);
        console.log(`   ${provinceCode}: ${citiesInProvince.length} cities, ${totalBarangays} barangays`);
      });
    } else {
      console.log('✅ All required provinces exist in database');
    }
    
    // Show specific problematic cases
    console.log('\n🚨 SPECIFIC ISSUES TO RESOLVE:');
    console.log('=============================');
    
    const independentCitiesWithProvinces = missingCityDetails.filter(c => 
      c.is_independent === 'true' && c.province_code && c.province_code !== 'Unknown'
    );
    
    if (independentCitiesWithProvinces.length > 0) {
      console.log(`Independent cities with province codes (should be null): ${independentCitiesWithProvinces.length}`);
      independentCitiesWithProvinces.slice(0, 5).forEach(city => {
        console.log(`   ${city.code} - ${city.name} (Province: ${city.province_code})`);
      });
    }
    
    const citiesWithMissingProvinces = missingCityDetails.filter(c => 
      c.is_independent !== 'true' && !dbProvinceCodes.has(c.province_code)
    );
    
    if (citiesWithMissingProvinces.length > 0) {
      console.log(`\nCities with missing provinces: ${citiesWithMissingProvinces.length}`);
      citiesWithMissingProvinces.slice(0, 5).forEach(city => {
        console.log(`   ${city.code} - ${city.name} (Missing province: ${city.province_code})`);
      });
    }
    
    const totalMissingBarangays = missingCityDetails.reduce((sum, city) => sum + city.barangay_count, 0);
    
    console.log('\n📊 FINAL IMPACT ASSESSMENT:');
    console.log('===========================');
    console.log(`Cities still missing: ${missingCityCodes.length.toLocaleString()}`);
    console.log(`Barangays still blocked: ${totalMissingBarangays.toLocaleString()}`);
    console.log(`Cities available in CSV: ${missingCityDetails.filter(c => c.available_in_csv).length}`);
    console.log(`Recovery potential: ${Math.round((missingCityDetails.filter(c => c.available_in_csv).length / missingCityDetails.length) * 100)}%`);
    
    console.log('\n💡 RECOMMENDATIONS:');
    console.log('==================');
    
    if (missingProvinces.length > 0) {
      console.log('1. Create missing provinces first:');
      missingProvinces.forEach(code => console.log(`   - Province ${code}`));
    }
    
    if (independentCitiesWithProvinces.length > 0) {
      console.log('2. Fix independent cities by nullifying their province codes');
    }
    
    console.log('3. Re-run city import after fixing province issues');
    console.log('4. Finally run barangay import to capture remaining barangays');
    
  } catch (error) {
    console.log(`❌ Analysis failed: ${error.message}`);
    console.error(error);
  }
}

async function main() {
  await analyzeRemainingMissingCities();
}

// Run the analysis
if (require.main === module) {
  main();
}

module.exports = { main };