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

async function cleanupTestUsers() {
  console.log('🧹 Cleaning up test users and data...\n');
  
  try {
    // Get all test users
    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (listError) throw listError;
    
    // Filter for test users (emails containing 'test')
    const testUsers = users.filter(u => 
      u.email.includes('test') || 
      u.email.includes('Test') ||
      u.email.includes('localhost') ||
      u.email.includes('example.com')
    );
    
    console.log(`Found ${testUsers.length} test users to delete:\n`);
    
    if (testUsers.length === 0) {
      console.log('No test users found.');
      return;
    }
    
    // Show users that will be deleted
    testUsers.forEach(u => {
      console.log(`- ${u.email} (ID: ${u.id.substring(0, 8)}...)`);
    });
    
    console.log('\nDeleting users and their data...\n');
    
    let deletedCount = 0;
    let profilesDeleted = 0;
    
    for (const user of testUsers) {
      try {
        // First try to delete profile if exists
        const { data: profileData, error: profileError } = await supabaseAdmin
          .from('auth_user_profiles')
          .delete()
          .eq('id', user.id);
        
        if (!profileError && profileData) {
          profilesDeleted++;
        }
        
        // Delete the auth user (will cascade delete profile if exists)
        const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(user.id);
        
        if (deleteError) {
          console.log(`⚠️ Failed to delete ${user.email}: ${deleteError.message}`);
        } else {
          console.log(`✅ Deleted: ${user.email}`);
          deletedCount++;
        }
      } catch (err) {
        console.log(`⚠️ Error with ${user.email}: ${err.message}`);
      }
    }
    
    console.log('\n' + '═'.repeat(50));
    console.log('🎉 Cleanup Complete!');
    console.log(`   Users deleted: ${deletedCount}/${testUsers.length}`);
    console.log(`   Profiles cleaned: ${profilesDeleted}`);
    
    // Check remaining profiles
    const { count } = await supabaseAdmin
      .from('auth_user_profiles')
      .select('*', { count: 'exact', head: true });
    
    console.log(`   Remaining profiles in database: ${count || 0}`);
    
    // Check remaining users
    const { data: { users: remainingUsers } } = await supabaseAdmin.auth.admin.listUsers();
    console.log(`   Remaining auth users: ${remainingUsers?.length || 0}`);
    
    if (remainingUsers && remainingUsers.length > 0) {
      console.log('\nRemaining users:');
      remainingUsers.forEach(u => {
        console.log(`   - ${u.email}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error.message);
  }
}

// Add confirmation prompt
const readline = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('⚠️  WARNING: This will delete ALL test users and their data!');
console.log('   Users with emails containing: test, Test, localhost, example.com\n');

readline.question('Are you sure you want to proceed? (yes/no): ', (answer) => {
  if (answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y') {
    cleanupTestUsers().then(() => {
      readline.close();
    });
  } else {
    console.log('Cleanup cancelled.');
    readline.close();
  }
});