#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../../.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function findRemainingTables() {
  console.log('🔍 SEARCHING FOR REMAINING UNRESTRICTED TABLES');
  console.log('===============================================\n');
  
  try {
    // Extended list of possible table names including system and auth tables
    const possibleTables = [
      // Already secured (16 tables)
      'psgc_regions', 'psgc_provinces', 'psgc_cities_municipalities', 'psgc_barangays',
      'psoc_major_groups', 'psoc_sub_major_groups', 'psoc_minor_groups', 
      'psoc_unit_groups', 'psoc_unit_sub_groups', 'psoc_position_titles', 'psoc_cross_references',
      'user_profiles', 'roles', 'households', 'residents', 'resident_relationships',
      
      // Additional possible tables
      'profiles', 'users', 'accounts', 'sessions',
      'audit_logs', 'system_logs', 'activity_logs', 'logs',
      'settings', 'configurations', 'preferences', 'options',
      'notifications', 'messages', 'alerts', 'announcements',
      'files', 'uploads', 'media', 'images', 'documents', 'attachments',
      'categories', 'tags', 'labels', 'topics', 'subjects',
      'posts', 'articles', 'content', 'pages', 'blogs', 'news',
      'comments', 'reviews', 'feedback', 'testimonials', 'ratings',
      'events', 'activities', 'tasks', 'projects', 'assignments',
      'organizations', 'companies', 'groups', 'teams', 'departments',
      'contacts', 'addresses', 'locations', 'places', 'venues',
      'products', 'services', 'items', 'inventory', 'catalog',
      'orders', 'transactions', 'payments', 'invoices', 'receipts',
      'reports', 'analytics', 'statistics', 'metrics', 'dashboards',
      
      // Database system tables that might show up
      'migrations', 'schema_migrations', 'version', 'versions',
      'seeds', 'test_data', 'sample_data',
      
      // Supabase specific tables
      'auth_users', 'storage_objects', 'storage_buckets',
      'realtime_subscriptions', 'realtime_messages',
      
      // Possible typos or variations
      'resident', 'household', 'profile', 'role',
      'barangays', 'cities', 'provinces', 'regions',
      
      // Application specific tables (common patterns)
      'admin_logs', 'user_sessions', 'login_logs',
      'backup_data', 'temp_data', 'staging_data',
      'import_logs', 'export_logs', 'sync_logs',
      'error_logs', 'debug_logs', 'performance_logs'
    ];
    
    console.log('🔍 Testing for additional tables...');
    const allFoundTables = [];
    
    for (const tableName of possibleTables) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);
        
        if (!error) {
          allFoundTables.push(tableName);
        }
      } catch (err) {
        // Table doesn't exist or not accessible
      }
    }
    
    console.log(`\n📊 TOTAL TABLES FOUND: ${allFoundTables.length}`);
    console.log('=====================================');
    
    const previouslySecured = [
      'psgc_regions', 'psgc_provinces', 'psgc_cities_municipalities', 'psgc_barangays',
      'psoc_major_groups', 'psoc_sub_major_groups', 'psoc_minor_groups', 
      'psoc_unit_groups', 'psoc_unit_sub_groups', 'psoc_position_titles', 'psoc_cross_references',
      'user_profiles', 'roles', 'households', 'residents', 'resident_relationships'
    ];
    
    const remainingTables = allFoundTables.filter(table => 
      !previouslySecured.includes(table)
    );
    
    console.log('\n✅ PREVIOUSLY SECURED (16 tables):');
    previouslySecured.forEach((table, index) => {
      if (allFoundTables.includes(table)) {
        console.log(`${index + 1}. ${table}`);
      }
    });
    
    console.log(`\n🚨 REMAINING UNRESTRICTED TABLES (${remainingTables.length} tables):`);
    console.log('================================================');
    
    if (remainingTables.length === 0) {
      console.log('✅ No additional tables found - all should be secured!');
    } else {
      remainingTables.forEach((table, index) => {
        console.log(`${index + 1}. ${table} ❌ NEEDS RLS`);
      });
      
      // Generate SQL for remaining tables
      console.log('\n🔒 SQL TO SECURE REMAINING TABLES:');
      console.log('===================================');
      
      let sql = '-- Enable RLS on remaining tables\n';
      remainingTables.forEach(table => {
        sql += `ALTER TABLE public.${table} ENABLE ROW LEVEL SECURITY;\n`;
        sql += `ALTER TABLE public.${table} FORCE ROW LEVEL SECURITY;\n`;
      });
      
      console.log(sql);
      
      // Save to file
      const fs = require('fs');
      const path = require('path');
      const sqlPath = path.join(__dirname, 'secure-remaining-tables.sql');
      fs.writeFileSync(sqlPath, sql);
      
      console.log('✅ SQL saved to: secure-remaining-tables.sql');
      console.log('\nCopy this to Supabase SQL Editor to secure the remaining tables.');
    }
    
    console.log(`\n📋 FINAL COUNT:`);
    console.log(`• Previously secured: ${previouslySecured.length}`);
    console.log(`• Still need securing: ${remainingTables.length}`);
    console.log(`• Total database tables: ${allFoundTables.length}`);
    
  } catch (error) {
    console.error('❌ Search failed:', error.message);
  }
}

// Run the search
if (require.main === module) {
  findRemainingTables();
}

module.exports = { findRemainingTables };