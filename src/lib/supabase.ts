/**
 * Supabase Client Configuration
 * Connects to production RBI System database with complete PSGC data
 */

import { createClient } from '@supabase/supabase-js'

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. Please check .env.local file.'
  )
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
  },
})

// Database types for better TypeScript support
export type Database = {
  public: {
    Tables: {
      psgc_regions: {
        Row: {
          code: string
          name: string
          created_at: string
        }
        Insert: {
          code: string
          name: string
          created_at?: string
        }
        Update: {
          code?: string
          name?: string
          created_at?: string
        }
      }
      psgc_provinces: {
        Row: {
          code: string
          name: string
          region_code: string
          created_at: string
        }
        Insert: {
          code: string
          name: string
          region_code: string
          created_at?: string
        }
        Update: {
          code?: string
          name?: string
          region_code?: string
          created_at?: string
        }
      }
      psgc_cities_municipalities: {
        Row: {
          code: string
          name: string
          type: string
          province_code: string | null
          is_independent: boolean
          created_at: string
        }
        Insert: {
          code: string
          name: string
          type?: string
          province_code?: string | null
          is_independent?: boolean
          created_at?: string
        }
        Update: {
          code?: string
          name?: string
          type?: string
          province_code?: string | null
          is_independent?: boolean
          created_at?: string
        }
      }
      psgc_barangays: {
        Row: {
          code: string
          name: string
          city_municipality_code: string
          urban_rural_status: string | null
          created_at: string
        }
        Insert: {
          code: string
          name: string
          city_municipality_code: string
          urban_rural_status?: string | null
          created_at?: string
        }
        Update: {
          code?: string
          name?: string
          city_municipality_code?: string
          urban_rural_status?: string | null
          created_at?: string
        }
      }
    }
    Views: {
      address_hierarchy: {
        Row: {
          region_code: string
          region_name: string
          province_code: string | null
          province_name: string | null
          city_municipality_code: string
          city_municipality_name: string
          city_municipality_type: string
          is_independent: boolean
          barangay_code: string
          barangay_name: string
          urban_rural_status: string | null
          full_address: string
        }
      }
    }
  }
}