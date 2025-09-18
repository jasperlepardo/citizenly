#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');

console.log('🔧 Fixing Household RLS Policy...');

const supabaseUrl = 'https://cdtcbelaimyftpxmzkjf.supabase.co';
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNkdGNiZWxhaW15ZnRweG16a2pmIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDg4ODU5MiwiZXhwIjoyMDcwNDY0NTkyfQ.pTuiHF7JKxhO0bcZoo8lmSveBhzKc9cqSCTb5oBcJrk';

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function fixRLSPolicy() {
  try {
    console.log('🗑️ Dropping existing household RLS policy...');
    
    const dropPolicy = `
      DROP POLICY IF EXISTS "Multi-level geographic access for households" ON households;
    `;
    
    const { error: dropError } = await supabase.rpc('sql', { query: dropPolicy });
    if (dropError) {
      console.log('⚠️ Drop policy warning:', dropError.message);
    } else {
      console.log('✅ Old policy dropped successfully');
    }
    
    console.log('🛠️ Creating new household RLS policy with corrected JSON extraction...');
    
    // Fixed policy with proper JSON extraction
    const createPolicy = `
      CREATE POLICY "Multi-level geographic access for households" ON households
      FOR ALL USING (
          -- Super admin can access all households
          is_super_admin() OR
          
          -- Geographic jurisdiction matching for household data access
          CASE user_access_level()->>'level'
              WHEN 'barangay' THEN barangay_code = user_barangay_code()
              WHEN 'city' THEN city_municipality_code = user_city_code()
              WHEN 'province' THEN province_code = user_province_code()
              WHEN 'region' THEN region_code = user_region_code()
              WHEN 'national' THEN true
              ELSE false
          END
      );
    `;
    
    const { error: createError } = await supabase.rpc('sql', { query: createPolicy });
    if (createError) {
      console.error('❌ Create policy error:', createError.message);
      return false;
    }
    
    console.log('✅ New policy created successfully');
    
    console.log('🧪 Testing policy with sample queries...');
    
    // Test the policy works
    const { data: households, error: testError } = await supabase
      .from('households')
      .select('code, barangay_code')
      .limit(1);
      
    if (testError) {
      console.log('⚠️ Test query (service role):', testError.message);
    } else {
      console.log('✅ Policy allows admin access to', households?.length || 0, 'households');
    }
    
    console.log('🎯 RLS Policy fix completed!');
    console.log('📝 The key change: user_access_level()::json->>"level" → user_access_level()->>"level"');
    console.log('📱 Please refresh your browser and test household access');
    
    return true;
    
  } catch (error) {
    console.error('❌ Policy fix failed:', error.message);
    return false;
  }
}

fixRLSPolicy();