## PR Title Format

<!-- Ensure your PR title follows the naming convention: -->
<!-- Feature/Fix: "feat: description" or "fix: description" -->
<!-- Release to Staging: "Release: v1.2.0 - Sprint/Milestone Name" -->
<!-- Release to Main: "Production Release: v1.2.0" -->

## 📋 Summary

Brief description of what this PR accomplishes.

## 🔧 Type of Change

<!-- Check the type of change your PR introduces: -->

- [ ] 🆕 **Feature** - New functionality added
- [ ] 🐛 **Bug Fix** - Existing functionality improved/fixed
- [ ] 🔧 **Chore** - Maintenance, dependencies, or tooling
- [ ] 📚 **Documentation** - Documentation updates
- [ ] 🚀 **Release** - develop → staging or staging → main

## 🎯 Target Branch Validation

<!-- Confirm you're targeting the correct branch according to workflow rules: -->

- [ ] ✅ **Feature/Fix/Chore → develop** (All feature branches must target develop)
- [ ] ✅ **develop → staging** (Release to staging)
- [ ] ✅ **staging → main** (Production release)

## 📛 Naming Convention Check

<!-- Confirm your branch and PR follow naming conventions: -->

- [ ] ✅ Branch name follows format: `type/ticket-id-description` or `type/description`
  - Examples: `feature/AUTH-123-user-login`, `fix/BUG-456-csrf-validation`, `chore/update-dependencies`
- [ ] ✅ PR title follows conventional format based on type

## 🧪 Testing

- [ ] Unit tests pass locally
- [ ] Integration tests pass locally
- [ ] Manual testing completed
- [ ] Cross-browser testing (if UI changes)
- [ ] Mobile responsive testing (if UI changes)

## 🔒 Security Checklist

- [ ] No sensitive data exposed
- [ ] Input validation implemented
- [ ] Authentication/authorization checked
- [ ] No SQL injection vulnerabilities
- [ ] XSS prevention implemented
- [ ] CSRF protection maintained

## 📊 Performance Impact

- [ ] No significant performance regression
- [ ] Bundle size impact considered
- [ ] Database query optimization reviewed
- [ ] Caching strategy evaluated

## 🎯 Code Quality

- [ ] Code follows project conventions
- [ ] TypeScript types are properly defined
- [ ] Error handling implemented
- [ ] Console.log statements removed/replaced with secure logger
- [ ] Comments added for complex logic
- [ ] Dead code removed

## 📱 UI/UX (if applicable)

- [ ] Design system components used
- [ ] Accessibility guidelines followed
- [ ] Responsive design implemented
- [ ] Loading states handled
- [ ] Error states handled

## 📚 Documentation

- [ ] Code is self-documenting
- [ ] Complex logic is commented
- [ ] API changes are documented
- [ ] README updated (if needed)

## 🔄 Git Flow & Workflow Compliance

- [ ] ✅ Branch follows strict naming convention: `type/ticket-id-description`
- [ ] ✅ Commits follow conventional commit format: `type(scope): description`
- [ ] ✅ Branch is up to date with target branch
- [ ] ✅ No merge conflicts
- [ ] ✅ Targets correct branch according to workflow rules:
  - Feature/Fix branches → `develop` only
  - Release branches → `develop` → `staging` → `main` (in sequence)

## ⚠️ Workflow Rules Reminder

<!-- These rules are STRICTLY enforced: -->

- ❌ **FORBIDDEN**: Feature branches → staging or main (must go through develop)
- ❌ **FORBIDDEN**: develop → main (must go through staging)
- ❌ **FORBIDDEN**: Direct pushes to protected branches
- ✅ **REQUIRED**: All status checks must pass before merging
- ✅ **REQUIRED**: Proper review approvals based on target branch

## 🚀 Deployment

- [ ] Environment variables updated (if needed)
- [ ] Database migrations included (if needed)
- [ ] Rollback plan considered
- [ ] Breaking changes communicated

## 📸 Screenshots (if UI changes)

<!-- Add screenshots here -->

## 🔗 Related Issues

Closes #<!-- issue number -->

---

## 🤖 Automated Checks

The following will be automatically checked:

- ✅ Code quality analysis
- ✅ Security scanning
- ✅ Performance budget
- ✅ Bundle size analysis
- ✅ Type checking
- ✅ Test coverage

<!--
Self-review reminder:
1. Read through your own code changes
2. Check for any console.log statements
3. Verify error handling
4. Confirm security measures
5. Test the changes locally
-->
