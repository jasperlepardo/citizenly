'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { InputField, DropdownSelect } from '@/components/molecules';
import { BarangaySelector } from '@/components/organisms';
import { AppShell } from '@/components/templates';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { logger, logError } from '@/lib/secure-logger';

export const dynamic = 'force-dynamic';

interface CreateUserFormData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
  mobileNumber: string;
  barangayCode: string;
  roleId: string;
}

interface Role {
  id: string;
  name: string;
  description?: string;
}

function CreateUserContent() {
  const { user: currentUser } = useAuth();
  const [formData, setFormData] = useState<CreateUserFormData>({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    mobileNumber: '',
    barangayCode: '',
    roleId: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [roles, setRoles] = useState<Role[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [success, setSuccess] = useState(false);
  interface CreatedUser {
    email: string;
    name: string;
    role: string;
  }
  const [createdUser, setCreatedUser] = useState<CreatedUser | null>(null);

  // Load available roles
  useEffect(() => {
    loadRoles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadRoles = async () => {
    try {
      setLoadingRoles(true);

      const { data, error } = await supabase
        .from('roles')
        .select('id, name, permissions')
        .in('name', ['resident', 'clerk']) // Admins can only create residents and clerks
        .order('name', { ascending: true });

      if (error) {
        logError(new Error(error.message), 'ROLES_LOAD');
        // Set default roles if loading fails
        setRoles([{ id: 'default-resident', name: 'resident', description: 'Barangay resident' }]);
      } else {
        const formattedRoles = data.map(role => ({
          id: role.id,
          name: role.name,
          description: getRoleDescription(role.name),
        }));
        setRoles(formattedRoles);

        // Set default role to resident if available
        const residentRole = formattedRoles.find(r => r.name === 'resident');
        if (residentRole) {
          setFormData(prev => ({ ...prev, roleId: residentRole.id }));
        }
      }
    } catch (error) {
      logError(
        error instanceof Error ? error : new Error('Unknown error loading roles'),
        'ROLES_LOAD'
      );
      setRoles([{ id: 'default-resident', name: 'resident', description: 'Barangay resident' }]);
    } finally {
      setLoadingRoles(false);
    }
  };

  const getRoleDescription = (roleName: string) => {
    switch (roleName) {
      case 'resident':
        return 'Barangay resident with basic access';
      case 'clerk':
        return 'Data entry clerk with resident management access';
      default:
        return 'System user';
    }
  };

  const handleChange = (field: keyof CreateUserFormData, value: string) => {
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
    }

    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm the password';
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
      newErrors.barangayCode = 'Please select a barangay';
    }

    // Role validation
    if (!formData.roleId) {
      newErrors.roleId = 'Please select a role';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      logger.info('Starting user account creation process');

      // Create auth user using admin privileges
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: formData.email,
        password: formData.password,
        email_confirm: true, // Auto-confirm email
        user_metadata: {
          first_name: formData.firstName,
          last_name: formData.lastName,
          mobile_number: formData.mobileNumber,
          barangay_code: formData.barangayCode,
          created_by: currentUser?.id,
        },
      });

      if (authError) {
        logError(new Error(authError.message), 'AUTH_USER_CREATION');
        if (authError.message.includes('already registered')) {
          setErrors({ general: 'An account with this email already exists.' });
        } else {
          setErrors({ general: authError.message });
        }
        return;
      }

      if (!authData.user) {
        setErrors({ general: 'Failed to create user account. Please try again.' });
        return;
      }

      logger.info('Authentication user created successfully', { userId: authData.user.id });

      // Create user profile in database
      const profileData = {
        id: authData.user.id,
        email: formData.email,
        first_name: formData.firstName,
        last_name: formData.lastName,
        mobile_number: formData.mobileNumber,
        barangay_code: formData.barangayCode,
        role_id: formData.roleId,
        status: 'active', // Admin-created users are automatically active
      };

      logger.debug('Creating user profile with data');

      const { error: profileError } = await supabase.from('user_profiles').insert(profileData);

      if (profileError) {
        logError(new Error(profileError.message), 'PROFILE_CREATION');
        setErrors({
          general: 'User account created but profile setup failed: ' + profileError.message,
        });
        return;
      }

      logger.info('User profile created successfully');

      // Create barangay account
      const { error: barangayAccountError } = await supabase.from('barangay_accounts').insert({
        user_id: authData.user.id,
        barangay_code: formData.barangayCode,
        role_id: formData.roleId,
        status: 'active', // Admin-created accounts are automatically active
        approved_by: currentUser?.id,
        approved_at: new Date().toISOString(),
      });

      if (barangayAccountError) {
        logError(new Error(barangayAccountError.message), 'BARANGAY_ACCOUNT_CREATION');
        // Don't fail if barangay_accounts table doesn't exist
        if (!barangayAccountError.message.includes('does not exist')) {
          logger.warn('Barangay account creation failed, but continuing with user creation');
        }
      } else {
        logger.info('Barangay account created successfully');
      }

      // Success!
      setCreatedUser({
        email: formData.email,
        name: `${formData.firstName} ${formData.lastName}`,
        role: roles.find(r => r.id === formData.roleId)?.name || 'resident',
      });
      setSuccess(true);
    } catch (error) {
      logError(
        error instanceof Error ? error : new Error('Unknown user creation error'),
        'USER_CREATION'
      );
      setErrors({ general: 'An unexpected error occurred: ' + error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      confirmPassword: '',
      firstName: '',
      lastName: '',
      mobileNumber: '',
      barangayCode: '',
      roleId: roles.find(r => r.name === 'resident')?.id || '',
    });
    setErrors({});
    setSuccess(false);
    setCreatedUser(null);
  };

  if (success) {
    return (
      <AppShell>
        <div className="flex flex-col gap-6 p-6">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-8">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                  <svg
                    className="h-6 w-6 text-green-600"
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
                <h2 className="text-2xl font-bold text-primary mb-4">User Created Successfully!</h2>
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                  <h3 className="text-sm font-medium text-green-800 mb-2">User Details:</h3>
                  <div className="text-sm text-green-700 space-y-1">
                    <p>
                      <strong>Name:</strong> {createdUser?.name}
                    </p>
                    <p>
                      <strong>Email:</strong> {createdUser?.email}
                    </p>
                    <p>
                      <strong>Role:</strong> {createdUser?.role}
                    </p>
                    <p>
                      <strong>Status:</strong> Active (ready to login)
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={resetForm}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Create Another User
                  </button>
                  <Link
                    href="/admin/users"
                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                  >
                    View All Users
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell>
      <div className="flex flex-col gap-6 p-6">
        <div className="flex flex-row gap-4 items-start justify-between w-full">
          <div className="flex flex-col gap-0.5">
            <h1 className="font-montserrat font-semibold text-xl text-primary">Create New User</h1>
            <p className="font-montserrat font-normal text-sm text-secondary">
              Create a new user account for your barangay
            </p>
          </div>
          <Link href="/admin/users">
            <button className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700">
              Back to Users
            </button>
          </Link>
        </div>

        <div className="max-w-2xl mx-auto w-full">
          <div className="bg-white rounded-lg shadow-md p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* General Error */}
              {errors.general && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <span className="text-red-600 mt-0.5">⚠️</span>
                    <div>
                      <h4 className="text-red-800 font-medium">User Creation Failed</h4>
                      <p className="text-red-700 text-sm">{errors.general}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-primary border-b pb-2">
                  Personal Information
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <InputField
                    label="First Name *"
                    id="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={e => handleChange('firstName', e.target.value)}
                    placeholder="Juan"
                    errorMessage={errors.firstName}
                    disabled={isSubmitting}
                    autoComplete="given-name"
                  />
                  <InputField
                    label="Last Name *"
                    id="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={e => handleChange('lastName', e.target.value)}
                    placeholder="Dela Cruz"
                    errorMessage={errors.lastName}
                    disabled={isSubmitting}
                    autoComplete="family-name"
                  />
                </div>

                <div>
                  <InputField
                    label="Email Address *"
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={e => handleChange('email', e.target.value)}
                    placeholder="juan.delacruz@gmail.com"
                    errorMessage={errors.email}
                    disabled={isSubmitting}
                    autoComplete="email"
                    helperText="User will receive login credentials at this email"
                  />
                </div>

                <InputField
                  label="Mobile Number *"
                  id="mobileNumber"
                  type="tel"
                  value={formData.mobileNumber}
                  onChange={e => handleChange('mobileNumber', e.target.value)}
                  placeholder="09XX XXX XXXX"
                  errorMessage={errors.mobileNumber}
                  disabled={isSubmitting}
                  autoComplete="tel"
                />
              </div>

              {/* Location Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-primary border-b pb-2">
                  Location Information
                </h3>

                <div>
                  <label
                    htmlFor="barangayCode"
                    className="block text-sm font-medium text-secondary mb-2"
                  >
                    Barangay *
                  </label>
                  <BarangaySelector
                    value={formData.barangayCode}
                    onChange={code => handleChange('barangayCode', code)}
                    error={errors.barangayCode}
                    disabled={isSubmitting}
                    placeholder="Search for the user's barangay..."
                  />
                </div>
              </div>

              {/* Role Selection */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-primary border-b pb-2">Account Type</h3>

                {loadingRoles ? (
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-secondary">Role *</label>
                    <div className="p-3 border border-gray-300 rounded-md bg-gray-50">
                      <span className="text-sm text-muted">Loading roles...</span>
                    </div>
                  </div>
                ) : (
                  <DropdownSelect
                    label="Role *"
                    options={[
                      { value: '', label: 'Select user role...' },
                      ...roles.map(role => ({
                        value: role.id,
                        label: `${role.name.charAt(0).toUpperCase() + role.name.slice(1).replace('_', ' ')} - ${role.description}`,
                      })),
                    ]}
                    value={formData.roleId}
                    onChange={val => handleChange('roleId', val)}
                    errorMessage={errors.roleId}
                    helperText="Select the role that best describes the user's position"
                    disabled={isSubmitting}
                  />
                )}
              </div>

              {/* Account Security */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-primary border-b pb-2">Account Security</h3>

                <InputField
                  label="Password *"
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={e => handleChange('password', e.target.value)}
                  placeholder="Create a password for the user"
                  errorMessage={errors.password}
                  disabled={isSubmitting}
                  autoComplete="new-password"
                />

                <InputField
                  label="Confirm Password *"
                  id="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={e => handleChange('confirmPassword', e.target.value)}
                  placeholder="Confirm the password"
                  errorMessage={errors.confirmPassword}
                  disabled={isSubmitting}
                  autoComplete="new-password"
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                    Creating User...
                  </>
                ) : (
                  'Create User Account'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </AppShell>
  );
}

export default function CreateUserPage() {
  return (
    <ProtectedRoute requirePermission="manage_users">
      <CreateUserContent />
    </ProtectedRoute>
  );
}
