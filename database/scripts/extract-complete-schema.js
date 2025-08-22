#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function extractCompleteSchema() {
  console.log('Extracting complete schema from Supabase...\n');
  
  try {
    // Get all tables with their columns
    const { data: tablesData, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_type', 'BASE TABLE')
      .order('table_name');

    if (tablesError) throw tablesError;

    const schema = {
      tables: [],
      views: [],
      functions: [],
      types: []
    };

    // For each table, get detailed structure
    for (const table of tablesData || []) {
      const tableName = table.table_name;
      
      // Get column information
      const { data: columns, error: columnsError } = await supabase
        .from('information_schema.columns')
        .select('*')
        .eq('table_schema', 'public')
        .eq('table_name', tableName)
        .order('ordinal_position');

      if (!columnsError && columns) {
        schema.tables.push({
          name: tableName,
          columns: columns.map(col => ({
            name: col.column_name,
            type: col.data_type,
            is_nullable: col.is_nullable,
            default: col.column_default,
            max_length: col.character_maximum_length
          }))
        });
        console.log(`✓ Extracted table: ${tableName} (${columns.length} columns)`);
      }
    }

    // Get views
    const { data: viewsData, error: viewsError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .eq('table_type', 'VIEW')
      .order('table_name');

    if (!viewsError && viewsData) {
      schema.views = viewsData.map(v => v.table_name);
      console.log(`\n✓ Found ${viewsData.length} views`);
    }

    // Write to file
    const outputPath = path.join(__dirname, '../supabase-complete-schema.json');
    fs.writeFileSync(outputPath, JSON.stringify(schema, null, 2));
    
    console.log(`\n📄 Complete schema written to: ${outputPath}`);
    console.log(`\nSummary:`);
    console.log(`  - Tables: ${schema.tables.length}`);
    console.log(`  - Views: ${schema.views.length}`);
    
    return schema;
    
  } catch (error) {
    console.error('Error extracting schema:', error);
    throw error;
  }
}

extractCompleteSchema()
  .then(() => {
    console.log('\n✅ Schema extraction completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Schema extraction failed:', error.message);
    process.exit(1);
  });