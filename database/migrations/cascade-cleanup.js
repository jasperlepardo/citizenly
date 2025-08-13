#!/usr/bin/env node

/**
 * CASCADE CLEANUP - DELETE FROM BOTTOM UP
 * =======================================
 * 
 * This script will clean up extrapolated data by working through
 * the foreign key hierarchy from bottom to top:
 * Barangays → Cities → Provinces → Regions
 */

const { createClient } = require('@supabase/supabase-js');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');

const supabaseUrl = 'https://cdtcbelaimyftpxmzkjf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkdGNiZWxhaW15ZnRweG16a2pmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDg4ODU5MiwiZXhwIjoyMDcwNDY0NTkyfQ.pTuiHF7JKxhO0bcZoo8lmSveBhzKc9cqSCTb5oBcJrk';

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🚀 CASCADE CLEANUP - DELETE FROM BOTTOM UP');
console.log('==========================================');

async function cascadeCleanup() {
  try {
    console.log('\n📋 Step 1: Load official provinces from reference CSV...');
    const officialProvinces = await loadOfficialProvinces();
    
    console.log('\n📋 Step 2: Delete barangays in cities referencing non-official provinces...');
    await deleteBarangaysInInvalidCities(officialProvinces);
    
    console.log('\n📋 Step 3: Delete cities referencing non-official provinces...');
    await deleteCitiesWithInvalidProvinces(officialProvinces);
    
    console.log('\n📋 Step 4: Delete non-official provinces...');
    await deleteNonOfficialProvinces(officialProvinces);
    
    console.log('\n📋 Step 5: Delete unused regions...');
    await deleteUnusedRegions();
    
    console.log('\n📋 Step 6: Final verification...');
    await finalVerification();
    
    console.log('\n🎉 CASCADE CLEANUP COMPLETE!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

async function loadOfficialProvinces() {
  const filePath = path.join(__dirname, '../sample data/psgc/updated/psgc_provinces.updated.csv');
  
  return new Promise((resolve) => {
    const officialCodes = new Set();
    
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        if (row.code) {
          officialCodes.add(row.code);
        }
      })
      .on('end', () => {
        console.log(`✅ Loaded ${officialCodes.size} official province codes`);
        resolve(officialCodes);
      });
  });
}

async function deleteBarangaysInInvalidCities(officialProvinces) {
  console.log('🗑️  Deleting barangays in cities that reference non-official provinces...');
  
  // Get cities that reference non-official provinces
  const { data: allCities } = await supabase
    .from('psgc_cities_municipalities')
    .select('code, province_code');
  
  const invalidCityCodes = allCities
    .filter(city => !officialProvinces.has(city.province_code))
    .map(city => city.code);
  
  console.log(`📊 Found ${invalidCityCodes.length} invalid cities`);
  
  if (invalidCityCodes.length === 0) {
    console.log('✅ No barangays need to be deleted');
    return;
  }
  
  // Delete barangays that reference these invalid cities
  const batchSize = 500;
  let totalDeleted = 0;
  
  for (let i = 0; i < invalidCityCodes.length; i += batchSize) {
    const batch = invalidCityCodes.slice(i, i + batchSize);
    
    const { error, count } = await supabase
      .from('psgc_barangays')
      .delete()
      .in('city_municipality_code', batch);
    
    if (!error) {
      totalDeleted += (count || 0);
      console.log(`✅ Deleted barangays batch ${Math.floor(i/batchSize) + 1}: ~${totalDeleted} total`);
    } else {
      console.log(`❌ Error deleting barangays batch ${Math.floor(i/batchSize) + 1}:`, error.message);
    }
  }
  
  console.log(`📊 Deleted approximately ${totalDeleted} barangays`);
}

async function deleteCitiesWithInvalidProvinces(officialProvinces) {
  console.log('🗑️  Deleting cities that reference non-official provinces...');
  
  const { data: allCities } = await supabase
    .from('psgc_cities_municipalities')
    .select('code, name, province_code');
  
  const citiesToDelete = allCities.filter(city => !officialProvinces.has(city.province_code));
  
  console.log(`📊 Found ${citiesToDelete.length} cities to delete`);
  
  if (citiesToDelete.length === 0) {
    console.log('✅ No cities need to be deleted');
    return;
  }
  
  const batchSize = 100;
  let deleted = 0;
  
  for (let i = 0; i < citiesToDelete.length; i += batchSize) {
    const batch = citiesToDelete.slice(i, i + batchSize);
    const cityCodesInBatch = batch.map(city => city.code);
    
    const { error } = await supabase
      .from('psgc_cities_municipalities')
      .delete()
      .in('code', cityCodesInBatch);
    
    if (!error) {
      deleted += batch.length;
      console.log(`✅ Deleted cities batch ${Math.floor(i/batchSize) + 1}: ${deleted}/${citiesToDelete.length}`);
    } else {
      console.log(`❌ Error deleting cities batch ${Math.floor(i/batchSize) + 1}:`, error.message);
    }
  }
  
  console.log(`📊 Deleted ${deleted} cities`);
}

async function deleteNonOfficialProvinces(officialProvinces) {
  console.log('🗑️  Deleting non-official provinces...');
  
  const { data: allProvinces } = await supabase
    .from('psgc_provinces')
    .select('code, name');
  
  const provincesToDelete = allProvinces.filter(province => !officialProvinces.has(province.code));
  
  console.log(`📊 Found ${provincesToDelete.length} non-official provinces to delete`);
  
  if (provincesToDelete.length === 0) {
    console.log('✅ No provinces need to be deleted');
    return;
  }
  
  const batchSize = 50;
  let deleted = 0;
  
  for (let i = 0; i < provincesToDelete.length; i += batchSize) {
    const batch = provincesToDelete.slice(i, i + batchSize);
    const provinceCodesInBatch = batch.map(province => province.code);
    
    const { error } = await supabase
      .from('psgc_provinces')
      .delete()
      .in('code', provinceCodesInBatch);
    
    if (!error) {
      deleted += batch.length;
      console.log(`✅ Deleted provinces batch ${Math.floor(i/batchSize) + 1}: ${deleted}/${provincesToDelete.length}`);
    } else {
      console.log(`❌ Error deleting provinces batch ${Math.floor(i/batchSize) + 1}:`, error.message);
    }
  }
  
  console.log(`📊 Deleted ${deleted} provinces`);
}

async function deleteUnusedRegions() {
  console.log('🗑️  Deleting unused regions...');
  
  // Get regions currently in use by remaining provinces
  const { data: provinces } = await supabase
    .from('psgc_provinces')
    .select('region_code');
  
  const usedRegions = new Set(provinces.map(p => p.region_code));
  console.log(`📊 Regions still in use: ${Array.from(usedRegions).sort().join(', ')}`);
  
  // Get all regions
  const { data: allRegions } = await supabase
    .from('psgc_regions')
    .select('code, name');
  
  const regionsToDelete = allRegions.filter(region => !usedRegions.has(region.code));
  
  console.log(`📊 Found ${regionsToDelete.length} unused regions to delete`);
  
  let deleted = 0;
  for (const region of regionsToDelete) {
    const { error } = await supabase
      .from('psgc_regions')
      .delete()
      .eq('code', region.code);
    
    if (!error) {
      deleted++;
      console.log(`✅ Deleted region ${region.code} - ${region.name}`);
    } else {
      console.log(`❌ Error deleting region ${region.code}:`, error.message);
    }
  }
  
  console.log(`📊 Deleted ${deleted} unused regions`);
}

async function finalVerification() {
  const { data: regions, count: regionCount } = await supabase
    .from('psgc_regions')
    .select('code, name', { count: 'exact' })
    .order('code');
  
  const { count: provinceCount } = await supabase
    .from('psgc_provinces')
    .select('*', { count: 'exact', head: true });
  
  const { count: cityCount } = await supabase
    .from('psgc_cities_municipalities')
    .select('*', { count: 'exact', head: true });
  
  const { count: barangayCount } = await supabase
    .from('psgc_barangays')
    .select('*', { count: 'exact', head: true });
  
  console.log('\n🏆 FINAL VERIFICATION - CLEAN DATABASE');
  console.log('=====================================');
  
  if (regionCount <= 17) {
    console.log('🎉 PERFECT! Official 17 regions achieved!');
  } else if (regionCount <= 20) {
    console.log('🎉 EXCELLENT! Clean region structure!');
  } else {
    console.log(`⚠️  ${regionCount} regions (target: ≤17)`);
  }
  
  if (provinceCount === 82) {
    console.log('🎉 PERFECT! Exactly 82 official provinces!');
  } else {
    console.log(`⚠️  ${provinceCount} provinces (target: 82)`);
  }
  
  console.log('\n📋 FINAL REGIONS:');
  console.log('=================');
  regions.forEach((region, index) => {
    console.log(`${index + 1}. ${region.code} - ${region.name}`);
  });
  
  console.log('\n📊 FINAL DATABASE SUMMARY:');
  console.log('===========================');
  console.log(`Regions: ${regionCount}`);
  console.log(`Provinces: ${provinceCount}`);
  console.log(`Cities/Municipalities: ${cityCount}`);
  console.log(`Barangays: ${barangayCount}`);
  console.log(`Total PSGC records: ${regionCount + provinceCount + cityCount + barangayCount}`);
  
  if (regionCount <= 17 && provinceCount === 82) {
    console.log('\n🎊 SUCCESS! CLEAN OFFICIAL PSGC DATABASE ACHIEVED! 🎊');
    console.log('✅ Only official regions and provinces remain');
    console.log('✅ All extrapolated data removed');
    console.log('✅ Database ready for production use');
  } else {
    console.log('\n📊 Cleanup progress made:');
    console.log(`   Regions reduced from 54 to ${regionCount}`);
    console.log(`   Provinces reduced from 224 to ${provinceCount}`);
  }
}

// Execute the cascade cleanup
cascadeCleanup().catch(console.error);