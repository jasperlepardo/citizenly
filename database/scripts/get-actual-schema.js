#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function getActualSchema() {
  console.log('Getting actual schema from Supabase...\n');
  
  // Test all known tables from our previous extraction
  const expectedTables = [
    'auth_roles',
    'auth_user_profiles', 
    'auth_barangay_accounts',
    'psgc_regions',
    'psgc_provinces',
    'psgc_cities_municipalities',
    'psgc_barangays',
    'psoc_major_groups',
    'psoc_sub_major_groups',
    'psoc_minor_groups',
    'psoc_unit_groups',
    'psoc_unit_sub_groups',
    'psoc_position_titles',
    'psoc_occupation_cross_references',
    'geo_subdivisions',
    'geo_streets',
    'households',
    'residents',
    'household_members',
    'resident_relationships',
    'resident_sectoral_info'
  ];

  const missingTables = [
    'resident_benefits',
    'resident_benefit_history', 
    'audit_logs',
    'data_versions',
    'system_audit_logs',
    'system_schema_versions',
    'resident_migrant_info',
    'system_dashboard_summaries'
  ];

  const allTables = [...expectedTables, ...missingTables];
  const actualTables = [];
  const notFoundTables = [];

  for (const tableName of allTables) {
    try {
      const { error } = await supabase
        .from(tableName)
        .select('*')
        .limit(0);
        
      if (!error) {
        actualTables.push(tableName);
        console.log(`✓ ${tableName}`);
      } else {
        notFoundTables.push(tableName);
        console.log(`✗ ${tableName} - ${error.message}`);
      }
    } catch (e) {
      notFoundTables.push(tableName);
      console.log(`✗ ${tableName} - ${e.message}`);
    }
  }

  // Generate schema file based on actual tables
  const schemaContent = `-- ACTUAL SUPABASE SCHEMA
-- Generated on: ${new Date().toISOString()}
-- Tables that exist in Supabase: ${actualTables.length}
-- Tables that don't exist: ${notFoundTables.length}

-- EXISTING TABLES:
${actualTables.map(t => `-- ✓ ${t}`).join('\n')}

-- MISSING TABLES:
${notFoundTables.map(t => `-- ✗ ${t}`).join('\n')}
`;

  const outputPath = path.join(__dirname, '../actual-supabase-schema.sql');
  fs.writeFileSync(outputPath, schemaContent);

  console.log(`\n📄 Actual schema summary written to: ${outputPath}`);
  console.log(`\nSUMMARY:`);
  console.log(`✓ Existing tables: ${actualTables.length}`);
  console.log(`✗ Missing tables: ${notFoundTables.length}`);
  
  console.log(`\nEXISTING TABLES:`);
  actualTables.forEach(t => console.log(`  ✓ ${t}`));
  
  console.log(`\nMISSING TABLES:`);
  notFoundTables.forEach(t => console.log(`  ✗ ${t}`));

  return { actualTables, notFoundTables };
}

getActualSchema()
  .then(({ actualTables }) => {
    console.log(`\n✅ Found ${actualTables.length} actual tables in Supabase`);
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Failed:', error.message);
    process.exit(1);
  });