'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ProtectedRoute } from '@/components/organisms';
import { DashboardLayout } from '@/components/templates';
import { Button } from '@/components/atoms';
// import { FormField, FormSection } from '@/components/molecules';
import { useAuth } from '@/contexts/AuthContext';
import { logger, logError } from '@/lib/logging';

export const dynamic = 'force-dynamic';

const HOUSEHOLD_TYPE_OPTIONS = [
  { value: 'single_family', label: 'Single Family' },
  { value: 'extended_family', label: 'Extended Family' },
  { value: 'composite', label: 'Composite' },
  { value: 'institutional', label: 'Institutional' },
  { value: 'other', label: 'Other' },
];

const TENURE_STATUS_OPTIONS = [
  { value: 'owned', label: 'Owned' },
  { value: 'rented', label: 'Rented' },
  { value: 'rent_free_with_consent', label: 'Rent-free with Consent' },
  { value: 'rent_free_without_consent', label: 'Rent-free without Consent' },
  { value: 'other', label: 'Other' },
];

const INCOME_CLASS_OPTIONS = [
  { value: 'poor', label: 'Poor' },
  { value: 'low_income', label: 'Low Income' },
  { value: 'lower_middle_income', label: 'Lower Middle Income' },
  { value: 'middle_income', label: 'Middle Income' },
  { value: 'upper_middle_income', label: 'Upper Middle Income' },
  { value: 'upper_income', label: 'Upper Income' },
  { value: 'rich', label: 'Rich' },
];

const HOUSEHOLD_UNIT_OPTIONS = [
  { value: 'single_house', label: 'Single House' },
  { value: 'duplex', label: 'Duplex' },
  { value: 'multi_unit_residential', label: 'Multi-unit Residential' },
  { value: 'commercial_industrial_agricultural', label: 'Commercial/Industrial/Agricultural' },
  { value: 'institutional_living_quarter', label: 'Institutional Living Quarter' },
  { value: 'other', label: 'Other' },
];

interface HouseholdFormData {
  name?: string;
  house_number?: string;
  street_name?: string;
  subdivision?: string;
  household_type?: string;
  household_unit?: string;
  tenure_status?: string;
  tenure_others_specify?: string;
  monthly_income?: number;
  income_class?: string;
  no_of_families?: number;
  no_of_household_members?: number;
  no_of_migrants?: number;
}

export default function HouseholdEditPage() {
  const [formData, setFormData] = useState<HouseholdFormData>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { session } = useAuth();
  const params = useParams();
  const router = useRouter();
  const householdCode = params.id as string;

  useEffect(() => {
    const fetchHousehold = async () => {
      if (!session || !householdCode) return;

      try {
        setLoading(true);
        setError(null);

        // Use the standard endpoint
        const response = await fetch(`/api/households/${householdCode}`, {
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            'Content-Type': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error(`Failed to fetch household: ${response.status}`);
        }

        const data = await response.json();
        const household = data.household || data;

        setFormData({
          name: household.name || '',
          house_number: household.house_number || '',
          street_name: household.street_name || '',
          subdivision: household.subdivision || '',
          household_type: household.household_type || '',
          household_unit: household.household_unit || '',
          tenure_status: household.tenure_status || '',
          tenure_others_specify: household.tenure_others_specify || '',
          monthly_income: household.monthly_income || undefined,
          income_class: household.income_class || '',
          no_of_families: household.no_of_families || 1,
          no_of_household_members: household.no_of_household_members || 0,
          no_of_migrants: household.no_of_migrants || 0,
        });
      } catch (err) {
        logError(err instanceof Error ? err.message : String(err));
        setError(err instanceof Error ? err.message : 'Failed to load household');
      } finally {
        setLoading(false);
      }
    };

    fetchHousehold();
  }, [session, householdCode]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;

    if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: value ? Number(value) : undefined }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!session) {
      setError('No active session');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      // Use the update API endpoint
      const response = await fetch(`/api/households/${householdCode}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Failed to update household: ${response.status}`);
      }

      // Redirect back to household detail page
      router.push(`/households/${householdCode}`);
    } catch (err) {
      logError(err instanceof Error ? err.message : String(err));
      setError(err instanceof Error ? err.message : 'Failed to update household');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <DashboardLayout>
          <div className="flex min-h-screen items-center justify-center">
            <div className="text-center">
              <div className="inline-block size-12 animate-spin rounded-full border-4 border-solid border-blue-600 border-r-transparent dark:border-blue-400 dark:border-r-transparent"></div>
              <h2 className="mt-4 text-lg font-medium text-primary">Loading household data...</h2>
            </div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="mx-auto max-w-4xl space-y-6">
          {/* Header */}
          <div className="bg-default rounded-xl border border-default p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-primary">Edit Household</h1>
                <p className="mt-2 text-secondary">Household Code: {householdCode}</p>
              </div>
              <Button
                variant="secondary-outline"
                onClick={() => router.push(`/households/${householdCode}`)}
              >
                Cancel
              </Button>
            </div>
          </div>

          {error && (
            <div className="rounded-lg border border-danger-200 bg-danger-50 p-4 dark:border-danger-800 dark:bg-danger-950">
              <p className="text-danger-800 dark:text-danger-200">{error}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Basic Information</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium mb-2">Household Name</label>
                  <input
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    placeholder="Optional household name"
                    className="bg-default min-h-10 w-full rounded-md border border-default px-3 py-2 text-primary focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Household Type</label>
                  <select
                    name="household_type"
                    value={formData.household_type}
                    onChange={handleInputChange}
                    className="bg-default min-h-10 w-full rounded-md border border-default px-3 py-2 text-primary focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-400"
                  >
                    <option value="">Select Household Type</option>
                    {HOUSEHOLD_TYPE_OPTIONS.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div><label className="block text-sm font-medium mb-2">Housing Unit</label>
                  <select
                    name="household_unit"
                    value={formData.household_unit}
                    onChange={handleInputChange}
                    className="bg-default min-h-10 w-full rounded-md border border-default px-3 py-2 text-primary focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-400"
                  >
                    <option value="">Select Housing Unit</option>
                    {HOUSEHOLD_UNIT_OPTIONS.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div><label className="block text-sm font-medium mb-2">Number of Families</label>
                  <input className="bg-default min-h-10 w-full rounded-md border border-default px-3 py-2 text-primary focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    type="number"
                    name="no_of_families"
                    value={formData.no_of_families || ''}
                    onChange={handleInputChange}
                    min="1"
                  />
                </div>

                <div><label className="block text-sm font-medium mb-2">Number of Household Members</label>
                  <input className="bg-default min-h-10 w-full rounded-md border border-default px-3 py-2 text-primary focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    type="number"
                    name="no_of_household_members"
                    value={formData.no_of_household_members || ''}
                    onChange={handleInputChange}
                    min="0"
                  />
                </div>

                <div><label className="block text-sm font-medium mb-2">Number of Migrants</label>
                  <input className="bg-default min-h-10 w-full rounded-md border border-default px-3 py-2 text-primary focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    type="number"
                    name="no_of_migrants"
                    value={formData.no_of_migrants || ''}
                    onChange={handleInputChange}
                    min="0"
                  />
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div className="space-y-4"><h3 className="text-lg font-semibold">Address Information</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div><label className="block text-sm font-medium mb-2">House Number</label>
                  <input className="bg-default min-h-10 w-full rounded-md border border-default px-3 py-2 text-primary focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    name="house_number"
                    value={formData.house_number}
                    onChange={handleInputChange}
                    placeholder="e.g., 123, Block 1 Lot 2"
                  />
                </div>

                <div><label className="block text-sm font-medium mb-2">Street Name</label>
                  <input className="bg-default min-h-10 w-full rounded-md border border-default px-3 py-2 text-primary focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    name="street_name"
                    value={formData.street_name}
                    onChange={handleInputChange}
                    placeholder="e.g., Main Street, Rizal Avenue"
                  />
                </div>

                <div><label className="block text-sm font-medium mb-2">Subdivision</label>
                  <input className="bg-default min-h-10 w-full rounded-md border border-default px-3 py-2 text-primary focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    name="subdivision"
                    value={formData.subdivision}
                    onChange={handleInputChange}
                    placeholder="e.g., Greenfield Village"
                  />
                </div>
              </div>
            </div>

            {/* Economic Information */}
            <div className="space-y-4"><h3 className="text-lg font-semibold">Economic Information</h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div><label className="block text-sm font-medium mb-2">Monthly Income (₱)</label>
                  <input className="bg-default min-h-10 w-full rounded-md border border-default px-3 py-2 text-primary focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    type="number"
                    name="monthly_income"
                    value={formData.monthly_income || ''}
                    onChange={handleInputChange}
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                  />
                </div>

                <div><label className="block text-sm font-medium mb-2">Income Class</label>
                  <select
                    name="income_class"
                    value={formData.income_class}
                    onChange={handleInputChange}
                    className="bg-default min-h-10 w-full rounded-md border border-default px-3 py-2 text-primary focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-400"
                  >
                    <option value="">Select Income Class</option>
                    {INCOME_CLASS_OPTIONS.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div><label className="block text-sm font-medium mb-2">Tenure Status</label>
                  <select
                    name="tenure_status"
                    value={formData.tenure_status}
                    onChange={handleInputChange}
                    className="bg-default min-h-10 w-full rounded-md border border-default px-3 py-2 text-primary focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-400"
                  >
                    <option value="">Select Tenure Status</option>
                    {TENURE_STATUS_OPTIONS.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                {formData.tenure_status === 'other' && (
                  <div><label className="block text-sm font-medium mb-2">Tenure Details</label>
                    <input className="bg-default min-h-10 w-full rounded-md border border-default px-3 py-2 text-primary focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      name="tenure_others_specify"
                      value={formData.tenure_others_specify}
                      onChange={handleInputChange}
                      placeholder="Please specify"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Form Actions */}
            <div className="bg-default rounded-xl border border-default p-6 shadow-sm">
              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="secondary-outline"
                  onClick={() => router.push(`/households/${householdCode}`)}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button type="submit" variant="primary" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
