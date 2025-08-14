#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../../.env.local' });

// Initialize Supabase client with service key
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function verifyRLSStatus() {
  console.log('🔍 VERIFYING CURRENT RLS STATUS');
  console.log('===============================\n');
  
  try {
    // Check RLS status by querying system tables
    console.log('📋 Checking RLS status via system queries...');
    
    const tables = ['psgc_regions', 'psgc_provinces', 'psgc_cities_municipalities', 'psgc_barangays'];
    
    for (const tableName of tables) {
      try {
        // Check if RLS is enabled via SQL query
        const { data, error } = await supabase
          .rpc('exec_sql', {
            sql_query: `
              SELECT 
                schemaname, 
                tablename, 
                rowsecurity,
                CASE WHEN rowsecurity THEN 'ENABLED' ELSE 'DISABLED' END as rls_status
              FROM pg_tables 
              WHERE tablename = '${tableName}' AND schemaname = 'public';
            `
          });
        
        if (error) {
          // Alternative approach - check policies
          const { data: policies, error: policyError } = await supabase
            .rpc('exec_sql', {
              sql_query: `
                SELECT COUNT(*) as policy_count
                FROM pg_policies 
                WHERE tablename = '${tableName}' AND schemaname = 'public';
              `
            });
          
          if (policyError) {
            console.log(`${tableName}: Unable to determine RLS status - ${error?.message || policyError?.message}`);
          } else {
            console.log(`${tableName}: ${policies?.[0]?.policy_count > 0 ? 'Has policies' : 'No policies'}`);
          }
        } else {
          const status = data?.[0]?.rls_status || 'UNKNOWN';
          console.log(`${tableName}: RLS ${status}`);
        }
      } catch (err) {
        console.log(`${tableName}: Error checking status - ${err.message}`);
      }
    }
    
    // Alternative verification: Try to see the actual table info
    console.log('\n🔧 ALTERNATIVE RLS VERIFICATION:');
    console.log('=================================');
    
    // Use a different approach - check if we can execute privileged operations
    const testQueries = [
      // Check if RLS is working by seeing if we get policy violations
      "SELECT current_setting('row_security')",
      "SELECT has_table_privilege('anon', 'psgc_regions', 'INSERT')",
      "SELECT has_table_privilege('anon', 'psgc_regions', 'UPDATE')",
      "SELECT has_table_privilege('anon', 'psgc_regions', 'DELETE')"
    ];
    
    for (const query of testQueries) {
      try {
        const { data, error } = await supabase.rpc('exec_sql', { sql_query: query });
        
        if (error) {
          console.log(`Query failed: ${query} - ${error.message}`);
        } else {
          console.log(`${query}: ${JSON.stringify(data)}`);
        }
      } catch (err) {
        console.log(`Query error: ${query} - ${err.message}`);
      }
    }
    
    // Final test: Check table permissions directly
    console.log('\n🧪 MANUAL RLS ENABLING (if needed):');
    console.log('====================================');
    
    console.log('If tables still show as unrestricted, run these commands in Supabase SQL Editor:');
    console.log('');
    
    for (const table of tables) {
      console.log(`-- Enable RLS on ${table}`);
      console.log(`ALTER TABLE public.${table} ENABLE ROW LEVEL SECURITY;`);
      console.log(`ALTER TABLE public.${table} FORCE ROW LEVEL SECURITY;`);
      console.log('');
    }
    
    console.log('-- Revoke dangerous permissions from anon');
    console.log('REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon;');
    console.log('GRANT SELECT ON public.psgc_regions TO anon;');
    console.log('GRANT SELECT ON public.psgc_provinces TO anon;');
    console.log('GRANT SELECT ON public.psgc_cities_municipalities TO anon;');
    console.log('GRANT SELECT ON public.psgc_barangays TO anon;');
    
    console.log('\n💡 These commands will force RLS to be enabled and properly restrict access.');
    
  } catch (error) {
    console.error('❌ RLS verification failed:', error.message);
    
    console.log('\n🔧 EMERGENCY RLS COMMANDS:');
    console.log('==========================');
    console.log('Copy and paste these into Supabase SQL Editor:');
    console.log('');
    console.log('-- Force enable RLS on all PSGC tables');
    console.log('ALTER TABLE public.psgc_regions ENABLE ROW LEVEL SECURITY;');
    console.log('ALTER TABLE public.psgc_regions FORCE ROW LEVEL SECURITY;');
    console.log('ALTER TABLE public.psgc_provinces ENABLE ROW LEVEL SECURITY;');
    console.log('ALTER TABLE public.psgc_provinces FORCE ROW LEVEL SECURITY;');
    console.log('ALTER TABLE public.psgc_cities_municipalities ENABLE ROW LEVEL SECURITY;');
    console.log('ALTER TABLE public.psgc_cities_municipalities FORCE ROW LEVEL SECURITY;');
    console.log('ALTER TABLE public.psgc_barangays ENABLE ROW LEVEL SECURITY;');
    console.log('ALTER TABLE public.psgc_barangays FORCE ROW LEVEL SECURITY;');
    console.log('');
    console.log('-- Remove all permissions from anon and re-grant only SELECT');
    console.log('REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon;');
    console.log('GRANT SELECT ON public.psgc_regions TO anon;');
    console.log('GRANT SELECT ON public.psgc_provinces TO anon;');
    console.log('GRANT SELECT ON public.psgc_cities_municipalities TO anon;');
    console.log('GRANT SELECT ON public.psgc_barangays TO anon;');
  }
}

// Run the RLS status verification
if (require.main === module) {
  verifyRLSStatus();
}

module.exports = { verifyRLSStatus };