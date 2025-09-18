'use client';

import React, { useState } from 'react';

import { InputField, Button } from '@/components';
import { useAuth } from '@/contexts';
import { useGenericFormSubmission } from '@/hooks/utilities';
import { createFieldChangeHandler } from '@/services/app/forms/formHandlers';
import type { LoginFormData } from '@/types/app/auth/auth';

interface LoginFormProps {
  onSuccess?: () => void;
  redirectTo?: string;
  className?: string;
}

export default function LoginForm({
  onSuccess,
  redirectTo = '/dashboard',
  className = '',
}: LoginFormProps) {
  const { signIn } = useAuth();
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
    rememberMe: false,
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Use consolidated form handler - eliminates 7 lines of duplicate code
  const handleChange = createFieldChangeHandler<LoginFormData>(formData, setFormData);

  // Use consolidated form submission hook
  const { isSubmitting, handleSubmit } = useGenericFormSubmission<LoginFormData>({
    onSubmit: async data => {
      const { error } = await signIn(data.email, data.password);

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('Invalid email or password. Please try again.');
        } else if (error.message.includes('Email not confirmed')) {
          throw new Error('Please check your email and click the confirmation link.');
        } else {
          throw new Error(error.message || 'Login failed. Please try again.');
        }
      }
    },
    validate: data => {
      const newErrors: Record<string, string> = {};

      if (!data.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
        newErrors.email = 'Please enter a valid email address';
      }

      if (!data.password) {
        newErrors.password = 'Password is required';
      } else if (data.password.length < 6) {
        newErrors.password = 'Password must be at least 6 characters';
      }

      return {
        isValid: Object.keys(newErrors).length === 0,
        errors: newErrors,
      };
    },
    onSuccess: () => {
      if (onSuccess) {
        onSuccess();
      } else {
        window.location.href = redirectTo;
      }
    },
    onError: error => {
      setErrors({ general: error.message });
    },
  });

  return (
    <div className={`mx-auto w-full max-w-md ${className}`}>
      <div className="rounded-lg border border-gray-300 bg-white p-8 shadow-lg dark:border-gray-600 dark:bg-gray-800">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-2xl font-bold text-gray-600 dark:text-gray-400">
            Sign In to RBI System
          </h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Records of Barangay Inhabitant System
          </p>
        </div>

        <form onSubmit={e => handleSubmit(e, formData)} className="space-y-6">
          {/* General Error */}
          {errors.general && (
            <div className="rounded-lg border border-red-300 bg-red-50 p-4">
              <div className="flex items-start gap-3">
                <span className="mt-0.5 text-red-600">⚠️</span>
                <div>
                  <h4 className="font-medium text-red-800">Login Failed</h4>
                  <p className="text-sm text-red-700">{errors.general}</p>
                </div>
              </div>
            </div>
          )}

          {/* Email Field */}
          <InputField
            label="Email Address"
            required
            errorMessage={errors.email}
            inputProps={{
              id: 'email',
              type: 'email',
              value: formData.email,
              onChange: e => handleChange('email', e.target.value),
              placeholder: 'your.email@barangay.gov.ph',
              disabled: isSubmitting,
              autoComplete: 'email',
              autoFocus: true,
              leftIcon: (
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
              ),
            }}
          />

          {/* Password Field */}
          <InputField
            label="Password"
            required
            errorMessage={errors.password}
            inputProps={{
              id: 'password',
              type: 'password',
              value: formData.password,
              onChange: e => handleChange('password', e.target.value),
              placeholder: 'Enter your password',
              disabled: isSubmitting,
              autoComplete: 'current-password',
              showPasswordToggle: true,
              leftIcon: (
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
              ),
            }}
          />

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting}
            loading={isSubmitting}
            variant="primary"
            size="regular"
            fullWidth
          >
            Sign In
          </Button>
        </form>

        {/* Footer */}
        <div className="mt-6 space-y-3 text-center">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Don&apos;t have an account?{' '}
            <a
              href="/signup"
              className="font-medium text-gray-400 hover:text-gray-300 dark:text-gray-700"
            >
              Create one here
            </a>
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Need help? Contact your Barangay Administrator
          </p>
        </div>
      </div>
    </div>
  );
}
