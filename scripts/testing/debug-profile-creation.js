const { createClient } = require('@supabase/supabase-js');

const supabaseAdmin = createClient(
  'https://cdtcbelaimyftpxmzkjf.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkdGNiZWxhaW15ZnRweG16a2pmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDg4ODU5MiwiZXhwIjoyMDcwNDY0NTkyfQ.pTuiHF7JKxhO0bcZoo8lmSveBhzKc9cqSCTb5oBcJrk',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

async function debugProfiles() {
  console.log('Debugging profile creation...\n');
  
  try {
    // Get all profiles
    const { data: profiles, error: profileError } = await supabaseAdmin
      .from('auth_user_profiles')
      .select('*');
    
    console.log(`Total profiles in database: ${profiles?.length || 0}`);
    
    if (profiles && profiles.length > 0) {
      console.log('\nExisting profiles:');
      profiles.forEach(p => {
        console.log(`- ${p.email} (ID: ${p.id.substring(0, 8)}...)`);
      });
    }
    
    // Get recent auth users
    const { data: { users }, error: usersError } = await supabaseAdmin.auth.admin.listUsers({
      page: 1,
      perPage: 3
    });
    
    console.log(`\nRecent auth users: ${users?.length || 0}`);
    
    if (users && users.length > 0) {
      for (const user of users) {
        console.log(`\nUser: ${user.email}`);
        console.log(`  ID: ${user.id}`);
        console.log(`  Confirmed: ${user.email_confirmed_at ? 'Yes' : 'No'}`);
        console.log(`  Created: ${user.created_at}`);
        console.log(`  Metadata:`, JSON.stringify(user.raw_user_meta_data, null, 2));
        
        // Check if profile exists for this user
        const { data: profile } = await supabaseAdmin
          .from('auth_user_profiles')
          .select('id')
          .eq('id', user.id)
          .maybeSingle();
        
        console.log(`  Profile exists: ${profile ? 'Yes' : 'No'}`);
      }
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

debugProfiles();