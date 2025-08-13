#!/usr/bin/env node

/**
 * RE-MIGRATE PROVINCES WITH CORRECTED DATA
 * ========================================
 * 
 * This script will sync the database provinces with the corrected CSV data,
 * ensuring we have exactly 82 official provinces with correct codes and regions
 */

const { createClient } = require('@supabase/supabase-js');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');

const supabaseUrl = 'https://cdtcbelaimyftpxmzkjf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkdGNiZWxhaW15ZnRweG16a2pmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDg4ODU5MiwiZXhwIjoyMDcwNDY0NTkyfQ.pTuiHF7JKxhO0bcZoo8lmSveBhzKc9cqSCTb5oBcJrk';

const supabase = createClient(supabaseUrl, supabaseKey);

async function remigrateProvincesWithCorrectedData() {
  console.log('🚀 RE-MIGRATE PROVINCES WITH CORRECTED DATA');
  console.log('===========================================');
  
  // Step 1: Load official provinces from corrected CSV
  const filePath = path.join(__dirname, '../sample data/psgc/updated/psgc_provinces.updated.csv');
  const officialProvinces = new Map();
  
  console.log('📋 Loading official provinces from corrected CSV...');
  
  await new Promise((resolve) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        if (row.code && row.name && row.region_code) {
          officialProvinces.set(row.code, {
            code: row.code,
            name: row.name,
            region_code: row.region_code,
            is_active: row.is_active === 'True'
          });
        }
      })
      .on('end', () => {
        console.log(`✅ Loaded ${officialProvinces.size} official provinces from CSV`);
        resolve();
      });
  });
  
  // Step 2: Get existing provinces from database
  const { data: existingProvinces } = await supabase
    .from('psgc_provinces')
    .select('code, name, region_code');
  
  console.log(`📊 Found ${existingProvinces.length} existing provinces in database`);
  
  // Step 3: Clear existing provinces table (since we have foreign key issues)
  console.log('\n🗑️  Clearing existing provinces table...');
  const { error: deleteError } = await supabase
    .from('psgc_provinces')
    .delete()
    .neq('code', 'xxx'); // Delete all
  
  if (deleteError) {
    console.log('❌ Error clearing provinces:', deleteError.message);
    console.log('⚠️  Will try to update/insert instead...');
    
    // Alternative approach: Update existing and insert missing
    await updateAndInsertProvinces(officialProvinces, existingProvinces);
  } else {
    console.log('✅ Cleared existing provinces');
    
    // Insert all official provinces
    console.log('\n📥 Inserting all official provinces...');
    
    const provincesArray = Array.from(officialProvinces.values());
    const batchSize = 20;
    let inserted = 0;
    
    for (let i = 0; i < provincesArray.length; i += batchSize) {
      const batch = provincesArray.slice(i, i + batchSize);
      
      const { error } = await supabase
        .from('psgc_provinces')
        .insert(batch);
      
      if (!error) {
        inserted += batch.length;
        console.log(`✅ Inserted batch ${Math.floor(i/batchSize) + 1}: ${inserted}/${provincesArray.length} provinces`);
      } else {
        console.log(`❌ Error inserting batch ${Math.floor(i/batchSize) + 1}:`, error.message);
        
        // Try individual inserts for this batch
        for (const province of batch) {
          const { error: individualError } = await supabase
            .from('psgc_provinces')
            .insert(province);
          
          if (!individualError) {
            inserted++;
            console.log(`✅ Individually inserted ${province.code} - ${province.name}`);
          } else {
            console.log(`❌ Failed to insert ${province.code}:`, individualError.message);
          }
        }
      }
    }
  }
  
  // Step 4: Final verification
  await finalVerification(officialProvinces);
}

async function updateAndInsertProvinces(officialProvinces, existingProvinces) {
  console.log('\n🔄 Updating existing provinces and inserting missing ones...');
  
  const existingCodes = new Set(existingProvinces.map(p => p.code));
  let updated = 0;
  let inserted = 0;
  
  // Update existing provinces
  for (const existing of existingProvinces) {
    const official = officialProvinces.get(existing.code);
    
    if (official) {
      // Update if different
      if (existing.name !== official.name || existing.region_code !== official.region_code) {
        const { error } = await supabase
          .from('psgc_provinces')
          .update({
            name: official.name,
            region_code: official.region_code
          })
          .eq('code', existing.code);
        
        if (!error) {
          updated++;
          console.log(`✅ Updated ${existing.code}: ${existing.name} → ${official.name}`);
        }
      }
    } else {
      // This province is not in official list - delete it
      const { error } = await supabase
        .from('psgc_provinces')
        .delete()
        .eq('code', existing.code);
      
      if (!error) {
        console.log(`🗑️  Deleted non-official province ${existing.code} - ${existing.name}`);
      }
    }
  }
  
  // Insert missing provinces
  const missingProvinces = Array.from(officialProvinces.values()).filter(p => !existingCodes.has(p.code));
  
  console.log(`\n📥 Inserting ${missingProvinces.length} missing provinces...`);
  
  for (const province of missingProvinces) {
    const { error } = await supabase
      .from('psgc_provinces')
      .insert(province);
    
    if (!error) {
      inserted++;
      console.log(`✅ Inserted ${province.code} - ${province.name}`);
    } else {
      console.log(`❌ Failed to insert ${province.code}:`, error.message);
    }
  }
  
  console.log(`📊 Updated: ${updated}, Inserted: ${inserted}`);
}

async function finalVerification(officialProvinces) {
  const { count: finalProvinceCount } = await supabase
    .from('psgc_provinces')
    .select('*', { count: 'exact', head: true });
  
  const { count: regionCount } = await supabase
    .from('psgc_regions')
    .select('*', { count: 'exact', head: true });
    
  const { count: cityCount } = await supabase
    .from('psgc_cities_municipalities')
    .select('*', { count: 'exact', head: true });
    
  const { count: barangayCount } = await supabase
    .from('psgc_barangays')
    .select('*', { count: 'exact', head: true });
  
  console.log('\n🏆 FINAL VERIFICATION');
  console.log('===================');
  console.log(`Regions: ${regionCount}`);
  console.log(`Provinces: ${finalProvinceCount}`);
  console.log(`Cities: ${cityCount}`);
  console.log(`Barangays: ${barangayCount}`);
  
  if (finalProvinceCount === 82) {
    console.log('🎉 SUCCESS! Database now has exactly 82 official provinces!');
  } else {
    console.log(`⚠️  Expected 82 provinces, but got ${finalProvinceCount}`);
  }
  
  // Check for any discrepancies
  const { data: dbProvinces } = await supabase
    .from('psgc_provinces')
    .select('code, name, region_code')
    .order('code');
  
  console.log('\n📋 PROVINCE VERIFICATION:');
  console.log('=========================');
  
  let correctProvinces = 0;
  let incorrectProvinces = 0;
  
  for (const dbProvince of dbProvinces) {
    const official = officialProvinces.get(dbProvince.code);
    if (official) {
      if (dbProvince.name === official.name && dbProvince.region_code === official.region_code) {
        correctProvinces++;
      } else {
        incorrectProvinces++;
        console.log(`❌ Mismatch ${dbProvince.code}: DB="${dbProvince.name}" (${dbProvince.region_code}) vs Official="${official.name}" (${official.region_code})`);
      }
    } else {
      incorrectProvinces++;
      console.log(`❌ Non-official province in DB: ${dbProvince.code} - ${dbProvince.name}`);
    }
  }
  
  console.log(`✅ Correct provinces: ${correctProvinces}`);
  console.log(`❌ Incorrect provinces: ${incorrectProvinces}`);
  
  if (regionCount === 18 && finalProvinceCount === 82 && incorrectProvinces === 0) {
    console.log('\n🎊 PERFECT! Clean official PSGC database achieved! 🎊');
    console.log('✅ 18 official regions');
    console.log('✅ 82 official provinces');
    console.log('✅ All data matches official PSGC structure');
  }
}

remigrateProvincesWithCorrectedData().catch(console.error);