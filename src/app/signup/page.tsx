'use client';

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { InputField } from '@/components/molecules';
import { SimpleBarangaySelector } from '@/components/organisms';
import { Button } from '@/components/atoms';
import Link from 'next/link';
import { logger, logError } from '@/lib/secure-logger';
// import { getErrorMessage } from '@/lib/auth-errors';

interface SignupFormData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  mobileNumber: string;
  barangayCode: string;
}

// Profile creation now happens after email confirmation via database trigger
// No need for immediate profile creation during signup

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
  const [_assignedRole, setAssignedRole] = useState<string>('');
  const [submitStatus, setSubmitStatus] = useState<string>('');

  // Barangay admin checking now handled by database trigger after email confirmation

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
      // Step 1: Create auth user with metadata for post-confirmation processing
      setSubmitStatus('Creating your account...');
      console.log('🔄 Attempting signup with email:', formData.email);

      // Check if we're in development mode (disable emails to prevent bounces)
      const isDevelopment = process.env.NODE_ENV === 'development';

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName,
            phone: formData.mobileNumber,
            barangay_code: formData.barangayCode,
            signup_step: 'awaiting_confirmation',
          },
          // In development, don't send confirmation emails
          emailRedirectTo: isDevelopment ? undefined : `${window.location.origin}/auth/callback`,
        },
      });

      console.log('📋 Signup result:', {
        success: !authError,
        hasUser: !!authData.user,
        userId: authData.user?.id,
        error: authError?.message,
        errorCode: authError?.code,
      });

      if (authError || !authData.user) {
        console.error('❌ Signup failed:', {
          error: authError?.message,
          code: authError?.code,
          status: authError?.status,
        });
        throw new Error(authError?.message || 'Failed to create account');
      }

      console.log('✅ Auth user created successfully:', authData.user.id);
      console.log('📧 Email confirmation required:', !authData.user.email_confirmed_at);

      // Signup data is already stored in user metadata during supabase.auth.signUp()
      // Database trigger will process this after email confirmation

      // Success
      setSubmitStatus('Account created successfully!');
      setStep('success');
      setAssignedRole('Barangay Administrator');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setErrors({ general: errorMessage });

      // Log error for debugging
      logError(error instanceof Error ? error : new Error(errorMessage), 'SIGNUP_PROCESS');
    } finally {
      clearTimeout(timeoutId);
      setIsSubmitting(false);
      setSubmitStatus('');
    }
  };

  // Role assignment now handled by database trigger after email confirmation

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
                <h3 className="mb-2 text-sm font-medium text-gray-800">Pending Role Assignment:</h3>
                <p className="text-gray-700">
                  You will be assigned as <strong>Barangay Administrator</strong> once you verify
                  your email address.
                </p>
                <p className="mt-2 text-sm text-gray-600">
                  Your role will be automatically assigned after email verification, allowing you to
                  manage users and data for your barangay.
                </p>
              </div>

              <div className="mt-4 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                <h3 className="mb-2 text-sm font-medium text-yellow-800">Next Steps:</h3>
                <ol className="list-inside list-decimal space-y-1 text-left text-sm text-yellow-700">
                  <li>
                    <strong>Check your email</strong> for a verification link from Citizenly
                  </li>
                  <li>
                    <strong>Click the verification link</strong> to confirm your email address
                  </li>
                  <li>
                    <strong>Your administrator account will be automatically activated</strong>{' '}
                    after verification
                  </li>
                  <li>
                    <strong>Return to login</strong> and access your dashboard
                  </li>
                  <li>
                    <strong>Start managing your barangay</strong> - add residents and data
                  </li>
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
            {/* Status Message */}
            {isSubmitting && submitStatus && (
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                <div className="flex items-center gap-3">
                  <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-blue-600"></div>
                  <div>
                    <h4 className="font-medium text-gray-800">Creating Account</h4>
                    <p className="text-sm text-gray-700">{submitStatus}</p>
                  </div>
                </div>
              </div>
            )}

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
                <h4 className="mb-2 text-sm font-medium text-gray-800">
                  Automatic Role Assignment
                </h4>
                <p className="text-sm text-gray-700">
                  Your role will be automatically assigned based on your barangay:
                </p>
                <ul className="mt-2 list-inside list-disc text-sm text-gray-600">
                  <li>
                    If no administrator exists for your barangay →{' '}
                    <strong>Barangay Administrator</strong>
                  </li>
                  <li>
                    If an administrator already exists → <strong>Registration blocked</strong>
                    <br />
                    <small className="text-gray-500">
                      Contact your barangay admin to be invited to the system
                    </small>
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
              <Link href="/login" className="font-medium text-gray-600 hover:text-gray-500">
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
