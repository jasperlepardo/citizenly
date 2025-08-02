#!/usr/bin/env node

/**
 * Create Missing Provinces Script
 * Creates special Metro Manila districts and Mindanao provinces that don't exist in standard PSGC
 */

require('dotenv').config();

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function createMissingProvinces() {
  console.log('🏗️  CREATING MISSING PROVINCES/DISTRICTS');
  console.log('========================================\n');
  
  try {
    // Define the missing provinces/districts that need to be created
    const missingProvinces = [
      // Metro Manila Districts (NCR - Region 13)
      {
        code: '1374',
        name: 'Metro Manila District 1',
        region_code: '13',
        description: 'NCR Central District (Quezon City area)'
      },
      {
        code: '1375', 
        name: 'Metro Manila District 2',
        region_code: '13',
        description: 'NCR Northern District (Caloocan area)'
      },
      {
        code: '1376',
        name: 'Metro Manila District 3', 
        region_code: '13',
        description: 'NCR Southern District (Makati/Pasay area)'
      },
      
      // Mindanao Provinces
      {
        code: '1538',
        name: 'Maguindanao del Sur',
        region_code: '15',
        description: 'BARMM - Southern Maguindanao'
      },
      {
        code: '0997',
        name: 'Basilan (Special)',
        region_code: '09',
        description: 'Special Basilan Province'
      },
      {
        code: '1298',
        name: 'Cotabato (Special)',
        region_code: '12',
        description: 'Special Cotabato Province'
      }
    ];
    
    console.log('📋 PROVINCES TO CREATE:');
    console.log('========================');
    missingProvinces.forEach(province => {
      console.log(`${province.code} - ${province.name} (Region ${province.region_code})`);
      console.log(`   ${province.description}`);
    });
    
    // Check which regions exist
    console.log('\n🔍 Verifying region codes...');
    const { data: regions } = await supabase
      .from('psgc_regions')
      .select('code, name');
    
    const regionCodes = new Set(regions.map(r => r.code));
    
    missingProvinces.forEach(province => {
      if (regionCodes.has(province.region_code)) {
        console.log(`✅ Region ${province.region_code} exists`);
      } else {
        console.log(`❌ Region ${province.region_code} missing for ${province.name}`);
      }
    });
    
    // Create the provinces
    console.log('\n📤 Creating missing provinces...');
    
    const results = {
      successful: 0,
      failed: 0,
      errors: []
    };
    
    for (const province of missingProvinces) {
      try {
        console.log(`\n⏳ Creating ${province.code} - ${province.name}...`);
        
        const { data, error } = await supabase
          .from('psgc_provinces')
          .upsert({
            code: province.code,
            name: province.name,
            region_code: province.region_code
          }, { 
            onConflict: 'code',
            ignoreDuplicates: false 
          })
          .select('code, name, region_code');
        
        if (error) {
          console.log(`❌ Failed: ${error.message}`);
          results.failed++;
          results.errors.push(`${province.code}: ${error.message}`);
        } else {
          console.log(`✅ Created: ${data[0]?.code} - ${data[0]?.name}`);
          results.successful++;
        }
        
      } catch (err) {
        console.log(`❌ Exception: ${err.message}`);
        results.failed++;
        results.errors.push(`${province.code}: ${err.message}`);
      }
      
      // Small delay between creations
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    // Report results
    console.log('\n🎉 CREATION COMPLETED');
    console.log('====================');
    console.log(`📊 Total processed: ${missingProvinces.length}`);
    console.log(`✅ Successfully created: ${results.successful}`);
    console.log(`❌ Failed creations: ${results.failed}`);
    
    if (results.errors.length > 0) {
      console.log('\n❌ Creation errors:');
      results.errors.forEach(error => console.log(`   ${error}`));
    }
    
    // Verify final state
    console.log('\n🔍 Verifying created provinces...');
    
    for (const province of missingProvinces) {
      const { data: created } = await supabase
        .from('psgc_provinces')
        .select('code, name, region_code')
        .eq('code', province.code)
        .single();
      
      if (created) {
        console.log(`✅ ${created.code} - ${created.name} (Region: ${created.region_code})`);
      } else {
        console.log(`❌ ${province.code} - STILL MISSING`);
      }
    }
    
    // Get final count
    const { count: finalCount } = await supabase
      .from('psgc_provinces')
      .select('*', { count: 'exact', head: true });
    
    console.log(`\n📊 Final province count: ${finalCount?.toLocaleString() || 0}`);
    
    if (results.successful > 0) {
      console.log('\n🎯 PROVINCE CREATION SUCCESS!');
      console.log('The missing provinces have been created.');
      console.log('This should unlock the blocked city imports!');
      console.log('\n💡 NEXT STEPS:');
      console.log('1. Re-run the city import script');
      console.log('2. Re-run the barangay import script');
      console.log('3. Achieve near-complete geographic coverage!');
    }
    
  } catch (error) {
    console.log(`❌ Province creation failed: ${error.message}`);
    console.error(error);
  }
}

async function main() {
  await createMissingProvinces();
}

// Run the creation
if (require.main === module) {
  main();
}

module.exports = { main };