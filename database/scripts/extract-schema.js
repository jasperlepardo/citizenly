#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials in environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function extractSchema() {
  console.log('Connecting to Supabase database...');
  console.log('Checking tables in the database...\n');
  
  const knownTables = [
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
    'resident_sectoral_info',
    'resident_benefits',
    'resident_benefit_history',
    'audit_logs',
    'data_versions'
  ];

  const schemaInfo = [];
  const existingTables = [];
  const missingTables = [];
  
  for (const tableName of knownTables) {
    try {
      const { error } = await supabase
        .from(tableName)
        .select('*')
        .limit(0);
        
      if (!error) {
        schemaInfo.push({
          table: tableName,
          exists: true
        });
        existingTables.push(tableName);
        console.log(`  ✓ ${tableName}`);
      } else {
        schemaInfo.push({
          table: tableName,
          exists: false,
          error: error.message
        });
        missingTables.push(tableName);
        console.log(`  ✗ ${tableName} - ${error.message}`);
      }
    } catch (e) {
      schemaInfo.push({
        table: tableName,
        exists: false,
        error: e.message
      });
      missingTables.push(tableName);
      console.log(`  ✗ ${tableName} - ${e.message}`);
    }
  }
  
  // Write the results
  const outputPath = path.join(__dirname, '../extracted-schema.json');
  fs.writeFileSync(outputPath, JSON.stringify(schemaInfo, null, 2));
  
  // Create a summary report
  const summaryPath = path.join(__dirname, '../schema-summary.txt');
  const summary = `SUPABASE SCHEMA EXTRACTION SUMMARY
=====================================
Date: ${new Date().toISOString()}
Database: ${supabaseUrl}

EXISTING TABLES (${existingTables.length}):
${existingTables.map(t => `  ✓ ${t}`).join('\n')}

MISSING TABLES (${missingTables.length}):
${missingTables.map(t => `  ✗ ${t}`).join('\n')}

RECOMMENDATIONS:
${missingTables.length > 0 ? '- The following tables need to be created in Supabase:' : '- All expected tables exist in Supabase'}
${missingTables.map(t => `  - ${t}`).join('\n')}
`;
  
  fs.writeFileSync(summaryPath, summary);
  
  console.log('\n' + '='.repeat(50));
  console.log('EXTRACTION COMPLETE');
  console.log('='.repeat(50));
  console.log(`\nResults written to:`);
  console.log(`  - ${outputPath}`);
  console.log(`  - ${summaryPath}`);
  console.log(`\nSummary:`);
  console.log(`  - Existing tables: ${existingTables.length}`);
  console.log(`  - Missing tables: ${missingTables.length}`);
  
  return { existingTables, missingTables, schemaInfo };
}

extractSchema()
  .then(() => {
    console.log('\n✅ Schema extraction completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Schema extraction failed:', error.message);
    process.exit(1);
  });