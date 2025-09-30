'use client';

import React, { useState } from 'react';

import { useAuth } from '@/contexts/AuthContext';

export default function TestUserPermissions() {
  const { user, userProfile } = useAuth();
  const [apiTest, setApiTest] = useState<string>('');

  const testAPIAccess = async () => {
    if (!user) return;
    
    setApiTest('🧪 Testing API access...\n');
    
    try {
      // First check session state
      const { supabase } = await import('@/lib/data/supabase');
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      let log = `Session Check:
Has session: ${!!session}
Has access token: ${!!session?.access_token}
Token length: ${session?.access_token?.length || 0}
Session error: ${sessionError?.message || 'None'}

`;

      if (!session?.access_token) {
        log += `❌ No valid session - API calls will fail with 401\n`;
        setApiTest(log);
        return;
      }
      
      // Test with fetchWithAuth
      const { fetchWithAuth } = await import('@/utils/auth/sessionManagement');
      const residentId = '745ba3f4-807a-4ae6-a3c1-c57e40ebc9b1';
      
      log += `Using fetchWithAuth for authenticated request...\n`;
      
      const response = await fetchWithAuth(`/api/residents/${residentId}`);
      const result = await response.json();
      
      log += `Resident API Test:
Status: ${response.status} ${response.statusText}
`;
      
      if (response.ok) {
        log += `✅ Success: ${result.message}
Data: ${result.data?.resident ? 'Resident data received' : 'No resident data'}
`;
      } else {
        log += `❌ Failed: ${result.error || 'Unknown error'}
`;
        if (response.status === 401) {
          log += `🔓 Auth Issue: Token might be invalid or middleware not working
`;
        } else if (response.status === 403) {
          log += `🔒 Permission Issue: User authenticated but lacks required permissions
Required: residents.manage.barangay/city/province/region/all
`;
        }
      }
      
      setApiTest(log);
      
    } catch (error) {
      setApiTest(apiTest + `\n❌ API test failed: ${(error as Error).message}`);
    }
  };

  if (!user) {
    return <div className="p-6">Please log in to test permissions.</div>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">🔑 User Permissions Test</h1>
      
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">Current User Info</h2>
        <div className="text-sm space-y-1">
          <div><strong>User ID:</strong> {user.id}</div>
          <div><strong>Role ID:</strong> {userProfile?.role_id}</div>
          <div><strong>Barangay:</strong> {userProfile?.barangay_code}</div>
          <div><strong>Active:</strong> {userProfile?.is_active ? 'Yes' : 'No'}</div>
        </div>
      </div>

      <button 
        onClick={testAPIAccess}
        className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded mb-6"
      >
        Test Resident API Access
      </button>
      
      {apiTest && (
        <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm whitespace-pre-wrap">
          {apiTest}
        </div>
      )}
      
      <div className="mt-6 bg-yellow-50 dark:bg-yellow-900 p-4 rounded-lg">
        <h3 className="font-semibold mb-2">Expected Issue:</h3>
        <p className="text-sm">
          If the API returns 403 Forbidden, the user role doesn't have the required permissions.
          The API requires 'residents.manage.*' permissions, but barangay users might only have 'residents.view.*' permissions.
        </p>
      </div>
    </div>
  );
}