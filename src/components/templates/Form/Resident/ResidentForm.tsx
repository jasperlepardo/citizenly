'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';

import { ReadOnly } from '@/components/atoms/Field/ReadOnly';
import {
  PersonalInformationForm,
  ContactInformationForm,
  PhysicalPersonalDetailsForm,
  SectoralInformationForm,
  MigrationInformation,
} from '@/components/organisms/FormSection';
import { useAuth } from '@/contexts';
import { supabase } from '@/lib';
import { isIndigenousPeople } from '@/lib/business-rules/sectoral-classification';
import type { FormMode } from '@/types';
import { ResidentFormState } from '@/types/residents';

import { FormActions } from './components/FormActions';
import { FormHeader } from './components/FormHeader';

// Use the database-aligned ResidentFormState interface
type ResidentFormData = ResidentFormState;

interface ResidentFormProps {
  mode?: FormMode;
  onSubmit?: (data: ResidentFormData) => void;
  onCancel?: () => void;
  initialData?: Partial<ResidentFormData>;
  onModeChange?: (mode: FormMode) => void;
  hidePhysicalDetails?: boolean;
  hideSectoralInfo?: boolean;
  onChange?: (data: ResidentFormData) => void;
}

// Helper function to get sectoral classifications based on ethnicity
const getSectoralClassificationsByEthnicity = (ethnicity: string): Partial<ResidentFormData> => {
  const updates: Partial<ResidentFormData> = {};

  // Reset all sectoral classifications first (except manually set ones)
  updates.is_indigenous_people = false;

  // Indigenous peoples classification - automatically set to true
  if (isIndigenousPeople(ethnicity)) {
    updates.is_indigenous_people = true;
  }

  // Note: Other sectoral classifications could be auto-suggested based on ethnicity:
  // - is_migrant: Some communities are traditionally mobile (e.g., Badjao)
  // - is_person_with_disability: Cannot be determined by ethnicity
  // - is_solo_parent: Cannot be determined by ethnicity
  // - is_senior_citizen: Cannot be determined by ethnicity
  // - is_out_of_school_children/youth: Cannot be determined by ethnicity
  // - is_overseas_filipino_worker: Cannot be determined by ethnicity

  // For now, we only auto-set is_indigenous_people as it's directly determinable from ethnicity
  // Other classifications should be manually selected by the user

  return updates;
};

// Database default values matching schema.sql + UX defaults for required fields
// ONLY for truly empty/new forms - should NOT override existing data
const DEFAULT_FORM_VALUES: Partial<ResidentFormData> = {
  // Database defaults - ONLY for create mode, not for existing data
  citizenship: 'filipino', // Database default
  is_graduate: false, // Database default

  // UX defaults for required fields without database defaults - ONLY for create mode
  sex: 'male', // No database default but required - provide UX default

  // DO NOT set civil_status default here - let real data take precedence
  // Note: ethnicity, blood_type, religion are nullable - no defaults
};

export function ResidentForm({
  mode = 'create',
  onSubmit,
  onCancel,
  initialData,
  onModeChange,
  hidePhysicalDetails = false,
  hideSectoralInfo = false,
  onChange,
}: ResidentFormProps) {
  // Auth context
  const { userProfile } = useAuth();

  // Search options state - need state for re-renders when options change
  const [searchOptions, setSearchOptions] = useState({
    psgc: [] as any[],
    psoc: [] as any[],
    household: [] as any[],
  });

  const [searchLoading, setSearchLoading] = useState({
    psgc: false,
    psoc: false,
    household: false,
  });

  // Create form data with database defaults, then merge with initialData if provided
  const [formData, setFormData] = useState<ResidentFormData>(() => {
    const baseFormData: ResidentFormData = {
      // Personal Information - database field names
      first_name: '',
      middle_name: '',
      last_name: '',
      extension_name: '',
      sex: '', // Required field - no default
      civil_status: '', // Will be set from defaults
      civil_status_others_specify: '',
      citizenship: '', // Will be set from defaults
      birthdate: '',
      birth_place_name: '',
      birth_place_code: '',
      birth_place_level: '',
      philsys_card_number: '',
      philsys_last4: '',
      education_attainment: '', // No database default
      is_graduate: false, // Will be set from defaults
      employment_status: '', // No database default
      employment_code: '',
      employment_name: '',
      occupation_code: '',
      psoc_level: 0,
      occupation_title: '',

      // Contact Information - database field names
      email: '',
      telephone_number: '',
      mobile_number: '',
      household_code: '',

      // Physical Personal Details - database field names
      blood_type: '', // Nullable field - no default
      complexion: '',
      height: 0, // Will be excluded from submission if section is hidden
      weight: 0, // Will be excluded from submission if section is hidden
      ethnicity: '', // Nullable field - no default
      religion: '', // Nullable field - no default
      religion_others_specify: '',
      is_voter: null, // Will be excluded from submission if section is hidden
      is_resident_voter: null, // Will be excluded from submission if section is hidden
      last_voted_date: '',
      mother_maiden_first: '',
      mother_maiden_middle: '',
      mother_maiden_last: '',

      // Sectoral Information - database field names
      is_labor_force_employed: false,
      is_unemployed: false,
      is_overseas_filipino_worker: false,
      is_person_with_disability: false,
      is_out_of_school_children: false,
      is_out_of_school_youth: false,
      is_senior_citizen: false,
      is_registered_senior_citizen: false,
      is_solo_parent: false,
      is_indigenous_people: false,
      is_migrant: false,

      // Migration Information - database field names
      previous_barangay_code: '',
      previous_city_municipality_code: '',
      previous_province_code: '',
      previous_region_code: '',
      length_of_stay_previous_months: 0,
      reason_for_leaving: '',
      date_of_transfer: '',
      reason_for_transferring: '',
      duration_of_stay_current_months: 0,
      is_intending_to_return: false,
    };

    // Smart merge strategy: only apply defaults for missing/empty values
    const formWithDefaults = { ...baseFormData };

    // Apply defaults ONLY for create mode or when values are truly missing
    if (mode === 'create' || !initialData) {
      Object.assign(formWithDefaults, DEFAULT_FORM_VALUES);
    } else {
      // For existing data, only apply defaults for undefined/null values
      Object.entries(DEFAULT_FORM_VALUES).forEach(([key, defaultValue]) => {
        if (
          formWithDefaults[key as keyof ResidentFormData] === undefined ||
          formWithDefaults[key as keyof ResidentFormData] === null
        ) {
          (formWithDefaults as any)[key] = defaultValue;
        }
      });
    }

    // Merge with initialData - initialData takes precedence over defaults
    const finalFormData = initialData ? { ...formWithDefaults, ...initialData } : formWithDefaults;

    // Notify parent of initial data (use setTimeout to avoid state update during render)
    if (onChange) {
      setTimeout(() => {
        onChange(finalFormData);
      }, 0);
    }

    return finalFormData;
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Production-ready stable search handlers
  const handlePsgcSearch = useCallback(async (query: string) => {
    if (!query || query.trim().length < 2) {
      setSearchOptions(prev => ({ ...prev, psgc: [] }));
      setSearchLoading(prev => ({ ...prev, psgc: false }));
      return;
    }

    setSearchLoading(prev => ({ ...prev, psgc: true }));
    try {
      const params = new URLSearchParams({
        q: query.trim(),
        limit: '50',
        levels: 'province,city',
        maxLevel: 'city',
        minLevel: 'province',
      });

      const response = await fetch(`/api/psgc/search?${params}`);

      if (response.ok) {
        const data = await response.json();
        if (data.data && Array.isArray(data.data)) {
          setSearchOptions(prev => ({
            ...prev,
            psgc: data.data.map((item: any) => ({
              value: item.code || item.city_code || item.province_code,
              label: item.name || item.city_name || item.province_name,
              description: item.full_address || item.full_hierarchy,
              level: item.level,
              code: item.code || item.city_code || item.province_code,
            })),
          }));
        }
      }
    } catch (error) {
      console.error('PSGC search error:', error);
      setSearchOptions(prev => ({ ...prev, psgc: [] }));
    } finally {
      setSearchLoading(prev => ({ ...prev, psgc: false }));
    }
  }, []);

  const handlePsocSearch = useCallback(async (query: string) => {
    if (!query || query.trim().length < 2) {
      setSearchOptions(prev => ({ ...prev, psoc: [] }));
      setSearchLoading(prev => ({ ...prev, psoc: false }));
      return;
    }

    setSearchLoading(prev => ({ ...prev, psoc: true }));
    try {
      const params = new URLSearchParams({
        q: query.trim(),
        limit: '20',
        levels: 'major_group,sub_major_group,unit_group,unit_sub_group,occupation',
        maxLevel: 'occupation',
        minLevel: 'major_group',
      });

      const response = await fetch(`/api/psoc/search?${params}`);

      if (response.ok) {
        const data = await response.json();
        if (data.data && Array.isArray(data.data)) {
          setSearchOptions(prev => ({
            ...prev,
            psoc: data.data.map((item: any) => ({
              value: item.code,
              label: item.title,
              description: item.hierarchy,
              level_type: item.level,
              occupation_code: item.code,
              occupation_title: item.title,
            })),
          }));
        }
      }
    } catch (error) {
      console.error('PSOC search error:', error);
      setSearchOptions(prev => ({ ...prev, psoc: [] }));
    } finally {
      setSearchLoading(prev => ({ ...prev, psoc: false }));
    }
  }, []);

  const handleHouseholdSearch = useCallback(
    async (query: string) => {
      if (!userProfile?.barangay_code) {
        setSearchOptions(prev => ({ ...prev, household: [] }));
        return;
      }

      setSearchLoading(prev => ({ ...prev, household: true }));
      try {
        // Get current session to pass auth token
        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (!session?.access_token) {
          console.warn('No valid session found for household search');
          setSearchOptions(prev => ({ ...prev, household: [] }));
          return;
        }

        // Call the actual households API
        const url = `/api/households?${query ? `search=${encodeURIComponent(query)}&` : ''}limit=50`;
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${session.access_token}`,
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        const households = data.data || [];

        // Transform household data for the dropdown
        const householdOptions = households.map((household: any) => ({
          value: household.code,
          label: `${household.code}${household.name ? ` - ${household.name}` : ''}`,
          description: household.address || `House ${household.house_number || 'N/A'}`,
        }));

        setSearchOptions(prev => ({ ...prev, household: householdOptions }));
      } catch (error) {
        console.error('Household search error:', error);
        // Fallback to empty array if API fails
        setSearchOptions(prev => ({ ...prev, household: [] }));
      } finally {
        setSearchLoading(prev => ({ ...prev, household: false }));
      }
    },
    [userProfile?.barangay_code]
  );

  // Load initial household options when component mounts
  useEffect(() => {
    if (userProfile?.barangay_code) {
      handleHouseholdSearch(''); // Load initial household data
    }
  }, [userProfile?.barangay_code, handleHouseholdSearch]);

  // Handle form field changes
  const handleFieldChange = (
    field: string | number | symbol,
    value: string | number | boolean | null
  ) => {
    const fieldKey = String(field);

    // Start with the basic field update
    let updatedData: Partial<ResidentFormData> = {
      [fieldKey]: value,
    };

    if (fieldKey === 'ethnicity' && typeof value === 'string') {
      // Auto-update sectoral classifications based on ethnicity
      const sectoralUpdates = getSectoralClassificationsByEthnicity(value);
      updatedData = { ...updatedData, ...sectoralUpdates };
    }

    const newFormData = {
      ...formData,
      ...updatedData,
    };

    setFormData(newFormData);

    // Notify parent component of changes
    if (onChange) {
      onChange(newFormData);
    }

    // Clear error when user starts typing
    if (errors[fieldKey]) {
      setErrors(prev => ({
        ...prev,
        [fieldKey]: '',
      }));
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Basic validation using database field names
      const newErrors: Record<string, string> = {};

      if (!formData.first_name.trim()) newErrors.first_name = 'First name is required';
      if (!formData.last_name.trim()) newErrors.last_name = 'Last name is required';
      if (!formData.sex) newErrors.sex = 'Sex is required';
      if (!formData.birthdate) newErrors.birthdate = 'Birth date is required';

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        setIsSubmitting(false);
        // Show validation error message
        console.error('Validation errors:', newErrors);
        return;
      }

      // Call onSubmit callback
      if (onSubmit) {
        // Create a filtered version of form data that excludes hidden fields
        const filteredFormData = { ...formData };

        // Remove Physical & Personal Details fields if section is hidden
        if (hidePhysicalDetails) {
          const physicalFields = [
            'height',
            'weight',
            'blood_type',
            'complexion',
            'ethnicity',
            'religion',
            'religion_others_specify',
            'is_voter',
            'is_resident_voter',
            'last_voted_date',
            'mother_maiden_first',
            'mother_maiden_middle',
            'mother_maiden_last',
          ];
          physicalFields.forEach(field => {
            if (filteredFormData.hasOwnProperty(field)) {
              delete filteredFormData[field as keyof typeof filteredFormData];
            }
          });
        }

        // Remove Sectoral Information fields if section is hidden
        if (hideSectoralInfo) {
          const sectoralFields = [
            'is_labor_force_employed',
            'is_unemployed',
            'is_overseas_filipino_worker',
            'is_person_with_disability',
            'is_out_of_school_children',
            'is_out_of_school_youth',
            'is_senior_citizen',
            'is_registered_senior_citizen',
            'is_solo_parent',
            'is_indigenous_people',
            'is_migrant',
          ];
          sectoralFields.forEach(field => {
            if (filteredFormData.hasOwnProperty(field)) {
              delete filteredFormData[field as keyof typeof filteredFormData];
            }
          });
        }

        console.log('🚀 RESIDENTFORM: Calling onSubmit with data:');
        console.log('🚀 RESIDENTFORM: is_migrant value:', filteredFormData.is_migrant);
        console.log('🚀 RESIDENTFORM: sectoral fields in filtered data:', {
          is_migrant: filteredFormData.is_migrant,
          is_solo_parent: filteredFormData.is_solo_parent,
          is_person_with_disability: filteredFormData.is_person_with_disability,
        });
        await onSubmit(filteredFormData);
      }
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Form Header */}
      <FormHeader mode={mode} onModeChange={onModeChange} />

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Personal Information Section */}
        <PersonalInformationForm
          mode={mode}
          formData={{
            // Direct snake_case properties (matching database schema)
            philsys_card_number: formData.philsys_card_number,
            first_name: formData.first_name,
            middle_name: formData.middle_name,
            last_name: formData.last_name,
            extension_name: formData.extension_name,
            sex: formData.sex,
            civil_status: formData.civil_status,
            citizenship: formData.citizenship,
            birthdate: formData.birthdate,
            birth_place_name: formData.birth_place_name,
            birth_place_code: formData.birth_place_code,
            education_attainment: formData.education_attainment,
            is_graduate: formData.is_graduate,
            employment_status: formData.employment_status,
            occupation_code: formData.occupation_code,
            occupation_title: formData.occupation_title,
          }}
          onChange={(field: string | number | symbol, value: string | number | boolean | null) => {
            // Direct field mapping (no conversion needed as both use snake_case)
            const fieldName = String(field);
            handleFieldChange(fieldName, value);
          }}
          errors={errors}
          onPsgcSearch={handlePsgcSearch}
          onPsocSearch={handlePsocSearch}
          psgcOptions={searchOptions.psgc}
          psocOptions={searchOptions.psoc}
          psgcLoading={searchLoading.psgc}
          psocLoading={searchLoading.psoc}
        />

        {/* Contact Information Section */}
        <ContactInformationForm
          mode={mode}
          formData={{
            // Direct snake_case properties (matching database schema)
            email: formData.email,
            telephone_number: formData.telephone_number,
            mobile_number: formData.mobile_number,
            household_code: formData.household_code,
          }}
          onChange={(field: string | number | symbol, value: string | number | boolean | null) => {
            // Direct field mapping (no conversion needed as both use snake_case)
            const fieldName = String(field);
            handleFieldChange(fieldName, value);
          }}
          errors={errors}
          onHouseholdSearch={handleHouseholdSearch}
          householdOptions={searchOptions.household}
          householdLoading={searchLoading.household}
        />

        {/* Physical Personal Details Section - Hidden in basic create mode */}
        {!hidePhysicalDetails && (
          <PhysicalPersonalDetailsForm
            mode={mode}
            formData={{
              // Direct snake_case properties (matching database schema)
              blood_type: formData.blood_type,
              complexion: formData.complexion,
              height: formData.height ? formData.height.toString() : '',
              weight: formData.weight ? formData.weight.toString() : '',
              ethnicity: formData.ethnicity,
              religion: formData.religion,
              religion_others_specify: formData.religion_others_specify,
              is_voter: formData.is_voter,
              is_resident_voter: formData.is_resident_voter,
              last_voted_date: formData.last_voted_date,
              mother_maiden_first: formData.mother_maiden_first,
              mother_maiden_middle: formData.mother_maiden_middle,
              mother_maiden_last: formData.mother_maiden_last,
            }}
            onChange={(
              field: string | number | symbol,
              value: string | number | boolean | null
            ) => {
              // Direct field mapping with type conversion for height/weight
              const fieldName = String(field);
              // Convert height/weight strings back to numbers for database
              let convertedValue = value;
              if ((fieldName === 'height' || fieldName === 'weight') && typeof value === 'string') {
                convertedValue = parseFloat(value) || 0;
              }
              handleFieldChange(fieldName, convertedValue);
            }}
            errors={errors}
          />
        )}

        {/* Sectoral Information Section - Hidden in basic create mode */}
        {!hideSectoralInfo && (
          <SectoralInformationForm
            mode={mode}
            formData={{
              // Sectoral classifications (matching database schema)
              is_labor_force_employed: formData.is_labor_force_employed,
              is_unemployed: formData.is_unemployed,
              is_overseas_filipino: formData.is_overseas_filipino_worker,
              is_person_with_disability: formData.is_person_with_disability,
              is_out_of_school_children: formData.is_out_of_school_children,
              is_out_of_school_youth: formData.is_out_of_school_youth,
              is_senior_citizen: formData.is_senior_citizen,
              is_registered_senior_citizen: formData.is_registered_senior_citizen,
              is_solo_parent: formData.is_solo_parent,
              is_indigenous_people: formData.is_indigenous_people,
              is_migrant: formData.is_migrant,
              // Context data for auto-calculation
              birthdate: formData.birthdate,
              employment_status: formData.employment_status,
              education_attainment: formData.education_attainment,
              civil_status: formData.civil_status,
              ethnicity: formData.ethnicity,
            }}
            onChange={handleFieldChange}
            errors={errors}
          />
        )}

        {/* Migration Information Section - Only show if migrant is checked */}
        {formData.is_migrant && (
          <MigrationInformation
            mode={mode}
            value={{
              previous_barangay_code: formData.previous_barangay_code,
              previous_city_municipality_code: formData.previous_city_municipality_code,
              previous_province_code: formData.previous_province_code,
              previous_region_code: formData.previous_region_code,
              length_of_stay_previous_months: formData.length_of_stay_previous_months,
              reason_for_leaving: formData.reason_for_leaving,
              date_of_transfer: formData.date_of_transfer,
              reason_for_transferring: formData.reason_for_transferring,
              duration_of_stay_current_months: formData.duration_of_stay_current_months,
              is_intending_to_return: formData.is_intending_to_return,
            }}
            onChange={migrationData => {
              handleFieldChange(
                'previous_barangay_code',
                migrationData.previous_barangay_code || ''
              );
              handleFieldChange(
                'previous_city_municipality_code',
                migrationData.previous_city_municipality_code || ''
              );
              handleFieldChange(
                'previous_province_code',
                migrationData.previous_province_code || ''
              );
              handleFieldChange('previous_region_code', migrationData.previous_region_code || '');
              handleFieldChange(
                'length_of_stay_previous_months',
                migrationData.length_of_stay_previous_months || 0
              );
              handleFieldChange('reason_for_leaving', migrationData.reason_for_leaving || '');
              handleFieldChange('date_of_transfer', migrationData.date_of_transfer || '');
              handleFieldChange(
                'reason_for_transferring',
                migrationData.reason_for_transferring || ''
              );
              handleFieldChange(
                'duration_of_stay_current_months',
                migrationData.duration_of_stay_current_months || 0
              );
              handleFieldChange(
                'is_intending_to_return',
                migrationData.is_intending_to_return || false
              );
            }}
            errors={errors}
          />
        )}

        {/* Form Actions - Submit/Cancel buttons */}
        <FormActions
          mode={mode}
          isSubmitting={isSubmitting}
          isOptimisticallyUpdated={false}
          onCancel={onCancel}
          errorCount={Object.keys(errors).length}
        />
      </form>
    </div>
  );
}

export default ResidentForm;
