/**
 * Authentication Service
 * Consolidated authentication functionality following coding standards
 * Schema-aligned with database/schema.sql
 */

import type { User, Session, AuthError } from '@supabase/supabase-js';

import { createLogger } from '../lib/config/environment';
import { supabase } from '@/lib/data/supabase';
import type { AuthUserProfile, UserRole, SignupRequest } from '@/types/auth';

const logger = createLogger('AuthService');

// Use SignupRequest directly from centralized types

/**
 * Authentication Service Class
 * Following service pattern from coding standards
 */
export class AuthService {
  /**
   * Register a new user with profile creation
   */
  async registerUser(data: SignupRequest) {
    try {
      logger.debug('Starting user registration for:', data.email);

      // Create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            first_name: data.first_name,
            last_name: data.last_name,
            phone: data.phone,
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
  }

  /**
   * Sign in user
   */
  async signInUser(email: string, password: string) {
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
      const profile = await this.getUserProfile(data.user.id);

      if (!profile?.is_active) {
        throw new Error('Account is deactivated. Please contact your administrator.');
      }

      logger.info('User signed in successfully:', email);
      return { user: data.user, session: data.session, profile };
    } catch (error) {
      logger.error('Sign in error:', error);
      throw error;
    }
  }

  /**
   * Sign out user
   */
  async signOutUser() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      logger.info('User signed out successfully');
    } catch (error) {
      logger.error('Sign out error:', error);
      throw error;
    }
  }

  /**
   * Get current user profile
   */
  async getUserProfile(userId?: string): Promise<AuthUserProfile | null> {
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
          logger.error('Error fetching user profile:', error.message);
        }
        return null;
      }

      return data;
    } catch (error) {
      logger.error('Get user profile error:', error);
      return null;
    }
  }

  /**
   * Update user profile
   */
  async updateUserProfile(updates: Partial<AuthUserProfile>) {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) throw new Error('Not authenticated');

      // Only allow updating specific fields
      const allowedUpdates = {
        first_name: updates.first_name,
        last_name: updates.last_name,
        phone: updates.phone,
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
  }

  /**
   * Check if user has specific role
   */
  hasRole(profile: AuthUserProfile | null, role: UserRole): boolean {
    return profile?.role?.name === role && (profile?.is_active ?? false);
  }

  /**
   * Check if user has admin privileges
   */
  isAdmin(profile: AuthUserProfile | null): boolean {
    if (!profile || !(profile.is_active ?? false)) return false;
    return [
      'super_admin',
      'region_admin',
      'province_admin',
      'city_admin',
      'barangay_admin',
    ].includes(profile.role?.name || '');
  }

  /**
   * Check if user can access specific barangay
   */
  canAccessBarangay(profile: AuthUserProfile | null, barangayCode: string): boolean {
    if (!profile || !(profile.is_active ?? false)) return false;

    switch (profile.role?.name) {
      case 'super_admin':
        return true;
      case 'barangay_admin':
      case 'barangay_user':
        return profile.barangay_code === barangayCode;
      default:
        return false;
    }
  }

  /**
   * Get current session
   */
  async getCurrentSession(): Promise<Session | null> {
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
  }

  /**
   * Get current user
   */
  async getCurrentUser(): Promise<User | null> {
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
  }

  /**
   * Convert Supabase auth error to user-friendly message
   */
  getAuthErrorMessage(error: AuthError | Error): string {
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
  }
}

// Export singleton instance
export const authService = new AuthService();
