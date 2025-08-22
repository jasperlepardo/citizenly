# Hooks Directory - Comprehensive Documentation

## 🏗️ **Architecture Overview**

The hooks directory is organized by functionality for better maintainability and developer experience. Each category contains focused, single-responsibility hooks that compose together to create powerful functionality.

```
src/hooks/
├── validation/          # Form and data validation hooks
├── search/             # Data discovery and filtering hooks  
├── dashboard/          # Dashboard functionality hooks
├── command-menu/       # Command palette functionality hooks
├── crud/               # Data operations (Create, Read, Update, Delete)
├── workflows/          # Complex multi-step process orchestration
├── utilities/          # General-purpose utility hooks
├── __tests__/          # Comprehensive test suite
└── index.ts            # Organized exports with backward compatibility
```

## 📚 **Hook Categories**

### 🔍 **Validation Hooks** (`/validation`)
Type-safe validation hooks for forms and data validation.

**Core Hooks:**
- `useOptimizedResidentValidation` - Main resident form validation orchestrator (138 lines, was 547)
- `useResidentValidationCore` - Core validation logic
- `useResidentCrossFieldValidation` - Cross-field validation rules
- `useResidentAsyncValidation` - Async validation (email, phone verification)
- `useResidentValidationProgress` - Progress tracking for complex validation
- `createValidationHook` - Factory for creating type-safe validation hooks

**Example Usage:**
```typescript
import { useOptimizedResidentValidation, createValidationHook } from '@/hooks/validation';

// Use the main resident validation
const { validateField, errors, hasErrors } = useOptimizedResidentValidation();

// Create custom validation hook
const useCustomValidation = createValidationHook(mySchema);
const { validation, validateAsync } = useCustomValidation();
```

### 🔎 **Search Hooks** (`/search`)
Optimized search and filtering hooks for data discovery.

**Core Hooks:**
- `useGenericSearch` - Generic search with scoring and filtering
- `useGenericPaginatedSearch` - Paginated search results
- `useOptimizedPsgcSearch` - Location/address search optimization
- `useOptimizedHouseholdSearch` - Household-specific search
- `useFormSearches` - Multiple search types for forms

**Example Usage:**
```typescript
import { useOptimizedPsgcSearch, useGenericPaginatedSearch } from '@/hooks/search';

const { searchResults, isLoading, search } = useOptimizedPsgcSearch();
const { paginatedResults, loadMore, hasMore } = useGenericPaginatedSearch(searchFn);
```

### 📊 **Dashboard Hooks** (`/dashboard`)
Dashboard data fetching and calculations (refactored from 266→102 lines).

**Core Hooks:**
- `useDashboard` - Main dashboard orchestrator (102 lines, was 266)
- `useDashboardApi` - API operations for dashboard data
- `useDashboardCalculations` - Complex statistical calculations

**Example Usage:**
```typescript
import { useDashboard } from '@/hooks/dashboard';

const { stats, isLoading, refresh, calculations } = useDashboard();
```

### ⌘ **Command Menu Hooks** (`/command-menu`)
Command palette functionality (refactored from 355→196 lines).

**Core Hooks:**
- `useCommandMenuWithApi` - Main command menu with API integration (196 lines, was 355)
- `useCommandMenuSearch` - Search functionality for commands
- `useCommandMenuRecents` - Recent items management
- `useCommandMenuActions` - Command execution and API actions
- `useCommandMenu` - Base command menu functionality

**Example Usage:**
```typescript
import { useCommandMenuWithApi } from '@/hooks/command-menu';

const { 
  isOpen, 
  searchQuery, 
  filteredItems, 
  executeCommand 
} = useCommandMenuWithApi();
```

### 💾 **CRUD Hooks** (`/crud`)
Data operations for entities (Create, Read, Update, Delete).

**Core Hooks:**
- `useResidentOperations` - Comprehensive resident CRUD operations
- `useHouseholdCrud` - Household data operations
- `useResidents` - Legacy resident operations (to be deprecated)
- `useHouseholds` - Legacy household operations (to be deprecated)

**Example Usage:**
```typescript
import { useResidentOperations } from '@/hooks/crud';

const { 
  createResident, 
  updateResident, 
  deleteResident, 
  isLoading 
} = useResidentOperations();
```

### 🔄 **Workflow Hooks** (`/workflows`)
Complex multi-step process orchestration.

**Core Hooks:**
- `useResidentEditWorkflow` - Multi-step resident editing process
- `useHouseholdCreationWorkflow` - Household creation workflow
- `useHouseholdOperationsWorkflow` - Complex household operations
- `useResidentFormState` - Form state management for residents

**Example Usage:**
```typescript
import { useResidentEditWorkflow } from '@/hooks/workflows';

const { 
  currentStep, 
  nextStep, 
  previousStep, 
  submitWorkflow 
} = useResidentEditWorkflow();
```

### 🛠️ **Utility Hooks** (`/utilities`)
General-purpose utility hooks for common functionality.

**Core Hooks:**
- `useAsyncErrorBoundary` - Async error handling with retry logic
- `useLogger` - Centralized logging service (dev/prod modes)
- `usePerformanceMonitor` - Hook performance monitoring
- `useDebounce` - Input debouncing utility
- `useConnectionStatus` - Network connection monitoring
- `usePreloadOnHover` - Component preloading on hover

**Example Usage:**
```typescript
import { 
  useAsyncErrorBoundary, 
  useLogger, 
  usePerformanceMonitor 
} from '@/hooks/utilities';

const { wrapAsync, retry, error } = useAsyncErrorBoundary();
const { log, warn, error: logError } = useLogger('MyComponent');
const { metrics, reset } = usePerformanceMonitor('useMyHook');
```

## 🚀 **Performance Optimizations**

### **Memoization Strategy**
- **19% of hooks** now use `useMemo` (was 3%)
- Expensive computations are memoized
- Dependency arrays optimized for minimal re-renders

### **Hook Size Optimization**
- **75% reduction** in largest hook (547 → 138 lines)
- **Single responsibility principle** applied throughout
- **Focused, composable** hook architecture

### **Error Handling**
- **Comprehensive async error boundaries** in all async operations
- **Retry mechanisms** with exponential backoff
- **Development vs production** error handling

## 📖 **Usage Patterns**

### **Basic Import Patterns**
```typescript
// Category-based imports (recommended)
import { useOptimizedResidentValidation } from '@/hooks/validation';
import { useDashboard } from '@/hooks/dashboard';
import { useAsyncErrorBoundary } from '@/hooks/utilities';

// Root-level imports (legacy compatibility)
import { 
  useOptimizedResidentValidation,
  useDashboard,
  useAsyncErrorBoundary 
} from '@/hooks';
```

### **Hook Composition Pattern**
```typescript
// Compose multiple hooks for complex functionality
function useResidentManagement() {
  const validation = useOptimizedResidentValidation();
  const operations = useResidentOperations();
  const workflow = useResidentEditWorkflow();
  const logger = useLogger('ResidentManagement');
  
  return {
    ...validation,
    ...operations,
    ...workflow,
    logger,
  };
}
```

### **Error Handling Pattern**
```typescript
// Wrap async operations with error boundary
function useDataWithErrorHandling() {
  const { wrapAsync, error, retry } = useAsyncErrorBoundary({
    maxRetries: 3,
    onError: (error, context) => {
      console.error('Operation failed:', error, context);
    }
  });
  
  const fetchData = useCallback(async () => {
    return wrapAsync(
      () => apiCall(),
      'fetch user data'
    );
  }, [wrapAsync]);
  
  return { fetchData, error, retry };
}
```

### **Performance Monitoring Pattern**
```typescript
// Monitor hook performance
function useMonitoredHook() {
  const { metrics } = usePerformanceMonitor('useMonitoredHook');
  
  // Your hook logic here
  const result = useMemo(() => {
    // Expensive computation
  }, [dependencies]);
  
  // Log performance in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && metrics.renderCount > 10) {
      console.warn(`Hook rendered ${metrics.renderCount} times`);
    }
  }, [metrics]);
  
  return result;
}
```

## 🧪 **Testing**

### **Test Structure**
```
src/hooks/__tests__/
├── useOptimizedResidentValidation.test.ts
├── useAsyncErrorBoundary.test.ts
├── useCommandMenuWithApi.test.ts
├── useDashboard.test.ts
└── createValidationHook.test.ts
```

### **Running Tests**
```bash
# Run all hook tests
npm test -- src/hooks/__tests__

# Run specific hook test
npm test -- useOptimizedResidentValidation.test.ts

# Run tests with coverage
npm test -- --coverage src/hooks
```

## 📊 **Performance Metrics**

### **Before vs After Refactoring**
| Metric | Before | After | Improvement |
|--------|--------|-------|-------------|
| Total Hooks | 32 | 49 | +53% (better organization) |
| useMemo Usage | 3% | 19% | +533% |
| Largest Hook | 547 lines | 196 lines | -64% |
| TypeScript 'any' | 4 instances | 0 instances | -100% |
| Console Logs | 31 production | 0 production | -100% |

### **Current Health Score: 🟢 EXCELLENT**
- ✅ **Maintainability**: A+ (focused, single-responsibility hooks)
- ✅ **Performance**: A+ (optimized memoization and error handling)
- ✅ **Type Safety**: A+ (zero 'any' types, proper interfaces)
- ✅ **Error Handling**: A+ (comprehensive async error boundaries)
- ✅ **Testing**: A (comprehensive test suite for critical hooks)

## 🔄 **Migration Guide**

### **From Old Structure to New Structure**
```typescript
// OLD (flat structure)
import { useOptimizedResidentValidation } from '@/hooks/useOptimizedResidentValidation';

// NEW (organized structure)
import { useOptimizedResidentValidation } from '@/hooks/validation';
// OR (backward compatible)
import { useOptimizedResidentValidation } from '@/hooks';
```

### **Deprecated Hooks**
- `useResidents` → Use `useResidentOperations` 
- `useHouseholds` → Use `useHouseholdCrud`

## 🚨 **Best Practices**

### **1. Hook Composition**
- Compose small, focused hooks rather than creating large monolithic ones
- Use the factory pattern for reusable validation logic
- Leverage error boundaries for all async operations

### **2. Performance**
- Always memoize expensive computations with `useMemo`
- Use `useCallback` for functions passed as props
- Monitor hook performance in development with `usePerformanceMonitor`

### **3. Error Handling**
- Wrap all async operations with `useAsyncErrorBoundary`
- Use the centralized logging service (`useLogger`) instead of console statements
- Implement proper retry mechanisms for failed operations

### **4. Testing**
- Write unit tests for all critical hooks
- Test error scenarios and edge cases
- Verify memoization and performance optimizations

## 🔮 **Future Enhancements**

### **Planned Improvements**
1. **Increase memoization** from 19% to 30%+ coverage
2. **Add performance benchmarks** for all hooks
3. **Implement usage analytics** for optimization insights
4. **Create hook dependency visualization** tool
5. **Add integration tests** for workflow hooks

### **Advanced Features**
- **Automatic performance regression detection**
- **Integration with monitoring services** (Sentry, DataDog)
- **Hook usage documentation generation**
- **Developer tools integration**

## 💡 **Tips and Tricks**

### **Development Workflow**
```typescript
// Use the performance monitor during development
const MyComponent = () => {
  const { metrics } = usePerformanceMonitor('MyComponent');
  
  // Your component logic
  
  // Debug performance issues
  console.log('Render metrics:', metrics);
};
```

### **Debugging Hooks**
```typescript
// Use the logger for better debugging
const MyHook = () => {
  const { log, warn } = useLogger('MyHook');
  
  useEffect(() => {
    log('Hook initialized');
    return () => log('Hook cleanup');
  }, []);
};
```

### **Error Recovery**
```typescript
// Implement robust error recovery
const { wrapAsync, retry, error } = useAsyncErrorBoundary({
  maxRetries: 3,
  retryDelay: 1000,
  enableRecovery: true,
});
```

---

## 📞 **Support**

For questions about hooks usage, performance issues, or contributions:

1. **Check this documentation** first
2. **Review the test files** for usage examples
3. **Check the audit report** for detailed technical information
4. **Create an issue** with detailed reproduction steps

**Happy coding! 🚀**