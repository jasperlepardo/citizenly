#!/usr/bin/env node

/**
 * PSGC Hierarchy Integrity Check
 * Uses Supabase client to avoid SQL execution issues
 */

require('dotenv').config();

const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function checkTableCounts() {
  console.log('🔍 PSGC HIERARCHY INTEGRITY AUDIT');
  console.log('=================================\n');
  
  console.log('📊 TABLE COUNTS VERIFICATION');
  console.log('----------------------------');
  
  const tables = [
    'psgc_regions',
    'psgc_provinces', 
    'psgc_cities_municipalities',
    'psgc_barangays'
  ];
  
  const counts = {};
  
  for (const table of tables) {
    try {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        console.log(`❌ ${table}: ERROR - ${error.message}`);
        counts[table] = 0;
      } else {
        console.log(`✅ ${table}: ${count.toLocaleString()} records`);
        counts[table] = count;
      }
    } catch (e) {
      console.log(`❌ ${table}: EXCEPTION - ${e.message}`);
      counts[table] = 0;
    }
  }
  
  return counts;
}

async function checkProvinceIntegrity() {
  console.log('\n📊 PROVINCE INTEGRITY CHECK');
  console.log('---------------------------');
  
  try {
    // Get all provinces
    const { data: provinces } = await supabase
      .from('psgc_provinces')
      .select('code, name, region_code');
    
    // Get all regions
    const { data: regions } = await supabase
      .from('psgc_regions')
      .select('code, name');
    
    const regionCodes = new Set(regions.map(r => r.code));
    
    const orphanedProvinces = provinces.filter(p => !regionCodes.has(p.region_code));
    
    console.log(`Total provinces: ${provinces.length}`);
    console.log(`Valid region links: ${provinces.length - orphanedProvinces.length}`);
    console.log(`Orphaned provinces: ${orphanedProvinces.length}`);
    
    if (orphanedProvinces.length > 0) {
      console.log('\n❌ Orphaned provinces (first 5):');
      orphanedProvinces.slice(0, 5).forEach(p => {
        console.log(`   ${p.code} - ${p.name} (invalid region: ${p.region_code})`);
      });
    }
    
    return orphanedProvinces.length;
    
  } catch (error) {
    console.log(`❌ Province integrity check failed: ${error.message}`);
    return -1;
  }
}

async function checkCityIntegrity() {
  console.log('\n📊 CITY INTEGRITY CHECK');
  console.log('-----------------------');
  
  try {
    // Get sample of cities (first 1000 to avoid memory issues)
    const { data: cities } = await supabase
      .from('psgc_cities_municipalities')
      .select('code, name, province_code, is_independent, type')
      .order('code')
      .limit(1000);
    
    // Get all provinces
    const { data: provinces } = await supabase
      .from('psgc_provinces')
      .select('code, name');
    
    const provinceCodes = new Set(provinces.map(p => p.code));
    
    // Check different types of issues
    const orphanedCities = cities.filter(c => 
      c.province_code !== null && 
      !provinceCodes.has(c.province_code) && 
      !c.is_independent
    );
    
    const independentWithProvince = cities.filter(c => 
      c.is_independent === true && 
      c.province_code !== null
    );
    
    const independentWithInvalidProvince = cities.filter(c =>
      c.is_independent === true &&
      c.province_code !== null &&
      !provinceCodes.has(c.province_code)
    );
    
    console.log(`Cities analyzed (sample): ${cities.length}`);
    console.log(`Orphaned non-independent cities: ${orphanedCities.length}`);
    console.log(`Independent cities with province codes: ${independentWithProvince.length}`);
    console.log(`Independent cities with invalid province codes: ${independentWithInvalidProvince.length}`);
    
    if (orphanedCities.length > 0) {
      console.log('\n❌ Orphaned cities (first 3):');
      orphanedCities.slice(0, 3).forEach(c => {
        console.log(`   ${c.code} - ${c.name} (invalid province: ${c.province_code})`);
      });
    }
    
    if (independentWithProvince.length > 0) {
      console.log('\n⚠️  Independent cities with province codes (should be NULL):');
      independentWithProvince.slice(0, 5).forEach(c => {
        console.log(`   ${c.code} - ${c.name} (province: ${c.province_code}) - ${c.type}`);
      });
    }
    
    return {
      orphaned: orphanedCities.length,
      independentWithProvince: independentWithProvince.length,
      independentWithInvalid: independentWithInvalidProvince.length
    };
    
  } catch (error) {
    console.log(`❌ City integrity check failed: ${error.message}`);
    return { orphaned: -1, independentWithProvince: -1, independentWithInvalid: -1 };
  }
}

async function checkBarangayIntegrity() {
  console.log('\n📊 BARANGAY INTEGRITY CHECK');
  console.log('--------------------------');
  
  try {
    // Get sample of barangays (first 1000 to avoid memory issues)
    const { data: barangays } = await supabase
      .from('psgc_barangays')
      .select('code, name, city_municipality_code')
      .order('code')
      .limit(1000);
    
    // Get all cities
    const { data: cities } = await supabase
      .from('psgc_cities_municipalities')
      .select('code, name');
    
    const cityCodes = new Set(cities.map(c => c.code));
    
    const orphanedBarangays = barangays.filter(b => !cityCodes.has(b.city_municipality_code));
    
    console.log(`Barangays analyzed (sample): ${barangays.length}`);
    console.log(`Valid city links: ${barangays.length - orphanedBarangays.length}`);
    console.log(`Orphaned barangays: ${orphanedBarangays.length}`);
    
    if (orphanedBarangays.length > 0) {
      console.log('\n❌ Orphaned barangays (first 5):');
      orphanedBarangays.slice(0, 5).forEach(b => {
        console.log(`   ${b.code} - ${b.name} (invalid city: ${b.city_municipality_code})`);
      });
    }
    
    return orphanedBarangays.length;
    
  } catch (error) {
    console.log(`❌ Barangay integrity check failed: ${error.message}`);
    return -1;
  }
}

async function generateSummary(counts, provinceIssues, cityIssues, barangayIssues) {
  console.log('\n📋 INTEGRITY SUMMARY');
  console.log('===================');
  
  const totalRecords = Object.values(counts).reduce((sum, count) => sum + count, 0);
  
  console.log(`\n📊 Database Size:`);
  console.log(`   Total PSGC records: ${totalRecords.toLocaleString()}`);
  console.log(`   Regions: ${counts.psgc_regions || 0}`);
  console.log(`   Provinces: ${counts.psgc_provinces || 0}`);
  console.log(`   Cities/Municipalities: ${counts.psgc_cities_municipalities || 0}`);
  console.log(`   Barangays: ${counts.psgc_barangays || 0}`);
  
  console.log(`\n🔍 Integrity Issues Found:`);
  console.log(`   Orphaned provinces: ${provinceIssues >= 0 ? provinceIssues : 'Check failed'}`);
  console.log(`   Orphaned cities: ${cityIssues.orphaned >= 0 ? cityIssues.orphaned : 'Check failed'}`);
  console.log(`   Independent cities with provinces: ${cityIssues.independentWithProvince >= 0 ? cityIssues.independentWithProvince : 'Check failed'}`);
  console.log(`   Orphaned barangays (sample): ${barangayIssues >= 0 ? barangayIssues : 'Check failed'}`);
  
  const totalIssues = (provinceIssues >= 0 ? provinceIssues : 0) + 
                     (cityIssues.orphaned >= 0 ? cityIssues.orphaned : 0) + 
                     (cityIssues.independentWithProvince >= 0 ? cityIssues.independentWithProvince : 0) + 
                     (barangayIssues >= 0 ? barangayIssues : 0);
  
  console.log(`\n🎯 Overall Status:`);
  if (totalIssues === 0) {
    console.log('   ✅ EXCELLENT: No integrity issues found!');
  } else if (totalIssues < 10) {
    console.log('   ✅ GOOD: Minor integrity issues found, easily fixable');
  } else if (totalIssues < 100) {
    console.log('   ⚠️  MODERATE: Some integrity issues found, recommend fixing');
  } else {
    console.log('   ❌ NEEDS ATTENTION: Multiple integrity issues found');
  }
  
  console.log(`\n🔧 Recommended Actions:`);
  
  if (cityIssues.independentWithProvince > 0) {
    console.log('   1. Run quick fix to nullify province codes for independent cities');
  }
  
  if (provinceIssues > 0) {
    console.log('   2. Review orphaned provinces and fix region codes');
  }
  
  if (cityIssues.orphaned > 0) {
    console.log('   3. Review orphaned cities and fix province codes');
  }
  
  if (barangayIssues > 0) {
    console.log('   4. Review orphaned barangays and fix city codes');
  }
  
  console.log('\n✅ INTEGRITY AUDIT COMPLETED');
}

async function main() {
  try {
    const counts = await checkTableCounts();
    const provinceIssues = await checkProvinceIntegrity();
    const cityIssues = await checkCityIntegrity();
    const barangayIssues = await checkBarangayIntegrity();
    
    await generateSummary(counts, provinceIssues, cityIssues, barangayIssues);
    
  } catch (error) {
    console.log('❌ Audit failed:', error.message);
  }
}

// Run the audit
if (require.main === module) {
  main();
}

module.exports = { main };