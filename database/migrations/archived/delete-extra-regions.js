#!/usr/bin/env node

/**
 * DELETE EXTRA REGIONS
 * ====================
 * 
 * Now that provinces are properly mapped, we can safely delete
 * all the extra regions that were created during extrapolation.
 * We'll keep only the regions that are actually being used by provinces.
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://cdtcbelaimyftpxmzkjf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkdGNiZWxhaW15ZnRweG16a2pmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDg4ODU5MiwiZXhwIjoyMDcwNDY0NTkyfQ.pTuiHF7JKxhO0bcZoo8lmSveBhzKc9cqSCTb5oBcJrk';

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🚀 DELETE EXTRA REGIONS');
console.log('=======================');

async function deleteExtraRegions() {
  try {
    console.log('\n📋 Step 1: Identify regions currently in use...');
    const usedRegions = await getUsedRegions();
    
    console.log('\n📋 Step 2: Identify unused regions...');
    const unusedRegions = await getUnusedRegions(usedRegions);
    
    console.log('\n📋 Step 3: Delete unused regions...');
    await deleteUnusedRegions(unusedRegions);
    
    console.log('\n📋 Step 4: Final verification...');
    await finalVerification();
    
    console.log('\n✅ Extra regions cleanup complete!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

async function getUsedRegions() {
  console.log('🔍 Finding regions currently used by provinces...');
  
  const { data: provinces } = await supabase
    .from('psgc_provinces')
    .select('region_code');
  
  const usedRegionCodes = new Set(provinces.map(p => p.region_code));
  
  console.log(`📊 Found ${usedRegionCodes.size} regions in use:`);
  const sortedUsed = Array.from(usedRegionCodes).sort();
  console.log(`   ${sortedUsed.join(', ')}`);
  
  return usedRegionCodes;
}

async function getUnusedRegions(usedRegions) {
  console.log('🔍 Finding unused regions...');
  
  const { data: allRegions } = await supabase
    .from('psgc_regions')
    .select('code, name');
  
  const unusedRegions = allRegions.filter(region => !usedRegions.has(region.code));
  
  console.log(`📊 Found ${unusedRegions.length} unused regions:`);
  if (unusedRegions.length > 0) {
    console.log('\n🗑️  Regions to be deleted:');
    unusedRegions.forEach((region, index) => {
      console.log(`   ${index + 1}. ${region.code} - ${region.name}`);
    });
  }
  
  return unusedRegions;
}

async function deleteUnusedRegions(unusedRegions) {
  if (unusedRegions.length === 0) {
    console.log('✅ No unused regions to delete');
    return;
  }
  
  console.log(`🗑️  Deleting ${unusedRegions.length} unused regions...`);
  
  let deleted = 0;
  let errors = 0;
  
  for (const region of unusedRegions) {
    const { error } = await supabase
      .from('psgc_regions')
      .delete()
      .eq('code', region.code);
    
    if (!error) {
      deleted++;
      console.log(`✅ Deleted region ${region.code} - ${region.name}`);
    } else {
      errors++;
      console.log(`❌ Error deleting region ${region.code}:`, error.message);
      
      // Check if any provinces still reference this region
      const { data: refProvinces } = await supabase
        .from('psgc_provinces')
        .select('code, name')
        .eq('region_code', region.code);
      
      if (refProvinces && refProvinces.length > 0) {
        console.log(`   Still referenced by: ${refProvinces.map(p => p.code).join(', ')}`);
      }
    }
  }
  
  console.log(`\n📊 DELETION RESULTS:`);
  console.log(`   ✅ Successfully deleted: ${deleted}`);
  console.log(`   ❌ Failed to delete: ${errors}`);
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
  console.log(`Total regions remaining: ${count}`);
  
  if (count <= 20) {
    console.log('🎉 SUCCESS! Clean region structure achieved');
  } else {
    console.log(`⚠️  Still have ${count} regions (target: ≤20)`);
  }
  
  console.log('\n📋 REMAINING REGIONS:');
  console.log('====================');
  finalRegions.forEach((region, index) => {
    const provinceCount = regionCount[region.code] || 0;
    console.log(`${index + 1}. ${region.code} - ${region.name} (${provinceCount} provinces)`);
  });
  
  // Check for orphaned provinces
  const { data: orphanedProvinces } = await supabase
    .from('psgc_provinces')
    .select('code, name, region_code')
    .not('region_code', 'in', `(${finalRegions.map(r => `'${r.code}'`).join(',')})`);
  
  if (orphanedProvinces && orphanedProvinces.length > 0) {
    console.log(`\n⚠️  Found ${orphanedProvinces.length} orphaned provinces:`);
    orphanedProvinces.slice(0, 5).forEach(p => {
      console.log(`   ${p.code} - ${p.name} (references region ${p.region_code})`);
    });
  } else {
    console.log('\n✅ All provinces have valid region references');
  }
  
  // Final summary
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
deleteExtraRegions().catch(console.error);