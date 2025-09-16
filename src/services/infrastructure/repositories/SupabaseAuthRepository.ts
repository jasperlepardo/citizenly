/**
 * Supabase Auth Repository
 * Infrastructure implementation of IAuthRepository
 * Handles all Supabase-specific authentication operations
 */

import type { User, Session } from '@supabase/supabase-js';
import type { AuthUserProfile } from '@/types/app/auth/auth';
import type { RepositoryResult } from '@/types/infrastructure/services/repositories';
import { createLogger } from '@/lib/config/environment';
import { supabase } from '@/lib/data/supabase';

const logger = createLogger('SupabaseAuthRepository');

/**
 * Supabase implementation of Auth Repository
 * All Supabase auth logic is isolated here
 * Uses shared singleton Supabase client to prevent multiple auth instances
 */
export class SupabaseAuthRepository {
  private readonly supabase = supabase;

  /**
   * Sign up a new user in Supabase
   */
  async signUp(email: string, password: string, profile: any): Promise<RepositoryResult<User>> {
    try {
      // Create auth user
      const { data: authData, error: authError } = await this.supabase.auth.signUp({
        email,
        password,
        options: {
          data: profile
        }
      });

      if (authError) {
        logger.error('Sign up failed', authError);
        return { success: false, error: authError.message };
      }

      if (!authData.user) {
        return { success: false, error: 'User creation failed' };
      }

      // Create user profile in database
      const { error: profileError } = await this.supabase
        .from('auth_user_profiles')
        .insert([{
          id: authData.user.id,
          email: authData.user.email,
          ...profile
        }]);

      if (profileError) {
        logger.error('Profile creation failed', profileError);
        // Note: User is created but profile failed - might need cleanup
        return { 
          success: false, 
          error: 'Profile creation failed. Please contact support.' 
        };
      }

      return { success: true, data: authData.user };
    } catch (error) {
      logger.error('Unexpected error during sign up', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Sign up failed' 
      };
    }
  }

  /**
   * Sign in a user
   */
  async signIn(email: string, password: string): Promise<RepositoryResult<Session>> {
    try {
      const { data, error } = await this.supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        logger.error('Sign in failed', error);
        return { success: false, error: error.message };
      }

      if (!data.session) {
        return { success: false, error: 'No session created' };
      }

      return { success: true, data: data.session };
    } catch (error) {
      logger.error('Unexpected error during sign in', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Sign in failed' 
      };
    }
  }

  /**
   * Sign out current user
   */
  async signOut(): Promise<RepositoryResult<void>> {
    try {
      const { error } = await this.supabase.auth.signOut();

      if (error) {
        logger.error('Sign out failed', error);
        return { success: false, error: error.message };
      }

      return { success: true, data: undefined };
    } catch (error) {
      logger.error('Unexpected error during sign out', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Sign out failed' 
      };
    }
  }

  /**
   * Get current user
   */
  async getCurrentUser(): Promise<RepositoryResult<User>> {
    try {
      const { data: { user }, error } = await this.supabase.auth.getUser();

      if (error) {
        logger.error('Failed to get current user', error);
        return { success: false, error: error.message };
      }

      if (!user) {
        return { success: false, error: 'Not authenticated' };
      }

      return { success: true, data: user };
    } catch (error) {
      logger.error('Unexpected error getting current user', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to get user' 
      };
    }
  }

  /**
   * Get user profile from database
   */
  async getProfile(userId: string): Promise<RepositoryResult<AuthUserProfile>> {
    try {
      const { data, error } = await this.supabase
        .from('auth_user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return { success: false, error: 'Profile not found' };
        }
        logger.error('Failed to get profile', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      logger.error('Unexpected error getting profile', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to get profile' 
      };
    }
  }

  /**
   * Update user profile in database
   */
  async updateProfile(userId: string, profile: Partial<AuthUserProfile>): Promise<RepositoryResult<AuthUserProfile>> {
    try {
      const { data, error } = await this.supabase
        .from('auth_user_profiles')
        .update(profile)
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        logger.error('Failed to update profile', error);
        return { success: false, error: error.message };
      }

      return { success: true, data };
    } catch (error) {
      logger.error('Unexpected error updating profile', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update profile' 
      };
    }
  }
}