/**
 * Lint-staged Configuration - Environment-aware file processing
 * Processes only staged files for optimal performance in development
 */

module.exports = {
  // TypeScript and JavaScript files
  '*.{ts,tsx,js,jsx}': [
    // Use development-friendly ESLint config for pre-commit
    'eslint --config .eslintrc.dev.js --fix',
    'prettier --write',
  ],

  // JSON files
  '*.json': ['prettier --write'],

  // CSS and styling files
  '*.{css,scss,sass}': ['prettier --write'],

  // Markdown files
  '*.md': ['prettier --write'],

  // Configuration files
  '*.{yml,yaml}': ['prettier --write'],

  // TypeScript files (additional type checking for critical files)
  'src/**/*.{ts,tsx}': () => [
    // Run type check on the entire project (not just staged files)
    // This ensures we don't break type dependencies
    'tsc --noEmit --skipLibCheck',
  ],

  // Test files (run related tests)
  '*.test.{ts,tsx,js,jsx}': ['jest --bail --findRelatedTests --passWithNoTests'],

  // Package.json (validate and format)
  'package.json': [
    'npm run validate', // Will run environment-appropriate checks
  ],
};
