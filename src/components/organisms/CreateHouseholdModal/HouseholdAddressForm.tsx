/**
 * HouseholdAddressForm Component
 * Form fields for household address information
 */

import React from 'react';
// TODO: Implement StreetSelector and SubdivisionSelector components
// import StreetSelector from '../StreetSelector/StreetSelector';
// import SubdivisionSelector from '../SubdivisionSelector/SubdivisionSelector';

interface HouseholdFormData {
  house_number: string;
  street_id: string;
  subdivision_id: string;
}

interface HouseholdAddressFormProps {
  formData: HouseholdFormData;
  errors: Partial<Record<keyof HouseholdFormData, string>>;
  isSubmitting: boolean;
  onChange: (field: keyof HouseholdFormData, value: string) => void;
}

export default function HouseholdAddressForm({
  formData,
  errors,
  isSubmitting,
  onChange,
}: HouseholdAddressFormProps) {
  return (
    <div className="space-y-4">
      {/* House Number */}
      <div>
        <label
          htmlFor="house-number"
          className="font-montserrat mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
        >
          House/Block/Lot Number
        </label>
        <input
          id="house-number"
          type="text"
          value={formData.house_number}
          onChange={e => onChange('house_number', e.target.value)}
          placeholder="e.g., Blk 1 Lot 5, #123"
          className="font-montserrat w-full rounded-sm border border-gray-300 px-3 py-2 text-base focus:border-transparent focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
          disabled={isSubmitting}
        />
      </div>

      {/* Subdivision */}
      <div>
        <label className="font-montserrat mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Subdivision/Zone/Sitio/Purok
        </label>
        {/* TODO: Replace with actual SubdivisionSelector component */}
        <div className="rounded border border-gray-300 bg-gray-50 p-2 text-gray-500">
          SubdivisionSelector - Component not implemented yet
        </div>
      </div>

      {/* Street Name */}
      <div>
        <label className="font-montserrat mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300">
          Street Name *
        </label>
        {/* TODO: Replace with actual StreetSelector component */}
        <div className="rounded border border-gray-300 bg-gray-50 p-2 text-gray-500">
          StreetSelector - Component not implemented yet
        </div>
      </div>

      {/* Info Note */}
      <div className="rounded border border-blue-200 bg-blue-50 p-4">
        <p className="font-montserrat text-sm text-gray-800 dark:text-gray-200">
          <strong>Note:</strong> This household will be created in your assigned barangay. You can
          assign a resident as the household head after creating the household.
        </p>
      </div>
    </div>
  );
}
