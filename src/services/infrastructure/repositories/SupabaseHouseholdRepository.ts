/**
 * Supabase Household Repository
 * Infrastructure implementation of IHouseholdRepository
 * Handles all Supabase-specific data access for households
 */

import type { HouseholdData } from '@/types/domain/households/households';
import type { Resident } from '@/types/domain/residents/core';
import type { RepositoryResult } from '@/types/infrastructure/services/repositories';
import { createLogger } from '@/lib/config/environment';
import { createSupabaseClient } from '@/lib/data/client-factory';

const logger = createLogger('SupabaseHouseholdRepository');

/**
 * Supabase implementation of Household Repository
 * All Supabase-specific logic is isolated here
 * Uses authenticated client to bypass RLS restrictions
 */
export class SupabaseHouseholdRepository {
  private getAuthenticatedClient() {
    // Use service role client for server-side operations to bypass RLS
    return createSupabaseClient('service');
  }

  /**
   * Create a new household in Supabase
   */
  async create(data: Partial<HouseholdData>): Promise<RepositoryResult<HouseholdData>> {
    try {
      const supabase = this.getAuthenticatedClient();
      const { data: household, error } = await supabase
        .from('households')
        .insert([data])
        .select()
        .single();

      if (error) {
        logger.error('Failed to create household', error);
        return { success: false, error: error.message };
      }

      return { success: true, data: household };
    } catch (error) {
      logger.error('Unexpected error creating household', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Update a household in Supabase
   */
  async update(code: string, data: Partial<HouseholdData>): Promise<RepositoryResult<HouseholdData>> {
    try {
      const supabase = this.getAuthenticatedClient();
      const { data: household, error } = await supabase
        .from('households')
        .update(data)
        .eq('code', code)
        .select()
        .single();

      if (error) {
        logger.error('Failed to update household', error);
        return { success: false, error: error.message };
      }

      return { success: true, data: household };
    } catch (error) {
      logger.error('Unexpected error updating household', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Find a household by code
   */
  async findByCode(code: string): Promise<RepositoryResult<HouseholdData>> {
    try {
      const supabase = this.getAuthenticatedClient();
      const { data: household, error } = await supabase
        .from('households')
        .select('*')
        .eq('code', code)
        .eq('is_active', true)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return { success: false, error: 'Household not found' };
        }
        logger.error('Failed to find household', error);
        return { success: false, error: error.message };
      }

      return { success: true, data: household };
    } catch (error) {
      logger.error('Unexpected error finding household', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Find all households with optional filters
   */
  async findAll(options?: any): Promise<RepositoryResult<HouseholdData[]>> {
    try {
      const supabase = this.getAuthenticatedClient();
      let query = supabase
        .from('households')
        .select('code, name, barangay_code, house_number, created_at, is_active', { count: 'exact' })
        .eq('is_active', true);

      // Apply filters if provided
      if (options?.barangayCode) {
        query = query.eq('barangay_code', options.barangayCode);
      }
      if (options?.searchTerm) {
        query = query.or(`code.ilike.%${options.searchTerm}%,house_number.ilike.%${options.searchTerm}%`);
      }
      if (options?.householdType) {
        query = query.eq('household_type', options.householdType);
      }
      if (options?.limit) {
        query = query.limit(options.limit);
      }
      if (options?.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
      }

      // Apply ordering
      query = query.order('code', { ascending: true });

      console.log('[DEBUG] About to execute household query with options:', options);
      const { data: households, error, count } = await query;

      console.log('[DEBUG] Raw query result:', { 
        householdsLength: households?.length, 
        count, 
        error, 
        firstHousehold: households?.[0] 
      });

      if (error) {
        logger.error('Failed to find households', { 
          error: error.message, 
          code: error.code,
          details: error.details,
          hint: error.hint 
        });
        return { success: false, error: error.message };
      }

      return { 
        success: true, 
        data: households || [], 
        total: count || 0 
      };
    } catch (error) {
      logger.error('Unexpected error finding households', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Soft delete a household
   */
  async delete(code: string): Promise<RepositoryResult<boolean>> {
    try {
      const supabase = this.getAuthenticatedClient();
      const { error } = await supabase
        .from('households')
        .update({ is_active: false })
        .eq('code', code);

      if (error) {
        logger.error('Failed to delete household', error);
        return { success: false, error: error.message };
      }

      return { success: true, data: true };
    } catch (error) {
      logger.error('Unexpected error deleting household', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Find household members
   */
  async findMembers(householdCode: string): Promise<RepositoryResult<Resident[]>> {
    try {
      const supabase = this.getAuthenticatedClient();
      const { data: members, error } = await supabase
        .from('residents')
        .select('*')
        .eq('household_code', householdCode)
        .eq('is_active', true)
        .order('is_household_head', { ascending: false })
        .order('birthdate', { ascending: true });

      if (error) {
        logger.error('Failed to find household members', error);
        return { success: false, error: error.message };
      }

      return { success: true, data: members || [] };
    } catch (error) {
      logger.error('Unexpected error finding household members', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }
}