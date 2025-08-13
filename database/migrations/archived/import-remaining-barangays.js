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

async function importRemainingBarangays() {
  console.log('🏘️ IMPORTING REMAINING METRO MANILA BARANGAYS');
  console.log('===============================================\n');
  
  try {
    // Get current valid city codes (get all cities, not limited)
    console.log('📊 Getting current valid cities...');
    const { data: validCities } = await supabase
      .from('psgc_cities_municipalities')
      .select('code, name');
    
    const validCityCodes = new Set(validCities.map(city => city.code));
    console.log(`✅ Found ${validCityCodes.size} valid cities`);
    
    // Check specifically for Metro Manila cities
    const metroCities = validCities.filter(city => city.code.startsWith('1339'));
    console.log(`🏛️ Metro Manila cities available: ${metroCities.length}`);
    metroCities.forEach(city => {
      console.log(`  ${city.code} - ${city.name}`);
    });
    console.log('');
    
    // Load barangay data
    console.log('📄 Loading barangay data...');
    const filePath = path.join(__dirname, DATA_PATH, 'psgc_barangays.updated.csv');
    const allBarangays = await loadCSV(filePath);
    console.log(`✅ Loaded ${allBarangays.length} barangays from CSV\n`);
    
    // Filter for Metro Manila barangays (133901-133914)
    const metroManilaBarangays = allBarangays.filter(b => 
      b.city_municipality_code.startsWith('1339')
    );
    
    console.log(`🏛️ Metro Manila barangays found: ${metroManilaBarangays.length}`);
    
    // Check which ones can now be imported
    const importableBarangays = metroManilaBarangays.filter(b => 
      validCityCodes.has(b.city_municipality_code)
    );
    
    console.log(`✅ Can now import: ${importableBarangays.length} barangays`);
    console.log(`⚠️  Still missing cities for: ${metroManilaBarangays.length - importableBarangays.length} barangays\n`);
    
    if (importableBarangays.length === 0) {
      console.log('❌ No new barangays to import. All Metro Manila cities may already be covered.');
      return;
    }
    
    // Show breakdown by city
    const breakdown = {};
    importableBarangays.forEach(b => {
      const cityCode = b.city_municipality_code;
      if (!breakdown[cityCode]) {
        breakdown[cityCode] = [];
      }
      breakdown[cityCode].push(b);
    });
    
    console.log('📋 BREAKDOWN BY SUB-MUNICIPALITY:');
    console.log('-'.repeat(50));
    Object.entries(breakdown)
      .sort((a, b) => b[1].length - a[1].length)
      .forEach(([cityCode, barangays]) => {
        // Get city name
        const cityData = validCities.find(c => c.code === cityCode);
        console.log(`${cityCode}: ${barangays.length} barangays`);
      });
    
    console.log(`\n🚀 Starting import of ${importableBarangays.length} barangays...\n`);
    
    // Import in batches
    const batchSize = 500;
    let imported = 0;
    let errors = 0;
    
    for (let i = 0; i < importableBarangays.length; i += batchSize) {
      const batch = importableBarangays.slice(i, i + batchSize);
      
      console.log(`📦 Processing batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(importableBarangays.length/batchSize)} (${batch.length} records)...`);
      
      const { data, error } = await supabase
        .from('psgc_barangays')
        .upsert(batch, { onConflict: 'code' });
      
      if (error) {
        console.error(`❌ Error in batch ${i}-${i + batch.length}:`, error);
        errors++;
      } else {
        imported += batch.length;
        console.log(`✅ Imported ${imported}/${importableBarangays.length} barangays`);
      }
    }
    
    // Final verification
    console.log('\n📊 FINAL VERIFICATION:');
    console.log('======================');
    
    const { count: totalBarangays } = await supabase
      .from('psgc_barangays')
      .select('*', { count: 'exact' });
    
    console.log(`Total barangays in database: ${totalBarangays}`);
    
    // Check for any remaining Metro Manila barangays that couldn't be imported
    const stillMissing = metroManilaBarangays.filter(b => 
      !validCityCodes.has(b.city_municipality_code)
    );
    
    if (stillMissing.length > 0) {
      console.log(`⚠️  Still ${stillMissing.length} barangays that couldn't be imported due to missing cities`);
      
      // Show which cities are still missing
      const missingCities = new Set(stillMissing.map(b => b.city_municipality_code));
      console.log('Missing city codes:', Array.from(missingCities).join(', '));
    } else {
      console.log('🎉 All Metro Manila barangays successfully imported!');
    }
    
    console.log('\n🎯 MIGRATION SUMMARY:');
    console.log('=====================');
    console.log(`✅ Successfully imported: ${imported} barangays`);
    console.log(`❌ Errors encountered: ${errors} batches`);
    console.log(`📊 Total database barangays: ${totalBarangays}`);
    
    if (imported > 0) {
      console.log('\n🌟 Metro Manila barangay coverage now complete!');
      console.log('💡 Consider running integrity check to verify all relationships');
    }
    
  } catch (error) {
    console.error('❌ Import failed:', error);
    process.exit(1);
  }
}

// Run the import
if (require.main === module) {
  importRemainingBarangays();
}

module.exports = { importRemainingBarangays };