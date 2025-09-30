/**
 * Lint-staged Configuration - Environment-aware file processing
 * Processes only staged files for optimal performance in development
 * Temporarily simplified to exclude test execution during ESLint fixes
 */

module.exports = {
  // TypeScript and JavaScript files (excluding Storybook and test files)
  '*.{ts,tsx,js,jsx}': filenames => {
    const nonStorybookFiles = filenames.filter(
      filename =>
        !filename.includes('.stories.') &&
        !filename.includes('.test.') &&
        !filename.includes('__tests__')
    );
    if (nonStorybookFiles.length === 0) return [];

    return [
      `eslint ${nonStorybookFiles.join(' ')} --fix`,
      `prettier --write ${nonStorybookFiles.join(' ')}`,
    ];
  },

  // JSON files
  '*.json': ['prettier --write'],

  // CSS and styling files
  '*.{css,scss,sass}': ['prettier --write'],

  // Markdown files
  '*.md': ['prettier --write'],

  // Configuration files
  '*.{yml,yaml}': ['prettier --write'],

  // TypeScript files (additional type checking for critical files)
  'src/**/!(*.test|*.stories|__tests__/**).{ts,tsx}': () => [
    // Run type check on the entire project (not just staged files)
    // This ensures we don't break type dependencies
    'tsc --noEmit --skipLibCheck',
  ],
};
