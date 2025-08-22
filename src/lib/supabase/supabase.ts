/**
 * Supabase Client Configuration
 * Multi-environment Supabase client for RBI System
 */

import { createClient } from '@supabase/supabase-js';
import {
  getSupabaseConfig,
  validateEnvironment,
  createLogger,
  isProductionLike,
} from '../environment';

const logger = createLogger('Supabase');

// Get environment-specific Supabase configuration
const { url, anonKey, options } = getSupabaseConfig();

// Check if we're in a valid Supabase environment
export const isSupabaseAvailable = () => {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')
  );
};

// Validate environment on startup (only in browser for production-like environments)
if (typeof window !== 'undefined' && isProductionLike()) {
  const validation = validateEnvironment();
  if (!validation.isValid) {
    logger.error('Environment validation failed:', validation.errors);
    throw new Error(`Environment validation failed: ${validation.errors.join(', ')}`);
  }
}

// Create Supabase client with environment-specific configuration
export const supabase = createClient(url, anonKey, options);

// Force schema refresh function
export const refreshSchema = async () => {
  if (!isSupabaseAvailable()) {
    logger.debug('Supabase not available, skipping schema refresh');
    return;
  }

  try {
    // Force a schema refresh by making a simple query
    const { error } = await supabase.rpc('version');
    if (error) {
      logger.debug('Schema refresh attempt:', error.message);
    } else {
      logger.debug('Schema refresh completed successfully');
    }
  } catch (e) {
    logger.debug('Schema refresh completed with exception:', e);
  }
};

// Database types for better TypeScript support - Generated from actual database structure
export type Database = {
  public: {
    Tables: {
      psgc_regions: {
        Row: {
          code: string;
          name: string;
        };
        Insert: {
          code: string;
          name: string;
        };
        Update: {
          code?: string;
          name?: string;
        };
      };
      psgc_provinces: {
        Row: {
          code: string;
          name: string;
          region_code: string;
          is_active: boolean | null;
        };
        Insert: {
          code: string;
          name: string;
          region_code: string;
          is_active?: boolean | null;
        };
        Update: {
          code?: string;
          name?: string;
          region_code?: string;
          is_active?: boolean | null;
        };
      };
      psgc_cities_municipalities: {
        Row: {
          code: string;
          name: string;
          type: string;
          province_code: string | null;
          is_independent: boolean;
        };
        Insert: {
          code: string;
          name: string;
          type: string;
          province_code?: string | null;
          is_independent: boolean;
        };
        Update: {
          code?: string;
          name?: string;
          type?: string;
          province_code?: string | null;
          is_independent?: boolean;
        };
      };
      psgc_barangays: {
        Row: {
          code: string;
          name: string;
          city_municipality_code: string;
          urban_rural_status: string | null;
        };
        Insert: {
          code: string;
          name: string;
          city_municipality_code: string;
          urban_rural_status?: string | null;
        };
        Update: {
          code?: string;
          name?: string;
          city_municipality_code?: string;
          urban_rural_status?: string | null;
        };
      };
      households: {
        Row: {
          code: string;
          barangay_code: string;
          region_code: string | null;
          province_code: string | null;
          city_municipality_code: string | null;
          street_name: string | null;
          house_number: string | null;
          subdivision: string | null;
          zip_code: string | null;
          household_head_id: string | null;
          total_members: number | null;
          created_by: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          code: string;
          barangay_code: string;
          region_code?: string | null;
          province_code?: string | null;
          city_municipality_code?: string | null;
          street_name?: string | null;
          house_number?: string | null;
          subdivision?: string | null;
          zip_code?: string | null;
          household_head_id?: string | null;
          total_members?: number | null;
          created_by?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          code?: string;
          barangay_code?: string;
          region_code?: string | null;
          province_code?: string | null;
          city_municipality_code?: string | null;
          street_name?: string | null;
          house_number?: string | null;
          subdivision?: string | null;
          zip_code?: string | null;
          household_head_id?: string | null;
          total_members?: number | null;
          created_by?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      residents: {
        Row: {
          id: string;
          first_name: string;
          middle_name: string | null;
          last_name: string;
          extension_name: string | null;
          birthdate: string;
          sex: 'male' | 'female';
          civil_status: string;
          citizenship: string | null;
          education_level: string;
          education_status: string;
          employment_status: string | null;
          psoc_code: string | null;
          psoc_level: string | null;
          occupation_title: string | null;
          mobile_number: string;
          email: string | null;
          philsys_card_number_hash: string | null;
          philsys_last4: string | null;
          blood_type: string | null;
          ethnicity: string | null;
          religion: string | null;
          is_voter: boolean | null;
          is_resident_voter: boolean | null;
          is_labor_force: boolean | null;
          is_employed: boolean | null;
          is_unemployed: boolean | null;
          is_ofw: boolean | null;
          is_pwd: boolean | null;
          is_out_of_school_children: boolean | null;
          is_out_of_school_youth: boolean | null;
          is_senior_citizen: boolean | null;
          is_registered_senior_citizen: boolean | null;
          is_solo_parent: boolean | null;
          is_indigenous_people: boolean | null;
          is_migrant: boolean | null;
          barangay_code: string;
          region_code: string | null;
          province_code: string | null;
          city_municipality_code: string | null;
          street_name: string | null;
          house_number: string | null;
          subdivision: string | null;
          household_code: string | null;
          search_text: string | null;
          is_active: boolean | null;
          created_by: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          id?: string;
          first_name: string;
          middle_name?: string | null;
          last_name: string;
          extension_name?: string | null;
          birthdate: string;
          sex: 'male' | 'female';
          civil_status: string;
          citizenship?: string | null;
          education_level: string;
          education_status: string;
          employment_status?: string | null;
          psoc_code?: string | null;
          psoc_level?: string | null;
          occupation_title?: string | null;
          mobile_number: string;
          email?: string | null;
          philsys_card_number_hash?: string | null;
          philsys_last4?: string | null;
          blood_type?: string | null;
          ethnicity?: string | null;
          religion?: string | null;
          is_voter?: boolean | null;
          is_resident_voter?: boolean | null;
          is_labor_force?: boolean | null;
          is_employed?: boolean | null;
          is_unemployed?: boolean | null;
          is_ofw?: boolean | null;
          is_pwd?: boolean | null;
          is_out_of_school_children?: boolean | null;
          is_out_of_school_youth?: boolean | null;
          is_senior_citizen?: boolean | null;
          is_registered_senior_citizen?: boolean | null;
          is_solo_parent?: boolean | null;
          is_indigenous_people?: boolean | null;
          is_migrant?: boolean | null;
          barangay_code: string;
          region_code?: string | null;
          province_code?: string | null;
          city_municipality_code?: string | null;
          street_name?: string | null;
          house_number?: string | null;
          subdivision?: string | null;
          household_code?: string | null;
          search_text?: string | null;
          is_active?: boolean | null;
          created_by?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          id?: string;
          first_name?: string;
          middle_name?: string | null;
          last_name?: string;
          extension_name?: string | null;
          birthdate?: string;
          sex?: 'male' | 'female';
          civil_status?: string;
          citizenship?: string | null;
          education_level?: string;
          education_status?: string;
          employment_status?: string | null;
          psoc_code?: string | null;
          psoc_level?: string | null;
          occupation_title?: string | null;
          mobile_number?: string;
          email?: string | null;
          philsys_card_number_hash?: string | null;
          philsys_last4?: string | null;
          blood_type?: string | null;
          ethnicity?: string | null;
          religion?: string | null;
          is_voter?: boolean | null;
          is_resident_voter?: boolean | null;
          is_labor_force?: boolean | null;
          is_employed?: boolean | null;
          is_unemployed?: boolean | null;
          is_ofw?: boolean | null;
          is_pwd?: boolean | null;
          is_out_of_school_children?: boolean | null;
          is_out_of_school_youth?: boolean | null;
          is_senior_citizen?: boolean | null;
          is_registered_senior_citizen?: boolean | null;
          is_solo_parent?: boolean | null;
          is_indigenous_people?: boolean | null;
          is_migrant?: boolean | null;
          barangay_code?: string;
          region_code?: string | null;
          province_code?: string | null;
          city_municipality_code?: string | null;
          street_name?: string | null;
          house_number?: string | null;
          subdivision?: string | null;
          household_code?: string | null;
          search_text?: string | null;
          is_active?: boolean | null;
          created_by?: string | null;
          created_at?: string | null;
          updated_at?: string | null;
        };
      };
      psoc_major_groups: {
        Row: {
          code: string;
          title: string;
        };
        Insert: {
          code: string;
          title: string;
        };
        Update: {
          code?: string;
          title?: string;
        };
      };
      psoc_sub_major_groups: {
        Row: {
          code: string;
          title: string;
          major_code: string;
        };
        Insert: {
          code: string;
          title: string;
          major_code: string;
        };
        Update: {
          code?: string;
          title?: string;
          major_code?: string;
        };
      };
      psoc_minor_groups: {
        Row: {
          code: string;
          title: string;
          sub_major_code: string;
        };
        Insert: {
          code: string;
          title: string;
          sub_major_code: string;
        };
        Update: {
          code?: string;
          title?: string;
          sub_major_code?: string;
        };
      };
      psoc_unit_groups: {
        Row: {
          code: string;
          title: string;
          minor_code: string;
        };
        Insert: {
          code: string;
          title: string;
          minor_code: string;
        };
        Update: {
          code?: string;
          title?: string;
          minor_code?: string;
        };
      };
      psoc_unit_sub_groups: {
        Row: {
          code: string;
          title: string;
          unit_code: string;
        };
        Insert: {
          code: string;
          title: string;
          unit_code: string;
        };
        Update: {
          code?: string;
          title?: string;
          unit_code?: string;
        };
      };
      psoc_cross_references: {
        Row: {
          unit_code: string;
          related_titles: string;
        };
        Insert: {
          unit_code: string;
          related_titles: string;
        };
        Update: {
          unit_code?: string;
          related_titles?: string;
        };
      };
      psoc_position_titles: {
        Row: {
          id: string;
          unit_group_code: string;
          titles: any; // jsonb
          created_at: string | null;
        };
        Insert: {
          id?: string;
          unit_group_code: string;
          titles: any; // jsonb
          created_at?: string | null;
        };
        Update: {
          id?: string;
          unit_group_code?: string;
          titles?: any; // jsonb
          created_at?: string | null;
        };
      };
      resident_relationships: {
        Row: {
          id: string;
          resident_id: string;
          related_resident_id: string;
          relationship_type: string;
          created_at: string | null;
        };
        Insert: {
          id?: string;
          resident_id: string;
          related_resident_id: string;
          relationship_type: string;
          created_at?: string | null;
        };
        Update: {
          id?: string;
          resident_id?: string;
          related_resident_id?: string;
          relationship_type?: string;
          created_at?: string | null;
        };
      };
      roles: {
        Row: {
          id: string;
          name: string;
          permissions: any | null; // jsonb
        };
        Insert: {
          id?: string;
          name: string;
          permissions?: any | null; // jsonb
        };
        Update: {
          id?: string;
          name?: string;
          permissions?: any | null; // jsonb
        };
      };
      user_profiles: {
        Row: {
          id: string;
          email: string;
          first_name: string;
          last_name: string;
          role_id: string;
          barangay_code: string | null;
          is_active: boolean | null;
          created_at: string | null;
          mobile_number: string | null;
        };
        Insert: {
          id?: string;
          email: string;
          first_name: string;
          last_name: string;
          role_id: string;
          barangay_code?: string | null;
          is_active?: boolean | null;
          created_at?: string | null;
          mobile_number?: string | null;
        };
        Update: {
          id?: string;
          email?: string;
          first_name?: string;
          last_name?: string;
          role_id?: string;
          barangay_code?: string | null;
          is_active?: boolean | null;
          created_at?: string | null;
          mobile_number?: string | null;
        };
      };
    };
    Views: {
      address_hierarchy: {
        Row: {
          region_code: string | null;
          region_name: string | null;
          province_code: string | null;
          province_name: string | null;
          city_code: string | null;
          city_name: string | null;
          city_type: string | null;
          barangay_code: string | null;
          barangay_name: string | null;
          full_address: string | null;
        };
      };
      psoc_occupation_search: {
        Row: {
          occupation_code: string | null;
          occupation_title: string | null;
          level_type: string | null;
          hierarchy_level: number | null;
          unit_code: string | null;
          searchable_text: string | null;
        };
      };
    };
  };
};
