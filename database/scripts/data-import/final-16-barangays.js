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

function extractBarangayCode(psgcCode) {
  return psgcCode.substring(0, 9);
}

function extractCityCode(psgcCode) {
  return psgcCode.substring(0, 6);
}

async function findFinal16Barangays() {
  console.log('🎯 HUNTING FOR THE FINAL 16 BARANGAYS TO 100%');
  console.log('==============================================\n');
  
  try {
    console.log('📊 Loading all data...');
    const [psgcData, dbBarangays, dbCities] = await Promise.all([
      loadPSGCData(),
      getAllBarangays(),
      getAllCities()
    ]);
    
    const officialBarangays = psgcData.filter(record => 
      record['Geographic Level'] === 'Bgy'
    );
    
    console.log(`✅ Official PSGC barangays: ${officialBarangays.length.toLocaleString()}`);
    console.log(`✅ Database barangays: ${dbBarangays.length.toLocaleString()}`);
    console.log(`✅ Gap: ${officialBarangays.length - dbBarangays.length} barangays\n`);
    
    // Create sets for efficient lookup
    const dbBarangaySet = new Set(dbBarangays.map(b => b.code));
    const validCitySet = new Set(dbCities.map(c => c.code));
    
    console.log('🔍 Finding exact missing barangays...');
    
    const missingBarangays = [];
    const possibleToImport = [];
    
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
          possibleToImport.push({
            code: barangayCode,
            name: barangay['Name'],
            city_municipality_code: cityCode,
            urban_rural_status: barangay['Urban / Rural\\n(based on 2020 CPH)'] === 'U' ? 'Urban' : 'Rural'
          });
        }
      }
    });
    
    console.log(`📊 Total missing barangays: ${missingBarangays.length.toLocaleString()}`);
    console.log(`✅ Ready to import (valid cities): ${possibleToImport.length.toLocaleString()}\n`);
    
    if (possibleToImport.length > 0) {
      console.log('🎯 IMPORTABLE BARANGAYS:');
      console.log('========================');
      
      possibleToImport.slice(0, 20).forEach((barangay, index) => {
        console.log(`${index + 1}. ${barangay.code} - ${barangay.name} (City: ${barangay.city_municipality_code})`);
      });
      
      if (possibleToImport.length > 20) {
        console.log(`... and ${possibleToImport.length - 20} more barangays`);
      }
      
      console.log('\\n🚀 IMPORTING THE MISSING BARANGAYS...');
      
      // Import the missing barangays
      const batchSize = 100;
      let imported = 0;
      let errors = 0;
      
      for (let i = 0; i < possibleToImport.length; i += batchSize) {
        const batch = possibleToImport.slice(i, i + batchSize);
        
        try {
          const { error } = await supabase
            .from('psgc_barangays')
            .upsert(batch, { onConflict: 'code' });
          
          if (error) {
            console.error(`❌ Error importing batch:`, error.message);
            errors++;
          } else {
            imported += batch.length;
            console.log(`✅ Imported ${imported}/${possibleToImport.length} barangays`);
          }
        } catch (err) {
          console.error(`❌ Exception:`, err.message);
          errors++;
        }
      }
      
      // Final verification
      const { count: finalCount } = await supabase
        .from('psgc_barangays')
        .select('*', { count: 'exact' });
      
      const finalCoverage = ((finalCount / officialBarangays.length) * 100).toFixed(6);
      
      console.log('\\n🎉 FINAL RESULTS:');
      console.log('==================');
      console.log(`Final barangay count: ${finalCount.toLocaleString()}`);
      console.log(`Official total: ${officialBarangays.length.toLocaleString()}`);
      console.log(`Coverage: ${finalCoverage}%`);
      console.log(`Import errors: ${errors}`);
      
      if (finalCount === officialBarangays.length) {
        console.log('\\n🏆 PERFECT! 100.000000% COVERAGE ACHIEVED!');
        console.log('🌟 COMPLETE PHILIPPINE BARANGAY DATABASE!');
      } else if (finalCount >= 42000) {
        console.log('\\n🥇 OUTSTANDING! Near-perfect coverage achieved!');
      } else {
        console.log('\\n📈 Progress made towards 100% coverage');
      }
      
    } else {
      console.log('💡 All missing barangays require creating new cities first');
      
      // Analyze the missing cities
      const missingCityCodes = new Set();
      missingBarangays.forEach(b => {
        if (!b.hasValidCity) {
          missingCityCodes.add(b.cityCode);
        }
      });
      
      console.log(`\\nMissing cities needed: ${missingCityCodes.size}`);
      console.log('Top missing city codes:');
      Array.from(missingCityCodes).slice(0, 10).forEach((code, index) => {
        const barangayCount = missingBarangays.filter(b => b.cityCode === code).length;
        console.log(`${index + 1}. ${code}: ${barangayCount} barangays`);
      });
    }
    
  } catch (error) {
    console.error('❌ Analysis failed:', error.message);
  }
}

// Run the final hunt
if (require.main === module) {
  findFinal16Barangays();
}

module.exports = { findFinal16Barangays };