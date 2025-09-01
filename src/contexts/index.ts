/**
 * Contexts Module
 * Centralized context exports following React best practices
 */

// Authentication context with hooks and types
export {
  AuthProvider,
  useAuth,
  useRequireAuth,
  useRequireRole,
  useRequirePermission,
} from './AuthContext';

// Role type is now exported from centralized @/types
export type { Role, AuthContextType } from '@/types';

// Theme context with hooks
export { ThemeProvider, useTheme } from './ThemeContext';
