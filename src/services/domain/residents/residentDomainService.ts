/**
 * Resident Domain Service
 * Pure business logic for resident operations
 * No infrastructure dependencies - uses interfaces only
 */

import type { SupabaseClient } from '@supabase/supabase-js';

import { classifyResident } from '@/services/domain/residents/residentClassification';
import { SupabaseHouseholdRepository } from '@/services/infrastructure/repositories/SupabaseHouseholdRepository';
import type { HouseholdData } from '@/types/domain/households/households';
import type { IResidentRepository } from '@/types/domain/repositories';
import type { Resident } from '@/types/domain/residents/core';
import type { ResidentFormData } from '@/types/domain/residents/forms';
import type { RepositoryResult } from '@/types/infrastructure/services/repositories';
import type { ValidationResult } from '@/types/shared/validation/validation';


/**
 * Resident Domain Service
 * Contains pure business logic for resident operations
 */
export class ResidentDomainService {
  constructor(
    private readonly repository: IResidentRepository,
    private readonly householdRepository = new SupabaseHouseholdRepository(),
    private readonly supabaseClient?: SupabaseClient
  ) {}

  /**
   * Create a new resident with business validation
   */
  async createResident(data: ResidentFormData): Promise<RepositoryResult<Resident>> {
    // Business validation
    const validation = await this.validateBusinessRules(data);
    if (!validation.isValid) {
      return {
        success: false,
        error: validation.errors?.map(e => e.message).join(', ')
      };
    }

    // Calculate derived fields
    const preparedData = this.prepareResidentData(data);

    // Create or get household if needed
    let householdCode = preparedData.household_code;
    
    if (!householdCode && this.shouldCreateHousehold(preparedData)) {
      const householdResult = await this.createHouseholdForResident(preparedData);
      if (householdResult.success && householdResult.data) {
        householdCode = householdResult.data.code;
        preparedData.household_code = householdCode;
      }
    }

    // Create resident in main table
    const residentResult = await this.repository.create(preparedData);
    if (!residentResult.success || !residentResult.data) {
      return residentResult;
    }

    // Create sectoral information using authenticated client
    if (this.supabaseClient) {
      await this.createSectoralInfo(residentResult.data.id, data);
    }

    return residentResult;
  }

  /**
   * Validate business rules for resident
   */
  private async validateBusinessRules(data: ResidentFormData): Promise<ValidationResult> {
    const errors: Array<{ field: string; message: string }> = [];

    // Age validation
    if (data.birthdate) {
      const age = this.calculateAge(data.birthdate);
      if (age < 0) {
        errors.push({ field: 'birthdate', message: 'Birthdate cannot be in the future' });
      }
      if (age > 150) {
        errors.push({ field: 'birthdate', message: 'Invalid birthdate' });
      }
    }

    // PhilSys validation (if provided)
    if (data.philsys_card_number) {
      if (!this.validatePhilSysFormat(data.philsys_card_number)) {
        errors.push({ 
          field: 'philsys_card_number', 
          message: 'Invalid PhilSys format. Use: 1234-5678-9012-3456' 
        });
      }
    }

    // Employment age validation
    if (data.employment_status === 'employed') {
      const age = this.calculateAge(data.birthdate);
      if (age < 15) {
        errors.push({ 
          field: 'employment_status', 
          message: 'Person must be at least 15 years old to be employed' 
        });
      }
    }

    return {
      isValid: errors.length === 0,
      errors: errors.length > 0 ? errors : []
    };
  }

  /**
   * Prepare resident data for database insertion (main residents table only)
   */
  private prepareResidentData(data: ResidentFormData): Partial<Resident> {
    // Only include fields that exist in the main residents table schema
    // This prevents "column not found" errors
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

    const prepared: any = {};
    validFields.forEach(field => {
      if (data.hasOwnProperty(field)) {
        prepared[field] = (data as any)[field];
      }
    });

    // Note: Excluded fields that don't belong in residents table:
    // - age (calculated from birthdate)
    // - full_name (computed from first_name, middle_name, last_name)
    // - birth_place_name (only birth_place_code is stored)
    // - is_senior_citizen (stored in resident_sectoral_info table)
    // - All other sectoral flags (stored in resident_sectoral_info table)

    console.log('🔍 ResidentDomainService: Prepared resident data fields:', Object.keys(prepared));

    return prepared;
  }

  /**
   * Calculate age from birthdate
   */
  private calculateAge(birthdate: string): number {
    const birth = new Date(birthdate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  }

  /**
   * Validate PhilSys card number format
   */
  private validatePhilSysFormat(philsysNumber: string): boolean {
    const pattern = /^\d{4}-\d{4}-\d{4}-\d{4}$/;
    return pattern.test(philsysNumber);
  }

  /**
   * Hash PhilSys number (simplified - use proper crypto in production)
   */
  private hashPhilSysNumber(philsysNumber: string): string {
    // In production, use proper crypto hashing
    return Buffer.from(philsysNumber).toString('base64');
  }

  /**
   * Extract last 4 digits of PhilSys
   */
  private extractLast4(philsysNumber: string): string {
    return philsysNumber.replace(/-/g, '').slice(-4);
  }

  /**
   * Format full name for search
   */
  private formatFullName(data: ResidentFormData): string {
    const parts = [
      data.first_name,
      data.middle_name,
      data.last_name,
      data.extension_name
    ].filter(Boolean);
    return parts.join(' ');
  }

  /**
   * Find residents by household
   */
  async findHouseholdMembers(householdCode: string): Promise<RepositoryResult<Resident[]>> {
    return this.repository.findByHousehold(householdCode);
  }

  /**
   * Update resident information
   */
  async updateResident(id: string, data: Partial<ResidentFormData>): Promise<RepositoryResult<Resident>> {
    // Validate changes
    const validation = await this.validateBusinessRules(data as ResidentFormData);
    if (!validation.isValid) {
      return {
        success: false,
        error: validation.errors?.map(e => e.message).join(', ')
      };
    }

    // Prepare data with calculated fields
    const preparedData = this.prepareResidentData(data as ResidentFormData);

    // Update resident in main table
    const updateResult = await this.repository.update(id, preparedData);
    if (!updateResult.success) {
      return updateResult;
    }

    // Update sectoral information using authenticated client
    if (this.supabaseClient) {
      await this.updateSectoralInfo(id, data as ResidentFormData);
    }

    return updateResult;
  }

  /**
   * Find residents with filters and pagination
   */
  async findResidents(options: {
    search?: string;
    page?: number;
    limit?: number;
    barangayCode?: string;
    cityCode?: string;
    provinceCode?: string;
    regionCode?: string;
  }): Promise<RepositoryResult<Resident[]>> {
    const result = await this.repository.findAll(options);
    
    return result;
  }

  /**
   * Get a resident by ID
   */
  async getResidentById(id: string): Promise<RepositoryResult<Resident>> {
    return this.repository.findById(id);
  }

  /**
   * Get a resident by ID including inactive ones (for deletion/audit purposes)
   */
  async getResidentByIdIncludingInactive(id: string): Promise<RepositoryResult<Resident>> {
    return (this.repository as any).findByIdIncludingInactive?.(id) || this.repository.findById(id);
  }

  /**
   * Delete a resident
   */
  async deleteResident(id: string): Promise<RepositoryResult<boolean>> {
    return this.repository.delete(id);
  }

  /**
   * Determine if a household should be created for this resident
   */
  private shouldCreateHousehold(residentData: any): boolean {
    // Create household if resident has address information but no household code
    return (
      residentData.barangay_code && 
      !residentData.household_code &&
      (residentData.street_name || residentData.house_number || residentData.subdivision)
    );
  }

  /**
   * Create a basic household for a resident
   */
  private async createHouseholdForResident(residentData: any): Promise<RepositoryResult<HouseholdData>> {
    try {
      // Generate a simple household code
      const householdCode = this.generateHouseholdCode(residentData.barangay_code);
      
      // Create minimal household data that works with actual database schema
      const householdData: Partial<HouseholdData> = {
        code: householdCode,
        name: `${residentData.first_name} ${residentData.last_name} Household`,
        barangay_code: residentData.barangay_code,
        house_number: residentData.house_number || '1',
      };

      return this.householdRepository.create(householdData);
    } catch (error) {
      return {
        success: false,
        error: `Failed to create household: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Generate a unique household code
   */
  private generateHouseholdCode(barangayCode: string): string {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `${barangayCode}-${timestamp.slice(-6)}-${random}`;
  }

  /**
   * Create sectoral information for a resident using authenticated client
   */
  private async createSectoralInfo(residentId: string, formData: ResidentFormData): Promise<void> {
    if (!this.supabaseClient) {
      console.warn('No authenticated Supabase client available for sectoral info creation');
      return;
    }

    try {
      // Use the classification logic to determine sectoral flags
      const classification = classifyResident(formData);

      console.log('🔍 ResidentDomainService: Creating sectoral info for resident:', residentId);
      console.log('🔍 ResidentDomainService: Sectoral classification:', classification.sectoral);

      // Insert sectoral information using authenticated client
      const { error } = await this.supabaseClient
        .from('resident_sectoral_info')
        .insert([{
          resident_id: residentId,
          is_labor_force_employed: classification.sectoral.is_labor_force_employed,
          is_unemployed: classification.sectoral.is_unemployed,
          is_out_of_school_children: classification.sectoral.is_out_of_school_children,
          is_out_of_school_youth: classification.sectoral.is_out_of_school_youth,
          is_senior_citizen: classification.sectoral.is_senior_citizen,
          is_indigenous_people: classification.sectoral.is_indigenous_people,
          // Set additional fields to false for now (can be updated later)
          is_overseas_filipino_worker: false,
          is_person_with_disability: false,
          is_registered_senior_citizen: false,
          is_solo_parent: false,
          is_migrant: classification.migration.is_migrant
        }]);

      if (error) {
        console.error('🚨 ResidentDomainService: Failed to create sectoral info:', error);
        // Don't throw error - sectoral info failure shouldn't prevent resident creation
      } else {
        console.log('✅ ResidentDomainService: Successfully created sectoral info');
      }
    } catch (error) {
      console.error('🚨 ResidentDomainService: Unexpected error creating sectoral info:', error);
      // Don't throw - allow resident creation to succeed even if sectoral info fails
    }
  }

  /**
   * Update sectoral information for an existing resident using authenticated client
   */
  private async updateSectoralInfo(residentId: string, formData: ResidentFormData & { sectoral_info?: any }): Promise<void> {
    if (!this.supabaseClient) {
      console.warn('No authenticated Supabase client available for sectoral info update');
      return;
    }

    try {
      console.log('🔍 ResidentDomainService: Updating sectoral info for resident:', residentId);
      console.log('🔍 ResidentDomainService: Form data sectoral_info:', formData.sectoral_info);

      // Check if sectoral_info object is provided (manual update)
      if (formData.sectoral_info) {
        // Use manual sectoral information provided
        const sectoralInfo = formData.sectoral_info;
        console.log('🔍 ResidentDomainService: Using manual sectoral info:', sectoralInfo);

        const { error } = await this.supabaseClient
          .from('resident_sectoral_info')
          .upsert([{
            resident_id: residentId,
            is_labor_force_employed: sectoralInfo.is_labor_force_employed ?? false,
            is_unemployed: sectoralInfo.is_unemployed ?? false,
            is_overseas_filipino_worker: sectoralInfo.is_overseas_filipino_worker ?? false,
            is_person_with_disability: sectoralInfo.is_person_with_disability ?? false,
            is_out_of_school_children: sectoralInfo.is_out_of_school_children ?? false,
            is_out_of_school_youth: sectoralInfo.is_out_of_school_youth ?? false,
            is_senior_citizen: sectoralInfo.is_senior_citizen ?? false,
            is_registered_senior_citizen: sectoralInfo.is_registered_senior_citizen ?? false,
            is_solo_parent: sectoralInfo.is_solo_parent ?? false,
            is_indigenous_people: sectoralInfo.is_indigenous_people ?? false,
            is_migrant: sectoralInfo.is_migrant ?? false,
          }], {
            onConflict: 'resident_id'
          });

        if (error) {
          console.error('🚨 ResidentDomainService: Failed to update manual sectoral info:', error);
        } else {
          console.log('✅ ResidentDomainService: Successfully updated manual sectoral info');
        }
      } else {
        // Use the classification logic to determine sectoral flags (automatic)
        const classification = classifyResident(formData);
        console.log('🔍 ResidentDomainService: Sectoral classification:', classification.sectoral);

        const { error } = await this.supabaseClient
          .from('resident_sectoral_info')
          .upsert([{
            resident_id: residentId,
            is_labor_force_employed: classification.sectoral.is_labor_force_employed,
            is_unemployed: classification.sectoral.is_unemployed,
            is_out_of_school_children: classification.sectoral.is_out_of_school_children,
            is_out_of_school_youth: classification.sectoral.is_out_of_school_youth,
            is_senior_citizen: classification.sectoral.is_senior_citizen,
            is_indigenous_people: classification.sectoral.is_indigenous_people,
            is_migrant: classification.migration.is_migrant,
            // Keep existing values for manual fields or set defaults
            is_overseas_filipino_worker: formData.is_overseas_filipino_worker || false,
            is_person_with_disability: formData.is_person_with_disability || false,
            is_solo_parent: formData.is_solo_parent || false,
            is_registered_senior_citizen: classification.sectoral.is_senior_citizen ?
              (formData.is_registered_senior_citizen || false) : false,
          }], {
            onConflict: 'resident_id'
          });

        if (error) {
          console.error('🚨 ResidentDomainService: Failed to update automatic sectoral info:', error);
        } else {
          console.log('✅ ResidentDomainService: Successfully updated automatic sectoral info');
        }
      }
    } catch (error) {
      console.error('🚨 ResidentDomainService: Unexpected error updating sectoral info:', error);
      // Don't throw - allow resident update to succeed even if sectoral info fails
    }
  }
}