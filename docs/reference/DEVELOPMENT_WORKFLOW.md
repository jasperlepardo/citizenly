# Development Workflow

> **Complete development process guide for the Citizenly project**
> 
> This document outlines the full development lifecycle from local setup to production deployment. Follow this workflow for consistent, reliable development practices.

## 📖 Table of Contents

1. [🚀 Getting Started](#-getting-started)
2. [🔄 Daily Development Flow](#-daily-development-flow)
3. [🌿 Feature Development](#-feature-development)
4. [🐛 Bug Fixes](#-bug-fixes)
5. [🔍 Code Review Process](#-code-review-process)
6. [🧪 Testing Workflow](#-testing-workflow)
7. [🚀 Deployment Pipeline](#-deployment-pipeline)
8. [📋 Quality Gates](#-quality-gates)
9. [🔧 Tools & Commands](#-tools--commands)

---

## 🚀 Getting Started

### **Prerequisites**
- Node.js 18.x or higher
- npm or yarn
- Git
- VS Code (recommended)
- GitHub CLI (optional but helpful)

### **Initial Setup**
```bash
# Clone repository
git clone https://github.com/your-org/citizenly.git
cd citizenly

# Install dependencies
npm install

# Set up environment
cp .env.example .env.local
# Fill in required environment variables

# Set up database
npm run db:setup

# Start development server
npm run dev
```

### **Verify Setup**
```bash
# Run tests
npm test

# Check linting
npm run lint

# Check types
npm run type-check

# Build project
npm run build
```

---

## 🔄 Daily Development Flow

### **1. Start of Day**
```bash
# Switch to develop and pull latest
git checkout develop
git pull origin develop

# Check for dependency updates
npm outdated

# Start development server
npm run dev
```

### **2. During Development**
```bash
# Run tests continuously
npm run test:watch

# Check linting in real-time
npm run lint:watch

# Type checking
npm run type-check:watch
```

### **3. End of Day**
```bash
# Stage and commit changes
git add .
git commit -m "feat(component): implement user profile form"

# Push to feature branch
git push origin feature/user-profile-form
```

---

## 🌿 Feature Development

### **1. Create Feature Branch**
```bash
# Ensure you're on develop
git checkout develop
git pull origin develop

# Create feature branch (follows naming conventions)
git checkout -b feature/user-authentication

# Or use helper script
npm run new-feature user-authentication "Implement OAuth login"
```

### **2. Development Cycle**
```bash
# Make changes
# Edit files...

# Run quality checks
npm run lint:fix
npm run type-check
npm test

# Commit frequently with good messages
git add .
git commit -m "feat(auth): add OAuth login component"

# Push regularly
git push -u origin feature/user-authentication
```

### **3. Pre-PR Checklist**
- [ ] All tests pass (`npm test`)
- [ ] No linting errors (`npm run lint`)
- [ ] No TypeScript errors (`npm run type-check`)
- [ ] Build succeeds (`npm run build`)
- [ ] Manual testing completed
- [ ] Documentation updated if needed
- [ ] Database migrations tested (if applicable)

### **4. Create Pull Request**
```bash
# Create PR with GitHub CLI
gh pr create \
  --title "feat: implement user authentication" \
  --body "Implements OAuth login with Google and GitHub providers. Includes user profile management and session handling."

# Or push and create PR via GitHub web interface
git push origin feature/user-authentication
```

---

## 🐛 Bug Fixes

### **1. Bug Report Analysis**
- Reproduce the issue locally
- Identify root cause
- Check if similar issues exist
- Determine scope of fix

### **2. Create Fix Branch**
```bash
# Create fix branch
git checkout develop
git pull origin develop
git checkout -b fix/login-validation-error

# For hotfixes (production issues)
git checkout main
git pull origin main
git checkout -b hotfix/security-vulnerability
```

### **3. Fix Implementation**
```bash
# Implement fix
# Edit files...

# Add test case for the bug
# Write regression test

# Verify fix works
npm test
npm run build

# Commit with clear message
git commit -m "fix(auth): resolve validation error on empty email field"
```

### **4. Testing & Verification**
- Test the specific bug scenario
- Run full test suite
- Manual testing in affected areas
- Verify no regression introduced

---

## 🔍 Code Review Process

### **1. Pre-Review (Author)**
- [ ] Self-review the PR diff
- [ ] Ensure PR description is clear
- [ ] Add screenshots/videos for UI changes
- [ ] Link related issues
- [ ] Request appropriate reviewers

### **2. Review Guidelines (Reviewer)**
- [ ] Code follows naming conventions
- [ ] Logic is clear and maintainable
- [ ] Tests cover new functionality
- [ ] Security considerations addressed
- [ ] Performance implications considered
- [ ] Documentation updated if needed

### **3. Review Process**
```bash
# Check out PR locally for testing
gh pr checkout 123

# Test the changes
npm install
npm test
npm run build
npm run dev

# Test the actual feature manually
```

### **4. Approval & Merge**
- Require 1+ approvals for develop
- Require 2+ approvals for staging/main
- All checks must pass
- Squash and merge (preferred)
- Delete feature branch after merge

---

## 🧪 Testing Workflow

### **Unit Tests**
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- UserProfile.test.tsx
```

### **Integration Tests**
```bash
# Run integration tests
npm run test:integration

# Run API tests
npm run test:api

# Test database operations
npm run test:db
```

### **End-to-End Tests**
```bash
# Run E2E tests
npm run test:e2e

# Run E2E tests in specific browser
npm run test:e2e:chrome

# Run E2E tests headlessly
npm run test:e2e:headless
```

### **Manual Testing**
- Test new features thoroughly
- Check responsive design
- Verify accessibility
- Test error scenarios
- Cross-browser testing

---

## 🚀 Deployment Pipeline

### **Development Environment**
- Automatic deployment on merge to `develop`
- Environment: `development`
- URL: `https://dev.citizenly.app`
- Database: Development instance

### **Staging Environment**
- Manual deployment from `develop` to `staging`
- Environment: `staging`
- URL: `https://staging.citizenly.app`
- Database: Staging instance (production-like data)

### **Production Environment**
- Manual deployment from `staging` to `main`
- Environment: `production`
- URL: `https://citizenly.app`
- Database: Production instance

### **Deployment Commands**
```bash
# Deploy to staging
npm run deploy:staging

# Deploy to production
npm run deploy:production

# Rollback deployment
npm run rollback:production
```

---

## 📋 Quality Gates

### **Develop Branch**
- [ ] Build passes
- [ ] All tests pass
- [ ] Linting passes
- [ ] Type checking passes
- [ ] Security scan passes
- [ ] 1+ code review approval

### **Staging Branch**
- [ ] All develop requirements +
- [ ] Integration tests pass
- [ ] E2E tests pass
- [ ] Performance tests pass
- [ ] Manual QA approval

### **Main Branch**
- [ ] All staging requirements +
- [ ] Accessibility tests pass
- [ ] Security audit passes
- [ ] Product owner approval
- [ ] Release notes prepared

---

## 🔧 Tools & Commands

### **Development Tools**
```bash
# Code formatting
npm run format

# Linting
npm run lint
npm run lint:fix

# Type checking
npm run type-check
npm run type-check:watch

# Database operations
npm run db:migrate
npm run db:seed
npm run db:reset
```

### **Build & Deploy**
```bash
# Production build
npm run build

# Start production server
npm start

# Analyze bundle
npm run analyze

# Generate documentation
npm run docs:generate
```

### **Testing Commands**
```bash
# All test types
npm test                    # Unit tests
npm run test:integration    # Integration tests
npm run test:e2e           # End-to-end tests
npm run test:visual        # Visual regression tests
npm run test:a11y          # Accessibility tests
npm run test:perf          # Performance tests
```

### **Maintenance**
```bash
# Update dependencies
npm run deps:update

# Security audit
npm audit
npm run security:check

# Clean up
npm run clean
npm run cache:clear
```

---

## 🚨 Emergency Procedures

### **Production Hotfix**
```bash
# 1. Create hotfix from main
git checkout main
git pull origin main
git checkout -b hotfix/critical-security-fix

# 2. Implement fix quickly
# Edit files...

# 3. Test thoroughly but quickly
npm test
npm run build

# 4. Commit and push
git commit -m "hotfix: fix critical security vulnerability"
git push origin hotfix/critical-security-fix

# 5. Create emergency PR to main
gh pr create --title "HOTFIX: Critical Security Fix" --base main

# 6. Get fast-track approval and merge
# 7. Deploy immediately
npm run deploy:production

# 8. Backport to develop
git checkout develop
git cherry-pick <commit-hash>
git push origin develop
```

### **Rollback Procedure**
```bash
# Rollback to previous version
npm run rollback:production

# Or rollback to specific version
npm run rollback:production -- --version=v1.2.3
```

---

## 📊 Workflow Metrics

### **Development Velocity**
- Lead time: Feature request → Production
- Cycle time: Development start → Merge
- Deployment frequency: How often we deploy
- MTTR: Mean time to recovery

### **Quality Metrics**
- Test coverage: >80% target
- Bug escape rate: Bugs found in production
- Code review coverage: 100% of PRs reviewed
- Security scan results: Zero critical vulnerabilities

---

## 🎯 Best Practices

### **Do's**
- ✅ Follow naming conventions
- ✅ Write tests for new features
- ✅ Keep PRs small and focused
- ✅ Update documentation
- ✅ Use conventional commit messages
- ✅ Test locally before pushing

### **Don'ts**
- ❌ Push directly to protected branches
- ❌ Skip testing
- ❌ Merge without review
- ❌ Leave TODO comments in production code
- ❌ Ignore linting errors
- ❌ Commit secrets or sensitive data

---

💡 **Remember**: Quality over speed. It's better to deliver a well-tested, maintainable feature than to rush and create technical debt.

🔗 **Related Documentation**: 
- [Git Workflow Conventions](./GIT_WORKFLOW_CONVENTIONS.md) for branch/commit naming
- [Code Review Guidelines](./CODE_REVIEW_GUIDELINES.md) for detailed review process
- [Testing Strategy](./TESTING_STRATEGY.md) for comprehensive testing approach