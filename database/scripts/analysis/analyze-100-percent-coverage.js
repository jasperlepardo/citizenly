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

async function getAllBarangays() {
  let allBarangays = [];
  let from = 0;
  const batchSize = 1000;
  
  while (true) {
    const { data: batch } = await supabase
      .from('psgc_barangays')
      .select('code, name, city_municipality_code')
      .range(from, from + batchSize - 1);
    
    if (!batch || batch.length === 0) break;
    
    allBarangays = allBarangays.concat(batch);
    from += batchSize;
    
    if (batch.length < batchSize) break;
  }
  
  return allBarangays;
}

function extractCityCode(psgcCode) {
  return psgcCode.substring(0, 6);
}

function extractBarangayCode(psgcCode) {
  return psgcCode.substring(0, 9);
}

async function analyze100PercentCoverage() {
  console.log('🎯 ANALYZING PATH TO 100% BARANGAY COVERAGE');
  console.log('==============================================\n');
  
  try {
    // Step 1: Load all data sources
    console.log('📊 Loading all data sources...');
    
    const [psgcData, csvBarangays, dbCities, dbBarangays] = await Promise.all([
      loadPSGCData(),
      loadCSV(BARANGAY_CSV_PATH),
      getAllCities(),
      getAllBarangays()
    ]);
    
    console.log(`✅ Official PSGC records: ${psgcData.length.toLocaleString()}`);
    console.log(`✅ CSV barangays: ${csvBarangays.length.toLocaleString()}`);
    console.log(`✅ Database cities: ${dbCities.length.toLocaleString()}`);
    console.log(`✅ Database barangays: ${dbBarangays.length.toLocaleString()}\n`);
    
    // Step 2: Analyze official PSGC barangays
    const officialBarangays = psgcData.filter(record => 
      record['Geographic Level'] === 'Bgy'
    );
    
    const officialTotal = officialBarangays.length;
    const currentTotal = dbBarangays.length;
    const gap = officialTotal - currentTotal;
    
    console.log('📈 COVERAGE ANALYSIS:');
    console.log('====================');
    console.log(`Official PSGC barangays: ${officialTotal.toLocaleString()}`);
    console.log(`Current database barangays: ${currentTotal.toLocaleString()}`);
    console.log(`Gap to 100%: ${gap.toLocaleString()} barangays`);
    console.log(`Current coverage: ${((currentTotal / officialTotal) * 100).toFixed(3)}%\n`);
    
    // Step 3: Find missing barangays
    console.log('🔍 IDENTIFYING MISSING BARANGAYS:');
    console.log('=================================');
    
    const dbBarangaySet = new Set(dbBarangays.map(b => b.code));
    const validCitySet = new Set(dbCities.map(c => c.code));
    
    const missingBarangays = [];
    const missingWithValidCities = [];
    const missingWithInvalidCities = [];
    
    officialBarangays.forEach(barangay => {
      const barangayCode = extractBarangayCode(barangay['10-digit PSGC']);
      const cityCode = extractCityCode(barangay['10-digit PSGC']);
      
      if (!dbBarangaySet.has(barangayCode)) {
        const missingBarangay = {
          code: barangayCode,
          name: barangay['Name'],
          cityCode: cityCode,
          psgcCode: barangay['10-digit PSGC'],
          urbanRural: barangay['Urban / Rural\\n(based on 2020 CPH)'] === 'U' ? 'Urban' : 'Rural',
          population: barangay[' 2020 Population '],
          hasValidCity: validCitySet.has(cityCode)
        };
        
        missingBarangays.push(missingBarangay);
        
        if (validCitySet.has(cityCode)) {
          missingWithValidCities.push(missingBarangay);
        } else {
          missingWithInvalidCities.push(missingBarangay);
        }
      }
    });
    
    console.log(`Total missing barangays: ${missingBarangays.length.toLocaleString()}`);
    console.log(`Missing with valid cities: ${missingWithValidCities.length.toLocaleString()}`);
    console.log(`Missing with invalid cities: ${missingWithInvalidCities.length.toLocaleString()}\n`);
    
    // Step 4: Analyze missing cities
    if (missingWithInvalidCities.length > 0) {
      console.log('🏙️ MISSING CITIES ANALYSIS:');
      console.log('===========================');
      
      const missingCities = new Map();
      
      missingWithInvalidCities.forEach(barangay => {
        if (!missingCities.has(barangay.cityCode)) {
          missingCities.set(barangay.cityCode, {
            code: barangay.cityCode,
            barangays: [],
            totalPopulation: 0
          });
        }
        
        const cityData = missingCities.get(barangay.cityCode);
        cityData.barangays.push(barangay);
        
        // Parse population (remove commas and convert)
        const pop = parseInt((barangay.population || '0').replace(/,/g, '')) || 0;
        cityData.totalPopulation += pop;
      });
      
      const sortedMissingCities = Array.from(missingCities.entries())
        .sort((a, b) => b[1].barangays.length - a[1].barangays.length);
      
      console.log(`Missing cities: ${missingCities.size}`);
      console.log('\\nTop 10 missing cities by barangay count:');
      sortedMissingCities.slice(0, 10).forEach(([cityCode, data], index) => {
        const sampleName = data.barangays[0]?.name || 'Unknown';
        console.log(`${index + 1}. ${cityCode}: ${data.barangays.length} barangays (pop: ${data.totalPopulation.toLocaleString()})`);
        console.log(`   Sample barangay: ${sampleName}`);
      });
      
      // Continue with action items after city analysis
    }
    
    // Step 5: Check CSV data for additional barangays
    console.log('\\n📄 CSV DATA ANALYSIS:');
    console.log('======================');
    
    const csvBarangaySet = new Set(csvBarangays.map(b => b.code));
    const csvMissingFromDB = csvBarangays.filter(b => !dbBarangaySet.has(b.code));
    const csvWithValidCities = csvMissingFromDB.filter(b => validCitySet.has(b.city_municipality_code));
    
    console.log(`CSV barangays missing from DB: ${csvMissingFromDB.length.toLocaleString()}`);
    console.log(`CSV missing with valid cities: ${csvWithValidCities.length.toLocaleString()}`);
    
    // Step 6: Create actionable plan
    console.log('\\n🎯 ACTIONABLE PLAN TO ACHIEVE 100%:');
    console.log('====================================');
    
    const actionItems = [];
    
    if (missingWithValidCities.length > 0) {
      actionItems.push({
        priority: 1,
        action: `Import ${missingWithValidCities.length.toLocaleString()} missing barangays with valid cities`,
        impact: `+${missingWithValidCities.length.toLocaleString()} barangays`,
        difficulty: 'Easy'
      });
    }
    
    if (csvWithValidCities.length > 0) {
      actionItems.push({
        priority: 2,
        action: `Import ${csvWithValidCities.length.toLocaleString()} CSV barangays with valid cities`,
        impact: `+${csvWithValidCities.length.toLocaleString()} barangays`,
        difficulty: 'Easy'
      });
    }
    
    if (missingCities.size > 0) {
      const topMissingCities = Array.from(missingCities.entries())
        .sort((a, b) => b[1].barangays.length - a[1].barangays.length)
        .slice(0, 10);
      
      const topCityBarangayCount = topMissingCities.reduce((sum, [_, data]) => sum + data.barangays.length, 0);
      
      actionItems.push({
        priority: 3,
        action: `Create top 10 missing cities`,
        impact: `+${topCityBarangayCount.toLocaleString()} barangays`,
        difficulty: 'Moderate'
      });
      
      actionItems.push({
        priority: 4,
        action: `Create all ${missingCities.size} missing cities`,
        impact: `+${missingWithInvalidCities.length.toLocaleString()} barangays`,
        difficulty: 'Complex'
      });
    }
    
    console.log('Priority actions:');
    actionItems.forEach((item, index) => {
      console.log(`\\n${item.priority}. ${item.action}`);
      console.log(`   Impact: ${item.impact}`);
      console.log(`   Difficulty: ${item.difficulty}`);
    });
    
    // Step 7: Calculate potential outcomes
    console.log('\\n📊 POTENTIAL OUTCOMES:');
    console.log('=======================');
    
    const quickWins = missingWithValidCities.length + csvWithValidCities.length;
    const afterQuickWins = currentTotal + quickWins;
    const quickWinsCoverage = ((afterQuickWins / officialTotal) * 100).toFixed(3);
    
    console.log(`After quick wins (valid cities): ${afterQuickWins.toLocaleString()} barangays`);
    console.log(`Coverage after quick wins: ${quickWinsCoverage}%`);
    
    if (missingCities.size > 0) {
      const afterAllCities = afterQuickWins + missingWithInvalidCities.length;
      const fullCoverage = ((afterAllCities / officialTotal) * 100).toFixed(3);
      
      console.log(`After creating all missing cities: ${afterAllCities.toLocaleString()} barangays`);
      console.log(`Coverage after all cities: ${fullCoverage}%`);
    }
    
    console.log('\\n💡 IMMEDIATE RECOMMENDATION:');
    console.log('=============================');
    if (quickWins > 0) {
      console.log(`Start with importing ${quickWins.toLocaleString()} barangays with valid cities`);
      console.log(`This will achieve ${quickWinsCoverage}% coverage immediately`);
    } else {
      console.log('Focus on creating missing cities to unlock more barangays');
    }
    
    // Step 8: Save missing data for import
    if (missingWithValidCities.length > 0) {
      const outputFile = path.join(__dirname, 'missing-barangays-ready-to-import.json');
      fs.writeFileSync(outputFile, JSON.stringify(missingWithValidCities, null, 2));
      console.log(`\\n💾 Saved ${missingWithValidCities.length} importable barangays to: missing-barangays-ready-to-import.json`);
    }
    
    if (missingCities.size > 0) {
      const cityOutputFile = path.join(__dirname, 'missing-cities-for-creation.json');
      const cityData = Array.from(missingCities.entries()).map(([code, data]) => ({
        code,
        barangayCount: data.barangays.length,
        totalPopulation: data.totalPopulation,
        sampleBarangays: data.barangays.slice(0, 3)
      }));
      fs.writeFileSync(cityOutputFile, JSON.stringify(cityData, null, 2));
      console.log(`💾 Saved ${missingCities.size} missing cities to: missing-cities-for-creation.json`);
    }
    
    console.log('\\n🎯 READY TO PROCEED TO 100% COVERAGE!');
    
  } catch (error) {
    console.error('❌ Analysis failed:', error.message);
    process.exit(1);
  }
}

// Run the analysis
if (require.main === module) {
  analyze100PercentCoverage();
}

module.exports = { analyze100PercentCoverage };