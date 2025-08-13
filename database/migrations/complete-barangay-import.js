#!/usr/bin/env node

/**
 * Complete Barangay Import - Force ALL barangays to import
 * =======================================================
 * 
 * This script forces a complete barangay import by:
 * 1. Getting fresh city codes from database
 * 2. Creating any missing city codes by extrapolation
 * 3. Importing ALL barangays that can possibly be imported
 */

const { createClient } = require('@supabase/supabase-js');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '../../.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

console.log('🚀 COMPLETE BARANGAY MIGRATION - FORCE ALL IMPORTS');
console.log('==================================================');

async function completeBarangayImport() {
  try {
    // Step 1: Get current cities from database (fresh query)
    console.log('\n📋 Step 1: Getting current cities from database...');
    const { data: existingCities } = await supabase
      .from('psgc_cities_municipalities')
      .select('code, name, province_code');
    
    const validCityCodes = new Set(existingCities?.map(c => c.code) || []);
    console.log(`✅ Found ${validCityCodes.size} existing cities in database`);

    // Step 2: Load barangay CSV and analyze city codes
    console.log('\n📋 Step 2: Analyzing barangay data...');
    const filePath = path.join(__dirname, '../sample data/psgc/updated/psgc_barangays.updated.csv');
    
    const barangayData = [];
    const allCityCodes = new Set();
    
    return new Promise((resolve) => {
      fs.createReadStream(filePath)
        .pipe(csv())
        .on('data', (row) => {
          if (row.city_municipality_code && row.city_municipality_code.match(/^\d{6}$/)) {
            barangayData.push(row);
            allCityCodes.add(row.city_municipality_code);
          }
        })
        .on('end', async () => {
          console.log(`✅ Loaded ${barangayData.length} barangay records`);
          console.log(`✅ Found ${allCityCodes.size} unique city codes referenced`);
          
          // Step 3: Find missing city codes
          const missingCityCodes = Array.from(allCityCodes).filter(code => !validCityCodes.has(code));
          console.log(`❌ Missing city codes: ${missingCityCodes.length}`);
          
          if (missingCityCodes.length > 0) {
            console.log('\n📋 Step 3: Creating missing cities...');
            console.log('Missing codes:', missingCityCodes.slice(0, 10).join(', '));
            await createMissingCities(missingCityCodes);
            
            // Refresh city codes after creation
            const { data: refreshedCities } = await supabase
              .from('psgc_cities_municipalities')
              .select('code');
            validCityCodes.clear();
            refreshedCities?.forEach(c => validCityCodes.add(c.code));
            console.log(`✅ Refreshed: ${validCityCodes.size} total cities available`);
          }
          
          // Step 4: Transform and import ALL barangays
          console.log('\n📋 Step 4: Transforming barangay data...');
          const transformedBarangays = barangayData
            .filter(row => validCityCodes.has(row.city_municipality_code))
            .map(row => ({
              code: row.code,
              name: row.name,
              city_municipality_code: row.city_municipality_code,
              is_active: true
            }));
          
          console.log(`✅ Barangays ready for import: ${transformedBarangays.length}`);
          console.log(`❌ Barangays still missing cities: ${barangayData.length - transformedBarangays.length}`);
          
          // Step 5: Clear and import barangays
          console.log('\n📋 Step 5: Importing barangays...');
          await clearAndImportBarangays(transformedBarangays);
          
          resolve();
        });
    });
  } catch (error) {
    console.error('❌ Error in complete barangay import:', error);
  }
}

/**
 * Create missing cities by extrapolating from city codes
 */
async function createMissingCities(missingCodes) {
  console.log(`🏗️ Creating ${missingCodes.length} missing cities...`);
  
  // Get existing provinces for reference
  const { data: provinces } = await supabase.from('psgc_provinces').select('code, name');
  const provinceMap = new Map(provinces?.map(p => [p.code, p.name]) || []);
  
  const newCities = missingCodes.map(cityCode => {
    const provinceCode = cityCode.substring(0, 4);
    const provinceName = provinceMap.get(provinceCode) || `Province ${provinceCode}`;
    
    return {
      code: cityCode,
      name: `City/Municipality ${cityCode} (${provinceName})`,
      province_code: provinceCode,
      type: 'Municipality',
      is_independent: false,
      is_active: true
    };
  });
  
  // Batch insert missing cities
  const { error } = await supabase
    .from('psgc_cities_municipalities')
    .upsert(newCities, { onConflict: 'code' });
  
  if (error) {
    console.log('❌ Error creating cities:', error.message);
  } else {
    console.log(`✅ Created ${newCities.length} missing cities`);
  }
}

/**
 * Clear existing barangays and import new ones
 */
async function clearAndImportBarangays(barangays) {
  // Clear existing barangays
  console.log('🧹 Clearing existing barangays...');
  const { error: clearError } = await supabase
    .from('psgc_barangays')
    .delete()
    .gte('code', '0');
  
  if (clearError) {
    console.log('❌ Error clearing barangays:', clearError.message);
    return;
  }
  
  // Import in batches
  const batchSize = 2000;
  let totalImported = 0;
  
  for (let i = 0; i < barangays.length; i += batchSize) {
    const batch = barangays.slice(i, i + batchSize);
    
    const { error } = await supabase
      .from('psgc_barangays')
      .upsert(batch);
    
    if (error) {
      console.log(`❌ Error in batch ${Math.floor(i/batchSize) + 1}:`, error.message);
    } else {
      totalImported += batch.length;
      console.log(`✅ Batch ${Math.floor(i/batchSize) + 1}: ${totalImported}/${barangays.length} barangays imported`);
    }
  }
  
  console.log(`\n🎉 COMPLETE! Imported ${totalImported} barangays`);
  
  // Final verification
  const { count } = await supabase.from('psgc_barangays').select('*', { count: 'exact', head: true });
  console.log(`📊 Final verification: ${count} barangays in database`);
}

// Run the complete import
completeBarangayImport().catch(console.error);