# Hooks Migration Guide

## 🔄 **Migration Overview**

This guide helps you migrate from the old flat hooks structure to the new organized category-based structure. The migration is **backward compatible** - existing code will continue to work without changes.

## 📋 **Migration Checklist**

### **✅ Immediate Actions (Optional)**

- [ ] Update import statements to use category-based imports
- [ ] Replace deprecated hooks with new alternatives
- [ ] Add error boundaries to async operations
- [ ] Review and update validation logic

### **✅ Recommended Improvements**

- [ ] Add performance monitoring to critical hooks
- [ ] Implement centralized logging
- [ ] Add proper TypeScript types
- [ ] Write tests for custom hooks

## 🗂️ **Import Statement Migrations**

### **Category-Based Imports (Recommended)**

#### **Before (Flat Structure)**

```typescript
// OLD - Direct file imports
import { useOptimizedResidentValidation } from '@/hooks/useOptimizedResidentValidation';
import { useGenericSearch } from '@/hooks/useGenericSearch';
import { useDashboard } from '@/hooks/useDashboard';
import { useCommandMenuWithApi } from '@/hooks/useCommandMenuWithApi';
import { useAsyncErrorBoundary } from '@/hooks/useAsyncErrorBoundary';
```

#### **After (Organized Structure)**

```typescript
// NEW - Category-based imports
import { useOptimizedResidentValidation } from '@/hooks/validation';
import { useGenericSearch } from '@/hooks/search';
import { useDashboard } from '@/hooks/dashboard';
import { useCommandMenuWithApi } from '@/hooks/command-menu';
import { useAsyncErrorBoundary } from '@/hooks/utilities';
```

#### **Backward Compatible (Still Works)**

```typescript
// LEGACY COMPATIBLE - Root level imports
import {
  useOptimizedResidentValidation,
  useGenericSearch,
  useDashboard,
  useCommandMenuWithApi,
  useAsyncErrorBoundary,
} from '@/hooks';
```

## 🔧 **Hook Replacement Guide**

### **Deprecated Hooks → New Alternatives**

#### **1. Resident Operations**

```typescript
// OLD - Legacy hook
import { useResidents } from '@/hooks/useResidents';

// NEW - Improved hook
import { useResidentOperations } from '@/hooks/crud';
// OR
import { useResidentOperations } from '@/hooks';

// Migration example
const MyComponent = () => {
  // OLD
  // const { residents, loading } = useResidents();

  // NEW
  const { residents, isLoading, createResident, updateResident, deleteResident } =
    useResidentOperations();
};
```

#### **2. Household Operations**

```typescript
// OLD - Legacy hook
import { useHouseholds } from '@/hooks/useHouseholds';

// NEW - Improved hook
import { useHouseholdCrud } from '@/hooks/crud';

// Migration example
const MyComponent = () => {
  // OLD
  // const { households, loading } = useHouseholds();

  // NEW
  const { households, isLoading, createHousehold, updateHousehold, deleteHousehold } =
    useHouseholdCrud();
};
```

#### **3. Large Hook Refactoring**

**useOptimizedResidentValidation (Split from 547 → 138 lines)**

```typescript
// OLD - Monolithic hook
import { useOptimizedResidentValidation } from '@/hooks/useOptimizedResidentValidation';

const { validateField, errors } = useOptimizedResidentValidation();

// NEW - Same interface, better performance (no changes needed!)
import { useOptimizedResidentValidation } from '@/hooks/validation';

const { validateField, errors } = useOptimizedResidentValidation();

// NEW - Access to individual validation components (optional)
import {
  useResidentValidationCore,
  useResidentCrossFieldValidation,
  useResidentAsyncValidation,
} from '@/hooks/validation';
```

**useCommandMenuWithApi (Split from 355 → 196 lines)**

```typescript
// OLD - Large hook
import { useCommandMenuWithApi } from '@/hooks/useCommandMenuWithApi';

// NEW - Same interface, better performance (no changes needed!)
import { useCommandMenuWithApi } from '@/hooks/command-menu';

// NEW - Access to individual components (optional)
import {
  useCommandMenuSearch,
  useCommandMenuRecents,
  useCommandMenuActions,
} from '@/hooks/command-menu';
```

**useDashboard (Split from 266 → 102 lines)**

```typescript
// OLD - Large hook
import { useDashboard } from '@/hooks/useDashboard';

// NEW - Same interface, better performance (no changes needed!)
import { useDashboard } from '@/hooks/dashboard';

// NEW - Access to individual components (optional)
import { useDashboardApi, useDashboardCalculations } from '@/hooks/dashboard';
```

## ⚡ **Performance Migration**

### **Add Error Boundaries**

```typescript
// OLD - No error handling
const MyComponent = () => {
  const [data, setData] = useState(null);

  const fetchData = async () => {
    try {
      const result = await apiCall();
      setData(result);
    } catch (error) {
      console.error(error); // Bad practice
    }
  };
};

// NEW - With error boundary
import { useAsyncErrorBoundary } from '@/hooks/utilities';

const MyComponent = () => {
  const [data, setData] = useState(null);
  const { wrapAsync, error, retry } = useAsyncErrorBoundary();

  const fetchData = useCallback(async () => {
    const result = await wrapAsync(
      () => apiCall(),
      'fetch component data'
    );
    if (result) setData(result);
  }, [wrapAsync]);

  if (error) {
    return (
      <div>
        <p>Error: {error.message}</p>
        <button onClick={retry}>Retry</button>
      </div>
    );
  }
};
```

### **Add Performance Monitoring**

```typescript
// OLD - No performance tracking
const useMyCustomHook = () => {
  // Hook logic
  return result;
};

// NEW - With performance monitoring
import { usePerformanceMonitor } from '@/hooks/utilities';

const useMyCustomHook = () => {
  const { metrics } = usePerformanceMonitor('useMyCustomHook');

  // Hook logic with memoization
  const result = useMemo(() => {
    // Expensive computation
  }, [dependencies]);

  // Optional: Log performance in development
  useEffect(() => {
    if (process.env.NODE_ENV === 'development' && metrics.renderCount > 10) {
      console.warn(`useMyCustomHook rendered ${metrics.renderCount} times`);
    }
  }, [metrics]);

  return result;
};
```

### **Replace Console Logging**

```typescript
// OLD - Direct console logging
const MyComponent = () => {
  useEffect(() => {
    console.log('Component mounted'); // Bad practice
  }, []);
};

// NEW - Centralized logging
import { useLogger } from '@/hooks/utilities';

const MyComponent = () => {
  const { log, warn, error } = useLogger('MyComponent');

  useEffect(() => {
    log('Component mounted');
  }, [log]);
};
```

## 🔧 **Custom Hook Migration**

### **Validation Hook Migration**

```typescript
// OLD - Custom validation with manual error handling
const useCustomValidation = schema => {
  const [errors, setErrors] = useState({});

  const validate = data => {
    try {
      schema.parse(data);
      setErrors({});
      return true;
    } catch (error) {
      setErrors(parseErrors(error));
      return false;
    }
  };

  return { validate, errors };
};

// NEW - Using validation factory
import { createValidationHook } from '@/hooks/validation';

const useCustomValidation = createValidationHook(schema, {
  validateOnBlur: true,
  customMessages: {
    email: 'Please enter a valid email address',
  },
});

// Usage remains clean and type-safe
const { validation, validateAsync, clearErrors } = useCustomValidation();
```

### **Search Hook Migration**

```typescript
// OLD - Manual search implementation
const useCustomSearch = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const search = async searchQuery => {
    setLoading(true);
    try {
      const results = await searchAPI(searchQuery);
      setResults(results);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return { query, setQuery, results, loading, search };
};

// NEW - Using generic search hook
import { useGenericSearch } from '@/hooks/search';
import { useAsyncErrorBoundary } from '@/hooks/utilities';

const useCustomSearch = () => {
  const { wrapAsync } = useAsyncErrorBoundary();

  const searchFunction = useCallback(
    async query => {
      return wrapAsync(() => searchAPI(query), 'custom search operation');
    },
    [wrapAsync]
  );

  return useGenericSearch({
    searchFn: searchFunction,
    debounceMs: 300,
    minQueryLength: 2,
  });
};
```

## 📁 **File Structure Migration**

### **Before: Flat Structure**

```
src/hooks/
├── useOptimizedResidentValidation.ts (547 lines)
├── useCommandMenuWithApi.ts (355 lines)
├── useDashboard.ts (266 lines)
├── useGenericSearch.ts
├── useAsyncErrorBoundary.ts
├── ... (32 other files)
└── index.ts
```

### **After: Organized Structure**

```
src/hooks/
├── validation/
│   ├── useOptimizedResidentValidation.ts (138 lines)
│   ├── useResidentValidationCore.ts
│   ├── useResidentCrossFieldValidation.ts
│   ├── createValidationHook.ts
│   └── index.ts
├── command-menu/
│   ├── useCommandMenuWithApi.ts (196 lines)
│   ├── useCommandMenuSearch.ts
│   ├── useCommandMenuActions.ts
│   └── index.ts
├── dashboard/
│   ├── useDashboard.ts (102 lines)
│   ├── useDashboardApi.ts
│   └── index.ts
├── search/
├── crud/
├── workflows/
├── utilities/
├── __tests__/
└── index.ts (organized exports)
```

## ⚠️ **Breaking Changes (None!)**

**Good news**: This migration has **ZERO breaking changes**. All existing code will continue to work exactly as before due to backward compatibility exports in the main `index.ts`.

## 🧪 **Testing Migration**

### **Add Tests for Custom Hooks**

```typescript
// NEW - Comprehensive testing
import { renderHook, act } from '@testing-library/react';
import { useMyCustomHook } from '../useMyCustomHook';

describe('useMyCustomHook', () => {
  it('should handle happy path', () => {
    const { result } = renderHook(() => useMyCustomHook());

    expect(result.current.data).toBeDefined();
  });

  it('should handle errors gracefully', async () => {
    const { result } = renderHook(() => useMyCustomHook());

    await act(async () => {
      await result.current.triggerError();
    });

    expect(result.current.error).toBeDefined();
    expect(result.current.retry).toBeDefined();
  });
});
```

## 📊 **Migration Timeline**

### **Phase 1: Immediate (Optional)**

- Update import statements to category-based imports
- No functional changes required

### **Phase 2: Short-term (Recommended)**

- Replace deprecated hooks (`useResidents`, `useHouseholds`)
- Add error boundaries to async operations
- Implement centralized logging

### **Phase 3: Long-term (Optional)**

- Add performance monitoring to critical components
- Write comprehensive tests
- Implement custom validation hooks using the factory

## 🆘 **Troubleshooting**

### **Common Issues**

#### **Import Errors**

```typescript
// Problem: Import not found
import { useMyHook } from '@/hooks/validation';

// Solution: Check if hook is in the correct category
import { useMyHook } from '@/hooks/utilities';
// OR use root import
import { useMyHook } from '@/hooks';
```

#### **Type Errors**

```typescript
// Problem: Type not exported
import { MyHookOptions } from '@/hooks/validation';

// Solution: Import from the specific file or root
import type { MyHookOptions } from '@/hooks/validation/useMyHook';
// OR
import type { MyHookOptions } from '@/hooks';
```

#### **Performance Issues**

```typescript
// Problem: Hook re-rendering too much
const MyComponent = () => {
  const result = useMyHook(complexObject); // Re-creates object every render
};

// Solution: Memoize the parameters
const MyComponent = () => {
  const memoizedParams = useMemo(() => complexObject, [dependency]);
  const result = useMyHook(memoizedParams);
};
```

## 🎯 **Next Steps**

1. **Review your current hook usage** and identify opportunities for improvement
2. **Start with high-impact changes** (error boundaries, deprecated hook replacement)
3. **Gradually adopt new patterns** (performance monitoring, centralized logging)
4. **Write tests** for critical hook functionality
5. **Monitor performance** and optimize as needed

## 📞 **Support**

If you encounter any issues during migration:

1. Check this guide for common solutions
2. Review the main README.md for detailed documentation
3. Look at test files for usage examples
4. Create an issue with detailed reproduction steps

**Happy migrating! 🚀**
