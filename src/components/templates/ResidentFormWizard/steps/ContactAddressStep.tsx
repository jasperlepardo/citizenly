import React from 'react';
import { GeographicLocationStep } from '@/components/organisms';
import { InputField } from '@/components/molecules';
import HouseholdSelector from '@/components/organisms/HouseholdSelector/HouseholdSelector';
import StreetSelector from '@/components/organisms/StreetSelector/StreetSelector';
import SubdivisionSelector from '@/components/organisms/SubdivisionSelector/SubdivisionSelector';
import { StepComponentProps } from '../types';

export function ContactAddressStep({ formData, onChange, errors }: StepComponentProps) {
  // Map form data to GeographicLocationStep component props
  const geographicData = {
    regionCode: formData.regionCode,
    provinceCode: formData.provinceCode,
    cityMunicipalityCode: formData.cityMunicipalityCode,
    barangayCode: formData.barangayCode,
  };

  // Handle geographic selection changes
  const handleGeographicChange = (data: any) => {
    if (data.regionCode !== undefined) onChange('regionCode', data.regionCode);
    if (data.provinceCode !== undefined) onChange('provinceCode', data.provinceCode);
    if (data.cityMunicipalityCode !== undefined)
      onChange('cityMunicipalityCode', data.cityMunicipalityCode);
    if (data.barangayCode !== undefined) onChange('barangayCode', data.barangayCode);
  };

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-base/7 font-semibold text-primary">Contact & Address Information</h3>
        <p className="mt-1 text-sm/6 text-secondary">
          Provide contact details and geographic location information.
        </p>
      </div>

      {/* Contact Information */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-primary">Contact Information</h4>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <InputField
            label="Mobile Number"
            value={formData.mobileNumber}
            onChange={e => onChange('mobileNumber', e.target.value)}
            errorMessage={errors.mobileNumber}
            placeholder="+639XXXXXXXXX"
          />
          <InputField
            label="Telephone Number"
            value={formData.telephoneNumber}
            onChange={e => onChange('telephoneNumber', e.target.value)}
            errorMessage={errors.telephoneNumber}
            placeholder="(02) XXXX-XXXX"
          />
          <div className="sm:col-span-2">
            <InputField
              label="Email Address"
              type="email"
              value={formData.email}
              onChange={e => onChange('email', e.target.value)}
              errorMessage={errors.email}
              placeholder="example@domain.com"
            />
          </div>
        </div>
      </div>

      {/* Geographic Selection */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-primary">Geographic Location</h4>
        <GeographicLocationStep
          formData={geographicData}
          updateFormData={handleGeographicChange}
          errors={errors}
          required={true}
        />
      </div>

      {/* Address Details */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-primary">Address Details</h4>
        <p className="text-sm text-gray-600">
          Select or create the street and subdivision for detailed address information.
        </p>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <SubdivisionSelector
            value={formData.subdivisionId}
            onSelect={subdivisionId => onChange('subdivisionId', subdivisionId || '')}
            error={errors.subdivisionId}
            placeholder="Select subdivision or create new"
          />

          <StreetSelector
            value={formData.streetId}
            onSelect={streetId => onChange('streetId', streetId || '')}
            error={errors.streetId}
            subdivisionId={formData.subdivisionId}
            placeholder="Select street or create new"
          />

          <InputField
            label="ZIP Code"
            value={formData.zipCode}
            onChange={e => onChange('zipCode', e.target.value)}
            errorMessage={errors.zipCode}
            placeholder="XXXX"
          />
        </div>
      </div>

      {/* Household Assignment */}
      <div className="space-y-4">
        <h4 className="text-sm font-medium text-primary">Household Assignment</h4>
        <p className="text-sm text-gray-600">
          Select an existing household or create a new one for this resident.
        </p>
        <HouseholdSelector
          value={formData.householdCode || ''}
          onSelect={householdCode => onChange('householdCode', householdCode || '')}
          error={errors.householdCode}
          placeholder="Search households by head of family or address"
        />
      </div>
    </div>
  );
}
