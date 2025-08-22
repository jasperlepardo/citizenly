/**
 * Production-Ready Authentication System
 * Secure authentication utilities for the RBI System
 */

import { supabase } from '../supabase/supabase';
import { createLogger } from '../environment/environmentUtils';
import type { User, Session, AuthError } from '@supabase/supabase-js';

const logger = createLogger('Auth');

// User role types
export type UserRole =
  | 'super_admin'
  | 'region_admin'
  | 'province_admin'
  | 'city_admin'
  | 'barangay_admin'
  | 'barangay_user'
  | 'read_only';

// User profile interface
export interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  mobile_number?: string;
  role_name: UserRole;
  barangay_code?: string;
  city_municipality_code?: string;
  province_code?: string;
  region_code?: string;
  is_active: boolean;
  email_verified: boolean;
  created_at: string;
  updated_at: string;
}

// Registration data interface
export interface RegistrationData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  mobile_number?: string;
  barangay_code: string;
}

// =============================================================================
// AUTHENTICATION FUNCTIONS
// =============================================================================

/**
 * Register a new user with profile creation
 */
export const registerUser = async (data: RegistrationData) => {
  try {
    logger.debug('Starting user registration for:', data.email);

    // 1. Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          first_name: data.first_name,
          last_name: data.last_name,
          mobile_number: data.mobile_number,
          barangay_code: data.barangay_code,
        },
      },
    });

    if (authError) {
      logger.error('Auth registration failed:', authError.message);
      throw authError;
    }

    if (!authData.user) {
      throw new Error('User creation failed - no user returned');
    }

    // 2. The user profile will be automatically created by the database trigger
    logger.info('User registered successfully:', data.email);

    return {
      user: authData.user,
      session: authData.session,
      needsEmailConfirmation: !authData.session,
    };
  } catch (error) {
    logger.error('Registration error:', error);
    throw error;
  }
};

/**
 * Sign in user
 */
export const signInUser = async (email: string, password: string) => {
  try {
    logger.debug('Attempting sign in for:', email);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      logger.error('Sign in failed:', error.message);
      throw error;
    }

    // Get user profile
    const profile = await getUserProfile(data.user.id);

    if (!profile?.is_active) {
      throw new Error('Account is deactivated. Please contact your administrator.');
    }

    logger.info('User signed in successfully:', email);
    return { user: data.user, session: data.session, profile };
  } catch (error) {
    logger.error('Sign in error:', error);
    throw error;
  }
};

/**
 * Sign out user
 */
export const signOutUser = async () => {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    logger.info('User signed out successfully');
  } catch (error) {
    logger.error('Sign out error:', error);
    throw error;
  }
};

/**
 * Get current user profile
 */
export const getUserProfile = async (userId?: string): Promise<UserProfile | null> => {
  try {
    const id = userId || (await supabase.auth.getUser()).data.user?.id;
    if (!id) return null;

    const { data, error } = await supabase
      .from('auth_user_profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code !== 'PGRST116') {
        // Not found error
        logger.error('Error fetching user profile:', error.message);
      }
      return null;
    }

    return data;
  } catch (error) {
    logger.error('Get user profile error:', error);
    return null;
  }
};

/**
 * Update user profile
 */
export const updateUserProfile = async (updates: Partial<UserProfile>) => {
  try {
    const { data: user } = await supabase.auth.getUser();
    if (!user.user) throw new Error('Not authenticated');

    // Only allow updating specific fields
    const allowedUpdates = {
      first_name: updates.first_name,
      last_name: updates.last_name,
      mobile_number: updates.mobile_number,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('auth_user_profiles')
      .update(allowedUpdates)
      .eq('id', user.user.id)
      .select()
      .single();

    if (error) throw error;

    logger.info('User profile updated successfully');
    return data;
  } catch (error) {
    logger.error('Update profile error:', error);
    throw error;
  }
};

/**
 * Request password reset
 */
export const requestPasswordReset = async (email: string) => {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;

    logger.info('Password reset requested for:', email);
  } catch (error) {
    logger.error('Password reset error:', error);
    throw error;
  }
};

/**
 * Update password
 */
export const updatePassword = async (newPassword: string) => {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) throw error;

    logger.info('Password updated successfully');
  } catch (error) {
    logger.error('Password update error:', error);
    throw error;
  }
};

// =============================================================================
// AUTHORIZATION FUNCTIONS
// =============================================================================

/**
 * Check if user has specific role
 */
export const hasRole = (profile: UserProfile | null, role: UserRole): boolean => {
  return profile?.role_name === role && profile.is_active;
};

/**
 * Check if user has admin privileges
 */
export const isAdmin = (profile: UserProfile | null): boolean => {
  if (!profile?.is_active) return false;
  return ['super_admin', 'region_admin', 'province_admin', 'city_admin', 'barangay_admin'].includes(
    profile.role_name
  );
};

/**
 * Check if user can access specific barangay
 */
export const canAccessBarangay = (profile: UserProfile | null, barangayCode: string): boolean => {
  if (!profile?.is_active) return false;

  switch (profile.role_name) {
    case 'super_admin':
      return true;
    case 'barangay_admin':
    case 'barangay_user':
      return profile.barangay_code === barangayCode;
    default:
      return false;
  }
};

/**
 * Get user's accessible barangays
 */
export const getUserAccessibleBarangays = async () => {
  try {
    const { data, error } = await supabase.rpc('get_user_accessible_barangays');

    if (error) throw error;

    return data || [];
  } catch (error) {
    logger.error('Error getting accessible barangays:', error);
    return [];
  }
};

// =============================================================================
// SESSION MANAGEMENT
// =============================================================================

/**
 * Get current session
 */
export const getCurrentSession = async (): Promise<Session | null> => {
  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();
    if (error) throw error;
    return session;
  } catch (error) {
    logger.error('Get session error:', error);
    return null;
  }
};

/**
 * Get current user
 */
export const getCurrentUser = async (): Promise<User | null> => {
  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error) throw error;
    return user;
  } catch (error) {
    logger.error('Get user error:', error);
    return null;
  }
};

/**
 * Listen to auth state changes
 */
export const onAuthStateChange = (callback: (event: string, session: Session | null) => void) => {
  return supabase.auth.onAuthStateChange(callback);
};

// =============================================================================
// REFERENCE DATA ACCESS (for authenticated users)
// =============================================================================

/**
 * Get PSGC regions
 */
export const getRegions = async () => {
  const { data, error } = await supabase.from('psgc_regions').select('code, name').order('name');

  if (error) throw error;
  return data;
};

/**
 * Get PSGC provinces by region
 */
export const getProvincesByRegion = async (regionCode: string) => {
  const { data, error } = await supabase
    .from('psgc_provinces')
    .select('code, name')
    .eq('region_code', regionCode)
    .order('name');

  if (error) throw error;
  return data;
};

/**
 * Get PSGC cities by province
 */
export const getCitiesByProvince = async (provinceCode: string) => {
  const { data, error } = await supabase
    .from('psgc_cities_municipalities')
    .select('code, name, type')
    .eq('province_code', provinceCode)
    .order('name');

  if (error) throw error;
  return data;
};

/**
 * Get PSGC barangays by city
 */
export const getBarangaysByCity = async (cityCode: string) => {
  const { data, error } = await supabase
    .from('psgc_barangays')
    .select('code, name')
    .eq('city_municipality_code', cityCode)
    .order('name');

  if (error) throw error;
  return data;
};

/**
 * Search barangays by name
 */
export const searchBarangays = async (searchTerm: string, limit = 10) => {
  const { data, error } = await supabase
    .from('psgc_barangays')
    .select(
      `
      code, 
      name,
      city_municipality_code,
      psgc_cities_municipalities(name, type),
      psgc_cities_municipalities.psgc_provinces(name),
      psgc_cities_municipalities.psgc_provinces.psgc_regions(name)
    `
    )
    .ilike('name', `%${searchTerm}%`)
    .limit(limit);

  if (error) throw error;
  return data;
};

/**
 * Search occupations using unified search
 */
export const searchOccupations = async (searchTerm: string, limit = 10) => {
  const { data, error } = await supabase
    .from('psoc_unified_search')
    .select('psoc_code, occupation_title, psoc_level, parent_title')
    .ilike('search_text', `%${searchTerm}%`)
    .limit(limit);

  if (error) throw error;
  return data;
};

// =============================================================================
// ERROR HANDLING
// =============================================================================

/**
 * Convert Supabase auth error to user-friendly message
 */
export const getAuthErrorMessage = (error: AuthError | Error): string => {
  const message = error.message;

  // Common auth error patterns
  if (message.includes('Invalid login credentials')) {
    return 'Invalid email or password. Please check your credentials and try again.';
  }

  if (message.includes('Email not confirmed')) {
    return 'Please confirm your email address before signing in.';
  }

  if (message.includes('User already registered')) {
    return 'An account with this email already exists. Please sign in instead.';
  }

  if (message.includes('Password should be at least')) {
    return 'Password must be at least 6 characters long.';
  }

  if (message.includes('Unable to validate email address')) {
    return 'Please enter a valid email address.';
  }

  // Default to original message if no pattern matches
  return message;
};
