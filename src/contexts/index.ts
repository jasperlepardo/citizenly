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
  type UserProfile,
  type Role,
} from './AuthContext';

// Theme context with hooks
export {
  ThemeProvider,
  useTheme,
} from './ThemeContext';