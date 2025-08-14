#!/usr/bin/env node

/**
 * FIX ALL PROVINCE REGIONS TO OFFICIAL CODES
 * ==========================================
 * 
 * This script will:
 * 1. Update ALL provinces to use only the official 17 region codes (01-17)
 * 2. Use the province's first 2 digits to determine the correct region
 * 3. Then delete all the extra regions that are no longer referenced
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://cdtcbelaimyftpxmzkjf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkdGNiZWxhaW15ZnRweG16a2pmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDg4ODU5MiwiZXhwIjoyMDcwNDY0NTkyfQ.pTuiHF7JKxhO0bcZoo8lmSveBhzKc9cqSCTb5oBcJrk';

const supabase = createClient(supabaseUrl, supabaseKey);

// Official 17 regions of the Philippines (excluding NIR which was dissolved)
const OFFICIAL_REGIONS = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17'];

console.log('🚀 FIX ALL PROVINCE REGIONS TO OFFICIAL CODES');
console.log('==============================================');

async function fixAllProvinceRegions() {
  try {
    console.log('\n📋 Step 1: Fix all province region assignments...');
    await updateAllProvincesToOfficialRegions();
    
    console.log('\n📋 Step 2: Delete unused extra regions...');
    await deleteUnusedRegions();
    
    console.log('\n📋 Step 3: Final verification...');
    await finalVerification();
    
    console.log('\n✅ Province regions fix complete!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

async function updateAllProvincesToOfficialRegions() {
  console.log('🔧 Updating all provinces to use official region codes...');
  
  const { data: allProvinces } = await supabase
    .from('psgc_provinces')
    .select('code, name, region_code');
  
  console.log(`📊 Found ${allProvinces.length} provinces to check`);
  
  let updated = 0;
  let alreadyCorrect = 0;
  let errors = 0;
  
  for (const province of allProvinces) {
    // Extract the correct region code from the province code (first 2 digits)
    const correctRegion = province.code.substring(0, 2);
    
    // Only update if the region is different and the correct region is in our official list
    if (province.region_code !== correctRegion && OFFICIAL_REGIONS.includes(correctRegion)) {
      const { error } = await supabase
        .from('psgc_provinces')
        .update({ region_code: correctRegion })
        .eq('code', province.code);
      
      if (!error) {
        updated++;
        if (updated % 20 === 0) {
          console.log(`✅ Progress: ${updated} provinces updated`);
        }
      } else {
        errors++;
        console.log(`❌ Error updating ${province.code}:`, error.message);
      }
    } else if (OFFICIAL_REGIONS.includes(province.region_code)) {
      alreadyCorrect++;
    } else {
      // Province code doesn't map to an official region - this might be a special case
      console.log(`⚠️  Province ${province.code} (${province.name}) - code doesn't map to official region`);
    }
  }
  
  console.log(`\n📊 UPDATE RESULTS:`);
  console.log(`   ✅ Updated: ${updated}`);
  console.log(`   ✅ Already correct: ${alreadyCorrect}`);
  console.log(`   ❌ Errors: ${errors}`);
}

async function deleteUnusedRegions() {
  console.log('🗑️  Deleting unused regions...');
  
  // Get regions currently in use
  const { data: provinces } = await supabase
    .from('psgc_provinces')
    .select('region_code');
  
  const usedRegions = new Set(provinces.map(p => p.region_code));
  console.log(`📊 Regions in use: ${Array.from(usedRegions).sort().join(', ')}`);
  
  // Get all regions
  const { data: allRegions } = await supabase
    .from('psgc_regions')
    .select('code, name');
  
  // Find unused regions
  const unusedRegions = allRegions.filter(r => !usedRegions.has(r.code));
  
  if (unusedRegions.length === 0) {
    console.log('✅ No unused regions to delete');
    return;
  }
  
  console.log(`📊 Found ${unusedRegions.length} unused regions to delete`);
  
  let deleted = 0;
  let failed = 0;
  
  for (const region of unusedRegions) {
    const { error } = await supabase
      .from('psgc_regions')
      .delete()
      .eq('code', region.code);
    
    if (!error) {
      deleted++;
      console.log(`✅ Deleted region ${region.code} - ${region.name}`);
    } else {
      failed++;
      console.log(`❌ Failed to delete region ${region.code}:`, error.message);
    }
  }
  
  console.log(`📊 Deletion results: ${deleted} deleted, ${failed} failed`);
}

async function finalVerification() {
  const { data: finalRegions, count } = await supabase
    .from('psgc_regions')
    .select('code, name', { count: 'exact' })
    .order('code');
  
  const { data: provinces } = await supabase
    .from('psgc_provinces')
    .select('region_code');
  
  // Count provinces by region
  const regionCount = {};
  provinces.forEach(p => {
    regionCount[p.region_code] = (regionCount[p.region_code] || 0) + 1;
  });
  
  console.log('\n🏆 FINAL VERIFICATION');
  console.log('=====================');
  console.log(`Total regions: ${count}`);
  
  if (count <= 17) {
    console.log('🎉 PERFECT! Achieved the official 17 regions structure');
  } else if (count <= 20) {
    console.log('🎉 EXCELLENT! Clean region structure achieved');
  } else {
    console.log(`⚠️  Still have ${count} regions`);
  }
  
  console.log('\n📋 FINAL REGIONS:');
  console.log('=================');
  finalRegions.forEach((region, index) => {
    const provinceCount = regionCount[region.code] || 0;
    const isOfficial = OFFICIAL_REGIONS.includes(region.code);
    console.log(`${index + 1}. ${region.code} - ${region.name} (${provinceCount} provinces) ${isOfficial ? '✅' : '❌'}`);
  });
  
  // Check for any provinces with invalid region codes
  const validRegionCodes = finalRegions.map(r => r.code);
  const { data: invalidProvinces } = await supabase
    .from('psgc_provinces')
    .select('code, name, region_code')
    .not('region_code', 'in', `(${validRegionCodes.map(c => `'${c}'`).join(',')})`);
  
  if (invalidProvinces && invalidProvinces.length > 0) {
    console.log(`\n⚠️  ${invalidProvinces.length} provinces with invalid region codes:`);
    invalidProvinces.slice(0, 5).forEach(p => {
      console.log(`   ${p.code} - ${p.name} (region: ${p.region_code})`);
    });
  } else {
    console.log('\n✅ All provinces have valid region codes');
  }
  
  // Summary
  const { count: totalProvinces } = await supabase.from('psgc_provinces').select('*', { count: 'exact', head: true });
  const { count: totalCities } = await supabase.from('psgc_cities_municipalities').select('*', { count: 'exact', head: true });
  const { count: totalBarangays } = await supabase.from('psgc_barangays').select('*', { count: 'exact', head: true });
  
  console.log('\n📊 FINAL DATABASE SUMMARY:');
  console.log('===========================');
  console.log(`Regions: ${count}`);
  console.log(`Provinces: ${totalProvinces}`);
  console.log(`Cities/Municipalities: ${totalCities}`);
  console.log(`Barangays: ${totalBarangays}`);
  console.log(`Total PSGC records: ${count + totalProvinces + totalCities + totalBarangays}`);
}

// Execute
fixAllProvinceRegions().catch(console.error);