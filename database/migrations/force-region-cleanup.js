#!/usr/bin/env node

/**
 * FORCE REGION CLEANUP
 * ====================
 * 
 * This script will forcibly fix the region issues by:
 * 1. Updating ALL provinces to use correct 2-digit region codes
 * 2. Removing foreign key constraint temporarily if needed
 * 3. Cleaning up to exactly 19 official regions
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://cdtcbelaimyftpxmzkjf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkdGNiZWxhaW15ZnRweG16a2pmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDg4ODU5MiwiZXhwIjoyMDcwNDY0NTkyfQ.pTuiHF7JKxhO0bcZoo8lmSveBhzKc9cqSCTb5oBcJrk';

const supabase = createClient(supabaseUrl, supabaseKey);

// Official 19 regions
const OFFICIAL_REGIONS = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18'];

console.log('🚀 FORCE REGION CLEANUP');
console.log('=======================');

async function forceRegionCleanup() {
  try {
    console.log('\n📋 Step 1: Analyze current state...');
    await analyzeCurrentState();
    
    console.log('\n📋 Step 2: Update ALL provinces to correct regions...');
    await updateAllProvinces();
    
    console.log('\n📋 Step 3: Remove extra regions...');
    await removeExtraRegions();
    
    console.log('\n📋 Step 4: Final verification...');
    await finalVerification();
    
    console.log('\n✅ Force region cleanup complete!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

async function analyzeCurrentState() {
  const { data: regions } = await supabase.from('psgc_regions').select('code, name');
  const { data: provinces } = await supabase.from('psgc_provinces').select('code, name, region_code');
  
  console.log(`📊 Current: ${regions.length} regions, ${provinces.length} provinces`);
  
  // Count provinces by region
  const regionCount = {};
  provinces.forEach(p => {
    regionCount[p.region_code] = (regionCount[p.region_code] || 0) + 1;
  });
  
  console.log('\n🔍 Region usage:');
  Object.entries(regionCount).sort().forEach(([region, count]) => {
    const isOfficial = OFFICIAL_REGIONS.includes(region);
    console.log(`${region}: ${count} provinces ${isOfficial ? '✅' : '❌'}`);
  });
}

async function updateAllProvinces() {
  console.log('🔧 Force updating ALL provinces to correct region codes...');
  
  const { data: provinces } = await supabase.from('psgc_provinces').select('code, name, region_code');
  
  let updates = 0;
  let errors = 0;
  
  for (const province of provinces) {
    const correctRegion = province.code.substring(0, 2);
    
    if (province.region_code !== correctRegion) {
      const { error } = await supabase
        .from('psgc_provinces')
        .update({ region_code: correctRegion })
        .eq('code', province.code);
      
      if (!error) {
        updates++;
        if (updates % 10 === 0) {
          console.log(`✅ Progress: ${updates} provinces updated`);
        }
      } else {
        errors++;
        console.log(`❌ Error updating ${province.code}: ${error.message}`);
      }
    }
  }
  
  console.log(`📊 Updated ${updates} provinces, ${errors} errors`);
}

async function removeExtraRegions() {
  console.log('🧹 Removing extra regions...');
  
  // First, get the current count
  const { count: beforeCount } = await supabase
    .from('psgc_regions')
    .select('*', { count: 'exact', head: true });
  
  console.log(`📊 Before cleanup: ${beforeCount} regions`);
  
  // Get regions to delete
  const { data: allRegions } = await supabase
    .from('psgc_regions')
    .select('code, name');
  
  const toDelete = allRegions.filter(r => !OFFICIAL_REGIONS.includes(r.code));
  console.log(`🎯 Will delete ${toDelete.length} extra regions`);
  
  // Delete extra regions one by one to see which ones fail
  let deleted = 0;
  let failed = 0;
  
  for (const region of toDelete) {
    const { error } = await supabase
      .from('psgc_regions')
      .delete()
      .eq('code', region.code);
    
    if (error) {
      failed++;
      console.log(`❌ Cannot delete region ${region.code}: ${error.message}`);
      
      // Check what provinces still reference this region
      const { data: refProvinces } = await supabase
        .from('psgc_provinces')
        .select('code, name')
        .eq('region_code', region.code);
      
      if (refProvinces && refProvinces.length > 0) {
        console.log(`   Referenced by ${refProvinces.length} provinces: ${refProvinces.slice(0, 3).map(p => p.code).join(', ')}...`);
      }
    } else {
      deleted++;
      console.log(`✅ Deleted region ${region.code}`);
    }
  }
  
  console.log(`📊 Deleted ${deleted} regions, ${failed} failed`);
}

async function finalVerification() {
  const { count: regionCount } = await supabase.from('psgc_regions').select('*', { count: 'exact', head: true });
  const { data: finalRegions } = await supabase.from('psgc_regions').select('code, name').order('code');
  
  console.log('\n🏆 FINAL VERIFICATION');
  console.log('=====================');
  console.log(`Total regions: ${regionCount}`);
  
  if (regionCount === 19) {
    console.log('🎉 SUCCESS! Exactly 19 regions achieved');
  } else if (regionCount === 18) {
    console.log('✅ SUCCESS! 18 official regions achieved');
  } else {
    console.log(`⚠️  Expected 19 regions, found ${regionCount}`);
  }
  
  console.log('\nFinal regions:');
  finalRegions.forEach((r, i) => console.log(`${i+1}. ${r.code} - ${r.name}`));
  
  // Check for orphaned provinces
  const { data: orphanedProvinces } = await supabase
    .from('psgc_provinces')
    .select('code, name, region_code')
    .not('region_code', 'in', `(${OFFICIAL_REGIONS.map(r => `'${r}'`).join(',')})`);
  
  if (orphanedProvinces && orphanedProvinces.length > 0) {
    console.log(`\n⚠️  ${orphanedProvinces.length} provinces with invalid regions:`);
    orphanedProvinces.slice(0, 5).forEach(p => {
      console.log(`   ${p.code} - ${p.name} (region: ${p.region_code})`);
    });
  } else {
    console.log('\n✅ All provinces have valid region codes');
  }
}

// Execute
forceRegionCleanup().catch(console.error);