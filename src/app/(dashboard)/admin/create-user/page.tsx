'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib';
import { InputField, SelectField } from '@/components';
import Link from 'next/link';
import { logger, logError } from '@/lib';

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
  
  // Barangay search state
  const [barangayOptions, setBarangayOptions] = useState<any[]>([]);
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
      const response = await fetch(`/api/psgc/search?q=${encodeURIComponent(query)}&levels=barangay&limit=20`);
      if (response.ok) {
        const data = await response.json();
        const formattedOptions = (data.data || []).map((item: any) => ({
          value: item.barangay_code || item.code,
          label: item.barangay_name || item.name,
          description: item.full_address || `${item.name} - ${item.city_name}, ${item.province_name}`
        }));
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

      logger.debug('Creating user via admin API');

      // Use API endpoint instead of direct inserts
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        setErrors({ general: 'Authentication required. Please log in again.' });
        return;
      }

      const adminUserData = {
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName,
        barangayCode: formData.barangayCode,
        roleId: formData.roleId,
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
        setErrors({ general: 'Failed to create user: ' + errorMessage });
        return;
      }

      const { user: createdUser } = await response.json();
      logger.info('User created successfully via API', { userId: createdUser.id });

      // Barangay account creation is handled by the API

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
      setErrors({
        general:
          'An unexpected error occurred: ' +
          (error instanceof Error ? error.message : String(error)),
      });
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
      <div className="flex flex-col gap-6 p-6">
          <div className="mx-auto max-w-2xl">
            <div className="rounded-lg bg-white dark:bg-gray-800 p-8 shadow-md border border-gray-200 dark:border-gray-700">
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
                <h2 className="mb-4 text-2xl font-bold text-gray-600 dark:text-gray-300">User Created Successfully!</h2>
                <div className="mb-6 rounded-lg border border-green-200 dark:border-green-700 bg-green-50 dark:bg-green-900/20 p-4">
                  <h3 className="mb-2 text-sm font-medium text-green-800 dark:text-green-300">User Details:</h3>
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
                    className="rounded-md bg-blue-600 hover:bg-blue-700 px-4 py-2 text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
                  >
                    Create Another User
                  </button>
                  <Link
                    href="/admin/users"
                    className="rounded-md bg-gray-600 hover:bg-gray-700 px-4 py-2 text-white focus:outline-hidden focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
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
            <h1 className="font-montserrat text-xl font-semibold text-gray-600 dark:text-gray-400">Create New User</h1>
            <p className="font-montserrat text-sm font-normal text-gray-600 dark:text-gray-400">
              Create a new user account for your barangay
            </p>
          </div>
          <Link href="/admin/users">
            <button className="rounded-md bg-gray-600 hover:bg-gray-700 px-4 py-2 text-white focus:outline-hidden focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900">
              Back to Users
            </button>
          </Link>
        </div>

        <div className="mx-auto w-full max-w-2xl">
          <div className="rounded-lg bg-white dark:bg-gray-800 p-8 shadow-md border border-gray-200 dark:border-gray-700">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* General Error */}
              {errors.general && (
                <div className="rounded-lg border border-red-200 dark:border-red-700 bg-red-50 dark:bg-red-900/20 p-4">
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5 text-red-600 dark:text-red-400">⚠️</span>
                    <div>
                      <h4 className="font-medium text-red-800 dark:text-red-300">User Creation Failed</h4>
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
                    errorMessage={errors.firstName}
                    inputProps={{
                      id: "firstName",
                      type: "text",
                      value: formData.firstName,
                      onChange: (e: React.ChangeEvent<HTMLInputElement>) => handleChange('firstName', e.target.value),
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
                    errorMessage={errors.lastName}
                    inputProps={{
                      id: "lastName",
                      type: "text",
                      value: formData.lastName,
                      onChange: (e: React.ChangeEvent<HTMLInputElement>) => handleChange('lastName', e.target.value),
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

                <div>
                  <InputField
                    label="Email Address"
                    required
                    errorMessage={errors.email}
                    helperText="User will receive login credentials at this email"
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
                </div>

                <InputField
                  label="Mobile Number"
                  required
                  errorMessage={errors.mobileNumber}
                  inputProps={{
                    id: "mobileNumber",
                    type: "tel",
                    value: formData.mobileNumber,
                    onChange: (e: React.ChangeEvent<HTMLInputElement>) => handleChange('mobileNumber', e.target.value),
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
                <h3 className="border-b pb-2 text-lg font-medium text-gray-600 dark:text-gray-400">
                  Location Information
                </h3>

                <SelectField
                  label="Barangay *"
                  required
                  selectProps={{
                    placeholder: "Search for the user's barangay...",
                    options: barangayOptions,
                    value: formData.barangayCode,
                    onSelect: (option) => handleChange('barangayCode', option?.value || ''),
                    onSearch: handleBarangaySearch,
                    loading: barangayLoading,
                    disabled: isSubmitting,
                    error: errors.barangayCode,
                    searchable: true
                  }}
                  errorMessage={errors.barangayCode}
                />
              </div>

              {/* Role Selection */}
              <div className="space-y-4">
                <h3 className="border-b pb-2 text-lg font-medium text-gray-600 dark:text-gray-400">Account Type</h3>

                {loadingRoles ? (
                  <div className="space-y-2">
                    <label
                      htmlFor="role-loading"
                      className="block text-sm font-medium text-gray-600 dark:text-gray-400"
                    >
                      Role *
                    </label>
                    <div className="rounded-md border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-700 p-3">
                      <span className="text-gray-500 dark:text-gray-400 text-sm">Loading roles...</span>
                    </div>
                  </div>
                ) : (
                  <SelectField
                    label="Role *"
                    required
                    errorMessage={errors.roleId}
                    helperText="Select the role that best describes the user's position"
                    selectProps={{
                      options: [
                        { value: '', label: 'Select user role...' },
                        ...roles.map(role => ({
                          value: role.id,
                          label: `${role.name.charAt(0).toUpperCase() + role.name.slice(1).replace('_', ' ')} - ${role.description}`,
                        })),
                      ],
                      value: formData.roleId,
                      onSelect: (option) => handleChange('roleId', option?.value || ''),
                      disabled: isSubmitting,
                      placeholder: "Select user role..."
                    }}
                  />
                )}
              </div>

              {/* Account Security */}
              <div className="space-y-4">
                <h3 className="border-b pb-2 text-lg font-medium text-gray-600 dark:text-gray-400">Account Security</h3>

                <InputField
                  label="Password"
                  required
                  errorMessage={errors.password}
                  inputProps={{
                    id: "password",
                    type: "password",
                    value: formData.password,
                    onChange: (e: React.ChangeEvent<HTMLInputElement>) => handleChange('password', e.target.value),
                    placeholder: "Create a password for the user",
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
                  errorMessage={errors.confirmPassword}
                  inputProps={{
                    id: "confirmPassword",
                    type: "password",
                    value: formData.confirmPassword,
                    onChange: (e: React.ChangeEvent<HTMLInputElement>) => handleChange('confirmPassword', e.target.value),
                    placeholder: "Confirm the password",
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
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full items-center justify-center rounded-md border border-transparent bg-blue-600 hover:bg-blue-700 px-4 py-3 text-sm font-medium text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="-ml-1 mr-3 size-5 animate-spin text-white"
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
  return (
    <CreateUserContent />
  );
}
