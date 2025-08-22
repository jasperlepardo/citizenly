#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function verifyAllTables() {
  console.log('🔍 VERIFYING ALL CRITICAL TABLES');
  console.log('=' .repeat(45));
  
  const criticalTables = [
    'residents',
    'households',
    'auth_user_profiles',
    'household_members',
    'resident_relationships',
    'resident_sectoral_info',
    'auth_roles',
    'psgc_barangays'
  ];

  const results = [];
  
  for (const tableName of criticalTables) {
    console.log(`\n📋 Checking ${tableName}...`);
    
    try {
      // Get actual sample data
      const { data: sampleData, error: sampleError } = await supabase
        .from(tableName)
        .select('*')
        .limit(1);
        
      if (sampleError) {
        console.log(`   ❌ Error: ${sampleError.message}`);
        results.push({
          table: tableName,
          status: 'error',
          error: sampleError.message
        });
        continue;
      }

      if (!sampleData || sampleData.length === 0) {
        console.log(`   ⚠️  Empty table`);
        results.push({
          table: tableName,
          status: 'empty',
          supabaseColumns: 0,
          schemaColumns: 0
        });
        continue;
      }

      const actualColumns = Object.keys(sampleData[0]);
      
      // Read schema.sql and extract CREATE TABLE
      const schemaPath = path.join(__dirname, '../schema.sql');
      const schemaContent = fs.readFileSync(schemaPath, 'utf8');
      
      const createTableMatch = schemaContent.match(new RegExp(`CREATE TABLE ${tableName} \\([\\s\\S]*?\\);`));
      
      if (!createTableMatch) {
        console.log(`   ❌ Not found in schema.sql`);
        results.push({
          table: tableName,
          status: 'missing_in_schema',
          supabaseColumns: actualColumns.length,
          schemaColumns: 0
        });
        continue;
      }
      
      // Parse columns with improved regex
      const createTableContent = createTableMatch[0];
      const schemaColumns = [];
      const lines = createTableContent.split('\n');
      
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('--') && !trimmed.startsWith('CREATE') && !trimmed.startsWith('CONSTRAINT') && !trimmed.startsWith('UNIQUE') && !trimmed.startsWith('CHECK') && !trimmed.startsWith(');')) {
          const match = trimmed.match(/^(\w+)(?:\s|\(|,)/);
          if (match && match[1]) {
            schemaColumns.push(match[1]);
          }
        }
      }
      
      // Compare
      const missingInSchema = actualColumns.filter(col => !schemaColumns.includes(col));
      const missingInSupabase = schemaColumns.filter(col => !actualColumns.includes(col));
      
      let exactMatches = 0;
      for (let i = 0; i < Math.min(actualColumns.length, schemaColumns.length); i++) {
        if (actualColumns[i] === schemaColumns[i]) {
          exactMatches++;
        }
      }
      
      const isAligned = missingInSchema.length === 0 && missingInSupabase.length === 0 && exactMatches === Math.min(actualColumns.length, schemaColumns.length);
      
      console.log(`   ${isAligned ? '✅' : '⚠️ '} Columns: ${actualColumns.length} | Order: ${exactMatches}/${Math.min(actualColumns.length, schemaColumns.length)} (${Math.round(exactMatches/Math.min(actualColumns.length, schemaColumns.length)*100)}%)`);
      
      if (!isAligned) {
        if (missingInSchema.length > 0) console.log(`      Missing in schema: ${missingInSchema.join(', ')}`);
        if (missingInSupabase.length > 0) console.log(`      Extra in schema: ${missingInSupabase.join(', ')}`);
      }
      
      results.push({
        table: tableName,
        status: isAligned ? 'aligned' : 'misaligned',
        supabaseColumns: actualColumns.length,
        schemaColumns: schemaColumns.length,
        exactMatches,
        totalPositions: Math.min(actualColumns.length, schemaColumns.length),
        missingInSchema,
        missingInSupabase
      });
      
    } catch (error) {
      console.log(`   ❌ Exception: ${error.message}`);
      results.push({
        table: tableName,
        status: 'exception',
        error: error.message
      });
    }
  }
  
  // Summary
  const aligned = results.filter(r => r.status === 'aligned').length;
  const total = results.length;
  
  console.log('\n' + '=' .repeat(45));
  console.log(`📊 SUMMARY: ${aligned}/${total} tables perfectly aligned`);
  
  const needsAttention = results.filter(r => r.status === 'misaligned' || r.status === 'error' || r.status === 'missing_in_schema');
  
  if (needsAttention.length > 0) {
    console.log(`\n⚠️  TABLES NEEDING ATTENTION (${needsAttention.length}):`);
    needsAttention.forEach(r => {
      console.log(`   - ${r.table}: ${r.status}`);
    });
  } else {
    console.log('\n✅ ALL TABLES PERFECTLY ALIGNED!');
  }
  
  return { aligned, total, needsAttention };
}

verifyAllTables()
  .then(({ aligned, total, needsAttention }) => {
    if (aligned === total) {
      console.log('\n🎉 Perfect! All critical tables are aligned with Supabase.');
    } else {
      console.log(`\n📋 ${needsAttention.length} tables need attention.`);
    }
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Verification failed:', error.message);
    process.exit(1);
  });