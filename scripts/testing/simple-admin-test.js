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

async function simpleTest() {
  console.log('Simple Admin Check Test\n');
  
  try {
    // Check if there are any user profiles
    const { data: profiles, error: profilesError } = await supabaseAdmin
      .from('auth_user_profiles')
      .select('*')
      .limit(5);
    
    console.log('Profiles found:', profiles?.length || 0);
    if (profiles && profiles.length > 0) {
      console.log('Sample profile:', {
        id: profiles[0].id.substring(0, 8) + '...',
        email: profiles[0].email,
        barangay_code: profiles[0].barangay_code,
        role_id: profiles[0].role_id,
        is_active: profiles[0].is_active
      });
    }
    
    // Check roles
    const { data: roles, error: rolesError } = await supabaseAdmin
      .from('auth_roles')
      .select('*');
    
    console.log('\nRoles found:', roles?.length || 0);
    if (roles) {
      roles.forEach(role => {
        console.log(`- ${role.name}: ${role.id}`);
      });
    }
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

simpleTest();