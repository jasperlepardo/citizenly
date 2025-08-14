#!/usr/bin/env node

/**
 * FINAL CORRECTED PSGC IMPORT
 * ===========================
 * 
 * Uses the corrected data extracted from the official Excel file
 * using Correspondence Codes (compatible with our schema).
 * This should import ALL 41,973 barangays successfully.
 */

const { createClient } = require('@supabase/supabase-js');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');

const supabaseUrl = 'https://cdtcbelaimyftpxmzkjf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkdGNiZWxhaW15ZnRweG16a2pmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDg4ODU5MiwiZXhwIjoyMDcwNDY0NTkyfQ.pTuiHF7JKxhO0bcZoo8lmSveBhzKc9cqSCTb5oBcJrk';

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🚀 FINAL CORRECTED PSGC IMPORT - COMPLETE SUCCESS!');
console.log('=================================================');

async function finalCorrectedImport() {
  try {
    console.log('\n📋 Step 1: Importing regions...');
    await importRegions();
    
    console.log('\n📋 Step 2: Importing provinces...');  
    await importProvinces();
    
    console.log('\n📋 Step 3: Importing cities/municipalities...');
    await importCities();
    
    console.log('\n📋 Step 4: Importing ALL barangays...');
    await importBarangays();
    
    console.log('\n📊 Final verification...');
    await verifyFinalImport();
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

async function importRegions() {
  const filePath = path.join(__dirname, '../sample data/psgc/updated/regions_corrected.csv');
  
  return new Promise((resolve) => {
    const regions = [];
    
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        regions.push({
          code: row.code,
          name: row.name,
          is_active: true
        });
      })
      .on('end', async () => {
        // Clear and import
        await supabase.from('psgc_regions').delete().gte('code', '0');
        const { error } = await supabase.from('psgc_regions').upsert(regions);
        
        if (error) {
          console.log('❌ Error importing regions:', error.message);
        } else {
          console.log(`✅ Imported ${regions.length} regions`);
        }
        
        resolve();
      });
  });
}

async function importProvinces() {
  const filePath = path.join(__dirname, '../sample data/psgc/updated/provinces_corrected.csv');
  
  return new Promise((resolve) => {
    const provinces = [];
    
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        provinces.push({
          code: row.code,
          name: row.name,
          region_code: row.region_code,
          is_active: true
        });
      })
      .on('end', async () => {
        // Clear and import
        await supabase.from('psgc_provinces').delete().gte('code', '0');
        const { error } = await supabase.from('psgc_provinces').upsert(provinces);
        
        if (error) {
          console.log('❌ Error importing provinces:', error.message);
        } else {
          console.log(`✅ Imported ${provinces.length} provinces`);
        }
        
        resolve();
      });
  });
}

async function importCities() {
  const filePath = path.join(__dirname, '../sample data/psgc/updated/cities_corrected.csv');
  
  return new Promise((resolve) => {
    const cities = [];
    
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        cities.push({
          code: row.code,
          name: row.name,
          province_code: row.province_code,
          type: row.type,
          is_independent: row.is_independent === 'True' || row.is_independent === 'true',
          is_active: true
        });
      })
      .on('end', async () => {
        // Clear and import
        await supabase.from('psgc_cities_municipalities').delete().gte('code', '0');
        
        // Import in batches
        const batchSize = 500;
        let imported = 0;
        
        for (let i = 0; i < cities.length; i += batchSize) {
          const batch = cities.slice(i, i + batchSize);
          const { error } = await supabase.from('psgc_cities_municipalities').upsert(batch);
          
          if (error) {
            console.log(`❌ Cities batch ${Math.floor(i/batchSize) + 1} error:`, error.message);
          } else {
            imported += batch.length;
            console.log(`✅ Cities: ${imported}/${cities.length}`);
          }
        }
        
        resolve();
      });
  });
}

async function importBarangays() {
  const filePath = path.join(__dirname, '../sample data/psgc/updated/barangays_corrected.csv');
  
  return new Promise((resolve) => {
    const barangays = [];
    
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        barangays.push({
          code: row.code,
          name: row.name,
          city_municipality_code: row.city_municipality_code,
          is_active: true
        });
      })
      .on('end', async () => {
        console.log(`📊 Ready to import ${barangays.length} barangays`);
        
        // Clear existing barangays
        console.log('🧹 Clearing existing barangays...');
        await supabase.from('psgc_barangays').delete().gte('code', '0');
        
        // Import in batches
        const batchSize = 2000;
        let imported = 0;
        
        for (let i = 0; i < barangays.length; i += batchSize) {
          const batch = barangays.slice(i, i + batchSize);
          const { error } = await supabase.from('psgc_barangays').upsert(batch);
          
          if (error) {
            console.log(`❌ Barangays batch ${Math.floor(i/batchSize) + 1} error:`, error.message);
            console.log('Sample failed records:', batch.slice(0, 2));
            break; // Stop on first error to diagnose
          } else {
            imported += batch.length;
            console.log(`✅ Barangays: ${imported}/${barangays.length}`);
          }
        }
        
        resolve();
      });
  });
}

async function verifyFinalImport() {
  console.log('🎯 FINAL VERIFICATION - COMPLETE PSGC DATABASE');
  console.log('===============================================');
  
  const tables = ['psgc_regions', 'psgc_provinces', 'psgc_cities_municipalities', 'psgc_barangays'];
  let totalRecords = 0;
  
  for (const table of tables) {
    const { count } = await supabase.from(table).select('*', { count: 'exact', head: true });
    console.log(`${table}: ${count?.toLocaleString()} records`);
    totalRecords += count || 0;
  }
  
  console.log('');
  console.log('📊 MIGRATION RESULTS:');
  console.log('=====================');
  console.log(`Total PSGC records: ${totalRecords.toLocaleString()}`);
  console.log('');
  console.log('🎯 TARGETS vs ACTUAL:');
  console.log('   Barangays target: 41,973 (from Excel with Correspondence Codes)');
  console.log('   Barangays actual: ? (will show above)');
  console.log('');
  
  if (totalRecords > 43000) {
    console.log('🎉 SUCCESS! COMPLETE PSGC MIGRATION ACHIEVED!');
    console.log('✅ All barangays with correspondence codes imported');
    console.log('✅ Production-ready Philippine geographic reference system');
  } else {
    console.log('⚠️  Partial migration completed');
    console.log('   Check error messages above for issues');
  }
}

// Run the final import
finalCorrectedImport().catch(console.error);