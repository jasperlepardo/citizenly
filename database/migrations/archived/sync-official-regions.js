#!/usr/bin/env node

/**
 * SYNC OFFICIAL REGIONS
 * =====================
 * 
 * This script will sync the database with the correct 18 official regions
 * by updating existing ones and adding missing ones
 */

const { createClient } = require('@supabase/supabase-js');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');

const supabaseUrl = 'https://cdtcbelaimyftpxmzkjf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkdGNiZWxhaW15ZnRweG16a2pmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDg4ODU5MiwiZXhwIjoyMDcwNDY0NTkyfQ.pTuiHF7JKxhO0bcZoo8lmSveBhzKc9cqSCTb5oBcJrk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function syncOfficialRegions() {
  console.log('🚀 SYNC OFFICIAL REGIONS');
  console.log('========================');
  
  // Step 1: Load official regions from CSV
  const filePath = path.join(__dirname, '../sample data/psgc/updated/psgc_regions.updated.csv');
  const officialRegions = new Map();
  
  console.log('📋 Loading official regions from CSV...');
  
  await new Promise((resolve) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        if (row.code && row.name) {
          officialRegions.set(row.code, {
            code: row.code,
            name: row.name
          });
        }
      })
      .on('end', () => {
        console.log(`✅ Loaded ${officialRegions.size} official regions from CSV`);
        resolve();
      });
  });
  
  // Step 2: Get existing regions from database
  const { data: existingRegions } = await supabase
    .from('psgc_regions')
    .select('code, name');
  
  console.log(`📊 Found ${existingRegions.length} existing regions in database`);
  
  // Step 3: Update existing regions and identify missing ones
  let updated = 0;
  let alreadyCorrect = 0;
  const missingRegions = new Map(officialRegions);
  
  console.log('\n🔄 Updating existing regions...');
  
  for (const existing of existingRegions) {
    const official = officialRegions.get(existing.code);
    
    if (official) {
      // This region exists in both - remove from missing list
      missingRegions.delete(existing.code);
      
      // Update if name is different
      if (existing.name !== official.name) {
        const { error } = await supabase
          .from('psgc_regions')
          .update({ name: official.name })
          .eq('code', existing.code);
        
        if (!error) {
          updated++;
          console.log(`✅ Updated ${existing.code}: "${existing.name}" → "${official.name}"`);
        } else {
          console.log(`❌ Error updating ${existing.code}:`, error.message);
        }
      } else {
        alreadyCorrect++;
      }
    } else {
      console.log(`⚠️  Region ${existing.code} not in official list: ${existing.name}`);
    }
  }
  
  console.log(`📊 Updated: ${updated}, Already correct: ${alreadyCorrect}`);
  
  // Step 4: Insert missing regions
  console.log(`\n📥 Inserting ${missingRegions.size} missing regions...`);
  
  for (const [code, region] of missingRegions) {
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
  
  // Step 5: Final verification
  const { count: finalRegionCount } = await supabase
    .from('psgc_regions')
    .select('*', { count: 'exact', head: true });
  
  console.log('\n🏆 FINAL VERIFICATION');
  console.log('===================');
  console.log(`Total regions in database: ${finalRegionCount}`);
  
  if (finalRegionCount === 18) {
    console.log('🎉 SUCCESS! Database now has 18 official regions!');
  } else {
    console.log(`⚠️  Expected 18 regions, but got ${finalRegionCount}`);
  }
  
  // Step 6: Show all regions
  const { data: allRegions } = await supabase
    .from('psgc_regions')
    .select('code, name')
    .order('code');
  
  console.log('\n📋 ALL REGIONS IN DATABASE:');
  console.log('===========================');
  allRegions.forEach((region, index) => {
    const isOfficial = officialRegions.has(region.code) ? '✅' : '❌';
    console.log(`${index + 1}. ${isOfficial} ${region.code} - ${region.name}`);
  });
  
  // Check for any non-official regions still in database
  const nonOfficialRegions = allRegions.filter(r => !officialRegions.has(r.code));
  if (nonOfficialRegions.length > 0) {
    console.log(`\n⚠️  Found ${nonOfficialRegions.length} non-official regions still in database`);
    console.log('These may need manual cleanup if no provinces reference them.');
  }
}

syncOfficialRegions().catch(console.error);