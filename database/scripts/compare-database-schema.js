#!/usr/bin/env node

/**
 * Database Schema Comparison Tool
 * Compares actual database structure with schema.sql to identify differences
 */

require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

// Initialize Supabase client with service role
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function executeQuery(query) {
  try {
    const { data, error } = await supabase.rpc('exec_sql', { sql: query });
    if (error) throw error;
    return data;
  } catch (error) {
    // Try direct query if RPC doesn't work
    try {
      const { data, error } = await supabase.from('pg_stat_activity').select('*').limit(1);
      if (error && error.message.includes('permission denied')) {
        console.log('⚠️  Using limited query access...');
        return null;
      }
    } catch (e) {
      console.error(`Query failed: ${query}`);
      console.error(error.message);
      return null;
    }
  }
}

async function checkEnumTypes() {
  console.log('\n🔍 CHECKING ENUM TYPES');
  console.log('='.repeat(50));

  const enumQuery = `
    SELECT 
      t.typname as enum_name,
      array_agg(e.enumlabel ORDER BY e.enumsortorder) as enum_values
    FROM pg_type t 
    JOIN pg_enum e ON t.oid = e.enumtypid  
    WHERE t.typname LIKE '%_enum'
    GROUP BY t.typname
    ORDER BY t.typname;
  `;

  try {
    // Try using a simpler approach for Supabase
    const { data: types, error } = await supabase
      .from('information_schema.columns')
      .select('table_name, column_name, data_type, udt_name')
      .like('udt_name', '%_enum');

    if (error) {
      console.log('❌ Could not query enum types directly:', error.message);
      console.log('📝 Manual check recommended - see enum comparison below\n');
      
      // Show what we expect from schema.sql
      console.log('📋 EXPECTED ENUMS FROM SCHEMA.SQL:');
      console.log('├─ sex_enum: [\'male\', \'female\']');
      console.log('├─ civil_status_enum: [\'single\', \'married\', \'divorced\', \'separated\', \'widowed\', \'others\']');
      console.log('├─ citizenship_enum: [\'filipino\', \'dual_citizen\', \'foreigner\']');
      console.log('├─ education_level_enum: [\'no_schooling\', \'elementary\', \'elementary_graduate\', \'high_school\', \'high_school_graduate\', \'post_secondary\', \'college_undergraduate\', \'college_graduate\', \'post_baccalaureate\']');
      console.log('├─ employment_status_enum: [\'employed\', \'unemployed\', \'underemployed\', \'self_employed\', \'student\', \'retired\', \'homemaker\', \'unable_to_work\', \'looking_for_work\', \'not_in_labor_force\']');
      console.log('├─ blood_type_enum: [\'A+\', \'A-\', \'B+\', \'B-\', \'AB+\', \'AB-\', \'O+\', \'O-\', \'unknown\']');
      console.log('├─ religion_enum: [\'roman_catholic\', \'islam\', \'iglesia_ni_cristo\', \'christian\', \'aglipayan_church\', \'seventh_day_adventist\', \'bible_baptist_church\', \'jehovahs_witnesses\', \'church_of_jesus_christ_latter_day_saints\', \'united_church_of_christ_philippines\', \'others\']');
      console.log('├─ ethnicity_enum: [\'tagalog\', \'cebuano\', \'ilocano\', \'bisaya\', \'hiligaynon\', \'bikolano\', \'waray\', \'kapampangan\', \'pangasinense\', \'maranao\', \'maguindanao\', \'tausug\', \'yakan\', \'samal\', \'badjao\', \'aeta\', \'agta\', \'ati\', \'batak\', \'bukidnon\', \'gaddang\', \'higaonon\', \'ibaloi\', \'ifugao\', \'igorot\', \'ilongot\', \'isneg\', \'ivatan\', \'kalinga\', \'kankanaey\', \'mangyan\', \'mansaka\', \'palawan\', \'subanen\', \'tboli\', \'teduray\', \'tumandok\', \'chinese\', \'others\']');
      console.log('├─ household_type_enum: [\'nuclear\', \'single_parent\', \'extended\', \'childless\', \'one_person\', \'non_family\', \'other\']');
      console.log('├─ tenure_status_enum: [\'owned\', \'owned_with_mortgage\', \'rented\', \'occupied_for_free\', \'occupied_without_consent\', \'others\']');
      console.log('├─ household_unit_enum: [\'single_house\', \'duplex\', \'apartment\', \'townhouse\', \'condominium\', \'boarding_house\', \'institutional\', \'makeshift\', \'others\']');
      console.log('├─ income_class_enum: [\'rich\', \'high_income\', \'upper_middle_income\', \'middle_class\', \'lower_middle_class\', \'low_income\', \'poor\', \'not_determined\']');
      console.log('└─ household_head_position_enum: [\'father\', \'mother\', \'son\', \'daughter\', \'grandmother\', \'grandfather\', \'other_relative\', \'non_relative\']');
    } else {
      console.log('✅ Found enum types in database:');
      types.forEach(type => {
        console.log(`├─ ${type.udt_name} (used in ${type.table_name}.${type.column_name})`);
      });
    }
  } catch (error) {
    console.error('❌ Error checking enums:', error.message);
  }
}

async function checkTables() {
  console.log('\n🗂️  CHECKING TABLE STRUCTURES');
  console.log('='.repeat(50));

  try {
    const { data: tables, error } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .order('table_name');

    if (error) throw error;

    console.log('📋 TABLES IN DATABASE:');
    tables.forEach(table => {
      console.log(`├─ ${table.table_name}`);
    });

    // Expected tables from schema.sql
    const expectedTables = [
      'psgc_regions', 'psgc_provinces', 'psgc_cities_municipalities', 'psgc_barangays',
      'psoc_major_groups', 'psoc_sub_major_groups', 'psoc_minor_groups', 'psoc_unit_groups',
      'psoc_unit_sub_groups', 'psoc_position_titles', 'psoc_occupation_cross_references',
      'auth_roles', 'auth_user_profiles', 'auth_barangay_accounts',
      'geo_subdivisions', 'geo_streets',
      'households', 'residents', 'household_members', 'resident_relationships',
      'resident_sectoral_info', 'resident_migrant_info',
      'system_dashboard_summaries', 'system_audit_logs', 'system_schema_versions'
    ];

    console.log('\n📊 TABLE COMPARISON:');
    const foundTables = tables.map(t => t.table_name);
    
    expectedTables.forEach(expected => {
      const exists = foundTables.includes(expected);
      console.log(`${exists ? '✅' : '❌'} ${expected}`);
    });

    const extraTables = foundTables.filter(found => !expectedTables.includes(found));
    if (extraTables.length > 0) {
      console.log('\n🔍 EXTRA TABLES (not in schema.sql):');
      extraTables.forEach(extra => {
        console.log(`⚠️  ${extra}`);
      });
    }

  } catch (error) {
    console.error('❌ Error checking tables:', error.message);
  }
}

async function checkKeyTables() {
  console.log('\n🎯 CHECKING KEY TABLE COLUMNS');
  console.log('='.repeat(50));

  const keyTables = ['residents', 'households', 'auth_user_profiles'];
  
  for (const tableName of keyTables) {
    try {
      const { data: columns, error } = await supabase
        .from('information_schema.columns')
        .select('column_name, data_type, is_nullable, column_default, udt_name')
        .eq('table_name', tableName)
        .eq('table_schema', 'public')
        .order('ordinal_position');

      if (error) throw error;

      console.log(`\n📋 ${tableName.toUpperCase()} TABLE:`);
      columns.forEach(col => {
        const nullable = col.is_nullable === 'YES' ? 'nullable' : 'NOT NULL';
        const dataType = col.udt_name || col.data_type;
        console.log(`├─ ${col.column_name}: ${dataType} (${nullable})`);
      });

    } catch (error) {
      console.log(`❌ Could not check ${tableName} structure:`, error.message);
    }
  }
}

async function main() {
  console.log('🔍 DATABASE SCHEMA COMPARISON');
  console.log('=' .repeat(60));
  console.log(`📡 Connected to: ${supabaseUrl}`);
  console.log('🎯 Comparing actual database with schema.sql...\n');

  try {
    await checkTables();
    await checkKeyTables();
    await checkEnumTypes();

    console.log('\n📋 SUMMARY & RECOMMENDATIONS');
    console.log('='.repeat(50));
    console.log('✅ Comparison complete!');
    console.log('📝 Review the output above to identify differences');
    console.log('🔧 Key areas to check:');
    console.log('   1. Missing or extra tables');
    console.log('   2. Column differences in key tables');
    console.log('   3. Enum type mismatches');
    console.log('\n💡 Next steps:');
    console.log('   • Fix any enum mismatches');
    console.log('   • Add missing tables/columns');  
    console.log('   • Update schema.sql if database is correct');

  } catch (error) {
    console.error('❌ Comparison failed:', error.message);
    console.log('\n🛠️  Manual verification recommended:');
    console.log('   • Check Supabase dashboard table editor');
    console.log('   • Review enum definitions in SQL editor');
    console.log('   • Compare with schema.sql file manually');
  }
}

if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main };