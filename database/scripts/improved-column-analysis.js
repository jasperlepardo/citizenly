#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function improvedColumnAnalysis() {
  console.log('🔍 IMPROVED COLUMN ANALYSIS');
  console.log('=' .repeat(40));
  
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
      console.log(`⚠️  Table ${tableName} has no data`);
      return;
    }

    const actualColumns = Object.keys(sampleData[0]);
    console.log(`\n📋 ACTUAL SUPABASE COLUMNS for ${tableName}:`);
    console.log(`Total columns: ${actualColumns.length}`);

    // Read schema.sql and extract CREATE TABLE for residents with better parsing
    const schemaPath = path.join(__dirname, '../schema.sql');
    const schemaContent = fs.readFileSync(schemaPath, 'utf8');
    
    // Extract CREATE TABLE residents section with better regex
    const createTableMatch = schemaContent.match(/CREATE TABLE residents \(([\s\S]*?)\);/);
    
    if (!createTableMatch) {
      console.log(`❌ Could not find CREATE TABLE ${tableName} in schema.sql`);
      return;
    }
    
    const createTableContent = createTableMatch[1];
    
    // Improved parsing that handles DECIMAL(5,2) properly
    const schemaColumns = [];
    const lines = createTableContent.split('\n');
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('--') && !trimmed.startsWith('CONSTRAINT') && !trimmed.startsWith('UNIQUE') && !trimmed.startsWith('CHECK')) {
        // Extract column name - first word before space or parenthesis
        const match = trimmed.match(/^(\w+)(?:\s|\(|,)/);
        if (match && match[1]) {
          schemaColumns.push(match[1]);
        }
      }
    }

    console.log(`\n📝 SCHEMA.SQL COLUMNS for ${tableName} (improved parsing):`);
    console.log(`Total columns: ${schemaColumns.length}`);
    
    // Compare columns
    console.log(`\n🔄 COMPARISON:`);
    
    const missingInSchema = actualColumns.filter(col => !schemaColumns.includes(col));
    const missingInSupabase = schemaColumns.filter(col => !actualColumns.includes(col));
    const commonColumns = actualColumns.filter(col => schemaColumns.includes(col));
    
    console.log(`\n✅ Common columns (${commonColumns.length}/${actualColumns.length}):`);
    
    if (missingInSchema.length > 0) {
      console.log(`\n❌ Missing in schema.sql (${missingInSchema.length}):`);
      missingInSchema.forEach(col => console.log(`   - ${col}`));
    }
    
    if (missingInSupabase.length > 0) {
      console.log(`\n⚠️  Documented but not in Supabase (${missingInSupabase.length}):`);
      missingInSupabase.forEach(col => console.log(`   - ${col}`));
    }
    
    // Check column order 
    console.log(`\n📊 ORDER ANALYSIS:`);
    let exactMatches = 0;
    let positionDiffs = [];
    
    for (let i = 0; i < Math.min(actualColumns.length, schemaColumns.length); i++) {
      if (actualColumns[i] === schemaColumns[i]) {
        exactMatches++;
      } else {
        const schemaPos = actualColumns.indexOf(schemaColumns[i]);
        const actualPos = schemaColumns.indexOf(actualColumns[i]);
        positionDiffs.push({
          position: i + 1,
          supabase: actualColumns[i],
          schema: schemaColumns[i],
          supabaseInSchema: schemaPos + 1,
          schemaInSupabase: actualPos + 1
        });
      }
    }
    
    console.log(`Exact position matches: ${exactMatches}/${Math.min(actualColumns.length, schemaColumns.length)} (${Math.round(exactMatches/Math.min(actualColumns.length, schemaColumns.length)*100)}%)`);
    
    if (positionDiffs.length > 0) {
      console.log(`\nFirst 5 order differences:`);
      positionDiffs.slice(0, 5).forEach(diff => {
        console.log(`   Pos ${diff.position}: Supabase="${diff.supabase}" Schema="${diff.schema}"`);
      });
    }

    // Final status
    const isAligned = missingInSchema.length === 0 && missingInSupabase.length === 0 && exactMatches === Math.min(actualColumns.length, schemaColumns.length);
    
    console.log(`\n🎯 FINAL STATUS: ${isAligned ? '✅ PERFECT ALIGNMENT' : '⚠️  NEEDS ATTENTION'}`);
    
    if (!isAligned) {
      console.log('\n📋 REQUIRED ACTIONS:');
      if (missingInSchema.length > 0) console.log(`   - Add ${missingInSchema.length} missing columns to schema.sql`);
      if (missingInSupabase.length > 0) console.log(`   - Remove ${missingInSupabase.length} phantom columns from schema.sql`);
      if (exactMatches < Math.min(actualColumns.length, schemaColumns.length)) {
        console.log(`   - Reorder ${positionDiffs.length} columns to match Supabase sequence`);
      }
    }
    
    return {
      isAligned,
      actualColumns,
      schemaColumns,
      missingInSchema,
      missingInSupabase,
      exactMatches,
      totalPositions: Math.min(actualColumns.length, schemaColumns.length)
    };
    
  } catch (error) {
    console.error(`❌ Analysis failed: ${error.message}`);
    throw error;
  }
}

improvedColumnAnalysis()
  .then((result) => {
    if (result && result.isAligned) {
      console.log('\n🎉 Column structure is perfectly aligned!');
    } else if (result) {
      console.log(`\n⚙️  Alignment: ${result.exactMatches}/${result.totalPositions} positions (${Math.round(result.exactMatches/result.totalPositions*100)}%)`);
    }
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Analysis failed:', error.message);
    process.exit(1);
  });