#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');

const supabaseUrl = 'https://cdtcbelaimyftpxmzkjf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkdGNiZWxhaW15ZnRweG16a2pmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDg4ODU5MiwiZXhwIjoyMDcwNDY0NTkyIn0.pTuiHF7JKxhO0bcZoo8lmSveBhzKc9cqSCTb5oBcJrk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function finalCleanupCheck() {
  console.log('🔍 FINAL CLEANUP CHECK');
  console.log('======================');
  
  // Load official provinces
  const filePath = path.join(__dirname, '../sample data/psgc/updated/psgc_provinces.updated.csv');
  const officialProvinces = new Set();
  
  await new Promise((resolve) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => { if (row.code) officialProvinces.add(row.code); })
      .on('end', resolve);
  });
  
  console.log(`✅ Loaded ${officialProvinces.size} official provinces`);
  
  // Check remaining cities
  const { data: cities } = await supabase.from('psgc_cities_municipalities').select('code, name, province_code');
  const invalidCities = cities ? cities.filter(c => !officialProvinces.has(c.province_code)) : [];
  
  console.log(`\n📊 Found ${invalidCities.length} cities still referencing invalid provinces`);
  
  if (invalidCities.length > 0) {
    console.log('Deleting remaining invalid cities...');
    const cityCodestoDelete = invalidCities.map(c => c.code);
    
    const { error } = await supabase
      .from('psgc_cities_municipalities')
      .delete()
      .in('code', cityCodestoDelete);
    
    if (!error) {
      console.log(`✅ Deleted ${invalidCities.length} remaining invalid cities`);
    } else {
      console.log('❌ Error:', error.message);
    }
  }
  
  // Delete non-official provinces
  const { data: allProvinces } = await supabase.from('psgc_provinces').select('code, name');
  const provincesToDelete = allProvinces ? allProvinces.filter(p => !officialProvinces.has(p.code)) : [];
  
  console.log(`\n📊 Found ${provincesToDelete.length} non-official provinces to delete`);
  
  if (provincesToDelete.length > 0) {
    const provinceCodestoDelete = provincesToDelete.map(p => p.code);
    
    const { error } = await supabase
      .from('psgc_provinces')
      .delete()
      .in('code', provinceCodestoDelete);
    
    if (!error) {
      console.log(`✅ Deleted ${provincesToDelete.length} non-official provinces`);
    } else {
      console.log('❌ Error:', error.message);
    }
  }
  
  // Delete unused regions
  const { data: provinces } = await supabase.from('psgc_provinces').select('region_code');
  const usedRegions = new Set(provinces ? provinces.map(p => p.region_code) : []);
  
  const { data: allRegions } = await supabase.from('psgc_regions').select('code, name');
  const regionsToDelete = allRegions ? allRegions.filter(r => !usedRegions.has(r.code)) : [];
  
  console.log(`\n📊 Found ${regionsToDelete.length} unused regions to delete`);
  
  if (regionsToDelete.length > 0) {
    for (const region of regionsToDelete) {
      const { error } = await supabase.from('psgc_regions').delete().eq('code', region.code);
      if (!error) {
        console.log(`✅ Deleted region ${region.code}`);
      }
    }
  }
  
  // Final counts
  const { count: finalRegions } = await supabase.from('psgc_regions').select('*', { count: 'exact', head: true });
  const { count: finalProvinces } = await supabase.from('psgc_provinces').select('*', { count: 'exact', head: true });
  const { count: finalCities } = await supabase.from('psgc_cities_municipalities').select('*', { count: 'exact', head: true });
  const { count: finalBarangays } = await supabase.from('psgc_barangays').select('*', { count: 'exact', head: true });
  
  console.log('\n🏆 FINAL RESULTS:');
  console.log('=================');
  console.log(`Regions: ${finalRegions}`);
  console.log(`Provinces: ${finalProvinces}`);
  console.log(`Cities: ${finalCities}`);
  console.log(`Barangays: ${finalBarangays}`);
  
  if (finalRegions <= 17 && finalProvinces === 82) {
    console.log('\n🎉 SUCCESS! Clean official PSGC database achieved!');
  }
}

finalCleanupCheck().catch(console.error);