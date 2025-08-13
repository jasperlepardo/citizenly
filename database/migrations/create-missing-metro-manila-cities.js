#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../../.env.local' });

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Missing Metro Manila Sub-municipalities from official PSGC data
const missingCities = [
  {
    code: '133901',
    name: 'Tondo I/II',
    province_code: null, // Independent sub-municipality 
    type: 'sub-municipality',
    is_independent: true
  },
  {
    code: '133902', 
    name: 'Binondo',
    province_code: null,
    type: 'sub-municipality',
    is_independent: true
  },
  {
    code: '133903',
    name: 'Quiapo', 
    province_code: null,
    type: 'sub-municipality',
    is_independent: true
  },
  {
    code: '133904',
    name: 'San Nicolas',
    province_code: null,
    type: 'sub-municipality', 
    is_independent: true
  },
  {
    code: '133905',
    name: 'Santa Cruz',
    province_code: null,
    type: 'sub-municipality',
    is_independent: true
  },
  {
    code: '133906',
    name: 'Sampaloc',
    province_code: null,
    type: 'sub-municipality',
    is_independent: true
  },
  {
    code: '133907',
    name: 'San Miguel',
    province_code: null,
    type: 'sub-municipality',
    is_independent: true
  },
  {
    code: '133908',
    name: 'Ermita',
    province_code: null,
    type: 'sub-municipality',
    is_independent: true
  },
  {
    code: '133909',
    name: 'Intramuros',
    province_code: null,
    type: 'sub-municipality',
    is_independent: true
  },
  {
    code: '133910',
    name: 'Malate',
    province_code: null,
    type: 'sub-municipality',
    is_independent: true
  },
  {
    code: '133911',
    name: 'Paco',
    province_code: null,
    type: 'sub-municipality',
    is_independent: true
  },
  {
    code: '133912',
    name: 'Pandacan',
    province_code: null,
    type: 'sub-municipality',
    is_independent: true
  },
  {
    code: '133913',
    name: 'Port Area',
    province_code: null,
    type: 'sub-municipality',
    is_independent: true
  },
  {
    code: '133914',
    name: 'Santa Ana',
    province_code: null,
    type: 'sub-municipality',
    is_independent: true
  }
];

async function createMissingCities() {
  console.log('🏛️ CREATING MISSING METRO MANILA SUB-MUNICIPALITIES');
  console.log('====================================================\n');
  
  try {
    console.log('📋 Missing Metro Manila Sub-municipalities:');
    console.log('-'.repeat(50));
    
    missingCities.forEach((city, index) => {
      console.log(`${(index + 1).toString().padStart(2)}. ${city.code} - ${city.name}`);
    });
    
    console.log(`\n📊 Creating ${missingCities.length} sub-municipalities...\n`);
    
    // Insert the missing cities
    const { data, error } = await supabase
      .from('psgc_cities_municipalities')
      .upsert(missingCities, { onConflict: 'code' });
    
    if (error) {
      console.error('❌ Error creating cities:', error);
      throw error;
    }
    
    console.log('✅ Successfully created all missing sub-municipalities!');
    
    // Verify the creation
    const { count: newCount } = await supabase
      .from('psgc_cities_municipalities')
      .select('*', { count: 'exact' });
    
    console.log(`\n📊 Updated cities/municipalities count: ${newCount}`);
    
    // Show the created cities
    const { data: createdCities } = await supabase
      .from('psgc_cities_municipalities')
      .select('code, name, type, is_independent')
      .in('code', missingCities.map(c => c.code))
      .order('code');
    
    console.log('\n✅ Verified created cities:');
    console.log('-'.repeat(50));
    createdCities?.forEach((city, index) => {
      console.log(`${(index + 1).toString().padStart(2)}. ${city.code} - ${city.name} (${city.type})`);
    });
    
    console.log('\n🎯 IMPACT:');
    console.log('==========');
    console.log('• Metro Manila sub-municipalities now available for barangay association');
    console.log('• Can re-run barangay import to capture all 897 previously skipped barangays');
    console.log('• Will achieve 100% barangay coverage after re-import');
    
    console.log('\n💡 NEXT STEP:');
    console.log('=============');
    console.log('Run: node import-updated-psgc-data.js (barangays section only)');
    console.log('This will import the previously skipped 897 Metro Manila barangays');
    
  } catch (error) {
    console.error('❌ Failed to create missing cities:', error);
    process.exit(1);
  }
}

// Run the creation
if (require.main === module) {
  createMissingCities();
}

module.exports = { createMissingCities, missingCities };