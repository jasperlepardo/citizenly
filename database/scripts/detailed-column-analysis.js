#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function detailedColumnAnalysis() {
  console.log('🔍 DETAILED COLUMN ANALYSIS');
  console.log('=' .repeat(40));
  
  // Focus on residents table first as it's most complex
  const tableName = 'residents';
  
  try {
    // Get actual sample data to see all columns
    const { data: sampleData, error: sampleError } = await supabase
      .from(tableName)
      .select('*')
      .limit(1);
      
    if (sampleError) {
      console.log(`❌ Error getting sample data: ${sampleError.message}`);
      return;
    }

    if (!sampleData || sampleData.length === 0) {
      console.log(`⚠️  Table ${tableName} has no data - getting structure differently`);
      
      // Try to get column info by selecting with limit 0
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .limit(0);
        
      if (error) {
        console.log(`❌ Error accessing table structure: ${error.message}`);
        return;
      }
      
      console.log(`✅ Table ${tableName} is accessible but empty`);
      return;
    }

    const actualColumns = Object.keys(sampleData[0]);
    console.log(`\n📋 ACTUAL SUPABASE COLUMNS for ${tableName}:`);
    console.log(`Total columns: ${actualColumns.length}`);
    
    actualColumns.forEach((col, index) => {
      console.log(`${(index + 1).toString().padStart(2)}: ${col}`);
    });

    // Read schema.sql and extract CREATE TABLE for residents
    const schemaPath = path.join(__dirname, '../schema.sql');
    const schemaContent = fs.readFileSync(schemaPath, 'utf8');
    
    // Extract CREATE TABLE residents section
    const createTableMatch = schemaContent.match(/CREATE TABLE residents \(([\s\S]*?)\);/);
    
    if (!createTableMatch) {
      console.log(`❌ Could not find CREATE TABLE ${tableName} in schema.sql`);
      return;
    }
    
    const createTableContent = createTableMatch[1];
    const schemaColumns = createTableContent
      .split(',')
      .map(line => line.trim())
      .filter(line => line && !line.startsWith('--') && !line.startsWith('CONSTRAINT'))
      .map(line => {
        // Extract column name (first word)
        const match = line.match(/^(\w+)/);
        return match ? match[1] : null;
      })
      .filter(Boolean);

    console.log(`\n📝 SCHEMA.SQL COLUMNS for ${tableName}:`);
    console.log(`Total columns: ${schemaColumns.length}`);
    
    schemaColumns.forEach((col, index) => {
      console.log(`${(index + 1).toString().padStart(2)}: ${col}`);
    });

    // Compare columns
    console.log(`\n🔄 COMPARISON:`);
    
    const missingInSchema = actualColumns.filter(col => !schemaColumns.includes(col));
    const missingInSupabase = schemaColumns.filter(col => !actualColumns.includes(col));
    const commonColumns = actualColumns.filter(col => schemaColumns.includes(col));
    
    console.log(`\n✅ Common columns (${commonColumns.length}):`);
    commonColumns.forEach(col => console.log(`   ✓ ${col}`));
    
    if (missingInSchema.length > 0) {
      console.log(`\n❌ Missing in schema.sql (${missingInSchema.length}):`);
      missingInSchema.forEach(col => console.log(`   - ${col}`));
    }
    
    if (missingInSupabase.length > 0) {
      console.log(`\n⚠️  Documented but not in Supabase (${missingInSupabase.length}):`);
      missingInSupabase.forEach(col => console.log(`   - ${col}`));
    }
    
    // Check column order differences
    console.log(`\n📊 ORDER COMPARISON:`);
    let orderMatches = 0;
    const minLength = Math.min(actualColumns.length, schemaColumns.length);
    
    for (let i = 0; i < minLength; i++) {
      if (actualColumns[i] === schemaColumns[i]) {
        orderMatches++;
      } else {
        console.log(`   Position ${i + 1}: Supabase="${actualColumns[i]}" vs Schema="${schemaColumns[i]}"`);
      }
    }
    
    console.log(`Order matches: ${orderMatches}/${minLength} (${Math.round(orderMatches/minLength*100)}%)`);

    // Generate report
    const report = `
DETAILED COLUMN ANALYSIS REPORT
===============================
Table: ${tableName}
Date: ${new Date().toISOString()}

COLUMN COUNT:
- Supabase: ${actualColumns.length}
- Schema.sql: ${schemaColumns.length}
- Difference: ${actualColumns.length - schemaColumns.length}

COLUMN ALIGNMENT:
- Common columns: ${commonColumns.length}
- Missing in schema.sql: ${missingInSchema.length}
- Documented but not in Supabase: ${missingInSupabase.length}
- Order matches: ${orderMatches}/${minLength} (${Math.round(orderMatches/minLength*100)}%)

MISSING IN SCHEMA.SQL:
${missingInSchema.map(col => `- ${col}`).join('\n')}

DOCUMENTED BUT NOT IN SUPABASE:
${missingInSupabase.map(col => `- ${col}`).join('\n')}

RECOMMENDATIONS:
${missingInSchema.length > 0 ? '⚠️  Add missing columns to schema.sql CREATE TABLE statement' : '✅ All Supabase columns are documented in schema.sql'}
${missingInSupabase.length > 0 ? '⚠️  Remove non-existent columns from schema.sql' : '✅ No phantom columns in schema.sql'}
${orderMatches < minLength ? '⚠️  Column order differs between Supabase and schema.sql' : '✅ Column order matches'}

OVERALL STATUS: ${
  missingInSchema.length === 0 && missingInSupabase.length === 0 && orderMatches === minLength
    ? '✅ PERFECT ALIGNMENT'
    : '⚠️  NEEDS ATTENTION'
}
`;

    console.log(report);
    
    const outputPath = path.join(__dirname, '../detailed-column-analysis.txt');
    fs.writeFileSync(outputPath, report);
    console.log(`\n📄 Report saved to: ${outputPath}`);
    
    return {
      actualColumns,
      schemaColumns,
      missingInSchema,
      missingInSupabase,
      orderMatches,
      totalComparison: minLength
    };
    
  } catch (error) {
    console.error(`❌ Analysis failed: ${error.message}`);
    throw error;
  }
}

detailedColumnAnalysis()
  .then((result) => {
    if (result) {
      const { missingInSchema, missingInSupabase, orderMatches, totalComparison } = result;
      const isAligned = missingInSchema.length === 0 && missingInSupabase.length === 0 && orderMatches === totalComparison;
      
      console.log(`\n🎯 FINAL RESULT: ${isAligned ? '✅ PERFECT ALIGNMENT' : '⚠️  NEEDS ATTENTION'}`);
      
      if (!isAligned) {
        console.log('\n📋 ACTION ITEMS:');
        if (missingInSchema.length > 0) console.log('   - Add missing columns to schema.sql');
        if (missingInSupabase.length > 0) console.log('   - Remove phantom columns from schema.sql');
        if (orderMatches < totalComparison) console.log('   - Reorder columns to match Supabase');
      }
    }
    
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Analysis failed:', error.message);
    process.exit(1);
  });