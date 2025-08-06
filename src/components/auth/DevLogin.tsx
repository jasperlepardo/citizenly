'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import {
  isDevFeatureEnabled,
  getDevCredentials,
  getDemoUserConfig,
  logDevModeWarning,
  validateDevEnvironment,
} from '@/lib/dev-config';

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

  const createDemoUser = async (email: string, password: string, userData: any) => {
    try {
      setMessage(`Creating user: ${email}...`);

      // Try to sign up the user
      const { data: authData, error: authError } = await supabase.auth.signUp({
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
    } catch (error: any) {
      setMessage(`❌ Error with ${email}: ${error.message}`);
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
            .from('user_profiles')
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
    } catch (error: any) {
      setMessage(`❌ Setup failed: ${error.message}`);
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
    } catch (error: any) {
      console.error('Database setup error:', error);
      throw new Error(`Database setup failed: ${error.message}`);
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
    } catch (error: any) {
      setMessage(`❌ Login failed: ${error.message}`);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-surface rounded-lg shadow-md p-6 border border-default">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-primary mb-2">Development Setup</h2>
        <p className="text-secondary text-sm">Create demo users for testing the RBI System</p>
      </div>

      <div className="space-y-4">
        {/* Setup Button */}
        <button
          onClick={setupDemoData}
          disabled={isCreating}
          className="w-full flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-inverse bg-primary hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isCreating ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-3 h-5 w-5 text-inverse"
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
        <div className="border-t border-default pt-4">
          <p className="text-xs text-secondary mb-2">If users already exist:</p>
          <div className="space-y-2">
            <button
              onClick={() => {
                if (devModeAvailable) {
                  const devCredentials = getDevCredentials();
                  directLogin(devCredentials.email);
                }
              }}
              disabled={!devModeAvailable}
              className="w-full px-3 py-2 text-sm border border-default rounded-md hover:bg-surface-hover disabled:bg-background-muted disabled:cursor-not-allowed text-primary"
            >
              Login as Barangay Admin
            </button>
            <button
              onClick={() => directLogin('clerk@gmail.com')}
              className="w-full px-3 py-2 text-sm border border-default rounded-md hover:bg-surface-hover text-primary"
            >
              Login as Clerk
            </button>
          </div>
        </div>

        {/* Status Message */}
        {message && (
          <div className="p-3 bg-surface-hover rounded-md border border-default">
            <p className="text-sm text-primary font-mono">{message}</p>
          </div>
        )}

        {/* Instructions */}
        <div className="text-xs text-secondary space-y-1">
          {!devModeAvailable ? (
            <div className="text-danger">
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
              <p className="text-warning">
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
