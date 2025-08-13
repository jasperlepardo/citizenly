const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables from .env.local
require('dotenv').config({ path: '.env.local' });

async function fixTrigger() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    console.error('Missing required environment variables');
    process.exit(1);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  console.log('Fixing trigger function...');
  
  // Read the corrected function
  const newFunction = `
CREATE OR REPLACE FUNCTION auto_populate_resident_full_name()
RETURNS TRIGGER AS $$
DECLARE
    first_name_text TEXT;
    middle_name_text TEXT;  
    last_name_text TEXT;
    full_name_text TEXT;
BEGIN
    -- Only use encrypted fields since the table doesn't have plain text name fields
    first_name_text := CASE 
        WHEN NEW.first_name_encrypted IS NOT NULL THEN decrypt_pii(NEW.first_name_encrypted)
        ELSE NULL
    END;
    
    middle_name_text := CASE 
        WHEN NEW.middle_name_encrypted IS NOT NULL THEN decrypt_pii(NEW.middle_name_encrypted)  
        ELSE NULL
    END;
    
    last_name_text := CASE 
        WHEN NEW.last_name_encrypted IS NOT NULL THEN decrypt_pii(NEW.last_name_encrypted)
        ELSE NULL
    END;
    
    -- Build full name from decrypted components
    full_name_text := TRIM(CONCAT_WS(' ', 
        first_name_text,
        middle_name_text,
        last_name_text
    ));
    
    -- Encrypt the full name and store it - use name_encrypted field
    IF full_name_text IS NOT NULL AND full_name_text != '' THEN
        NEW.name_encrypted := encrypt_pii(full_name_text);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
  `;

  try {
    // Try to execute using SQL endpoint
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${serviceRoleKey}`,
        'Content-Type': 'application/json',
        'apikey': serviceRoleKey
      },
      body: JSON.stringify({ sql: newFunction })
    });
    
    if (!response.ok) {
      console.log('Direct SQL execution failed, trying alternative...');
      
      // Alternative: Try using a simple select query to test connection
      const { data, error } = await supabase
        .from('residents')
        .select('id')
        .limit(1);
        
      if (error) {
        console.error('Database connection failed:', error);
        return;
      }
      
      console.log('Database connection successful, but cannot execute DDL statements through this method.');
      console.log('You need to execute the following SQL directly in your Supabase dashboard:');
      console.log('='.repeat(60));
      console.log(newFunction);
      console.log('='.repeat(60));
      
    } else {
      console.log('Function updated successfully!');
    }
    
  } catch (err) {
    console.error('Error:', err.message);
    console.log('Please execute the following SQL in your Supabase SQL editor:');
    console.log('='.repeat(60));
    console.log(newFunction);
    console.log('='.repeat(60));
  }
}

fixTrigger();