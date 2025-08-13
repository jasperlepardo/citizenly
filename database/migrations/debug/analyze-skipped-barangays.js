#!/usr/bin/env node

const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');

const DATA_PATH = '../sample data/psgc/updated';

async function loadCSV(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', reject);
  });
}

async function analyzeSkipped() {
  console.log('🔍 COMPREHENSIVE ANALYSIS OF SKIPPED BARANGAYS');
  console.log('===============================================\n');
  
  try {
    // Load data
    const barangaysPath = path.join(__dirname, DATA_PATH, 'psgc_barangays.updated.csv');
    const citiesPath = path.join(__dirname, DATA_PATH, 'psgc_cities_municipalities.updated.fixed.csv');
    
    console.log('📄 Loading data files...');
    const barangays = await loadCSV(barangaysPath);
    const cities = await loadCSV(citiesPath);
    
    console.log(`✅ Loaded ${barangays.length} barangays`);
    console.log(`✅ Loaded ${cities.length} cities\n`);
    
    // Create set of valid city codes
    const validCityCodes = new Set(cities.map(city => city.code));
    
    // Find skipped barangays
    const skipped = barangays.filter(b => !validCityCodes.has(b.city_municipality_code));
    const imported = barangays.filter(b => validCityCodes.has(b.city_municipality_code));
    
    console.log('📊 MIGRATION SUMMARY:');
    console.log('=====================');
    console.log(`Total barangays in CSV: ${barangays.length}`);
    console.log(`✅ Imported barangays: ${imported.length} (${((imported.length / barangays.length) * 100).toFixed(1)}%)`);
    console.log(`⚠️  Skipped barangays: ${skipped.length} (${((skipped.length / barangays.length) * 100).toFixed(1)}%)\n`);
    
    // Group by missing city code
    const groupedByCity = {};
    skipped.forEach(b => {
      const cityCode = b.city_municipality_code;
      if (!groupedByCity[cityCode]) {
        groupedByCity[cityCode] = [];
      }
      groupedByCity[cityCode].push(b);
    });
    
    console.log(`🏙️ MISSING CITIES: ${Object.keys(groupedByCity).length} unique city codes`);
    console.log('='.repeat(60));
    
    const sortedCities = Object.entries(groupedByCity)
      .sort((a, b) => b[1].length - a[1].length);
    
    // Show top 20 missing cities
    console.log('\n🔝 TOP 20 MISSING CITIES BY BARANGAY COUNT:');
    console.log('==========================================');
    sortedCities.slice(0, 20).forEach(([cityCode, barangays], index) => {
      console.log(`${(index + 1).toString().padStart(2)}. ${cityCode}: ${barangays.length.toString().padStart(3)} barangays`);
      console.log(`    Sample: ${barangays.slice(0, 3).map(b => b.name).join(', ')}${barangays.length > 3 ? '...' : ''}`);
    });
    
    // Analyze patterns
    console.log('\n🔍 MISSING CITY CODE PATTERNS:');
    console.log('==============================');
    const patterns = {};
    Object.keys(groupedByCity).forEach(code => {
      const pattern = code.substring(0, 4);
      patterns[pattern] = (patterns[pattern] || 0) + 1;
    });
    
    const sortedPatterns = Object.entries(patterns)
      .sort((a, b) => b[1] - a[1]);
    
    sortedPatterns.forEach(([pattern, count]) => {
      const totalBarangays = Object.keys(groupedByCity)
        .filter(code => code.startsWith(pattern))
        .reduce((sum, code) => sum + groupedByCity[code].length, 0);
      console.log(`${pattern}xx: ${count.toString().padStart(2)} cities, ${totalBarangays.toString().padStart(4)} barangays`);
    });
    
    // Detailed breakdown of major missing areas
    console.log('\n📍 DETAILED BREAKDOWN OF MAJOR MISSING AREAS:');
    console.log('==============================================');
    
    const majorPatterns = sortedPatterns.slice(0, 5);
    majorPatterns.forEach(([pattern, count]) => {
      console.log(`\n🌍 Pattern ${pattern}xx (${count} cities):`);
      console.log('-'.repeat(40));
      
      const patternCities = Object.entries(groupedByCity)
        .filter(([code]) => code.startsWith(pattern))
        .sort((a, b) => b[1].length - a[1].length)
        .slice(0, 10);
      
      patternCities.forEach(([cityCode, barangays], index) => {
        console.log(`  ${(index + 1).toString().padStart(2)}. ${cityCode}: ${barangays.length} barangays`);
      });
      
      if (Object.keys(groupedByCity).filter(code => code.startsWith(pattern)).length > 10) {
        console.log(`  ... and ${Object.keys(groupedByCity).filter(code => code.startsWith(pattern)).length - 10} more cities`);
      }
    });
    
    // Regional impact analysis
    console.log('\n🗺️  REGIONAL IMPACT ANALYSIS:');
    console.log('=============================');
    
    const regionPatterns = {
      '1339': 'Metro Manila (NCR)',
      '0864': 'Southern Leyte',
      '0878': 'Biliran',
      '0972': 'Zamboanga del Norte',
      '0973': 'Zamboanga del Sur',
      '1247': 'North Cotabato',
      '1536': 'Lanao del Sur',
      '1538': 'Maguindanao del Sur'
    };
    
    Object.entries(regionPatterns).forEach(([pattern, region]) => {
      const matchingCities = Object.keys(groupedByCity).filter(code => code.startsWith(pattern));
      if (matchingCities.length > 0) {
        const totalBarangays = matchingCities.reduce((sum, code) => sum + groupedByCity[code].length, 0);
        console.log(`${region.padEnd(25)}: ${matchingCities.length.toString().padStart(2)} cities, ${totalBarangays.toString().padStart(4)} barangays`);
      }
    });
    
    console.log('\n💡 RECOMMENDATIONS:');
    console.log('==================');
    console.log('1. Create missing Metro Manila cities (133901-133914) for NCR coverage');
    console.log('2. Add missing cities in Zamboanga provinces for Mindanao coverage');
    console.log('3. Complete BARMM cities (1536xx, 1538xx) for Muslim Mindanao');
    console.log('4. Add missing Southern Leyte and Biliran municipalities');
    console.log('5. Import remaining North Cotabato municipalities');
    
    console.log(`\n✅ Analysis complete! ${skipped.length} barangays skipped due to ${Object.keys(groupedByCity).length} missing cities.`);
    
  } catch (error) {
    console.error('❌ Error during analysis:', error);
  }
}

// Run the analysis
if (require.main === module) {
  analyzeSkipped();
}

module.exports = { analyzeSkipped };