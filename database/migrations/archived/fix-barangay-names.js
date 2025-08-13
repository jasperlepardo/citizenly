#!/usr/bin/env node

/**
 * FIX BARANGAY NAMES FROM OFFICIAL CSV
 * ====================================
 * 
 * This script will:
 * 1. Compare all barangay names in our database against the official corrected CSV
 * 2. Report and fix any mismatches found
 * 3. Ensure all barangay names match the official PSGC data
 */

const { createClient } = require('@supabase/supabase-js');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');

const supabaseUrl = 'https://cdtcbelaimyftpxmzkjf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkdGNiZWxhaW15ZnRweG16a2pmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDg4ODU5MiwiZXhwIjoyMDcwNDY0NTkyfQ.pTuiHF7JKxhO0bcZoo8lmSveBhzKc9cqSCTb5oBcJrk';

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🚀 FIX BARANGAY NAMES FROM OFFICIAL CSV');
console.log('======================================');

async function fixBarangayNames() {
  try {
    console.log('\n📋 Step 1: Load official barangay data from CSV...');
    const officialBarangays = await loadOfficialBarangayData();
    
    console.log('\n📋 Step 2: Compare database barangays with official data...');
    await compareAndFixBarangayNames(officialBarangays);
    
    console.log('\n✅ Barangay name correction complete!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

async function loadOfficialBarangayData() {
  const filePath = path.join(__dirname, '../sample data/psgc/updated/barangays_corrected.csv');
  
  console.log('📊 Reading official barangay data from CSV...');
  
  return new Promise((resolve) => {
    const barangays = new Map();
    
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        // Store official name by code
        barangays.set(row.code, row.name);
      })
      .on('end', () => {
        console.log(`✅ Loaded ${barangays.size} official barangays from corrected CSV`);
        resolve(barangays);
      });
  });
}

async function compareAndFixBarangayNames(officialBarangays) {
  console.log('🔍 Comparing database barangays with official data...');
  
  // Get all barangays from database
  const { data: dbBarangays, error } = await supabase
    .from('psgc_barangays')
    .select('code, name');
  
  if (error) {
    console.log('❌ Error fetching database barangays:', error.message);
    return;
  }
  
  console.log(`📊 Found ${dbBarangays.length} barangays in database`);
  
  const mismatches = [];
  const fixes = [];
  
  // Compare each database barangay with official data
  for (const dbBarangay of dbBarangays) {
    const officialName = officialBarangays.get(dbBarangay.code);
    
    if (officialName && officialName !== dbBarangay.name) {
      mismatches.push({
        code: dbBarangay.code,
        database_name: dbBarangay.name,
        official_name: officialName
      });
      
      fixes.push({
        code: dbBarangay.code,
        name: officialName
      });
    }
  }
  
  console.log(`\n📊 COMPARISON RESULTS:`);
  console.log(`   ✅ Matching barangays: ${dbBarangays.length - mismatches.length}`);
  console.log(`   ❌ Mismatched barangays: ${mismatches.length}`);
  
  if (mismatches.length > 0) {
    console.log(`\n🔍 FIRST 20 MISMATCHED BARANGAYS:`);
    console.log(`=================================`);
    
    mismatches.slice(0, 20).forEach((mismatch, index) => {
      console.log(`${index + 1}. Code: ${mismatch.code}`);
      console.log(`   Database: "${mismatch.database_name}"`);
      console.log(`   Official: "${mismatch.official_name}"`);
      console.log('');
    });
    
    if (mismatches.length > 20) {
      console.log(`... and ${mismatches.length - 20} more mismatches\n`);
    }
    
    // Fix the mismatches in batches
    console.log(`🔧 Fixing ${fixes.length} barangay names...`);
    
    const batchSize = 500;
    let fixed = 0;
    
    for (let i = 0; i < fixes.length; i += batchSize) {
      const batch = fixes.slice(i, i + batchSize);
      
      // Update each barangay in the batch
      for (const fix of batch) {
        const { error } = await supabase
          .from('psgc_barangays')
          .update({ name: fix.name })
          .eq('code', fix.code);
        
        if (error) {
          console.log(`❌ Error fixing barangay ${fix.code}:`, error.message);
        } else {
          fixed++;
          if (fixed % 100 === 0) {
            console.log(`✅ Progress: ${fixed}/${fixes.length} barangays fixed`);
          }
        }
      }
    }
    
    console.log(`\n🎉 FIXES COMPLETED: ${fixed}/${fixes.length} barangays corrected`);
    
  } else {
    console.log('\n🎉 NO MISMATCHES FOUND - All barangay names are correct!');
  }
  
  // Show summary
  console.log(`\n📊 FINAL SUMMARY:`);
  console.log(`================`);
  console.log(`Total barangays checked: ${dbBarangays.length}`);
  console.log(`Barangays with official matches: ${Array.from(officialBarangays.keys()).filter(code => dbBarangays.some(barangay => barangay.code === code)).length}`);
  console.log(`Mismatches found: ${mismatches.length}`);
  console.log(`Mismatches fixed: ${fixes.length}`);
}

// Execute the fix
fixBarangayNames().catch(console.error);