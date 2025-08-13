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

async function setupPostConfirmation() {
  console.log('🔄 Setting up post-confirmation processing system...');

  try {
    // Step 1: Check current system status
    console.log('\n1️⃣ Checking current system status...');

    const { data: users, error: usersError } = await supabaseAdmin.auth.admin.listUsers();
    if (usersError) {
      throw new Error(`Failed to list users: ${usersError.message}`);
    }

    console.log(`   Found ${users.users.length} total users`);

    const confirmedUsers = users.users.filter(u => u.email_confirmed_at);
    const unconfirmedUsers = users.users.filter(u => !u.email_confirmed_at);

    console.log(`   Confirmed: ${confirmedUsers.length}`);
    console.log(`   Unconfirmed: ${unconfirmedUsers.length}`);

    // Step 2: Check profiles table structure
    console.log('\n2️⃣ Checking profiles table structure...');

    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from('auth_user_profiles')
      .select('id, email_verified, email_verified_at, welcome_email_sent')
      .limit(1);

    if (profilesError) {
      console.log('   ⚠️  Profiles table may need migration:', profilesError.message);
    } else {
      console.log('   ✅ Profiles table structure looks good');
    }

    // Step 3: Process confirmed users without email_verified flag
    console.log('\n3️⃣ Processing confirmed users...');

    let processedCount = 0;

    for (const user of confirmedUsers) {
      try {
        // Get profile
        const { data: profile, error: profileError } = await supabaseAdmin
          .from('auth_user_profiles')
          .select(
            'id, email_verified, barangay_code, city_municipality_code, province_code, region_code'
          )
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.log(`   ❌ No profile found for user ${user.id}`);
          continue;
        }

        let needsUpdate = false;
        const updates = {};

        // Check if email verification needs updating
        if (!profile.email_verified) {
          updates.email_verified = true;
          updates.email_verified_at = user.email_confirmed_at;
          needsUpdate = true;
        }

        // Check if address hierarchy needs completing
        if (
          profile.barangay_code &&
          (!profile.city_municipality_code || !profile.province_code || !profile.region_code)
        ) {
          // Get complete hierarchy
          const { data: hierarchy, error: hierError } = await supabaseAdmin.rpc(
            'get_address_hierarchy',
            { barangay_code: profile.barangay_code }
          );

          if (!hierError && hierarchy && hierarchy.length > 0) {
            const addr = hierarchy[0];
            updates.city_municipality_code = addr.city_code;
            updates.province_code = addr.province_code;
            updates.region_code = addr.region_code;
            needsUpdate = true;
          }
        }

        if (needsUpdate) {
          updates.updated_at = new Date().toISOString();

          const { error: updateError } = await supabaseAdmin
            .from('auth_user_profiles')
            .update(updates)
            .eq('id', user.id);

          if (updateError) {
            console.log(`   ❌ Failed to update ${user.id}: ${updateError.message}`);
          } else {
            console.log(`   ✅ Updated profile for ${user.id}`);
            processedCount++;
          }
        } else {
          console.log(`   ℹ️  Profile already up-to-date for ${user.id}`);
        }
      } catch (error) {
        console.log(`   ❌ Error processing ${user.id}: ${error.message}`);
      }
    }

    console.log(`\n   📊 Processed ${processedCount} profiles`);

    // Step 4: Check notification system
    console.log('\n4️⃣ Testing notification system...');

    try {
      const { data: notifCheck, error: notifError } = await supabaseAdmin
        .from('user_notifications')
        .select('*')
        .limit(1);

      if (notifError) {
        console.log('   ⚠️  Notifications table may need creation:', notifError.message);
      } else {
        console.log('   ✅ Notifications table ready');
      }
    } catch (error) {
      console.log('   ⚠️  Notifications system may need setup:', error.message);
    }

    // Step 5: Summary and next steps
    console.log('\n📋 Setup Summary:');
    console.log(`   • Total users: ${users.users.length}`);
    console.log(`   • Confirmed users: ${confirmedUsers.length}`);
    console.log(`   • Profiles updated: ${processedCount}`);

    console.log('\n🚀 Next Steps:');
    console.log(
      '   1. Deploy the database migration: database/migrations/add-post-confirmation-processing.sql'
    );
    console.log('   2. Set up Supabase webhook to POST /api/auth/webhook');
    console.log('   3. Test email confirmation flow with new user');
    console.log('   4. Set up cron job to process notifications: /api/auth/process-notifications');

    console.log('\n✅ Post-confirmation system setup complete!');
  } catch (error) {
    console.error('❌ Setup failed:', error.message);
  }
}

setupPostConfirmation();
