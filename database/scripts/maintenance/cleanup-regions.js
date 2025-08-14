#!/usr/bin/env node

/**
 * CLEANUP REGIONS TO OFFICIAL 19 REGIONS
 * ======================================
 * 
 * The Philippines officially has 19 regions:
 * - 17 numbered regions (01-17) 
 * - NCR (13)
 * - CAR (14)
 * - BARMM (15)
 * - NIR (18) - Negros Island Region
 * 
 * This script will:
 * 1. Keep only the official 19 regions
 * 2. Remove extra regions created during extrapolation
 * 3. Update related records to use correct region codes
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://cdtcbelaimyftpxmzkjf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkdGNiZWxhaW15ZnRweG16a2pmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDg4ODU5MiwiZXhwIjoyMDcwNDY0NTkyfQ.pTuiHF7JKxhO0bcZoo8lmSveBhzKc9cqSCTb5oBcJrk';

const supabase = createClient(supabaseUrl, supabaseKey);

// Official 19 regions of the Philippines
const OFFICIAL_REGIONS = [
  '01', // Region I (Ilocos Region)
  '02', // Region II (Cagayan Valley)
  '03', // Region III (Central Luzon)
  '04', // Region IV-A (CALABARZON)
  '05', // Region V (Bicol Region)
  '06', // Region VI (Western Visayas)
  '07', // Region VII (Central Visayas)
  '08', // Region VIII (Eastern Visayas)
  '09', // Region IX (Zamboanga Peninsula)
  '10', // Region X (Northern Mindanao)
  '11', // Region XI (Davao Region)
  '12', // Region XII (SOCCSKSARGEN)
  '13', // National Capital Region (NCR)
  '14', // Cordillera Administrative Region (CAR)
  '15', // Bangsamoro Autonomous Region In Muslim Mindanao (BARMM)
  '16', // Region XIII (Caraga)
  '17', // MIMAROPA Region
  '18'  // Negros Island Region (NIR)
];

console.log('🚀 CLEANUP REGIONS TO OFFICIAL 19 REGIONS');
console.log('==========================================');

async function cleanupRegions() {
  try {
    console.log('\n📋 Step 1: Identify regions to remove...');
    await identifyExtraRegions();
    
    console.log('\n📋 Step 2: Update provinces with correct region codes...');
    await updateProvinceRegions();
    
    console.log('\n📋 Step 3: Remove extra regions...');
    await removeExtraRegions();
    
    console.log('\n📋 Step 4: Verify final results...');
    await verifyRegionCleanup();
    
    console.log('\n✅ Region cleanup complete!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

async function identifyExtraRegions() {
  const { data: allRegions } = await supabase
    .from('psgc_regions')
    .select('code, name')
    .order('code');
  
  const officialRegions = allRegions.filter(r => OFFICIAL_REGIONS.includes(r.code));
  const extraRegions = allRegions.filter(r => !OFFICIAL_REGIONS.includes(r.code));
  
  console.log(`📊 Current: ${allRegions.length} regions`);
  console.log(`✅ Official: ${officialRegions.length} regions`);
  console.log(`❌ Extra: ${extraRegions.length} regions to remove`);
  
  if (extraRegions.length > 0) {
    console.log('\n🔍 EXTRA REGIONS TO REMOVE:');
    console.log('===========================');
    extraRegions.forEach((region, index) => {
      console.log(`${index + 1}. ${region.code} - ${region.name}`);
    });
  }
}

async function updateProvinceRegions() {
  console.log('🔧 Checking provinces with invalid region codes...');
  
  const { data: provinces } = await supabase
    .from('psgc_provinces')
    .select('code, name, region_code');
  
  let updates = 0;
  
  for (const province of provinces) {
    if (!OFFICIAL_REGIONS.includes(province.region_code)) {
      // Map province code to correct region based on first 2 digits
      const provinceFirstTwo = province.code.substring(0, 2);
      let correctRegion = provinceFirstTwo;
      
      // Handle special cases where province code doesn't match region
      if (correctRegion === '14' && !['14'].includes(correctRegion)) {
        // CAR provinces might have different codes
        correctRegion = '14';
      }
      
      // Make sure the correct region exists in our official list
      if (OFFICIAL_REGIONS.includes(correctRegion)) {
        const { error } = await supabase
          .from('psgc_provinces')
          .update({ region_code: correctRegion })
          .eq('code', province.code);
        
        if (!error) {
          console.log(`✅ Updated province ${province.code} (${province.name}): ${province.region_code} → ${correctRegion}`);
          updates++;
        }
      }
    }
  }
  
  console.log(`📊 Updated ${updates} province region assignments`);
}

async function removeExtraRegions() {
  console.log('🧹 Removing extra regions...');
  
  // Delete regions that are not in the official list
  const { error, count } = await supabase
    .from('psgc_regions')
    .delete()
    .not('code', 'in', `(${OFFICIAL_REGIONS.map(r => `'${r}'`).join(',')})`);
  
  if (error) {
    console.log('❌ Error removing extra regions:', error.message);
  } else {
    console.log(`✅ Removed ${count || 'unknown number of'} extra regions`);
  }
}

async function verifyRegionCleanup() {
  const { data: finalRegions, count } = await supabase
    .from('psgc_regions')
    .select('code, name', { count: 'exact' })
    .order('code');
  
  console.log('\n🏆 FINAL REGION VERIFICATION');
  console.log('============================');
  console.log(`Total regions: ${count}`);
  
  if (count === 19) {
    console.log('🎉 SUCCESS! Exactly 19 regions as expected');
  } else {
    console.log(`⚠️  Expected 19 regions, but found ${count}`);
  }
  
  console.log('\n📋 FINAL REGION LIST:');
  console.log('=====================');
  finalRegions.forEach((region, index) => {
    console.log(`${index + 1}. ${region.code} - ${region.name}`);
  });
  
  // Check for any orphaned provinces
  const { data: orphanedProvinces } = await supabase
    .from('psgc_provinces')
    .select('code, name, region_code')
    .not('region_code', 'in', `(${OFFICIAL_REGIONS.map(r => `'${r}'`).join(',')})`);
  
  if (orphanedProvinces && orphanedProvinces.length > 0) {
    console.log(`\n⚠️  Found ${orphanedProvinces.length} provinces with invalid region codes:`);
    orphanedProvinces.forEach(p => {
      console.log(`   ${p.code} - ${p.name} (region: ${p.region_code})`);
    });
  } else {
    console.log('\n✅ All provinces have valid region codes');
  }
}

// Execute the cleanup
cleanupRegions().catch(console.error);