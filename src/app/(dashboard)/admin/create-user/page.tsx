'use client';

import Link from 'next/link';
import React, { useState, useEffect } from 'react';

import { InputField, SelectField } from '@/components';
import { useGenericFormSubmission } from '@/hooks/utilities';
import { supabase } from '@/lib/data/supabase';
import { clientLogger, logError } from '@/lib/logging/client-logger';
// Note: createFieldChangeHandler removed - using inline form handling

export const dynamic = 'force-dynamic';

interface CreateUserFormData {
  email: string;
  password: string;
  confirm_password: string;
  first_name: string;
  last_name: string;
  mobile_number: string;
  barangay_code: string;
  role_id: string;
}

// Local Role interface for admin role selection (simpler than full AuthRole)
interface Role {
  id: string;
  name: string;
  description: string;
}

function CreateUserContent() {
  const [formData, setFormData] = useState<CreateUserFormData>({
    email: '',
    password: '',
    confirm_password: '',
    first_name: '',
    last_name: '',
    mobile_number: '',
    barangay_code: '',
    role_id: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [roles, setRoles] = useState<Role[]>([]);
  const [loadingRoles, setLoadingRoles] = useState(true);
  const [success, setSuccess] = useState(false);

  // Barangay search state
  const [barangayOptions, setBarangayOptions] = useState<
    { value: string; label: string; description: string }[]
  >([]);
  const [barangayLoading, setBarangayLoading] = useState(false);

  interface CreatedUser {
    email: string;
    name: string;
    role: string;
  }
  const [createdUser, setCreatedUser] = useState<CreatedUser | null>(null);

  // Handle barangay search
  const handleBarangaySearch = async (query: string) => {
    if (!query.trim() || query.length < 2) {
      setBarangayOptions([]);
      return;
    }

    setBarangayLoading(true);
    try {
      const response = await fetch(
        `/api/psgc/search?q=${encodeURIComponent(query)}&levels=barangay&limit=20`
      );
      if (response.ok) {
        const data = await response.json();
        const formattedOptions = (data.data || []).map(
          (item: {
            barangay_code?: string;
            code?: string;
            barangay_name?: string;
            name?: string;
            full_address?: string;
            city_name?: string;
            province_name?: string;
          }) => ({
            value: item.barangay_code || item.code,
            label: item.barangay_name || item.name,
            description:
              item.full_address || `${item.name} - ${item.city_name}, ${item.province_name}`,
          })
        );
        setBarangayOptions(formattedOptions);
      } else {
        setBarangayOptions([]);
      }
    } catch (error) {
      console.error('Barangay search error:', error);
      setBarangayOptions([]);
    } finally {
      setBarangayLoading(false);
    }
  };

  // Load available roles
  useEffect(() => {
    loadRoles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadRoles = async () => {
    try {
      setLoadingRoles(true);

      const { data, error } = await supabase
        .from('auth_roles')
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
          setFormData(prev => ({ ...prev, role_id: residentRole.id }));
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

  // Use consolidated form handler - eliminates 7 lines of duplicate code
  // Inline form change handler
  const handleChange = (field: keyof CreateUserFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setErrors(prev => ({ ...prev, [field as string]: '' }));
  };

  // Use consolidated form submission hook
  const { isSubmitting, handleSubmit } = useGenericFormSubmission<CreateUserFormData>({
    onSubmit: async (data: CreateUserFormData) => {
      clientLogger.info('Starting user account creation process', { component: 'CreateUserPage', action: 'user_creation_start' });

      // Use API endpoint instead of direct inserts
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error('Authentication required. Please log in again.');
      }

      const adminUserData = {
        email: data.email,
        password: data.password,
        first_name: data.first_name,
        last_name: data.last_name,
        barangay_code: data.barangay_code,
        role_id: data.role_id,
      };

      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(adminUserData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || `HTTP ${response.status}: ${response.statusText}`;
        logError(new Error(errorMessage), 'ADMIN_USER_CREATION');
        throw new Error('Failed to create user: ' + errorMessage);
      }

      const { user: createdUser } = await response.json();
      clientLogger.info('User created successfully via API', { component: 'CreateUserPage', action: 'user_created', data: { userId: createdUser.id } });

      // Success!
      setCreatedUser({
        email: data.email,
        name: `${data.first_name} ${data.last_name}`,
        role: roles.find(r => r.id === data.role_id)?.name || 'resident',
      });
    },
    validate: (data: CreateUserFormData) => {
      const newErrors: Record<string, string> = {};

      // Email validation
      if (!data.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        newErrors.email = 'Please enter a valid email address';
      }

      // Password validation
      if (!data.password) {
        newErrors.password = 'Password is required';
      } else if (data.password.length < 8) {
        newErrors.password = 'Password must be at least 8 characters';
      }

      // Confirm password validation
      if (!data.confirm_password) {
        newErrors.confirm_password = 'Please confirm the password';
      } else if (data.password !== data.confirm_password) {
        newErrors.confirm_password = 'Passwords do not match';
      }

      // Name validation
      if (!data.first_name.trim()) {
        newErrors.first_name = 'First name is required';
      }
      if (!data.last_name.trim()) {
        newErrors.last_name = 'Last name is required';
      }

      // Mobile number validation
      if (!data.mobile_number.trim()) {
        newErrors.mobile_number = 'Mobile number is required';
      } else if (!/^(09|\+639)\d{9}$/.test(data.mobile_number.replace(/\s+/g, ''))) {
        newErrors.mobile_number = 'Please enter a valid Philippine mobile number';
      }

      // Barangay validation
      if (!data.barangay_code) {
        newErrors.barangay_code = 'Please select a barangay';
      }

      // Role validation
      if (!data.role_id) {
        newErrors.role_id = 'Please select a role';
      }

      return {
        isValid: Object.keys(newErrors).length === 0,
        errors: newErrors,
      };
    },
    onSuccess: () => {
      setSuccess(true);
    },
    onError: (error: Error) => {
      setErrors({ general: error.message });
    },
  });

  const resetForm = () => {
    setFormData({
      email: '',
      password: '',
      confirm_password: '',
      first_name: '',
      last_name: '',
      mobile_number: '',
      barangay_code: '',
      role_id: roles.find(r => r.name === 'resident')?.id || '',
    });
    setErrors({});
    setSuccess(false);
    setCreatedUser(null);
  };

  if (success) {
    return (
      <div className="flex flex-col gap-6 p-6">
        <div className="mx-auto max-w-2xl">
          <div className="rounded-lg border border-gray-200 bg-white p-8 shadow-md dark:border-gray-700 dark:bg-gray-800">
            <div className="text-center">
              <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
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
              <h2 className="mb-4 text-2xl font-bold text-gray-600 dark:text-gray-300">
                User Created Successfully!
              </h2>
              <div className="mb-6 rounded-lg border border-green-200 bg-green-50 p-4 dark:border-green-700 dark:bg-green-900/20">
                <h3 className="mb-2 text-sm font-medium text-green-800 dark:text-green-300">
                  User Details:
                </h3>
                <div className="space-y-1 text-sm text-green-700 dark:text-green-400">
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
              <div className="flex justify-center gap-3">
                <button
                  onClick={resetForm}
                  className="rounded-md bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-hidden dark:focus:ring-offset-gray-800"
                >
                  Create Another User
                </button>
                <Link
                  href="/admin/users"
                  className="rounded-md bg-gray-600 px-4 py-2 text-white hover:bg-gray-700 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:outline-hidden dark:focus:ring-offset-gray-800"
                >
                  View All Users
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex w-full flex-row items-start justify-between gap-4">
        <div className="flex flex-col gap-0.5">
          <h1 className="font-montserrat text-xl font-semibold text-gray-600 dark:text-gray-400">
            Create New User
          </h1>
          <p className="font-montserrat text-sm font-normal text-gray-600 dark:text-gray-400">
            Create a new user account for your barangay
          </p>
        </div>
        <Link href="/admin/users">
          <button className="rounded-md bg-gray-600 px-4 py-2 text-white hover:bg-gray-700 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:outline-hidden dark:focus:ring-offset-gray-900">
            Back to Users
          </button>
        </Link>
      </div>

      <div className="mx-auto w-full max-w-2xl">
        <div className="rounded-lg border border-gray-200 bg-white p-8 shadow-md dark:border-gray-700 dark:bg-gray-800">
          <form onSubmit={e => handleSubmit(e, formData)} className="space-y-6">
            {/* General Error */}
            {errors.general && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-700 dark:bg-red-900/20">
                <div className="flex items-start gap-3">
                  <span className="mt-0.5 text-red-600 dark:text-red-400">⚠️</span>
                  <div>
                    <h4 className="font-medium text-red-800 dark:text-red-300">
                      User Creation Failed
                    </h4>
                    <p className="text-sm text-red-700 dark:text-red-400">{errors.general}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="border-b pb-2 text-lg font-medium text-gray-600 dark:text-gray-400">
                Personal Information
              </h3>

              <div className="grid grid-cols-2 gap-4">
                <InputField
                  label="First Name"
                  required
                  errorMessage={errors.first_name}
                  inputProps={{
                    id: 'first_name',
                    type: 'text',
                    value: formData.first_name,
                    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
                      handleChange('first_name', e.target.value),
                    placeholder: 'Juan',
                    disabled: isSubmitting,
                    autoComplete: 'given-name',
                    leftIcon: (
                      <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    ),
                  }}
                />
                <InputField
                  label="Last Name"
                  required
                  errorMessage={errors.last_name}
                  inputProps={{
                    id: 'last_name',
                    type: 'text',
                    value: formData.last_name,
                    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
                      handleChange('last_name', e.target.value),
                    placeholder: 'Dela Cruz',
                    disabled: isSubmitting,
                    autoComplete: 'family-name',
                    leftIcon: (
                      <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                    ),
                  }}
                />
              </div>

              <div>
                <InputField
                  label="Email Address"
                  required
                  errorMessage={errors.email}
                  helperText="User will receive login credentials at this email"
                  inputProps={{
                    id: 'email',
                    type: 'email',
                    value: formData.email,
                    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
                      handleChange('email', e.target.value),
                    placeholder: 'juan.delacruz@gmail.com',
                    disabled: isSubmitting,
                    autoComplete: 'email',
                    leftIcon: (
                      <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                        <polyline points="22,6 12,13 2,6"></polyline>
                      </svg>
                    ),
                  }}
                />
              </div>

              <InputField
                label="Mobile Number"
                required
                errorMessage={errors.mobile_number}
                inputProps={{
                  id: 'mobile_number',
                  type: 'tel',
                  value: formData.mobile_number,
                  onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
                    handleChange('mobile_number', e.target.value),
                  placeholder: '09XX XXX XXXX',
                  disabled: isSubmitting,
                  autoComplete: 'tel',
                  leftIcon: (
                    <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                      />
                    </svg>
                  ),
                }}
              />
            </div>

            {/* Location Information */}
            <div className="space-y-4">
              <h3 className="border-b pb-2 text-lg font-medium text-gray-600 dark:text-gray-400">
                Location Information
              </h3>

              <SelectField
                label="Barangay *"
                required
                selectProps={{
                  placeholder: "Search for the user's barangay...",
                  options: barangayOptions,
                  value: formData.barangay_code,
                  onSelect: option => handleChange('barangay_code', option?.value || ''),
                  onSearch: handleBarangaySearch,
                  loading: barangayLoading,
                  disabled: isSubmitting,
                  error: errors.barangay_code,
                  searchable: true,
                }}
                errorMessage={errors.barangay_code}
              />
            </div>

            {/* Role Selection */}
            <div className="space-y-4">
              <h3 className="border-b pb-2 text-lg font-medium text-gray-600 dark:text-gray-400">
                Account Type
              </h3>

              {loadingRoles ? (
                <div className="space-y-2">
                  <label
                    htmlFor="role-loading"
                    className="block text-sm font-medium text-gray-600 dark:text-gray-400"
                  >
                    Role *
                  </label>
                  <div className="rounded-md border border-gray-300 bg-gray-50 p-3 dark:border-gray-600 dark:bg-gray-700">
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      Loading roles...
                    </span>
                  </div>
                </div>
              ) : (
                <SelectField
                  label="Role *"
                  required
                  errorMessage={errors.role_id}
                  helperText="Select the role that best describes the user's position"
                  selectProps={{
                    options: [
                      { value: '', label: 'Select user role...' },
                      ...roles.map(role => ({
                        value: role.id,
                        label: `${role.name.charAt(0).toUpperCase() + role.name.slice(1).replace('_', ' ')} - ${role.description}`,
                      })),
                    ],
                    value: formData.role_id,
                    onSelect: option => handleChange('role_id', option?.value || ''),
                    disabled: isSubmitting,
                    placeholder: 'Select user role...',
                  }}
                />
              )}
            </div>

            {/* Account Security */}
            <div className="space-y-4">
              <h3 className="border-b pb-2 text-lg font-medium text-gray-600 dark:text-gray-400">
                Account Security
              </h3>

              <InputField
                label="Password"
                required
                errorMessage={errors.password}
                inputProps={{
                  id: 'password',
                  type: 'password',
                  value: formData.password,
                  onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
                    handleChange('password', e.target.value),
                  placeholder: 'Create a password for the user',
                  disabled: isSubmitting,
                  autoComplete: 'new-password',
                  showPasswordToggle: true,
                  leftIcon: (
                    <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                      <circle cx="12" cy="16" r="1"></circle>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                  ),
                }}
              />

              <InputField
                label="Confirm Password"
                required
                errorMessage={errors.confirm_password}
                inputProps={{
                  id: 'confirm_password',
                  type: 'password',
                  value: formData.confirm_password,
                  onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
                    handleChange('confirm_password', e.target.value),
                  placeholder: 'Confirm the password',
                  disabled: isSubmitting,
                  autoComplete: 'new-password',
                  showPasswordToggle: true,
                  leftIcon: (
                    <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                      <circle cx="12" cy="16" r="1"></circle>
                      <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                    </svg>
                  ),
                }}
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex w-full items-center justify-center rounded-md border border-transparent bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:outline-hidden disabled:cursor-not-allowed disabled:opacity-50 dark:focus:ring-offset-gray-800"
            >
              {isSubmitting ? (
                <>
                  <svg
                    className="mr-3 -ml-1 size-5 animate-spin text-white"
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
  );
}

export default function CreateUserPage() {
  return <CreateUserContent />;
}
