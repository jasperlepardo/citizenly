#!/usr/bin/env node

/**
 * Performance Verification Script - Post Optimization
 * 
 * Tests query performance after applying database optimizations
 * Compares before/after metrics
 */

const { createClient } = require('@supabase/supabase-js');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '../../.env.local') });

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testPerformanceImprovement() {
  console.log('📈 PERFORMANCE VERIFICATION - POST OPTIMIZATION');
  console.log('===============================================\n');
  
  try {
    // Test 1: Barangay search performance (the most critical improvement)
    console.log('🎯 Test 1: Barangay Search Performance');
    console.log('--------------------------------------');
    
    const searchTerms = ['san', 'santa', 'bago', 'new', 'old'];
    const results = [];
    
    for (const term of searchTerms) {
      const start = Date.now();
      
      const { data, error } = await supabase
        .from('psgc_barangays')
        .select(`
          code, 
          name,
          psgc_cities_municipalities (
            name,
            psgc_provinces (
              name,
              psgc_regions (
                name
              )
            )
          )
        `)
        .ilike('name', `%${term}%`)
        .limit(50);
        
      const duration = Date.now() - start;
      
      if (error) {
        console.log(`  ❌ Search "${term}": Error - ${error.message}`);
      } else {
        console.log(`  ✅ Search "${term}": ${duration}ms (${data?.length || 0} results)`);
        results.push({ term, duration, count: data?.length || 0 });
      }
    }
    
    const avgDuration = results.reduce((sum, r) => sum + r.duration, 0) / results.length;
    console.log(`  📊 Average search time: ${avgDuration.toFixed(1)}ms`);
    console.log(`  🎯 Target: <100ms (Expected improvement: 60-80%)`);
    
    // Test 2: City search performance
    console.log('\n🏙️ Test 2: City Search Performance');
    console.log('----------------------------------');
    
    const cityTerms = ['city', 'manila', 'cebu'];
    const cityResults = [];
    
    for (const term of cityTerms) {
      const start = Date.now();
      
      const { data, error } = await supabase
        .from('psgc_cities_municipalities')
        .select(`
          code,
          name,
          type,
          psgc_provinces (
            name,
            psgc_regions (
              name
            )
          )
        `)
        .ilike('name', `%${term}%`)
        .limit(50);
        
      const duration = Date.now() - start;
      
      if (error) {
        console.log(`  ❌ Search "${term}": Error - ${error.message}`);
      } else {
        console.log(`  ✅ Search "${term}": ${duration}ms (${data?.length || 0} results)`);
        cityResults.push({ term, duration, count: data?.length || 0 });
      }
    }
    
    const avgCityDuration = cityResults.reduce((sum, r) => sum + r.duration, 0) / cityResults.length;
    console.log(`  📊 Average city search time: ${avgCityDuration.toFixed(1)}ms`);
    
    // Test 3: Check if materialized view exists and is populated
    console.log('\n🏗️ Test 3: Materialized View Status');
    console.log('-----------------------------------');
    
    const { data: mvData, error: mvError } = await supabase
      .from('mv_psgc_geographic_search')
      .select('*')
      .limit(5);
      
    if (mvError) {
      console.log(`  ⚠️ Materialized view not accessible: ${mvError.message}`);
      console.log(`  💡 This is expected if view creation failed - run SQL manually in Supabase Dashboard`);
    } else {
      console.log(`  ✅ Materialized view exists with ${mvData?.length || 0} sample records`);
      
      // Test optimized search if view exists
      if (mvData && mvData.length > 0) {
        const start = Date.now();
        const { data: optimizedResults, error: optError } = await supabase
          .from('mv_psgc_geographic_search')
          .select('*')
          .ilike('barangay_name', '%san%')
          .limit(50);
          
        const duration = Date.now() - start;
        
        if (!optError) {
          console.log(`  ⚡ Optimized search: ${duration}ms (${optimizedResults?.length || 0} results)`);
          console.log(`  🎯 Expected: <50ms for materialized view queries`);
        }
      }
    }
    
    // Test 4: Check index creation status
    console.log('\n📋 Test 4: Index Status Check');
    console.log('------------------------------');
    
    const { data: indexes, error: indexError } = await supabase
      .rpc('sql', { 
        query: `
          SELECT 
            tablename, 
            indexname,
            CASE WHEN indexname LIKE '%trgm%' THEN 'Trigram' ELSE 'Standard' END as type
          FROM pg_indexes 
          WHERE schemaname = 'public' 
            AND tablename LIKE 'psgc_%'
            AND indexname LIKE 'idx_%'
          ORDER BY tablename, indexname;
        `
      });
      
    if (indexError) {
      console.log(`  ⚠️ Cannot check index status: ${indexError.message}`);
      console.log(`  💡 This is expected - Supabase restricts some system queries`);
    } else if (indexes) {
      console.log(`  ✅ Found ${indexes.length} performance indexes:`);
      indexes.forEach(idx => {
        console.log(`    • ${idx.tablename}: ${idx.indexname} (${idx.type})`);
      });
    }
    
    // Test 5: Overall assessment
    console.log('\n🎯 OPTIMIZATION ASSESSMENT');
    console.log('==========================');
    
    // Performance thresholds
    const isBarangaySearchOptimal = avgDuration < 100;
    const isCitySearchOptimal = avgCityDuration < 100;
    const hasMaterializedView = mvData && mvData.length > 0;
    
    console.log(`✅ Barangay search performance: ${isBarangaySearchOptimal ? 'OPTIMAL' : 'NEEDS IMPROVEMENT'}`);
    console.log(`✅ City search performance: ${isCitySearchOptimal ? 'OPTIMAL' : 'NEEDS IMPROVEMENT'}`);
    console.log(`${hasMaterializedView ? '✅' : '⚠️'} Materialized view: ${hasMaterializedView ? 'ACTIVE' : 'NEEDS MANUAL SETUP'}`);
    
    if (isBarangaySearchOptimal && isCitySearchOptimal) {
      console.log('\n🎉 PERFORMANCE OPTIMIZATION SUCCESSFUL!');
      console.log('=====================================');
      console.log('• Database queries are running optimally');
      console.log('• Geographic search performance improved significantly');
      console.log('• Users will experience faster page loads');
      
      // Expected vs actual improvement
      const baselineAvg = 291; // From our initial test
      const improvement = ((baselineAvg - avgDuration) / baselineAvg) * 100;
      console.log(`• Performance improvement: ${improvement.toFixed(1)}% faster`);
      
    } else {
      console.log('\n🔧 OPTIMIZATION NEEDS ATTENTION');
      console.log('===============================');
      console.log('Some optimizations may not have been fully applied:');
      
      if (!isBarangaySearchOptimal) {
        console.log('• Barangay search still slow - check trigram indexes');
      }
      if (!isCitySearchOptimal) {
        console.log('• City search still slow - check foreign key indexes');
      }
      if (!hasMaterializedView) {
        console.log('• Materialized view needs manual creation in Supabase Dashboard');
      }
      
      console.log('\n💡 NEXT STEPS:');
      console.log('• Copy SQL from performance-optimization-queries.sql');
      console.log('• Run each section manually in Supabase SQL Editor');
      console.log('• Wait 5-10 minutes for indexes to build');
      console.log('• Re-run this test script');
    }
    
    console.log('\n📊 SUMMARY METRICS:');
    console.log(`• Average barangay search: ${avgDuration.toFixed(1)}ms`);
    console.log(`• Average city search: ${avgCityDuration.toFixed(1)}ms`);
    console.log(`• Total test queries: ${results.length + cityResults.length}`);
    console.log(`• Materialized view status: ${hasMaterializedView ? 'Active' : 'Inactive'}`);
    
  } catch (error) {
    console.error('❌ Performance test failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  testPerformanceImprovement();
}

module.exports = { testPerformanceImprovement };