#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://cdtcbelaimyftpxmzkjf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkdGNiZWxhaW15ZnRweG16a2pmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDg4ODU5MiwiZXhwIjoyMDcwNDY0NTkyfQ.pTuiHF7JKxhO0bcZoo8lmSveBhzKc9cqSCTb5oBcJrk';
const supabase = createClient(supabaseUrl, supabaseKey);

async function cleanup() {
  console.log('🔍 Checking old Maguindanao province (1538)...');
  
  // Check if any cities reference this province
  const { data: cities } = await supabase
    .from('psgc_cities_municipalities')
    .select('code, name')
    .eq('province_code', '1538');
  
  console.log(`Found ${cities?.length || 0} cities referencing province 1538`);
  
  if (cities && cities.length > 0) {
    console.log('🗑️  Deleting barangays and cities first...');
    const cityCodestoDelete = cities.map(c => c.code);
    
    // Delete barangays
    await supabase.from('psgc_barangays').delete().in('city_municipality_code', cityCodestoDelete);
    
    // Delete cities
    await supabase.from('psgc_cities_municipalities').delete().in('code', cityCodestoDelete);
    
    console.log('✅ Cleaned up dependencies');
  }
  
  // Delete the province
  const { error } = await supabase.from('psgc_provinces').delete().eq('code', '1538');
  
  if (!error) {
    console.log('✅ Deleted old Maguindanao province (1538)');
  } else {
    console.log('❌ Error:', error.message);
  }
  
  // Final verification
  const { count: regions } = await supabase.from('psgc_regions').select('*', { count: 'exact', head: true });
  const { count: provinces } = await supabase.from('psgc_provinces').select('*', { count: 'exact', head: true });
  const { count: cityCount } = await supabase.from('psgc_cities_municipalities').select('*', { count: 'exact', head: true });
  const { count: barangays } = await supabase.from('psgc_barangays').select('*', { count: 'exact', head: true });
  
  console.log('\n🏆 FINAL DATABASE STATUS:');
  console.log('========================');
  console.log(`Regions: ${regions}`);
  console.log(`Provinces: ${provinces}`);
  console.log(`Cities: ${cityCount}`);
  console.log(`Barangays: ${barangays}`);
  
  if (regions === 18 && provinces === 82) {
    console.log('\n🎊 PERFECT! Official PSGC database achieved! 🎊');
    console.log('✅ 18 official regions');
    console.log('✅ 82 official provinces with corrected Maguindanao data');
    console.log('✅ Database ready for production use');
  }
}

cleanup().catch(console.error);