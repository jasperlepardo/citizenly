#!/usr/bin/env node

/**
 * IMPORT CITIES AND BARANGAYS
 * ===========================
 * 
 * Import cities and barangays with only the columns that exist in the database
 */

const { createClient } = require('@supabase/supabase-js');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');

const supabaseUrl = 'https://cdtcbelaimyftpxmzkjf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkdGNiZWxhaW15ZnRweG16a2pmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDg4ODU5MiwiZXhwIjoyMDcwNDY0NTkyfQ.pTuiHF7JKxhO0bcZoo8lmSveBhzKc9cqSCTb5oBcJrk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function importCitiesAndBarangays() {
  console.log('🚀 IMPORT CITIES AND BARANGAYS');
  console.log('==============================');
  
  try {
    // Step 1: Import cities
    console.log('\n📋 Step 1: Importing cities...');
    await importCities();
    
    // Step 2: Import barangays
    console.log('\n📋 Step 2: Importing barangays...');
    await importBarangays();
    
    // Step 3: Final verification
    console.log('\n📋 Step 3: Final verification...');
    await finalVerification();
    
    console.log('\n🎉 IMPORT COMPLETE!');
    
  } catch (error) {
    console.error('❌ Error during import:', error);
  }
}

async function importCities() {
  const filePath = path.join(__dirname, '../sample data/psgc/updated/psgc_cities_municipalities.updated.fixed.csv');
  
  if (!fs.existsSync(filePath)) {
    console.log('⚠️  Cities CSV file not found');
    return;
  }
  
  const cities = [];
  
  await new Promise((resolve) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        if (row.code && row.name && row.province_code) {
          // Include required columns
          cities.push({
            code: row.code,
            name: row.name,
            province_code: row.province_code,
            type: row.type || 'municipality'
          });
        }
      })
      .on('end', resolve);
  });
  
  console.log(`📥 Found ${cities.length} cities/municipalities in CSV`);
  
  // Only import cities for provinces that exist
  const { data: validProvinces } = await supabase.from('psgc_provinces').select('code');
  const validProvinceCodes = new Set(validProvinces.map(p => p.code));
  
  const validCities = cities.filter(c => validProvinceCodes.has(c.province_code));
  console.log(`📊 ${validCities.length} cities match valid provinces`);
  
  const batchSize = 100;
  let imported = 0;
  
  for (let i = 0; i < validCities.length; i += batchSize) {
    const batch = validCities.slice(i, i + batchSize);
    const { error } = await supabase.from('psgc_cities_municipalities').insert(batch);
    if (!error) {
      imported += batch.length;
      console.log(`✅ Imported batch ${Math.floor(i/batchSize) + 1}: ${imported}/${validCities.length}`);
    } else {
      console.log(`❌ Error in batch ${Math.floor(i/batchSize) + 1}:`, error.message);
      // Try individual inserts for failed batch
      for (const city of batch) {
        const { error: individualError } = await supabase
          .from('psgc_cities_municipalities')
          .insert(city);
        if (!individualError) {
          imported++;
        }
      }
    }
  }
  
  console.log(`✅ Successfully imported ${imported} cities/municipalities`);
}

async function importBarangays() {
  const filePath = path.join(__dirname, '../sample data/psgc/updated/psgc_barangays.updated.csv');
  
  if (!fs.existsSync(filePath)) {
    console.log('⚠️  Barangays CSV file not found');
    return;
  }
  
  const barangays = [];
  
  await new Promise((resolve) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        if (row.code && row.name && row.city_municipality_code) {
          // Only include columns that exist in the database
          barangays.push({
            code: row.code,
            name: row.name,
            city_municipality_code: row.city_municipality_code
          });
        }
      })
      .on('end', resolve);
  });
  
  console.log(`📥 Found ${barangays.length} barangays in CSV`);
  
  // Only import barangays for cities that exist
  const { data: validCities } = await supabase.from('psgc_cities_municipalities').select('code');
  const validCityCodes = new Set(validCities.map(c => c.code));
  
  const validBarangays = barangays.filter(b => validCityCodes.has(b.city_municipality_code));
  console.log(`📊 ${validBarangays.length} barangays match valid cities`);
  
  const batchSize = 500;
  let imported = 0;
  
  for (let i = 0; i < validBarangays.length; i += batchSize) {
    const batch = validBarangays.slice(i, i + batchSize);
    const { error } = await supabase.from('psgc_barangays').insert(batch);
    if (!error) {
      imported += batch.length;
      console.log(`✅ Imported batch ${Math.floor(i/batchSize) + 1}: ${imported}/${validBarangays.length}`);
    } else {
      console.log(`❌ Error in batch ${Math.floor(i/batchSize) + 1}:`, error.message);
    }
  }
  
  console.log(`✅ Successfully imported ${imported} barangays`);
}

async function finalVerification() {
  const { count: regions } = await supabase.from('psgc_regions').select('*', { count: 'exact', head: true });
  const { count: provinces } = await supabase.from('psgc_provinces').select('*', { count: 'exact', head: true });
  const { count: cities } = await supabase.from('psgc_cities_municipalities').select('*', { count: 'exact', head: true });
  const { count: barangays } = await supabase.from('psgc_barangays').select('*', { count: 'exact', head: true });
  
  console.log('\n🏆 FINAL DATABASE STATUS');
  console.log('========================');
  console.log(`Regions: ${regions}`);
  console.log(`Provinces: ${provinces}`);
  console.log(`Cities/Municipalities: ${cities}`);
  console.log(`Barangays: ${barangays}`);
  
  console.log('\n✅ PSGC database import complete!');
}

importCitiesAndBarangays().catch(console.error);