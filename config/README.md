# Configuration Files

Centralized configuration management for the project.

## 📁 Structure

### `build/` - Build Configuration
- `next.config.js` - Next.js configuration
- `next.config.production.mjs` - Production-optimized Next.js config
- `tailwind.config.js` - Tailwind CSS configuration
- `postcss.config.js` - PostCSS configuration
- `eslint.config.js` - ESLint configuration

### `jest/` - Testing Configuration
- `jest.config.js` - Base Jest configuration
- `jest.config.ci.js` - CI environment Jest config
- `jest.config.dev.js` - Development environment Jest config
- `jest.setup.js` - Jest setup file
- `jest.setup.ci.js` - CI-specific setup
- `jest.setup.dev.js` - Development-specific setup
- `jest.globals.js` - Global Jest configuration
- `vitest.config.ts` - Vitest configuration

### `deployment/` - Deployment Configuration
- `netlify.toml` - Netlify deployment configuration
- `vercel.json` - Vercel deployment configuration

### Root Level Configuration
- `audit-ci.json` - Audit CI configuration
- `bundle-budget.json` - Bundle size budget configuration
- `sonar-project.properties` - SonarQube configuration

## 🔗 Root References

The project root contains reference files that delegate to this organized structure:

- `jest.config.js` → `config/jest/jest.config.js`
- `next.config.js` → `config/build/next.config.js`
- `tailwind.config.js` → `config/build/tailwind.config.js`
- `postcss.config.js` → `config/build/postcss.config.js`
- `eslint.config.js` → `config/build/eslint.config.js`
- `vitest.config.ts` → `config/jest/vitest.config.ts`

## 📋 Usage

Most tools automatically find configuration files in their expected locations. For tools that require explicit paths, use:

```bash
# Jest with specific config
jest --config config/jest/jest.config.ci.js

# Audit CI with config
audit-ci --config config/audit-ci.json

# Next.js will automatically use config/build/next.config.js when moved
```

## 🔧 Migration Notes

Configuration files were moved from project root to maintain cleaner organization while preserving functionality through delegation files and updated references in `package.json`.