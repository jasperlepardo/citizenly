'use client';

import React, { useState } from 'react';

import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/data/supabase';

export default function ManualHouseholdTest() {
  const { user } = useAuth();
  const [results, setResults] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const runManualTest = async () => {
    if (!user) return;
    
    setLoading(true);
    setResults('🧪 Starting manual household test...\n\n');
    
    try {
      // Step 1: Test RLS functions directly
      const accessLevel = await supabase.rpc('user_access_level');
      const barangayCode = await supabase.rpc('user_barangay_code');
      
      let log = `Step 1: RLS Functions
✅ user_access_level(): ${JSON.stringify(accessLevel.data)}
✅ user_barangay_code(): ${barangayCode.data}

`;

      // Step 2: Test if we can create a simple household query with raw SQL
      const rawQuery = `
        SELECT 
          code, 
          barangay_code,
          user_barangay_code() as user_barangay,
          user_access_level() as user_access,
          (barangay_code = user_barangay_code()) as codes_match,
          (user_access_level()->>'level') as access_level_extracted
        FROM households 
        WHERE code = '042114014-0000-0001-0001'
        LIMIT 1
      `;
      
      try {
        const { data: rawData, error: rawError } = await supabase.rpc('raw_sql', { 
          query: rawQuery 
        });
        
        if (rawError) {
          log += `Step 2: Raw SQL Test
❌ Raw SQL not supported: ${rawError.message}

`;
        } else {
          log += `Step 2: Raw SQL Test  
✅ Raw SQL result: ${JSON.stringify(rawData)}

`;
        }
      } catch (e) {
        log += `Step 2: Raw SQL Test
❌ Raw SQL failed: ${(e as Error).message}

`;
      }

      // Step 3: Test household query step by step
      log += `Step 3: Household Query Tests
`;

      // Test 3a: Query without any filters (should work if RLS allows ANY access)
      const { data: allHouseholds, error: allError } = await supabase
        .from('households')
        .select('code, barangay_code')
        .limit(1);
        
      log += `3a. Any households: ${allHouseholds?.length || 0} found`;
      if (allError) log += ` (Error: ${allError.message})`;
      log += `\n`;
      
      // Test 3b: Query with barangay filter
      const { data: barangayHouseholds, error: barangayError } = await supabase
        .from('households')
        .select('code, barangay_code')
        .eq('barangay_code', barangayCode.data)
        .limit(1);
        
      log += `3b. Barangay filtered: ${barangayHouseholds?.length || 0} found`;
      if (barangayError) log += ` (Error: ${barangayError.message})`;
      log += `\n`;
      
      // Test 3c: Target household
      const { data: targetHousehold, error: targetError } = await supabase
        .from('households')
        .select('code, barangay_code')
        .eq('code', '042114014-0000-0001-0001');
        
      log += `3c. Target household: ${targetHousehold?.length || 0} found`;
      if (targetError) log += ` (Error: ${targetError.message})`;
      log += `\n`;

      // Step 4: Test with disabled RLS (won't work from client, but let's try)
      log += `
Step 4: Analysis
Expected behavior: All queries should return 1 result
- User has barangay access level ✓
- User barangay matches household barangay ✓  
- RLS functions return correct values ✓
- But queries return 0 results ❌

Diagnosis: RLS policy logic error in CASE statement or JSON extraction
`;

      // Step 5: Try alternative queries
      log += `
Step 5: Alternative Query Tests
`;

      // Try querying with explicit function calls in SELECT
      const { data: explicitFunctions, error: explicitError } = await supabase
        .from('households')
        .select(`
          code, 
          barangay_code
        `)
        .eq('code', '042114014-0000-0001-0001');
        
      log += `5a. Explicit functions in SELECT: ${explicitFunctions?.length || 0} found`;
      if (explicitError) log += ` (Error: ${explicitError.message})`;
      log += `\n`;

      setResults(log);
      
    } catch (error) {
      setResults(results + `\n❌ Test failed: ${(error as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <div className="p-6">Please log in to run manual test.</div>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">🔬 Manual Household Test</h1>
      
      <button 
        onClick={runManualTest}
        disabled={loading}
        className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded mb-6 disabled:opacity-50"
      >
        {loading ? 'Running Test...' : 'Run Manual Test'}
      </button>
      
      {results && (
        <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm whitespace-pre-wrap">
          {results}
        </div>
      )}
      
      <div className="mt-6 bg-blue-50 dark:bg-blue-900 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">Purpose:</h3>
        <p className="text-sm">
          This test manually examines each step of the RLS policy evaluation to identify 
          exactly where the household access is failing. It should help us pinpoint whether 
          the issue is in the JSON extraction, CASE statement logic, or function execution.
        </p>
      </div>
    </div>
  );
}