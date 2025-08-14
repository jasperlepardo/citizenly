#!/usr/bin/env node

/**
 * LIST PROVINCES USING EXTRA REGIONS
 * ==================================
 * 
 * This script will list all provinces that are assigned to 
 * non-official regions (regions other than 01-17).
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://cdtcbelaimyftpxmzkjf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkdGNiZWxhaW15ZnRweG16a2pmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDg4ODU5MiwiZXhwIjoyMDcwNDY0NTkyfQ.pTuiHF7JKxhO0bcZoo8lmSveBhzKc9cqSCTb5oBcJrk';

const supabase = createClient(supabaseUrl, supabaseKey);

// Official 17 regions of the Philippines
const OFFICIAL_REGIONS = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12', '13', '14', '15', '16', '17'];

console.log('🚀 LIST PROVINCES USING EXTRA REGIONS');
console.log('=====================================');

async function listProvincesUsingExtraRegions() {
  try {
    console.log('\n📋 Finding provinces using non-official regions...');
    
    // Get all provinces
    const { data: allProvinces } = await supabase
      .from('psgc_provinces')
      .select('code, name, region_code')
      .order('region_code, code');
    
    // Filter provinces using extra regions
    const provincesWithExtraRegions = allProvinces.filter(p => !OFFICIAL_REGIONS.includes(p.region_code));
    
    console.log(`📊 Total provinces: ${allProvinces.length}`);
    console.log(`📊 Provinces using official regions: ${allProvinces.length - provincesWithExtraRegions.length}`);
    console.log(`📊 Provinces using extra regions: ${provincesWithExtraRegions.length}`);
    
    if (provincesWithExtraRegions.length === 0) {
      console.log('✅ All provinces are using official regions!');
      return;
    }
    
    // Group by region for better organization
    const provincesByRegion = {};
    provincesWithExtraRegions.forEach(p => {
      if (!provincesByRegion[p.region_code]) {
        provincesByRegion[p.region_code] = [];
      }
      provincesByRegion[p.region_code].push(p);
    });
    
    console.log('\n🔍 PROVINCES USING EXTRA REGIONS:');
    console.log('=================================');
    
    let totalCount = 0;
    Object.keys(provincesByRegion).sort().forEach(regionCode => {
      const provinces = provincesByRegion[regionCode];
      console.log(`\n📍 Region ${regionCode} (${provinces.length} provinces):`);
      console.log('   ' + '='.repeat(40));
      
      provinces.forEach((province, index) => {
        console.log(`   ${index + 1}. ${province.code} - ${province.name}`);
        totalCount++;
      });
    });
    
    console.log(`\n📊 SUMMARY:`);
    console.log(`===========`);
    console.log(`Extra regions in use: ${Object.keys(provincesByRegion).length}`);
    console.log(`Total provinces using extra regions: ${totalCount}`);
    
    // Show which extra regions exist
    const { data: extraRegions } = await supabase
      .from('psgc_regions')
      .select('code, name')
      .not('code', 'in', `(${OFFICIAL_REGIONS.map(r => `'${r}'`).join(',')})`)
      .order('code');
    
    console.log(`\n🗑️  EXTRA REGIONS THAT CAN BE CLEANED UP:`);
    console.log('=========================================');
    extraRegions.forEach((region, index) => {
      const provinceCount = provincesByRegion[region.code] ? provincesByRegion[region.code].length : 0;
      console.log(`${index + 1}. ${region.code} - ${region.name} (${provinceCount} provinces)`);
    });
    
    console.log(`\n💡 RECOMMENDATIONS:`);
    console.log('==================');
    console.log('1. Review these provinces to determine if they are legitimate or extrapolated data');
    console.log('2. Real provinces should be reassigned to their correct official regions (01-17)');
    console.log('3. Extrapolated/duplicate provinces can be safely deleted');
    console.log('4. After cleanup, the extra regions can be removed');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Execute
listProvincesUsingExtraRegions().catch(console.error);