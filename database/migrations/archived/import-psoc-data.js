#!/usr/bin/env node

/**
 * PSOC Data Import via Supabase API
 * =================================
 * 
 * Imports PSOC (Philippine Standard Occupational Classification) data
 * following the hierarchical structure: Major → Sub-Major → Minor → Unit Groups
 */

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { createClient } = require('@supabase/supabase-js');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const fs = require('fs');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const path = require('path');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const csv = require('csv-parser');
// eslint-disable-next-line @typescript-eslint/no-require-imports
require('dotenv').config();

// Supabase client
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// File paths - using the cleaned user data
const DATA_DIR = path.join(__dirname, '../sample data/psoc/updated');
const files = {
  majorGroups: path.join(DATA_DIR, 'psoc_major_groups_clean_from_user.csv'),
  subMajorGroups: path.join(DATA_DIR, 'psoc_sub_major_groups_clean_from_user.csv'),
  minorGroups: path.join(DATA_DIR, 'psoc_minor_groups_clean_from_user.csv'),
  unitGroups: path.join(DATA_DIR, 'psoc_unit_groups_clean_from_user.csv')
};

/**
 * Parse CSV file and return array of records
 */
function parseCSV(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];
    
    if (!fs.existsSync(filePath)) {
      reject(new Error(`File not found: ${filePath}`));
      return;
    }
    
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', reject);
  });
}

/**
 * Clear existing PSOC data
 */
async function clearExistingData() {
  console.log('🗑️  Clearing existing PSOC data...');
  
  const tables = [
    'psoc_unit_sub_groups',
    'psoc_position_titles', 
    'psoc_occupation_cross_references',
    'psoc_unit_groups',
    'psoc_minor_groups', 
    'psoc_sub_major_groups',
    'psoc_major_groups'
  ];
  
  for (const table of tables) {
    const { error } = await supabase
      .from(table)
      .delete()
      .neq('code', ''); // Delete all records
    
    if (error && !error.message.includes('No rows found')) {
      console.log(`Warning clearing ${table}:`, error.message);
    }
  }
  
  console.log('✅ Existing PSOC data cleared');
}

/**
 * Import major groups (top level: 0-9)
 */
async function importMajorGroups(data) {
  console.log(`🏢 Importing ${data.length} major groups...`);
  
  const { error } = await supabase
    .from('psoc_major_groups')
    .insert(data.map(row => ({
      code: row.code,
      title: row.title
    })));
  
  if (error) {
    throw new Error(`Failed to import major groups: ${error.message}`);
  }
  
  console.log('✅ Major groups imported');
}

/**
 * Import sub-major groups (2nd level: 11, 12, etc.)
 * Add missing entries for data integrity
 */
async function importSubMajorGroups(data) {
  console.log(`📋 Importing ${data.length} sub-major groups...`);
  
  // Add missing sub-major group 61 that is referenced by minor groups
  const missingEntries = [
    {
      code: '61',
      title: 'Market-Oriented Skilled Agricultural Workers',
      major_code: '6'
    }
  ];
  
  const allData = [...data, ...missingEntries];
  console.log(`   Adding ${missingEntries.length} missing entries`);
  
  const { error } = await supabase
    .from('psoc_sub_major_groups')
    .insert(allData.map(row => ({
      code: row.code,
      title: row.title,
      major_code: row.major_code
    })));
  
  if (error) {
    throw new Error(`Failed to import sub-major groups: ${error.message}`);
  }
  
  console.log('✅ Sub-major groups imported');
}

/**
 * Import minor groups (3rd level: 111, 112, etc.)
 * Add missing entries for data integrity
 */
async function importMinorGroups(data) {
  console.log(`📝 Importing ${data.length} minor groups...`);
  
  // Add missing minor group 611 that is referenced by unit groups
  const missingEntries = [
    {
      code: '611',
      title: 'Market Gardeners And Crop Growers',
      sub_major_code: '61'
    }
  ];
  
  const allData = [...data, ...missingEntries];
  console.log(`   Adding ${missingEntries.length} missing entries`);
  
  const { error } = await supabase
    .from('psoc_minor_groups')
    .insert(allData.map(row => ({
      code: row.code,
      title: row.title,
      sub_major_code: row.sub_major_code
    })));
  
  if (error) {
    throw new Error(`Failed to import minor groups: ${error.message}`);
  }
  
  console.log('✅ Minor groups imported');
}

/**
 * Import unit groups (4th level: 1111, 1112, etc.)
 */
async function importUnitGroups(data) {
  console.log(`🔧 Importing ${data.length} unit groups...`);
  
  const batchSize = 100; // Smaller batches for better error handling
  let processed = 0;
  
  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize);
    
    const { error } = await supabase
      .from('psoc_unit_groups')
      .insert(batch.map(row => ({
        code: row.code,
        title: row.title,
        minor_code: row.minor_code
      })));
    
    if (error) {
      throw new Error(`Failed to import unit groups batch at ${i}: ${error.message}`);
    }
    
    processed += batch.length;
    console.log(`   📊 Progress: ${processed}/${data.length} unit groups`);
  }
  
  console.log('✅ Unit groups imported');
}

/**
 * Validate data integrity and hierarchy
 */
async function validateData() {
  console.log('🔍 Validating PSOC data integrity...');
  
  const tables = [
    'psoc_major_groups', 
    'psoc_sub_major_groups', 
    'psoc_minor_groups', 
    'psoc_unit_groups'
  ];
  const counts = {};
  
  // Get record counts
  for (const table of tables) {
    const { count, error } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.log(`Warning getting count for ${table}:`, error.message);
      counts[table] = 'Unknown';
    } else {
      counts[table] = count;
    }
  }
  
  console.log('\\n📊 PSOC Record Counts:');
  console.log(`   Major Groups: ${counts.psoc_major_groups}`);
  console.log(`   Sub-Major Groups: ${counts.psoc_sub_major_groups}`);
  console.log(`   Minor Groups: ${counts.psoc_minor_groups}`);
  console.log(`   Unit Groups: ${counts.psoc_unit_groups}`);
  
  // Test hierarchical relationships
  console.log('\\n🔗 Testing PSOC Hierarchy:');
  
  // Test Major → Sub-Major
  const { data: sampleSubMajor, error: subMajorError } = await supabase
    .from('psoc_sub_major_groups')
    .select('code, title, psoc_major_groups(title)')
    .limit(1)
    .single();
  
  if (subMajorError) {
    console.log('❌ Major → Sub-Major relationship failed:', subMajorError.message);
    return false;
  } else {
    console.log(`✅ Major → Sub-Major: "${sampleSubMajor.title}" → "${sampleSubMajor.psoc_major_groups?.title || 'linked'}"`);
  }
  
  // Test Sub-Major → Minor
  const { data: sampleMinor, error: minorError } = await supabase
    .from('psoc_minor_groups')
    .select('code, title, psoc_sub_major_groups(title)')
    .limit(1)
    .single();
  
  if (minorError) {
    console.log('❌ Sub-Major → Minor relationship failed:', minorError.message);
    return false;
  } else {
    console.log(`✅ Sub-Major → Minor: "${sampleMinor.title}" → "${sampleMinor.psoc_sub_major_groups?.title || 'linked'}"`);
  }
  
  // Test Minor → Unit
  const { data: sampleUnit, error: unitError } = await supabase
    .from('psoc_unit_groups')
    .select('code, title, psoc_minor_groups(title)')
    .limit(1)
    .single();
  
  if (unitError) {
    console.log('❌ Minor → Unit relationship failed:', unitError.message);
    return false;
  } else {
    console.log(`✅ Minor → Unit: "${sampleUnit.title}" → "${sampleUnit.psoc_minor_groups?.title || 'linked'}"`);
  }
  
  return true;
}

/**
 * Display sample occupation hierarchy
 */
async function displaySampleHierarchy() {
  console.log('\\n🎯 Sample PSOC Hierarchy:');
  
  const { data: sample, error } = await supabase
    .from('psoc_unit_groups')
    .select(`
      code,
      title,
      psoc_minor_groups (
        code,
        title,
        psoc_sub_major_groups (
          code,
          title,
          psoc_major_groups (
            code,
            title
          )
        )
      )
    `)
    .limit(3);
  
  if (error) {
    console.log('Error fetching sample hierarchy:', error.message);
    return;
  }
  
  sample.forEach((unit, index) => {
    const major = unit.psoc_minor_groups?.psoc_sub_major_groups?.psoc_major_groups;
    const subMajor = unit.psoc_minor_groups?.psoc_sub_major_groups;
    const minor = unit.psoc_minor_groups;
    
    console.log(`\\n${index + 1}. ${major?.code} ${major?.title}`);
    console.log(`   └── ${subMajor?.code} ${subMajor?.title}`);
    console.log(`       └── ${minor?.code} ${minor?.title}`);
    console.log(`           └── ${unit.code} ${unit.title}`);
  });
}

/**
 * Main import function
 */
async function main() {
  try {
    console.log('🚀 Starting PSOC data import via Supabase API...');
    console.log('==================================================');
    
    // Clear existing data
    await clearExistingData();
    
    // Import data in correct hierarchy order
    const majorGroupsData = await parseCSV(files.majorGroups);
    await importMajorGroups(majorGroupsData);
    
    const subMajorGroupsData = await parseCSV(files.subMajorGroups);
    await importSubMajorGroups(subMajorGroupsData);
    
    const minorGroupsData = await parseCSV(files.minorGroups);
    await importMinorGroups(minorGroupsData);
    
    const unitGroupsData = await parseCSV(files.unitGroups);
    await importUnitGroups(unitGroupsData);
    
    // Validate data
    const isValid = await validateData();
    
    if (!isValid) {
      throw new Error('PSOC data integrity validation failed');
    }
    
    // Show sample hierarchy
    await displaySampleHierarchy();
    
    console.log('\\n==================================================');
    console.log('✅ PSOC data import completed successfully!');
    console.log('Philippine occupational classification is now available');
    console.log('==================================================');
    
  } catch (error) {
    console.error('\\n❌ PSOC import failed:', error.message);
    process.exit(1);
  }
}

// Run the import
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main };