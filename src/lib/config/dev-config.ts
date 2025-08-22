/**
 * Development Configuration
 * Secure handling of development-only features and credentials
 */

// Environment check
const isDevelopment = process.env.NODE_ENV === 'development';
const isDevModeEnabled = process.env.NEXT_PUBLIC_DEV_MODE === 'true';

/**
 * Check if development features should be enabled
 * Only enable in development environment with explicit flag
 */
export function isDevFeatureEnabled(): boolean {
  return isDevelopment && isDevModeEnabled;
}

/**
 * Get development credentials from environment variables
 * Never hardcode credentials in source code
 */
export function getDevCredentials() {
  if (!isDevFeatureEnabled()) {
    throw new Error('Development features are not enabled');
  }

  const devEmail = process.env.DEV_ADMIN_EMAIL;
  const devPassword = process.env.DEV_ADMIN_PASSWORD;

  if (!devEmail || !devPassword) {
    throw new Error(
      'Development credentials not configured. Please set DEV_ADMIN_EMAIL and DEV_ADMIN_PASSWORD in your .env file'
    );
  }

  // Validate minimum password requirements even for dev
  if (devPassword.length < 12) {
    throw new Error('Development password must be at least 12 characters long');
  }

  return {
    email: devEmail,
    password: devPassword,
  };
}

/**
 * Get demo user configuration
 */
export function getDemoUserConfig() {
  if (!isDevFeatureEnabled()) {
    throw new Error('Development features are not enabled');
  }

  return {
    first_name: process.env.DEV_ADMIN_FIRST_NAME || 'Demo',
    last_name: process.env.DEV_ADMIN_LAST_NAME || 'Administrator',
    mobile_number: process.env.DEV_ADMIN_MOBILE || '09000000000',
  };
}

/**
 * Security warning for development mode
 */
export function logDevModeWarning(): void {
  if (isDevFeatureEnabled()) {
    console.warn('🚨 DEVELOPMENT MODE ENABLED - This should NOT be enabled in production!');
    console.warn('🔒 Make sure NEXT_PUBLIC_DEV_MODE is set to "false" in production');
  }
}

/**
 * Validate development environment setup
 */
export function validateDevEnvironment(): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!isDevelopment && isDevModeEnabled) {
    errors.push('DEV_MODE should not be enabled in production');
  }

  if (isDevFeatureEnabled()) {
    try {
      getDevCredentials();
    } catch (error) {
      errors.push(`Dev credentials error: ${error}`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
