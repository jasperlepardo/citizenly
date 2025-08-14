#!/usr/bin/env node

/**
 * Create Test Infrastructure Script
 * Sets up comprehensive testing infrastructure for components
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Component test template
 */
function createComponentTestTemplate(componentName, componentPath) {
  return `import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';

import ${componentName} from './${componentName}';

// Mock data and utilities
const mockProps = {
  // Add typical props for ${componentName}
};

// Test wrapper with providers if needed
const renderWithProviders = (component: React.ReactElement) => {
  return render(component);
};

describe('${componentName} Component', () => {
  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
  });

  describe('Rendering', () => {
    it('should render without crashing', () => {
      renderWithProviders(<${componentName} {...mockProps} />);
      expect(screen.getByRole('main')).toBeInTheDocument();
    });

    it('should render with default props', () => {
      renderWithProviders(<${componentName} {...mockProps} />);
      // Add specific assertions for default rendering
    });

    it('should apply custom className when provided', () => {
      const customClass = 'custom-test-class';
      renderWithProviders(<${componentName} {...mockProps} className={customClass} />);
      // Add assertion to check custom class is applied
    });
  });

  describe('User Interactions', () => {
    it('should handle user interactions correctly', async () => {
      const user = userEvent.setup();
      renderWithProviders(<${componentName} {...mockProps} />);
      
      // Add user interaction tests
      // Example: await user.click(screen.getByRole('button'));
    });

    it('should call callbacks when appropriate', async () => {
      const mockCallback = jest.fn();
      renderWithProviders(<${componentName} {...mockProps} onCallback={mockCallback} />);
      
      // Add callback testing
      // Example: fireEvent.click(screen.getByRole('button'));
      // expect(mockCallback).toHaveBeenCalledWith(expectedArgs);
    });
  });

  describe('Props Validation', () => {
    it('should handle required props correctly', () => {
      // Test required props behavior
      renderWithProviders(<${componentName} {...mockProps} />);
      // Add assertions for required props
    });

    it('should handle optional props correctly', () => {
      // Test optional props behavior
      const optionalProps = { ...mockProps, optionalProp: 'test-value' };
      renderWithProviders(<${componentName} {...optionalProps} />);
      // Add assertions for optional props
    });
  });

  describe('Error Handling', () => {
    it('should handle error states gracefully', () => {
      // Test error scenarios
      const errorProps = { ...mockProps, hasError: true };
      renderWithProviders(<${componentName} {...errorProps} />);
      // Add assertions for error handling
    });
  });

  describe('Accessibility', () => {
    it('should be accessible', () => {
      renderWithProviders(<${componentName} {...mockProps} />);
      
      // Basic accessibility checks
      // Add specific accessibility assertions for this component
    });

    it('should support keyboard navigation', async () => {
      const user = userEvent.setup();
      renderWithProviders(<${componentName} {...mockProps} />);
      
      // Test keyboard navigation
      // Example: await user.tab();
    });
  });

  describe('Performance', () => {
    it('should not re-render unnecessarily', () => {
      // Add performance tests if component has optimization concerns
      const { rerender } = renderWithProviders(<${componentName} {...mockProps} />);
      rerender(<${componentName} {...mockProps} />);
      // Add performance assertions
    });
  });
});
`;
}

/**
 * API route test template
 */
function createAPITestTemplate(routeName, method) {
  return `import { createMocks } from 'node-mocks-http';
import { NextRequest, NextResponse } from 'next/server';

import { ${method} } from '../route';

// Mock external dependencies
jest.mock('@/lib/database', () => ({
  // Mock database functions
}));

jest.mock('@/lib/auth', () => ({
  // Mock auth functions
}));

describe('/api/${routeName} - ${method}', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Success Cases', () => {
    it('should handle valid requests successfully', async () => {
      const { req } = createMocks({
        method: '${method}',
        headers: {
          'content-type': 'application/json',
        },
        body: {
          // Add valid request body
        },
      });

      const request = new NextRequest(req.url || 'http://localhost', {
        method: '${method}',
        headers: req.headers,
        body: JSON.stringify(req.body),
      });

      const response = await ${method}(request);
      
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data).toHaveProperty('data');
    });
  });

  describe('Validation', () => {
    it('should validate required fields', async () => {
      const { req } = createMocks({
        method: '${method}',
        headers: {
          'content-type': 'application/json',
        },
        body: {
          // Add invalid request body
        },
      });

      const request = new NextRequest(req.url || 'http://localhost', {
        method: '${method}',
        headers: req.headers,
        body: JSON.stringify(req.body),
      });

      const response = await ${method}(request);
      
      expect(response.status).toBe(400);
      
      const data = await response.json();
      expect(data).toHaveProperty('error');
    });
  });

  describe('Authentication', () => {
    it('should require authentication for protected routes', async () => {
      const { req } = createMocks({
        method: '${method}',
        headers: {
          'content-type': 'application/json',
          // No Authorization header
        },
      });

      const request = new NextRequest(req.url || 'http://localhost', {
        method: '${method}',
        headers: req.headers,
      });

      const response = await ${method}(request);
      
      expect(response.status).toBe(401);
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors gracefully', async () => {
      // Mock database error
      const { req } = createMocks({
        method: '${method}',
        headers: {
          'content-type': 'application/json',
          'authorization': 'Bearer valid-token',
        },
        body: {
          // Valid body
        },
      });

      const request = new NextRequest(req.url || 'http://localhost', {
        method: '${method}',
        headers: req.headers,
        body: JSON.stringify(req.body),
      });

      const response = await ${method}(request);
      
      expect(response.status).toBe(500);
    });
  });
});
`;
}

/**
 * Hook test template
 */
function createHookTestTemplate(hookName) {
  return `import { renderHook, act } from '@testing-library/react';
import { ReactNode } from 'react';

import ${hookName} from './${hookName}';

// Mock providers wrapper if needed
const wrapper = ({ children }: { children: ReactNode }) => {
  return <>{children}</>;
};

describe('${hookName}', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should initialize with default values', () => {
      const { result } = renderHook(() => ${hookName}(), { wrapper });
      
      // Add assertions for initial state
      expect(result.current).toBeDefined();
    });
  });

  describe('State Updates', () => {
    it('should update state correctly', () => {
      const { result } = renderHook(() => ${hookName}(), { wrapper });
      
      act(() => {
        // Trigger state updates
      });
      
      // Add assertions for state changes
    });
  });

  describe('Side Effects', () => {
    it('should handle side effects properly', async () => {
      const { result, waitForNextUpdate } = renderHook(() => ${hookName}(), { wrapper });
      
      // Test side effects like API calls
      await waitForNextUpdate();
      
      // Add assertions for side effects
    });
  });

  describe('Error Handling', () => {
    it('should handle errors gracefully', () => {
      // Test error scenarios
      const { result } = renderHook(() => ${hookName}(), { wrapper });
      
      // Add error handling assertions
    });
  });
});
`;
}

/**
 * Create test coverage monitoring script
 */
function createCoverageMonitor() {
  return `#!/usr/bin/env node

/**
 * Test Coverage Monitor
 * Tracks and enforces test coverage standards
 */

const fs = require('fs');
const { execSync } = require('child_process');

/**
 * Check current test coverage
 */
function checkCoverage() {
  try {
    console.log('🧪 Running test coverage analysis...');
    
    const coverage = execSync('npm run test:coverage -- --silent', { encoding: 'utf8' });
    
    // Parse coverage output
    const coverageLines = coverage.split('\\n');
    const summaryIndex = coverageLines.findIndex(line => line.includes('All files'));
    
    if (summaryIndex === -1) {
      console.warn('⚠️  Could not parse coverage summary');
      return null;
    }
    
    const summaryLine = coverageLines[summaryIndex];
    const coverageMatch = summaryLine.match(/([0-9.]+)%/g);
    
    if (!coverageMatch || coverageMatch.length < 4) {
      console.warn('⚠️  Could not extract coverage percentages');
      return null;
    }
    
    return {
      statements: parseFloat(coverageMatch[0]),
      branches: parseFloat(coverageMatch[1]),
      functions: parseFloat(coverageMatch[2]),
      lines: parseFloat(coverageMatch[3])
    };
    
  } catch (error) {
    console.error('❌ Error running coverage analysis:', error.message);
    return null;
  }
}

/**
 * Generate coverage report
 */
function generateCoverageReport() {
  const coverage = checkCoverage();
  
  if (!coverage) {
    return;
  }
  
  const report = {
    timestamp: new Date().toISOString(),
    coverage,
    status: {
      statements: coverage.statements >= 80 ? 'pass' : 'fail',
      branches: coverage.branches >= 80 ? 'pass' : 'fail', 
      functions: coverage.functions >= 80 ? 'pass' : 'fail',
      lines: coverage.lines >= 80 ? 'pass' : 'fail'
    },
    recommendations: []
  };
  
  // Add recommendations based on coverage
  if (coverage.statements < 80) {
    report.recommendations.push('Increase statement coverage - add more unit tests');
  }
  
  if (coverage.branches < 80) {
    report.recommendations.push('Increase branch coverage - test conditional logic paths');
  }
  
  if (coverage.functions < 80) {
    report.recommendations.push('Increase function coverage - test all exported functions');
  }
  
  if (coverage.lines < 80) {
    report.recommendations.push('Increase line coverage - ensure all code paths are tested');
  }
  
  fs.writeFileSync('test-coverage-report.json', JSON.stringify(report, null, 2));
  
  console.log('📊 Test Coverage Report:');
  console.log(\`   Statements: \${coverage.statements}% (\${report.status.statements})\`);
  console.log(\`   Branches: \${coverage.branches}% (\${report.status.branches})\`);
  console.log(\`   Functions: \${coverage.functions}% (\${report.status.functions})\`);
  console.log(\`   Lines: \${coverage.lines}% (\${report.status.lines})\`);
  
  if (report.recommendations.length > 0) {
    console.log('\\n💡 Recommendations:');
    report.recommendations.forEach(rec => console.log(\`   - \${rec}\`));
  }
}

if (require.main === module) {
  generateCoverageReport();
}

module.exports = { checkCoverage, generateCoverageReport };
`;
}

/**
 * Main execution function
 */
function main() {
  console.log('🧪 Creating Test Infrastructure');
  console.log('🎯 Setting up comprehensive testing framework...\n');

  const startTime = Date.now();
  let tasksCompleted = 0;

  try {
    // Create test utilities
    console.log('📋 Task 1: Creating test utilities...');
    
    // Create coverage monitor
    fs.writeFileSync('scripts/test-coverage-monitor.js', createCoverageMonitor());
    console.log('   ✅ Created test coverage monitor');
    
    // Create test templates directory
    const templatesDir = 'scripts/test-templates';
    if (!fs.existsSync(templatesDir)) {
      fs.mkdirSync(templatesDir, { recursive: true });
    }
    
    // Create component test template
    fs.writeFileSync(
      path.join(templatesDir, 'component.test.template.tsx'),
      createComponentTestTemplate('ComponentName', 'component-path')
    );
    console.log('   ✅ Created component test template');
    
    // Create API test template
    fs.writeFileSync(
      path.join(templatesDir, 'api.test.template.ts'),
      createAPITestTemplate('endpoint', 'GET')
    );
    console.log('   ✅ Created API test template');
    
    // Create hook test template
    fs.writeFileSync(
      path.join(templatesDir, 'hook.test.template.ts'),
      createHookTestTemplate('useHookName')
    );
    console.log('   ✅ Created hook test template');
    
    tasksCompleted++;

    // Update package.json with testing scripts
    console.log('\\n📋 Task 2: Updating testing scripts...');
    
    const packagePath = 'package.json';
    const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));
    
    const testingScripts = {
      "test:unit": "jest --testPathPattern='.*\\\\.test\\\\.(ts|tsx)$'",
      "test:integration": "jest --testPathPattern='.*\\\\.integration\\\\.test\\\\.(ts|tsx)$'",
      "test:e2e": "jest --testPathPattern='.*\\\\.e2e\\\\.test\\\\.(ts|tsx)$'",
      "test:coverage:unit": "jest --coverage --testPathPattern='.*\\\\.test\\\\.(ts|tsx)$'",
      "test:coverage:monitor": "node scripts/test-coverage-monitor.js",
      "test:generate": "node scripts/generate-tests.js",
      "test:watch:coverage": "jest --coverage --watch"
    };

    let scriptsAdded = 0;
    for (const [script, command] of Object.entries(testingScripts)) {
      if (!packageJson.scripts[script]) {
        packageJson.scripts[script] = command;
        scriptsAdded++;
      }
    }

    if (scriptsAdded > 0) {
      fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
      console.log(\`   ✅ Added \${scriptsAdded} testing scripts to package.json\`);
    }
    
    tasksCompleted++;

    // Create test generation script
    console.log('\\n📋 Task 3: Creating test generation script...');
    
    const testGeneratorScript = \`#!/usr/bin/env node

/**
 * Test Generator Script
 * Automatically generates test files for components without tests
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function generateTestsForComponent(componentPath) {
  const componentName = path.basename(componentPath, path.extname(componentPath));
  const componentDir = path.dirname(componentPath);
  const testPath = path.join(componentDir, '__tests__', \\\`\\\${componentName}.test.tsx\\\`);
  
  // Check if test already exists
  if (fs.existsSync(testPath)) {
    console.log(\\\`   ⏭️  Test already exists for \\\${componentName}\\\`);
    return false;
  }
  
  // Create __tests__ directory if it doesn't exist
  const testsDir = path.dirname(testPath);
  if (!fs.existsSync(testsDir)) {
    fs.mkdirSync(testsDir, { recursive: true });
  }
  
  // Read component test template
  const templatePath = 'scripts/test-templates/component.test.template.tsx';
  if (!fs.existsSync(templatePath)) {
    console.warn(\\\`   ⚠️  Component test template not found at \\\${templatePath}\\\`);
    return false;
  }
  
  let template = fs.readFileSync(templatePath, 'utf8');
  
  // Replace placeholders
  template = template.replace(/ComponentName/g, componentName);
  template = template.replace(/component-path/g, componentPath);
  
  fs.writeFileSync(testPath, template);
  console.log(\\\`   ✅ Generated test for \\\${componentName}\\\`);
  return true;
}

function main() {
  console.log('🧪 Generating Missing Tests');
  console.log('🎯 Creating test files for components without tests...\\\\n');
  
  try {
    // Find all components without tests
    const components = execSync('find src/components -name "*.tsx" -not -path "*/stories/*" -not -path "*/__tests__/*"', { encoding: 'utf8' })
      .split('\\\\n')
      .filter(f => f.length > 0)
      .slice(0, 10); // Limit for initial generation
    
    console.log(\\\`📁 Found \\\${components.length} components to check...\\\\n\\\`);
    
    let generated = 0;
    components.forEach(component => {
      if (generateTestsForComponent(component)) {
        generated++;
      }
    });
    
    console.log(\\\`\\\\n🎉 Test Generation Complete!\\\`);
    console.log(\\\`   📝 Generated \\\${generated} new test files\\\`);
    
    if (generated > 0) {
      console.log('\\\\n💡 Next steps:');
      console.log('   1. Review and customize generated tests');
      console.log('   2. Add specific test cases for component functionality');
      console.log('   3. Run npm run test:coverage to check coverage');
    }
    
  } catch (error) {
    console.error('❌ Error generating tests:', error.message);
  }
}

if (require.main === module) {
  main();
}
\`;
    
    fs.writeFileSync('scripts/generate-tests.js', testGeneratorScript);
    console.log('   ✅ Created test generation script');
    tasksCompleted++;

  } catch (error) {
    console.error(\`❌ Error during setup: \${error.message}\`);
    process.exit(1);
  }

  const duration = ((Date.now() - startTime) / 1000).toFixed(1);

  console.log(\`\\n🎉 Test Infrastructure Setup Complete!\`);
  console.log(\`   🧪 Completed \${tasksCompleted}/3 tasks\`);
  console.log(\`   ⏱️  Completed in \${duration} seconds\`);

  console.log('\\n📋 What was created:');
  console.log('   ✅ Test coverage monitoring system');
  console.log('   ✅ Component, API, and hook test templates');
  console.log('   ✅ Automated test generation script');
  console.log('   ✅ Enhanced testing npm scripts');

  console.log('\\n💡 Next Steps:');
  console.log('   1. Run npm run test:generate to create missing tests');
  console.log('   2. Run npm run test:coverage:monitor to check current status');
  console.log('   3. Customize generated tests for specific components');
  console.log('   4. Aim for 80% test coverage target');
}

if (require.main === module) {
  main();
}

module.exports = {
  createComponentTestTemplate,
  createAPITestTemplate,
  createHookTestTemplate,
  createCoverageMonitor
};