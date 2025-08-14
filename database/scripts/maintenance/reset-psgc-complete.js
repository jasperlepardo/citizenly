#!/usr/bin/env node

/**
 * COMPLETE PSGC DATABASE RESET
 * ============================
 * 
 * This script will:
 * 1. Clear all PSGC tables (barangays → cities → provinces → regions)
 * 2. Import fresh data from the updated CSV files
 * 3. Ensure we have the correct official structure:
 *    - 18 regions (including NIR)
 *    - 82 provinces (with corrected Maguindanao del Norte/Sur)
 *    - Official cities and barangays
 */

const { createClient } = require('@supabase/supabase-js');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');

const supabaseUrl = 'https://cdtcbelaimyftpxmzkjf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkdGNiZWxhaW15ZnRweG16a2pmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDg4ODU5MiwiZXhwIjoyMDcwNDY0NTkyfQ.pTuiHF7JKxhO0bcZoo8lmSveBhzKc9cqSCTb5oBcJrk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function resetPSGCDatabase() {
  console.log('🚀 COMPLETE PSGC DATABASE RESET');
  console.log('================================');
  console.log('This will clear all PSGC data and reimport from scratch.');
  console.log('');
  
  try {
    // Step 1: Clear all tables (bottom-up to respect foreign keys)
    console.log('📋 Step 1: Clearing existing data...');
    await clearAllTables();
    
    // Step 2: Import regions
    console.log('\n📋 Step 2: Importing regions...');
    await importRegions();
    
    // Step 3: Import provinces
    console.log('\n📋 Step 3: Importing provinces...');
    await importProvinces();
    
    // Step 4: Import cities
    console.log('\n📋 Step 4: Importing cities...');
    await importCities();
    
    // Step 5: Import barangays
    console.log('\n📋 Step 5: Importing barangays...');
    await importBarangays();
    
    // Step 6: Final verification
    console.log('\n📋 Step 6: Final verification...');
    await finalVerification();
    
    console.log('\n🎉 PSGC DATABASE RESET COMPLETE!');
    
  } catch (error) {
    console.error('❌ Error during reset:', error);
  }
}

async function clearAllTables() {
  console.log('🗑️  Clearing barangays...');
  await supabase.from('psgc_barangays').delete().neq('code', 'xxx');
  
  console.log('🗑️  Clearing cities/municipalities...');
  await supabase.from('psgc_cities_municipalities').delete().neq('code', 'xxx');
  
  console.log('🗑️  Clearing provinces...');
  await supabase.from('psgc_provinces').delete().neq('code', 'xxx');
  
  console.log('🗑️  Clearing regions...');
  await supabase.from('psgc_regions').delete().neq('code', 'xxx');
  
  console.log('✅ All tables cleared');
}

async function importRegions() {
  const filePath = path.join(__dirname, '../sample data/psgc/updated/psgc_regions.updated.csv');
  const regions = [];
  
  await new Promise((resolve) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        if (row.code && row.name) {
          regions.push({ code: row.code, name: row.name });
        }
      })
      .on('end', resolve);
  });
  
  console.log(`📥 Importing ${regions.length} regions...`);
  
  for (const region of regions) {
    const { error } = await supabase.from('psgc_regions').insert(region);
    if (error) console.log(`❌ Error importing region ${region.code}:`, error.message);
  }
  
  console.log(`✅ Imported ${regions.length} regions`);
}

async function importProvinces() {
  const filePath = path.join(__dirname, '../sample data/psgc/updated/psgc_provinces.updated.csv');
  const provinces = [];
  
  await new Promise((resolve) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        if (row.code && row.name && row.region_code) {
          provinces.push({
            code: row.code,
            name: row.name,
            region_code: row.region_code
          });
        }
      })
      .on('end', resolve);
  });
  
  console.log(`📥 Importing ${provinces.length} provinces...`);
  
  const batchSize = 20;
  for (let i = 0; i < provinces.length; i += batchSize) {
    const batch = provinces.slice(i, i + batchSize);
    const { error } = await supabase.from('psgc_provinces').insert(batch);
    if (!error) {
      console.log(`✅ Imported batch ${Math.floor(i/batchSize) + 1}: ${Math.min(i + batchSize, provinces.length)}/${provinces.length}`);
    } else {
      console.log(`❌ Error in batch ${Math.floor(i/batchSize) + 1}:`, error.message);
    }
  }
}

async function importCities() {
  const filePath = path.join(__dirname, '../sample data/psgc/updated/psgc_cities_municipalities.updated.fixed.csv');
  
  if (!fs.existsSync(filePath)) {
    console.log('⚠️  Cities CSV file not found, skipping...');
    return;
  }
  
  const cities = [];
  
  await new Promise((resolve) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        if (row.code && row.name && row.province_code) {
          cities.push({
            code: row.code,
            name: row.name,
            province_code: row.province_code,
            city_class: row.city_class || null,
            income_class: row.income_class || null,
            is_capital: row.is_capital === 'True'
          });
        }
      })
      .on('end', resolve);
  });
  
  console.log(`📥 Importing ${cities.length} cities/municipalities...`);
  
  // Only import cities for provinces that exist
  const { data: validProvinces } = await supabase.from('psgc_provinces').select('code');
  const validProvinceCodes = new Set(validProvinces.map(p => p.code));
  
  const validCities = cities.filter(c => validProvinceCodes.has(c.province_code));
  console.log(`📊 ${validCities.length} cities match valid provinces`);
  
  const batchSize = 100;
  for (let i = 0; i < validCities.length; i += batchSize) {
    const batch = validCities.slice(i, i + batchSize);
    const { error } = await supabase.from('psgc_cities_municipalities').insert(batch);
    if (!error) {
      console.log(`✅ Imported batch ${Math.floor(i/batchSize) + 1}: ${Math.min(i + batchSize, validCities.length)}/${validCities.length}`);
    } else {
      console.log(`❌ Error in batch ${Math.floor(i/batchSize) + 1}:`, error.message);
    }
  }
}

async function importBarangays() {
  const filePath = path.join(__dirname, '../sample data/psgc/updated/psgc_barangays.updated.csv');
  
  if (!fs.existsSync(filePath)) {
    console.log('⚠️  Barangays CSV file not found, skipping...');
    return;
  }
  
  const barangays = [];
  
  await new Promise((resolve) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        if (row.code && row.name && row.city_municipality_code) {
          barangays.push({
            code: row.code,
            name: row.name,
            city_municipality_code: row.city_municipality_code,
            old_names: row.old_names || null,
            is_capital: row.is_capital === 'True',
            is_urban: row.is_urban === 'True'
          });
        }
      })
      .on('end', resolve);
  });
  
  console.log(`📥 Importing ${barangays.length} barangays...`);
  
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
  
  if (regions === 18 && provinces === 82) {
    console.log('\n🎊 SUCCESS! Official PSGC database structure achieved!');
    console.log('✅ 18 official regions (including NIR)');
    console.log('✅ 82 official provinces (with corrected Maguindanao)');
    console.log('✅ Database ready for production use');
  } else {
    console.log('\n⚠️  Database structure needs adjustment:');
    if (regions !== 18) console.log(`   - Expected 18 regions, got ${regions}`);
    if (provinces !== 82) console.log(`   - Expected 82 provinces, got ${provinces}`);
  }
  
  // Show regions list
  const { data: regionList } = await supabase.from('psgc_regions').select('code, name').order('code');
  console.log('\n📋 REGIONS:');
  regionList.forEach(r => console.log(`   ${r.code} - ${r.name}`));
}

resetPSGCDatabase().catch(console.error);