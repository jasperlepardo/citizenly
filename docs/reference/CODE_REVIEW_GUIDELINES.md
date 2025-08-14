# Code Review Guidelines

> **Comprehensive code review standards and checklist for the Citizenly project**
> 
> This document establishes consistent code review practices to maintain high code quality, security, and maintainability across the team.

## 📖 Table of Contents

1. [🎯 Review Philosophy](#-review-philosophy)
2. [👥 Roles & Responsibilities](#-roles--responsibilities)
3. [📋 Review Checklist](#-review-checklist)
4. [🔍 What to Look For](#-what-to-look-for)
5. [💬 Communication Guidelines](#-communication-guidelines)
6. [⚡ Review Process](#-review-process)
7. [🚨 Security Review](#-security-review)
8. [📊 Performance Review](#-performance-review)
9. [🎨 UI/UX Review](#-uiux-review)
10. [🛠️ Tools & Automation](#️-tools--automation)

---

## 🎯 Review Philosophy

### **Core Principles**
- **Quality over Speed**: Thorough reviews prevent technical debt
- **Learning Opportunity**: Reviews help team members grow
- **Constructive Feedback**: Focus on improvement, not criticism
- **Shared Ownership**: Everyone is responsible for code quality
- **Security First**: Security considerations in every review

### **Review Goals**
- Maintain code quality and consistency
- Catch bugs before they reach production
- Ensure adherence to standards and conventions
- Share knowledge across the team
- Identify potential security vulnerabilities
- Optimize performance and user experience

---

## 👥 Roles & Responsibilities

### **📝 Pull Request Author**

#### **Before Creating PR**
- [ ] Self-review the code thoroughly
- [ ] Run all tests locally (`npm test`)
- [ ] Check linting (`npm run lint`)
- [ ] Verify type checking (`npm run type-check`)
- [ ] Test the feature manually
- [ ] Update documentation if needed
- [ ] Write clear PR description

#### **PR Description Requirements**
```markdown
## Summary
Brief description of what this PR does

## Changes Made
- Specific change 1
- Specific change 2
- Specific change 3

## Testing
- [ ] Unit tests added/updated
- [ ] Integration tests verified
- [ ] Manual testing completed
- [ ] Cross-browser testing (if UI changes)

## Screenshots/Videos
(For UI changes)

## Related Issues
Fixes #123, Related to #456

## Breaking Changes
(If any)

## Deployment Notes
(If any special deployment steps needed)
```

### **👀 Code Reviewer**

#### **Review Timeline**
- **Regular PRs**: Review within 24 hours
- **Urgent PRs**: Review within 4 hours
- **Hotfixes**: Review within 1 hour

#### **Review Depth**
- Read and understand the entire change
- Check out the branch locally if needed
- Test the functionality manually
- Verify automated tests pass
- Consider edge cases and error scenarios

---

## 📋 Review Checklist

### **🔧 Functionality**
- [ ] Code does what it's supposed to do
- [ ] Edge cases are handled properly
- [ ] Error handling is appropriate
- [ ] No obvious bugs or logic errors
- [ ] Feature works as described in requirements

### **📚 Code Quality**
- [ ] Code is readable and well-structured
- [ ] Functions are appropriately sized (max 20-30 lines)
- [ ] Complex logic is commented
- [ ] No duplicate code (DRY principle)
- [ ] Proper separation of concerns

### **🎨 Style & Conventions**
- [ ] Follows naming conventions ([NAMING_CONVENTIONS.md](./NAMING_CONVENTIONS.md))
- [ ] Consistent with existing codebase style
- [ ] No linting errors
- [ ] TypeScript types are properly defined
- [ ] Comments are clear and necessary

### **🧪 Testing**
- [ ] New functionality has tests
- [ ] Tests are meaningful and comprehensive
- [ ] Test names are descriptive
- [ ] All tests pass
- [ ] Coverage meets minimum requirements (80%)

### **🔒 Security**
- [ ] No hardcoded secrets or sensitive data
- [ ] Input validation implemented
- [ ] Authentication/authorization checked
- [ ] SQL injection prevention (if applicable)
- [ ] XSS prevention (for UI components)

### **⚡ Performance**
- [ ] No obvious performance issues
- [ ] Database queries are optimized
- [ ] No unnecessary re-renders (React)
- [ ] Efficient algorithms used
- [ ] Bundle size impact considered

### **📱 Accessibility**
- [ ] Semantic HTML used
- [ ] ARIA attributes where needed
- [ ] Keyboard navigation works
- [ ] Color contrast is adequate
- [ ] Screen reader friendly

### **📖 Documentation**
- [ ] Code is self-documenting
- [ ] Complex algorithms are explained
- [ ] API changes are documented
- [ ] README updated if needed
- [ ] Type definitions are clear

---

## 🔍 What to Look For

### **🚨 Red Flags (Request Changes)**
```typescript
// ❌ Hardcoded secrets
const API_KEY = "sk-1234567890abcdef";

// ❌ No error handling
const user = await getUser(id);
user.profile.update(data);

// ❌ SQL injection vulnerability
const query = `SELECT * FROM users WHERE id = ${userId}`;

// ❌ Overly complex function
function processUserData(users, filters, options, config, metadata) {
  // 150 lines of complex logic...
}

// ❌ Magic numbers
if (score > 85) { // What does 85 represent?
  // logic
}
```

### **⚠️ Yellow Flags (Suggest Improvements)**
```typescript
// ⚠️ Could be more descriptive
const data = fetchUserInfo();

// ⚠️ Missing type annotations
function calculateTotal(items) {
  return items.reduce((sum, item) => sum + item.price, 0);
}

// ⚠️ Long parameter list
function createUser(name, email, phone, address, age, role, department) {
  // Consider using an options object
}

// ⚠️ Unclear comment
// TODO: Fix this later
```

### **✅ Green Flags (Approve)**
```typescript
// ✅ Clear, well-typed function
function calculateTotalPrice(items: CartItem[]): number {
  return items.reduce((total, item) => total + item.price * item.quantity, 0);
}

// ✅ Proper error handling
async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    const user = await userRepository.findById(userId);
    return user?.profile || null;
  } catch (error) {
    logger.error('Failed to fetch user profile', { userId, error });
    throw new UserProfileError('Unable to retrieve user profile');
  }
}

// ✅ Good use of constants
const MAX_RETRY_ATTEMPTS = 3;
const DEFAULT_TIMEOUT_MS = 5000;
```

---

## 💬 Communication Guidelines

### **Providing Feedback**

#### **✅ Constructive Feedback**
```
"Consider using a more descriptive variable name here. 
'userProfiles' would be clearer than 'data'."

"This function is doing quite a lot. Could we split it into 
smaller, more focused functions?"

"Great error handling! This will make debugging much easier."
```

#### **❌ Unconstructive Feedback**
```
"This is wrong."
"Bad code."
"Why did you do it this way?"
```

### **Feedback Categories**

#### **🔴 Must Fix (Blocking)**
- Security vulnerabilities
- Breaking changes
- Critical bugs
- Performance issues

#### **🟡 Should Fix (Non-blocking)**
- Code style issues
- Minor improvements
- Optimization opportunities
- Documentation gaps

#### **🟢 Nice to Have**
- Suggestions for future improvements
- Alternative approaches
- Learning opportunities

### **Example Feedback**
```markdown
🔴 **Must Fix**: This function is vulnerable to SQL injection. 
Please use parameterized queries.

🟡 **Should Fix**: Consider extracting this validation logic 
into a separate utility function for reusability.

🟢 **Suggestion**: In the future, we might want to add 
caching here for better performance.
```

---

## ⚡ Review Process

### **1. Initial Review**
```
Author creates PR → Automated checks run → Reviewers assigned
```

### **2. Review Stages**

#### **Quick Pass (5 minutes)**
- Check PR description
- Review automated test results
- Scan for obvious issues
- Determine if deeper review needed

#### **Detailed Review (15-30 minutes)**
- Line-by-line code review
- Check out branch locally
- Test functionality manually
- Verify edge cases

#### **Final Approval**
- All comments addressed
- All checks passing
- Feature tested and working
- Documentation updated

### **3. Review States**

#### **✅ Approved**
- Code meets all standards
- Ready to merge
- No blocking issues

#### **💬 Comment**
- Minor suggestions
- Non-blocking feedback
- Educational comments

#### **❌ Request Changes**
- Blocking issues found
- Must be fixed before merge
- Security/performance concerns

### **4. Re-review Process**
```
Changes requested → Author fixes issues → Author requests re-review → Reviewer checks fixes → Approve or request more changes
```

---

## 🚨 Security Review

### **Authentication & Authorization**
- [ ] User authentication is properly implemented
- [ ] Authorization checks are in place
- [ ] JWT tokens are handled securely
- [ ] Session management is secure
- [ ] Role-based access control works correctly

### **Data Protection**
- [ ] Sensitive data is not logged
- [ ] Personal information is encrypted
- [ ] Database queries use parameterized statements
- [ ] Input validation prevents injection attacks
- [ ] Output encoding prevents XSS

### **API Security**
- [ ] Rate limiting implemented
- [ ] CORS configured properly
- [ ] API keys are not exposed
- [ ] HTTPS enforced
- [ ] Request/response validation

### **Common Vulnerabilities**
```typescript
// ❌ SQL Injection
const query = `SELECT * FROM users WHERE email = '${email}'`;

// ✅ Parameterized Query
const query = 'SELECT * FROM users WHERE email = ?';

// ❌ XSS Vulnerability
innerHTML = `<div>${userInput}</div>`;

// ✅ Safe Rendering
textContent = userInput;

// ❌ Exposed Secrets
const apiKey = process.env.SECRET_API_KEY; // logged or exposed

// ✅ Secure Handling
const apiKey = process.env.SECRET_API_KEY;
// Never log or expose this value
```

---

## 📊 Performance Review

### **React Performance**
- [ ] Components are properly memoized
- [ ] Unnecessary re-renders are avoided
- [ ] Large lists use virtualization
- [ ] Images are optimized
- [ ] Bundle size impact is minimal

### **Database Performance**
- [ ] Queries are optimized
- [ ] Proper indexes are used
- [ ] N+1 queries are avoided
- [ ] Database connections are managed
- [ ] Caching is implemented where appropriate

### **General Performance**
```typescript
// ❌ Performance Issues
// Expensive operation in render
function Component() {
  const expensiveValue = heavyCalculation(props.data);
  return <div>{expensiveValue}</div>;
}

// ✅ Optimized
function Component() {
  const expensiveValue = useMemo(
    () => heavyCalculation(props.data),
    [props.data]
  );
  return <div>{expensiveValue}</div>;
}
```

---

## 🎨 UI/UX Review

### **User Interface**
- [ ] Design matches specifications
- [ ] Responsive design works on all devices
- [ ] Loading states are implemented
- [ ] Error states are handled
- [ ] Success feedback is provided

### **User Experience**
- [ ] Navigation is intuitive
- [ ] Forms provide clear validation
- [ ] Performance is acceptable
- [ ] Accessibility standards met
- [ ] No broken links or functionality

### **Visual Design**
- [ ] Consistent with design system
- [ ] Proper spacing and alignment
- [ ] Color contrast meets WCAG standards
- [ ] Typography is consistent
- [ ] Icons and images are appropriate

---

## 🛠️ Tools & Automation

### **Automated Checks**
- **ESLint**: Code style and potential errors
- **TypeScript**: Type checking
- **Jest**: Unit test coverage
- **Prettier**: Code formatting
- **SonarCloud**: Code quality and security
- **Bundle Analyzer**: Performance impact

### **Browser Testing**
- Chrome DevTools
- Firefox Developer Tools
- Accessibility tools (axe, WAVE)
- Performance profilers
- Network throttling

### **Review Tools**
- GitHub PR interface
- VS Code GitHub Pull Requests extension
- GitLens for code history
- GitHub CLI for quick operations

---

## 📈 Review Metrics

### **Team Metrics**
- Average review time
- Number of review rounds per PR
- Review coverage (% of PRs reviewed)
- Defect escape rate
- Review feedback quality

### **Individual Metrics**
- Review response time
- Quality of feedback provided
- Number of issues caught
- Learning and improvement over time

---

## 🎯 Best Practices

### **For Authors**
- Keep PRs small and focused (< 400 lines)
- Write clear commit messages
- Provide comprehensive PR descriptions
- Self-review before requesting review
- Respond to feedback promptly
- Test thoroughly before submitting

### **For Reviewers**
- Review promptly (within SLA)
- Provide constructive feedback
- Test functionality when needed
- Ask questions when unclear
- Approve when standards are met
- Follow up on requested changes

### **For the Team**
- Rotate reviewers for knowledge sharing
- Have domain experts review specialized code
- Encourage learning through reviews
- Document common issues and solutions
- Continuously improve the process

---

💡 **Remember**: Code reviews are not about finding fault, but about maintaining quality and helping each other grow as developers.

🔗 **Related Documentation**: 
- [Coding Standards](./CODING_STANDARDS.md) for detailed code quality guidelines
- [Git Workflow Conventions](./GIT_WORKFLOW_CONVENTIONS.md) for PR creation process
- [Security Guidelines](./SECURITY_GUIDELINES.md) for security-specific review criteria