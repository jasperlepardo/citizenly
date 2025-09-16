# Providers Directory Documentation

**Last Updated:** February 3, 2025  
**Directory:** `src/providers`  
**Purpose:** React context providers and application-wide state management

---

## 📋 **Overview**

The `providers` directory contains React context providers that wrap the application with essential services like error boundaries, query management, authentication, and theme handling. These providers establish the foundational layer for application-wide state and functionality.

---

## 📁 **Directory Structure**

```
src/providers/
├── ErrorBoundary.tsx              # ✅ Advanced error boundary with levels
├── QueryProvider.tsx              # ✅ React Query with persistence  
├── LastVisitedTracker.tsx         # ✅ Navigation state tracking
├── Providers.tsx                  # ✅ Main provider composition
├── AppProvider.tsx                # ❌ UNUSED - Comprehensive app state
├── ErrorBoundaryProvider.tsx      # ❌ UNUSED - Alternative error boundary
├── index.tsx                      # ❌ UNUSED - Root provider wrapper
└── components/
    └── client-providers/
        └── ClientProviders.tsx    # ❌ UNUSED - Simple auth wrapper
```

---

## ✅ **Active Providers**

### **`ErrorBoundary.tsx`**
**Purpose:** Application error boundary with development and production modes  
**Features:**
- 🎯 **Error Levels:** Page, section, and component-level boundaries
- 🔄 **Auto Recovery:** Circuit breaker pattern with automatic reset
- 🛠️ **Dev Mode:** Detailed error display with stack traces and component stacks
- 🎨 **Prod Mode:** User-friendly error messages with retry options
- 📊 **Error Tracking:** Counts errors and provides reset mechanisms

**Usage:**
```tsx
import { ErrorBoundary } from '@/providers/ErrorBoundary';

// Basic usage
<ErrorBoundary level="component">
  <MyComponent />
</ErrorBoundary>

// With custom fallback
<ErrorBoundary 
  level="section"
  fallback={<CustomErrorFallback />}
  onError={(error, errorInfo) => logError(error)}
>
  <MySection />
</ErrorBoundary>

// HOC usage
const SafeComponent = withErrorBoundary(MyComponent, { level: 'component' });
```

**Props:**
- `level?: 'page' | 'section' | 'component'` - Error boundary scope
- `fallback?: ReactNode` - Custom error UI
- `onError?: (error: Error, errorInfo: ErrorInfo) => void` - Error callback
- `resetKeys?: Array<string | number>` - Keys that trigger reset when changed
- `resetOnPropsChange?: boolean` - Auto-reset when children change
- `isolate?: boolean` - Whether to isolate errors or bubble up

---

### **`QueryProvider.tsx`**
**Purpose:** React Query configuration with client-side persistence  
**Features:**
- 💾 **Persistence:** localStorage caching with 1-hour expiration
- 🔄 **Hydration Safety:** Proper client/server rendering handling
- ⚙️ **Optimized Config:** 30min stale time, 1hr cache time, minimal refetching
- 🛠️ **Dev Tools:** React Query DevTools in development mode

**Usage:**
```tsx
import QueryProvider from '@/providers/QueryProvider';

// Wraps app with React Query
<QueryProvider>
  <App />
</QueryProvider>
```

**Configuration:**
```typescript
// Query defaults
staleTime: 30 * 60 * 1000,     // 30 minutes
gcTime: 60 * 60 * 1000,        // 1 hour
retry: 1,                       // Retry once on failure
refetchOnWindowFocus: false,    // No auto-refetch
refetchOnReconnect: false,      // No reconnect refetch
refetchOnMount: false,          // Cache-first strategy
```

---

### **`LastVisitedTracker.tsx`**
**Purpose:** Tracks user navigation for last visited page functionality  
**Features:**
- 📍 **Automatic Tracking:** Uses `useLastVisitedPage` hook
- 🔄 **No Render:** Component renders `null` (tracking only)
- 📱 **Layout Integration:** Included in app layout for global tracking

**Usage:**
```tsx
import LastVisitedTracker from '@/providers/LastVisitedTracker';

// In app layout
<html>
  <body>
    <Providers>
      <LastVisitedTracker />
      {children}
    </Providers>
  </body>
</html>
```

---

### **`Providers.tsx`** 
**Purpose:** Main provider composition that wraps the entire application  
**Features:**
- 🏗️ **Provider Hierarchy:** Establishes correct provider order
- 🛡️ **Error Protection:** Wraps everything in error boundary
- 🔗 **Context Chain:** Connects all application-wide contexts

**Usage:**
```tsx
import Providers from '@/providers/Providers';

// Main app wrapper
export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
```

**Provider Order:**
```tsx
<ErrorBoundary>           // Top-level error catching
  <QueryProvider>         // React Query data layer
    <ThemeProvider>       // Theme context (@/contexts)
      <AuthProvider>      // Authentication (@/contexts)
        {children}
      </AuthProvider>
    </ThemeProvider>
  </QueryProvider>
</ErrorBoundary>
```

---

## ❌ **Unused/Duplicate Providers** 

⚠️ **Note:** These files contain duplicate functionality or are unused. See [Providers Audit Report](../audits/PROVIDERS_AUDIT_REPORT_2025-02-03.md) for cleanup recommendations.

### **`AppProvider.tsx` - UNUSED (374 lines)**
**Status:** ❌ Not imported anywhere  
**Purpose:** Comprehensive app state management with useReducer  
**Features:** Auth, theme, UI state, notifications, settings persistence  
**Decision Needed:** Keep for future architecture or delete as unused code

### **`ErrorBoundaryProvider.tsx` - UNUSED (182 lines)**
**Status:** ❌ Duplicate of ErrorBoundary.tsx  
**Purpose:** Alternative error boundary with Sentry integration  
**Recommendation:** Merge Sentry features into ErrorBoundary.tsx, then delete

### **`index.tsx` - UNUSED (54 lines)**
**Status:** ❌ Alternative root provider  
**Purpose:** RootProvider wrapper with user prop passing  
**Recommendation:** Delete (redundant with Providers.tsx)

### **`components/client-providers/ClientProviders.tsx` - UNUSED (8 lines)**
**Status:** ❌ Simple AuthProvider wrapper  
**Purpose:** Basic client-side auth wrapping  
**Recommendation:** Delete (redundant functionality)

---

## 🔄 **Provider Dependencies**

### **External Dependencies:**
```json
{
  "@tanstack/react-query": "^5.x",
  "@tanstack/react-query-devtools": "^5.x", 
  "@tanstack/query-sync-storage-persister": "^5.x",
  "@tanstack/react-query-persist-client": "^5.x"
}
```

### **Internal Dependencies:**
- `@/contexts/AuthProvider` - Authentication context
- `@/contexts/ThemeProvider` - Theme management context  
- `@/hooks/utilities/useLastVisitedPage` - Navigation tracking hook
- `@/lib/logging/client-logger` - Error logging
- `@/components/shared/hocs/hocUtils` - HOC utilities

---

## 📊 **Usage Patterns**

### **Import Patterns:**
```typescript
// ✅ Recommended: Direct imports
import { ErrorBoundary } from '@/providers/ErrorBoundary';
import QueryProvider from '@/providers/QueryProvider';
import Providers from '@/providers/Providers';
import LastVisitedTracker from '@/providers/LastVisitedTracker';

// ❌ Avoid: Directory imports (no index files)
import { ErrorBoundary } from '@/providers'; // Won't work
```

### **Provider Composition:**
```tsx
// ✅ Correct order (from Providers.tsx)
<ErrorBoundary level="page">              // Catch all errors
  <QueryProvider>                          // Data layer
    <ThemeProvider>                        // UI theming
      <AuthProvider>                       // Authentication
        <LastVisitedTracker />             // Navigation tracking
        {children}                         // App content
      </AuthProvider>
    </ThemeProvider>
  </QueryProvider>  
</ErrorBoundary>
```

---

## 🛠️ **Development Guidelines**

### **Creating New Providers:**
1. **Single Responsibility:** Each provider should have one clear purpose
2. **Performance:** Use `useMemo` for context values to prevent re-renders
3. **Error Handling:** Always wrap with ErrorBoundary for safety
4. **TypeScript:** Provide strong typing for context values and props
5. **Testing:** Include proper error states and edge cases

### **Provider Best Practices:**
```tsx
// ✅ Good provider pattern
const MyProvider = ({ children }) => {
  const [state, setState] = useState(initialState);
  
  // Memoize context value to prevent unnecessary re-renders
  const contextValue = useMemo(() => ({
    state,
    actions: {
      updateState: setState,
    }
  }), [state]);
  
  return (
    <MyContext.Provider value={contextValue}>
      {children}
    </MyContext.Provider>
  );
};

// ✅ Provide custom hook
export const useMyContext = () => {
  const context = useContext(MyContext);
  if (!context) {
    throw new Error('useMyContext must be used within MyProvider');
  }
  return context;
};
```

### **Error Boundary Usage:**
```tsx
// ✅ Component level (most common)
<ErrorBoundary level="component">
  <DataTable />
</ErrorBoundary>

// ✅ Section level (form sections, layouts)
<ErrorBoundary level="section" resetKeys={[userId]}>
  <UserProfile userId={userId} />
</ErrorBoundary>

// ✅ Page level (route boundaries)
<ErrorBoundary level="page" resetOnPropsChange>
  <Dashboard />
</ErrorBoundary>
```

---

## 🔧 **Troubleshooting**

### **Common Issues:**

#### **Provider Order Problems:**
```typescript
// ❌ Wrong order - Auth needs Theme context
<AuthProvider>
  <ThemeProvider>
    <App />
  </ThemeProvider>
</AuthProvider>

// ✅ Correct order  
<ThemeProvider>
  <AuthProvider>
    <App />
  </AuthProvider>
</ThemeProvider>
```

#### **Query Persistence Issues:**
```typescript
// Issue: Hydration mismatch
// Solution: QueryProvider handles client/server differences automatically
// Just ensure it's only used on client side (with 'use client')
```

#### **Error Boundary Not Catching:**
```typescript
// Issue: Error boundaries only catch errors in child components
// Solution: Make sure ErrorBoundary wraps the component that might error

// ❌ Won't catch errors in ErrorBoundary itself
<ErrorBoundary>
  {/* Error in ErrorBoundary won't be caught */}
</ErrorBoundary>

// ✅ Will catch errors in MyComponent
<ErrorBoundary>
  <MyComponent /> {/* Errors here will be caught */}
</ErrorBoundary>
```

---

## 📈 **Performance Considerations**

### **Query Provider Optimization:**
- **Stale Time:** 30 minutes reduces unnecessary refetches
- **Cache Time:** 1 hour balances memory usage and performance
- **Persistence:** localStorage reduces initial load times
- **Dev Tools:** Only included in development builds

### **Error Boundary Performance:**
- **Memoized Context:** Prevents unnecessary re-renders
- **Level-based Recovery:** Granular error isolation
- **Circuit Breaker:** Automatic recovery after repeated errors

### **Provider Composition:**
- **Minimal Nesting:** Only essential providers in main chain
- **Lazy Loading:** Heavy providers loaded only when needed
- **Memory Management:** Proper cleanup in useEffect hooks

---

## 📝 **Migration Notes**

### **From Old Architecture:**
If migrating from separate provider files or different patterns:

1. **Import Updates:** Change to direct imports (no index files)
2. **Provider Order:** Follow established hierarchy in Providers.tsx
3. **Error Handling:** Use ErrorBoundary.tsx (not ErrorBoundaryProvider.tsx)
4. **Query Setup:** Use QueryProvider.tsx for all React Query needs

### **Future Architecture Considerations:**
- **AppProvider.tsx:** Currently unused but contains comprehensive state management
- **Sentry Integration:** Available in ErrorBoundaryProvider.tsx for merging
- **Provider Splitting:** Consider breaking up if Providers.tsx becomes too complex

---

## 📚 **Related Documentation**

- [Contexts Documentation](../contexts/README.md) - Theme and Auth providers
- [Hooks Documentation](../hooks/README.md) - Related utility hooks
- [Error Handling Guide](../guides/error-handling.md) - Error boundary best practices
- [Providers Audit Report](../audits/PROVIDERS_AUDIT_REPORT_2025-02-03.md) - Cleanup recommendations

---

## 🔚 **Summary**

The providers directory establishes the foundational layer for the Citizenly application, providing error boundaries, data management, and navigation tracking. The active providers are well-designed and follow React best practices, while several unused files remain for cleanup consideration.

**Key Takeaways:**
- ✅ **4 active providers** providing essential app functionality
- ❌ **4 unused files** ready for cleanup (609 lines of code)
- 🏗️ **Clean architecture** with proper provider composition
- 📈 **Performance optimized** with appropriate caching and memoization

For implementation of cleanup recommendations, see the [Providers Audit Report](../audits/PROVIDERS_AUDIT_REPORT_2025-02-03.md).