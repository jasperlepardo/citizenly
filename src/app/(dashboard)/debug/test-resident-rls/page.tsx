'use client';

import React, { useState } from 'react';

import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/data/supabase';

export default function TestResidentRLS() {
  const { user } = useAuth();
  const [results, setResults] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const runResidentTest = async () => {
    if (!user) return;
    
    setLoading(true);
    setResults('🧪 Testing Resident RLS Access...\n\n');
    
    try {
      let log = '';
      
      // Test 1: RLS functions
      const accessLevel = await supabase.rpc('user_access_level');
      const barangayCode = await supabase.rpc('user_barangay_code');
      
      log += `Step 1: RLS Functions
✅ user_access_level(): ${JSON.stringify(accessLevel.data)}
✅ user_barangay_code(): ${barangayCode.data}

`;

      // Test 2: Test household access (should work)
      const { data: households, error: householdError } = await supabase
        .from('households')
        .select('code, barangay_code')
        .eq('code', '042114014-0000-0001-0001');
        
      log += `Step 2: Household Access
${households?.length ? '✅' : '❌'} Households found: ${households?.length || 0}`;
      if (householdError) log += ` (Error: ${householdError.message})`;
      log += `\n\n`;

      // Test 3: Test resident access directly
      const { data: residents, error: residentError } = await supabase
        .from('residents')
        .select('id, first_name, last_name, household_code')
        .eq('household_code', '042114014-0000-0001-0001')
        .limit(3);
        
      log += `Step 3: Direct Resident Access
${residents?.length ? '✅' : '❌'} Residents found: ${residents?.length || 0}`;
      if (residentError) log += ` (Error: ${residentError.message})`;
      log += `\n`;
      if (residents?.length) {
        residents.forEach(r => {
          log += `   - ${r.first_name} ${r.last_name} (${r.id})\n`;
        });
      }
      log += `\n`;

      // Test 4: Test resident access with explicit join
      const { data: residentsWithHousehold, error: joinError } = await supabase
        .from('residents')
        .select(`
          id, 
          first_name, 
          last_name, 
          household_code,
          households!inner(code, barangay_code)
        `)
        .eq('households.code', '042114014-0000-0001-0001')
        .limit(3);
        
      log += `Step 4: Residents with Household Join
${residentsWithHousehold?.length ? '✅' : '❌'} Residents found: ${residentsWithHousehold?.length || 0}`;
      if (joinError) log += ` (Error: ${joinError.message})`;
      log += `\n\n`;

      // Test 5: Test any residents access
      const { data: anyResidents, error: anyError } = await supabase
        .from('residents')
        .select('id, first_name, household_code')
        .limit(3);
        
      log += `Step 5: Any Residents Access
${anyResidents?.length ? '✅' : '❌'} Any residents found: ${anyResidents?.length || 0}`;
      if (anyError) log += ` (Error: ${anyError.message})`;
      log += `\n\n`;

      // Analysis
      log += `Analysis:
- RLS functions working: ${accessLevel.data && barangayCode.data ? '✅' : '❌'}
- Household access working: ${households?.length ? '✅' : '❌'}  
- Resident access working: ${residents?.length ? '✅' : '❌'}
- Any resident access: ${anyResidents?.length ? '✅' : '❌'}

`;

      if (households?.length && !residents?.length) {
        log += `🔍 Issue: Households accessible but residents blocked
   → RLS policy on residents might be faulty
   → The EXISTS subquery in residents policy might be failing
`;
      }

      setResults(log);
      
    } catch (error) {
      setResults(results + `\n❌ Test failed: ${(error as Error).message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <div className="p-6">Please log in to run resident RLS test.</div>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">🧪 Resident RLS Test</h1>
      
      <button 
        onClick={runResidentTest}
        disabled={loading}
        className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded mb-6 disabled:opacity-50"
      >
        {loading ? 'Running Test...' : 'Test Resident Access'}
      </button>
      
      {results && (
        <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm whitespace-pre-wrap">
          {results}
        </div>
      )}
    </div>
  );
}