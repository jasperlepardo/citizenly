/**
 * Authentication Utilities Exports
 * Centralized exports for all authentication-related utilities
 */

// Export specific auth functions (excluding location functions that belong in database)
export {
  // User management
  registerUser,
  signInUser,
  signOutUser,
  getCurrentUser,
  updateUserProfile,
  // Password management
  requestPasswordReset,
  updatePassword,
  // Session management
  getCurrentSession,
  onAuthStateChange,
  // Role and permission functions
  hasRole,
  isAdmin,
  canAccessBarangay,
  getUserAccessibleBarangays,
  // Profile functions
  getUserProfile,
  // Utility functions
  searchBarangays,
  searchOccupations,
  getAuthErrorMessage,
  // Types
  type UserRole,
  type UserProfile,
  type RegistrationData,
} from './auth-helpers';

export * from './errors';
export * from './csrf-utils';
