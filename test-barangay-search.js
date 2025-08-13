const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://cdtcbelaimyftpxmzkjf.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkdGNiZWxhaW15ZnRweG16a2pmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ4ODg1OTIsImV4cCI6MjA3MDQ2NDU5Mn0.VGhrjkrEECW9m8U_aeQOZd9jT6hLFOF8ML3tWJNuOOE'
);

async function testBarangaySearch() {
  console.log('Testing barangay search...\n');

  const searches = [
    'anuling cerca',
    'anuling',
    'cerca',
    'adams', // We know this one exists
    'bani', // We know this one exists
  ];

  for (const searchTerm of searches) {
    console.log(`🔍 Searching for: "${searchTerm}"`);

    try {
      const { data, error } = await supabase
        .from('psgc_barangays')
        .select('code, name')
        .ilike('name', `%${searchTerm}%`)
        .limit(10)
        .order('name');

      if (error) {
        console.error('Error:', error.message);
        continue;
      }

      if (data && data.length > 0) {
        console.log(`✅ Found ${data.length} results:`);
        data.forEach(b => {
          console.log(`   ${b.code} - ${b.name}`);
        });
      } else {
        console.log('❌ No results found');
      }
    } catch (err) {
      console.error('Search error:', err.message);
    }

    console.log('');
  }

  // Also try fuzzy search for "anuling cerca"
  console.log('🔍 Trying fuzzy search for barangays containing "anuling" OR "cerca"...');

  try {
    const { data, error } = await supabase
      .from('psgc_barangays')
      .select('code, name')
      .or('name.ilike.%anuling%,name.ilike.%cerca%')
      .limit(10)
      .order('name');

    if (error) {
      console.error('Fuzzy search error:', error.message);
    } else if (data && data.length > 0) {
      console.log(`✅ Fuzzy search found ${data.length} results:`);
      data.forEach(b => {
        console.log(`   ${b.code} - ${b.name}`);
      });
    } else {
      console.log('❌ No fuzzy results found');
    }
  } catch (err) {
    console.error('Fuzzy search error:', err.message);
  }

  // Show some sample barangays for reference
  console.log('\n📋 Sample barangays in database:');

  try {
    const { data, error } = await supabase
      .from('psgc_barangays')
      .select('code, name')
      .limit(20)
      .order('name');

    if (data) {
      data.forEach((b, i) => {
        console.log(`${i + 1}. ${b.code} - ${b.name}`);
      });
    }
  } catch (err) {
    console.error('Sample error:', err.message);
  }
}

testBarangaySearch();
