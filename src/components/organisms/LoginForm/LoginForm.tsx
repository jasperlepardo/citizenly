'use client';

import React, { useState } from 'react';
import { useAuth } from '@/contexts';
import { InputField } from '@/components/molecules';
import { Button } from '@/components/atoms';

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
  const { signIn, loading } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const { error } = await signIn(formData.email, formData.password);

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          setErrors({ general: 'Invalid email or password. Please try again.' });
        } else if (error.message.includes('Email not confirmed')) {
          setErrors({ general: 'Please check your email and click the confirmation link.' });
        } else {
          setErrors({ general: error.message || 'Login failed. Please try again.' });
        }
      } else {
        // Success - redirect or call onSuccess
        if (onSuccess) {
          onSuccess();
        } else {
          window.location.href = redirectTo;
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrors({ general: 'An unexpected error occurred. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`mx-auto w-full max-w-md ${className}`}>
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-300 dark:border-gray-600 p-8 shadow-lg">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-2xl font-bold text-gray-600 dark:text-gray-400">Sign In to RBI System</h1>
          <p className="text-sm text-gray-600 dark:text-gray-400">Records of Barangay Inhabitant System</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
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
              id: "email",
              type: "email",
              value: formData.email,
              onChange: e => handleChange('email', e.target.value),
              placeholder: "your.email@barangay.gov.ph",
              disabled: isSubmitting,
              autoComplete: "email",
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
              )
            }}
          />

          {/* Password Field */}
          <InputField
            label="Password"
            required
            errorMessage={errors.password}
            inputProps={{
              id: "password",
              type: "password",
              value: formData.password,
              onChange: e => handleChange('password', e.target.value),
              placeholder: "Enter your password",
              disabled: isSubmitting,
              autoComplete: "current-password",
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
              )
            }}
          />

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting || loading}
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
            <a href="/signup" className="font-medium text-gray-400 hover:text-gray-300 dark:text-gray-700">
              Create one here
            </a>
          </p>
          <p className="text-gray-500 dark:text-gray-400 text-xs">Need help? Contact your Barangay Administrator</p>
        </div>
      </div>
    </div>
  );
}
