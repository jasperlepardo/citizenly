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

async function setupDevMode() {
  console.log('🛠️  Setting up development mode (auto-confirm emails)...\n');

  const sqlStatements = [
    // Create auto-confirm function
    `CREATE OR REPLACE FUNCTION auto_confirm_users()
     RETURNS TRIGGER AS $$
     BEGIN
         -- Automatically confirm email for new users in development
         IF NEW.email_confirmed_at IS NULL THEN
             NEW.email_confirmed_at = NOW();
             NEW.confirmation_sent_at = NOW();
             RAISE NOTICE 'Auto-confirmed user % for development', NEW.email;
         END IF;
         RETURN NEW;
     END;
     $$ LANGUAGE plpgsql SECURITY DEFINER;`,

    // Create trigger
    `DROP TRIGGER IF EXISTS trigger_auto_confirm_dev_users ON auth.users;
     CREATE TRIGGER trigger_auto_confirm_dev_users
         BEFORE INSERT ON auth.users
         FOR EACH ROW
         EXECUTE FUNCTION auto_confirm_users();`,
  ];

  console.log('This will:');
  console.log('✅ Auto-confirm all new user emails');
  console.log('✅ Prevent confirmation emails from being sent');
  console.log('✅ Allow immediate login after signup');
  console.log('✅ Still trigger profile creation automatically\n');

  console.log('⚠️  WARNING: This is for DEVELOPMENT ONLY!');
  console.log('   Remove this before going to production.\n');

  // Wait for user confirmation
  const readline = require('readline').createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  readline.question('Continue? (y/n): ', async answer => {
    if (answer.toLowerCase() !== 'y') {
      console.log('Cancelled.');
      process.exit(0);
    }

    console.log('\nApplying development mode...');

    // Note: Since we can't execute raw SQL, you'll need to run this in Supabase SQL editor
    console.log('\n📋 Copy and run this SQL in your Supabase SQL Editor:\n');
    console.log('```sql');
    sqlStatements.forEach(sql => {
      console.log(sql);
      console.log('');
    });
    console.log('```');

    console.log('\n✅ After running the SQL:');
    console.log('   - New signups will be auto-confirmed');
    console.log('   - No confirmation emails will be sent');
    console.log('   - Profile creation will happen immediately');

    console.log('\n🔄 To revert to production mode, run:');
    console.log('```sql');
    console.log('DROP TRIGGER IF EXISTS trigger_auto_confirm_dev_users ON auth.users;');
    console.log('DROP FUNCTION IF EXISTS auto_confirm_users();');
    console.log('```');

    readline.close();
  });
}

setupDevMode();
