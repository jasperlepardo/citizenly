#!/usr/bin/env node

/**
 * REVERT NEGROS PROVINCES TO CORRECT REGIONS
 * ==========================================
 * 
 * The Negros Island Region (NIR) was dissolved in 2017.
 * Negros Occidental should be in Region VI (Western Visayas)
 * Negros Oriental should be in Region VII (Central Visayas)
 * Siquijor should be in Region VII (Central Visayas)
 */

const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://cdtcbelaimyftpxmzkjf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkdGNiZWxhaW15ZnRweG16a2pmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDg4ODU5MiwiZXhwIjoyMDcwNDY0NTkyfQ.pTuiHF7JKxhO0bcZoo8lmSveBhzKc9cqSCTb5oBcJrk';

const supabase = createClient(supabaseUrl, supabaseKey);

console.log('🚀 REVERT NEGROS PROVINCES TO CORRECT REGIONS');
console.log('=============================================');

async function revertNegrosProvinces() {
  try {
    console.log('\n📋 Correcting Negros provinces region assignments...');
    
    const corrections = [
      { code: '0645', name: 'Negros Occidental', correctRegion: '06' }, // Western Visayas
      { code: '0746', name: 'Negros Oriental', correctRegion: '07' },   // Central Visayas  
      { code: '0761', name: 'Siquijor', correctRegion: '07' }           // Central Visayas
    ];
    
    for (const correction of corrections) {
      const { error } = await supabase
        .from('psgc_provinces')
        .update({ region_code: correction.correctRegion })
        .eq('code', correction.code);
      
      if (!error) {
        console.log(`✅ Corrected ${correction.code} (${correction.name}) → Region ${correction.correctRegion}`);
      } else {
        console.log(`❌ Error correcting ${correction.code}:`, error.message);
      }
    }
    
    console.log('\n📊 Verification - Current region assignments:');
    const { data: provinces } = await supabase
      .from('psgc_provinces')
      .select('code, name, region_code')
      .in('code', ['0645', '0746', '0761']);
    
    provinces.forEach(p => {
      const regionName = p.region_code === '06' ? 'Western Visayas' : 
                        p.region_code === '07' ? 'Central Visayas' : 'Other';
      console.log(`   ${p.code} - ${p.name}: Region ${p.region_code} (${regionName})`);
    });
    
    console.log('\n✅ Negros provinces correction complete!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

// Execute
revertNegrosProvinces().catch(console.error);