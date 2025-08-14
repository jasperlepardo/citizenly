#!/usr/bin/env node

/**
 * PSGC Data Import Script
 * ======================
 * 
 * Imports PSGC (Philippine Standard Geographic Code) data from CSV files
 * into PostgreSQL database. Alternative to SQL COPY for environments 
 * without direct file system access.
 * 
 * Prerequisites:
 * - Node.js with pg package: npm install pg csv-parser
 * - Database with schema.sql applied
 * - CSV files in: database/sample data/psgc/updated/
 * 
 * Usage:
 * node import-psgc-data.js
 * 
 * Environment Variables:
 * - DATABASE_URL or individual DB connection params
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
require('dotenv').config();

// Database connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL || {
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'citizenly',
    password: process.env.DB_PASSWORD || 'password',
    port: process.env.DB_PORT || 5432,
  }
});

// File paths
const DATA_DIR = path.join(__dirname, '../sample data/psgc/updated');
const files = {
  regions: path.join(DATA_DIR, 'psgc_regions.updated.csv'),
  provinces: path.join(DATA_DIR, 'psgc_provinces.updated.csv'),
  cities: path.join(DATA_DIR, 'psgc_cities_municipalities.updated.fixed.csv'),
  barangays: path.join(DATA_DIR, 'psgc_barangays.updated.csv')
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
 * Clear existing PSGC data
 */
async function clearExistingData(client) {
  console.log('🗑️  Clearing existing PSGC data...');
  
  await client.query('TRUNCATE psgc_barangays CASCADE');
  await client.query('TRUNCATE psgc_cities_municipalities CASCADE');
  await client.query('TRUNCATE psgc_provinces CASCADE');
  await client.query('TRUNCATE psgc_regions CASCADE');
  
  console.log('✅ Existing data cleared');
}

/**
 * Import regions data
 */
async function importRegions(client, data) {
  console.log(`📍 Importing ${data.length} regions...`);
  
  for (const row of data) {
    await client.query(
      'INSERT INTO psgc_regions (code, name) VALUES ($1, $2)',
      [row.code, row.name]
    );
  }
  
  console.log('✅ Regions imported');
}

/**
 * Import provinces data
 */
async function importProvinces(client, data) {
  console.log(`🏔️  Importing ${data.length} provinces...`);
  
  for (const row of data) {
    // Convert string boolean to actual boolean
    const isActive = row.is_active === 'True' || row.is_active === 'true' || row.is_active === '1';
    
    await client.query(
      'INSERT INTO psgc_provinces (code, name, region_code, is_active) VALUES ($1, $2, $3, $4)',
      [row.code, row.name, row.region_code, isActive]
    );
  }
  
  console.log('✅ Provinces imported');
}

/**
 * Import cities and municipalities data
 */
async function importCities(client, data) {
  console.log(`🏙️  Importing ${data.length} cities/municipalities...`);
  
  for (const row of data) {
    // Handle independent cities (no province)
    const provinceCode = row.province_code === '' ? null : row.province_code;
    const isIndependent = row.is_independent === 'True' || row.is_independent === 'true' || row.is_independent === '1';
    
    await client.query(
      'INSERT INTO psgc_cities_municipalities (code, name, province_code, type, is_independent) VALUES ($1, $2, $3, $4, $5)',
      [row.code, row.name, provinceCode, row.type, isIndependent]
    );
  }
  
  console.log('✅ Cities/municipalities imported');
}

/**
 * Import barangays data (in batches for performance)
 */
async function importBarangays(client, data) {
  console.log(`🏘️  Importing ${data.length} barangays...`);
  
  const batchSize = 1000;
  let processed = 0;
  
  for (let i = 0; i < data.length; i += batchSize) {
    const batch = data.slice(i, i + batchSize);
    
    // Build VALUES clause for batch insert
    const values = [];
    const params = [];
    
    batch.forEach((row, index) => {
      const baseIndex = index * 3;
      values.push(`($${baseIndex + 1}, $${baseIndex + 2}, $${baseIndex + 3})`);
      params.push(row.code, row.name, row.city_municipality_code);
    });
    
    const query = `INSERT INTO psgc_barangays (code, name, city_municipality_code) VALUES ${values.join(', ')}`;
    
    await client.query(query, params);
    
    processed += batch.length;
    console.log(`   📊 Progress: ${processed}/${data.length} barangays`);
  }
  
  console.log('✅ Barangays imported');
}

/**
 * Validate data integrity
 */
async function validateData(client) {
  console.log('🔍 Validating data integrity...');
  
  // Record counts
  const counts = await client.query(`
    SELECT 'Regions' as entity, COUNT(*) as count FROM psgc_regions
    UNION ALL
    SELECT 'Provinces', COUNT(*) FROM psgc_provinces
    UNION ALL  
    SELECT 'Cities/Municipalities', COUNT(*) FROM psgc_cities_municipalities
    UNION ALL
    SELECT 'Barangays', COUNT(*) FROM psgc_barangays
  `);
  
  console.log('\n📊 Record Counts:');
  counts.rows.forEach(row => {
    console.log(`   ${row.entity}: ${row.count}`);
  });
  
  // Integrity checks
  const checks = await client.query(`
    SELECT 'Provinces without regions' as check_name, COUNT(*) as error_count
    FROM psgc_provinces p 
    LEFT JOIN psgc_regions r ON p.region_code = r.code 
    WHERE r.code IS NULL
    
    UNION ALL
    
    SELECT 'Cities without provinces', COUNT(*)
    FROM psgc_cities_municipalities c
    LEFT JOIN psgc_provinces p ON c.province_code = p.code
    WHERE c.province_code IS NOT NULL AND p.code IS NULL
    
    UNION ALL  
    
    SELECT 'Barangays without cities', COUNT(*)
    FROM psgc_barangays b
    LEFT JOIN psgc_cities_municipalities c ON b.city_municipality_code = c.code
    WHERE c.code IS NULL
  `);
  
  console.log('\n🔍 Integrity Checks:');
  let hasErrors = false;
  checks.rows.forEach(row => {
    const status = parseInt(row.error_count) === 0 ? '✅' : '❌';
    console.log(`   ${status} ${row.check_name}: ${row.error_count} errors`);
    if (parseInt(row.error_count) > 0) hasErrors = true;
  });
  
  return !hasErrors;
}

/**
 * Update table statistics
 */
async function updateStatistics(client) {
  console.log('📈 Updating table statistics...');
  
  await client.query('ANALYZE psgc_regions');
  await client.query('ANALYZE psgc_provinces');  
  await client.query('ANALYZE psgc_cities_municipalities');
  await client.query('ANALYZE psgc_barangays');
  
  console.log('✅ Statistics updated');
}

/**
 * Main import function
 */
async function main() {
  const client = await pool.connect();
  
  try {
    console.log('🚀 Starting PSGC data import...');
    console.log('=================================');
    
    // Begin transaction
    await client.query('BEGIN');
    await client.query('SET session_replication_role = replica');
    
    // Clear existing data
    await clearExistingData(client);
    
    // Import data in correct order (respecting foreign keys)
    const regionsData = await parseCSV(files.regions);
    await importRegions(client, regionsData);
    
    const provincesData = await parseCSV(files.provinces);
    await importProvinces(client, provincesData);
    
    const citiesData = await parseCSV(files.cities);
    await importCities(client, citiesData);
    
    const barangaysData = await parseCSV(files.barangays);
    await importBarangays(client, barangaysData);
    
    // Re-enable constraints
    await client.query('SET session_replication_role = DEFAULT');
    
    // Validate data
    const isValid = await validateData(client);
    
    if (!isValid) {
      throw new Error('Data integrity validation failed');
    }
    
    // Update statistics
    await updateStatistics(client);
    
    // Commit transaction
    await client.query('COMMIT');
    
    console.log('\n=================================');
    console.log('✅ PSGC data import completed successfully!');
    console.log('Next step: Import PSOC occupational data');
    console.log('=================================');
    
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('\n❌ Import failed:', error.message);
    process.exit(1);
    
  } finally {
    client.release();
    await pool.end();
  }
}

// Run the import
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main };