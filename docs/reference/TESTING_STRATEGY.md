# Testing Strategy

> **Comprehensive testing approach for the Citizenly project**
> 
> This document outlines our testing philosophy, tools, and practices to ensure reliable, maintainable, and high-quality software delivery.

## 📖 Table of Contents

1. [🎯 Testing Philosophy](#-testing-philosophy)
2. [🏗️ Testing Pyramid](#️-testing-pyramid)
3. [🧪 Unit Testing](#-unit-testing)
4. [🔗 Integration Testing](#-integration-testing)
5. [🎭 End-to-End Testing](#-end-to-end-testing)
6. [👁️ Visual Testing](#️-visual-testing)
7. [♿ Accessibility Testing](#-accessibility-testing)
8. [⚡ Performance Testing](#-performance-testing)
9. [🔒 Security Testing](#-security-testing)
10. [📱 Manual Testing](#-manual-testing)
11. [🛠️ Tools & Setup](#️-tools--setup)
12. [📊 Coverage & Metrics](#-coverage--metrics)

---

## 🎯 Testing Philosophy

### **Core Principles**
- **Quality First**: Prevent bugs rather than fix them
- **Fast Feedback**: Catch issues early in development
- **Confidence**: Deploy with certainty
- **Maintainable**: Tests should be easy to maintain
- **Realistic**: Test real user scenarios

### **Testing Goals**
- Ensure functionality works as expected
- Prevent regressions when making changes
- Document how the system should behave
- Enable confident refactoring
- Support continuous deployment
- Maintain high code quality

### **Testing Strategy**
```
Write tests that:
✅ Are reliable and deterministic
✅ Run fast
✅ Test user-facing behavior
✅ Are easy to understand and maintain
✅ Provide clear failure messages
```

---

## 🏗️ Testing Pyramid

### **Testing Distribution**
```
        /\
       /  \
      / E2E \        ← Few, slow, expensive
     /______\
    /        \
   /Integration\     ← Some, medium speed
  /__________\
 /            \
/  Unit Tests  \     ← Many, fast, cheap
/______________\
```

### **Test Distribution Goals**
- **70% Unit Tests**: Fast, isolated, comprehensive
- **20% Integration Tests**: API and component integration
- **10% E2E Tests**: Critical user journeys

---

## 🧪 Unit Testing

### **What to Test**
- Individual functions and methods
- React component behavior
- Custom hooks
- Utility functions
- Business logic
- Error handling

### **Unit Testing Tools**
- **Jest**: Test runner and assertions
- **React Testing Library**: Component testing
- **MSW**: API mocking
- **@testing-library/jest-dom**: Additional matchers

### **Unit Test Examples**

#### **Testing Utility Functions**
```typescript
// utils/dateHelpers.ts
export function calculateAge(birthDate: string): number {
  const today = new Date();
  const birth = new Date(birthDate);
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
}

// __tests__/utils/dateHelpers.test.ts
describe('calculateAge', () => {
  it('should calculate age correctly for birthday this year', () => {
    const birthDate = '1990-01-01';
    const expectedAge = new Date().getFullYear() - 1990;
    expect(calculateAge(birthDate)).toBe(expectedAge);
  });

  it('should handle leap years correctly', () => {
    const birthDate = '2000-02-29';
    expect(calculateAge(birthDate)).toBeGreaterThan(0);
  });

  it('should return 0 for birth date today', () => {
    const today = new Date().toISOString().split('T')[0];
    expect(calculateAge(today)).toBe(0);
  });
});
```

#### **Testing React Components**
```typescript
// components/UserProfile.tsx
interface UserProfileProps {
  user: User;
  onEdit: () => void;
}

export function UserProfile({ user, onEdit }: UserProfileProps) {
  return (
    <div data-testid="user-profile">
      <h2>{user.firstName} {user.lastName}</h2>
      <p>Email: {user.email}</p>
      <p>Age: {calculateAge(user.birthDate)}</p>
      <button onClick={onEdit}>Edit Profile</button>
    </div>
  );
}

// __tests__/components/UserProfile.test.tsx
describe('UserProfile', () => {
  const mockUser: User = {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    birthDate: '1990-01-01'
  };

  it('should display user information correctly', () => {
    const onEdit = jest.fn();
    render(<UserProfile user={mockUser} onEdit={onEdit} />);
    
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('Email: john@example.com')).toBeInTheDocument();
    expect(screen.getByText(/Age:/)).toBeInTheDocument();
  });

  it('should call onEdit when edit button is clicked', () => {
    const onEdit = jest.fn();
    render(<UserProfile user={mockUser} onEdit={onEdit} />);
    
    fireEvent.click(screen.getByText('Edit Profile'));
    expect(onEdit).toHaveBeenCalledTimes(1);
  });
});
```

#### **Testing Custom Hooks**
```typescript
// hooks/useUserProfile.ts
export function useUserProfile(userId: string) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProfile() {
      try {
        setLoading(true);
        const data = await getUserProfile(userId);
        setProfile(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    
    fetchProfile();
  }, [userId]);

  return { profile, loading, error };
}

// __tests__/hooks/useUserProfile.test.ts
describe('useUserProfile', () => {
  it('should fetch user profile successfully', async () => {
    const mockProfile = { id: '1', name: 'John Doe' };
    (getUserProfile as jest.Mock).mockResolvedValue(mockProfile);

    const { result } = renderHook(() => useUserProfile('1'));
    
    expect(result.current.loading).toBe(true);
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.profile).toEqual(mockProfile);
      expect(result.current.error).toBeNull();
    });
  });

  it('should handle error when fetch fails', async () => {
    (getUserProfile as jest.Mock).mockRejectedValue(new Error('Failed to fetch'));

    const { result } = renderHook(() => useUserProfile('1'));
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.profile).toBeNull();
      expect(result.current.error).toBe('Failed to fetch');
    });
  });
});
```

### **Unit Test Best Practices**
- Test behavior, not implementation
- Use descriptive test names
- Arrange, Act, Assert pattern
- Test edge cases and error conditions
- Mock external dependencies
- Keep tests simple and focused

---

## 🔗 Integration Testing

### **What to Test**
- API endpoint functionality
- Database operations
- Component integration
- Service layer interactions
- Authentication flows
- Data validation

### **API Integration Tests**
```typescript
// __tests__/api/residents.integration.test.ts
describe('Residents API', () => {
  beforeEach(async () => {
    await setupTestDatabase();
  });

  afterEach(async () => {
    await cleanupTestDatabase();
  });

  it('should create a new resident', async () => {
    const residentData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      barangayCode: '123456'
    };

    const response = await request(app)
      .post('/api/residents')
      .send(residentData)
      .expect(201);

    expect(response.body).toMatchObject({
      id: expect.any(String),
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com'
    });

    // Verify in database
    const resident = await db.residents.findById(response.body.id);
    expect(resident).toBeTruthy();
  });

  it('should return validation error for invalid data', async () => {
    const invalidData = {
      firstName: '', // Required field
      email: 'invalid-email'
    };

    const response = await request(app)
      .post('/api/residents')
      .send(invalidData)
      .expect(400);

    expect(response.body.errors).toContain('First name is required');
    expect(response.body.errors).toContain('Invalid email format');
  });
});
```

### **Component Integration Tests**
```typescript
// __tests__/components/ResidentForm.integration.test.tsx
describe('ResidentForm Integration', () => {
  it('should submit form and create resident', async () => {
    const mockOnSubmit = jest.fn();
    
    render(
      <ResidentForm onSubmit={mockOnSubmit} />
    );

    // Fill out form
    fireEvent.change(screen.getByLabelText('First Name'), {
      target: { value: 'John' }
    });
    fireEvent.change(screen.getByLabelText('Last Name'), {
      target: { value: 'Doe' }
    });
    fireEvent.change(screen.getByLabelText('Email'), {
      target: { value: 'john@example.com' }
    });

    // Submit form
    fireEvent.click(screen.getByText('Submit'));

    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith({
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com'
      });
    });
  });
});
```

---

## 🎭 End-to-End Testing

### **What to Test**
- Critical user journeys
- Authentication flows
- Data persistence
- Cross-browser compatibility
- Mobile responsiveness
- Payment processes (if applicable)

### **E2E Testing Tools**
- **Playwright**: Modern E2E testing framework
- **Cypress**: Alternative E2E framework
- **GitHub Actions**: CI/CD integration

### **E2E Test Examples**

#### **User Registration Flow**
```typescript
// e2e/user-registration.spec.ts
test.describe('User Registration', () => {
  test('should allow new user to register and login', async ({ page }) => {
    const uniqueEmail = `user${Date.now()}@example.com`;
    
    // Go to registration page
    await page.goto('/signup');
    
    // Fill registration form
    await page.fill('[data-testid="firstName"]', 'John');
    await page.fill('[data-testid="lastName"]', 'Doe');
    await page.fill('[data-testid="email"]', uniqueEmail);
    await page.fill('[data-testid="password"]', 'SecurePassword123!');
    await page.selectOption('[data-testid="barangay"]', 'Barangay 1');
    
    // Submit form
    await page.click('[data-testid="submit-registration"]');
    
    // Should redirect to confirmation page
    await expect(page).toHaveURL('/signup/confirmation');
    await expect(page.locator('text=Check your email')).toBeVisible();
    
    // Simulate email confirmation (in test environment)
    await confirmUserEmail(uniqueEmail);
    
    // Login with new account
    await page.goto('/login');
    await page.fill('[data-testid="email"]', uniqueEmail);
    await page.fill('[data-testid="password"]', 'SecurePassword123!');
    await page.click('[data-testid="login-submit"]');
    
    // Should be logged in and redirected to dashboard
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('text=Welcome, John')).toBeVisible();
  });
});
```

#### **Resident Management Flow**
```typescript
// e2e/resident-management.spec.ts
test.describe('Resident Management', () => {
  test.beforeEach(async ({ page }) => {
    await loginAsBarangayAdmin(page);
  });

  test('should create, view, and edit resident', async ({ page }) => {
    // Navigate to residents page
    await page.goto('/residents');
    
    // Create new resident
    await page.click('[data-testid="create-resident"]');
    
    // Fill resident form
    await page.fill('[data-testid="firstName"]', 'Maria');
    await page.fill('[data-testid="lastName"]', 'Santos');
    await page.fill('[data-testid="birthDate"]', '1985-03-15');
    await page.selectOption('[data-testid="sex"]', 'Female');
    await page.selectOption('[data-testid="civilStatus"]', 'Married');
    
    // Submit form
    await page.click('[data-testid="submit-resident"]');
    
    // Should appear in residents list
    await expect(page.locator('text=Maria Santos')).toBeVisible();
    
    // View resident details
    await page.click('text=Maria Santos');
    await expect(page).toHaveURL(/\/residents\/\d+/);
    await expect(page.locator('text=Born: March 15, 1985')).toBeVisible();
    
    // Edit resident
    await page.click('[data-testid="edit-resident"]');
    await page.fill('[data-testid="firstName"]', 'Maria Elena');
    await page.click('[data-testid="save-resident"]');
    
    // Should show updated name
    await expect(page.locator('text=Maria Elena Santos')).toBeVisible();
  });
});
```

### **E2E Test Organization**
```
e2e/
├── fixtures/
│   ├── users.json
│   └── test-data.json
├── page-objects/
│   ├── LoginPage.ts
│   ├── DashboardPage.ts
│   └── ResidentsPage.ts
├── utils/
│   ├── auth-helpers.ts
│   └── test-setup.ts
└── specs/
    ├── authentication.spec.ts
    ├── resident-management.spec.ts
    └── dashboard.spec.ts
```

---

## 👁️ Visual Testing

### **Visual Regression Testing**
```typescript
// visual-tests/component-snapshots.spec.ts
test.describe('Component Visual Tests', () => {
  test('ResidentCard component', async ({ page }) => {
    await page.goto('/storybook/?path=/story/components-residentcard--default');
    await expect(page.locator('[data-testid="resident-card"]')).toHaveScreenshot();
  });

  test('Dashboard layout', async ({ page }) => {
    await loginAsUser(page);
    await page.goto('/dashboard');
    await expect(page).toHaveScreenshot('dashboard-full-page.png');
  });
});
```

### **Cross-Browser Testing**
```typescript
// playwright.config.ts
export default defineConfig({
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'mobile-chrome', use: { ...devices['Pixel 5'] } },
    { name: 'mobile-safari', use: { ...devices['iPhone 12'] } },
  ],
});
```

---

## ♿ Accessibility Testing

### **Automated Accessibility Tests**
```typescript
// __tests__/accessibility/components.test.ts
import { axe, toHaveNoViolations } from 'jest-axe';

expect.extend(toHaveNoViolations);

describe('Accessibility Tests', () => {
  it('should not have accessibility violations on ResidentForm', async () => {
    const { container } = render(<ResidentForm />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it('should not have accessibility violations on Dashboard', async () => {
    const { container } = render(<Dashboard />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
```

### **Manual Accessibility Testing**
- [ ] Keyboard navigation works completely
- [ ] Screen reader compatibility
- [ ] Color contrast meets WCAG standards
- [ ] Focus indicators are visible
- [ ] Error messages are announced
- [ ] Form labels are properly associated

---

## ⚡ Performance Testing

### **Load Testing**
```typescript
// performance/load-test.js
import { check } from 'k6';
import http from 'k6/http';

export let options = {
  stages: [
    { duration: '2m', target: 100 }, // Ramp up
    { duration: '5m', target: 100 }, // Stay at 100 users
    { duration: '2m', target: 0 },   // Ramp down
  ],
};

export default function() {
  const response = http.get('https://api.citizenly.app/residents');
  
  check(response, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
}
```

### **Frontend Performance Testing**
```typescript
// __tests__/performance/component-performance.test.ts
describe('Component Performance', () => {
  it('should render ResidentList within performance budget', async () => {
    const residents = generateMockResidents(1000);
    
    const { rerender } = render(<ResidentList residents={residents} />);
    
    // Measure render time
    const start = performance.now();
    rerender(<ResidentList residents={[...residents, newResident]} />);
    const end = performance.now();
    
    expect(end - start).toBeLessThan(100); // Should update in < 100ms
  });
});
```

---

## 🔒 Security Testing

### **Authentication Security Tests**
```typescript
// __tests__/security/auth.test.ts
describe('Authentication Security', () => {
  it('should reject requests without valid JWT', async () => {
    const response = await request(app)
      .get('/api/residents')
      .expect(401);
    
    expect(response.body.error).toBe('Authentication required');
  });

  it('should reject expired JWT tokens', async () => {
    const expiredToken = generateExpiredJWT();
    
    const response = await request(app)
      .get('/api/residents')
      .set('Authorization', `Bearer ${expiredToken}`)
      .expect(401);
    
    expect(response.body.error).toBe('Token expired');
  });

  it('should prevent access to other barangay data', async () => {
    const userToken = generateJWT({ barangayCode: '123456' });
    
    const response = await request(app)
      .get('/api/residents')
      .query({ barangayCode: '654321' }) // Different barangay
      .set('Authorization', `Bearer ${userToken}`)
      .expect(403);
    
    expect(response.body.error).toBe('Access denied');
  });
});
```

### **Input Validation Tests**
```typescript
// __tests__/security/validation.test.ts
describe('Input Validation', () => {
  it('should sanitize HTML input', async () => {
    const maliciousInput = '<script>alert("xss")</script>';
    
    const response = await request(app)
      .post('/api/residents')
      .send({ firstName: maliciousInput })
      .expect(400);
    
    expect(response.body.errors).toContain('Invalid characters in name');
  });

  it('should prevent SQL injection', async () => {
    const sqlInjection = "'; DROP TABLE residents; --";
    
    const response = await request(app)
      .get('/api/residents')
      .query({ search: sqlInjection })
      .expect(400);
    
    expect(response.body.error).toBe('Invalid search query');
  });
});
```

---

## 📱 Manual Testing

### **Manual Testing Checklist**

#### **Functionality Testing**
- [ ] All features work as specified
- [ ] Error handling works correctly
- [ ] Data validation prevents invalid input
- [ ] Navigation flows work properly
- [ ] Search and filtering work correctly

#### **Usability Testing**
- [ ] Interface is intuitive
- [ ] Error messages are helpful
- [ ] Loading states provide feedback
- [ ] Success confirmations are clear
- [ ] Help text is available where needed

#### **Compatibility Testing**
- [ ] Works on Chrome, Firefox, Safari
- [ ] Mobile responsiveness
- [ ] Tablet compatibility
- [ ] Different screen resolutions
- [ ] Network conditions (slow/fast)

#### **Security Testing**
- [ ] Cannot access unauthorized data
- [ ] Sessions expire appropriately
- [ ] Sensitive data is not exposed
- [ ] File uploads are secure
- [ ] URL manipulation is prevented

---

## 🛠️ Tools & Setup

### **Testing Framework Setup**
```json
// package.json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:integration": "jest --config jest.integration.config.js",
    "test:e2e": "playwright test",
    "test:visual": "playwright test --config playwright.visual.config.ts",
    "test:a11y": "jest --config jest.a11y.config.js",
    "test:perf": "k6 run performance/load-test.js"
  },
  "devDependencies": {
    "@testing-library/react": "^13.4.0",
    "@testing-library/jest-dom": "^5.16.5",
    "@testing-library/user-event": "^14.4.3",
    "@playwright/test": "^1.40.0",
    "jest": "^29.7.0",
    "jest-axe": "^8.0.0",
    "msw": "^1.3.0",
    "supertest": "^6.3.0"
  }
}
```

### **Jest Configuration**
```javascript
// jest.config.js
module.exports = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
  ],
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

### **Playwright Configuration**
```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

---

## 📊 Coverage & Metrics

### **Coverage Targets**
- **Unit Tests**: 80% minimum coverage
- **Integration Tests**: All API endpoints covered
- **E2E Tests**: Critical user journeys covered
- **Accessibility Tests**: All components tested

### **Quality Metrics**
- Test execution time: < 5 minutes for unit tests
- E2E test execution time: < 30 minutes
- Test flakiness: < 1% false failures
- Bug escape rate: < 5% bugs reach production

### **Reporting**
```bash
# Generate coverage report
npm run test:coverage

# Generate E2E test report
npm run test:e2e -- --reporter=html

# Generate accessibility report
npm run test:a11y -- --reporter=html
```

---

## 🎯 Testing Best Practices

### **General Guidelines**
- Write tests before or alongside code (TDD/BDD)
- Keep tests simple and focused
- Use descriptive test names
- Test behavior, not implementation
- Mock external dependencies
- Clean up after tests

### **Test Organization**
```
__tests__/
├── unit/
│   ├── components/
│   ├── hooks/
│   ├── utils/
│   └── services/
├── integration/
│   ├── api/
│   └── components/
├── e2e/
│   ├── auth/
│   ├── residents/
│   └── dashboard/
└── fixtures/
    ├── users.json
    └── residents.json
```

### **Continuous Integration**
```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:coverage
      - run: npm run test:integration
      - run: npm run test:e2e
      - run: npm run test:a11y
```

---

💡 **Remember**: Good tests are an investment in your codebase. They prevent bugs, enable refactoring, and provide documentation of how your system should behave.

🔗 **Related Documentation**: 
- [Code Review Guidelines](./CODE_REVIEW_GUIDELINES.md) for testing review criteria
- [Development Workflow](./DEVELOPMENT_WORKFLOW.md) for testing in the development process
- [Performance Guidelines](./PERFORMANCE_GUIDELINES.md) for performance testing specifics