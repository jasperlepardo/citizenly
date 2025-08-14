#!/usr/bin/env node

/**
 * IMPORT OFFICIAL REGIONS
 * ======================
 * 
 * This script will import the correct 18 official regions from the updated CSV file
 */

const { createClient } = require('@supabase/supabase-js');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');

const supabaseUrl = 'https://cdtcbelaimyftpxmzkjf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkdGNiZWxhaW15ZnRweG16a2pmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDg4ODU5MiwiZXhwIjoyMDcwNDY0NTkyfQ.pTuiHF7JKxhO0bcZoo8lmSveBhzKc9cqSCTb5oBcJrk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function importOfficialRegions() {
  console.log('🚀 IMPORT OFFICIAL REGIONS');
  console.log('=========================');
  
  // Step 1: Load regions from CSV
  const filePath = path.join(__dirname, '../sample data/psgc/updated/psgc_regions.updated.csv');
  const officialRegions = [];
  
  console.log('📋 Loading official regions from CSV...');
  
  await new Promise((resolve) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        if (row.code && row.name) {
          officialRegions.push({
            code: row.code,
            name: row.name
          });
        }
      })
      .on('end', () => {
        console.log(`✅ Loaded ${officialRegions.length} official regions from CSV`);
        resolve();
      });
  });
  
  // Step 2: Clear existing regions table
  console.log('\n🗑️  Clearing existing regions...');
  const { error: deleteError } = await supabase
    .from('psgc_regions')
    .delete()
    .neq('code', 'xxx'); // Delete all
  
  if (deleteError) {
    console.log('❌ Error clearing regions:', deleteError.message);
    return;
  }
  console.log('✅ Cleared existing regions');
  
  // Step 3: Insert official regions
  console.log('\n📥 Inserting official regions...');
  
  for (const region of officialRegions) {
    const { error } = await supabase
      .from('psgc_regions')
      .insert({
        code: region.code,
        name: region.name
      });
    
    if (!error) {
      console.log(`✅ Inserted ${region.code} - ${region.name}`);
    } else {
      console.log(`❌ Error inserting ${region.code}:`, error.message);
    }
  }
  
  // Step 4: Verify final count
  const { count: finalRegionCount } = await supabase
    .from('psgc_regions')
    .select('*', { count: 'exact', head: true });
  
  console.log('\n🏆 FINAL VERIFICATION');
  console.log('===================');
  console.log(`Total regions in database: ${finalRegionCount}`);
  
  if (finalRegionCount === 18) {
    console.log('🎉 SUCCESS! Correctly imported 18 official regions!');
  } else {
    console.log(`⚠️  Expected 18 regions, but got ${finalRegionCount}`);
  }
  
  // Step 5: Show all regions
  const { data: allRegions } = await supabase
    .from('psgc_regions')
    .select('code, name')
    .order('code');
  
  console.log('\n📋 ALL OFFICIAL REGIONS:');
  console.log('========================');
  allRegions.forEach((region, index) => {
    console.log(`${index + 1}. ${region.code} - ${region.name}`);
  });
}

importOfficialRegions().catch(console.error);