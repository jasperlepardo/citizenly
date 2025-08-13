#!/usr/bin/env node

/**
 * FIX CITY NAMES FROM OFFICIAL EXCEL
 * ==================================
 * 
 * This script will:
 * 1. Fix the known issue: City code 104307 should be "City of El Salvador"
 * 2. Compare all city names in our database against the official Excel file
 * 3. Report and fix any mismatches found
 */

const { createClient } = require('@supabase/supabase-js');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');

const supabaseUrl = 'https://cdtcbelaimyftpxmzkjf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkdGNiZWxhaW15ZnRweG16a2pmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDg4ODU5MiwiZXhwIjoyMDcwNDY0NTkyfQ.pTuiHF7JKxhO0bcZoo8lmSveBhzKc9cqSCTb5oBcJrk';

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🚀 FIX CITY NAMES FROM OFFICIAL EXCEL');
console.log('====================================');

async function fixCityNames() {
  try {
    console.log('\n📋 Step 1: Fix known issue - City code 104307...');
    await fixKnownCityName();
    
    console.log('\n📋 Step 2: Load official Excel data...');
    const officialCities = await loadOfficialCityData();
    
    console.log('\n📋 Step 3: Compare database cities with official data...');
    await compareAndFixCityNames(officialCities);
    
    console.log('\n✅ City name correction complete!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

async function fixKnownCityName() {
  console.log('🔧 Fixing city code 104307 to "City of El Salvador"...');
  
  const { error } = await supabase
    .from('psgc_cities_municipalities')
    .update({ name: 'City of El Salvador' })
    .eq('code', '104307');
  
  if (error) {
    console.log('❌ Error fixing city 104307:', error.message);
  } else {
    console.log('✅ Fixed city code 104307 name');
  }
}

async function loadOfficialCityData() {
  const filePath = path.join(__dirname, '../sample data/psgc/updated/cities_corrected.csv');
  
  console.log('📊 Reading official city data from CSV...');
  
  return new Promise((resolve) => {
    const cities = new Map();
    
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        // Store official name by code
        cities.set(row.code, row.name);
      })
      .on('end', () => {
        console.log(`✅ Loaded ${cities.size} official cities from corrected CSV`);
        resolve(cities);
      });
  });
}

async function compareAndFixCityNames(officialCities) {
  console.log('🔍 Comparing database cities with official data...');
  
  // Get all cities from database
  const { data: dbCities, error } = await supabase
    .from('psgc_cities_municipalities')
    .select('code, name');
  
  if (error) {
    console.log('❌ Error fetching database cities:', error.message);
    return;
  }
  
  console.log(`📊 Found ${dbCities.length} cities in database`);
  
  const mismatches = [];
  const fixes = [];
  
  // Compare each database city with official data
  for (const dbCity of dbCities) {
    const officialName = officialCities.get(dbCity.code);
    
    if (officialName && officialName !== dbCity.name) {
      mismatches.push({
        code: dbCity.code,
        database_name: dbCity.name,
        official_name: officialName
      });
      
      fixes.push({
        code: dbCity.code,
        name: officialName
      });
    }
  }
  
  console.log(`\n📊 COMPARISON RESULTS:`);
  console.log(`   ✅ Matching cities: ${dbCities.length - mismatches.length}`);
  console.log(`   ❌ Mismatched cities: ${mismatches.length}`);
  
  if (mismatches.length > 0) {
    console.log(`\n🔍 MISMATCHED CITIES:`);
    console.log(`====================`);
    
    mismatches.forEach((mismatch, index) => {
      console.log(`${index + 1}. Code: ${mismatch.code}`);
      console.log(`   Database: "${mismatch.database_name}"`);
      console.log(`   Official: "${mismatch.official_name}"`);
      console.log('');
    });
    
    // Fix the mismatches
    console.log(`🔧 Fixing ${fixes.length} city names...`);
    
    let fixed = 0;
    for (const fix of fixes) {
      const { error } = await supabase
        .from('psgc_cities_municipalities')
        .update({ name: fix.name })
        .eq('code', fix.code);
      
      if (error) {
        console.log(`❌ Error fixing city ${fix.code}:`, error.message);
      } else {
        fixed++;
        console.log(`✅ Fixed city ${fix.code}: "${fix.name}"`);
      }
    }
    
    console.log(`\n🎉 FIXES COMPLETED: ${fixed}/${fixes.length} cities corrected`);
    
  } else {
    console.log('\n🎉 NO MISMATCHES FOUND - All city names are correct!');
  }
  
  // Show summary
  console.log(`\n📊 FINAL SUMMARY:`);
  console.log(`================`);
  console.log(`Total cities checked: ${dbCities.length}`);
  console.log(`Cities with official matches: ${Array.from(officialCities.keys()).filter(code => dbCities.some(city => city.code === code)).length}`);
  console.log(`Mismatches found: ${mismatches.length}`);
  console.log(`Mismatches fixed: ${fixes.length}`);
}

// Execute the fix
fixCityNames().catch(console.error);