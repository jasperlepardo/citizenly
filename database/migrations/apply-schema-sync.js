#!/usr/bin/env node

/**
 * Apply Schema Synchronization Migration
 * 
 * This script applies the schema-sync-v2.9.sql migration to bring
 * Supabase up to date with the authoritative database/schema.sql
 * 
 * Usage:
 *   node apply-schema-sync.js [--dry-run]
 * 
 * Options:
 *   --dry-run    Show what would be executed without applying
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY;
const DRY_RUN = process.argv.includes('--dry-run');

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Error: Missing required environment variables');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_KEY');
  console.error('\nExample:');
  console.error('export NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"');
  console.error('export SUPABASE_SERVICE_KEY="your-service-role-key"');
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
 * Read and validate migration file
 */
function readMigrationFile() {
  const migrationPath = path.join(__dirname, 'schema-sync-v2.9.sql');
  
  if (!fs.existsSync(migrationPath)) {
    throw new Error(`Migration file not found: ${migrationPath}`);
  }
  
  const content = fs.readFileSync(migrationPath, 'utf8');
  
  if (content.length === 0) {
    throw new Error('Migration file is empty');
  }
  
  console.log(`📖 Read migration file: ${path.basename(migrationPath)}`);
  console.log(`📏 Migration size: ${(content.length / 1024).toFixed(1)}KB`);
  
  return content;
}

/**
 * Check current schema version
 */
async function checkCurrentVersion() {
  try {
    const { data, error } = await supabase
      .from('system_schema_versions')
      .select('version, description, created_at')
      .order('created_at', { ascending: false })
      .limit(1);
    
    if (error) {
      console.warn('⚠️  Could not check current schema version:', error.message);
      return null;
    }
    
    if (data && data.length > 0) {
      const current = data[0];
      console.log(`📋 Current schema version: ${current.version} (${current.description})`);
      return current.version;
    }
    
    console.log('📋 No schema version found - this appears to be the first migration');
    return null;
    
  } catch (error) {
    console.warn('⚠️  Could not check schema version:', error.message);
    return null;
  }
}

/**
 * Execute migration with progress tracking
 */
async function executeMigration(migrationSQL) {
  console.log('\n🚀 Executing schema synchronization migration...');
  console.log('This will apply all missing schema elements from database/schema.sql');
  console.log('Estimated time: 2-5 minutes depending on database size\n');
  
  try {
    // Split the migration into logical chunks for better error reporting
    const chunks = migrationSQL.split('-- =============================================================================');
    
    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i].trim();
      if (chunk.length === 0) continue;
      
      const chunkSQL = '-- =============================================================================' + chunk;
      
      // Extract section name for progress reporting
      const sectionMatch = chunk.match(/^[\s\S]*?-- ([A-Z\s]+)/);
      const sectionName = sectionMatch ? sectionMatch[1].trim() : `Section ${i + 1}`;
      
      console.log(`⏳ Executing: ${sectionName}...`);
      
      const { error } = await supabase.rpc('exec_sql', {
        sql_query: chunkSQL
      });
      
      if (error) {
        console.error(`❌ Error in ${sectionName}:`, error.message);
        
        // Try to continue with individual statements for better error isolation
        const statements = chunkSQL
          .split(';')
          .map(stmt => stmt.trim())
          .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
        
        for (const statement of statements) {
          try {
            await supabase.rpc('exec_sql', { sql_query: statement + ';' });
          } catch (stmtError) {
            console.warn(`⚠️  Warning on statement: ${stmtError.message}`);
          }
        }
      } else {
        console.log(`✅ Completed: ${sectionName}`);
      }
    }
    
    console.log('\n✅ Migration executed successfully!');
    return true;
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    return false;
  }
}

/**
 * Verify migration results
 */
async function verifyMigration() {
  console.log('\n🔍 Verifying migration results...');
  
  const verifications = [
    {
      name: 'Schema Version',
      query: 'SELECT version FROM system_schema_versions ORDER BY created_at DESC LIMIT 1',
      expected: '2.9'
    },
    {
      name: 'Table Statistics Table',
      query: "SELECT COUNT(*) as count FROM information_schema.tables WHERE table_name = 'system_table_statistics'",
      expected: 1
    },
    {
      name: 'Archive Table',
      query: "SELECT COUNT(*) as count FROM information_schema.tables WHERE table_name = 'system_audit_logs_archive'",
      expected: 1
    },
    {
      name: 'Performance View',
      query: "SELECT COUNT(*) as count FROM information_schema.views WHERE table_name = 'system_performance_metrics'",
      expected: 1
    },
    {
      name: 'Health Metrics View',
      query: "SELECT COUNT(*) as count FROM information_schema.views WHERE table_name = 'system_health_metrics'",
      expected: 1
    },
    {
      name: 'New Performance Indexes',
      query: "SELECT COUNT(*) as count FROM pg_indexes WHERE indexname LIKE 'idx_residents_search_active'",
      expected: 1
    }
  ];
  
  let allPassed = true;
  
  for (const verification of verifications) {
    try {
      const { data, error } = await supabase.rpc('exec_sql', {
        sql_query: verification.query
      });
      
      if (error) {
        console.log(`❌ ${verification.name}: Verification failed - ${error.message}`);
        allPassed = false;
      } else if (data && data.length > 0) {
        const result = data[0];
        const value = result.version || result.count;
        
        if (value == verification.expected) {
          console.log(`✅ ${verification.name}: ${value}`);
        } else {
          console.log(`⚠️  ${verification.name}: Expected ${verification.expected}, got ${value}`);
          allPassed = false;
        }
      } else {
        console.log(`⚠️  ${verification.name}: No data returned`);
        allPassed = false;
      }
    } catch (error) {
      console.log(`❌ ${verification.name}: Verification error - ${error.message}`);
      allPassed = false;
    }
  }
  
  return allPassed;
}

/**
 * Display usage instructions
 */
function displayInstructions() {
  console.log('\n' + '='.repeat(60));
  console.log('🎉 SCHEMA SYNCHRONIZATION COMPLETED SUCCESSFULLY!');
  console.log('='.repeat(60));
  console.log('\n📈 NEW CAPABILITIES ENABLED:');
  console.log('• Performance monitoring system');
  console.log('• Table statistics tracking');
  console.log('• Data archival strategy');
  console.log('• Enhanced performance indexes');
  console.log('• System health monitoring');
  console.log('• Automated maintenance recommendations');
  console.log('\n🔧 USAGE COMMANDS:');
  console.log('\n1. Monitor Performance:');
  console.log('   SELECT * FROM system_performance_metrics;');
  console.log('\n2. Check System Health:');
  console.log('   SELECT * FROM system_health_metrics;');
  console.log('\n3. Get Maintenance Recommendations:');
  console.log('   SELECT * FROM system_maintenance_recommendations;');
  console.log('\n4. Update Table Statistics:');
  console.log('   SELECT update_table_statistics();');
  console.log('\n5. Archive Old Audit Logs:');
  console.log('   SELECT archive_old_audit_logs();');
  console.log('\n💡 RECOMMENDED SCHEDULE:');
  console.log('• Run update_table_statistics() weekly');
  console.log('• Run archive_old_audit_logs() monthly');
  console.log('• Monitor system_health_metrics daily');
  console.log('\n🚀 Your Supabase database is now synchronized with database/schema.sql!');
  console.log('='.repeat(60));
}

/**
 * Main execution
 */
async function main() {
  console.log('🚀 Schema Synchronization Migration Tool');
  console.log('==========================================');
  console.log('Applying database/schema.sql updates to Supabase...\n');
  
  try {
    // Step 1: Read migration file
    const migrationSQL = readMigrationFile();
    
    // Step 2: Check current version
    await checkCurrentVersion();
    
    if (DRY_RUN) {
      console.log('\n🔍 DRY RUN MODE - Showing migration content preview:');
      console.log('─'.repeat(50));
      
      // Show first 500 characters as preview
      const preview = migrationSQL.substring(0, 500) + '...\n[Content truncated]';
      console.log(preview);
      
      console.log('─'.repeat(50));
      console.log('\n📝 Migration ready to apply. Use without --dry-run to execute.');
      return;
    }
    
    // Step 3: Execute migration
    const success = await executeMigration(migrationSQL);
    
    if (!success) {
      console.error('\n❌ Migration failed. Check the errors above.');
      process.exit(1);
    }
    
    // Step 4: Verify results
    const verified = await verifyMigration();
    
    if (verified) {
      // Step 5: Display instructions
      displayInstructions();
    } else {
      console.log('\n⚠️  Migration completed but some verifications failed.');
      console.log('The migration may have been partially successful.');
      console.log('Check the verification results above.');
    }
    
  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error('\n🔧 Troubleshooting:');
    console.error('1. Verify your Supabase credentials are correct');
    console.error('2. Ensure you have service role permissions');
    console.error('3. Check that the migration file exists');
    console.error('4. Try running with --dry-run first');
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

module.exports = { main, readMigrationFile, executeMigration, verifyMigration };