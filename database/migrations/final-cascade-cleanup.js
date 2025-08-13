#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');

const supabaseUrl = 'https://cdtcbelaimyftpxmzkjf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkdGNiZWxhaW15ZnRweG16a2pmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDg4ODU5MiwiZXhwIjoyMDcwNDY0NTkyfQ.pTuiHF7JKxhO0bcZoo8lmSveBhzKc9cqSCTb5oBcJrk';
const supabase = createClient(supabaseUrl, supabaseKey);

async function finalCleanup() {
  console.log('🚀 FINAL CASCADE CLEANUP');
  console.log('=======================');
  
  // Load official provinces
  const officialProvinces = new Set();
  const filePath = path.join(__dirname, '../sample data/psgc/updated/psgc_provinces.updated.csv');
  
  await new Promise((resolve) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => { if (row.code) officialProvinces.add(row.code); })
      .on('end', resolve);
  });
  
  console.log(`✅ Loaded ${officialProvinces.size} official provinces`);
  
  // Step 1: Delete barangays referencing invalid cities
  const { data: allCities } = await supabase.from('psgc_cities_municipalities').select('code, province_code');
  const invalidCityCodes = allCities.filter(c => !officialProvinces.has(c.province_code)).map(c => c.code);
  
  console.log(`\n🗑️  Step 1: Delete barangays in ${invalidCityCodes.length} invalid cities`);
  
  const batchSize = 100;
  let deletedBarangays = 0;
  
  for (let i = 0; i < invalidCityCodes.length; i += batchSize) {
    const batch = invalidCityCodes.slice(i, i + batchSize);
    const { error, count } = await supabase
      .from('psgc_barangays')
      .delete()
      .in('city_municipality_code', batch);
    
    if (!error) {
      deletedBarangays += (count || 0);
      console.log(`✅ Deleted barangay batch ${Math.floor(i/batchSize) + 1}: ~${deletedBarangays} total`);
    }
  }
  
  // Step 2: Delete invalid cities
  console.log(`\n🗑️  Step 2: Delete ${invalidCityCodes.length} invalid cities`);
  
  for (let i = 0; i < invalidCityCodes.length; i += batchSize) {
    const batch = invalidCityCodes.slice(i, i + batchSize);
    const { error } = await supabase.from('psgc_cities_municipalities').delete().in('code', batch);
    if (!error) {
      console.log(`✅ Deleted city batch ${Math.floor(i/batchSize) + 1}`);
    }
  }
  
  // Step 3: Delete non-official provinces
  const { data: allProvinces } = await supabase.from('psgc_provinces').select('code, name');
  const provincesToDelete = allProvinces.filter(p => !officialProvinces.has(p.code));
  
  console.log(`\n🗑️  Step 3: Delete ${provincesToDelete.length} non-official provinces`);
  
  for (const province of provincesToDelete) {
    const { error } = await supabase.from('psgc_provinces').delete().eq('code', province.code);
    if (error) console.log(`❌ Error deleting province ${province.code}`);
  }
  
  // Step 4: Delete unused regions
  console.log(`\n🗑️  Step 4: Delete unused regions`);
  
  const { data: remainingProvinces } = await supabase.from('psgc_provinces').select('region_code');
  const usedRegions = new Set(remainingProvinces.map(p => p.region_code));
  
  const { data: allRegions } = await supabase.from('psgc_regions').select('code, name');
  const regionsToDelete = allRegions.filter(r => !usedRegions.has(r.code));
  
  for (const region of regionsToDelete) {
    const { error } = await supabase.from('psgc_regions').delete().eq('code', region.code);
    if (!error) console.log(`✅ Deleted region ${region.code}`);
  }
  
  // Final counts
  const { count: finalRegions } = await supabase.from('psgc_regions').select('*', { count: 'exact', head: true });
  const { count: finalProvinces } = await supabase.from('psgc_provinces').select('*', { count: 'exact', head: true });
  const { count: finalCities } = await supabase.from('psgc_cities_municipalities').select('*', { count: 'exact', head: true });
  const { count: finalBarangays } = await supabase.from('psgc_barangays').select('*', { count: 'exact', head: true });
  
  console.log(`\n🏆 FINAL RESULTS:`);
  console.log(`=================`);
  console.log(`Regions: ${finalRegions}`);
  console.log(`Provinces: ${finalProvinces}`);
  console.log(`Cities: ${finalCities}`);
  console.log(`Barangays: ${finalBarangays}`);
  
  if (finalRegions <= 17 && finalProvinces === 82) {
    console.log(`\n🎉 SUCCESS! Clean official PSGC database achieved!`);
  }
}

finalCleanup().catch(console.error);