/**
 * Utility functions for resident data processing
 * Extracted from components for reusability and maintainability
 */

import type { Session } from '@supabase/supabase-js';
import { ResidentWithRelations } from '@/types';

/**
 * Initialize missing fields in resident data with default values
 * Ensures all expected fields are present for form consumption
 */
export const initializeResidentFields = (residentData: Partial<ResidentWithRelations>): ResidentWithRelations => {
  return {
    ...residentData,
    telephone_number: residentData.telephone_number || '',
    philsys_card_number: residentData.philsys_card_number || '',
    workplace: residentData.workplace || '',
    height_cm: residentData.height_cm || undefined,
    weight_kg: residentData.weight_kg || undefined,
    complexion: residentData.complexion || '',
    mother_first_name: residentData.mother_first_name || '',
    mother_middle_name: residentData.mother_middle_name || '',
    mother_maiden_last_name: residentData.mother_maiden_last_name || '',
    migration_info: residentData.migration_info || {
      is_migrant: false,
      migration_type: null,
      previous_address: '',
      previous_country: '',
      migration_reason: null,
      migration_date: null,
      documentation_status: null,
      is_returning_resident: false,
    },
  };
};

/**
 * Get tooltip content for computed fields
 * Provides helpful explanations for auto-calculated values
 */
export const getComputedFieldTooltip = (field: keyof ResidentWithRelations): string => {
  switch (field) {
    case 'is_employed':
      return `Automatically calculated from Employment Status. Includes: employed, self-employed`;
    case 'is_unemployed':
      return `Automatically calculated from Employment Status. Only when status is 'unemployed'`;
    case 'is_senior_citizen':
      return `Automatically calculated from Date of Birth. Senior citizen when age is 60 or above`;
    default:
      return 'This field is automatically calculated';
  }
};

/**
 * Validate and get authentication session
 * Centralized auth validation for API calls
 */
export const getAuthSession = async () => {
  const {
    data: { session },
  } = await import('@/lib/data/supabase').then(m => m.supabase.auth.getSession());
  if (!session?.access_token) {
    throw new Error('No valid session found');
  }
  return session;
};

/**
 * Fetch resident data from API with proper error handling
 * Centralized API call with consistent error handling
 */
export const fetchResidentData = async (residentId: string, session: Session) => {
  const response = await fetch(`/api/residents/${residentId}`, {
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
};
