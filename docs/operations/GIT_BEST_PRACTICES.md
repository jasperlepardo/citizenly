# Git Best Practices - RBI System
## Comprehensive Git Guidelines for Professional Development

---

## 🎯 **Overview**

This document establishes Git best practices for the RBI System project to ensure:
- **Clean commit history** for easy debugging and reviews
- **Consistent branching strategy** for organized development
- **Professional collaboration** through standardized workflows
- **Quality assurance** through proper review processes

---

## 📝 **Commit Message Standards**

### **Conventional Commits Format**
```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### **Commit Types**
| Type | Description | Example |
|------|-------------|---------|
| **feat** | New feature | `feat(auth): add user registration with PhilSys validation` |
| **fix** | Bug fix | `fix(psoc): resolve occupation search returning empty results` |
| **docs** | Documentation | `docs(deployment): update Supabase free tier setup guide` |
| **style** | Code style/formatting | `style(components): format Button component with Prettier` |
| **refactor** | Code refactoring | `refactor(api): optimize resident query performance` |
| **test** | Add/modify tests | `test(resident): add validation tests for registration form` |
| **chore** | Maintenance tasks | `chore(deps): update Next.js to version 14.0.2` |
| **perf** | Performance improvement | `perf(search): implement client-side caching for PSOC data` |
| **ci** | CI/CD changes | `ci: add automated testing workflow` |
| **build** | Build system changes | `build: optimize Tailwind CSS for production` |

### **Commit Message Examples**

#### ✅ **Good Commit Messages**
```bash
feat(residents): implement 5-step registration wizard
- Add step navigation with progress indicator
- Implement form validation for each step
- Add PSOC occupation search integration
- Include sectoral information auto-calculation

fix(database): resolve RLS policy blocking admin access
- Update user_profiles RLS policy for super_admin role
- Add barangay_code null check for system administrators
- Test policy with different user roles

docs(mvp): add frontend architecture documentation
- Document Next.js 13+ App Router structure
- Include Tailwind CSS design token integration
- Add component library organization
- Document free tier optimizations

refactor(api): optimize Supabase client for free tier
- Reduce API calls by implementing client-side calculations
- Add efficient caching strategies with React Query
- Simplify database queries to avoid complex JOINs
- Update error handling for better user experience
```

#### ❌ **Poor Commit Messages**
```bash
# Too vague
fix stuff
update code
changes

# No context
fixed bug
added feature
updated docs

# Too long in subject line
feat(residents): implement the complete 5-step resident registration wizard with form validation, PSOC search, and sectoral information calculation

# Missing type
add user authentication
update database schema
```

### **Commit Message Template**
Create a commit template file:

```bash
# ~/.gitmessage
<type>[scope]: <short description>

# Explain what this commit does (50-72 characters per line):
# - 
# - 
# - 

# Why is this change needed?
# - 

# Any breaking changes or special notes:
# - 

# References (issues, PRs, docs):
# - Closes #123
# - Related to #456
# - See docs/example.md

# Generated with Claude Code: https://claude.ai/code
# Co-Authored-By: Claude <noreply@anthropic.com>
```

Set the template:
```bash
git config commit.template ~/.gitmessage
```

---

## 🌿 **Branch Naming Standards**

### **Branch Naming Convention**
```
<type>/<scope>/<description>
```

### **Branch Types**
| Type | Purpose | Example |
|------|---------|---------|
| **feature** | New functionality | `feature/auth/user-registration` |
| **bugfix** | Bug fixes | `bugfix/psoc/search-empty-results` |
| **hotfix** | Critical production fixes | `hotfix/database/rls-policy-admin` |
| **docs** | Documentation updates | `docs/deployment/supabase-guide` |
| **chore** | Maintenance tasks | `chore/deps/nextjs-update` |
| **refactor** | Code improvements | `refactor/api/optimize-queries` |
| **test** | Testing additions | `test/components/form-validation` |

### **Good Branch Names**
```bash
feature/residents/registration-wizard
feature/households/composition-management
feature/dashboard/basic-analytics
bugfix/forms/validation-errors
bugfix/search/psoc-autocomplete
docs/mvp/frontend-architecture
refactor/components/design-system
test/api/resident-crud-operations
chore/setup/eslint-prettier-config
hotfix/auth/session-timeout
```

### **Branch Naming Rules**
- **Use lowercase** with hyphens for spaces
- **Be descriptive** but concise (under 50 characters)
- **Include scope** when applicable (residents, households, auth, etc.)
- **Avoid personal identifiers** (no initials or names)
- **Use present tense** for consistency

---

## 🔄 **Git Workflow**

### **Feature Development Workflow**

#### **1. Start New Feature**
```bash
# Ensure you're on main and up to date
git checkout main
git pull origin main

# Create feature branch
git checkout -b feature/residents/registration-wizard

# Verify branch creation
git branch --show-current
```

#### **2. Development Process**
```bash
# Make changes and commit frequently
git add .
git commit -m "feat(residents): add step 1 - personal information form

- Implement form with validation for required fields
- Add date picker for birthdate with age calculation
- Include PhilSys card number input with masking
- Add mobile number validation for Philippine format"

# Continue development with logical commits
git add src/components/forms/StepTwoEducation.tsx
git commit -m "feat(residents): add step 2 - education information

- Add education level dropdown with ISCED mapping
- Include school name input with validation
- Add graduation year picker with sensible limits
- Implement conditional fields based on education level"
```

#### **3. Keep Branch Updated**
```bash
# Regularly sync with main branch
git checkout main
git pull origin main
git checkout feature/residents/registration-wizard
git merge main

# Or use rebase for cleaner history (advanced)
git rebase main
```

#### **4. Prepare for Pull Request**
```bash
# Ensure all changes are committed
git status

# Push branch to remote
git push -u origin feature/residents/registration-wizard

# Create pull request on GitHub
```

### **Hotfix Workflow**
```bash
# For critical production issues
git checkout main
git pull origin main
git checkout -b hotfix/auth/session-timeout

# Make minimal fix
git add src/lib/auth.ts
git commit -m "hotfix(auth): fix session timeout causing user logout

- Increase session timeout from 1 hour to 8 hours
- Add automatic session refresh on user activity
- Update token validation to handle edge cases
- Tested with multiple user sessions

Fixes critical issue where users were logged out during form completion."

# Push and create urgent PR
git push -u origin hotfix/auth/session-timeout
```

---

## 📋 **Pull Request Best Practices**

### **PR Title Format**
```
<type>[scope]: <clear description>
```

**Examples:**
- `feat(residents): implement 5-step registration wizard`
- `fix(database): resolve RLS policy blocking admin users`
- `docs(deployment): add comprehensive Supabase setup guide`

### **PR Description Template**
```markdown
## Summary
Brief description of what this PR accomplishes.

## Changes Made
- ✅ Specific change 1
- ✅ Specific change 2  
- ✅ Specific change 3

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed
- [ ] Tested on mobile devices
- [ ] Database migration tested

## Screenshots/Demo
<!-- Add screenshots for UI changes -->

## Breaking Changes
<!-- List any breaking changes -->
- None

## Related Issues
- Closes #123
- Related to #456

## Checklist
- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] No sensitive data exposed

🤖 Generated with [Claude Code](https://claude.ai/code)
```

### **PR Review Process**

#### **Before Submitting PR**
```bash
# Self-review checklist
git log --oneline origin/main..HEAD  # Review commits
git diff origin/main...HEAD          # Review all changes

# Run tests and linting
npm run lint
npm run test
npm run build

# Check for sensitive data
git log --all --full-history -- "*.env*"
git log --all --full-history -S "password"
```

#### **Code Review Guidelines**

**For Authors:**
- Keep PRs focused and small (under 400 lines when possible)
- Provide clear context and rationale
- Respond promptly to feedback
- Address all comments before requesting re-review

**For Reviewers:**
- Review within 24 hours
- Focus on logic, security, and maintainability
- Be constructive and specific in feedback
- Approve only when confident in the changes

---

## 🛡️ **Security Best Practices**

### **Sensitive Data Protection**
```bash
# Check for sensitive data before committing
git diff --cached | grep -i -E "(password|secret|key|token|api)"

# Remove sensitive data from history (if accidentally committed)
git filter-branch --force --index-filter \
'git rm --cached --ignore-unmatch path/to/sensitive/file' \
--prune-empty --tag-name-filter cat -- --all
```

### **Pre-commit Hooks**
Create `.git/hooks/pre-commit`:
```bash
#!/bin/sh
# Pre-commit hook to prevent sensitive data

# Check for common sensitive patterns
if git diff --cached --name-only | xargs grep -l -i -E "(password|secret|key|token|api_key)" 2>/dev/null; then
    echo "Error: Potential sensitive data found in staged files"
    echo "Please review and remove sensitive data before committing"
    exit 1
fi

# Run linting
npm run lint
exit_code=$?

if [ $exit_code -ne 0 ]; then
    echo "Error: Linting failed. Please fix errors before committing"
    exit $exit_code
fi

exit 0
```

Make executable:
```bash
chmod +x .git/hooks/pre-commit
```

---

## 🎯 **Tagging and Releases**

### **Semantic Versioning**
Follow [SemVer](https://semver.org/): `MAJOR.MINOR.PATCH`

- **MAJOR**: Breaking changes
- **MINOR**: New features (backward compatible)
- **PATCH**: Bug fixes (backward compatible)

### **Release Process**
```bash
# Create release tag
git checkout main
git pull origin main

# Tag release
git tag -a v1.0.0 -m "Release v1.0.0: MVP production ready

Features:
- Complete resident registration system
- Household management functionality
- PSOC occupation search integration
- Dashboard with basic analytics
- Mobile-responsive design
- Supabase free tier optimization

Database:
- 15 tables with optimized schema
- 46,000+ reference data records imported
- Row Level Security implemented
- Performance tested for 10,000+ residents

Documentation:
- 19 comprehensive guides
- Step-by-step deployment instructions
- Frontend architecture documentation
- Migration and upgrade paths"

# Push tag
git push origin v1.0.0
```

### **Release Notes Template**
```markdown
# Release v1.0.0 - MVP Production Ready

## 🎉 Features
- ✅ Complete resident registration system
- ✅ Household management functionality  
- ✅ PSOC occupation search integration
- ✅ Dashboard with basic analytics

## 🐛 Bug Fixes
- Fixed RLS policy blocking admin access
- Resolved PSOC search empty results
- Fixed mobile form validation issues

## 📚 Documentation
- Added comprehensive deployment guide
- Updated frontend architecture docs
- Included migration procedures

## 🔧 Technical
- Database optimized for Supabase free tier
- Performance tested for 10,000+ residents
- Mobile-responsive design implemented

## 💾 Database
Run migration: `psql $SUPABASE_URL -f database/schema.sql`

## 🚀 Deployment
Follow: `docs/mvp/DEPLOYMENT_GUIDE.md`

**Full Changelog**: v0.9.0...v1.0.0
```

---

## 🧹 **Repository Maintenance**

### **Regular Cleanup**
```bash
# Remove merged branches
git branch --merged | grep -v -E "(main|master|develop)" | xargs -n 1 git branch -d

# Clean up remote tracking branches
git remote prune origin

# Garbage collect
git gc --prune=now
```

### **Branch Protection Rules**
Configure on GitHub:
- **Require pull request reviews** (at least 1 reviewer)
- **Require status checks** (tests must pass)
- **Require branches to be up to date**
- **Include administrators** in restrictions
- **Restrict pushes** to main branch

---

## 📊 **Git Workflow Examples**

### **Example 1: Feature Development**
```bash
# Developer starts new feature
git checkout main
git pull origin main
git checkout -b feature/dashboard/analytics

# Development with good commits
git add src/components/Dashboard/StatCard.tsx
git commit -m "feat(dashboard): add StatCard component for metrics display

- Create reusable card component with title and value props
- Include optional trend indicator (up/down/neutral)
- Add responsive design for mobile devices
- Implement loading state with skeleton animation"

git add src/hooks/useResidentStats.ts
git commit -m "feat(dashboard): add useResidentStats hook for data fetching

- Implement React Query hook for resident statistics
- Add client-side calculations for age demographics
- Include caching with 5-minute stale time
- Handle loading and error states gracefully"

# Push and create PR
git push -u origin feature/dashboard/analytics
# Create PR on GitHub with proper description
```

### **Example 2: Bug Fix**
```bash
# Developer fixes reported bug
git checkout main
git pull origin main
git checkout -b bugfix/forms/validation-errors

# Investigation and fix
git add src/components/forms/ResidentForm.tsx
git commit -m "fix(forms): resolve validation errors not clearing on input change

- Update form validation to clear errors when user modifies field
- Fix race condition between validation and state updates
- Add proper error message display for required fields
- Test validation behavior across all form steps

Fixes #123: Form validation errors persist after correction"

# Test fix and push
npm run test
git push -u origin bugfix/forms/validation-errors
```

### **Example 3: Documentation Update**
```bash
# Developer updates documentation
git checkout main
git pull origin main
git checkout -b docs/api/resident-endpoints

git add docs/api/RESIDENT_API.md
git commit -m "docs(api): add comprehensive resident API documentation

- Document all CRUD operations for resident management
- Include request/response examples with sample data
- Add authentication requirements and RLS policies
- Document error codes and troubleshooting steps
- Include rate limiting information for free tier"

git push -u origin docs/api/resident-endpoints
```

---

## 🔍 **Git History Analysis**

### **Useful Git Commands**
```bash
# View commit history with graph
git log --oneline --graph --decorate --all

# Find commits by author
git log --author="Your Name" --oneline

# Search commits by message
git log --grep="feat(residents)" --oneline

# View file change history
git log --follow -p -- src/components/ResidentForm.tsx

# Find when bug was introduced
git bisect start
git bisect bad HEAD
git bisect good v1.0.0

# View changes between releases
git log v1.0.0..v1.1.0 --oneline

# Statistics
git shortlog -sn  # Commits per author
git log --since="1 week ago" --oneline  # Recent commits
```

### **Commit Analysis Scripts**
```bash
# Create script: scripts/git-stats.sh
#!/bin/bash

echo "=== Git Repository Statistics ==="
echo "Total commits: $(git rev-list --all --count)"
echo "Contributors: $(git shortlog -sn | wc -l)"
echo "Branches: $(git branch -r | wc -l)"
echo "Tags: $(git tag | wc -l)"
echo ""

echo "=== Recent Activity (Last 30 days) ==="
git log --since="30 days ago" --pretty=format:"%h %an %s" --abbrev-commit
echo ""

echo "=== Top Contributors ==="
git shortlog -sn | head -10
```

---

## 📚 **Additional Resources**

### **Git Configuration**
```bash
# Set up global Git config
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
git config --global init.defaultBranch main
git config --global pull.rebase false
git config --global push.default simple

# Set up helpful aliases
git config --global alias.st status
git config --global alias.co checkout
git config --global alias.br branch
git config --global alias.ci commit
git config --global alias.unstage 'reset HEAD --'
git config --global alias.last 'log -1 HEAD'
git config --global alias.visual '!gitk'
```

### **IDE Integration**
- **VS Code**: GitLens extension for enhanced Git visualization
- **IntelliJ/WebStorm**: Built-in Git integration with visual diff
- **Sublime Text**: GitGutter and Git Savvy packages

### **Learning Resources**
- [Pro Git Book](https://git-scm.com/book) - Comprehensive Git reference
- [Conventional Commits](https://www.conventionalcommits.org/) - Commit message standard
- [Git Flow](https://nvie.com/posts/a-successful-git-branching-model/) - Branching model
- [Semantic Versioning](https://semver.org/) - Version numbering standard

---

## ⚠️ **Common Pitfalls to Avoid**

### **Don't Do This**
```bash
# Committing directly to main
git checkout main
git add .
git commit -m "quick fix"  # ❌ No direct commits to main

# Vague commit messages
git commit -m "updates"     # ❌ Too vague
git commit -m "fix"         # ❌ No context
git commit -m "changes"     # ❌ Not descriptive

# Large, unfocused commits
git add .
git commit -m "implement everything"  # ❌ Too broad

# Committing sensitive data
git add .env
git commit -m "add config"  # ❌ Contains secrets

# Force pushing to shared branches
git push --force origin main  # ❌ Dangerous for shared branches
```

### **Best Practices Summary**
- ✅ **Always work on feature branches**
- ✅ **Write descriptive commit messages**
- ✅ **Commit frequently with logical chunks**
- ✅ **Review changes before committing**
- ✅ **Keep branches up to date with main**
- ✅ **Use pull requests for code review**
- ✅ **Test before pushing**
- ✅ **Never commit sensitive data**

---

**Git Best Practices Status**: ✅ **Comprehensive Guidelines Established**  
**Team Adoption**: Ready for implementation  
**Automation**: Pre-commit hooks and templates configured  
**Documentation**: Complete with examples and troubleshooting

This document ensures professional Git practices for the RBI System development, maintaining code quality and collaboration standards throughout the project lifecycle.