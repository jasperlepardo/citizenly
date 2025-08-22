#!/usr/bin/env node

/**
 * Compare Current Supabase Schema with database/schema.sql
 * and Create Migration Script for Differences
 * 
 * This script will:
 * 1. Check current Supabase schema state
 * 2. Compare with the authoritative database/schema.sql
 * 3. Generate a migration script for the differences
 * 4. Apply the migration to bring Supabase up to date
 * 
 * Usage:
 *   node compare-and-migrate-schema.js [--dry-run] [--apply]
 * 
 * Options:
 *   --dry-run    Only show what would be changed, don't apply
 *   --apply      Apply the migration after generating it
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const DRY_RUN = process.argv.includes('--dry-run');
const APPLY_MIGRATION = process.argv.includes('--apply');

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Error: Missing required environment variables');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_KEY');
  process.exit(1);
}

// Initialize Supabase client
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

/**
 * Get current schema information from Supabase
 */
async function getCurrentSupabaseSchema() {
  console.log('🔍 Analyzing current Supabase schema...');
  
  const schema = {
    tables: new Set(),
    functions: new Set(),
    views: new Set(),
    indexes: new Set(),
    triggers: new Set(),
    policies: new Set()
  };
  
  try {
    // Get tables
    const { data: tables } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .neq('table_name', 'spatial_ref_sys'); // Exclude PostGIS system tables
    
    if (tables) {
      tables.forEach(t => schema.tables.add(t.table_name));
    }
    
    // Get functions
    const { data: functions } = await supabase.rpc('exec_sql', {
      sql_query: `
        SELECT routine_name 
        FROM information_schema.routines 
        WHERE routine_schema = 'public' 
        AND routine_type = 'FUNCTION'
      `
    });
    
    if (functions) {
      functions.forEach(f => schema.functions.add(f.routine_name));
    }
    
    // Get views
    const { data: views } = await supabase.rpc('exec_sql', {
      sql_query: `
        SELECT table_name 
        FROM information_schema.views 
        WHERE table_schema = 'public'
      `
    });
    
    if (views) {
      views.forEach(v => schema.views.add(v.table_name));
    }
    
    // Get indexes
    const { data: indexes } = await supabase.rpc('exec_sql', {
      sql_query: `
        SELECT indexname 
        FROM pg_indexes 
        WHERE schemaname = 'public'
        AND indexname NOT LIKE '%_pkey'
        AND indexname NOT LIKE 'pg_%'
      `
    });
    
    if (indexes) {
      indexes.forEach(i => schema.indexes.add(i.indexname));
    }
    
    console.log(`✅ Found: ${schema.tables.size} tables, ${schema.functions.size} functions, ${schema.views.size} views, ${schema.indexes.size} indexes`);
    return schema;
    
  } catch (error) {
    console.error('❌ Error getting Supabase schema:', error.message);
    throw error;
  }
}

/**
 * Parse database/schema.sql to extract expected schema
 */
function parseExpectedSchema() {
  console.log('📖 Parsing database/schema.sql...');
  
  const schemaPath = path.join(__dirname, '..', 'schema.sql');
  const schemaContent = fs.readFileSync(schemaPath, 'utf8');
  
  const expected = {
    tables: new Set(),
    functions: new Set(),
    views: new Set(),
    indexes: new Set(),
    triggers: new Set()
  };
  
  // Parse tables
  const tableMatches = schemaContent.match(/CREATE TABLE(?:\s+IF NOT EXISTS)?\s+(\w+)/gi);
  if (tableMatches) {
    tableMatches.forEach(match => {
      const tableName = match.match(/CREATE TABLE(?:\s+IF NOT EXISTS)?\s+(\w+)/i)[1];
      expected.tables.add(tableName);
    });
  }
  
  // Parse functions
  const functionMatches = schemaContent.match(/CREATE(?:\s+OR\s+REPLACE)?\s+FUNCTION\s+(\w+)/gi);
  if (functionMatches) {
    functionMatches.forEach(match => {
      const functionName = match.match(/CREATE(?:\s+OR\s+REPLACE)?\s+FUNCTION\s+(\w+)/i)[1];
      expected.functions.add(functionName);
    });
  }
  
  // Parse views
  const viewMatches = schemaContent.match(/CREATE(?:\s+OR\s+REPLACE)?\s+VIEW\s+(\w+)/gi);
  if (viewMatches) {
    viewMatches.forEach(match => {
      const viewName = match.match(/CREATE(?:\s+OR\s+REPLACE)?\s+VIEW\s+(\w+)/i)[1];
      expected.views.add(viewName);
    });
  }
  
  // Parse indexes
  const indexMatches = schemaContent.match(/CREATE(?:\s+UNIQUE)?\s+INDEX(?:\s+IF NOT EXISTS)?\s+(\w+)/gi);
  if (indexMatches) {
    indexMatches.forEach(match => {
      const indexName = match.match(/CREATE(?:\s+UNIQUE)?\s+INDEX(?:\s+IF NOT EXISTS)?\s+(\w+)/i)[1];
      expected.indexes.add(indexName);
    });
  }
  
  console.log(`✅ Expected: ${expected.tables.size} tables, ${expected.functions.size} functions, ${expected.views.size} views, ${expected.indexes.size} indexes`);
  return expected;
}

/**
 * Compare schemas and identify differences
 */
function compareSchemas(current, expected) {
  console.log('\n🔍 Comparing schemas...');
  
  const differences = {
    missingTables: [],
    missingFunctions: [],
    missingViews: [],
    missingIndexes: [],
    extraTables: [],
    extraFunctions: [],
    extraViews: [],
    extraIndexes: []
  };
  
  // Find missing items (in expected but not in current)
  expected.tables.forEach(table => {
    if (!current.tables.has(table)) {
      differences.missingTables.push(table);
    }
  });
  
  expected.functions.forEach(func => {
    if (!current.functions.has(func)) {
      differences.missingFunctions.push(func);
    }
  });
  
  expected.views.forEach(view => {
    if (!current.views.has(view)) {
      differences.missingViews.push(view);
    }
  });
  
  expected.indexes.forEach(index => {
    if (!current.indexes.has(index)) {
      differences.missingIndexes.push(index);
    }
  });
  
  // Find extra items (in current but not in expected)
  current.tables.forEach(table => {
    if (!expected.tables.has(table)) {
      differences.extraTables.push(table);
    }
  });
  
  // Report differences
  console.log('\n📊 Schema Differences Found:');
  console.log(`Missing Tables: ${differences.missingTables.length}`);
  console.log(`Missing Functions: ${differences.missingFunctions.length}`);
  console.log(`Missing Views: ${differences.missingViews.length}`);
  console.log(`Missing Indexes: ${differences.missingIndexes.length}`);
  console.log(`Extra Tables: ${differences.extraTables.length}`);
  
  if (differences.missingTables.length > 0) {
    console.log('\n❌ Missing Tables:');
    differences.missingTables.forEach(table => console.log(`  - ${table}`));
  }
  
  if (differences.missingFunctions.length > 0) {
    console.log('\n❌ Missing Functions:');
    differences.missingFunctions.forEach(func => console.log(`  - ${func}`));
  }
  
  if (differences.missingViews.length > 0) {
    console.log('\n❌ Missing Views:');
    differences.missingViews.forEach(view => console.log(`  - ${view}`));
  }
  
  if (differences.missingIndexes.length > 0) {
    console.log('\n❌ Missing Indexes:');
    differences.missingIndexes.forEach(index => console.log(`  - ${index}`));
  }
  
  return differences;
}

/**
 * Generate migration SQL for the differences
 */
function generateMigrationSQL(differences) {
  console.log('\n📝 Generating migration SQL...');
  
  const schemaPath = path.join(__dirname, '..', 'schema.sql');
  const schemaContent = fs.readFileSync(schemaPath, 'utf8');
  
  let migrationSQL = `-- =============================================================================
-- AUTO-GENERATED MIGRATION SCRIPT
-- =============================================================================
-- 
-- Generated: ${new Date().toISOString()}
-- Purpose: Sync Supabase schema with database/schema.sql
-- 
-- This migration will create missing:
-- - ${differences.missingTables.length} tables
-- - ${differences.missingFunctions.length} functions  
-- - ${differences.missingViews.length} views
-- - ${differences.missingIndexes.length} indexes
--
-- =============================================================================

-- Check current schema version
DO $$
DECLARE
    current_version VARCHAR(10);
BEGIN
    SELECT version INTO current_version 
    FROM system_schema_versions 
    ORDER BY created_at DESC 
    LIMIT 1;
    
    RAISE NOTICE 'Current schema version: %', COALESCE(current_version, 'Unknown');
    RAISE NOTICE 'Applying schema synchronization...';
END $$;

`;

  // Extract and add missing table definitions
  if (differences.missingTables.length > 0) {
    migrationSQL += `-- =============================================================================
-- MISSING TABLES
-- =============================================================================

`;
    differences.missingTables.forEach(tableName => {
      const tableRegex = new RegExp(`CREATE TABLE(?:\\s+IF NOT EXISTS)?\\s+${tableName}[\\s\\S]*?;`, 'i');
      const match = schemaContent.match(tableRegex);
      if (match) {
        migrationSQL += `-- Table: ${tableName}\n`;
        migrationSQL += match[0] + '\n\n';
      }
    });
  }
  
  // Extract and add missing function definitions
  if (differences.missingFunctions.length > 0) {
    migrationSQL += `-- =============================================================================
-- MISSING FUNCTIONS
-- =============================================================================

`;
    differences.missingFunctions.forEach(functionName => {
      const functionRegex = new RegExp(`CREATE(?:\\s+OR\\s+REPLACE)?\\s+FUNCTION\\s+${functionName}[\\s\\S]*?\\$\\$\\s*LANGUAGE[\\s\\S]*?;`, 'i');
      const match = schemaContent.match(functionRegex);
      if (match) {
        migrationSQL += `-- Function: ${functionName}\n`;
        migrationSQL += match[0] + '\n\n';
      }
    });
  }
  
  // Extract and add missing view definitions
  if (differences.missingViews.length > 0) {
    migrationSQL += `-- =============================================================================
-- MISSING VIEWS
-- =============================================================================

`;
    differences.missingViews.forEach(viewName => {
      const viewRegex = new RegExp(`CREATE(?:\\s+OR\\s+REPLACE)?\\s+VIEW\\s+${viewName}[\\s\\S]*?;`, 'i');
      const match = schemaContent.match(viewRegex);
      if (match) {
        migrationSQL += `-- View: ${viewName}\n`;
        migrationSQL += match[0] + '\n\n';
      }
    });
  }
  
  // Extract and add missing index definitions
  if (differences.missingIndexes.length > 0) {
    migrationSQL += `-- =============================================================================
-- MISSING INDEXES
-- =============================================================================

`;
    differences.missingIndexes.forEach(indexName => {
      const indexRegex = new RegExp(`CREATE(?:\\s+UNIQUE)?\\s+INDEX(?:\\s+IF NOT EXISTS)?\\s+${indexName}[\\s\\S]*?;`, 'i');
      const match = schemaContent.match(indexRegex);
      if (match) {
        migrationSQL += `-- Index: ${indexName}\n`;
        migrationSQL += match[0] + '\n\n';
      }
    });
  }
  
  migrationSQL += `-- =============================================================================
-- MIGRATION COMPLETE
-- =============================================================================

RAISE NOTICE 'Schema synchronization completed successfully!';
`;

  return migrationSQL;
}

/**
 * Save migration SQL to file
 */
function saveMigrationSQL(migrationSQL) {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
  const filename = `sync-schema-${timestamp}.sql`;
  const filepath = path.join(__dirname, filename);
  
  fs.writeFileSync(filepath, migrationSQL);
  console.log(`✅ Migration SQL saved to: ${filename}`);
  return filepath;
}

/**
 * Apply migration to Supabase
 */
async function applyMigration(migrationSQL) {
  console.log('\n🚀 Applying migration to Supabase...');
  
  try {
    const { data, error } = await supabase.rpc('exec_sql', {
      sql_query: migrationSQL
    });
    
    if (error) {
      console.error('❌ Migration failed:', error.message);
      return false;
    }
    
    console.log('✅ Migration applied successfully!');
    return true;
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    return false;
  }
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 Schema Comparison and Migration Tool');
  console.log('='.repeat(50));
  
  try {
    // Step 1: Get current Supabase schema
    const currentSchema = await getCurrentSupabaseSchema();
    
    // Step 2: Parse expected schema from database/schema.sql
    const expectedSchema = parseExpectedSchema();
    
    // Step 3: Compare schemas
    const differences = compareSchemas(currentSchema, expectedSchema);
    
    // Step 4: Check if migration is needed
    const totalDifferences = differences.missingTables.length + 
                           differences.missingFunctions.length + 
                           differences.missingViews.length + 
                           differences.missingIndexes.length;
    
    if (totalDifferences === 0) {
      console.log('\n✅ Schema is already up to date! No migration needed.');
      return;
    }
    
    // Step 5: Generate migration SQL
    const migrationSQL = generateMigrationSQL(differences);
    const migrationFile = saveMigrationSQL(migrationSQL);
    
    // Step 6: Apply migration if requested
    if (DRY_RUN) {
      console.log('\n🔍 DRY RUN - Migration SQL generated but not applied');
      console.log(`Review the migration file: ${path.basename(migrationFile)}`);
    } else if (APPLY_MIGRATION) {
      const success = await applyMigration(migrationSQL);
      if (success) {
        console.log('\n🎉 Migration completed successfully!');
        console.log('Supabase schema is now synchronized with database/schema.sql');
      }
    } else {
      console.log('\n📝 Migration SQL generated. Use --apply to execute or --dry-run to review.');
      console.log(`Generated file: ${path.basename(migrationFile)}`);
      console.log('\nTo apply: node compare-and-migrate-schema.js --apply');
    }
    
  } catch (error) {
    console.error('❌ Schema comparison failed:', error.message);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main().catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
}

module.exports = { main, getCurrentSupabaseSchema, parseExpectedSchema, compareSchemas };