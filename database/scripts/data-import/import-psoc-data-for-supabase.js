#!/usr/bin/env node

/**
 * PSOC Data Import Script for Supabase - Updated Schema v3.0.0
 * ============================================================
 * 
 * Imports PSOC (Philippine Standard Occupational Classification) data from CSV files
 * into Supabase database using the new schema.sql structure.
 * 
 * Prerequisites:
 * - Node.js with required packages: npm install csv-parser dotenv @supabase/supabase-js
 * - Supabase project with schema.sql applied
 * - CSV files in: database/sample data/psoc/updated/
 * - Environment variables set in .env.local
 * 
 * Usage:
 * cd database/migrations
 * node import-psoc-data-for-supabase.js
 * 
 * Environment Variables Required:
 * - NEXT_PUBLIC_SUPABASE_URL
 * - SUPABASE_SERVICE_KEY
 */

const { createClient } = require('@supabase/supabase-js');
const csv = require('csv-parser');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '../../.env.local' });

// Validate environment variables
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing required environment variables:');
  console.error('   - NEXT_PUBLIC_SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_KEY');
  console.error('   Please set these in your .env.local file');
  process.exit(1);
}

// Initialize Supabase client with service role
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Data file paths
const DATA_PATH = '../sample data/psoc/updated';
const files = {
  majorGroups: 'psoc_major_groups_clean_from_user.csv',
  subMajorGroups: 'psoc_sub_major_groups_clean_from_user.csv',
  minorGroups: 'psoc_minor_groups_clean_from_user.csv',
  unitGroups: 'psoc_unit_groups_clean_from_user.csv'
};

/**
 * Load CSV file into memory
 */
async function loadCSV(fileName) {
  const filePath = path.join(__dirname, DATA_PATH, fileName);
  
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found: ${filePath}`);
  }

  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => {
        // Clean up data - remove empty strings and trim whitespace
        const cleanData = {};
        for (const [key, value] of Object.entries(data)) {
          const cleanValue = typeof value === 'string' ? value.trim() : value;
          cleanData[key] = cleanValue === '' ? null : cleanValue;
        }
        results.push(cleanData);
      })
      .on('end', () => {
        console.log(`📄 Loaded ${results.length} records from ${fileName}`);
        resolve(results);
      })
      .on('error', reject);
  });
}

/**
 * Import data with batch processing and error handling
 */
async function importTable(tableName, data, batchSize = 1000) {
  console.log(`📊 Importing ${data.length} records into ${tableName}...`);
  
  let imported = 0;
  let errors = 0;
  
  // Process in batches to avoid timeout and memory issues
  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize);
    
    try {
      const { error } = await supabase
        .from(tableName)
        .upsert(batch, {
          onConflict: 'code',
          ignoreDuplicates: false
        });
      
      if (error) {
        console.error(`❌ Error importing batch ${Math.floor(i/batchSize) + 1}:`, error);
        errors += batch.length;
      } else {
        imported += batch.length;
        console.log(`✅ Imported batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(data.length/batchSize)} (${imported}/${data.length})`);
      }
    } catch (err) {
      console.error(`❌ Batch import failed:`, err.message);
      errors += batch.length;
    }
  }
  
  console.log(`📈 ${tableName}: ${imported} imported, ${errors} errors`);
  return { imported, errors };
}

/**
 * Transform major groups data for new schema
 */
function transformMajorGroups(data) {
  return data.map(row => ({
    code: row.code || row.major_group_code,
    title: row.title || row.major_group_title
  })).filter(row => row.code && row.title);
}

/**
 * Transform sub-major groups data for new schema
 */
function transformSubMajorGroups(data) {
  return data.map(row => ({
    code: row.code || row.sub_major_group_code,
    title: row.title || row.sub_major_group_title,
    major_code: row.major_group_code || row.major_code
  })).filter(row => row.code && row.title && row.major_code);
}

/**
 * Transform minor groups data for new schema
 */
function transformMinorGroups(data) {
  return data.map(row => ({
    code: row.code || row.minor_group_code,
    title: row.title || row.minor_group_title,
    sub_major_code: row.sub_major_group_code || row.sub_major_code
  })).filter(row => row.code && row.title && row.sub_major_code);
}

/**
 * Transform unit groups data for new schema
 */
function transformUnitGroups(data) {
  return data.map(row => ({
    code: row.code || row.unit_group_code,
    title: row.title || row.unit_group_title,
    minor_code: row.minor_group_code || row.minor_code
  })).filter(row => row.code && row.title && row.minor_code);
}

/**
 * Verify data integrity after import
 */
async function verifyImport() {
  console.log('\n🔍 Verifying import...');
  
  const tables = ['psoc_major_groups', 'psoc_sub_major_groups', 'psoc_minor_groups', 'psoc_unit_groups'];
  
  for (const table of tables) {
    const { count, error } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.error(`❌ Error checking ${table}:`, error);
    } else {
      console.log(`📊 ${table}: ${count} records`);
    }
  }
  
  // Check referential integrity
  console.log('\n🔗 Checking referential integrity...');
  
  // Check sub-major -> major
  const { data: subMajorWithoutMajor } = await supabase
    .from('psoc_sub_major_groups')
    .select('code, title, major_group_code')
    .not('major_group_code', 'in', supabase.from('psoc_major_groups').select('code'));
  
  if (subMajorWithoutMajor?.length > 0) {
    console.warn(`⚠️  Found ${subMajorWithoutMajor.length} sub-major groups with invalid major group codes`);
  } else {
    console.log('✅ All sub-major groups have valid major group references');
  }
  
  // Check minor -> sub-major  
  const { data: minorWithoutSubMajor } = await supabase
    .from('psoc_minor_groups')
    .select('code, title, sub_major_group_code')
    .not('sub_major_group_code', 'in', supabase.from('psoc_sub_major_groups').select('code'));
  
  if (minorWithoutSubMajor?.length > 0) {
    console.warn(`⚠️  Found ${minorWithoutSubMajor.length} minor groups with invalid sub-major group codes`);
  } else {
    console.log('✅ All minor groups have valid sub-major group references');
  }
  
  // Check unit -> minor
  const { data: unitWithoutMinor } = await supabase
    .from('psoc_unit_groups')
    .select('code, title, minor_group_code')
    .not('minor_group_code', 'in', supabase.from('psoc_minor_groups').select('code'));
  
  if (unitWithoutMinor?.length > 0) {
    console.warn(`⚠️  Found ${unitWithoutMinor.length} unit groups with invalid minor group codes`);
  } else {
    console.log('✅ All unit groups have valid minor group references');
  }
}

/**
 * Main import function
 */
async function main() {
  try {
    console.log('🚀 Starting PSOC data import for Supabase (Schema v3.0.0)...');
    console.log(`📂 Data source: ${path.resolve(__dirname, DATA_PATH)}`);
    
    // Load all CSV files
    console.log('\n📥 Loading CSV files...');
    const [majorGroupsData, subMajorGroupsData, minorGroupsData, unitGroupsData] = await Promise.all([
      loadCSV(files.majorGroups),
      loadCSV(files.subMajorGroups), 
      loadCSV(files.minorGroups),
      loadCSV(files.unitGroups)
    ]);
    
    // Transform data according to new schema
    console.log('\n🔄 Transforming data...');
    const transformedData = {
      majorGroups: transformMajorGroups(majorGroupsData),
      subMajorGroups: transformSubMajorGroups(subMajorGroupsData),
      minorGroups: transformMinorGroups(minorGroupsData),
      unitGroups: transformUnitGroups(unitGroupsData)
    };
    
    console.log('📊 Transformed data summary:');
    console.log(`   - Major Groups: ${transformedData.majorGroups.length}`);
    console.log(`   - Sub-Major Groups: ${transformedData.subMajorGroups.length}`);
    console.log(`   - Minor Groups: ${transformedData.minorGroups.length}`);
    console.log(`   - Unit Groups: ${transformedData.unitGroups.length}`);
    
    // Import in order (respecting foreign key dependencies)
    console.log('\n📤 Starting import process...');
    
    const results = {
      majorGroups: await importTable('psoc_major_groups', transformedData.majorGroups),
      subMajorGroups: await importTable('psoc_sub_major_groups', transformedData.subMajorGroups),
      minorGroups: await importTable('psoc_minor_groups', transformedData.minorGroups),
      unitGroups: await importTable('psoc_unit_groups', transformedData.unitGroups, 2000) // Larger batch for unit groups
    };
    
    // Verify the import
    await verifyImport();
    
    // Summary
    console.log('\n📋 Import Summary:');
    console.log('='.repeat(50));
    let totalImported = 0;
    let totalErrors = 0;
    
    for (const [table, result] of Object.entries(results)) {
      console.log(`${table}: ${result.imported} imported, ${result.errors} errors`);
      totalImported += result.imported;
      totalErrors += result.errors;
    }
    
    console.log('='.repeat(50));
    console.log(`Total: ${totalImported} imported, ${totalErrors} errors`);
    
    if (totalErrors === 0) {
      console.log('🎉 PSOC data import completed successfully!');
    } else {
      console.log(`⚠️  PSOC data import completed with ${totalErrors} errors`);
    }
    
  } catch (error) {
    console.error('💥 Import failed:', error);
    process.exit(1);
  }
}

// Run the import
if (require.main === module) {
  main().then(() => {
    console.log('👋 Import script finished');
    process.exit(0);
  }).catch(error => {
    console.error('💥 Unhandled error:', error);
    process.exit(1);
  });
}

module.exports = { main, loadCSV, transformMajorGroups, transformSubMajorGroups, transformMinorGroups, transformUnitGroups };