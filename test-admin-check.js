const { createClient } = require('@supabase/supabase-js');

const supabaseAdmin = createClient(
  'https://cdtcbelaimyftpxmzkjf.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkdGNiZWxhaW15ZnRweG16a2pmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDg4ODU5MiwiZXhwIjoyMDcwNDY0NTkyfQ.pTuiHF7JKxhO0bcZoo8lmSveBhzKc9cqSCTb5oBcJrk',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

async function testAdminCheck() {
  console.log('🔍 Testing barangay admin check system...\n');

  try {
    // Step 1: Check roles table
    console.log('1️⃣ Checking auth_roles table...');
    const { data: roles, error: rolesError } = await supabaseAdmin
      .from('auth_roles')
      .select('*')
      .order('name');

    if (rolesError) {
      console.error('❌ Roles error:', rolesError.message);
      return;
    }

    console.log('   Available roles:');
    roles.forEach(role => {
      console.log(`   - ${role.name} (${role.id})`);
    });

    const barangayAdminRole = roles.find(r => r.name === 'barangay_admin');
    if (!barangayAdminRole) {
      console.error('❌ No barangay_admin role found!');
      return;
    }

    // Step 2: Check user profiles
    console.log('\n2️⃣ Checking auth_user_profiles table...');
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from('auth_user_profiles')
      .select('id, email, first_name, last_name, barangay_code, role_id, is_active')
      .order('created_at', { ascending: false })
      .limit(10);

    if (profilesError) {
      console.error('❌ Profiles error:', profilesError.message);
      return;
    }

    console.log(`   Found ${profiles.length} user profiles:`);
    profiles.forEach(profile => {
      const roleName = roles.find(r => r.id === profile.role_id)?.name || 'unknown';
      console.log(`   - ${profile.first_name} ${profile.last_name} (${profile.email})`);
      console.log(
        `     Barangay: ${profile.barangay_code}, Role: ${roleName}, Active: ${profile.is_active}`
      );
    });

    // Step 3: Find barangay admins
    console.log('\n3️⃣ Checking barangay administrators...');
    const { data: admins, error: adminsError } = await supabaseAdmin
      .from('auth_user_profiles')
      .select('id, email, first_name, last_name, barangay_code')
      .eq('role_id', barangayAdminRole.id)
      .eq('is_active', true);

    if (adminsError) {
      console.error('❌ Admin search error:', adminsError.message);
      return;
    }

    console.log(`   Found ${admins.length} barangay administrators:`);
    if (admins.length > 0) {
      admins.forEach(admin => {
        console.log(`   - ${admin.first_name} ${admin.last_name} (${admin.email})`);
        console.log(`     Barangay: ${admin.barangay_code}`);
      });

      // Step 4: Test the API endpoint with one of the barangays
      console.log('\n4️⃣ Testing API endpoint...');
      const testBarangayCode = admins[0].barangay_code;
      console.log(`   Testing with barangay code: ${testBarangayCode}`);

      try {
        const response = await fetch('http://localhost:3000/api/auth/check-barangay-admin', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ barangayCode: testBarangayCode }),
        });

        const result = await response.json();
        console.log(`   API response:`, result);

        if (result.hasAdmin) {
          console.log('   ✅ API correctly detected existing admin');
        } else {
          console.log('   ❌ API failed to detect existing admin');
        }
      } catch (error) {
        console.error('   ❌ API test failed:', error.message);
      }
    } else {
      console.log('   ℹ️  No barangay administrators found');

      // Test with a random barangay code
      console.log('\n4️⃣ Testing API endpoint with non-admin barangay...');
      const { data: randomBarangay, error: barangayError } = await supabaseAdmin
        .from('psgc_barangays')
        .select('code, name')
        .limit(1)
        .single();

      if (barangayError) {
        console.error('   Failed to get test barangay:', barangayError.message);
      } else {
        console.log(`   Testing with barangay: ${randomBarangay.name} (${randomBarangay.code})`);

        try {
          const response = await fetch('http://localhost:3000/api/auth/check-barangay-admin', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ barangayCode: randomBarangay.code }),
          });

          const result = await response.json();
          console.log(`   API response:`, result);

          if (!result.hasAdmin) {
            console.log('   ✅ API correctly shows no admin for this barangay');
          } else {
            console.log('   ❌ API incorrectly shows admin exists');
          }
        } catch (error) {
          console.error('   ❌ API test failed:', error.message);
        }
      }
    }

    console.log('\n📋 Summary:');
    console.log(`   - Roles table: ✅ Contains barangay_admin role`);
    console.log(`   - Profiles table: ✅ Contains ${profiles.length} user profiles`);
    console.log(`   - Active admins: ${admins.length} found`);
    console.log(`   - Admin check should work correctly`);
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testAdminCheck();
