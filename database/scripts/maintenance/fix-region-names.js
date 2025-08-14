#!/usr/bin/env node

/**
 * FIX REGION NAMES FROM OFFICIAL CSV
 * ==================================
 * 
 * This script will:
 * 1. Compare all region names in our database against the official corrected CSV
 * 2. Report and fix any mismatches found
 * 3. Ensure all region names match the official PSGC data
 */

const { createClient } = require('@supabase/supabase-js');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');

const supabaseUrl = 'https://cdtcbelaimyftpxmzkjf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkdGNiZWxhaW15ZnRweG16a2pmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDg4ODU5MiwiZXhwIjoyMDcwNDY0NTkyfQ.pTuiHF7JKxhO0bcZoo8lmSveBhzKc9cqSCTb5oBcJrk';

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🚀 FIX REGION NAMES FROM OFFICIAL CSV');
console.log('====================================');

async function fixRegionNames() {
  try {
    console.log('\n📋 Step 1: Load official region data from CSV...');
    const officialRegions = await loadOfficialRegionData();
    
    console.log('\n📋 Step 2: Compare database regions with official data...');
    await compareAndFixRegionNames(officialRegions);
    
    console.log('\n✅ Region name correction complete!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

async function loadOfficialRegionData() {
  const filePath = path.join(__dirname, '../sample data/psgc/updated/regions_corrected.csv');
  
  console.log('📊 Reading official region data from CSV...');
  
  return new Promise((resolve) => {
    const regions = new Map();
    
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        // Store official name by code
        regions.set(row.code, row.name);
      })
      .on('end', () => {
        console.log(`✅ Loaded ${regions.size} official regions from corrected CSV`);
        resolve(regions);
      });
  });
}

async function compareAndFixRegionNames(officialRegions) {
  console.log('🔍 Comparing database regions with official data...');
  
  // Get all regions from database
  const { data: dbRegions, error } = await supabase
    .from('psgc_regions')
    .select('code, name');
  
  if (error) {
    console.log('❌ Error fetching database regions:', error.message);
    return;
  }
  
  console.log(`📊 Found ${dbRegions.length} regions in database`);
  
  const mismatches = [];
  const fixes = [];
  
  // Compare each database region with official data
  for (const dbRegion of dbRegions) {
    const officialName = officialRegions.get(dbRegion.code);
    
    if (officialName && officialName !== dbRegion.name) {
      mismatches.push({
        code: dbRegion.code,
        database_name: dbRegion.name,
        official_name: officialName
      });
      
      fixes.push({
        code: dbRegion.code,
        name: officialName
      });
    }
  }
  
  console.log(`\n📊 COMPARISON RESULTS:`);
  console.log(`   ✅ Matching regions: ${dbRegions.length - mismatches.length}`);
  console.log(`   ❌ Mismatched regions: ${mismatches.length}`);
  
  if (mismatches.length > 0) {
    console.log(`\n🔍 MISMATCHED REGIONS:`);
    console.log(`=====================`);
    
    mismatches.forEach((mismatch, index) => {
      console.log(`${index + 1}. Code: ${mismatch.code}`);
      console.log(`   Database: "${mismatch.database_name}"`);
      console.log(`   Official: "${mismatch.official_name}"`);
      console.log('');
    });
    
    // Fix the mismatches
    console.log(`🔧 Fixing ${fixes.length} region names...`);
    
    let fixed = 0;
    for (const fix of fixes) {
      const { error } = await supabase
        .from('psgc_regions')
        .update({ name: fix.name })
        .eq('code', fix.code);
      
      if (error) {
        console.log(`❌ Error fixing region ${fix.code}:`, error.message);
      } else {
        fixed++;
        console.log(`✅ Fixed region ${fix.code}: "${fix.name}"`);
      }
    }
    
    console.log(`\n🎉 FIXES COMPLETED: ${fixed}/${fixes.length} regions corrected`);
    
  } else {
    console.log('\n🎉 NO MISMATCHES FOUND - All region names are correct!');
  }
  
  // Show summary
  console.log(`\n📊 FINAL SUMMARY:`);
  console.log(`================`);
  console.log(`Total regions checked: ${dbRegions.length}`);
  console.log(`Regions with official matches: ${Array.from(officialRegions.keys()).filter(code => dbRegions.some(region => region.code === code)).length}`);
  console.log(`Mismatches found: ${mismatches.length}`);
  console.log(`Mismatches fixed: ${fixes.length}`);
}

// Execute the fix
fixRegionNames().catch(console.error);