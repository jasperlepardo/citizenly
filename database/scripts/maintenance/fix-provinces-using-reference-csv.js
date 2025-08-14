#!/usr/bin/env node

/**
 * FIX PROVINCES USING REFERENCE CSV
 * =================================
 * 
 * This script will:
 * 1. Load the correct province-region mappings from psgc_provinces.updated.csv
 * 2. Fix all real provinces to use their correct regions
 * 3. Delete all generated "Province XXXX" entries
 * 4. Delete unused extra regions
 */

const { createClient } = require('@supabase/supabase-js');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');

const supabaseUrl = 'https://cdtcbelaimyftpxmzkjf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkdGNiZWxhaW15ZnRweG16a2pmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDg4ODU5MiwiZXhwIjoyMDcwNDY0NTkyfQ.pTuiHF7JKxhO0bcZoo8lmSveBhzKc9cqSCTb5oBcJrk';

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🚀 FIX PROVINCES USING REFERENCE CSV');
console.log('====================================');

async function fixProvincesUsingReferenceCSV() {
  try {
    console.log('\n📋 Step 1: Load correct province mappings from reference CSV...');
    const officialProvinces = await loadOfficialProvinceMapping();
    
    console.log('\n📋 Step 2: Analyze current database provinces...');
    await analyzeCurrentProvinces(officialProvinces);
    
    console.log('\n📋 Step 3: Fix real provinces to correct regions...');
    await fixRealProvinces(officialProvinces);
    
    console.log('\n📋 Step 4: Delete generated provinces...');
    await deleteGeneratedProvinces(officialProvinces);
    
    console.log('\n📋 Step 5: Delete unused regions...');
    await deleteUnusedRegions();
    
    console.log('\n📋 Step 6: Final verification...');
    await finalVerification();
    
    console.log('\n✅ Province cleanup complete!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

async function loadOfficialProvinceMapping() {
  const filePath = path.join(__dirname, '../sample data/psgc/updated/psgc_provinces.updated.csv');
  
  console.log('📊 Reading official province mapping from CSV...');
  
  return new Promise((resolve) => {
    const provinces = new Map();
    
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        if (row.code && row.name && row.region_code) {
          provinces.set(row.code, {
            code: row.code,
            name: row.name,
            region_code: row.region_code,
            is_active: row.is_active === 'True'
          });
        }
      })
      .on('end', () => {
        console.log(`✅ Loaded ${provinces.size} official provinces from reference CSV`);
        resolve(provinces);
      });
  });
}

async function analyzeCurrentProvinces(officialProvinces) {
  const { data: dbProvinces } = await supabase
    .from('psgc_provinces')
    .select('code, name, region_code');
  
  console.log(`📊 Found ${dbProvinces.length} provinces in database`);
  
  let realProvinces = 0;
  let correctlyAssigned = 0;
  let needingCorrection = 0;
  let generatedProvinces = 0;
  let unknownProvinces = 0;
  
  const corrections = [];
  const toDelete = [];
  
  for (const dbProvince of dbProvinces) {
    const official = officialProvinces.get(dbProvince.code);
    
    if (official) {
      realProvinces++;
      if (dbProvince.region_code === official.region_code) {
        correctlyAssigned++;
      } else {
        needingCorrection++;
        corrections.push({
          code: dbProvince.code,
          name: dbProvince.name,
          currentRegion: dbProvince.region_code,
          correctRegion: official.region_code
        });
      }
    } else if (dbProvince.name.startsWith('Province ') || dbProvince.name.includes('Province ')) {
      generatedProvinces++;
      toDelete.push(dbProvince);
    } else {
      unknownProvinces++;
      console.log(`⚠️  Unknown: ${dbProvince.code} - ${dbProvince.name}`);
    }
  }
  
  console.log(`\n📊 ANALYSIS RESULTS:`);
  console.log(`===================`);
  console.log(`Real provinces (in reference): ${realProvinces}`);
  console.log(`  ✅ Correctly assigned: ${correctlyAssigned}`);
  console.log(`  🔧 Need correction: ${needingCorrection}`);
  console.log(`Generated provinces to delete: ${generatedProvinces}`);
  console.log(`Unknown provinces: ${unknownProvinces}`);
  
  return { corrections, toDelete };
}

async function fixRealProvinces(officialProvinces) {
  console.log('🔧 Fixing real provinces to correct regions...');
  
  const { data: dbProvinces } = await supabase
    .from('psgc_provinces')
    .select('code, name, region_code');
  
  let fixed = 0;
  let errors = 0;
  
  for (const dbProvince of dbProvinces) {
    const official = officialProvinces.get(dbProvince.code);
    
    if (official && dbProvince.region_code !== official.region_code) {
      const { error } = await supabase
        .from('psgc_provinces')
        .update({ region_code: official.region_code })
        .eq('code', dbProvince.code);
      
      if (!error) {
        fixed++;
        console.log(`✅ Fixed ${dbProvince.code} (${dbProvince.name}): ${dbProvince.region_code} → ${official.region_code}`);
      } else {
        errors++;
        console.log(`❌ Error fixing ${dbProvince.code}:`, error.message);
      }
    }
  }
  
  console.log(`📊 Fixed ${fixed} provinces, ${errors} errors`);
}

async function deleteGeneratedProvinces(officialProvinces) {
  console.log('🗑️  Deleting generated provinces...');
  
  const { data: dbProvinces } = await supabase
    .from('psgc_provinces')
    .select('code, name');
  
  const toDelete = dbProvinces.filter(p => 
    !officialProvinces.has(p.code) && 
    (p.name.startsWith('Province ') || p.name.includes('Province '))
  );
  
  console.log(`📊 Found ${toDelete.length} generated provinces to delete`);
  
  let deleted = 0;
  let errors = 0;
  
  for (const province of toDelete) {
    const { error } = await supabase
      .from('psgc_provinces')
      .delete()
      .eq('code', province.code);
    
    if (!error) {
      deleted++;
      console.log(`✅ Deleted ${province.code} - ${province.name}`);
    } else {
      errors++;
      console.log(`❌ Error deleting ${province.code}:`, error.message);
    }
  }
  
  console.log(`📊 Deleted ${deleted} provinces, ${errors} errors`);
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
  
  console.log(`📊 Found ${unusedRegions.length} unused regions to delete`);
  
  let deleted = 0;
  
  for (const region of unusedRegions) {
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
  
  console.log('\n🏆 FINAL VERIFICATION');
  console.log('=====================');
  console.log(`Total regions: ${regionCount}`);
  console.log(`Total provinces: ${provinceCount}`);
  
  if (regionCount <= 17) {
    console.log('🎉 PERFECT! Achieved official 17 regions structure');
  } else if (regionCount <= 20) {
    console.log('🎉 EXCELLENT! Clean region structure achieved');
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
}

// Execute
fixProvincesUsingReferenceCSV().catch(console.error);