'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function DebugAuthPage() {
  const [status, setStatus] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const addStatus = (message: string) => {
    setStatus(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testSupabaseConnection = async () => {
    setLoading(true);
    setStatus([]);

    try {
      addStatus('🔍 Testing Supabase connection...');

      // Test 1: Basic connection
      addStatus('📡 Testing basic connection...');
      const { error } = await supabase.from('roles').select('count').limit(1);

      if (error) {
        addStatus(`❌ Basic connection failed: ${error.message}`);
        return;
      }

      addStatus('✅ Basic connection successful');

      // Test 2: Check if roles table exists and has data
      addStatus('🔍 Checking roles table...');
      const { data: roles, error: rolesError } = await supabase.from('roles').select('*').limit(5);

      if (rolesError) {
        addStatus(`❌ Roles query failed: ${rolesError.message}`);
      } else {
        addStatus(`✅ Found ${roles?.length || 0} roles in database`);
        if (roles && roles.length > 0) {
          roles.forEach(role => {
            addStatus(`   📋 Role: ${role.name}`);
          });
        }
      }

      // Test 3: Check auth status
      addStatus('🔍 Checking current auth status...');
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        addStatus(`❌ Session check failed: ${sessionError.message}`);
      } else if (session) {
        addStatus(`✅ User is logged in: ${session.user.email}`);
      } else {
        addStatus('ℹ️ No active session found');
      }

      // Test 4: Check user profiles table
      addStatus('🔍 Checking user_profiles table...');
      const { data: profiles, error: profilesError } = await supabase
        .from('user_profiles')
        .select('email, first_name, last_name')
        .limit(5);

      if (profilesError) {
        addStatus(`❌ User profiles query failed: ${profilesError.message}`);
      } else {
        addStatus(`✅ Found ${profiles?.length || 0} user profiles`);
        if (profiles && profiles.length > 0) {
          profiles.forEach(profile => {
            addStatus(
              `   👤 Profile: ${profile.email} (${profile.first_name} ${profile.last_name})`
            );
          });
        }
      }
    } catch (error: any) {
      addStatus(`💥 Unexpected error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testCreateUser = async () => {
    setLoading(true);

    try {
      addStatus('🚀 Attempting to create test user...');

      const testEmail = 'test@gmail.com';
      const testPassword = 'password123';

      // Try to sign up
      const { data, error } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
        options: {
          data: {
            first_name: 'Test',
            last_name: 'User',
          },
        },
      });

      if (error) {
        if (error.message.includes('already registered')) {
          addStatus('ℹ️ User already exists, trying to sign in...');

          // Try to sign in instead
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: testEmail,
            password: testPassword,
          });

          if (signInError) {
            addStatus(`❌ Sign in failed: ${signInError.message}`);
          } else {
            addStatus(`✅ Successfully signed in: ${signInData.user?.email}`);
          }
        } else {
          addStatus(`❌ Sign up failed: ${error.message}`);
        }
      } else {
        addStatus(`✅ Successfully created user: ${data.user?.email}`);
        addStatus('📧 Check your email for confirmation (if email confirmation is enabled)');
      }
    } catch (error: any) {
      addStatus(`💥 Unexpected error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const testSignIn = async () => {
    setLoading(true);

    try {
      addStatus('🔐 Testing sign in with test@gmail.com...');

      const { data, error } = await supabase.auth.signInWithPassword({
        email: 'test@gmail.com',
        password: 'password123',
      });

      if (error) {
        addStatus(`❌ Sign in failed: ${error.message}`);

        // Try with admin@gmail.com
        addStatus('🔐 Trying admin@gmail.com...');
        const { data: adminData, error: adminError } = await supabase.auth.signInWithPassword({
          email: 'admin@gmail.com',
          password: 'password123',
        });

        if (adminError) {
          addStatus(`❌ Admin sign in also failed: ${adminError.message}`);
        } else {
          addStatus(`✅ Admin sign in successful: ${adminData.user?.email}`);
        }
      } else {
        addStatus(`✅ Sign in successful: ${data.user?.email}`);
      }
    } catch (error: any) {
      addStatus(`💥 Unexpected error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const clearStatus = () => {
    setStatus([]);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">🔧 Supabase Auth Debug Tool</h1>

          <div className="space-y-4 mb-6">
            <button
              onClick={testSupabaseConnection}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              Test Supabase Connection
            </button>

            <button
              onClick={testCreateUser}
              disabled={loading}
              className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
            >
              Create Test User
            </button>

            <button
              onClick={testSignIn}
              disabled={loading}
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50"
            >
              Test Sign In
            </button>

            <button
              onClick={clearStatus}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700"
            >
              Clear Log
            </button>
          </div>

          <div className="bg-gray-900 text-green-400 p-4 rounded-md font-mono text-sm max-h-96 overflow-y-auto">
            <div className="mb-2 text-gray-400">Debug Console:</div>
            {status.length === 0 ? (
              <div className="text-gray-500">Click a button above to start testing...</div>
            ) : (
              status.map((line, index) => (
                <div key={index} className="mb-1">
                  {line}
                </div>
              ))
            )}
            {loading && <div className="text-yellow-400">⏳ Running test...</div>}
          </div>

          <div className="mt-6 p-4 bg-blue-50 rounded-md">
            <h3 className="font-medium text-blue-900 mb-2">Environment Info:</h3>
            <div className="text-sm text-blue-800 space-y-1">
              <div>
                <strong>Supabase URL:</strong> {process.env.NEXT_PUBLIC_SUPABASE_URL}
              </div>
              <div>
                <strong>Anon Key:</strong>{' '}
                {process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20)}...
              </div>
            </div>
          </div>

          <div className="mt-4 text-center">
            <a href="/login" className="text-blue-600 hover:text-blue-800 underline">
              ← Back to Login Page
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
