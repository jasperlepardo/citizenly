/**
 * Supabase Client Configuration
 * Connects to production RBI System database with complete PSGC data
 */

import { createClient } from '@supabase/supabase-js';

// Check if we're in a valid Supabase environment
export const isSupabaseAvailable = () => {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
    process.env.NEXT_PUBLIC_SUPABASE_URL !== 'https://placeholder.supabase.co'
  );
};

// Supabase configuration with fallback for build time
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';

// Only throw error at runtime when Supabase is actually needed
if (typeof window !== 'undefined' && !isSupabaseAvailable()) {
  throw new Error('Missing Supabase environment variables. Please check .env.local file.');
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
  },
  db: {
    schema: 'public',
  },
  global: {
    headers: {
      'Cache-Control': 'no-cache',
      Pragma: 'no-cache',
    },
  },
});

// Force schema refresh function
export const refreshSchema = async () => {
  if (!isSupabaseAvailable()) {
    console.log('Supabase not available, skipping schema refresh');
    return;
  }

  try {
    // Force a schema refresh by making a simple query
    const { error } = await supabase.rpc('version');
    if (error) console.log('Schema refresh attempt:', error.message);
  } catch (e) {
    console.log('Schema refresh completed');
  }
};

// Database types for better TypeScript support
export type Database = {
  public: {
    Tables: {
      psgc_regions: {
        Row: {
          code: string;
          name: string;
          created_at: string;
        };
        Insert: {
          code: string;
          name: string;
          created_at?: string;
        };
        Update: {
          code?: string;
          name?: string;
          created_at?: string;
        };
      };
      psgc_provinces: {
        Row: {
          code: string;
          name: string;
          region_code: string;
          created_at: string;
        };
        Insert: {
          code: string;
          name: string;
          region_code: string;
          created_at?: string;
        };
        Update: {
          code?: string;
          name?: string;
          region_code?: string;
          created_at?: string;
        };
      };
      psgc_cities_municipalities: {
        Row: {
          code: string;
          name: string;
          type: string;
          province_code: string | null;
          is_independent: boolean;
          created_at: string;
        };
        Insert: {
          code: string;
          name: string;
          type?: string;
          province_code?: string | null;
          is_independent?: boolean;
          created_at?: string;
        };
        Update: {
          code?: string;
          name?: string;
          type?: string;
          province_code?: string | null;
          is_independent?: boolean;
          created_at?: string;
        };
      };
      psgc_barangays: {
        Row: {
          code: string;
          name: string;
          city_municipality_code: string;
          urban_rural_status: string | null;
          created_at: string;
        };
        Insert: {
          code: string;
          name: string;
          city_municipality_code: string;
          urban_rural_status?: string | null;
          created_at?: string;
        };
        Update: {
          code?: string;
          name?: string;
          city_municipality_code?: string;
          urban_rural_status?: string | null;
          created_at?: string;
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
          total_members: number;
          created_by: string | null;
          created_at: string;
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
          total_members?: number;
          created_by?: string | null;
          created_at?: string;
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
          total_members?: number;
          created_by?: string | null;
          created_at?: string;
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
          citizenship: string;
          mobile_number: string;
          email: string | null;
          household_code: string | null;
          barangay_code: string;
          education_level: string;
          education_status: string;
          employment_status: string;
          psoc_code: string | null;
          psoc_level: string | null;
          occupation_title: string | null;
          occupation_details: string | null;
          blood_type: string;
          height: number | null;
          weight: number | null;
          complexion: string | null;
          ethnicity: string;
          religion: string;
          voter_registration_status: boolean;
          resident_voter_status: boolean;
          last_voted_year: string | null;
          philsys_card_number: string | null;
          telephone_number: string | null;
          workplace: string | null;
          is_active: boolean;
          created_at: string;
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
          citizenship?: string;
          mobile_number: string;
          email?: string | null;
          household_code?: string | null;
          barangay_code: string;
          education_level: string;
          education_status: string;
          employment_status?: string;
          psoc_code?: string | null;
          psoc_level?: string | null;
          occupation_title?: string | null;
          occupation_details?: string | null;
          blood_type?: string;
          height?: number | null;
          weight?: number | null;
          complexion?: string | null;
          ethnicity: string;
          religion: string;
          voter_registration_status?: boolean;
          resident_voter_status?: boolean;
          last_voted_year?: string | null;
          philsys_card_number?: string | null;
          telephone_number?: string | null;
          workplace?: string | null;
          is_active?: boolean;
          created_at?: string;
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
          citizenship?: string;
          mobile_number?: string;
          email?: string | null;
          household_code?: string | null;
          barangay_code?: string;
          education_level?: string;
          education_status?: string;
          employment_status?: string;
          psoc_code?: string | null;
          psoc_level?: string | null;
          occupation_title?: string | null;
          occupation_details?: string | null;
          blood_type?: string;
          height?: number | null;
          weight?: number | null;
          complexion?: string | null;
          ethnicity?: string;
          religion?: string;
          voter_registration_status?: boolean;
          resident_voter_status?: boolean;
          last_voted_year?: string | null;
          philsys_card_number?: string | null;
          telephone_number?: string | null;
          workplace?: string | null;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string | null;
        };
      };
    };
    Views: {
      psgc_address_hierarchy: {
        Row: {
          region_code: string;
          region_name: string;
          province_code: string | null;
          province_name: string | null;
          city_municipality_code: string;
          city_municipality_name: string;
          city_municipality_type: string;
          is_independent: boolean;
          barangay_code: string;
          barangay_name: string;
          urban_rural_status: string | null;
          full_address: string;
        };
      };
    };
  };
};
