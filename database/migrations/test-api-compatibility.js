#!/usr/bin/env node

/**
 * API Schema Compatibility Test
 * ============================
 * 
 * Tests the API endpoints against the new database schema to identify
 * compatibility issues and required updates.
 */

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { createClient } = require('@supabase/supabase-js');
// eslint-disable-next-line @typescript-eslint/no-require-imports
require('dotenv').config();

// New database client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

/**
 * Test table existence and structure
 */
async function testTableExistence() {
  console.log('🔍 Testing table existence...');
  
  const tablesToCheck = [
    // PSGC tables (should exist)
    'psgc_regions',
    'psgc_provinces', 
    'psgc_cities_municipalities',
    'psgc_barangays',
    
    // PSOC tables (should exist)
    'psoc_major_groups',
    'psoc_sub_major_groups',
    'psoc_minor_groups',
    'psoc_unit_groups',
    
    // Application tables (should exist)
    'residents',
    'households',
    
    // Auth tables (API expects these - might not exist)
    'auth_user_profiles',
    'auth_roles',
    
    // Views (API expects these - might not exist)
    'api_residents_with_geography'
  ];
  
  const results = {};
  
  for (const tableName of tablesToCheck) {
    try {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(1);
      
      if (error) {
        results[tableName] = { exists: false, error: error.message };
      } else {
        results[tableName] = { exists: true, recordCount: data?.length || 0 };
      }
    } catch (err) {
      results[tableName] = { exists: false, error: err.message };
    }
  }
  
  console.log('\\n📊 Table Existence Results:');
  console.log('=============================');
  
  Object.entries(results).forEach(([table, result]) => {
    const status = result.exists ? '✅' : '❌';
    const info = result.exists 
      ? `(${result.recordCount} records sampled)`
      : `(${result.error})`;
    
    console.log(`${status} ${table.padEnd(30)} ${info}`);
  });
  
  return results;
}

/**
 * Test PSGC API compatibility
 */
async function testPSGCAPIs() {
  console.log('\\n🗺️  Testing PSGC API compatibility...');
  
  const tests = [
    {
      name: 'Regions API',
      query: () => supabase.from('psgc_regions').select('code, name').limit(5)
    },
    {
      name: 'Provinces API', 
      query: () => supabase.from('psgc_provinces').select('code, name, region_code').limit(5)
    },
    {
      name: 'Cities API',
      query: () => supabase.from('psgc_cities_municipalities').select('code, name, type, province_code').limit(5)
    },
    {
      name: 'Barangays API',
      query: () => supabase.from('psgc_barangays').select('code, name, city_municipality_code').limit(5)
    }
  ];
  
  for (const test of tests) {
    try {
      const { data, error } = await test.query();
      
      if (error) {
        console.log(`❌ ${test.name}: ${error.message}`);
      } else {
        console.log(`✅ ${test.name}: ${data.length} records retrieved`);
        if (data.length > 0) {
          console.log(`   Sample: ${data[0].name} (${data[0].code})`);
        }
      }
    } catch (err) {
      console.log(`❌ ${test.name}: ${err.message}`);
    }
  }
}

/**
 * Identify missing tables/views that APIs expect
 */
async function identifyMissingComponents() {
  console.log('\\n🔧 Identifying missing components for API compatibility...');
  
  const missingComponents = [];
  
  // Check for auth tables
  try {
    await supabase.from('auth_user_profiles').select('*').limit(1);
  } catch (error) {
    console.log('Debug: auth_user_profiles not accessible:', error.message);
    missingComponents.push({
      name: 'auth_user_profiles',
      type: 'table',
      description: 'User profile management - API expects this',
      solution: 'Create migration or update API to use system_users'
    });
  }
  
  try {
    await supabase.from('auth_roles').select('*').limit(1);
  } catch (error) {
    console.log('Debug: auth_roles not accessible:', error.message);
    missingComponents.push({
      name: 'auth_roles',
      type: 'table', 
      description: 'Role-based access control - API expects this',
      solution: 'Create roles table or update API logic'
    });
  }
  
  try {
    await supabase.from('api_residents_with_geography').select('*').limit(1);
  } catch (error) {
    console.log('Debug: api_residents_with_geography not accessible:', error.message);
    missingComponents.push({
      name: 'api_residents_with_geography',
      type: 'view',
      description: 'Optimized view for resident API - API expects this',
      solution: 'Create view or update API to use base residents table'
    });
  }
  
  if (missingComponents.length === 0) {
    console.log('✅ All expected components found!');
    return [];
  }
  
  console.log('\\nMissing Components:');
  console.log('==================');
  missingComponents.forEach((component, index) => {
    console.log(`\\n${index + 1}. ${component.name} (${component.type})`);
    console.log(`   Description: ${component.description}`);
    console.log(`   Solution: ${component.solution}`);
  });
  
  return missingComponents;
}

/**
 * Generate compatibility report
 */
async function generateCompatibilityReport(tableResults, missingComponents) {
  console.log('\\n📋 API Compatibility Report');
  console.log('============================');
  
  const compatible = [];
  const needsUpdate = [];
  
  // PSGC endpoints should be fully compatible
  if (tableResults.psgc_regions?.exists && tableResults.psgc_provinces?.exists && 
      tableResults.psgc_cities_municipalities?.exists && tableResults.psgc_barangays?.exists) {
    compatible.push('Address/PSGC APIs (regions, provinces, cities, barangays)');
  }
  
  // Check main application APIs
  if (missingComponents.length > 0) {
    needsUpdate.push('Resident/Household APIs (missing auth tables and views)');
  } else if (tableResults.residents?.exists && tableResults.households?.exists) {
    compatible.push('Resident/Household APIs');
  }
  
  console.log('\\n✅ Compatible APIs:');
  compatible.forEach(api => console.log(`   - ${api}`));
  
  console.log('\\n⚠️  APIs needing updates:');
  needsUpdate.forEach(api => console.log(`   - ${api}`));
  
  console.log('\\n🎯 Next Steps:');
  console.log('1. Update environment variables to point to new database');
  console.log('2. Create missing auth tables or update API logic');
  console.log('3. Create missing views or update API queries');
  console.log('4. Test end-to-end API functionality');
  
  return { compatible, needsUpdate };
}

/**
 * Main test function
 */
async function main() {
  try {
    console.log('🚀 Starting API Schema Compatibility Test...');
    console.log('Database:', process.env.SUPABASE_URL);
    console.log('=============================================');
    
    // Test table existence
    const tableResults = await testTableExistence();
    
    // Test PSGC API compatibility 
    await testPSGCAPIs();
    
    // Identify missing components
    const missingComponents = await identifyMissingComponents();
    
    // Generate report
    await generateCompatibilityReport(tableResults, missingComponents);
    
    console.log('\\n==============================================');
    console.log('✅ API compatibility test completed!');
    
  } catch (error) {
    console.error('\\n❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Run the test
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main };