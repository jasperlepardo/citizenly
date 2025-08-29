'use client';

import React, { useState, useEffect } from 'react';

import { supabase } from '@/lib/data/supabase';
import {
  isDevFeatureEnabled,
  getDevCredentials,
  getDemoUserConfig,
  logDevModeWarning,
  validateDevEnvironment,
} from '@/lib/config/dev-config';

interface DevLoginProps {
  onSuccess?: () => void;
}

export default function DevLogin({ onSuccess }: DevLoginProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [message, setMessage] = useState('');
  const [devModeAvailable, setDevModeAvailable] = useState(false);
  const [configErrors, setConfigErrors] = useState<string[]>([]);

  useEffect(() => {
    // Check if development features are properly configured
    const validation = validateDevEnvironment();
    setDevModeAvailable(isDevFeatureEnabled() && validation.isValid);
    setConfigErrors(validation.errors);

    if (isDevFeatureEnabled()) {
      logDevModeWarning();
    }
  }, []);

  const createDemoUser = async (
    email: string,
    password: string,
    userData: Record<string, unknown>
  ) => {
    try {
      setMessage(`Creating user: ${email}...`);

      // Try to sign up the user
      const { error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData,
        },
      });

      if (authError) {
        // If user already exists, try to sign in
        if (authError.message.includes('already')) {
          setMessage(`User exists, trying to sign in: ${email}...`);
          const { error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (signInError) {
            throw signInError;
          }

          setMessage(`✅ Signed in successfully: ${email}`);
          return true;
        }
        throw authError;
      }

      setMessage(`✅ Created and signed in: ${email}`);
      return true;
    } catch (error: unknown) {
      setMessage(
        `❌ Error with ${email}: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
      return false;
    }
  };

  const setupDemoData = async () => {
    setIsCreating(true);
    setMessage('Setting up demo authentication...');

    try {
      // First, ensure we have the required data in the database
      const barangayCode = await setupDatabaseData();

      // Get secure development credentials
      const devCredentials = getDevCredentials();
      const demoUserConfig = getDemoUserConfig();

      // Create Barangay Admin user with proper metadata
      const adminSuccess = await createDemoUser(devCredentials.email, devCredentials.password, {
        first_name: demoUserConfig.first_name,
        last_name: demoUserConfig.last_name,
        mobile_number: demoUserConfig.mobile_number,
        barangay_code: barangayCode,
      });

      if (adminSuccess) {
        // After creating the user, we need to approve their barangay account
        setMessage('✅ Setting up admin permissions...');

        // Wait a moment for the user profile to be created
        await new Promise(resolve => setTimeout(resolve, 2000));

        // Get the created user
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          // Update user profile status to active
          await supabase
            .from('auth_user_profiles')
            .update({ status: 'active' })
            .eq('email', devCredentials.email);

          // Update barangay account to active with admin role
          await supabase
            .from('barangay_accounts')
            .update({
              status: 'active',
              role_id: '550e8400-e29b-41d4-a716-446655440002', // barangay_admin
              approved_at: new Date().toISOString(),
              approved_by: user.id,
            })
            .eq('user_id', user.id);
        }

        setMessage('✅ Admin account created and activated!');

        if (onSuccess) {
          setTimeout(() => {
            onSuccess();
          }, 2000);
        }
      }
    } catch (error: unknown) {
      setMessage(`❌ Setup failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsCreating(false);
    }
  };

  const setupDatabaseData = async () => {
    setMessage('Setting up database data...');

    try {
      // Get a sample barangay code for the admin
      const { data: barangayData, error: barangayError } = await supabase
        .from('psgc_barangays')
        .select('code')
        .limit(1)
        .single();

      if (barangayError) {
        console.error('Failed to get barangay:', barangayError);
        throw new Error('Failed to get barangay data');
      }

      const barangayCode = barangayData.code;

      setMessage('✅ Database data ready');
      return barangayCode;
    } catch (error: unknown) {
      console.error('Database setup error:', error);
      throw new Error(
        `Database setup failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  };

  const directLogin = async (email: string) => {
    try {
      if (!devModeAvailable) {
        setMessage('❌ Development mode not properly configured');
        return;
      }

      const devCredentials = getDevCredentials();

      setMessage(`Attempting login: ${email}...`);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password: devCredentials.password,
      });

      if (error) {
        throw error;
      }

      setMessage(`✅ Logged in successfully: ${email}`);
      if (onSuccess) {
        setTimeout(() => {
          onSuccess();
        }, 1000);
      }
    } catch (error: unknown) {
      setMessage(`❌ Login failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  return (
    <div className="mx-auto max-w-md rounded-lg border border-gray-300 bg-white p-6 shadow-md dark:border-gray-600 dark:bg-gray-800">
      <div className="mb-6 text-center">
        <h2 className="mb-2 text-xl font-bold text-gray-600 dark:text-gray-400">
          Development Setup
        </h2>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Create demo users for testing the RBI System
        </p>
      </div>

      <div className="space-y-4">
        {/* Setup Button */}
        <button
          onClick={setupDemoData}
          disabled={isCreating}
          className="text-inverse flex w-full items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-2 text-sm font-medium hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isCreating ? (
            <>
              <svg
                className="text-inverse mr-3 -ml-1 size-5 animate-spin"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Setting up...
            </>
          ) : (
            'Create Demo Users & Login'
          )}
        </button>

        {/* Quick Login Buttons */}
        <div className="border-t border-gray-300 pt-4 dark:border-gray-600">
          <p className="mb-2 text-xs text-gray-600 dark:text-gray-400">If users already exist:</p>
          <div className="space-y-2">
            <button
              onClick={() => {
                if (devModeAvailable) {
                  const devCredentials = getDevCredentials();
                  directLogin(devCredentials.email);
                }
              }}
              disabled={!devModeAvailable}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 disabled:cursor-not-allowed disabled:bg-gray-100 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400"
            >
              Login as Barangay Admin
            </button>
            <button
              onClick={() => directLogin('clerk@gmail.com')}
              className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm text-gray-600 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-400"
            >
              Login as Clerk
            </button>
          </div>
        </div>

        {/* Status Message */}
        {message && (
          <div className="rounded-md border border-gray-300 bg-gray-50 p-3 dark:border-gray-600 dark:bg-gray-700">
            <p className="font-mono text-sm text-gray-600 dark:text-gray-400">{message}</p>
          </div>
        )}

        {/* Instructions */}
        <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
          {!devModeAvailable ? (
            <div className="text-red-600">
              <p>
                <strong>Development Mode Not Available</strong>
              </p>
              {configErrors.map((error, index) => (
                <p key={index}>• {error}</p>
              ))}
              <p className="pt-2">
                Check your .env file configuration and ensure NODE_ENV=development
              </p>
            </div>
          ) : (
            <>
              <p>
                <strong>Development Mode Active</strong>
              </p>
              <p className="text-orange-600">
                <strong>⚠️ Warning:</strong> This should only be used in development!
              </p>
              <p>Credentials are loaded from environment variables</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
