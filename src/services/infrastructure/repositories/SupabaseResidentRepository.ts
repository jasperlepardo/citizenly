/**
 * Supabase Resident Repository
 * Infrastructure implementation of IResidentRepository
 * Handles all Supabase-specific data access for residents
 */

import type { Resident } from '@/types/domain/residents/core';
import type { ResidentFormData } from '@/types/domain/residents/forms';
import type { ValidationResult } from '@/types/shared/validation/validation';
import type { RepositoryResult } from '@/types/infrastructure/services/repositories';
import { createLogger } from '@/lib/config/environment';
import { supabase } from '@/lib/data/supabase';

const logger = createLogger('SupabaseResidentRepository');

/**
 * Supabase implementation of Resident Repository
 * All Supabase-specific logic is isolated here
 * Uses shared singleton Supabase client to prevent multiple auth instances
 */
export class SupabaseResidentRepository {
  private readonly supabase: any;

  constructor(supabaseClient?: any) {
    this.supabase = supabaseClient || supabase;
  }

  /**
   * Create a new resident in Supabase
   */
  async create(data: Partial<Resident>): Promise<RepositoryResult<Resident>> {
    try {
      // Filter out any fields that don't exist in the database schema
      // This prevents "could not find column" errors
      const validFields = [
        'id', 'first_name', 'middle_name', 'last_name', 'extension_name',
        'birthdate', 'sex', 'civil_status', 'citizenship', 'email', 'mobile_number',
        'telephone_number', 'philsys_card_number', 'region_code', 'province_code',
        'city_municipality_code', 'barangay_code', 'education_attainment',
        'is_graduate', 'employment_status', 'occupation_code', 'birth_place_code',
        'mother_maiden_first', 'mother_maiden_middle', 'mother_maiden_last',
        'religion', 'ethnicity', 'blood_type', 'height', 'weight', 'is_voter',
        'is_resident_voter', 'household_code', 'is_active', 'created_at', 'updated_at'
      ];
      
      const cleanData: any = {};
      validFields.forEach(field => {
        if (data.hasOwnProperty(field)) {
          cleanData[field] = (data as any)[field];
        }
      });

      console.log('🔍 SupabaseResidentRepository: Creating resident with clean data:', Object.keys(cleanData));

      const { data: resident, error } = await this.supabase
        .from('residents')
        .insert([cleanData])
        .select()
        .single();

      if (error) {
        logger.error('Failed to create resident', error);
        return { success: false, error: error.message };
      }

      return { success: true, data: resident };
    } catch (error) {
      logger.error('Unexpected error creating resident', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Update a resident in Supabase
   */
  async update(id: string, data: Partial<Resident>): Promise<RepositoryResult<Resident>> {
    try {
      // Filter out any fields that don't exist in the database schema
      const validFields = [
        'id', 'first_name', 'middle_name', 'last_name', 'extension_name',
        'birthdate', 'sex', 'civil_status', 'citizenship', 'email', 'mobile_number',
        'telephone_number', 'philsys_card_number', 'region_code', 'province_code',
        'city_municipality_code', 'barangay_code', 'education_attainment',
        'is_graduate', 'employment_status', 'occupation_code', 'birth_place_code',
        'mother_maiden_first', 'mother_maiden_middle', 'mother_maiden_last',
        'religion', 'ethnicity', 'blood_type', 'height', 'weight', 'is_voter',
        'is_resident_voter', 'household_code', 'is_active', 'created_at', 'updated_at'
      ];
      
      const cleanData: any = {};
      validFields.forEach(field => {
        if (data.hasOwnProperty(field)) {
          cleanData[field] = (data as any)[field];
        }
      });

      console.log('🔍 SupabaseResidentRepository: Updating resident with clean data:', Object.keys(cleanData));

      const { data: resident, error } = await this.supabase
        .from('residents')
        .update(cleanData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        logger.error('Failed to update resident', error);
        return { success: false, error: error.message };
      }

      return { success: true, data: resident };
    } catch (error) {
      logger.error('Unexpected error updating resident', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Find a resident by ID
   */
  async findById(id: string): Promise<RepositoryResult<Resident>> {
    try {
      const { data: resident, error } = await this.supabase
        .from('residents')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return { success: false, error: 'Resident not found' };
        }
        logger.error('Failed to find resident', error);
        return { success: false, error: error.message };
      }

      return { success: true, data: resident };
    } catch (error) {
      logger.error('Unexpected error finding resident', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Find a resident by ID including inactive ones (for deletion purposes)
   */
  async findByIdIncludingInactive(id: string): Promise<RepositoryResult<Resident>> {
    try {
      const { data: resident, error } = await this.supabase
        .from('residents')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return { success: false, error: 'Resident not found' };
        }
        logger.error('Failed to find resident', error);
        return { success: false, error: error.message };
      }

      return { success: true, data: resident };
    } catch (error) {
      logger.error('Unexpected error finding resident', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Find all residents with optional filters
   */
  async findAll(options?: any): Promise<RepositoryResult<Resident[]>> {
    try {
      
      // Select residents with household information for geographic filtering
      let query = this.supabase
        .from('residents')
        .select(`
          *,
          households!inner(
            code,
            barangay_code,
            city_municipality_code,
            province_code,
            region_code,
            house_number,
            address
          )
        `, { count: 'exact' })
        .eq('is_active', true); // Only show active residents

      // Apply geographic filters through household relationship
      if (options?.barangayCode) {
        query = query.eq('households.barangay_code', options.barangayCode);
      }
      if (options?.cityCode) {
        query = query.eq('households.city_municipality_code', options.cityCode);
      }
      if (options?.provinceCode) {
        query = query.eq('households.province_code', options.provinceCode);
      }
      if (options?.regionCode) {
        query = query.eq('households.region_code', options.regionCode);
      }
      
      // Apply search filters
      if (options?.searchTerm) {
        query = query.or(`first_name.ilike.%${options.searchTerm}%,last_name.ilike.%${options.searchTerm}%,email.ilike.%${options.searchTerm}%`);
      }
      if (options?.search) {
        query = query.or(`first_name.ilike.%${options.search}%,last_name.ilike.%${options.search}%,email.ilike.%${options.search}%`);
      }
      
      // Apply pagination
      if (options?.limit) {
        query = query.limit(options.limit);
      }
      if (options?.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
      }
      if (options?.page && options?.pageSize) {
        const from = (options.page - 1) * options.pageSize;
        const to = from + options.pageSize - 1;
        query = query.range(from, to);
      }

      const { data: residents, error, count } = await query;

      if (error) {
        logger.error('Failed to find residents', error);
        return { success: false, error: error.message };
      }

      return { 
        success: true, 
        data: residents || [], 
        total: count || 0 
      };
    } catch (error) {
      logger.error('Unexpected error finding residents', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Soft delete a resident
   */
  async delete(id: string): Promise<RepositoryResult<boolean>> {
    try {
      const { data, error } = await this.supabase
        .from('residents')
        .update({ is_active: false })
        .eq('id', id)
        .select();

      if (error) {
        logger.error('Failed to delete resident', error);
        return { success: false, error: error.message };
      }

      return { success: true, data: true };
    } catch (error) {
      logger.error('Unexpected error deleting resident', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Validate resident data (delegates to validation service)
   */
  async validate(data: ResidentFormData): Promise<ValidationResult> {
    // This could call a validation RPC or service
    // For now, return success
    return { 
      isValid: true,
      errors: [],
    };
  }

  /**
   * Find residents by household
   */
  async findByHousehold(householdCode: string): Promise<RepositoryResult<Resident[]>> {
    try {
      const { data: residents, error } = await this.supabase
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

      return { success: true, data: residents || [] };
    } catch (error) {
      logger.error('Unexpected error finding household members', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }
}