#!/usr/bin/env node

/**
 * FIX REGION ASSIGNMENTS
 * ======================
 * 
 * This script will:
 * 1. Fix province region assignments to use the correct 2-digit region codes
 * 2. Remove extra regions that were created during extrapolation
 * 3. Ensure we only have the official 19 regions
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://cdtcbelaimyftpxmzkjf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkdGNiZWxhaW15ZnRweG16a2pmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDg4ODU5MiwiZXhwIjoyMDcwNDY0NTkyfQ.pTuiHF7JKxhO0bcZoo8lmSveBhzKc9cqSCTb5oBcJrk';

const supabase = createClient(supabaseUrl, supabaseKey);

// Official 19 regions of the Philippines
const OFFICIAL_REGIONS = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17', '18'];

console.log('🚀 FIX REGION ASSIGNMENTS');
console.log('=========================');

async function fixRegionAssignments() {
  try {
    console.log('\n📋 Step 1: Fix all province region codes...');
    await fixProvinceRegions();
    
    console.log('\n📋 Step 2: Remove extra regions...');
    await removeExtraRegions();
    
    console.log('\n📋 Step 3: Verify final results...');
    await verifyResults();
    
    console.log('\n✅ Region assignment fix complete!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

async function fixProvinceRegions() {
  console.log('🔧 Fixing province region assignments...');
  
  const { data: provinces } = await supabase
    .from('psgc_provinces')
    .select('code, name, region_code');
  
  let updates = 0;
  
  for (const province of provinces) {
    // Extract the first 2 digits as the correct region code
    const correctRegion = province.code.substring(0, 2);
    
    // Only update if the region code is different and the correct region exists
    if (province.region_code !== correctRegion && OFFICIAL_REGIONS.includes(correctRegion)) {
      const { error } = await supabase
        .from('psgc_provinces')
        .update({ region_code: correctRegion })
        .eq('code', province.code);
      
      if (!error) {
        console.log(`✅ ${province.code} (${province.name}): ${province.region_code} → ${correctRegion}`);
        updates++;
      } else {
        console.log(`❌ Error updating ${province.code}:`, error.message);
      }
    }
  }
  
  console.log(`📊 Updated ${updates} province region assignments`);
}

async function removeExtraRegions() {
  console.log('🧹 Removing extra regions...');
  
  // Get current count first
  const { count: beforeCount } = await supabase
    .from('psgc_regions')
    .select('*', { count: 'exact', head: true });
  
  // Delete regions that are not in the official list
  const { error } = await supabase
    .from('psgc_regions')
    .delete()
    .not('code', 'in', `(${OFFICIAL_REGIONS.map(r => `'${r}'`).join(',')})`);
  
  if (error) {
    console.log('❌ Error removing extra regions:', error.message);
  } else {
    const { count: afterCount } = await supabase
      .from('psgc_regions')
      .select('*', { count: 'exact', head: true });
    
    console.log(`✅ Removed ${beforeCount - afterCount} extra regions`);
    console.log(`📊 Before: ${beforeCount} regions → After: ${afterCount} regions`);
  }
}

async function verifyResults() {
  const { data: finalRegions, count } = await supabase
    .from('psgc_regions')
    .select('code, name', { count: 'exact' })
    .order('code');
  
  console.log('\n🏆 FINAL VERIFICATION');
  console.log('=====================');
  console.log(`Total regions: ${count}`);
  
  if (count === 19) {
    console.log('🎉 SUCCESS! Exactly 19 regions as expected');
  } else {
    console.log(`⚠️  Expected 19 regions, but found ${count}`);
    console.log('Missing regions:', OFFICIAL_REGIONS.filter(code => !finalRegions.some(r => r.code === code)));
  }
  
  console.log('\n📋 FINAL REGION LIST:');
  console.log('=====================');
  finalRegions.forEach((region, index) => {
    console.log(`${index + 1}. ${region.code} - ${region.name}`);
  });
  
  // Check province assignments
  const { data: orphanedProvinces } = await supabase
    .from('psgc_provinces')
    .select('code, name, region_code')
    .not('region_code', 'in', `(${OFFICIAL_REGIONS.map(r => `'${r}'`).join(',')})`);
  
  if (orphanedProvinces && orphanedProvinces.length > 0) {
    console.log(`\n⚠️  Found ${orphanedProvinces.length} provinces with invalid region codes:`);
    orphanedProvinces.slice(0, 10).forEach(p => {
      console.log(`   ${p.code} - ${p.name} (region: ${p.region_code})`);
    });
  } else {
    console.log('\n✅ All provinces have valid region codes');
  }
  
  // Final counts
  const { count: provinceCount } = await supabase.from('psgc_provinces').select('*', { count: 'exact', head: true });
  const { count: cityCount } = await supabase.from('psgc_cities_municipalities').select('*', { count: 'exact', head: true });
  const { count: barangayCount } = await supabase.from('psgc_barangays').select('*', { count: 'exact', head: true });
  
  console.log('\n📊 FINAL DATABASE SUMMARY:');
  console.log('===========================');
  console.log(`Regions: ${count}`);
  console.log(`Provinces: ${provinceCount}`);
  console.log(`Cities/Municipalities: ${cityCount}`);
  console.log(`Barangays: ${barangayCount}`);
  console.log(`Total PSGC records: ${count + provinceCount + cityCount + barangayCount}`);
}

// Execute the fix
fixRegionAssignments().catch(console.error);