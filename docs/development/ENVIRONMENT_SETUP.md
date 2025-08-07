# Environment Setup Guide

## Overview

This guide covers the setup and configuration of the environment-based quality assurance system. Follow these steps to configure your development environment for optimal productivity and code quality.

## Prerequisites

- Node.js 18.17.0 or higher
- npm or yarn package manager
- Git with proper configuration
- IDE with TypeScript and ESLint support

## Quick Setup

```bash
# 1. Install dependencies
npm install

# 2. Setup Husky hooks
npm run prepare

# 3. Verify environment detection
npm run env:check

# 4. Test the quality system
npm run check
```

## Detailed Setup

### 1. Install Dependencies

The project includes all necessary quality assurance tools:

```bash
npm install
```

**Key dependencies installed:**

- **Code Quality**: ESLint, TypeScript, Prettier
- **Testing**: Jest, Testing Library, axe-core
- **Security**: audit-ci, Snyk, license-checker
- **Performance**: madge, bundlesize, jscpd
- **Git Hooks**: Husky, lint-staged

### 2. Configure Git Hooks

```bash
# Initialize Husky
npm run prepare

# Verify hooks are installed
ls -la .husky/
```

**Installed hooks:**

- `pre-commit`: Runs Tier 1 quality checks
- Automatic lint-staged processing
- Environment-aware validation

### 3. Environment Variables

Create environment-specific configuration files:

```bash
# Development
cp .env.example .env.development

# Staging (if needed)
cp .env.example .env.staging

# Production (if needed)
cp .env.example .env.production
```

**Key environment variables:**

```bash
# .env.development
NODE_ENV=development
NEXT_PUBLIC_ENVIRONMENT=development

# .env.staging
NODE_ENV=staging
NEXT_PUBLIC_ENVIRONMENT=staging

# .env.production
NODE_ENV=production
NEXT_PUBLIC_ENVIRONMENT=production
VERCEL_ENV=production
```

### 4. IDE Configuration

#### VS Code Setup

Create `.vscode/settings.json`:

```json
{
  "eslint.workingDirectories": ["./"],
  "eslint.format.enable": true,
  "typescript.preferences.importModuleSpecifier": "relative",
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "jest.autoRun": {
    "watch": false,
    "onSave": "test-file"
  }
}
```

**Recommended Extensions:**

```json
{
  "recommendations": [
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-vscode.vscode-typescript-next",
    "orta.vscode-jest",
    "bradlc.vscode-tailwindcss"
  ]
}
```

#### WebStorm/IntelliJ Setup

1. **ESLint Configuration:**
   - File → Settings → Languages & Frameworks → JavaScript → Code Quality Tools → ESLint
   - Enable "Automatic ESLint configuration"
   - Enable "Run eslint --fix on save"

2. **TypeScript Configuration:**
   - File → Settings → Languages & Frameworks → TypeScript
   - Select "Use TypeScript service"
   - Enable "Recompile on changes"

3. **Jest Configuration:**
   - File → Settings → Languages & Frameworks → JavaScript → Testing → Jest
   - Jest package: `<project>/node_modules/jest`
   - Configuration file: `<project>/jest.config.js`

### 5. Verify Installation

Run the verification script:

```bash
# Check environment detection
npm run env:check

# Test all tiers
npm run tier1:dev
npm run tier2:ci    # May require CI=true
npm run tier3:staging
npm run tier4:prod
```

**Expected output:**

- Environment detection shows correct tier
- All checks pass or show expected warnings
- No critical errors or failures

## Environment-Specific Configuration

### Development Environment

**Optimizations for speed:**

- Fast linting with compact format
- Type checking with skipLibCheck
- Silent test execution
- Minimal coverage requirements

**Configuration files:**

- `.eslintrc.dev.js` - Relaxed ESLint rules
- `jest.config.dev.js` - Fast test configuration

### CI/CD Environment

**Comprehensive validation:**

- Full ESLint validation
- Complete TypeScript checking
- Test coverage requirements
- Security scanning
- Bundle analysis

**Configuration files:**

- `.eslintrc.ci.js` - Strict ESLint rules
- `jest.config.ci.js` - Full coverage configuration
- `.github/workflows/*.yml` - GitHub Actions

### Staging Environment

**Integration testing focus:**

- End-to-end test execution
- Visual regression testing
- Performance monitoring
- Accessibility validation

### Production Environment

**Security and performance focus:**

- Critical vulnerability scanning
- Production bundle validation
- Health monitoring
- Performance benchmarks

## Custom Configuration

### Adjusting Quality Gates

**ESLint Rules:**

```javascript
// .eslintrc.dev.js - Development rules
module.exports = {
  extends: ['./.eslintrc.js'],
  rules: {
    '@typescript-eslint/no-explicit-any': 'warn', // Relaxed for dev
    'no-console': 'off', // Allow console in development
  },
};

// .eslintrc.ci.js - CI/CD rules
module.exports = {
  extends: ['./.eslintrc.js'],
  rules: {
    '@typescript-eslint/no-explicit-any': 'error', // Strict in CI
    'no-console': 'error', // No console in production code
  },
};
```

**TypeScript Configuration:**

```json
// tsconfig.json - Base configuration
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true
  }
}

// Development: Use skipLibCheck for speed
// CI/CD: Full type checking
```

**Test Coverage:**

```javascript
// jest.config.ci.js
module.exports = {
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },
};
```

**Bundle Size Limits:**

```json
// package.json
{
  "bundlesize": [
    {
      "path": ".next/static/chunks/*.js",
      "maxSize": "250 kB"
    },
    {
      "path": ".next/static/chunks/pages/*.js",
      "maxSize": "150 kB"
    }
  ]
}
```

### Adding New Tools

**Step 1: Install dependency**

```bash
npm install --save-dev new-tool
```

**Step 2: Add to quality tiers**

```typescript
// src/lib/env-config.ts
export const QUALITY_TIERS = {
  1: {
    name: 'Development',
    checks: ['lint:fast', 'type-check:fast', 'test:fast', 'new-tool:dev'],
  },
  // ... other tiers
};
```

**Step 3: Add npm scripts**

```json
// package.json
{
  "scripts": {
    "new-tool:dev": "new-tool --fast",
    "new-tool:ci": "new-tool --comprehensive"
  }
}
```

**Step 4: Update workflows**

```yaml
# .github/workflows/pull-request.yml
- name: Run new tool
  run: npm run new-tool:ci
```

## Troubleshooting Setup

### Common Issues

**Node.js Version Mismatch:**

```bash
# Check version
node --version

# Use nvm to manage versions
nvm install 18.17.0
nvm use 18.17.0
```

**Permission Issues:**

```bash
# Fix npm permissions
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) /usr/local/lib/node_modules
```

**Git Hooks Not Working:**

```bash
# Reinstall Husky
rm -rf .husky
npm run prepare

# Check hook permissions
ls -la .husky/
chmod +x .husky/pre-commit
```

**ESLint Configuration Errors:**

```bash
# Clear ESLint cache
rm -rf node_modules/.cache/.eslintcache

# Verify configuration
npx eslint --print-config src/index.js
```

**TypeScript Compilation Issues:**

```bash
# Clear TypeScript cache
rm -rf node_modules/.cache/.tsbuildinfo

# Rebuild
npm run type-check
```

### Performance Issues

**Slow Development Checks:**

```bash
# Use development-optimized commands
npm run dev:check  # Instead of full lint
npm run test:fast  # Instead of full test suite
```

**Memory Issues:**

```bash
# Increase Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=4096"
npm run build
```

**Large Bundle Warnings:**

```bash
# Analyze bundle composition
npm run analyze:bundle

# Check for circular dependencies
npm run analyze:deps
```

## Team Setup

### Onboarding New Developers

1. **Clone and setup:**

```bash
git clone <repository-url>
cd <project-directory>
npm install
npm run prepare
```

2. **IDE setup:**
   - Install recommended extensions
   - Configure workspace settings
   - Test ESLint and TypeScript integration

3. **Verify environment:**

```bash
npm run env:check
npm run check
```

4. **Create first commit:**

```bash
git add .
git commit -m "feat: setup development environment"
# Pre-commit hooks should run automatically
```

### Team Conventions

**Commit Messages:**

- Use conventional commit format
- Enforced by commitlint
- Examples: `feat:`, `fix:`, `docs:`, `refactor:`

**Code Style:**

- Enforced by ESLint and Prettier
- Automatic formatting on save
- Pre-commit validation

**Testing:**

- Write tests for new features
- Maintain coverage thresholds
- Run relevant tests before pushing

## Continuous Improvement

### Monitoring Quality Metrics

**Track metrics:**

- Build success rates
- Test coverage trends
- Security vulnerability counts
- Bundle size evolution

**Regular reviews:**

- Weekly: Review CI failure patterns
- Monthly: Update dependency versions
- Quarterly: Review and adjust quality gates

### Updating the System

**Dependency updates:**

```bash
# Check for updates
npm outdated

# Update with testing
npm update
npm run check
```

**Configuration updates:**

- Review ESLint rule changes
- Update TypeScript configuration
- Adjust coverage thresholds
- Update security policies

---

For questions about environment setup, see the [Quality Assurance documentation](./QUALITY_ASSURANCE.md) or create an issue.
