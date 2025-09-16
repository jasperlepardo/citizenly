'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/data/supabase';
import { useAuth } from '@/contexts';
import { createClient } from '@supabase/supabase-js';

interface DiagnosticResult {
  timestamp: string;
  [key: string]: any;
}

export default function RLSDiagnosticsPage() {
  const { user, session, userProfile } = useAuth();
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [loading, setLoading] = useState(false);

  const adminSupabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! // We'll use anon key since service role isn't available client-side
  );

  const runDeepRLSAnalysis = async () => {
    if (!user || !session) {
      alert('Please ensure you are logged in');
      return;
    }

    setLoading(true);
    
    try {
      console.log('🔍 Deep RLS Analysis Starting...');
      
      // Step 1: RLS Function Tests
      const rlsTests: any = {};
      
      try {
        rlsTests.userAccessLevel = await supabase.rpc('user_access_level');
      } catch (e) {
        rlsTests.userAccessLevel = { data: null, error: { message: 'Function failed: ' + (e as Error).message } };
      }
      
      try {
        rlsTests.userBarangayCode = await supabase.rpc('user_barangay_code');
      } catch (e) {
        rlsTests.userBarangayCode = { data: null, error: { message: 'Function failed: ' + (e as Error).message } };
      }
      
      try {
        rlsTests.userCityCode = await supabase.rpc('user_city_code');
      } catch (e) {
        rlsTests.userCityCode = { data: null, error: { message: 'Function not found or failed' } };
      }

      console.log('🔧 RLS Functions:', rlsTests);

      // Step 2: User Profile Direct Query
      const userProfileDirect = await supabase
        .from('auth_user_profiles')
        .select('id, barangay_code, city_municipality_code, province_code, region_code, role_id')
        .eq('id', user.id)
        .single();

      // Step 3: User queries (with RLS) 
      const userQueries = {
        // Try to get any households
        anyHouseholds: await supabase
          .from('households')
          .select('code, barangay_code')
          .limit(5),
        
        // Try specific barangay filter
        barangayFiltered: await supabase
          .from('households')
          .select('code, barangay_code')
          .eq('barangay_code', rlsTests.userBarangayCode.data)
          .limit(5),
        
        // Try target household
        targetHousehold: await supabase
          .from('households')
          .select('code, barangay_code, created_by')
          .eq('code', '042114014-0000-0001-0001'),
        
        // Test with explicit RLS function calls
        withRLSFunctions: await supabase
          .from('households')
          .select(`
            code, 
            barangay_code,
            user_barangay_code(),
            user_access_level()
          `)
          .eq('code', '042114014-0000-0001-0001')
      };

      // Step 4: Policy Analysis
      const policyAnalysis = {
        userHasCorrectBarangay: userProfile?.barangay_code === '042114014',
        rlsFunctionReturnsCorrectBarangay: rlsTests.userBarangayCode.data === '042114014',
        barangayCodesMatch: rlsTests.userBarangayCode.data === '042114014',
        userCanAccessAnyHouseholds: (userQueries.anyHouseholds.data?.length || 0) > 0,
        targetHouseholdAccessible: (userQueries.targetHousehold.data?.length || 0) > 0,
      };

      // Step 5: Detailed comparison
      const detailedComparison = {
        userProfileBarangay: userProfile?.barangay_code,
        rlsFunctionBarangay: rlsTests.userBarangayCode.data,
        targetHouseholdBarangay: '042114014',
        
        stringComparison: {
          profileVsTarget: userProfile?.barangay_code === '042114014',
          functionVsTarget: rlsTests.userBarangayCode.data === '042114014',
          profileVsFunction: userProfile?.barangay_code === rlsTests.userBarangayCode.data
        },
        
        typeChecks: {
          profileType: typeof userProfile?.barangay_code,
          functionType: typeof rlsTests.userBarangayCode.data,
          profileLength: userProfile?.barangay_code?.length,
          functionLength: rlsTests.userBarangayCode.data?.length
        }
      };

      const result: DiagnosticResult = {
        timestamp: new Date().toISOString(),
        test: 'Deep RLS Analysis',
        userId: user.id,
        sessionValid: !!session?.access_token,
        
        rlsTests: {
          functions: {
            accessLevel: rlsTests.userAccessLevel.data,
            barangayCode: rlsTests.userBarangayCode.data,
            cityCode: rlsTests.userCityCode.data,
          },
          errors: {
            accessLevelError: rlsTests.userAccessLevel.error?.message,
            barangayCodeError: rlsTests.userBarangayCode.error?.message,
            cityCodeError: rlsTests.userCityCode.error?.message,
          }
        },
        
        userProfile: userProfileDirect,
        userQueries,
        policyAnalysis,
        detailedComparison,
        
        diagnosis: {
          issue: policyAnalysis.userHasCorrectBarangay && 
                 policyAnalysis.rlsFunctionReturnsCorrectBarangay && 
                 policyAnalysis.barangayCodesMatch && 
                 !policyAnalysis.userCanAccessAnyHouseholds ?
                 'RLS policy logic error - all conditions met but access denied' :
                 'Need to investigate specific failing component',
          
          possibleCauses: [
            !rlsTests.userAccessLevel.data ? 'user_access_level() returns null' : null,
            !rlsTests.userBarangayCode.data ? 'user_barangay_code() returns null' : null,
            !policyAnalysis.barangayCodesMatch ? 'Barangay codes do not match' : null,
            !detailedComparison.stringComparison.profileVsFunction ? 'Profile and RLS function mismatch' : null,
            policyAnalysis.barangayCodesMatch && !policyAnalysis.userCanAccessAnyHouseholds ? 
              'RLS policy CASE statement or syntax error' : null
          ].filter(Boolean)
        }
      };

      setResults(prev => [...prev, result]);
      console.log('📊 Deep RLS Analysis Result:', result);

    } catch (err) {
      console.error('🚨 Deep RLS Analysis Error:', err);
      setResults(prev => [...prev, {
        timestamp: new Date().toISOString(),
        test: 'Deep RLS Analysis',
        error: err instanceof Error ? err.message : String(err)
      }]);
    } finally {
      setLoading(false);
    }
  };

  const runPolicySimulator = async () => {
    if (!user || !session) {
      alert('Please ensure you are logged in');
      return;
    }

    setLoading(true);
    
    try {
      console.log('🎭 RLS Policy Simulator Starting...');
      
      // Get policy components
      let userAccessLevel: any, userBarangayCode: any;
      
      try {
        userAccessLevel = await supabase.rpc('user_access_level');
      } catch (e) {
        userAccessLevel = { data: null, error: { message: 'Function failed: ' + (e as Error).message } };
      }
      
      try {
        userBarangayCode = await supabase.rpc('user_barangay_code');
      } catch (e) {
        userBarangayCode = { data: null, error: { message: 'Function failed: ' + (e as Error).message } };
      }
      
      // Test different policy approaches
      const policyTests = {
        // Standard query (what's failing)
        standardQuery: await supabase
          .from('households')
          .select('code, barangay_code')
          .eq('code', '042114014-0000-0001-0001'),

        // Query with explicit RLS function calls
        explicitFunctionQuery: await supabase
          .from('households')
          .select(`
            code, 
            barangay_code,
            user_barangay_code(),
            user_access_level()
          `)
          .eq('code', '042114014-0000-0001-0001'),

        // Query all households in the barangay
        allBarangayHouseholds: await supabase
          .from('households')
          .select('code, barangay_code')
          .eq('barangay_code', userBarangayCode.data)
          .limit(3),

        // Check any households at all
        anyHouseholds: await supabase
          .from('households')
          .select('code, barangay_code')
          .limit(1)
      };

      // Manual policy evaluation
      const policyEvaluation = {
        accessLevel: userAccessLevel.data?.level,
        userBarangayCode: userBarangayCode.data,
        targetHouseholdBarangay: '042114014',
        
        barangayCheck: {
          codesMatch: userBarangayCode.data === '042114014',
          shouldAllowAccess: userAccessLevel.data?.level === 'barangay' && userBarangayCode.data === '042114014'
        },
        
        caseStatementEval: {
          levelProperty: userAccessLevel.data?.level,
          expectedByPolicy: 'barangay',
          matches: userAccessLevel.data?.level === 'barangay'
        }
      };

      const result: DiagnosticResult = {
        timestamp: new Date().toISOString(),
        test: 'Policy Simulator',
        userId: user.id,
        
        policyComponents: {
          userAccessLevel: userAccessLevel.data,
          userBarangayCode: userBarangayCode.data,
          errors: {
            accessLevel: userAccessLevel.error?.message,
            barangayCode: userBarangayCode.error?.message
          }
        },
        
        policyEvaluation,
        
        policyTests: {
          standardQuery: {
            count: policyTests.standardQuery.data?.length || 0,
            error: policyTests.standardQuery.error?.message
          },
          explicitFunctionQuery: {
            count: policyTests.explicitFunctionQuery.data?.length || 0,
            data: policyTests.explicitFunctionQuery.data?.[0],
            error: policyTests.explicitFunctionQuery.error?.message
          },
          allBarangayHouseholds: {
            count: policyTests.allBarangayHouseholds.data?.length || 0,
            error: policyTests.allBarangayHouseholds.error?.message
          },
          anyHouseholds: {
            count: policyTests.anyHouseholds.data?.length || 0,
            error: policyTests.anyHouseholds.error?.message
          }
        },
        
        conclusion: {
          shouldWork: policyEvaluation.barangayCheck.shouldAllowAccess,
          actuallyWorks: (policyTests.standardQuery.data?.length || 0) > 0,
          discrepancy: policyEvaluation.barangayCheck.shouldAllowAccess && (policyTests.standardQuery.data?.length || 0) === 0,
          
          mostLikelyCause: policyEvaluation.barangayCheck.shouldAllowAccess && (policyTests.standardQuery.data?.length || 0) === 0 ?
            'RLS policy CASE statement syntax error or function evaluation issue' :
            'Check individual components'
        }
      };

      setResults(prev => [...prev, result]);
      console.log('🎭 Policy Simulator Result:', result);

    } catch (err) {
      console.error('🚨 Policy Simulator Error:', err);
      setResults(prev => [...prev, {
        timestamp: new Date().toISOString(),
        test: 'Policy Simulator',
        error: err instanceof Error ? err.message : String(err)
      }]);
    } finally {
      setLoading(false);
    }
  };

  const clearResults = () => {
    setResults([]);
  };

  if (!user) {
    return (
      <div className="p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">RLS Diagnostics</h1>
          <p>Please log in to run RLS diagnostics.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">🔍 RLS Diagnostics Dashboard</h1>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-6 shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Authentication Status</h2>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium">User ID:</span> {user.id}
          </div>
          <div>
            <span className="font-medium">Session Valid:</span> {session?.access_token ? '✅ Yes' : '❌ No'}
          </div>
          <div>
            <span className="font-medium">Profile Barangay:</span> {userProfile?.barangay_code || 'Not loaded'}
          </div>
          <div>
            <span className="font-medium">Profile Role:</span> {userProfile?.role_id || 'Not loaded'}
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-6 shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Diagnostic Tests</h2>
        <div className="flex flex-wrap gap-4 mb-4">
          <button
            onClick={runDeepRLSAnalysis}
            disabled={loading}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? 'Running...' : 'Deep RLS Analysis'}
          </button>
          
          <button
            onClick={runPolicySimulator}
            disabled={loading}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Running...' : 'Policy Simulator'}
          </button>
          
          <button
            onClick={clearResults}
            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700"
          >
            Clear Results
          </button>
        </div>
        
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Run these tests to diagnose why household access is failing. Results will appear below and in the browser console.
        </p>
      </div>

      {results.length > 0 && (
        <div className="space-y-6">
          {results.map((result, index) => (
            <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-lg">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">{result.test}</h3>
                <span className="text-sm text-gray-500">{result.timestamp}</span>
              </div>
              
              {result.error ? (
                <div className="bg-red-100 dark:bg-red-900 p-4 rounded-lg">
                  <p className="text-red-800 dark:text-red-200 font-medium">Error:</p>
                  <p className="text-red-600 dark:text-red-300">{result.error}</p>
                </div>
              ) : (
                <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg overflow-auto text-xs">
                  {JSON.stringify(result, null, 2)}
                </pre>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}