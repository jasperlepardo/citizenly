'use client';

import React, { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/atoms';
import { BarangaySelector } from '@/components/organisms';
import { ErrorBoundary } from '@/providers';

// Zod validation schema
const householdSchema = z.object({
  // Household information
  household_type: z.string().min(1, 'Household type is required'),
  monthly_income: z.number().min(0).optional(),
  address: z.string().min(1, 'Address is required'),
  barangay_code: z.string().min(1, 'Barangay is required'),
  contact_number: z.string().optional(),
  email: z.string().email().optional().or(z.literal('')),

  // Residents
  residents: z
    .array(
      z.object({
        first_name: z.string().min(1, 'First name is required'),
        middle_name: z.string().optional(),
        last_name: z.string().min(1, 'Last name is required'),
        suffix: z.string().optional(),
        relationship_to_head: z.string().min(1, 'Relationship is required'),
        birth_date: z.string().min(1, 'Birth date is required'),
        sex: z.enum(['male', 'female']),
        civil_status: z.string().min(1, 'Civil status is required'),
        is_pwd: z.boolean().default(false),
        is_registered_voter: z.boolean().default(false),
        is_indigenous: z.boolean().default(false),
        ethnicity: z.string().optional(),
      })
    )
    .min(1, 'At least one resident is required'),
});

type HouseholdFormData = z.infer<typeof householdSchema>;

interface HouseholdRegistrationFormProps {
  onSuccess?: (householdId: string) => void;
  onCancel?: () => void;
}

const HOUSEHOLD_TYPES = [
  { value: 'nuclear', label: 'Nuclear Family' },
  { value: 'extended', label: 'Extended Family' },
  { value: 'single_parent', label: 'Single Parent' },
  { value: 'childless', label: 'Childless Couple' },
  { value: 'single_person', label: 'Single Person' },
];

const RELATIONSHIPS = [
  { value: 'head', label: 'Head of Household' },
  { value: 'spouse', label: 'Spouse' },
  { value: 'child', label: 'Child' },
  { value: 'parent', label: 'Parent' },
  { value: 'sibling', label: 'Sibling' },
  { value: 'grandparent', label: 'Grandparent' },
  { value: 'grandchild', label: 'Grandchild' },
  { value: 'other_relative', label: 'Other Relative' },
  { value: 'non_relative', label: 'Non-Relative' },
];

const CIVIL_STATUS = [
  { value: 'single', label: 'Single' },
  { value: 'married', label: 'Married' },
  { value: 'widowed', label: 'Widowed' },
  { value: 'divorced', label: 'Divorced' },
  { value: 'separated', label: 'Separated' },
];

export default function HouseholdRegistrationForm({
  onSuccess,
  onCancel,
}: HouseholdRegistrationFormProps) {
  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<HouseholdFormData>({
    resolver: zodResolver(householdSchema),
    defaultValues: {
      residents: [
        {
          first_name: '',
          middle_name: '',
          last_name: '',
          relationship_to_head: 'head',
          birth_date: '',
          sex: 'male',
          civil_status: 'single',
          is_pwd: false,
          is_registered_voter: false,
          is_indigenous: false,
        },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'residents',
  });

  const [isPending, setIsPending] = useState(false);
  const [householdNumber, setHouseholdNumber] = useState<string | null>(null);

  const registerHousehold = async (
    data: any,
    options: { onSuccess?: (household: any) => void } = {}
  ) => {
    try {
      setIsPending(true);

      // Get the current session
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session?.access_token) {
        throw new Error('No valid session found');
      }

      const response = await fetch('/api/households', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      const result = await response.json();
      setHouseholdNumber(result.household.household_number);
      options.onSuccess?.(result);
    } catch (error) {
      console.error('Household registration error:', error);
      throw error;
    } finally {
      setIsPending(false);
    }
  };

  const onSubmit = (data: HouseholdFormData) => {
    registerHousehold(
      {
        household: {
          household_number: householdNumber || `TEMP-${Date.now()}`,
          household_type: data.household_type,
          monthly_income: data.monthly_income,
          address: data.address,
          barangay_code: data.barangay_code,
          contact_number: data.contact_number,
          email: data.email || undefined,
        },
        residents: data.residents,
      },
      {
        onSuccess: household => {
          onSuccess?.(household?.id || '');
        },
      }
    );
  };

  const addResident = () => {
    append({
      first_name: '',
      middle_name: '',
      last_name: '',
      relationship_to_head: 'child',
      birth_date: '',
      sex: 'male',
      civil_status: 'single',
      is_pwd: false,
      is_registered_voter: false,
      is_indigenous: false,
    });
  };

  return (
    <ErrorBoundary level="section">
      <div className="mx-auto max-w-4xl rounded-lg bg-white p-6 shadow-lg">
        <div className="mb-6">
          <h2 className="mb-2 text-2xl font-bold text-gray-900">Household Registration</h2>
          <p className="text-gray-600">Register a new household and its members in the system</p>
          {householdNumber && (
            <div className="mt-3 rounded border border-blue-200 bg-blue-50 p-3">
              <p className="text-sm text-gray-700">
                <strong>Household Number:</strong> {householdNumber}
              </p>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Household Information */}
          <section>
            <h3 className="mb-4 text-lg font-semibold text-gray-900">Household Information</h3>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Household Type *
                </label>
                <select
                  {...register('household_type')}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select household type</option>
                  {HOUSEHOLD_TYPES.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                {errors.household_type && (
                  <p className="mt-1 text-sm text-red-600">{errors.household_type.message}</p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Monthly Income (PHP)
                </label>
                <input
                  type="number"
                  {...register('monthly_income', { valueAsNumber: true })}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0"
                />
              </div>

              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700">Address *</label>
                <textarea
                  {...register('address')}
                  rows={3}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="House number, street, subdivision, landmark"
                />
                {errors.address && (
                  <p className="mt-1 text-sm text-red-600">{errors.address.message}</p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-700">Barangay *</label>
                <BarangaySelector
                  value={watch('barangay_code') || ''}
                  onChange={code => setValue('barangay_code', code)}
                  error={errors.barangay_code?.message}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">
                  Contact Number
                </label>
                <input
                  type="tel"
                  {...register('contact_number')}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+63 9XX XXX XXXX"
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  {...register('email')}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="email@example.com"
                />
              </div>
            </div>
          </section>

          {/* Household Members */}
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Household Members</h3>
              <Button type="button" onClick={addResident} variant="secondary" size="sm">
                Add Member
              </Button>
            </div>

            <div className="space-y-6">
              {fields.map((field, index) => (
                <div key={field.id} className="rounded-lg border border-gray-200 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <h4 className="font-medium text-gray-900">
                      Member {index + 1}
                      {index === 0 && (
                        <span className="ml-2 text-sm text-gray-600">(Head of Household)</span>
                      )}
                    </h4>
                    {index > 0 && (
                      <Button
                        type="button"
                        onClick={() => remove(index)}
                        variant="danger"
                        size="sm"
                      >
                        Remove
                      </Button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">
                        First Name *
                      </label>
                      <input
                        {...register(`residents.${index}.first_name`)}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {errors.residents?.[index]?.first_name && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.residents[index]?.first_name?.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">
                        Middle Name
                      </label>
                      <input
                        {...register(`residents.${index}.middle_name`)}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">
                        Last Name *
                      </label>
                      <input
                        {...register(`residents.${index}.last_name`)}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      {errors.residents?.[index]?.last_name && (
                        <p className="mt-1 text-sm text-red-600">
                          {errors.residents[index]?.last_name?.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">
                        Relationship *
                      </label>
                      <select
                        {...register(`residents.${index}.relationship_to_head`)}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {RELATIONSHIPS.map(rel => (
                          <option key={rel.value} value={rel.value}>
                            {rel.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">
                        Birth Date *
                      </label>
                      <input
                        type="date"
                        {...register(`residents.${index}.birth_date`)}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">Sex *</label>
                      <select
                        {...register(`residents.${index}.sex`)}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                      </select>
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-medium text-gray-700">
                        Civil Status *
                      </label>
                      <select
                        {...register(`residents.${index}.civil_status`)}
                        className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        {CIVIL_STATUS.map(status => (
                          <option key={status.value} value={status.value}>
                            {status.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex items-center space-x-4">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          {...register(`residents.${index}.is_pwd`)}
                          className="mr-2"
                        />
                        PWD
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          {...register(`residents.${index}.is_registered_voter`)}
                          className="mr-2"
                        />
                        Voter
                      </label>
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          {...register(`residents.${index}.is_indigenous`)}
                          className="mr-2"
                        />
                        Indigenous
                      </label>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 border-t pt-6">
            {onCancel && (
              <Button
                type="button"
                onClick={onCancel}
                variant="secondary"
                disabled={isSubmitting || isPending}
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              disabled={isSubmitting || isPending}
              loading={isSubmitting || isPending}
            >
              Register Household
            </Button>
          </div>
        </form>
      </div>
    </ErrorBoundary>
  );
}
