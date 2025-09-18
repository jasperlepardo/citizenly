'use client';

import React, { useState, useCallback, useEffect } from 'react';

import {
  PersonalInformationForm,
  ContactInformationForm,
  PhysicalPersonalDetailsForm,
  SectoralInformationForm,
  MigrationInformation,
} from '@/components/organisms/FormSection';
import { useAuth } from '@/contexts';
import { useFieldLoading } from '@/hooks/utilities/useFieldLoading';
import { isIndigenousPeople } from '@/services/domain/residents/residentClassification';
import { supabase } from '@/lib/data/supabase';
import type { FormMode } from '@/types';
import { ResidentFormData } from '@/types/domain/residents/forms';

import { FormActions } from './components/FormActions';
import { FormHeader } from './components/FormHeader';

interface ResidentFormProps {
  mode?: FormMode;
  onSubmit?: (data: ResidentFormData) => void;
  onCancel?: () => void;
  initialData?: Partial<ResidentFormData>;
  onModeChange?: (mode: FormMode) => void;
  hidePhysicalDetails?: boolean;
  hideSectoralInfo?: boolean;
  onChange?: (data: ResidentFormData) => void;
  // Progressive loading states from parent component
  loading?: boolean;
  sectionLoadingStates?: {
    basic_info?: boolean;
    address_info?: boolean;
    birth_place_info?: boolean;
    sectoral_info?: boolean;
    contact_info?: boolean;
  };
}

// Helper function to get sectoral classifications based on ethnicity
const getSectoralClassificationsByEthnicity = (ethnicity: string): Partial<ResidentFormData> => {
  console.log('🔍 getSectoralClassificationsByEthnicity: Called with ethnicity:', ethnicity);
  const updates: Partial<ResidentFormData> = {};

  // Reset all sectoral classifications first (except manually set ones)
  updates.is_indigenous_people = false;

  // Indigenous peoples classification - automatically set to true
  const isIndigenous = isIndigenousPeople(ethnicity);
  console.log('🔍 getSectoralClassificationsByEthnicity: isIndigenousPeople result:', isIndigenous);
  if (isIndigenous) {
    updates.is_indigenous_people = true;
    console.log('🔍 getSectoralClassificationsByEthnicity: Setting is_indigenous_people to true');
  }
  
  console.log('🔍 getSectoralClassificationsByEthnicity: Final updates:', updates);

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
  loading: externalLoading = false,
  sectionLoadingStates = {},
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
      philsys_card_number: '',
      education_attainment: '', // No database default
      is_graduate: false, // Will be set from defaults
      employment_status: '', // No database default
      occupation_code: '',
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
      is_voter: false, // Default to false for boolean validation
      is_resident_voter: false, // Default to false for boolean validation
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
      date_of_transfer: '',
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

    // Don't automatically notify parent of initial data to avoid infinite loops
    // The parent should use initialData or handle changes via handleFieldChange

    return finalFormData;
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Field-level loading states for granular user feedback
  const {
    getFieldLoading
  } = useFieldLoading();

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
    console.log('🔍 ResidentForm: handlePsocSearch called with query:', query);

    if (!query || query.trim().length < 2) {
      console.log('🔍 ResidentForm: Query too short, clearing options');
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

      console.log('🔍 ResidentForm: Making PSOC API call with params:', params.toString());
      const response = await fetch(`/api/psoc/search?${params}`);
      console.log('🔍 ResidentForm: PSOC API response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('🔍 ResidentForm: PSOC API response data:', data);

        if (data.data && Array.isArray(data.data)) {
          const mappedOptions = data.data.map((item: any) => ({
            value: item.code,
            label: item.title,
            description: item.hierarchy,
            level_type: item.level,
            occupation_code: item.code,
            occupation_title: item.title,
          }));

          console.log('🔍 ResidentForm: Mapped PSOC options:', mappedOptions);

          setSearchOptions(prev => ({
            ...prev,
            psoc: mappedOptions,
          }));
        } else {
          console.log('⚠️ ResidentForm: No data in PSOC API response');
        }
      } else {
        console.error('❌ ResidentForm: PSOC API returned error status:', response.status);
      }
    } catch (error) {
      console.error('❌ ResidentForm: PSOC search error:', error);
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
    
    // Debug specific fields we're tracking
    if (fieldKey === 'birth_place_code' || fieldKey === 'occupation_code' || fieldKey === 'ethnicity') {
      console.log(`🔍 ResidentForm: handleFieldChange called for ${fieldKey}:`, value);
      console.log(`🔍 ResidentForm: Current formData.${fieldKey}:`, formData[fieldKey as keyof ResidentFormData]);
    }
    
    // Debug sectoral fields
    if (fieldKey.startsWith('is_')) {
      console.log(`🔍 ResidentForm: handleFieldChange called for sectoral field ${fieldKey}:`, value);
      console.log(`🔍 ResidentForm: Current formData.${fieldKey}:`, formData[fieldKey as keyof ResidentFormData]);
    }

    // Handle household batch update to avoid race condition
    if (fieldKey === '__household_batch__' && value && typeof value === 'object') {
      const householdData = value as any;

      const updatedData: Partial<ResidentFormData> = {
        household_code: householdData.household_code || '',
        household_name: householdData.household_name || '',
      };

      const newFormData = {
        ...formData,
        ...updatedData,
      };

      setFormData(newFormData);

      // Notify parent component of changes
      if (onChange) {
        onChange(newFormData);
      }

      // Clear errors for both household fields
      if (errors.household_code || errors.household_name) {
        setErrors(prev => ({
          ...prev,
          household_code: '',
          household_name: '',
        }));
      }

      return; // Exit early for batch update
    }

    // Handle physical characteristics batch update to avoid race condition
    if (fieldKey === '__physical_characteristics_batch__' && value && typeof value === 'object') {
      const physicalData = value as Record<string, string>;
      
      console.log('🔍 ResidentForm: Processing physical characteristics batch update:', physicalData);

      let updatedData: Partial<ResidentFormData> = {
        ...physicalData,
      };

      // Special handling for ethnicity within the batch
      if (physicalData.ethnicity) {
        console.log('🎯 ResidentForm: ETHNICITY IN BATCH:', physicalData.ethnicity);
        const sectoralUpdates = getSectoralClassificationsByEthnicity(physicalData.ethnicity);
        console.log('🎯 ResidentForm: Adding sectoral updates to batch:', sectoralUpdates);
        updatedData = { ...updatedData, ...sectoralUpdates };
      }

      const newFormData = {
        ...formData,
        ...updatedData,
      };

      console.log('🎯 ResidentForm: BATCH UPDATE COMPLETE:', {
        ethnicity: newFormData.ethnicity,
        is_indigenous_people: newFormData.is_indigenous_people
      });

      setFormData(newFormData);

      // Notify parent component of changes
      if (onChange) {
        onChange(newFormData);
      }

      return; // Exit early for batch update
    }

    // Handle employment occupation batch update to avoid race condition
    if (fieldKey === '__employment_occupation_batch__' && value && typeof value === 'object') {
      const occupationData = value as any;
      
      console.log('🔍 ResidentForm: Processing occupation batch update:', occupationData);

      const updatedData: Partial<ResidentFormData> = {
        occupation_code: occupationData.occupation_code || '',
        occupation_title: occupationData.occupation_title || '',
      };

      const newFormData = {
        ...formData,
        ...updatedData,
      };

      console.log('🔍 ResidentForm: Updated form data with occupation:', {
        occupation_code: newFormData.occupation_code,
        occupation_title: newFormData.occupation_title,
      });

      setFormData(newFormData);

      // Notify parent component of changes
      if (onChange) {
        onChange(newFormData);
      }

      // Clear errors for both occupation fields
      if (errors.occupation_code || errors.occupation_title) {
        setErrors(prev => ({
          ...prev,
          occupation_code: '',
          occupation_title: '',
        }));
      }

      return; // Exit early for batch update
    }

    // Handle sectoral batch update to avoid race condition
    if (fieldKey === '__sectoral_batch__' && value && typeof value === 'object') {
      const sectoralData = value as Record<string, boolean | string | null>;
      
      console.log('🔍 ResidentForm: Processing sectoral batch update:', sectoralData);

      const updatedData: Partial<ResidentFormData> = { ...sectoralData };

      const newFormData = {
        ...formData,
        ...updatedData,
      };

      console.log('🔍 ResidentForm: Updated form data with sectoral fields:', {
        is_senior_citizen: newFormData.is_senior_citizen,
        is_unemployed: newFormData.is_unemployed,
        is_labor_force_employed: newFormData.is_labor_force_employed,
      });

      setFormData(newFormData);

      // Notify parent component of changes
      if (onChange) {
        onChange(newFormData);
      }

      // Clear errors for sectoral fields
      const sectoralFields = Object.keys(sectoralData);
      const hasErrors = sectoralFields.some(field => errors[field]);
      if (hasErrors) {
        setErrors(prev => {
          const newErrors = { ...prev };
          sectoralFields.forEach(field => {
            newErrors[field] = '';
          });
          return newErrors;
        });
      }

      return; // Exit early for batch update
    }

    // Start with the basic field update
    let updatedData: Partial<ResidentFormData> = {
      [fieldKey]: value,
    };

    if (fieldKey === 'ethnicity' && typeof value === 'string') {
      console.log('🎯 ResidentForm: ETHNICITY FIELD RECEIVED:', value);
      if (value === 'badjao') {
        console.log('🎯 ResidentForm: BADJAO DETECTED - PROCESSING AUTO-CALCULATION!');
      }
      
      // Auto-update sectoral classifications based on ethnicity
      const sectoralUpdates = getSectoralClassificationsByEthnicity(value);
      console.log('🔍 ResidentForm: Adding sectoral updates to ethnicity change:', sectoralUpdates);
      updatedData = { ...updatedData, ...sectoralUpdates };
      
      // Create an atomic update that includes both ethnicity and sectoral changes
      const atomicUpdate = {
        ethnicity: value,
        ...sectoralUpdates,
      };
      
      console.log('🎯 ResidentForm: ATOMIC UPDATE OBJECT:', atomicUpdate);
      
      // Apply the atomic update to ensure proper state propagation
      const newFormData = { ...formData, ...atomicUpdate };
      console.log('🎯 ResidentForm: NEW FORM DATA AFTER ETHNICITY UPDATE:', {
        ethnicity: newFormData.ethnicity,
        is_indigenous_people: newFormData.is_indigenous_people
      });
      
      setFormData(newFormData);
      
      // Notify parent component of changes
      if (onChange) {
        onChange(newFormData);
      }
      
      console.log('🔍 ResidentForm: Applied atomic ethnicity update:', atomicUpdate);
      return; // Exit early to avoid duplicate state update
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
      if (!formData.household_code || !formData.household_code.trim()) {
        newErrors.household_code = 'Household assignment is required';
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        setIsSubmitting(false);
        return;
      }

      // Call onSubmit callback
      if (onSubmit) {
        // Create a filtered version of form data that excludes hidden fields
        const filteredFormData = { ...formData };
        
        // Clean up undefined values to prevent validation errors
        Object.keys(filteredFormData).forEach(key => {
          const value = filteredFormData[key as keyof ResidentFormData];
          if (value === undefined || value === null) {
            // Convert undefined/null to empty string for string fields
            (filteredFormData as any)[key] = '';
          }
        });

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
        console.log('🚀 RESIDENTFORM: filteredFormData birth_place_code:', filteredFormData.birth_place_code);
        console.log('🚀 RESIDENTFORM: filteredFormData occupation_code:', filteredFormData.occupation_code);
        console.log('🚀 RESIDENTFORM: formData birth_place_code:', formData.birth_place_code);
        console.log('🚀 RESIDENTFORM: formData occupation_code:', formData.occupation_code);
        console.log('🚀 RESIDENTFORM: hidePhysicalDetails:', hidePhysicalDetails);
        console.log('🚀 RESIDENTFORM: hideSectoralInfo:', hideSectoralInfo);

        onSubmit(filteredFormData);
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
          loading={isSubmitting || sectionLoadingStates?.basic_info}
          loadingStates={{
            first_name: getFieldLoading('first_name') || sectionLoadingStates?.basic_info,
            middle_name: getFieldLoading('middle_name') || sectionLoadingStates?.basic_info,
            last_name: getFieldLoading('last_name') || sectionLoadingStates?.basic_info,
            extension_name: getFieldLoading('extension_name') || sectionLoadingStates?.basic_info,
            sex: getFieldLoading('sex') || sectionLoadingStates?.basic_info,
            civil_status: getFieldLoading('civil_status') || sectionLoadingStates?.basic_info,
            civil_status_others_specify: getFieldLoading('civil_status_others_specify') || sectionLoadingStates?.basic_info,
            citizenship: getFieldLoading('citizenship') || sectionLoadingStates?.basic_info,
            birthdate: getFieldLoading('birthdate') || sectionLoadingStates?.birth_place_info,
            birth_place_name: getFieldLoading('birth_place_name') || sectionLoadingStates?.birth_place_info,
            birth_place_code: getFieldLoading('birth_place_code') || sectionLoadingStates?.birth_place_info,
            philsys_card_number: getFieldLoading('philsys_card_number') || sectionLoadingStates?.basic_info,
            education_attainment: getFieldLoading('education_attainment') || sectionLoadingStates?.basic_info,
            is_graduate: getFieldLoading('is_graduate') || sectionLoadingStates?.basic_info,
            employment_status: getFieldLoading('employment_status') || sectionLoadingStates?.basic_info,
            occupation_code: getFieldLoading('occupation_code') || sectionLoadingStates?.basic_info,
            occupation_title: getFieldLoading('occupation_title') || sectionLoadingStates?.basic_info,
          }}
          sectionLoadingStates={{
            basic_info: sectionLoadingStates?.basic_info,
            birth_place_info: sectionLoadingStates?.birth_place_info,
            employment_info: false, // Employment data loads with main form
            education_info: false, // Education data loads with main form
          }}
        />

        {/* Contact Information Section */}
        <ContactInformationForm
          mode={mode}
          formData={{
            // Direct snake_case properties (matching database schema)
            email: formData.email || '',
            telephone_number: formData.telephone_number || '',
            mobile_number: formData.mobile_number || '',
            household_code: formData.household_code || '',
            household_name: formData.household_name || '',
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
          loadingStates={{
            email: sectionLoadingStates?.contact_info,
            telephone_number: sectionLoadingStates?.contact_info,
            mobile_number: sectionLoadingStates?.contact_info,
            household_code: sectionLoadingStates?.contact_info,
            household_name: sectionLoadingStates?.contact_info,
          }}
        />

        {/* Physical Personal Details Section - Hidden in basic create mode */}
        {!hidePhysicalDetails && (
          <PhysicalPersonalDetailsForm
            mode={mode}
            formData={{
              // Direct snake_case properties (matching database schema)
              blood_type: formData.blood_type || '',
              complexion: formData.complexion || '',
              height: formData.height ? formData.height.toString() : '',
              weight: formData.weight ? formData.weight.toString() : '',
              ethnicity: formData.ethnicity || '',
              religion: formData.religion || '',
              religion_others_specify: formData.religion_others_specify || '',
              is_voter: formData.is_voter ?? false,
              is_resident_voter: formData.is_resident_voter ?? false,
              last_voted_date: formData.last_voted_date || '',
              mother_maiden_first: formData.mother_maiden_first || '',
              mother_maiden_middle: formData.mother_maiden_middle || '',
              mother_maiden_last: formData.mother_maiden_last || '',
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
            loadingStates={{
              blood_type: sectionLoadingStates?.basic_info,
              complexion: sectionLoadingStates?.basic_info,
              height: sectionLoadingStates?.basic_info,
              weight: sectionLoadingStates?.basic_info,
              citizenship: sectionLoadingStates?.basic_info,
              ethnicity: sectionLoadingStates?.basic_info,
              religion: sectionLoadingStates?.basic_info,
              is_voter: sectionLoadingStates?.basic_info,
              is_resident_voter: sectionLoadingStates?.basic_info,
              last_voted_date: sectionLoadingStates?.basic_info,
              mother_maiden_first: sectionLoadingStates?.basic_info,
              mother_maiden_middle: sectionLoadingStates?.basic_info,
              mother_maiden_last: sectionLoadingStates?.basic_info,
            }}
          />
        )}

        {/* Sectoral Information Section - Hidden in basic create mode */}
        {!hideSectoralInfo && (
          <SectoralInformationForm
            mode={mode}
            formData={formData}
            onChange={handleFieldChange}
            loading={isSubmitting}
            sectionLoadingStates={{
              sectoral_info: sectionLoadingStates?.sectoral_info,
            }}
          />
        )}

        {/* Migration Information Section - Only show if migrant is checked */}
        {formData.is_migrant && (
          <MigrationInformation
            mode={mode}
            value={{
              previous_barangay_code: formData.previous_barangay_code || undefined,
              previous_city_municipality_code:
                formData.previous_city_municipality_code || undefined,
              previous_province_code: formData.previous_province_code || undefined,
              previous_region_code: formData.previous_region_code || undefined,
              length_of_stay_previous_months: formData.length_of_stay_previous_months || undefined,
              reason_for_migration: formData.reason_for_migration || undefined,
              date_of_transfer: formData.date_of_transfer || undefined,
              migration_type: formData.migration_type || undefined,
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
              handleFieldChange('reason_for_migration', migrationData.reason_for_migration || '');
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
