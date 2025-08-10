#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../../.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function discoverAndSecureAllTables() {
  console.log('🔍 DISCOVERING ALL TABLES IN YOUR DATABASE');
  console.log('==========================================\n');
  
  try {
    // Try to discover all tables by testing many possible table names
    const possibleTables = [
      // PSGC tables (confirmed)
      'psgc_regions', 'psgc_provinces', 'psgc_cities_municipalities', 'psgc_barangays',
      
      // PSOC tables (from schema)
      'psoc_major_groups', 'psoc_sub_major_groups', 'psoc_minor_groups', 
      'psoc_unit_groups', 'psoc_unit_sub_groups', 'psoc_position_titles', 'psoc_cross_references',
      
      // User/Auth tables
      'user_profiles', 'roles', 'profiles', 'users',
      
      // Core entities (from schema)
      'households', 'residents', 'resident_relationships',
      
      // Common application tables
      'posts', 'articles', 'content', 'pages', 'blogs',
      'comments', 'reviews', 'feedback', 'testimonials',
      'notifications', 'messages', 'alerts', 'announcements',
      'settings', 'configurations', 'options', 'preferences',
      'logs', 'audit_logs', 'activity_logs', 'system_logs',
      'files', 'uploads', 'media', 'images', 'documents',
      'categories', 'tags', 'labels', 'topics',
      'organizations', 'companies', 'groups', 'teams',
      'events', 'activities', 'tasks', 'projects',
      'orders', 'transactions', 'payments', 'invoices',
      'contacts', 'addresses', 'locations', 'places',
      'products', 'services', 'items', 'inventory'
    ];
    
    console.log('🔍 Testing for existing tables...');
    const foundTables = [];
    
    for (const tableName of possibleTables) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);
        
        if (!error) {
          foundTables.push(tableName);
          console.log(`✅ Found: ${tableName}`);
        }
      } catch (err) {
        // Table doesn't exist
      }
    }
    
    console.log(`\n📊 DISCOVERED ${foundTables.length} TABLES:`);
    console.log('=======================================');
    foundTables.forEach((table, index) => {
      console.log(`${index + 1}. ${table}`);
    });
    
    if (foundTables.length === 0) {
      console.log('❌ No tables found - this might indicate permission issues');
      return;
    }
    
    // Generate SQL to secure ALL found tables
    console.log('\n🔒 GENERATING SQL TO SECURE ALL TABLES:');
    console.log('========================================');
    
    let sql = '-- Enable RLS on ALL discovered tables\n';
    
    foundTables.forEach(table => {
      sql += `ALTER TABLE public.${table} ENABLE ROW LEVEL SECURITY;\n`;
      sql += `ALTER TABLE public.${table} FORCE ROW LEVEL SECURITY;\n`;
    });
    
    sql += '\n-- Remove ALL permissions from anon\n';
    sql += 'REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon;\n';
    sql += 'REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon;\n';
    sql += 'REVOKE ALL ON ALL FUNCTIONS IN SCHEMA public FROM anon;\n';
    
    sql += '\n-- Grant safe read access to reference data only\n';
    
    const publicReadTables = foundTables.filter(table => 
      table.startsWith('psgc_') || table.startsWith('psoc_')
    );
    
    publicReadTables.forEach(table => {
      sql += `GRANT SELECT ON public.${table} TO anon;\n`;
    });
    
    sql += '\n-- Create basic read policies for reference data\n';
    publicReadTables.forEach(table => {
      sql += `CREATE POLICY IF NOT EXISTS "Public read ${table}" ON public.${table} FOR SELECT USING (true);\n`;
    });
    
    // Save to file
    const fs = require('fs');
    const path = require('path');
    const sqlPath = path.join(__dirname, 'secure-all-discovered-tables.sql');
    fs.writeFileSync(sqlPath, sql);
    
    console.log('\n✅ SQL GENERATED AND SAVED TO:');
    console.log('secure-all-discovered-tables.sql');
    console.log('\nCopy this file content to Supabase SQL Editor to secure ALL tables.');
    
    console.log('\n📋 SUMMARY:');
    console.log(`• Total tables found: ${foundTables.length}`);
    console.log(`• Reference tables (public read): ${publicReadTables.length}`);
    console.log(`• Protected tables (no anon access): ${foundTables.length - publicReadTables.length}`);
    
    console.log('\n🎯 NEXT STEPS:');
    console.log('1. Copy secure-all-discovered-tables.sql content');
    console.log('2. Paste into Supabase SQL Editor');
    console.log('3. Run the SQL');
    console.log('4. All tables will show "Restricted"');
    
  } catch (error) {
    console.error('❌ Discovery failed:', error.message);
  }
}

// Run the discovery
if (require.main === module) {
  discoverAndSecureAllTables();
}

module.exports = { discoverAndSecureAllTables };