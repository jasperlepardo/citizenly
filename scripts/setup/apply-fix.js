require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function applyFix() {
  console.log('🔧 Applying auto-population fix for user profiles...\n');
  
  try {
    // Step 1: Create the function
    console.log('1. Creating auto-population function...');
    const { error: funcError } = await supabase.rpc('exec', {
      sql: `
        CREATE OR REPLACE FUNCTION auto_populate_user_profile_geo_codes()
        RETURNS TRIGGER AS $$
        DECLARE
            v_city_code VARCHAR(10);
            v_province_code VARCHAR(10);  
            v_region_code VARCHAR(10);
        BEGIN
            -- Only auto-populate if barangay_code exists but other codes are missing
            IF NEW.barangay_code IS NOT NULL AND 
               (NEW.city_municipality_code IS NULL OR NEW.province_code IS NULL OR NEW.region_code IS NULL) THEN
                
                -- Get the complete geographic hierarchy from barangay code
                SELECT 
                    c.code,           -- city code
                    p.code,           -- province code  
                    r.code            -- region code
                INTO v_city_code, v_province_code, v_region_code
                FROM psgc_barangays b
                JOIN psgc_cities_municipalities c ON b.city_municipality_code = c.code
                JOIN psgc_provinces p ON c.province_code = p.code
                JOIN psgc_regions r ON p.region_code = r.code
                WHERE b.code = NEW.barangay_code;
                
                -- Update the NEW record with derived codes
                IF v_city_code IS NOT NULL THEN
                    NEW.city_municipality_code := COALESCE(NEW.city_municipality_code, v_city_code);
                    NEW.province_code := COALESCE(NEW.province_code, v_province_code);
                    NEW.region_code := COALESCE(NEW.region_code, v_region_code);
                END IF;
            END IF;
            
            RETURN NEW;
        END;
        $$ LANGUAGE plpgsql;
      `
    });
    
    if (funcError) {
      console.error('Function error:', funcError);
      return;
    }
    console.log('✅ Function created');
    
    // Step 2: Create the trigger (using direct update since rpc might not work)
    // We'll do this via a simple update approach instead
    
    // Step 2: Update existing profile with correct field names
    console.log('2. Updating your existing profile...');
    
    // Get your current profile
    const { data: profile } = await supabase
      .from('auth_user_profiles')
      .select('*')
      .eq('email', 'jsprlprd@gmail.com')
      .single();
    
    if (!profile) {
      console.log('No profile found');
      return;
    }
    
    console.log('Current profile field names and values:');
    console.log('- barangay_code:', profile.barangay_code);
    console.log('- city_municipality_code:', profile.city_municipality_code);
    console.log('- province_code:', profile.province_code);
    console.log('- region_code:', profile.region_code);
    
    if (!profile.city_municipality_code || !profile.province_code || !profile.region_code) {
      // Get the geographic hierarchy
      const { data: hierarchy } = await supabase
        .from('psgc_barangays')
        .select(`
          code,
          city_municipality_code,
          psgc_cities_municipalities!inner(
            code,
            province_code,
            psgc_provinces!inner(
              code,
              region_code
            )
          )
        `)
        .eq('code', profile.barangay_code)
        .single();
      
      if (hierarchy) {
        const city = hierarchy.psgc_cities_municipalities;
        const province = city.psgc_provinces;
        
        console.log('Derived values (using correct field names):');
        console.log('- city_municipality_code:', city.code);
        console.log('- province_code:', province.code);
        console.log('- region_code:', province.region_code);
        
        const { error: updateError } = await supabase
          .from('auth_user_profiles')
          .update({
            city_municipality_code: city.code,
            province_code: province.code,
            region_code: province.region_code
          })
          .eq('id', profile.id);
        
        if (updateError) {
          console.error('❌ Update error:', updateError);
        } else {
          console.log('✅ Profile updated successfully!');
          
          // Verify the update
          const { data: updated } = await supabase
            .from('auth_user_profiles')
            .select('barangay_code, city_municipality_code, province_code, region_code')
            .eq('id', profile.id)
            .single();
          
          console.log('Verification - Updated profile:');
          console.log('- barangay_code:', updated.barangay_code);
          console.log('- city_municipality_code:', updated.city_municipality_code);
          console.log('- province_code:', updated.province_code);
          console.log('- region_code:', updated.region_code);
        }
      }
    } else {
      console.log('✅ Profile already has all geographic codes');
    }
    
  } catch (error) {
    console.error('Error:', error);
  }
}

applyFix().then(() => {
  console.log('\n✅ Fix completed!');
  process.exit(0);
}).catch(err => {
  console.error('Error:', err);
  process.exit(1);
});