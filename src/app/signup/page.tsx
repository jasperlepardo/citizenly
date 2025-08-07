'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { InputField } from '@/components/molecules';
import { SimpleBarangaySelector } from '@/components/organisms';
import { Button } from '@/components/atoms';
import Link from 'next/link';
import { logger, logError } from '@/lib/secure-logger';

interface SignupFormData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  mobileNumber: string;
  barangayCode: string;
}

export default function SignupPage() {
  const [formData, setFormData] = useState<SignupFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    mobileNumber: '',
    barangayCode: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [assignedRole, setAssignedRole] = useState<string>('');

  const checkBarangayAdminExists = async (barangayCode: string): Promise<boolean> => {
    try {
      logger.debug('Checking for existing barangay admin', { barangayCode });

      const { data, error } = await supabase
        .from('user_profiles')
        .select(
          `
          id,
          roles!inner(name)
        `
        )
        .eq('barangay_code', barangayCode)
        .eq('roles.name', 'barangay_admin')
        .eq('is_active', true);

      if (error) {
        logError(new Error(error.message), 'BARANGAY_ADMIN_CHECK');
        return true; // Assume admin exists if we can't check
      }

      const hasAdmin = data && data.length > 0;
      logger.debug('Barangay admin check completed', { hasAdmin });
      return hasAdmin;
    } catch (error) {
      logError(
        error instanceof Error ? error : new Error('Unknown error checking barangay admin'),
        'BARANGAY_ADMIN_CHECK'
      );
      return true; // Assume admin exists if we can't check
    }
  };

  const handleChange = (field: keyof SignupFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    // Email validation
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password =
        'Password must contain at least one uppercase letter, one lowercase letter, and one number';
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Name validation
    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    // Mobile number validation
    if (!formData.mobileNumber.trim()) {
      newErrors.mobileNumber = 'Mobile number is required';
    } else if (!/^(09|\+639)\d{9}$/.test(formData.mobileNumber.replace(/\s+/g, ''))) {
      newErrors.mobileNumber = 'Please enter a valid Philippine mobile number';
    }

    // Barangay validation
    if (!formData.barangayCode) {
      newErrors.barangayCode = 'Please select your barangay';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    // Add timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      logger.error('Signup process timed out after 30 seconds');
      setIsSubmitting(false);
      setErrors({ general: 'Signup process timed out. Please try again.' });
    }, 30000); // 30 second timeout

    try {
      // Check if barangay already has an admin
      logger.info('Starting signup process - checking for existing admin');
      const hasAdmin = await checkBarangayAdminExists(formData.barangayCode);
      const willBeAdmin = !hasAdmin;
      logger.debug('Role assignment determined', { willBeAdmin });

      // Create auth user
      logger.info('Creating authentication user account');
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
      });

      if (authError) {
        logError(new Error(authError.message), 'AUTH_SIGNUP');
        if (authError.message.includes('already registered')) {
          setErrors({
            general: 'An account with this email already exists. Please sign in instead.',
          });
        } else {
          setErrors({ general: authError.message });
        }
        return;
      }

      if (!authData.user) {
        logger.error('No user data returned from authentication signup');
        setErrors({ general: 'Failed to create account. Please try again.' });
        return;
      }

      logger.info('Authentication user created successfully', { userId: authData.user.id });

      // Get the appropriate role using our function
      logger.info('Assigning user role for barangay');
      const { data: roleData, error: roleError } = await supabase.rpc(
        'assign_user_role_for_barangay',
        {
          p_user_id: authData.user.id,
          p_barangay_code: formData.barangayCode,
        }
      );

      if (roleError) {
        logError(new Error(roleError.message), 'ROLE_ASSIGNMENT');
        logger.info('Using fallback role assignment method');
        // Fallback to manual role assignment
        const { data: roles } = await supabase
          .from('roles')
          .select('id, name')
          .in('name', ['barangay_admin', 'resident']);

        const role = willBeAdmin
          ? roles?.find(r => r.name === 'barangay_admin')
          : roles?.find(r => r.name === 'resident');

        if (!role) {
          logger.error('No valid roles found in fallback assignment');
          setErrors({
            general: 'System error: No valid roles found. Please contact administrator.',
          });
          return;
        }

        // Update roleData to use the role.id from fallback
        const { error: profileError } = await supabase.from('user_profiles').insert({
          id: authData.user.id,
          email: formData.email,
          first_name: formData.firstName,
          last_name: formData.lastName,
          mobile_number: formData.mobileNumber,
          barangay_code: formData.barangayCode,
          role_id: role.id,
          is_active: true,
        });

        if (profileError) {
          logError(new Error(profileError.message), 'PROFILE_CREATION');
          setErrors({
            general: 'Account created but profile setup failed: ' + profileError.message,
          });
          return;
        }

        // Set assigned role for display
        setAssignedRole(willBeAdmin ? 'Barangay Administrator' : 'Resident');
        setStep('success');
        return;
      }

      // Create user profile with successful role assignment
      logger.info('Creating user profile with role assignment');
      const { error: profileError } = await supabase.from('user_profiles').insert({
        id: authData.user.id,
        email: formData.email,
        first_name: formData.firstName,
        last_name: formData.lastName,
        mobile_number: formData.mobileNumber,
        barangay_code: formData.barangayCode,
        role_id: roleData,
        is_active: true,
      });

      if (profileError) {
        logError(new Error(profileError.message), 'PROFILE_CREATION');
        setErrors({ general: 'Account created but profile setup failed: ' + profileError.message });
        return;
      }

      // Set assigned role for display
      logger.info('Signup process completed successfully', {
        assignedRole: willBeAdmin ? 'barangay_admin' : 'resident',
      });
      setAssignedRole(willBeAdmin ? 'Barangay Administrator' : 'Resident');
      setStep('success');
    } catch (error: unknown) {
      logError(
        error instanceof Error ? error : new Error('Unknown signup error'),
        'SIGNUP_PROCESS'
      );
      setErrors({ general: 'An unexpected error occurred. Please try again.' });
    } finally {
      clearTimeout(timeoutId);
      setIsSubmitting(false);
    }
  };

  // No auth loading check needed for signup page

  // Success step
  if (step === 'success') {
    return (
      <div className="flex min-h-screen flex-col justify-center bg-gray-50 py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="rounded-lg bg-white p-8 shadow-md">
            <div className="text-center">
              <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-green-100">
                <svg
                  className="size-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M5 13l4 4L19 7"
                  ></path>
                </svg>
              </div>
              <h2 className="mt-6 text-2xl font-bold text-gray-900">
                Account Created Successfully!
              </h2>

              <div className="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
                <h3 className="mb-2 text-sm font-medium text-blue-800">Your Role Assignment:</h3>
                <p className="text-blue-700">
                  <strong>{assignedRole}</strong>
                </p>
                {assignedRole.includes('Administrator') && (
                  <p className="mt-2 text-sm text-blue-600">
                    You&apos;ve been assigned as the first administrator for this barangay. You can
                    now manage users and data for your barangay.
                  </p>
                )}
              </div>

              <div className="mt-4 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                <h3 className="mb-2 text-sm font-medium text-yellow-800">Next Steps:</h3>
                <ol className="list-inside list-decimal space-y-1 text-left text-sm text-yellow-700">
                  <li>Check your email for a verification link</li>
                  <li>Click the verification link to activate your account</li>
                  <li>Return to login and access your dashboard</li>
                  {assignedRole.includes('Administrator') && (
                    <li>Start adding residents and managing your barangay data</li>
                  )}
                </ol>
              </div>

              <div className="mt-6">
                <Link href="/login">
                  <Button variant="primary" size="regular">
                    Go to Login
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col justify-center bg-gray-50 py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">Create RBI Account</h1>
          <p className="mb-8 text-sm text-gray-600">
            Join the Records of Barangay Inhabitant System
          </p>
        </div>

        <div className="rounded-lg bg-white p-8 shadow-md">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* General Error */}
            {errors.general && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 text-red-600">⚠️</span>
                  <div>
                    <h4 className="font-medium text-red-800">Registration Failed</h4>
                    <p className="text-sm text-red-700">{errors.general}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="border-b pb-2 text-lg font-medium text-gray-900">
                Personal Information
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <InputField
                  id="firstName"
                  type="text"
                  label="First Name *"
                  value={formData.firstName}
                  onChange={e => handleChange('firstName', e.target.value)}
                  placeholder="Juan"
                  errorMessage={errors.firstName}
                  disabled={isSubmitting}
                  autoComplete="given-name"
                  leftIcon={
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                  }
                />
                <InputField
                  id="lastName"
                  type="text"
                  label="Last Name *"
                  value={formData.lastName}
                  onChange={e => handleChange('lastName', e.target.value)}
                  placeholder="Dela Cruz"
                  errorMessage={errors.lastName}
                  disabled={isSubmitting}
                  autoComplete="family-name"
                  leftIcon={
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                  }
                />
              </div>

              <InputField
                id="email"
                type="email"
                label="Email Address *"
                value={formData.email}
                onChange={e => handleChange('email', e.target.value)}
                placeholder="juan.delacruz@gmail.com"
                errorMessage={errors.email}
                helperText="Use a valid email address for account verification"
                disabled={isSubmitting}
                autoComplete="email"
                leftIcon={
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                    <polyline points="22,6 12,13 2,6"></polyline>
                  </svg>
                }
              />

              <InputField
                id="mobileNumber"
                type="tel"
                label="Mobile Number *"
                value={formData.mobileNumber}
                onChange={e => handleChange('mobileNumber', e.target.value)}
                placeholder="09XX XXX XXXX"
                errorMessage={errors.mobileNumber}
                disabled={isSubmitting}
                autoComplete="tel"
                leftIcon={
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                  </svg>
                }
              />
            </div>

            {/* Location Information */}
            <div className="space-y-4">
              <h3 className="border-b pb-2 text-lg font-medium text-gray-900">
                Location Information
              </h3>

              <div>
                <label
                  htmlFor="barangayCode"
                  className="mb-2 block text-sm font-medium text-gray-700"
                >
                  Barangay *
                </label>
                <SimpleBarangaySelector
                  value={formData.barangayCode}
                  onChange={code => handleChange('barangayCode', code)}
                  error={errors.barangayCode}
                  disabled={isSubmitting}
                  placeholder="Search for your barangay..."
                />
              </div>
            </div>

            {/* Barangay Selection Info */}
            <div className="space-y-4">
              <h3 className="border-b pb-2 text-lg font-medium text-gray-900">Role Assignment</h3>
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                <h4 className="mb-2 text-sm font-medium text-blue-800">
                  Automatic Role Assignment
                </h4>
                <p className="text-sm text-blue-700">
                  Your role will be automatically assigned based on your barangay:
                </p>
                <ul className="mt-2 list-inside list-disc text-sm text-blue-600">
                  <li>
                    If no administrator exists for your barangay →{' '}
                    <strong>Barangay Administrator</strong>
                  </li>
                  <li>
                    If an administrator already exists → <strong>Resident</strong>
                  </li>
                </ul>
              </div>
            </div>

            {/* Account Security */}
            <div className="space-y-4">
              <h3 className="border-b pb-2 text-lg font-medium text-gray-900">Account Security</h3>

              <InputField
                id="password"
                type="password"
                label="Password *"
                value={formData.password}
                onChange={e => handleChange('password', e.target.value)}
                placeholder="Create a strong password"
                errorMessage={errors.password}
                disabled={isSubmitting}
                autoComplete="new-password"
                leftIcon={
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <circle cx="12" cy="16" r="1"></circle>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                }
              />

              <InputField
                id="confirmPassword"
                type="password"
                label="Confirm Password *"
                value={formData.confirmPassword}
                onChange={e => handleChange('confirmPassword', e.target.value)}
                placeholder="Confirm your password"
                errorMessage={errors.confirmPassword}
                disabled={isSubmitting}
                autoComplete="new-password"
                leftIcon={
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <circle cx="12" cy="16" r="1"></circle>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                }
              />
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting}
              loading={isSubmitting}
              variant="primary"
              size="regular"
              fullWidth
            >
              Create Account
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{' '}
              <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500">
                Sign in here
              </Link>
            </p>
            <p className="mt-2 text-xs text-gray-500">
              By creating an account, you agree to follow barangay policies and data privacy
              guidelines.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
