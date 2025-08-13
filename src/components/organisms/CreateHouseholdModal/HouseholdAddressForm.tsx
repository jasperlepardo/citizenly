/**
 * HouseholdAddressForm Component
 * Form fields for household address information
 */

import React from 'react';
import StreetSelector from '../../StreetSelector';
import SubdivisionSelector from '../../SubdivisionSelector';

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
        <label htmlFor="house-number" className="font-montserrat mb-2 block text-sm font-medium text-neutral-700">
          House/Block/Lot Number
        </label>
        <input
          id="house-number"
          type="text"
          value={formData.house_number}
          onChange={e => onChange('house_number', e.target.value)}
          placeholder="e.g., Blk 1 Lot 5, #123"
          className="font-montserrat w-full rounded border border-neutral-300 px-3 py-2 text-base focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isSubmitting}
        />
      </div>

      {/* Subdivision */}
      <div>
        <label className="font-montserrat mb-2 block text-sm font-medium text-neutral-700">
          Subdivision/Zone/Sitio/Purok
        </label>
        <SubdivisionSelector
          value={formData.subdivision_id}
          onSelect={(subdivisionId) => onChange('subdivision_id', subdivisionId || '')}
          error={errors.subdivision_id}
          placeholder="🏘️ Select subdivision or create new"
        />
      </div>

      {/* Street Name */}
      <div>
        <label className="font-montserrat mb-2 block text-sm font-medium text-neutral-700">
          Street Name *
        </label>
        <StreetSelector
          value={formData.street_id}
          onSelect={(streetId) => onChange('street_id', streetId || '')}
          error={errors.street_id}
          placeholder="🛣️ Select street or create new"
          subdivisionId={formData.subdivision_id || null}
        />
      </div>

      {/* Info Note */}
      <div className="rounded border border-blue-200 bg-blue-50 p-4">
        <p className="font-montserrat text-sm text-blue-800">
          <strong>Note:</strong> This household will be created in your assigned barangay. You
          can assign a resident as the household head after creating the household.
        </p>
      </div>
    </div>
  );
}