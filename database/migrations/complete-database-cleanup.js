#!/usr/bin/env node

/**
 * COMPLETE DATABASE CLEANUP
 * =========================
 * 
 * This script will clean up all extrapolated data by:
 * 1. Identifying official provinces from reference CSV
 * 2. Deleting cities that reference non-official provinces
 * 3. Deleting non-official provinces
 * 4. Deleting unused regions
 * 5. Result: Clean database with only official PSGC data
 */

const { createClient } = require('@supabase/supabase-js');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');

const supabaseUrl = 'https://cdtcbelaimyftpxmzkjf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkdGNiZWxhaW15ZnRweG16a2pmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDg4ODU5MiwiZXhwIjoyMDcwNDY0NTkyfQ.pTuiHF7JKxhO0bcZoo8lmSveBhzKc9cqSCTb5oBcJrk';

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🚀 COMPLETE DATABASE CLEANUP');
console.log('============================');

async function completeDatabaseCleanup() {
  try {
    console.log('\n📋 Step 1: Load official provinces from reference CSV...');
    const officialProvinces = await loadOfficialProvinces();
    
    console.log('\n📋 Step 2: Delete cities referencing non-official provinces...');
    await deleteCitiesWithInvalidProvinces(officialProvinces);
    
    console.log('\n📋 Step 3: Delete non-official provinces...');
    await deleteNonOfficialProvinces(officialProvinces);
    
    console.log('\n📋 Step 4: Delete unused regions...');
    await deleteUnusedRegions();
    
    console.log('\n📋 Step 5: Final verification...');
    await finalVerification();
    
    console.log('\n🎉 COMPLETE DATABASE CLEANUP FINISHED!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

async function loadOfficialProvinces() {
  const filePath = path.join(__dirname, '../sample data/psgc/updated/psgc_provinces.updated.csv');
  
  console.log('📊 Loading official provinces from reference CSV...');
  
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

async function deleteCitiesWithInvalidProvinces(officialProvinces) {
  console.log('🗑️  Deleting cities that reference non-official provinces...');
  
  // Get all cities
  const { data: allCities } = await supabase
    .from('psgc_cities_municipalities')
    .select('code, name, province_code');
  
  console.log(`📊 Found ${allCities.length} cities in database`);
  
  // Find cities referencing non-official provinces
  const citiesToDelete = allCities.filter(city => !officialProvinces.has(city.province_code));
  
  console.log(`📊 Found ${citiesToDelete.length} cities referencing non-official provinces`);
  
  if (citiesToDelete.length === 0) {
    console.log('✅ No cities need to be deleted');
    return;
  }
  
  // Delete cities in batches
  const batchSize = 100;
  let deleted = 0;
  let errors = 0;
  
  for (let i = 0; i < citiesToDelete.length; i += batchSize) {
    const batch = citiesToDelete.slice(i, i + batchSize);
    const cityCodesInBatch = batch.map(city => city.code);
    
    const { error, count } = await supabase
      .from('psgc_cities_municipalities')
      .delete()
      .in('code', cityCodesInBatch);
    
    if (!error) {
      deleted += batch.length;
      console.log(`✅ Deleted cities batch ${Math.floor(i/batchSize) + 1}: ${deleted}/${citiesToDelete.length}`);
    } else {
      errors += batch.length;
      console.log(`❌ Error deleting cities batch ${Math.floor(i/batchSize) + 1}:`, error.message);
    }
  }
  
  console.log(`📊 Deleted ${deleted} cities, ${errors} errors`);
}

async function deleteNonOfficialProvinces(officialProvinces) {
  console.log('🗑️  Deleting non-official provinces...');
  
  // Get all provinces
  const { data: allProvinces } = await supabase
    .from('psgc_provinces')
    .select('code, name');
  
  console.log(`📊 Found ${allProvinces.length} provinces in database`);
  
  // Find non-official provinces
  const provincesToDelete = allProvinces.filter(province => !officialProvinces.has(province.code));
  
  console.log(`📊 Found ${provincesToDelete.length} non-official provinces to delete`);
  
  if (provincesToDelete.length === 0) {
    console.log('✅ No provinces need to be deleted');
    return;
  }
  
  // Show some examples
  console.log('\n🔍 Examples of provinces to delete:');
  provincesToDelete.slice(0, 10).forEach((province, index) => {
    console.log(`   ${index + 1}. ${province.code} - ${province.name}`);
  });
  if (provincesToDelete.length > 10) {
    console.log(`   ... and ${provincesToDelete.length - 10} more`);
  }
  
  // Delete provinces in batches
  const batchSize = 50;
  let deleted = 0;
  let errors = 0;
  
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
      errors += batch.length;
      console.log(`❌ Error deleting provinces batch ${Math.floor(i/batchSize) + 1}:`, error.message);
    }
  }
  
  console.log(`📊 Deleted ${deleted} provinces, ${errors} errors`);
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
  
  // Find unused regions
  const regionsToDelete = allRegions.filter(region => !usedRegions.has(region.code));
  
  console.log(`📊 Found ${regionsToDelete.length} unused regions to delete`);
  
  if (regionsToDelete.length === 0) {
    console.log('✅ No unused regions to delete');
    return;
  }
  
  // Delete unused regions
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
  console.log(`Total regions: ${regionCount}`);
  console.log(`Total provinces: ${provinceCount}`);
  console.log(`Total cities: ${cityCount}`);
  console.log(`Total barangays: ${barangayCount}`);
  
  if (regionCount <= 17) {
    console.log('\n🎉 PERFECT! Achieved the official 17 regions structure!');
  } else if (regionCount <= 20) {
    console.log('\n🎉 EXCELLENT! Clean region structure achieved!');
  } else {
    console.log(`\n⚠️  Still have ${regionCount} regions (expected ≤17)`);
  }
  
  console.log('\n📋 FINAL REGIONS:');
  console.log('=================');
  regions.forEach((region, index) => {
    console.log(`${index + 1}. ${region.code} - ${region.name}`);
  });
  
  // Verify province-region integrity
  const { data: provinceRegionCheck } = await supabase
    .from('psgc_provinces')
    .select('code, name, region_code');
  
  const regionCodes = new Set(regions.map(r => r.code));
  const invalidProvinces = provinceRegionCheck.filter(p => !regionCodes.has(p.region_code));
  
  if (invalidProvinces.length === 0) {
    console.log('\n✅ All provinces have valid region references');
  } else {
    console.log(`\n⚠️  ${invalidProvinces.length} provinces with invalid region codes:`);
    invalidProvinces.slice(0, 5).forEach(p => {
      console.log(`   ${p.code} - ${p.name} (region: ${p.region_code})`);
    });
  }
  
  console.log('\n📊 FINAL CLEAN DATABASE SUMMARY:');
  console.log('=================================');
  console.log(`✅ Regions: ${regionCount}`);
  console.log(`✅ Provinces: ${provinceCount}`);
  console.log(`✅ Cities/Municipalities: ${cityCount}`);
  console.log(`✅ Barangays: ${barangayCount}`);
  console.log(`📊 Total PSGC records: ${regionCount + provinceCount + cityCount + barangayCount}`);
  
  if (regionCount <= 17 && provinceCount === 82) {
    console.log('\n🎊 SUCCESS! CLEAN OFFICIAL PSGC DATABASE ACHIEVED! 🎊');
    console.log('✅ Only official regions and provinces remain');
    console.log('✅ All extrapolated data has been removed');
    console.log('✅ Database ready for production use');
  }
}

// Execute the complete cleanup
completeDatabaseCleanup().catch(console.error);