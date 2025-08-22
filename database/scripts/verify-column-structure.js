#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verifyColumnStructure() {
  console.log('🔍 VERIFYING COLUMN STRUCTURE AND DOCUMENTATION');
  console.log('=' .repeat(55));
  
  // Key tables to verify column structure
  const criticalTables = [
    'residents',
    'households', 
    'auth_user_profiles',
    'household_members',
    'resident_relationships',
    'resident_sectoral_info'
  ];

  const results = [];

  for (const tableName of criticalTables) {
    console.log(`\n📋 Analyzing table: ${tableName}`);
    
    try {
      // Try to get table structure by selecting with limit 0
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(0);
        
      if (error) {
        console.log(`  ❌ Error accessing ${tableName}: ${error.message}`);
        results.push({
          table: tableName,
          status: 'error',
          error: error.message
        });
        continue;
      }
      
      // Get a sample record to understand the actual structure
      const { data: sampleData, error: sampleError } = await supabase
        .from(tableName)
        .select('*')
        .limit(1);
        
      if (sampleError) {
        console.log(`  ⚠️  Table exists but no sample data: ${tableName}`);
        results.push({
          table: tableName,
          status: 'exists_no_data',
          columns: []
        });
        continue;
      }

      // Extract column names from the sample data
      const actualColumns = sampleData && sampleData.length > 0 
        ? Object.keys(sampleData[0]) 
        : [];
        
      console.log(`  ✅ ${tableName} - ${actualColumns.length} columns found`);
      console.log(`     Columns: ${actualColumns.slice(0, 5).join(', ')}${actualColumns.length > 5 ? '...' : ''}`);
      
      results.push({
        table: tableName,
        status: 'success',
        columnCount: actualColumns.length,
        columns: actualColumns
      });
      
    } catch (e) {
      console.log(`  ❌ Exception for ${tableName}: ${e.message}`);
      results.push({
        table: tableName,
        status: 'exception',
        error: e.message
      });
    }
  }

  // Generate detailed report
  const report = `
🔍 COLUMN STRUCTURE VERIFICATION REPORT
======================================
Date: ${new Date().toISOString()}

ANALYZED TABLES: ${criticalTables.length}
SUCCESSFUL: ${results.filter(r => r.status === 'success').length}
ERRORS: ${results.filter(r => r.status === 'error' || r.status === 'exception').length}

DETAILED RESULTS:
${results.map(r => {
  if (r.status === 'success') {
    return `
📋 TABLE: ${r.table}
   Status: ✅ Accessible
   Columns: ${r.columnCount}
   Sample Columns: ${r.columns.slice(0, 10).join(', ')}${r.columns.length > 10 ? '...' : ''}
`;
  } else {
    return `
📋 TABLE: ${r.table}
   Status: ❌ ${r.status}
   Error: ${r.error || 'N/A'}
`;
  }
}).join('')}

RECOMMENDATIONS:
${results.filter(r => r.status === 'success').length === criticalTables.length 
  ? '✅ All critical tables are accessible. Manual column order verification needed against schema.sql'
  : '⚠️  Some tables have issues. Review errors before proceeding with column verification.'
}

NEXT STEPS:
1. Compare actual column order with schema.sql CREATE TABLE statements
2. Verify column data types match between Supabase and schema.sql
3. Check if COMMENT ON COLUMN statements exist for documented columns
4. Ensure primary keys and constraints are correctly documented

NOTE: This script verified table accessibility. For detailed column comparison,
manual review of schema.sql CREATE TABLE statements is recommended.
`;

  console.log(report);
  
  const outputPath = path.join(__dirname, '../column-structure-report.txt');
  fs.writeFileSync(outputPath, report);
  console.log(`\n📄 Report saved to: ${outputPath}`);
  
  return results;
}

verifyColumnStructure()
  .then((results) => {
    const successCount = results.filter(r => r.status === 'success').length;
    console.log(`\n📊 Verification complete: ${successCount}/${results.length} tables accessible`);
    
    if (successCount === results.length) {
      console.log('✅ All tables accessible - manual schema.sql review recommended');
    } else {
      console.log('⚠️  Some tables have access issues - review needed');
    }
    
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Verification failed:', error.message);
    process.exit(1);
  });