#!/usr/bin/env node

/**
 * FIX PROVINCE NAMES FROM OFFICIAL CSV
 * ====================================
 * 
 * This script will:
 * 1. Compare all province names in our database against the official corrected CSV
 * 2. Report and fix any mismatches found
 * 3. Ensure all province names match the official PSGC data
 */

const { createClient } = require('@supabase/supabase-js');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');

const supabaseUrl = 'https://cdtcbelaimyftpxmzkjf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkdGNiZWxhaW15ZnRweG16a2pmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDg4ODU5MiwiZXhwIjoyMDcwNDY0NTkyfQ.pTuiHF7JKxhO0bcZoo8lmSveBhzKc9cqSCTb5oBcJrk';

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🚀 FIX PROVINCE NAMES FROM OFFICIAL CSV');
console.log('======================================');

async function fixProvinceNames() {
  try {
    console.log('\n📋 Step 1: Load official province data from CSV...');
    const officialProvinces = await loadOfficialProvinceData();
    
    console.log('\n📋 Step 2: Compare database provinces with official data...');
    await compareAndFixProvinceNames(officialProvinces);
    
    console.log('\n✅ Province name correction complete!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

async function loadOfficialProvinceData() {
  const filePath = path.join(__dirname, '../sample data/psgc/updated/provinces_corrected.csv');
  
  console.log('📊 Reading official province data from CSV...');
  
  return new Promise((resolve) => {
    const provinces = new Map();
    
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        // Store official name by code
        provinces.set(row.code, row.name);
      })
      .on('end', () => {
        console.log(`✅ Loaded ${provinces.size} official provinces from corrected CSV`);
        resolve(provinces);
      });
  });
}

async function compareAndFixProvinceNames(officialProvinces) {
  console.log('🔍 Comparing database provinces with official data...');
  
  // Get all provinces from database
  const { data: dbProvinces, error } = await supabase
    .from('psgc_provinces')
    .select('code, name');
  
  if (error) {
    console.log('❌ Error fetching database provinces:', error.message);
    return;
  }
  
  console.log(`📊 Found ${dbProvinces.length} provinces in database`);
  
  const mismatches = [];
  const fixes = [];
  
  // Compare each database province with official data
  for (const dbProvince of dbProvinces) {
    const officialName = officialProvinces.get(dbProvince.code);
    
    if (officialName && officialName !== dbProvince.name) {
      mismatches.push({
        code: dbProvince.code,
        database_name: dbProvince.name,
        official_name: officialName
      });
      
      fixes.push({
        code: dbProvince.code,
        name: officialName
      });
    }
  }
  
  console.log(`\n📊 COMPARISON RESULTS:`);
  console.log(`   ✅ Matching provinces: ${dbProvinces.length - mismatches.length}`);
  console.log(`   ❌ Mismatched provinces: ${mismatches.length}`);
  
  if (mismatches.length > 0) {
    console.log(`\n🔍 MISMATCHED PROVINCES:`);
    console.log(`=======================`);
    
    mismatches.forEach((mismatch, index) => {
      console.log(`${index + 1}. Code: ${mismatch.code}`);
      console.log(`   Database: "${mismatch.database_name}"`);
      console.log(`   Official: "${mismatch.official_name}"`);
      console.log('');
    });
    
    // Fix the mismatches
    console.log(`🔧 Fixing ${fixes.length} province names...`);
    
    let fixed = 0;
    for (const fix of fixes) {
      const { error } = await supabase
        .from('psgc_provinces')
        .update({ name: fix.name })
        .eq('code', fix.code);
      
      if (error) {
        console.log(`❌ Error fixing province ${fix.code}:`, error.message);
      } else {
        fixed++;
        console.log(`✅ Fixed province ${fix.code}: "${fix.name}"`);
      }
    }
    
    console.log(`\n🎉 FIXES COMPLETED: ${fixed}/${fixes.length} provinces corrected`);
    
  } else {
    console.log('\n🎉 NO MISMATCHES FOUND - All province names are correct!');
  }
  
  // Show summary
  console.log(`\n📊 FINAL SUMMARY:`);
  console.log(`================`);
  console.log(`Total provinces checked: ${dbProvinces.length}`);
  console.log(`Provinces with official matches: ${Array.from(officialProvinces.keys()).filter(code => dbProvinces.some(province => province.code === code)).length}`);
  console.log(`Mismatches found: ${mismatches.length}`);
  console.log(`Mismatches fixed: ${fixes.length}`);
}

// Execute the fix
fixProvinceNames().catch(console.error);