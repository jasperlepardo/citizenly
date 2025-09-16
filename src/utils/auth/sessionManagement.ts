/**
 * @deprecated This file has been moved to services layer for proper architecture.
 * Use @/services/infrastructure/auth/authService instead.
 * 
 * This file provides backward compatibility exports during the migration period.
 * It will be removed in a future version.
 * 
 * ARCHITECTURAL NOTE: Business logic should be in services, not utils.
 * Utils should only contain pure functions with no business domain knowledge.
 */

// Re-export from the new service location for backward compatibility
export {
  getSessionWithFallback,
  fetchWithAuth,
  validateSession,
  refreshSession,
  signOut,
  getCurrentUser,
  hasPermission,
} from '@/services/infrastructure/auth/authService';

// Import the service class for advanced usage
export { AuthService } from '@/services/infrastructure/auth/authService';
