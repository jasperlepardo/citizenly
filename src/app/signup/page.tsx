'use client';

import Link from 'next/link';
import React, { useState, useEffect } from 'react';

import { InputField, SelectField , Button } from '@/components';
import { supabase , logger, logError } from '@/lib';
// import { getErrorMessage } from '@/lib/auth-errors';

interface SignupFormData {
  email: string;
  password: string;
  confirm_password: string;
  first_name: string;
  last_name: string;
  mobile_number: string;
  barangay_code: string;
}

// Profile creation now happens after email confirmation via database trigger
// No need for immediate profile creation during signup

export default function SignupPage() {
  const [formData, setFormData] = useState<SignupFormData>({
    email: '',
    password: '',
    confirm_password: '',
    first_name: '',
    last_name: '',
    mobile_number: '',
    barangay_code: '',
  });
  const [barangayOptions, setBarangayOptions] = useState<{value: string; label: string}[]>([]);
  const [barangayLoading, setBarangayLoading] = useState(false);
  const [barangaySearchTerm, setBarangaySearchTerm] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<'form' | 'success'>('form');
  const [_assignedRole, setAssignedRole] = useState<string>('');
  const [submitStatus, setSubmitStatus] = useState<string>('');

  // Load barangays directly from Supabase (simplified without joins)
  const loadBarangays = async (searchTerm = '') => {
    if (!searchTerm || searchTerm.length < 2) {
      setBarangayOptions([]);
      return;
    }

    try {
      setBarangayLoading(true);
      
      const { data, error } = await supabase
        .from('psgc_barangays')
        .select('code, name')
        .ilike('name', `%${searchTerm}%`)
        .limit(50)
        .order('name');

      if (error) {
        console.error('Error loading barangays:', error);
        return;
      }

      const options = data?.map((item: any) => ({
        value: item.code,
        label: `${item.name} (${item.code})`,
      })) || [];

      setBarangayOptions(options);
    } catch (error) {
      console.error('Error loading barangays:', error);
    } finally {
      setBarangayLoading(false);
    }
  };

  // Search barangays when search term changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadBarangays(barangaySearchTerm);
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [barangaySearchTerm]);

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
    if (!formData.confirm_password) {
      newErrors.confirm_password = 'Please confirm your password';
    } else if (formData.password !== formData.confirm_password) {
      newErrors.confirm_password = 'Passwords do not match';
    }

    // Name validation
    if (!formData.first_name.trim()) {
      newErrors.first_name = 'First name is required';
    }
    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Last name is required';
    }

    // Mobile number validation
    if (!formData.mobile_number.trim()) {
      newErrors.mobile_number = 'Mobile number is required';
    } else if (!/^(09|\+639)\d{9}$/.test(formData.mobile_number.replace(/\s+/g, ''))) {
      newErrors.mobile_number = 'Please enter a valid Philippine mobile number';
    }

    // Barangay validation
    if (!formData.barangay_code) {
      newErrors.barangay_code = 'Please select your barangay';
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
            first_name: formData.first_name,
            last_name: formData.last_name,
            phone: formData.mobile_number,
            barangay_code: formData.barangay_code,
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
      <div className="flex min-h-screen flex-col justify-center bg-gray-50 dark:bg-gray-900 py-12 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="rounded-lg bg-white dark:bg-gray-800 p-8 shadow-md border border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                <svg
                  className="size-6 text-green-600 dark:text-green-400"
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
              <h2 className="mt-6 text-2xl font-bold text-gray-900 dark:text-gray-100">
                Account Created Successfully!
              </h2>

              <div className="mt-4 rounded-lg border border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20 p-4">
                <h3 className="mb-2 text-sm font-medium text-blue-800 dark:text-blue-300">Pending Role Assignment:</h3>
                <p className="text-blue-700 dark:text-blue-400">
                  You will be assigned as <strong>Barangay Administrator</strong> once you verify
                  your email address.
                </p>
                <p className="mt-2 text-sm text-blue-600 dark:text-blue-400">
                  Your role will be automatically assigned after email verification, allowing you to
                  manage users and data for your barangay.
                </p>
              </div>

              <div className="mt-4 rounded-lg border border-yellow-200 dark:border-yellow-700 bg-yellow-50 dark:bg-yellow-900/20 p-4">
                <h3 className="mb-2 text-sm font-medium text-yellow-800 dark:text-yellow-300">Next Steps:</h3>
                <ol className="list-inside list-decimal space-y-1 text-left text-sm text-yellow-700 dark:text-yellow-400">
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
    <div className="flex min-h-screen flex-col justify-center bg-gray-50 dark:bg-gray-900 py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h1 className="mb-2 text-3xl font-bold text-gray-900 dark:text-gray-100">Create RBI Account</h1>
          <p className="mb-8 text-sm text-gray-600 dark:text-gray-400">
            Join the Records of Barangay Inhabitant System
          </p>
        </div>

        <div className="rounded-lg bg-white dark:bg-gray-800 p-8 shadow-md border border-gray-200 dark:border-gray-700">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Status Message */}
            {isSubmitting && submitStatus && (
              <div className="rounded-lg border border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20 p-4">
                <div className="flex items-center gap-3">
                  <div className="h-4 w-4 animate-spin rounded-full border-b-2 border-blue-600 dark:border-blue-400"></div>
                  <div>
                    <h4 className="font-medium text-blue-800 dark:text-blue-300">Creating Account</h4>
                    <p className="text-sm text-blue-700 dark:text-blue-400">{submitStatus}</p>
                  </div>
                </div>
              </div>
            )}

            {/* General Error */}
            {errors.general && (
              <div className="rounded-lg border border-red-200 dark:border-red-700 bg-red-50 dark:bg-red-900/20 p-4">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 text-red-600 dark:text-red-400">⚠️</span>
                  <div>
                    <h4 className="font-medium text-red-800 dark:text-red-300">Registration Failed</h4>
                    <p className="text-sm text-red-700 dark:text-red-400">{errors.general}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="border-b border-gray-200 dark:border-gray-600 pb-2 text-lg font-medium text-gray-900 dark:text-gray-100">
                Personal Information
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <InputField
                  label="First Name"
                  required
                  errorMessage={errors.first_name}
                  inputProps={{
                    id: "first_name",
                    type: "text",
                    value: formData.first_name,
                    onChange: (e: React.ChangeEvent<HTMLInputElement>) => handleChange('first_name', e.target.value),
                    placeholder: "Juan",
                    disabled: isSubmitting,
                    autoComplete: "given-name",
                    leftIcon: (
                      <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    )
                  }}
                />
                <InputField
                  label="Last Name"
                  required
                  errorMessage={errors.last_name}
                  inputProps={{
                    id: "last_name",
                    type: "text",
                    value: formData.last_name,
                    onChange: (e: React.ChangeEvent<HTMLInputElement>) => handleChange('last_name', e.target.value),
                    placeholder: "Dela Cruz",
                    disabled: isSubmitting,
                    autoComplete: "family-name",
                    leftIcon: (
                      <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    )
                  }}
                />
              </div>

              <InputField
                label="Email Address"
                required
                errorMessage={errors.email}
                helperText="Use a valid email address for account verification"
                inputProps={{
                  id: "email",
                  type: "email",
                  value: formData.email,
                  onChange: (e: React.ChangeEvent<HTMLInputElement>) => handleChange('email', e.target.value),
                  placeholder: "juan.delacruz@gmail.com",
                  disabled: isSubmitting,
                  autoComplete: "email",
                  leftIcon: (
                    <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                      <polyline points="22,6 12,13 2,6"></polyline>
                    </svg>
                  )
                }}
              />

              <InputField
                label="Mobile Number"
                required
                errorMessage={errors.mobile_number}
                inputProps={{
                  id: "mobileNumber",
                  type: "tel",
                  value: formData.mobile_number,
                  onChange: (e: React.ChangeEvent<HTMLInputElement>) => handleChange('mobile_number', e.target.value),
                  placeholder: "09XX XXX XXXX",
                  disabled: isSubmitting,
                  autoComplete: "tel",
                  leftIcon: (
                    <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                  )
                }}
              />
            </div>

            {/* Location Information */}
            <div className="space-y-4">
              <h3 className="border-b border-gray-200 dark:border-gray-600 pb-2 text-lg font-medium text-gray-900 dark:text-gray-100">
                Location Information
              </h3>

              <SelectField
                label="Barangay"
                required
                errorMessage={errors.barangay_code}
                selectProps={{
                  placeholder: "Search and select your barangay...",
                  options: barangayOptions,
                  value: formData.barangay_code,
                  onSelect: (option) => handleChange('barangay_code', option?.value || ''),
                  onSearch: (query) => setBarangaySearchTerm(query),
                  loading: barangayLoading,
                  disabled: isSubmitting || barangayLoading,
                  error: errors.barangay_code,
                  searchable: true
                }}
              />
            </div>

            {/* Barangay Selection Info */}
            <div className="space-y-4">
              <h3 className="border-b border-gray-200 dark:border-gray-600 pb-2 text-lg font-medium text-gray-900 dark:text-gray-100">Role Assignment</h3>
              <div className="rounded-lg border border-blue-200 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20 p-4">
                <h4 className="mb-2 text-sm font-medium text-blue-800 dark:text-blue-300">
                  Automatic Role Assignment
                </h4>
                <p className="text-sm text-blue-700 dark:text-blue-400">
                  Your role will be automatically assigned based on your barangay:
                </p>
                <ul className="mt-2 list-inside list-disc text-sm text-blue-600 dark:text-blue-400">
                  <li>
                    If no administrator exists for your barangay →{' '}
                    <strong>Barangay Administrator</strong>
                  </li>
                  <li>
                    If an administrator already exists → <strong>Registration blocked</strong>
                    <br />
                    <small className="text-blue-500 dark:text-blue-500">
                      Contact your barangay admin to be invited to the system
                    </small>
                  </li>
                </ul>
              </div>
            </div>

            {/* Account Security */}
            <div className="space-y-4">
              <h3 className="border-b border-gray-200 dark:border-gray-600 pb-2 text-lg font-medium text-gray-900 dark:text-gray-100">Account Security</h3>

              <InputField
                label="Password"
                required
                errorMessage={errors.password}
                inputProps={{
                  id: "password",
                  type: "password",
                  value: formData.password,
                  onChange: (e: React.ChangeEvent<HTMLInputElement>) => handleChange('password', e.target.value),
                  placeholder: "Create a strong password",
                  disabled: isSubmitting,
                  autoComplete: "new-password",
                  showPasswordToggle: true,
                  leftIcon: (
                    <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                      <circle cx="12" cy="16" r="1"></circle>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                  )
                }}
              />

              <InputField
                label="Confirm Password"
                required
                errorMessage={errors.confirm_password}
                inputProps={{
                  id: "confirmPassword",
                  type: "password",
                  value: formData.confirm_password,
                  onChange: (e: React.ChangeEvent<HTMLInputElement>) => handleChange('confirm_password', e.target.value),
                  placeholder: "Confirm your password",
                  disabled: isSubmitting,
                  autoComplete: "new-password",
                  showPasswordToggle: true,
                  leftIcon: (
                    <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                      <circle cx="12" cy="16" r="1"></circle>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                  )
                }}
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
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Already have an account?{' '}
              <Link href="/login" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400 dark:hover:text-blue-300">
                Sign in here
              </Link>
            </p>
            <p className="mt-2 text-xs text-gray-500 dark:text-gray-500">
              By creating an account, you agree to follow barangay policies and data privacy
              guidelines.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
