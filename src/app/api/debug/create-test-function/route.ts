import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST() {
  try {
    // Use service role to create the test function
    const adminSupabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );
    
    const testFunctionSQL = `
      CREATE OR REPLACE FUNCTION test_household_access(target_barangay VARCHAR(10) DEFAULT NULL)
      RETURNS TABLE (
          household_code VARCHAR(50),
          barangay_code VARCHAR(10),
          created_by VARCHAR(50),
          auth_uid_result TEXT,
          user_barangay_result VARCHAR(10),
          user_access_level_result TEXT,
          rls_check_result BOOLEAN,
          direct_comparison TEXT
      ) 
      SECURITY DEFINER
      AS $$
      DECLARE
          current_uid TEXT;
          current_barangay VARCHAR(10);
          current_access_level JSON;
      BEGIN
          -- Get current values
          current_uid := auth.uid()::TEXT;
          current_barangay := user_barangay_code();
          current_access_level := user_access_level();
          
          RETURN QUERY
          SELECT 
              h.code::VARCHAR(50) as household_code,
              h.barangay_code::VARCHAR(10) as barangay_code,
              h.created_by::VARCHAR(50) as created_by,
              current_uid as auth_uid_result,
              current_barangay as user_barangay_result,
              current_access_level::TEXT as user_access_level_result,
              (h.barangay_code = current_barangay)::BOOLEAN as rls_check_result,
              CONCAT(h.barangay_code, ' = ', current_barangay, ' -> ', (h.barangay_code = current_barangay)::TEXT) as direct_comparison
          FROM households h
          WHERE 
              target_barangay IS NULL OR h.barangay_code = target_barangay
          LIMIT 5;
      END;
      $$ LANGUAGE plpgsql;
    `;
    
    const { error } = await adminSupabase.rpc('sql', { query: testFunctionSQL });
    
    if (error) {
      console.error('Error creating test function:', error);
      return NextResponse.json({ 
        success: false,
        error: error.message 
      }, { status: 500 });
    }
    
    return NextResponse.json({ 
      success: true,
      message: 'Test function created successfully' 
    });
    
  } catch (err) {
    console.error('Exception creating test function:', err);
    return NextResponse.json({ 
      success: false,
      error: err instanceof Error ? err.message : String(err) 
    }, { status: 500 });
  }
}