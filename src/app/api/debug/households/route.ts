import { NextResponse } from 'next/server';
import { supabase } from '@/lib/data/supabase';

export async function GET() {
  try {
    console.log('Debug: Checking households table...');
    
    // Get all households (limited to first 10 for debugging)
    const { data: households, error } = await supabase
      .from('households')
      .select('code, barangay_code, created_at')
      .limit(10);

    if (error) {
      console.error('Debug: Error querying households:', error);
      return NextResponse.json({ 
        error: error.message, 
        code: error.code,
        details: error.details 
      }, { status: 500 });
    }

    console.log('Debug: Found households:', households?.length || 0);
    
    return NextResponse.json({
      count: households?.length || 0,
      households: households || [],
      message: 'Households debug data'
    });

  } catch (err) {
    console.error('Debug: Exception in households debug:', err);
    return NextResponse.json({ 
      error: 'Debug endpoint error', 
      details: err instanceof Error ? err.message : String(err) 
    }, { status: 500 });
  }
}