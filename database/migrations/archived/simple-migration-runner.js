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

async function runMigration() {
  console.log('Running email confirmation flow migration steps...\n');
  
  try {
    // Step 1: Drop the old trigger
    console.log('1. Dropping existing trigger...');
    await supabaseAdmin.rpc('exec', {
      sql: 'DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;'
    });
    console.log('✅ Old trigger dropped');
    
    // Step 2: Create the email confirmation function
    console.log('2. Creating email confirmation function...');
    const confirmationFunction = `
    CREATE OR REPLACE FUNCTION handle_user_email_confirmation()
    RETURNS TRIGGER AS $$ 
    DECLARE
        v_barangay_admin_role_id UUID;
        v_barangay_code TEXT;
        v_first_name TEXT;
        v_last_name TEXT;
        v_phone TEXT;
        v_existing_admin_count INTEGER;
    BEGIN
        -- Only process when email_confirmed_at changes from NULL to a timestamp
        IF OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL THEN
            
            -- Extract signup data from user metadata
            v_barangay_code := NEW.raw_user_meta_data->>'barangay_code';
            v_first_name := NEW.raw_user_meta_data->>'first_name';
            v_last_name := NEW.raw_user_meta_data->>'last_name';
            v_phone := NEW.raw_user_meta_data->>'phone';
            
            -- Skip if no barangay data (not from our signup)
            IF v_barangay_code IS NULL OR v_first_name IS NULL THEN
                RAISE WARNING 'User % confirmed but missing signup metadata', NEW.id;
                RETURN NEW;
            END IF;
            
            -- Check if there's already an admin for this barangay
            SELECT COUNT(*) INTO v_existing_admin_count
            FROM auth_user_profiles aup
            JOIN auth_roles ar ON aup.role_id = ar.id
            WHERE aup.barangay_code = v_barangay_code
            AND ar.name = 'barangay_admin'
            AND aup.is_active = true;
            
            -- Block registration if admin already exists
            IF v_existing_admin_count > 0 THEN
                RAISE WARNING 'User % tried to register for barangay % but admin already exists', NEW.id, v_barangay_code;
                -- Update metadata to indicate blocked status
                UPDATE auth.users 
                SET raw_user_meta_data = raw_user_meta_data || '{"signup_step": "blocked_admin_exists"}'::jsonb
                WHERE id = NEW.id;
                RETURN NEW;
            END IF;
            
            -- Get barangay admin role ID
            SELECT id INTO v_barangay_admin_role_id 
            FROM auth_roles 
            WHERE name = 'barangay_admin'
            LIMIT 1;
            
            -- Fallback to any admin role if needed
            IF v_barangay_admin_role_id IS NULL THEN
                SELECT id INTO v_barangay_admin_role_id 
                FROM auth_roles 
                WHERE name IN ('barangay_admin', 'super_admin')
                LIMIT 1;
            END IF;
            
            -- Create the user profile now that email is confirmed
            INSERT INTO auth_user_profiles (
                id,
                email,
                first_name,
                last_name,
                phone,
                role_id,
                barangay_code,
                is_active,
                created_at,
                updated_at
            ) VALUES (
                NEW.id,
                NEW.email,
                v_first_name,
                v_last_name,
                v_phone,
                v_barangay_admin_role_id,
                v_barangay_code,
                true,
                NOW(),
                NOW()
            ) ON CONFLICT (id) DO UPDATE SET
                email = EXCLUDED.email,
                first_name = EXCLUDED.first_name,
                last_name = EXCLUDED.last_name,
                phone = EXCLUDED.phone,
                role_id = EXCLUDED.role_id,
                barangay_code = EXCLUDED.barangay_code,
                is_active = true,
                updated_at = NOW();
            
            -- Update user metadata to indicate profile creation completed
            UPDATE auth.users 
            SET raw_user_meta_data = raw_user_meta_data || '{"signup_step": "profile_created"}'::jsonb
            WHERE id = NEW.id;
            
            RAISE NOTICE 'Profile created for confirmed user % in barangay %', NEW.id, v_barangay_code;
            
        END IF;
        
        RETURN NEW;
    EXCEPTION
        WHEN others THEN
            -- Log error but don't fail the confirmation
            RAISE WARNING 'Failed to process email confirmation for user %: %', NEW.id, SQLERRM;
            -- Update metadata to indicate error
            UPDATE auth.users 
            SET raw_user_meta_data = raw_user_meta_data || jsonb_build_object('signup_step', 'confirmation_error', 'error', SQLERRM)
            WHERE id = NEW.id;
            RETURN NEW;
    END;
    $$ LANGUAGE plpgsql SECURITY DEFINER;`;
    
    console.log('Function creation might take a moment...');
    const result = await supabaseAdmin.query(confirmationFunction);
    if (result.error) throw result.error;
    console.log('✅ Email confirmation function created');
    
    // Step 3: Create the trigger
    console.log('3. Creating email confirmation trigger...');
    await supabaseAdmin.query(`
      DROP TRIGGER IF EXISTS trigger_on_user_email_confirmed ON auth.users;
      CREATE TRIGGER trigger_on_user_email_confirmed
          AFTER UPDATE ON auth.users
          FOR EACH ROW 
          WHEN (OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL)
          EXECUTE FUNCTION handle_user_email_confirmation();
    `);
    console.log('✅ Email confirmation trigger created');
    
    // Step 4: Update handle_new_user function to no-op
    console.log('4. Updating signup function to no-op...');
    await supabaseAdmin.query(`
      CREATE OR REPLACE FUNCTION handle_new_user()
      RETURNS TRIGGER AS $$
      BEGIN
          -- No longer create profiles immediately - wait for email confirmation
          RAISE NOTICE 'User % created, awaiting email confirmation before profile creation', NEW.id;
          RETURN NEW;
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `);
    console.log('✅ Signup function updated');
    
    // Step 5: Recreate the signup trigger
    console.log('5. Recreating signup trigger...');
    await supabaseAdmin.query(`
      CREATE TRIGGER on_auth_user_created
          AFTER INSERT ON auth.users
          FOR EACH ROW EXECUTE FUNCTION handle_new_user();
    `);
    console.log('✅ Signup trigger recreated');
    
    console.log('\n🎉 Email confirmation flow migration completed successfully!');
    console.log('✅ New flow: Account → Email Confirmation → Profile → Roles');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    if (error.details) console.error('Details:', error.details);
    process.exit(1);
  }
}

runMigration();