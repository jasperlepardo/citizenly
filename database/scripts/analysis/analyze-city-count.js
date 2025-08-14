#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '../../.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function analyzeCount() {
  console.log('🔍 DETAILED CITY COUNT ANALYSIS');
  console.log('================================\n');
  
  const { count: totalCount } = await supabase
    .from('psgc_cities_municipalities')
    .select('*', { count: 'exact' });
  
  // Count Metro Manila cities
  const { count: metroCount } = await supabase
    .from('psgc_cities_municipalities')
    .select('*', { count: 'exact' })
    .like('code', '1339%');
    
  // Count non-Metro Manila cities
  const { count: nonMetroCount } = await supabase
    .from('psgc_cities_municipalities')
    .select('*', { count: 'exact' })
    .not('code', 'like', '1339%');
  
  console.log('📊 ACTUAL BREAKDOWN:');
  console.log('====================');
  console.log(`Total cities in database: ${totalCount}`);
  console.log(`Metro Manila cities (1339xx): ${metroCount}`);
  console.log(`Non-Metro Manila cities: ${nonMetroCount}`);
  console.log(`Verification: ${metroCount} + ${nonMetroCount} = ${metroCount + nonMetroCount}`);
  
  console.log('\n🤔 EXPECTED BREAKDOWN:');
  console.log('======================');
  console.log('Original CSV had: 1,642 cities');
  console.log('  - Including City of Manila (133900): 1 city');
  console.log('  - Other cities: 1,641 cities');
  console.log('We added 14 sub-municipalities (133901-133914)');
  console.log('Expected total: 1,642 + 14 = 1,656');
  console.log(`Actual total: ${totalCount}`);
  console.log(`Difference: +${totalCount - 1656}`);
  
  if (totalCount > 1656) {
    console.log('\n🔍 FINDING EXTRA CITIES:');
    console.log('========================');
    
    // Get the highest city codes to see what was added
    const { data: recentCities } = await supabase
      .from('psgc_cities_municipalities')
      .select('code, name, type')
      .order('code', { ascending: false })
      .limit(20);
      
    console.log('Most recent/highest city codes:');
    recentCities?.forEach((city, index) => {
      console.log(`${index + 1}. ${city.code} - ${city.name} (${city.type})`);
    });
    
    // Check for potential duplicates
    const { data: allCodes } = await supabase
      .from('psgc_cities_municipalities')
      .select('code');
      
    const codeCount = {};
    allCodes?.forEach(city => {
      codeCount[city.code] = (codeCount[city.code] || 0) + 1;
    });
    
    const duplicates = Object.entries(codeCount).filter(([code, count]) => count > 1);
    if (duplicates.length > 0) {
      console.log('\n❌ DUPLICATES FOUND:');
      duplicates.forEach(([code, count]) => {
        console.log(`  ${code}: ${count} entries`);
      });
    } else {
      console.log('\n✅ No duplicates found');
    }
  }
}

analyzeCount().catch(console.error);