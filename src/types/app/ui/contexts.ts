/**
 * Context Types
 *
 * @fileoverview TypeScript interfaces for React context providers
 * in the Citizenly RBI system.
 */

import type { Session, User } from '@supabase/supabase-js';

import type { AuthRole, AuthUserProfile } from '@/types/app/auth/auth';

// =============================================================================
// AUTHENTICATION CONTEXT TYPES
// =============================================================================

/**
 * Role interface extending AuthRole
 * Consolidates from src/contexts/AuthContext.tsx
 */
export interface Role extends Pick<AuthRole, 'id' | 'name'> {
  permissions: Record<string, boolean | string>;
}

/**
 * Authentication context type interface
 * Consolidates from src/contexts/AuthContext.tsx
 */
export interface AuthContextType {
  // Authentication state
  session: Session | null;
  user: User | null;
  userProfile: AuthUserProfile | null;
  role: Role | null;

  // Loading states
  loading: boolean;
  profileLoading: boolean;
  profileError: string | null;

  // Methods
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  loadProfile: () => Promise<void>;
  refreshProfile: () => Promise<void>;

  // Helper methods
  hasPermission: (permission: string) => boolean;
  isInRole: (roleName: string) => boolean;
  canAccessBarangay: (barangayCode: string) => boolean;
  isBarangayAdmin: () => boolean;
}