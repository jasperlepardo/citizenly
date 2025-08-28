/**
 * Utility functions for resident data processing
 * Extracted from components for reusability and maintainability
 */

import type { Session } from '@supabase/supabase-js';

import { supabase } from '@/lib/data/supabase';
import { ResidentWithRelations } from '@/types';

/**
 * Initialize missing fields in resident data with default values
 * Ensures all expected fields are present for form consumption
 */
export const initializeResidentFields = (residentData: Partial<ResidentWithRelations>): ResidentWithRelations => {
  // Set required fields with defaults if missing
  const baseData: ResidentWithRelations = {
    id: residentData.id || '',
    first_name: residentData.first_name || '',
    last_name: residentData.last_name || '',
    birthdate: residentData.birthdate || '',
    sex: residentData.sex || 'male',
    created_at: residentData.created_at || '',
    updated_at: residentData.updated_at || '',
    is_active: residentData.is_active ?? true,
    is_graduate: residentData.is_graduate ?? false,
    ...residentData,
    telephone_number: residentData.telephone_number || '',
    philsys_card_number: residentData.philsys_card_number || '',
    height: residentData.height || null,
    weight: residentData.weight || null,
    complexion: residentData.complexion || '',
    mother_maiden_first: residentData.mother_maiden_first || '',
    mother_maiden_middle: residentData.mother_maiden_middle || '',
    mother_maiden_last: residentData.mother_maiden_last || '',
  };

  return baseData;
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
  } = await supabase.auth.getSession();
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
