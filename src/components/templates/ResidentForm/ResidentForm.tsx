'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { PersonalInformationForm, ContactInformationForm } from '@/components/organisms/Form';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';

interface ResidentFormData {
  // Personal Information
  firstName: string;
  middleName: string;
  lastName: string;
  extensionName: string;
  sex: string;
  civilStatus: string;
  citizenship: string;
  birthdate: string;
  birthPlaceName: string;
  birthPlaceCode: string;
  philsysCardNumber: string;
  educationAttainment: string;
  isGraduate: boolean;
  employmentStatus: string;
  psocCode: string;
  occupationTitle: string;

  // Contact Information
  email: string;
  phoneNumber: string;
  mobileNumber: string;
  householdCode: string;
}

interface ResidentFormProps {
  onSubmit?: (data: ResidentFormData) => void;
  onCancel?: () => void;
  initialData?: Partial<ResidentFormData>;
}

export function ResidentForm({ onSubmit, onCancel, initialData }: ResidentFormProps) {
  const { userProfile } = useAuth();
  const [formData, setFormData] = useState<ResidentFormData>({
    firstName: '',
    middleName: '',
    lastName: '',
    extensionName: '',
    sex: '',
    civilStatus: '',
    citizenship: '',
    birthdate: '',
    birthPlaceName: '',
    birthPlaceCode: '',
    philsysCardNumber: '',
    educationAttainment: '',
    isGraduate: false,
    employmentStatus: '',
    psocCode: '',
    occupationTitle: '',
    email: '',
    phoneNumber: '',
    mobileNumber: '',
    householdCode: '',
    ...initialData,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Household search state
  const [householdOptions, setHouseholdOptions] = useState<any[]>([]);
  const [householdLoading, setHouseholdLoading] = useState(false);

  // PSOC search state
  const [psocOptions, setPsocOptions] = useState<any[]>([]);
  const [psocLoading, setPsocLoading] = useState(false);

  // PSGC search state
  const [psgcOptions, setPsgcOptions] = useState<any[]>([]);
  const [psgcLoading, setPsgcLoading] = useState(false);

  // Handle PSOC search
  const handlePsocSearch = useCallback(async (query: string) => {
    if (!query.trim()) {
      // For empty query, just clear options and return - don't make API call
      setPsocOptions([]);
      setPsocLoading(false);
      return;
    }

    if (query.length < 2) {
      // Don't search with less than 2 characters, just clear options
      setPsocOptions([]);
      return;
    }

    setPsocLoading(true);
    try {
      const params = new URLSearchParams({
        q: query,
        limit: '20',
        levels: 'major_group,sub_major_group,unit_group,unit_sub_group,occupation',
        maxLevel: 'occupation',
        minLevel: 'major_group',
      });

      const response = await fetch(`/api/psoc/search?${params}`);
      
      if (!response.ok) {
        console.error('PSOC API error:', response.status, response.statusText);
        setPsocOptions([]);
        return;
      }

      const data = await response.json();

      if (data.data && data.data.length > 0) {
        const formattedOptions = data.data.map((item: any) => ({
          value: item.code,
          label: item.title,
          description: item.hierarchy,
          level_type: item.level,
          occupation_code: item.code,
          occupation_title: item.title,
        }));

        setPsocOptions(prev => {
          if (JSON.stringify(prev) !== JSON.stringify(formattedOptions)) {
            return formattedOptions;
          }
          return prev;
        });
      } else {
        setPsocOptions(prev => prev.length > 0 ? [] : prev);
      }
    } catch (error) {
      console.error('PSOC search error:', error);
      setPsocOptions([]);
    } finally {
      setPsocLoading(false);
    }
  }, []);

  // Handle PSGC search
  const handlePsgcSearch = useCallback(async (query: string) => {
    // Don't clear on empty - let Select component handle empty state
    if (!query || query.trim().length < 2) {
      setPsgcLoading(false);
      // Don't clear options here - keep existing results
      return;
    }

    setPsgcLoading(true);
    try {
      const params = new URLSearchParams({
        q: query,
        limit: '50',
        levels: 'province,city',
        maxLevel: 'city',
        minLevel: 'province',
      });

      const response = await fetch(`/api/psgc/search?${params}`);
      
      if (!response.ok) {
        console.error('PSGC API error:', response.status, response.statusText);
        setPsgcOptions([]);
        return;
      }

      const data = await response.json();

      if (data.data && data.data.length > 0) {
        // Simplified approach - just map the data directly
        const allOptions = data.data.map((item: any) => ({
          value: item.code || item.city_code || item.province_code,
          label: item.name || item.city_name || item.province_name,
          description: item.full_address || item.full_hierarchy,
          level: item.level,
          full_hierarchy: item.full_address || item.full_hierarchy,
          code: item.code || item.city_code || item.province_code,
        }));

        setPsgcOptions(allOptions);
      } else {
        setPsgcOptions([]);
      }
    } catch (error) {
      console.error('PSGC search error:', error);
      setPsgcOptions([]);
    } finally {
      setPsgcLoading(false);
    }
  }, []);

  // Handle household search
  const handleHouseholdSearch = useCallback(async (query: string) => {
    if (!userProfile?.barangay_code) {
      setHouseholdOptions([]);
      return;
    }

    if (!query.trim()) {
      // Load first few households for the barangay when no search query (for focus/initial display)
      setHouseholdLoading(true);
      try {
        const { data: householdsData, error } = await supabase
          .from('households')
          .select(`
            code,
            name,
            house_number,
            street_id,
            subdivision_id,
            barangay_code,
            household_head_id,
            geo_streets(id, name),
            geo_subdivisions(id, name, type)
          `)
          .eq('barangay_code', userProfile.barangay_code)
          .order('code', { ascending: true })
          .limit(10);

        if (error) {
          console.error('Error loading households:', error);
          setHouseholdOptions([]);
          return;
        }

        // Get head resident info for each household
        const householdsWithHeads = await Promise.all(
          (householdsData || []).map(async household => {
            let headResident = null;
            if (household.household_head_id) {
              const { data: headData } = await supabase
                .from('residents')
                .select('id, first_name, middle_name, last_name')
                .eq('id', household.household_head_id)
                .single();
              headResident = headData;
            }

            // Format address
            const addressParts = [
              household.house_number,
              household.geo_streets?.[0]?.name,
              household.geo_subdivisions?.[0]?.name,
            ].filter(Boolean);
            const address = addressParts.length > 0 ? addressParts.join(', ') : 'No address';

            // Format head name
            const headName = headResident 
              ? [headResident.first_name, headResident.middle_name, headResident.last_name].filter(Boolean).join(' ')
              : 'No head assigned';

            return {
              value: household.code,
              label: `Household #${household.code}`,
              description: `${headName} - ${address}`,
              code: household.code,
              head_name: headName,
              address: address,
            };
          })
        );

        setHouseholdOptions(householdsWithHeads);
      } catch (error) {
        console.error('Household search error:', error);
        setHouseholdOptions([]);
      } finally {
        setHouseholdLoading(false);
      }
      return;
    }

    // Search households based on query
    setHouseholdLoading(true);
    try {
      const { data: householdsData, error } = await supabase
        .from('households')
        .select(`
          code,
          name,
          house_number,
          street_id,
          subdivision_id,
          barangay_code,
          household_head_id,
          geo_streets(id, name),
          geo_subdivisions(id, name, type)
        `)
        .eq('barangay_code', userProfile.barangay_code)
        .or(`code.ilike.%${query}%,house_number.ilike.%${query}%`)
        .order('code', { ascending: true })
        .limit(20);

      if (error) {
        console.error('Error searching households:', error);
        setHouseholdOptions([]);
        return;
      }

      // Get head resident info and search by head name
      const householdsWithHeads = await Promise.all(
        (householdsData || []).map(async household => {
          let headResident = null;
          if (household.household_head_id) {
            const { data: headData } = await supabase
              .from('residents')
              .select('id, first_name, middle_name, last_name')
              .eq('id', household.household_head_id)
              .single();
            headResident = headData;
          }

          // Format address
          const addressParts = [
            household.house_number,
            household.geo_streets?.[0]?.name,
            household.geo_subdivisions?.[0]?.name,
          ].filter(Boolean);
          const address = addressParts.length > 0 ? addressParts.join(', ') : 'No address';

          // Format head name
          const headName = headResident 
            ? [headResident.first_name, headResident.middle_name, headResident.last_name].filter(Boolean).join(' ')
            : 'No head assigned';

          return {
            value: household.code,
            label: `Household #${household.code}`,
            description: `${headName} - ${address}`,
            code: household.code,
            head_name: headName,
            address: address,
          };
        })
      );

      // Filter by head name if query doesn't match code or house number
      const filtered = householdsWithHeads.filter(household => 
        household.code.toLowerCase().includes(query.toLowerCase()) ||
        household.head_name.toLowerCase().includes(query.toLowerCase()) ||
        household.address.toLowerCase().includes(query.toLowerCase())
      );

      setHouseholdOptions(filtered);
    } catch (error) {
      console.error('Household search error:', error);
      setHouseholdOptions([]);
    } finally {
      setHouseholdLoading(false);
    }
  }, [userProfile?.barangay_code]);

  // Load households on component mount
  useEffect(() => {
    handleHouseholdSearch('');
  }, [handleHouseholdSearch]);

  // Handle form field changes
  const handleFieldChange = (field: string | number | symbol, value: string | number | boolean | null) => {
    const fieldKey = String(field);
    setFormData(prev => ({
      ...prev,
      [fieldKey]: value,
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
      // Basic validation
      const newErrors: Record<string, string> = {};
      
      if (!formData.firstName.trim()) newErrors.firstName = 'First name is required';
      if (!formData.lastName.trim()) newErrors.lastName = 'Last name is required';
      if (!formData.sex) newErrors.sex = 'Sex is required';
      if (!formData.birthdate) newErrors.birthdate = 'Birth date is required';

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
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
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Personal Information Section */}
      <PersonalInformationForm
        formData={formData}
        onChange={handleFieldChange}
        errors={errors}
        onPsgcSearch={handlePsgcSearch}
        onPsocSearch={handlePsocSearch}
        psgcOptions={psgcOptions}
        psocOptions={psocOptions}
        psgcLoading={psgcLoading}
        psocLoading={psocLoading}
      />

      {/* Contact Information Section */}
      <ContactInformationForm
        formData={formData}
        onChange={handleFieldChange}
        errors={errors}
        onHouseholdSearch={handleHouseholdSearch}
        householdOptions={householdOptions}
        householdLoading={householdLoading}
      />

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
  );
}

export default ResidentForm;