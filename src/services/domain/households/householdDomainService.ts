/**
 * Household Domain Service
 * Pure business logic for household operations
 * No infrastructure dependencies - uses interfaces only
 */

import type { HouseholdData } from '@/types/domain/households/households';
import type { IHouseholdRepository, IResidentRepository } from '@/types/domain/repositories';
import type { Resident } from '@/types/domain/residents/core';
import type { RepositoryResult } from '@/types/infrastructure/services/repositories';

/**
 * Household creation request
 */
export interface CreateHouseholdRequest {
  code: string;
  house_number?: string;
  street_name?: string;
  barangay_code: string;
  city_municipality_code?: string;
  province_code?: string;
  region_code?: string;
  zip_code?: string;
  household_type?: string;
  tenure_status?: string;
  monthly_income?: number;
  household_head_id?: string;
}

/**
 * Household Domain Service
 * Contains pure business logic for household operations
 */
export class HouseholdDomainService {
  constructor(
    private readonly householdRepository: IHouseholdRepository,
    private readonly residentRepository: IResidentRepository
  ) {}

  /**
   * Create a new household with business validation
   */
  async createHousehold(data: CreateHouseholdRequest): Promise<RepositoryResult<HouseholdData>> {
    // Business validation
    const validation = this.validateHousehold(data);
    if (!validation.isValid) {
      return {
        success: false,
        error: validation.errors.join(', ')
      };
    }

    // Check for duplicate household code
    const existing = await this.householdRepository.findByCode(data.code);
    if (existing.success && existing.data) {
      return {
        success: false,
        error: `Household code ${data.code} already exists`
      };
    }

    // Enrich household data
    const enrichedData = await this.enrichHouseholdData(data);

    // Create household
    return this.householdRepository.create(enrichedData);
  }

  /**
   * Update household information
   */
  async updateHousehold(code: string, data: Partial<CreateHouseholdRequest>): Promise<RepositoryResult<HouseholdData>> {
    // Validate updates
    if (data.code && data.code !== code) {
      return {
        success: false,
        error: 'Cannot change household code'
      };
    }

    const validation = this.validateHousehold(data as CreateHouseholdRequest, true);
    if (!validation.isValid) {
      return {
        success: false,
        error: validation.errors.join(', ')
      };
    }

    // Enrich updated data
    const enrichedData = await this.enrichHouseholdData(data as CreateHouseholdRequest, true);

    return this.householdRepository.update(code, enrichedData);
  }

  /**
   * Get household with members
   */
  async getHouseholdWithMembers(code: string): Promise<RepositoryResult<{
    household: HouseholdData;
    members: Resident[];
    head?: Resident;
  }>> {
    // Get household
    const householdResult = await this.householdRepository.findByCode(code);
    if (!householdResult.success || !householdResult.data) {
      return {
        success: false,
        error: householdResult.error || 'Household not found'
      };
    }

    // Get members
    const membersResult = await this.residentRepository.findByHousehold(code);
    const members = membersResult.success ? membersResult.data || [] : [];

    // Find household head
    const head = members.find((member: any) => member.is_household_head);

    return {
      success: true,
      data: {
        household: householdResult.data,
        members,
        head
      }
    };
  }

  /**
   * Add member to household
   */
  async addMember(householdCode: string, residentId: string, isHead: boolean = false): Promise<RepositoryResult<Resident>> {
    // Get household to verify it exists
    const householdResult = await this.householdRepository.findByCode(householdCode);
    if (!householdResult.success || !householdResult.data) {
      return {
        success: false,
        error: 'Household not found'
      };
    }

    // If setting as head, unset current head
    if (isHead) {
      const currentMembers = await this.residentRepository.findByHousehold(householdCode);
      if (currentMembers.success && currentMembers.data) {
        const currentHead = currentMembers.data.find((m: any) => m.is_household_head);
        if (currentHead) {
          await this.residentRepository.update(currentHead.id, { is_household_head: false } as any);
        }
      }
    }

    // Update resident
    return this.residentRepository.update(residentId, {
      household_code: householdCode,
      is_household_head: isHead
    } as any);
  }

  /**
   * Calculate household statistics
   */
  async calculateHouseholdStats(code: string): Promise<{
    totalMembers: number;
    maleMembers: number;
    femaleMembers: number;
    minors: number;
    seniors: number;
    employed: number;
    unemployed: number;
    averageAge: number;
  }> {
    const membersResult = await this.residentRepository.findByHousehold(code);
    const members = membersResult.success ? membersResult.data || [] : [];

    if (members.length === 0) {
      return {
        totalMembers: 0,
        maleMembers: 0,
        femaleMembers: 0,
        minors: 0,
        seniors: 0,
        employed: 0,
        unemployed: 0,
        averageAge: 0
      };
    }

    const stats = members.reduce((acc: any, member: any) => {
      const age = this.calculateAge(member.birthdate);
      
      acc.totalMembers++;
      acc.totalAge += age;
      
      if (member.sex === 'male') acc.maleMembers++;
      if (member.sex === 'female') acc.femaleMembers++;
      if (age < 18) acc.minors++;
      if (age >= 60) acc.seniors++;
      if (member.employment_status === 'employed') acc.employed++;
      if (member.employment_status === 'unemployed') acc.unemployed++;
      
      return acc;
    }, {
      totalMembers: 0,
      maleMembers: 0,
      femaleMembers: 0,
      minors: 0,
      seniors: 0,
      employed: 0,
      unemployed: 0,
      totalAge: 0
    });

    return {
      ...stats,
      averageAge: Math.round(stats.totalAge / stats.totalMembers)
    };
  }

  /**
   * Validate household data
   */
  private validateHousehold(data: CreateHouseholdRequest, isUpdate: boolean = false): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Code validation (required for create)
    if (!isUpdate && (!data.code || data.code.length < 3)) {
      errors.push('Household code must be at least 3 characters');
    }

    // Barangay code validation
    if (!data.barangay_code || !this.isValidBarangayCode(data.barangay_code)) {
      errors.push('Valid barangay code is required');
    }

    // Monthly income validation
    if (data.monthly_income !== undefined && data.monthly_income < 0) {
      errors.push('Monthly income cannot be negative');
    }

    // Zip code validation
    if (data.zip_code && !this.isValidZipCode(data.zip_code)) {
      errors.push('Invalid zip code format');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Enrich household data with calculated fields
   */
  private async enrichHouseholdData(data: CreateHouseholdRequest, isUpdate: boolean = false): Promise<Partial<HouseholdData>> {
    const enriched: any = { ...data };

    // Generate full address
    enriched.full_address = this.generateFullAddress(data);

    // Set defaults for new households
    if (!isUpdate) {
      enriched.created_at = new Date().toISOString();
      enriched.is_active = true;
      enriched.no_of_families = 1;
      enriched.no_of_household_members = 0;
    }

    // Always update timestamp
    enriched.updated_at = new Date().toISOString();

    // Calculate income class
    if (data.monthly_income) {
      enriched.income_class = this.calculateIncomeClass(data.monthly_income);
    }

    return enriched;
  }

  /**
   * Generate full address from components
   */
  private generateFullAddress(data: CreateHouseholdRequest): string {
    const parts = [
      data.house_number,
      data.street_name,
      // Would need to lookup actual names from codes
      `Barangay ${data.barangay_code}`,
      data.zip_code
    ].filter(Boolean);

    return parts.join(', ');
  }

  /**
   * Calculate income class based on amount
   */
  private calculateIncomeClass(monthlyIncome: number): string {
    if (monthlyIncome < 12000) return 'poor';
    if (monthlyIncome < 24000) return 'low_income';
    if (monthlyIncome < 48000) return 'lower_middle';
    if (monthlyIncome < 84000) return 'middle';
    if (monthlyIncome < 144000) return 'upper_middle';
    return 'upper_income';
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
   * Validate barangay code format
   */
  private isValidBarangayCode(code: string): boolean {
    return /^\d{9}$/.test(code);
  }

  /**
   * Validate zip code format
   */
  private isValidZipCode(zipCode: string): boolean {
    return /^\d{4}$/.test(zipCode);
  }
}