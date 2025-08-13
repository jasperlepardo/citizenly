require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function testAutomaticSignupFlow() {
  console.log('🧪 Testing automatic signup flow...\n');

  try {
    // Step 1: Check recent users and profiles before signup
    console.log('1️⃣ Checking current state...');

    const { data: users } = await supabase.auth.admin.listUsers({ page: 1, perPage: 3 });
    const { data: profiles } = await supabase
      .from('auth_user_profiles')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(3);

    console.log('📊 Current state:');
    console.log('- Users:', users.users.length);
    console.log('- Profiles:', profiles ? profiles.length : 0);

    if (users.users.length > 0) {
      console.log('\n👥 Recent users:');
      users.users.forEach((user, i) => {
        console.log(
          `   ${i + 1}. ${user.email} - Confirmed: ${user.email_confirmed_at ? 'YES' : 'NO'}`
        );
      });
    }

    if (profiles && profiles.length > 0) {
      console.log('\n👤 Recent profiles:');
      profiles.forEach((profile, i) => {
        console.log(`   ${i + 1}. ${profile.email}:`);
        console.log(`      - barangay_code: ${profile.barangay_code || 'NULL'}`);
        console.log(`      - city_municipality_code: ${profile.city_municipality_code || 'NULL'}`);
        console.log(`      - province_code: ${profile.province_code || 'NULL'}`);
        console.log(`      - region_code: ${profile.region_code || 'NULL'}`);
      });
    }

    // Step 2: Provide instructions for testing
    console.log('\n' + '='.repeat(60));
    console.log('🚀 READY FOR TESTING!');
    console.log('='.repeat(60));

    console.log('\n📝 Test Steps:');
    console.log('1. Delete your current account (if needed)');
    console.log('2. Go to /signup in your browser');
    console.log('3. Fill out the signup form with:');
    console.log('   - Same email: jsprlprd@gmail.com');
    console.log('   - Same details: Jasper John Lepardo');
    console.log('   - Same barangay: Anuling Cerca I');
    console.log('4. Submit the form');
    console.log('5. Run this script again to check results');

    console.log('\n✅ Expected automatic behavior:');
    console.log('- User created with email confirmation ✅');
    console.log('- Profile created automatically ✅');
    console.log('- Geographic codes auto-populated:');
    console.log('  • barangay_code: 042114014');
    console.log('  • city_municipality_code: 042114');
    console.log('  • province_code: 0421');
    console.log('  • region_code: 04');

    console.log('\n❌ If auto-population fails:');
    console.log('- Check server logs for trigger errors');
    console.log('- Verify the trigger function was applied');
    console.log('- Run: node create-new-profile.js as fallback');

    // Step 3: Watch for changes
    let watchCount = 0;
    const maxWatches = 10;

    console.log('\n⏰ Watching for new signups (will check every 3 seconds for 30 seconds)...');

    const watchInterval = setInterval(async () => {
      watchCount++;

      const { data: newUsers } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1 });
      const { data: newProfiles } = await supabase
        .from('auth_user_profiles')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(1);

      if (
        newUsers.users.length !== users.users.length ||
        (newProfiles?.length || 0) !== (profiles?.length || 0)
      ) {
        console.log(`\n🔍 CHANGE DETECTED (check ${watchCount}):`);

        if (newUsers.users.length > users.users.length) {
          const latestUser = newUsers.users[0];
          console.log('✅ New user created:');
          console.log(`   Email: ${latestUser.email}`);
          console.log(`   Confirmed: ${latestUser.email_confirmed_at ? 'YES' : 'NO'}`);
          console.log(`   Metadata:`, JSON.stringify(latestUser.user_metadata, null, 2));
        }

        if (newProfiles && newProfiles.length > (profiles?.length || 0)) {
          const latestProfile = newProfiles[0];
          console.log('✅ New profile created:');
          console.log(`   Email: ${latestProfile.email}`);
          console.log(`   Name: ${latestProfile.first_name} ${latestProfile.last_name}`);
          console.log(`   barangay_code: ${latestProfile.barangay_code}`);
          console.log(
            `   city_municipality_code: ${latestProfile.city_municipality_code || 'MISSING!'}`
          );
          console.log(`   province_code: ${latestProfile.province_code || 'MISSING!'}`);
          console.log(`   region_code: ${latestProfile.region_code || 'MISSING!'}`);

          if (
            latestProfile.city_municipality_code &&
            latestProfile.province_code &&
            latestProfile.region_code
          ) {
            console.log('\n🎉 AUTO-POPULATION SUCCESS! All geographic codes populated correctly.');
          } else {
            console.log('\n❌ AUTO-POPULATION FAILED! Some geographic codes are missing.');
          }
        }

        clearInterval(watchInterval);
        return;
      }

      process.stdout.write(`.`);

      if (watchCount >= maxWatches) {
        console.log('\n\n⏰ Watch timeout. No new signups detected.');
        console.log('Try creating an account and run this script again.');
        clearInterval(watchInterval);
      }
    }, 3000);
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testAutomaticSignupFlow();
