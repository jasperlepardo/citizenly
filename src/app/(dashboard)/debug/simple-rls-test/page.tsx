'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/data/supabase';
import { useAuth } from '@/contexts';

export default function SimpleRLSTest() {
  const { user, session, userProfile } = useAuth();
  const [results, setResults] = useState<any[]>([]);

  const runTest = async () => {
    if (!user) return;
    
    console.log('🧪 Simple RLS Test Starting...');
    const testResults: any[] = [];

    // Test 1: RLS Functions
    console.log('Testing RLS functions...');
    try {
      const accessLevel = await supabase.rpc('user_access_level');
      const barangayCode = await supabase.rpc('user_barangay_code');
      
      testResults.push({
        test: 'RLS Functions',
        userAccessLevel: accessLevel.data,
        userBarangayCode: barangayCode.data,
        accessLevelError: accessLevel.error?.message,
        barangayCodeError: barangayCode.error?.message
      });
      
      console.log('RLS Functions Result:', {
        accessLevel: accessLevel.data,
        barangayCode: barangayCode.data
      });
    } catch (e) {
      testResults.push({
        test: 'RLS Functions',
        error: (e as Error).message
      });
    }

    // Test 2: Household Queries
    console.log('Testing household queries...');
    try {
      const anyHouseholds = await supabase
        .from('households')
        .select('code, barangay_code')
        .limit(1);

      console.log('🎯 Querying target household with code: 042114014-0000-0001-0001');
      const targetHousehold = await supabase
        .from('households')
        .select('code, barangay_code')
        .eq('code', '042114014-0000-0001-0001');
      console.log('🎯 Target household result:', { 
        data: targetHousehold.data, 
        error: targetHousehold.error?.message,
        count: targetHousehold.data?.length || 0 
      });

      const barangayHouseholds = await supabase
        .from('households')
        .select('code, barangay_code')
        .eq('barangay_code', '042114014')
        .limit(1);

      testResults.push({
        test: 'Household Queries',
        anyHouseholds: {
          count: anyHouseholds.data?.length || 0,
          error: anyHouseholds.error?.message
        },
        targetHousehold: {
          count: targetHousehold.data?.length || 0,
          error: targetHousehold.error?.message
        },
        barangayHouseholds: {
          count: barangayHouseholds.data?.length || 0,
          error: barangayHouseholds.error?.message
        }
      });

      console.log('Household Queries Result:', {
        anyCount: anyHouseholds.data?.length || 0,
        targetCount: targetHousehold.data?.length || 0,
        barangayCount: barangayHouseholds.data?.length || 0
      });
    } catch (e) {
      testResults.push({
        test: 'Household Queries',
        error: (e as Error).message
      });
    }

    // Test 3: Profile Access
    console.log('Testing profile access...');
    try {
      const ownProfile = await supabase
        .from('auth_user_profiles')
        .select('id, barangay_code')
        .eq('id', user.id)
        .single();

      testResults.push({
        test: 'Profile Access',
        canAccessOwnProfile: !!ownProfile.data,
        profileBarangayCode: ownProfile.data?.barangay_code,
        error: ownProfile.error?.message
      });

      console.log('Profile Access Result:', {
        accessible: !!ownProfile.data,
        barangayCode: ownProfile.data?.barangay_code
      });
    } catch (e) {
      testResults.push({
        test: 'Profile Access',
        error: (e as Error).message
      });
    }

    setResults(testResults);
    console.log('🧪 Complete Test Results:', testResults);
  };

  useEffect(() => {
    console.log('🔄 Effect triggered:', { 
      hasUser: !!user, 
      hasSession: !!session, 
      userId: user?.id,
      sessionValid: !!session?.access_token 
    });
    
    if (user && session && results.length === 0) {
      // Only run if we haven't run tests yet
      setTimeout(() => {
        runTest();
      }, 1000);
    }
  }, [user, session, results.length]);

  if (!user) {
    return <div className="p-6">Please log in to run RLS tests.</div>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">🧪 Simple RLS Test</h1>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">User Info</h2>
        <div className="text-sm space-y-1">
          <div><strong>User ID:</strong> {user.id}</div>
          <div><strong>Profile Barangay:</strong> {userProfile?.barangay_code || 'Loading...'}</div>
          <div><strong>Session Valid:</strong> {session?.access_token ? 'Yes' : 'No'}</div>
        </div>
      </div>

      <button 
        onClick={runTest}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded mb-6 cursor-pointer transition-colors"
      >
        Run Test Again
      </button>

      {results.length > 0 && (
        <div className="space-y-4">
          {results.map((result, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-4">
              <h3 className="font-semibold text-lg mb-2">{result.test}</h3>
              <pre className="bg-gray-100 dark:bg-gray-900 p-3 rounded text-xs overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 bg-yellow-100 dark:bg-yellow-900 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">Expected Results:</h3>
        <ul className="text-sm space-y-1">
          <li>• <strong>RLS Functions:</strong> Should return access level 'barangay' and barangay code '042114014'</li>
          <li>• <strong>Household Queries:</strong> Should return 0 households (this is the problem)</li>
          <li>• <strong>Profile Access:</strong> Should be able to access own profile</li>
        </ul>
      </div>
    </div>
  );
}