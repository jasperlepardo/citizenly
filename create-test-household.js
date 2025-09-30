// Temporary script to create a test household
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createTestHousehold() {
  try {
    const householdData = {
      code: '042114014-0000-0001-0001', // Standard household code format
      name: 'Sample Household',
      barangay_code: '042114014',
      house_number: '123',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    console.log('Creating test household:', householdData);
    
    const { data, error } = await supabase
      .from('households')
      .insert([householdData])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating household:', error);
    } else {
      console.log('Successfully created household:', data);
    }
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

createTestHousehold();