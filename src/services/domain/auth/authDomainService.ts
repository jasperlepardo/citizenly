/**
 * Authentication Domain Service
 * Pure business logic for authentication operations
 * No infrastructure dependencies - uses interfaces only
 */

import type { IAuthRepository } from '@/types/domain/repositories';
import type { User, Session } from '@supabase/supabase-js';
import type { AuthUserProfile, UserRole } from '@/types/app/auth/auth';
import type { RepositoryResult } from '@/types/infrastructure/services/repositories';

/**
 * Sign up request with business validation
 */
export interface SignUpRequest {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  phone?: string;
  barangay_code?: string;
}

/**
 * Authentication Domain Service
 * Contains pure business logic for authentication
 */
export class AuthDomainService {
  constructor(private readonly repository: IAuthRepository) {}

  /**
   * Register a new user with business validation
   */
  async registerUser(data: SignUpRequest): Promise<RepositoryResult<User>> {
    // Business validation
    const validation = this.validateRegistration(data);
    if (!validation.isValid) {
      return {
        success: false,
        error: validation.errors.join(', ')
      };
    }

    // Prepare profile data
    const profile = {
      first_name: data.first_name,
      last_name: data.last_name,
      phone: data.phone,
      barangay_code: data.barangay_code,
      role: 'resident' as UserRole,
      created_at: new Date().toISOString()
    };

    // Delegate to repository
    return this.repository.signUp(data.email, data.password, profile);
  }

  /**
   * Sign in a user with validation
   */
  async signIn(email: string, password: string): Promise<RepositoryResult<Session>> {
    // Validate inputs
    if (!this.isValidEmail(email)) {
      return {
        success: false,
        error: 'Invalid email format'
      };
    }

    if (!this.isValidPassword(password)) {
      return {
        success: false,
        error: 'Password must be at least 8 characters'
      };
    }

    // Delegate to repository
    return this.repository.signIn(email, password);
  }

  /**
   * Sign out current user
   */
  async signOut(): Promise<RepositoryResult<void>> {
    return this.repository.signOut();
  }

  /**
   * Get current user with profile
   */
  async getCurrentUser(): Promise<RepositoryResult<User>> {
    return this.repository.getCurrentUser();
  }

  /**
   * Update user profile with validation
   */
  async updateProfile(userId: string, profile: Partial<AuthUserProfile>): Promise<RepositoryResult<AuthUserProfile>> {
    // Validate profile updates
    if (profile.phone && !this.isValidPhone(profile.phone)) {
      return {
        success: false,
        error: 'Invalid phone number format'
      };
    }

    if (profile.barangay_code && !this.isValidBarangayCode(profile.barangay_code)) {
      return {
        success: false,
        error: 'Invalid barangay code'
      };
    }

    // Apply business rules
    const enrichedProfile = this.enrichProfileData(profile);

    return this.repository.updateProfile(userId, enrichedProfile);
  }

  /**
   * Check if user has specific role
   */
  async hasRole(userId: string, role: UserRole): Promise<boolean> {
    const result = await this.repository.getProfile(userId);
    if (!result.success || !result.data) {
      return false;
    }
    return result.data.role === role;
  }

  /**
   * Check if user can access barangay
   */
  async canAccessBarangay(userId: string, barangayCode: string): Promise<boolean> {
    const result = await this.repository.getProfile(userId);
    if (!result.success || !result.data) {
      return false;
    }

    const profile = result.data;
    
    // Super admin can access all
    if (profile.role === 'super_admin') {
      return true;
    }

    // Barangay admin can only access their barangay
    if (profile.role === 'barangay_admin') {
      return profile.barangay_code === barangayCode;
    }

    // Regular users can only access their barangay
    return profile.barangay_code === barangayCode;
  }

  /**
   * Validate registration data
   */
  private validateRegistration(data: SignUpRequest): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Email validation
    if (!this.isValidEmail(data.email)) {
      errors.push('Invalid email format');
    }

    // Password validation
    if (!this.isValidPassword(data.password)) {
      errors.push('Password must be at least 8 characters with uppercase, lowercase, and number');
    }

    // Name validation
    if (!data.first_name || data.first_name.length < 2) {
      errors.push('First name must be at least 2 characters');
    }

    if (!data.last_name || data.last_name.length < 2) {
      errors.push('Last name must be at least 2 characters');
    }

    // Phone validation (optional)
    if (data.phone && !this.isValidPhone(data.phone)) {
      errors.push('Invalid Philippine phone number format');
    }

    // Barangay code validation (optional)
    if (data.barangay_code && !this.isValidBarangayCode(data.barangay_code)) {
      errors.push('Invalid barangay code format');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Validate email format
   */
  private isValidEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  /**
   * Validate password strength
   */
  private isValidPassword(password: string): boolean {
    // At least 8 characters, one uppercase, one lowercase, one number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
    return passwordRegex.test(password);
  }

  /**
   * Validate Philippine phone number
   */
  private isValidPhone(phone: string): boolean {
    // Philippine mobile number format: 09XXXXXXXXX or +639XXXXXXXXX
    const phoneRegex = /^(09|\+639)\d{9}$/;
    return phoneRegex.test(phone.replace(/\s|-/g, ''));
  }

  /**
   * Validate barangay code format
   */
  private isValidBarangayCode(code: string): boolean {
    // Barangay codes are typically 9 digits
    const codeRegex = /^\d{9}$/;
    return codeRegex.test(code);
  }

  /**
   * Enrich profile data with calculated fields
   */
  private enrichProfileData(profile: Partial<AuthUserProfile>): Partial<AuthUserProfile> {
    const enriched = { ...profile };

    // Add updated timestamp
    enriched.updated_at = new Date().toISOString();

    // Format phone number if provided
    if (enriched.phone) {
      enriched.phone = this.formatPhoneNumber(enriched.phone);
    }

    // Generate display name if not provided
    if (!enriched.display_name && (enriched.first_name || enriched.last_name)) {
      enriched.display_name = [enriched.first_name, enriched.last_name]
        .filter(Boolean)
        .join(' ');
    }

    return enriched;
  }

  /**
   * Format phone number to standard format
   */
  private formatPhoneNumber(phone: string): string {
    // Remove all non-digits
    const digits = phone.replace(/\D/g, '');
    
    // Convert to standard format
    if (digits.startsWith('639')) {
      return `+${digits}`;
    } else if (digits.startsWith('09')) {
      return `+63${digits.substring(1)}`;
    }
    
    return phone;
  }
}