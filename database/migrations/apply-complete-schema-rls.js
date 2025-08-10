#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '../../.env.local' });

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function applyCompleteSchemaRLS() {
  console.log('🔒 APPLYING COMPLETE RLS TO ALL SCHEMA TABLES');
  console.log('==============================================\n');
  
  try {
    // Read the schema-based RLS file
    const sqlFilePath = path.join(__dirname, 'secure-all-tables.sql');
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');
    
    console.log('📄 Processing complete schema RLS setup...');
    
    // Since we can't execute the SQL directly, provide manual steps
    console.log('\n🎯 COMPLETE RLS IMPLEMENTATION REQUIRED:');
    console.log('=========================================');
    
    console.log('\n1. 📋 YOUR DATABASE HAS THESE TABLES TO SECURE:');
    console.log('   ============================================');
    
    // List all tables from the schema
    const schemaTables = [
      // Reference Data Tables (14 tables)
      'psgc_regions', 'psgc_provinces', 'psgc_cities_municipalities', 'psgc_barangays',
      'psoc_major_groups', 'psoc_sub_major_groups', 'psoc_minor_groups', 
      'psoc_unit_groups', 'psoc_unit_sub_groups', 'psoc_position_titles', 'psoc_cross_references',
      
      // Access Control (2 tables)  
      'roles', 'user_profiles',
      
      // Core Entities (3 tables)
      'households', 'residents', 'resident_relationships'
    ];
    
    console.log(`   📊 Reference Tables: 11 tables (PSGC + PSOC)`);
    console.log(`   👥 User Tables: 2 tables (roles, profiles)`);
    console.log(`   🏠 Core Data: 3 tables (households, residents, relationships)`);
    console.log(`   ✨ Total: ${schemaTables.length} tables to secure\n`);
    
    console.log('2. 🚀 IMPLEMENTATION STEPS:');
    console.log('   =======================');
    console.log('   a) Open Supabase Dashboard');
    console.log('   b) Go to SQL Editor');
    console.log('   c) Copy & paste the secure-all-tables.sql file');
    console.log('   d) Run the complete SQL script');
    console.log('');
    
    console.log('3. 🔐 SECURITY POLICIES THAT WILL BE APPLIED:');
    console.log('   ==========================================');
    console.log('   📍 PSGC/PSOC Tables: Public read access');
    console.log('   🏠 Residents/Households: Barangay-scoped access');
    console.log('   👥 User Profiles: Own profile access');
    console.log('   ⚙️  Roles: Super admin only');
    console.log('   🚫 Anonymous: No write access to any table');
    console.log('');
    
    // Test current state
    console.log('4. 🧪 TESTING CURRENT ACCESS LEVELS:');
    console.log('   ================================');
    
    let securedCount = 0;
    let unrestrictedCount = 0;
    
    // Test a few key tables
    const testTables = ['psgc_regions', 'residents', 'households', 'user_profiles', 'roles'];
    
    const anonClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    
    for (const tableName of testTables) {
      try {
        // Test write access (should be blocked)
        const { error: writeError } = await anonClient
          .from(tableName)
          .insert({ test: 'value' });
        
        // Test read access
        const { data: readData, error: readError } = await anonClient
          .from(tableName)
          .select('*')
          .limit(1);
        
        if (writeError && writeError.message.includes('permission denied')) {
          console.log(`   ✅ ${tableName}: Write access blocked (secured)`);
          securedCount++;
        } else if (writeError && (writeError.message.includes('duplicate') || writeError.message.includes('violates'))) {
          console.log(`   ⚠️  ${tableName}: Write access allowed (needs RLS)`);
          unrestrictedCount++;
        } else {
          console.log(`   ❓ ${tableName}: Status unclear - ${writeError?.message || 'accessible'}`);
          unrestrictedCount++;
        }
      } catch (err) {
        console.log(`   ❓ ${tableName}: Error testing - ${err.message}`);
      }
    }
    
    console.log(`\n   📊 Security Status:`);
    console.log(`   ✅ Properly secured: ${securedCount}/${testTables.length}`);
    console.log(`   ⚠️  Need RLS: ${unrestrictedCount}/${testTables.length}`);
    
    if (unrestrictedCount > 0) {
      console.log('\n5. ⚡ IMMEDIATE ACTION REQUIRED:');
      console.log('   ============================');
      console.log('   Your tables are still unrestricted!');
      console.log('   Run the secure-all-tables.sql file ASAP');
      console.log('');
      console.log('   🔥 CRITICAL: Your resident data is unprotected');
      console.log('   🔥 CRITICAL: Anyone can modify your database');
      console.log('');
    } else {
      console.log('\n5. 🎉 SECURITY STATUS: GOOD');
      console.log('   ========================');
      console.log('   Your key tables appear to be secured');
    }
    
    console.log('\n6. 📁 FILES CREATED FOR YOU:');
    console.log('   =========================');
    console.log('   📄 secure-all-tables.sql - Complete RLS setup');
    console.log('   🧪 This script - Testing and guidance');
    console.log('');
    
    console.log('7. 🎯 NEXT STEPS AFTER RUNNING SQL:');
    console.log('   ===============================');
    console.log('   a) All tables will show "Restricted" in Supabase dashboard');
    console.log('   b) Only authorized users can access resident data');
    console.log('   c) Reference data (PSGC/PSOC) remains publicly readable');
    console.log('   d) Your RBI system will be properly secured');
    
    console.log('\n🔒 SCHEMA SECURITY: Ready for implementation');
    
  } catch (error) {
    console.error('❌ Schema RLS preparation failed:', error.message);
    
    console.log('\n🔧 FALLBACK OPTION:');
    console.log('==================');
    console.log('If automated setup fails, manually run these core commands:');
    console.log('');
    console.log('-- Enable RLS on all tables');
    console.log('ALTER TABLE public.psgc_regions ENABLE ROW LEVEL SECURITY;');
    console.log('ALTER TABLE public.residents ENABLE ROW LEVEL SECURITY;');
    console.log('ALTER TABLE public.households ENABLE ROW LEVEL SECURITY;');
    console.log('-- (repeat for all tables in your schema)');
    console.log('');
    console.log('-- Remove dangerous permissions');
    console.log('REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon;');
    console.log('');
    console.log('-- Grant only safe read access');
    console.log('GRANT SELECT ON public.psgc_regions TO anon;');
  }
}

// Run the complete schema RLS preparation
if (require.main === module) {
  applyCompleteSchemaRLS();
}

module.exports = { applyCompleteSchemaRLS };