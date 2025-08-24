'use client';

import React, { useState, useCallback, useRef } from 'react';
import { PersonalInformationForm, ContactInformationForm, PhysicalPersonalDetailsForm, SectoralInformationForm, MigrationInformation } from '@/components/organisms/Form';
import { ReadOnly } from '@/components/atoms/Field/ReadOnly';
import { FormHeader } from './components/FormHeader';
import { FormActions } from './components/FormActions';
import { useAuth } from '@/contexts/AuthContext';
import { ResidentFormState } from '@/types/resident-form';
import type { FormMode } from '@/types/forms';
import { isIndigenousPeople } from '@/lib/business-rules/sectoral-classification';

// Use the database-aligned ResidentFormState interface
type ResidentFormData = ResidentFormState;

interface ResidentFormProps {
  mode?: FormMode;
  onSubmit?: (data: ResidentFormData) => void;
  onCancel?: () => void;
  initialData?: Partial<ResidentFormData>;
  onModeChange?: (mode: FormMode) => void;
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
  // - is_labor_force: Cannot be determined by ethnicity
  // - is_overseas_filipino_worker: Cannot be determined by ethnicity
  
  // For now, we only auto-set is_indigenous_people as it's directly determinable from ethnicity
  // Other classifications should be manually selected by the user
  
  return updates;
};

// Database default values matching schema.sql + UX defaults for required fields
const DEFAULT_FORM_VALUES: Partial<ResidentFormData> = {
  // Database defaults
  civil_status: 'single', // Database default
  citizenship: 'filipino', // Database default
  is_graduate: false, // Database default
  
  // UX defaults for required fields without database defaults
  sex: 'male', // No database default but required - provide UX default
  
  // Note: ethnicity, blood_type, religion are nullable - no defaults
};

export function ResidentForm({ 
  mode = 'create', 
  onSubmit, 
  onCancel, 
  initialData,
  onModeChange 
}: ResidentFormProps) {
  // Auth context
  const { userProfile } = useAuth();
  
  // Search options state - need state for re-renders when options change
  const [searchOptions, setSearchOptions] = useState({
    psgc: [] as any[],
    psoc: [] as any[],
    household: [] as any[]
  });
  
  const [searchLoading, setSearchLoading] = useState({
    psgc: false,
    psoc: false,
    household: false
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
      height: 0,
      weight: 0,
      ethnicity: '', // Nullable field - no default
      religion: '', // Nullable field - no default
      religion_others_specify: '',
    is_voter: null,
    is_resident_voter: null,
    last_voted_date: '',
    mother_maiden_first: '',
    mother_maiden_middle: '',
    mother_maiden_last: '',
    
    // Sectoral Information - database field names
    is_labor_force: false,
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

    // Apply database defaults
    const formWithDefaults = {
      ...baseFormData,
      ...DEFAULT_FORM_VALUES,
    };

    // Merge with initialData if provided
    return initialData ? { ...formWithDefaults, ...initialData } : formWithDefaults;
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
          setSearchOptions(prev => ({ ...prev, psgc: data.data.map((item: any) => ({
            value: item.code || item.city_code || item.province_code,
            label: item.name || item.city_name || item.province_name,
            description: item.full_address || item.full_hierarchy,
            level: item.level,
            code: item.code || item.city_code || item.province_code,
          })) }));
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
          setSearchOptions(prev => ({ ...prev, psoc: data.data.map((item: any) => ({
            value: item.code,
            label: item.title,
            description: item.hierarchy,
            level_type: item.level,
            occupation_code: item.code,
            occupation_title: item.title,
          })) }));
        }
      }
    } catch (error) {
      console.error('PSOC search error:', error);
      setSearchOptions(prev => ({ ...prev, psoc: [] }));
    } finally {
      setSearchLoading(prev => ({ ...prev, psoc: false }));
    }
  }, []);

  const handleHouseholdSearch = useCallback(async (query: string) => {
    if (!userProfile?.barangay_code) {
      setSearchOptions(prev => ({ ...prev, household: [] }));
      return;
    }

    setSearchLoading(prev => ({ ...prev, household: true }));
    try {
      // Simple mock household data for production
      // Replace with actual API call when ready
      const mockHouseholds = [
        { value: 'HH001', label: 'Household #HH001', description: 'Sample household' },
        { value: 'HH002', label: 'Household #HH002', description: 'Sample household 2' },
      ];
      
      const filtered = mockHouseholds.filter(h => 
        !query || h.label.toLowerCase().includes(query.toLowerCase())
      );
      
      setSearchOptions(prev => ({ ...prev, household: filtered }));
    } catch (error) {
      console.error('Household search error:', error);
      setSearchOptions(prev => ({ ...prev, household: [] }));
    } finally {
      setSearchLoading(prev => ({ ...prev, household: false }));
    }
  }, [userProfile?.barangay_code]);

  // Handle form field changes
  const handleFieldChange = (field: string | number | symbol, value: string | number | boolean | null) => {
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
    
    setFormData(prev => ({
      ...prev,
      ...updatedData,
    }));

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
        await onSubmit(formData);
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
          // Map database field names to component expected names
          philsysCardNumber: formData.philsys_card_number,
          firstName: formData.first_name,
          middleName: formData.middle_name,
          lastName: formData.last_name,
          extensionName: formData.extension_name,
          sex: formData.sex,
          civilStatus: formData.civil_status,
          citizenship: formData.citizenship,
          birthdate: formData.birthdate,
          birthPlaceName: formData.birth_place_name,
          birthPlaceCode: formData.birth_place_code,
          educationAttainment: formData.education_attainment,
          isGraduate: formData.is_graduate,
          employmentStatus: formData.employment_status,
          psocCode: formData.occupation_code,
          occupationTitle: formData.occupation_title,
        }}
        onChange={(field: string | number | symbol, value: string | number | boolean | null) => {
          // Map component field names back to database field names
          const fieldName = String(field);
          const fieldMap: Record<string, string> = {
            'philsysCardNumber': 'philsys_card_number',
            'firstName': 'first_name',
            'middleName': 'middle_name',
            'lastName': 'last_name',
            'extensionName': 'extension_name',
            'sex': 'sex',
            'civilStatus': 'civil_status',
            'citizenship': 'citizenship',
            'birthdate': 'birthdate',
            'birthPlaceName': 'birth_place_name',
            'birthPlaceCode': 'birth_place_code',
            'educationAttainment': 'education_attainment',
            'isGraduate': 'is_graduate',
            'employmentStatus': 'employment_status',
            'psocCode': 'occupation_code',
            'occupationTitle': 'occupation_title',
          };
          const dbFieldName = fieldMap[fieldName] || fieldName;
          handleFieldChange(dbFieldName, value);
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
          // Map database field names to component expected names
          email: formData.email,
          phoneNumber: formData.telephone_number,
          mobileNumber: formData.mobile_number,
          householdCode: formData.household_code,
        }}
        onChange={(field: string | number | symbol, value: string | number | boolean | null) => {
          // Map component field names back to database field names
          const fieldName = String(field);
          const fieldMap: Record<string, string> = {
            'email': 'email',
            'phoneNumber': 'telephone_number',
            'mobileNumber': 'mobile_number',
            'householdCode': 'household_code',
          };
          const dbFieldName = fieldMap[fieldName] || fieldName;
          handleFieldChange(dbFieldName, value);
        }}
        errors={errors}
        onHouseholdSearch={handleHouseholdSearch}
        householdOptions={searchOptions.household}
        householdLoading={searchLoading.household}
      />

      {/* Physical Personal Details Section */}
      <PhysicalPersonalDetailsForm
        mode={mode}
        formData={{
          // Map database field names to component expected names
          bloodType: formData.blood_type,
          complexion: formData.complexion,
          height: formData.height.toString(),
          weight: formData.weight.toString(),
          ethnicity: formData.ethnicity,
          religion: formData.religion,
          religionOthersSpecify: formData.religion_others_specify,
          isVoter: formData.is_voter,
          isResidentVoter: formData.is_resident_voter,
          lastVotedDate: formData.last_voted_date,
          motherMaidenFirstName: formData.mother_maiden_first,
          motherMaidenMiddleName: formData.mother_maiden_middle,
          motherMaidenLastName: formData.mother_maiden_last,
        }}
        onChange={(field: string | number | symbol, value: string | number | boolean | null) => {
          // Map component field names back to database field names
          const fieldName = String(field);
          const fieldMap: Record<string, string> = {
            'bloodType': 'blood_type',
            'complexion': 'complexion',
            'height': 'height',
            'weight': 'weight',
            'ethnicity': 'ethnicity',
            'religion': 'religion',
            'religionOthersSpecify': 'religion_others_specify',
            'isVoter': 'is_voter',
            'isResidentVoter': 'is_resident_voter',
            'lastVotedDate': 'last_voted_date',
            'motherMaidenFirstName': 'mother_maiden_first',
            'motherMaidenMiddleName': 'mother_maiden_middle',
            'motherMaidenLastName': 'mother_maiden_last',
          };
          const dbFieldName = fieldMap[fieldName] || fieldName;
          // Convert height/weight strings back to numbers for database
          let convertedValue = value;
          if ((dbFieldName === 'height' || dbFieldName === 'weight') && typeof value === 'string') {
            convertedValue = parseFloat(value) || 0;
          }
          handleFieldChange(dbFieldName, convertedValue);
        }}
        errors={errors}
      />

      {/* Sectoral Information Section */}
      <SectoralInformationForm
        mode={mode}
        formData={{
          // Map database field names to component expected names
          isLaborForce: formData.is_labor_force,
          isLaborForceEmployed: formData.is_labor_force_employed,
          isUnemployed: formData.is_unemployed,
          isOverseasFilipino: formData.is_overseas_filipino_worker,
          isPersonWithDisability: formData.is_person_with_disability,
          isOutOfSchoolChildren: formData.is_out_of_school_children,
          isOutOfSchoolYouth: formData.is_out_of_school_youth,
          isSeniorCitizen: formData.is_senior_citizen,
          isRegisteredSeniorCitizen: formData.is_registered_senior_citizen,
          isSoloParent: formData.is_solo_parent,
          isIndigenousPeople: formData.is_indigenous_people,
          isMigrant: formData.is_migrant,
        }}
        onChange={(field: string | number | symbol, value: string | number | boolean | null) => {
          // Map component field names back to database field names
          const fieldName = String(field);
          const fieldMap: Record<string, string> = {
            'isLaborForce': 'is_labor_force',
            'isLaborForceEmployed': 'is_labor_force_employed',
            'isUnemployed': 'is_unemployed',
            'isOverseasFilipino': 'is_overseas_filipino_worker',
            'isPersonWithDisability': 'is_person_with_disability',
            'isOutOfSchoolChildren': 'is_out_of_school_children',
            'isOutOfSchoolYouth': 'is_out_of_school_youth',
            'isSeniorCitizen': 'is_senior_citizen',
            'isRegisteredSeniorCitizen': 'is_registered_senior_citizen',
            'isSoloParent': 'is_solo_parent',
            'isIndigenousPeople': 'is_indigenous_people',
            'isMigrant': 'is_migrant',
          };
          const dbFieldName = fieldMap[fieldName] || fieldName;
          handleFieldChange(dbFieldName, value);
        }}
        errors={errors}
      />

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
          onChange={(migrationData) => {
            handleFieldChange('previous_barangay_code', migrationData.previous_barangay_code || '');
            handleFieldChange('previous_city_municipality_code', migrationData.previous_city_municipality_code || '');
            handleFieldChange('previous_province_code', migrationData.previous_province_code || '');
            handleFieldChange('previous_region_code', migrationData.previous_region_code || '');
            handleFieldChange('length_of_stay_previous_months', migrationData.length_of_stay_previous_months || 0);
            handleFieldChange('reason_for_leaving', migrationData.reason_for_leaving || '');
            handleFieldChange('date_of_transfer', migrationData.date_of_transfer || '');
            handleFieldChange('reason_for_transferring', migrationData.reason_for_transferring || '');
            handleFieldChange('duration_of_stay_current_months', migrationData.duration_of_stay_current_months || 0);
            handleFieldChange('is_intending_to_return', migrationData.is_intending_to_return || false);
          }}
          errors={errors}
        />
      )}

      {/* Form Actions */}
      <div className="flex justify-end space-x-4">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Saving...' : 'Save Resident'}
        </button>
      </div>
    </form>
    </div>
  );
}

export default ResidentForm;