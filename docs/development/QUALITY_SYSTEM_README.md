# 🛡️ Environment-Based Quality Assurance System

## Quick Overview

This project includes a **comprehensive 4-tier quality assurance system** that automatically adapts validation intensity based on your environment. Get fast feedback in development while ensuring production safety.

```bash
# ⚡ Quick Start - Run environment-appropriate checks
npm run check

# 🔍 Check your environment detection
npm run env:check
```

## 🚀 4-Tier System

| Environment        | Speed             | Coverage         | Command                 |
| ------------------ | ----------------- | ---------------- | ----------------------- |
| **🟢 Development** | ⚡⚡⚡ Super Fast | Essential        | `npm run tier1:dev`     |
| **🟡 CI/CD**       | ⚡⚡ Fast         | Comprehensive    | `npm run tier2:ci`      |
| **🟠 Staging**     | ⚡ Thorough       | Enhanced Testing | `npm run tier3:staging` |
| **🔴 Production**  | 🔒 Critical       | Security-Focused | `npm run tier4:prod`    |

## 📋 What Gets Checked

### Tier 1 (Development)

- ✅ Fast linting with compact output
- ✅ Quick TypeScript checking
- ✅ Silent test execution
- ⏱️ **Complete in ~15-30 seconds**

### Tier 2 (CI/CD)

- ✅ Full ESLint validation
- ✅ Complete TypeScript checking
- ✅ Test coverage requirements
- ✅ Security vulnerability scanning
- ✅ Bundle size validation
- ⏱️ **Complete in ~2-5 minutes**

### Tier 3 (Staging)

- ✅ End-to-end testing
- ✅ Visual regression tests
- ✅ Performance monitoring
- ✅ Accessibility validation
- ⏱️ **Complete in ~5-15 minutes**

### Tier 4 (Production)

- ✅ Critical security audit
- ✅ Production vulnerability scan
- ✅ Bundle analysis
- ✅ Health monitoring
- ⏱️ **Complete in ~3-10 minutes**

## 🎯 Key Features

### ⚡ Automatic Environment Detection

The system automatically detects your environment and runs the appropriate tier:

- Detects `NODE_ENV`, `CI`, `VERCEL_ENV`
- No manual configuration needed
- Optimal performance for each environment

### 🔧 Pre-commit Hooks

Tier 1 checks run automatically on every commit:

- Fast validation for immediate feedback
- Only processes changed files
- Prevents broken code from being committed

### 📊 Comprehensive Tooling

- **Code Quality**: ESLint, TypeScript, Prettier
- **Testing**: Jest, Testing Library, axe-core
- **Security**: npm audit, audit-ci, Snyk integration
- **Performance**: Bundle analysis, dependency checking

### 🔄 GitHub Actions Integration

Workflows automatically trigger appropriate tier validation:

- Pull requests → Tier 2 validation
- Staging deploys → Tier 3 testing
- Production deploys → Tier 4 critical checks

## 🚀 Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Setup Git Hooks

```bash
npm run prepare
```

### 3. Verify System

```bash
# Check environment detection
npm run env:check

# Test your tier
npm run check
```

### 4. Development Workflow

```bash
# Make changes to code
git add .
git commit -m "feat: your changes"
# Pre-commit hooks run automatically (Tier 1)

# Push to CI
git push
# GitHub Actions run Tier 2 validation

# Deploy to staging
# Tier 3 integration tests run

# Deploy to production
# Tier 4 critical validation runs
```

## 📖 Documentation

### Complete Guides

- **[📋 Quality Assurance Guide](docs/development/QUALITY_ASSURANCE.md)** - Complete system documentation
- **[⚙️ Environment Setup Guide](docs/development/ENVIRONMENT_SETUP.md)** - Setup and configuration
- **[🏗️ Implementation Guide](docs/development/IMPLEMENTATION_GUIDE.md)** - Development workflows

### Quick References

- **Configuration Files**: `.eslintrc.*.js`, `jest.config.*.js`, `audit-ci.json`
- **Scripts**: See `package.json` for all available commands
- **Workflows**: `.github/workflows/` for CI/CD configuration

## 🛠️ Common Commands

```bash
# Environment-aware validation
npm run check                # Auto-detects and runs appropriate tier
npm run validate            # Alias for check

# Manual tier execution
npm run tier1:dev           # Development checks
npm run tier2:ci            # CI/CD validation
npm run tier3:staging       # Staging integration tests
npm run tier4:prod          # Production critical validation

# Individual tool execution
npm run lint:fast           # Fast linting
npm run type-check:fast     # Quick TypeScript check
npm run test:fast           # Silent test execution
npm run security:scan       # Security vulnerability scan

# Environment detection
npm run env:check           # Display detected environment and tier
```

## 🎨 IDE Integration

### VS Code

Install recommended extensions for automatic:

- ESLint integration with auto-fix
- TypeScript validation
- Prettier formatting
- Jest test integration

### WebStorm/IntelliJ

Built-in support for:

- ESLint with project configuration
- TypeScript service integration
- Jest run configurations
- Git hook integration

## 🔧 Customization

### Adjusting Rules

```javascript
// .eslintrc.dev.js - Relaxed for development
// .eslintrc.ci.js - Strict for CI/CD

// jest.config.dev.js - Fast tests
// jest.config.ci.js - Coverage requirements
```

### Adding New Tools

1. Install dependency
2. Update `src/lib/env-config.ts` tiers
3. Add npm scripts
4. Update workflows
5. Document changes

## 📊 System Status

**Current Implementation**:

- ✅ 4-tier validation system
- ✅ Automatic environment detection
- ✅ Pre-commit hooks with lint-staged
- ✅ GitHub Actions workflows
- ✅ Comprehensive security tooling
- ✅ Performance monitoring
- ✅ Accessibility testing framework
- ✅ Complete documentation

**Test Results**:

- ✅ 102 tests passing across 6 test suites
- ✅ TypeScript compilation clean
- ✅ All tiers functional and tested

## 🏆 Benefits

### For Developers

- **⚡ Fast feedback** in development
- **🔄 Automated validation** on commits
- **📋 Clear error messages** with actionable fixes
- **🛡️ Prevents broken deployments**

### For Teams

- **📊 Consistent code quality** across all contributors
- **🔒 Security-first** approach with vulnerability scanning
- **📈 Maintainable codebase** with comprehensive testing
- **🚀 Confident deployments** with staged validation

### For Production

- **🛡️ Critical security validation** before deployment
- **📦 Bundle optimization** and size monitoring
- **⚡ Performance benchmarking** and health checks
- **🔍 Comprehensive monitoring** and alerting

## 🔗 Related Documentation

- **[Frontend Architecture](docs/architecture/FRONTEND_ARCHITECTURE.md)** - System design
- **[Deployment Guide](docs/deployment/DEPLOYMENT_GUIDE.md)** - Deployment procedures
- **[Tech Stack](docs/reference/TECH_STACK.md)** - Technology overview
- **[Component Library](docs/reference/COMPONENT_LIBRARY.md)** - UI components

## 🚨 Troubleshooting

**Common Issues**:

```bash
# Dependencies not installed
npm install

# Git hooks not working
npm run prepare

# ESLint cache issues
rm -rf node_modules/.cache/.eslintcache

# TypeScript compilation errors
rm -rf node_modules/.cache/.tsbuildinfo
npm run type-check
```

**Need Help?**

- Check the [Quality Assurance Guide](docs/development/QUALITY_ASSURANCE.md) for detailed troubleshooting
- Review [Environment Setup](docs/development/ENVIRONMENT_SETUP.md) for configuration issues
- Create an issue with error details and environment information

---

**🎯 Ready to start?** Run `npm run check` to test the system with your current environment!
