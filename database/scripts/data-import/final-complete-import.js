#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');

// Load environment
const supabaseUrl = 'https://cdtcbelaimyftpxmzkjf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkdGNiZWxhaW15ZnRweG16a2pmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDg4ODU5MiwiZXhwIjoyMDcwNDY0NTkyfQ.pTuiHF7JKxhO0bcZoo8lmSveBhzKc9cqSCTb5oBcJrk';

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🚀 FINAL COMPLETE PSGC IMPORT - ALL BARANGAYS');
console.log('==============================================');

async function finalCompleteImport() {
  try {
    // Step 1: Create any missing provinces that barangays need
    console.log('\n📋 Step 1: Ensuring all required provinces exist...');
    await ensureAllProvinces();
    
    // Step 2: Create any missing cities that barangays need
    console.log('\n📋 Step 2: Ensuring all required cities exist...');
    await ensureAllCities();
    
    // Step 3: Import ALL barangays
    console.log('\n📋 Step 3: Importing ALL possible barangays...');
    await importAllBarangays();
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

async function ensureAllProvinces() {
  // The 7 missing provinces we identified
  const missingProvinces = [
    { code: '0997', name: 'Basilan (Independent City)', region_code: '09' },
    { code: '1298', name: 'Cotabato (Independent City)', region_code: '12' },
    { code: '1339', name: 'National Capital Region - Manila', region_code: '13' },
    { code: '1374', name: 'National Capital Region - Eastern Manila', region_code: '13' },
    { code: '1375', name: 'National Capital Region - Northern Manila', region_code: '13' },
    { code: '1376', name: 'National Capital Region - Southern Manila', region_code: '13' },
    { code: '1538', name: 'Maguindanao', region_code: '15' }
  ];
  
  for (const province of missingProvinces) {
    const { error } = await supabase
      .from('psgc_provinces')
      .upsert({ ...province, is_active: true }, { onConflict: 'code' });
    
    if (error && !error.message.includes('duplicate key')) {
      console.log('❌ Error adding province', province.name + ':', error.message);
    } else {
      console.log('✅ Ensured province:', province.name);
    }
  }
}

async function ensureAllCities() {
  // Get current provinces for reference
  const { data: provinces } = await supabase.from('psgc_provinces').select('code, name');
  const provinceMap = new Map(provinces?.map(p => [p.code, p.name]) || []);
  
  // Load barangay CSV to find all city codes
  const filePath = path.join(__dirname, '../sample data/psgc/updated/psgc_barangays.updated.csv');
  const allCityCodes = new Set();
  
  return new Promise((resolve) => {
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        if (row.city_municipality_code && row.city_municipality_code.match(/^\d{6}$/)) {
          allCityCodes.add(row.city_municipality_code);
        }
      })
      .on('end', async () => {
        console.log('✅ Found', allCityCodes.size, 'unique city codes in barangay data');
        
        // Get existing cities
        const { data: existingCities } = await supabase.from('psgc_cities_municipalities').select('code');
        const existingCodes = new Set(existingCities?.map(c => c.code) || []);
        
        console.log('✅ Found', existingCodes.size, 'existing cities in database');
        
        // Find missing cities
        const missingCities = Array.from(allCityCodes).filter(code => !existingCodes.has(code));
        console.log('❌ Need to create', missingCities.length, 'missing cities');
        
        // Create missing cities
        if (missingCities.length > 0) {
          const newCities = missingCities.map(code => {
            const provinceCode = code.substring(0, 4);
            const provinceName = provinceMap.get(provinceCode) || 'Unknown Province';
            
            return {
              code: code,
              name: `Municipality ${code} (${provinceName})`,
              province_code: provinceCode,
              type: 'Municipality',
              is_independent: false,
              is_active: true
            };
          });
          
          // Insert in batches
          const batchSize = 100;
          for (let i = 0; i < newCities.length; i += batchSize) {
            const batch = newCities.slice(i, i + batchSize);
            const { error } = await supabase.from('psgc_cities_municipalities').upsert(batch, { onConflict: 'code' });
            
            if (error) {
              console.log('❌ Error creating cities batch:', error.message);
            } else {
              console.log('✅ Created cities batch', Math.floor(i/batchSize) + 1);
            }
          }
        }
        
        resolve();
      });
  });
}

async function importAllBarangays() {
  // Get ALL current cities (fresh query)
  const { data: allCities } = await supabase.from('psgc_cities_municipalities').select('code');
  const validCityCodes = new Set(allCities?.map(c => c.code) || []);
  
  console.log('✅ Ready to import barangays for', validCityCodes.size, 'cities');
  
  // Load and transform barangays
  const filePath = path.join(__dirname, '../sample data/psgc/updated/psgc_barangays.updated.csv');
  
  return new Promise((resolve) => {
    const validBarangays = [];
    let totalBarangays = 0;
    
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        totalBarangays++;
        
        if (row.city_municipality_code && validCityCodes.has(row.city_municipality_code)) {
          validBarangays.push({
            code: row.code,
            name: row.name,
            city_municipality_code: row.city_municipality_code,
            is_active: true
          });
        }
      })
      .on('end', async () => {
        console.log('📊 Total barangays in CSV:', totalBarangays);
        console.log('✅ Barangays ready for import:', validBarangays.length);
        console.log('❌ Barangays without valid cities:', totalBarangays - validBarangays.length);
        
        // Clear existing barangays
        console.log('🧹 Clearing existing barangays...');
        await supabase.from('psgc_barangays').delete().gte('code', '0');
        
        // Import barangays in batches
        const batchSize = 2000;
        let imported = 0;
        
        for (let i = 0; i < validBarangays.length; i += batchSize) {
          const batch = validBarangays.slice(i, i + batchSize);
          
          const { error } = await supabase.from('psgc_barangays').upsert(batch);
          
          if (error) {
            console.log('❌ Batch error:', error.message);
          } else {
            imported += batch.length;
            console.log('✅ Imported', imported, '/', validBarangays.length, 'barangays');
          }
        }
        
        // Final count
        const { count } = await supabase.from('psgc_barangays').select('*', { count: 'exact', head: true });
        console.log('🎉 FINAL RESULT:', count, 'barangays imported!');
        
        resolve();
      });
  });
}

// Run it
finalCompleteImport().catch(console.error);