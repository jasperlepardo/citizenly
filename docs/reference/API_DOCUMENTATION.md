# RBI System API Documentation

## Overview

The RBI System uses **Supabase** as the backend-as-a-service, providing auto-generated REST APIs, real-time subscriptions, and built-in authentication. This documentation covers REST endpoint usage, authentication flows, rate limiting, and error handling patterns.

## 🏗️ Architecture

```
Frontend (Next.js) → Supabase Client → Supabase API → PostgreSQL Database
                                    ↓
                            Row Level Security (RLS)
                                    ↓
                            Authentication & Authorization
```

**Key Components:**

- **Supabase REST API**: Auto-generated from database schema
- **Row Level Security (RLS)**: Database-level authorization
- **JWT Authentication**: Secure user sessions
- **Real-time Subscriptions**: Live data updates

## 🔐 Authentication Flows

### 1. User Registration Flow

```typescript
// Register new user
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'securepassword123',
  options: {
    data: {
      full_name: 'John Doe',
      role: 'barangay_staff',
    },
  },
});

if (error) {
  console.error('Registration error:', error.message);
} else {
  console.log('User registered:', data.user);
  // Email confirmation required
}
```

**Response:**

```json
{
  "user": {
    "id": "uuid-string",
    "email": "user@example.com",
    "user_metadata": {
      "full_name": "John Doe",
      "role": "barangay_staff"
    },
    "email_confirmed_at": null
  },
  "session": null
}
```

### 2. User Login Flow

```typescript
// Sign in with email/password
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'securepassword123',
});

if (error) {
  console.error('Login error:', error.message);
} else {
  console.log('User logged in:', data.user);
  console.log('Session:', data.session);
}
```

**Response:**

```json
{
  "user": {
    "id": "uuid-string",
    "email": "user@example.com",
    "role": "authenticated",
    "user_metadata": {
      "full_name": "John Doe",
      "role": "barangay_staff"
    }
  },
  "session": {
    "access_token": "jwt-token",
    "refresh_token": "refresh-token",
    "expires_at": 1234567890,
    "token_type": "bearer"
  }
}
```

### 3. Session Management

```typescript
// Get current session
const {
  data: { session },
} = await supabase.auth.getSession();

// Listen for auth changes
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'SIGNED_IN') {
    console.log('User signed in:', session?.user);
  } else if (event === 'SIGNED_OUT') {
    console.log('User signed out');
  } else if (event === 'TOKEN_REFRESHED') {
    console.log('Token refreshed:', session?.access_token);
  }
});

// Sign out
const { error } = await supabase.auth.signOut();
```

### 4. Role-Based Authorization

```typescript
// Check user role from JWT claims
const {
  data: { user },
} = await supabase.auth.getUser();
const userRole = user?.user_metadata?.role;

// Role-based access control
const hasPermission = (requiredRole: string) => {
  const roleHierarchy = {
    barangay_captain: 4,
    barangay_staff: 3,
    health_worker: 2,
    resident: 1,
  };

  const userLevel = roleHierarchy[userRole] || 0;
  const requiredLevel = roleHierarchy[requiredRole] || 0;

  return userLevel >= requiredLevel;
};
```

## 📊 REST API Endpoints

### Base Configuration

```typescript
// Supabase client configuration
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);
```

### 1. Residents API

#### Get All Residents

```typescript
// GET /rest/v1/residents
const { data: residents, error } = await supabase
  .from('residents')
  .select('*')
  .order('last_name', { ascending: true });
```

**Response:**

```json
{
  "data": [
    {
      "id": "uuid-string",
      "first_name": "Juan",
      "middle_name": "Santos",
      "last_name": "Dela Cruz",
      "extension_name": null,
      "birthdate": "1990-01-15",
      "sex": "male",
      "civil_status": "married",
      "citizenship": "filipino",
      "education_level": "college",
      "education_status": "graduated",
      "employment_status": "employed",
      "mobile_number": "09171234567",
      "email": "juan.delacruz@email.com",
      "barangay_code": "137404001",
      "region_code": "13",
      "province_code": "1374",
      "city_municipality_code": "137404",
      "is_voter": true,
      "is_resident_voter": true,
      "is_labor_force": true,
      "is_employed": true,
      "is_senior_citizen": false,
      "is_pwd": false,
      "is_active": true,
      "created_at": "2024-01-01T00:00:00Z",
      "updated_at": null
    }
  ],
  "status": 200,
  "statusText": "OK"
}
```

#### Get Resident by ID

```typescript
// GET /rest/v1/residents?id=eq.uuid
const { data: resident, error } = await supabase
  .from('residents')
  .select('*')
  .eq('id', 'uuid-string')
  .single();
```

#### Create New Resident

```typescript
// POST /rest/v1/residents
const { data, error } = await supabase
  .from('residents')
  .insert({
    first_name: 'Maria',
    middle_name: 'Garcia',
    last_name: 'Santos',
    birthdate: '1985-05-20',
    sex: 'female',
    civil_status: 'single',
    citizenship: 'filipino',
    mobile_number: '09171234567',
    barangay_code: '137404001',
    education_level: 'college',
    education_status: 'graduated',
    employment_status: 'employed',
    blood_type: 'O+',
    ethnicity: 'tagalog',
    religion: 'roman_catholic',
    is_voter: true,
    is_resident_voter: true,
    is_labor_force: true,
    is_employed: true,
    is_active: true,
  })
  .select();
```

#### Update Resident

```typescript
// PATCH /rest/v1/residents?id=eq.uuid
const { data, error } = await supabase
  .from('residents')
  .update({
    mobile_number: '09187654321',
    email: 'maria.santos@email.com',
  })
  .eq('id', 'uuid-string')
  .select();
```

#### Delete Resident (Soft Delete)

```typescript
// PATCH /rest/v1/residents?id=eq.uuid
const { data, error } = await supabase
  .from('residents')
  .update({ is_active: false })
  .eq('id', 'uuid-string');
```

### 2. Households API

#### Get Households with Members

```typescript
// GET /rest/v1/households with join
const { data: households, error } = await supabase
  .from('households')
  .select(
    `
    *,
    residents:residents(*)
  `
  )
  .eq('barangay_code', '137404001');
```

#### Create New Household

```typescript
// POST /rest/v1/households
const { data, error } = await supabase
  .from('households')
  .insert({
    code: 'HH-2024-001',
    barangay_code: '137404001',
    street_name: 'Main Street',
    house_number: '123',
    total_members: 4,
  })
  .select();
```

### 3. PSGC (Address) API

#### Get Address Hierarchy

```typescript
// GET /rest/v1/address_hierarchy (view)
const { data: addresses, error } = await supabase
  .from('address_hierarchy')
  .select('*')
  .eq('region_code', '13')
  .order('province_name', { ascending: true });
```

#### Search Occupations

```typescript
// GET /rest/v1/psoc_occupation_search (view)
const { data: occupations, error } = await supabase
  .from('psoc_occupation_search')
  .select('*')
  .textSearch('searchable_text', 'teacher manager')
  .limit(10);
```

#### Get Barangays by City/Municipality

```typescript
// GET /rest/v1/psgc_barangays
const { data: barangays, error } = await supabase
  .from('psgc_barangays')
  .select('code, name')
  .eq('city_municipality_code', '137404')
  .order('name');
```

### 4. Advanced Queries

#### Filter and Pagination

```typescript
// Complex filtering with pagination
const { data: residents, error } = await supabase
  .from('residents')
  .select('*')
  .eq('barangay_code', '137404001')
  .gte('age', 18) // Computed in view
  .ilike('last_name', 'santos%')
  .order('last_name')
  .range(0, 49); // Limit 50 records
```

#### Count Records

```typescript
// Get count without fetching data
const { count, error } = await supabase
  .from('residents')
  .select('*', { count: 'exact', head: true })
  .eq('barangay_code', '137404001');
```

#### Full Text Search

```typescript
// Search across multiple fields
const { data: results, error } = await supabase
  .from('residents')
  .select('*')
  .textSearch('full_name', 'juan maria', {
    type: 'websearch',
    config: 'english',
  });
```

## 🔄 Real-time Subscriptions

### Listen to Table Changes

```typescript
// Subscribe to residents table changes
const subscription = supabase
  .channel('residents_changes')
  .on(
    'postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'residents',
    },
    payload => {
      console.log('Change received!', payload);

      switch (payload.eventType) {
        case 'INSERT':
          console.log('New resident:', payload.new);
          break;
        case 'UPDATE':
          console.log('Updated resident:', payload.new);
          break;
        case 'DELETE':
          console.log('Deleted resident:', payload.old);
          break;
      }
    }
  )
  .subscribe();

// Cleanup subscription
subscription.unsubscribe();
```

### Room-based Subscriptions

```typescript
// Join a barangay-specific channel
const channel = supabase.channel('barangay_137404001');

// Listen for presence changes
channel.on('presence', { event: 'sync' }, () => {
  const newState = channel.presenceState();
  console.log('Online users:', newState);
});

// Track user presence
channel.subscribe(async status => {
  if (status !== 'SUBSCRIBED') return;

  await channel.track({
    user_id: user.id,
    username: user.email,
    online_at: new Date().toISOString(),
  });
});
```

## ⚡ Rate Limiting

### Supabase Built-in Limits

**Free Tier Limits:**

- **API requests**: 500 requests/second
- **Database connections**: 60 concurrent
- **Auth users**: 50,000 monthly active
- **Storage**: 1GB
- **Bandwidth**: 5GB

**Pro Tier Limits:**

- **API requests**: 5,000 requests/second
- **Database connections**: 200 concurrent
- **Auth users**: 500,000 monthly active
- **Storage**: 100GB
- **Bandwidth**: 200GB

### Client-Side Rate Limiting

```typescript
// Simple rate limiter implementation
class RateLimiter {
  private requests: Map<string, number[]> = new Map();

  constructor(
    private maxRequests: number = 100,
    private windowMs: number = 60000 // 1 minute
  ) {}

  async checkLimit(key: string): Promise<boolean> {
    const now = Date.now();
    const windowStart = now - this.windowMs;

    // Get existing requests for this key
    let requests = this.requests.get(key) || [];

    // Remove expired requests
    requests = requests.filter(time => time > windowStart);

    // Check if limit exceeded
    if (requests.length >= this.maxRequests) {
      return false;
    }

    // Add current request
    requests.push(now);
    this.requests.set(key, requests);

    return true;
  }
}

// Usage
const rateLimiter = new RateLimiter(50, 60000); // 50 requests per minute

const makeRequest = async (userId: string) => {
  const allowed = await rateLimiter.checkLimit(userId);

  if (!allowed) {
    throw new Error('Rate limit exceeded. Please try again later.');
  }

  // Proceed with request
  return supabase.from('residents').select('*');
};
```

### Request Batching

```typescript
// Batch multiple operations
const batchOperations = async () => {
  const { data, error } = await supabase.rpc('batch_operations', {
    operations: [
      { table: 'residents', operation: 'insert', data: {...} },
      { table: 'households', operation: 'update', data: {...} }
    ]
  });

  return { data, error };
};
```

## 🚨 Error Handling Patterns

### 1. Standard Error Types

```typescript
interface SupabaseError {
  message: string;
  details?: string;
  hint?: string;
  code?: string;
}

// Common error codes
const ERROR_CODES = {
  PGRST116: 'No rows found',
  PGRST202: 'Invalid JSON',
  '23505': 'Duplicate key value',
  '23502': 'Not null violation',
  '42501': 'Insufficient privileges',
  '23503': 'Foreign key violation',
} as const;
```

### 2. Comprehensive Error Handler

```typescript
class APIErrorHandler {
  static handle(error: SupabaseError): {
    userMessage: string;
    shouldRetry: boolean;
    logLevel: 'error' | 'warn' | 'info';
  } {
    // Network/Connection errors
    if (!navigator.onLine) {
      return {
        userMessage: 'No internet connection. Please check your network.',
        shouldRetry: true,
        logLevel: 'warn',
      };
    }

    // Supabase-specific errors
    switch (error.code) {
      case 'PGRST116': // No rows found
        return {
          userMessage: 'No records found matching your criteria.',
          shouldRetry: false,
          logLevel: 'info',
        };

      case '23505': // Unique violation
        return {
          userMessage: 'This record already exists. Please check your data.',
          shouldRetry: false,
          logLevel: 'warn',
        };

      case '23502': // Not null violation
        return {
          userMessage: 'Required fields are missing. Please complete the form.',
          shouldRetry: false,
          logLevel: 'warn',
        };

      case '42501': // Insufficient privileges
        return {
          userMessage: 'You do not have permission to perform this action.',
          shouldRetry: false,
          logLevel: 'error',
        };

      case 'PGRST301': // JWT expired
        return {
          userMessage: 'Your session has expired. Please log in again.',
          shouldRetry: false,
          logLevel: 'info',
        };

      default:
        return {
          userMessage: 'An unexpected error occurred. Please try again.',
          shouldRetry: true,
          logLevel: 'error',
        };
    }
  }

  static async withRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;

        const errorInfo = this.handle(error as SupabaseError);

        if (!errorInfo.shouldRetry || attempt === maxRetries) {
          throw error;
        }

        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, attempt)));
      }
    }

    throw lastError!;
  }
}
```

### 3. React Hook for API Calls

```typescript
import { useState, useCallback } from 'react';

interface APIState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useAPICall<T>() {
  const [state, setState] = useState<APIState<T>>({
    data: null,
    loading: false,
    error: null
  });

  const execute = useCallback(async (
    apiCall: () => Promise<{ data: T; error: SupabaseError | null }>
  ) => {
    setState(prev => ({ ...prev, loading: true, error: null }));

    try {
      const result = await APIErrorHandler.withRetry(apiCall);

      if (result.error) {
        const errorInfo = APIErrorHandler.handle(result.error);
        setState(prev => ({
          ...prev,
          loading: false,
          error: errorInfo.userMessage
        }));
      } else {
        setState(prev => ({
          ...prev,
          loading: false,
          data: result.data
        }));
      }
    } catch (error) {
      const errorInfo = APIErrorHandler.handle(error as SupabaseError);
      setState(prev => ({
        ...prev,
        loading: false,
        error: errorInfo.userMessage
      }));
    }
  }, []);

  const reset = useCallback(() => {
    setState({ data: null, loading: false, error: null });
  }, []);

  return { ...state, execute, reset };
}

// Usage in component
const ResidentList = () => {
  const { data: residents, loading, error, execute } = useAPICall<Resident[]>();

  const loadResidents = useCallback(() => {
    execute(() => supabase
      .from('residents')
      .select('*')
      .order('last_name')
    );
  }, [execute]);

  useEffect(() => {
    loadResidents();
  }, [loadResidents]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} onRetry={loadResidents} />;
  if (!residents?.length) return <EmptyState />;

  return <ResidentGrid residents={residents} />;
};
```

### 4. Global Error Boundary

```typescript
// components/ErrorBoundary.tsx
import React, { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error Boundary caught error:', error, errorInfo);

    // Log to monitoring service
    if (process.env.NODE_ENV === 'production') {
      // logToMonitoringService(error, errorInfo);
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-4">
              Something went wrong
            </h1>
            <p className="text-gray-600 mb-4">
              An unexpected error occurred. Please try refreshing the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Refresh Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
```

## 📊 Monitoring and Logging

### 1. Request Logging

```typescript
// API request logger
class APILogger {
  static logRequest(
    operation: string,
    table: string,
    filters?: Record<string, any>,
    duration?: number
  ) {
    const logData = {
      timestamp: new Date().toISOString(),
      operation,
      table,
      filters,
      duration,
      user_id: supabase.auth.user()?.id,
    };

    if (process.env.NODE_ENV === 'development') {
      console.log('API Request:', logData);
    }

    // Send to monitoring service in production
    if (process.env.NODE_ENV === 'production') {
      // sendToMonitoringService(logData);
    }
  }

  static logError(error: Error, context?: Record<string, any>) {
    const errorData = {
      timestamp: new Date().toISOString(),
      message: error.message,
      stack: error.stack,
      context,
      user_id: supabase.auth.user()?.id,
      url: window.location.href,
    };

    console.error('API Error:', errorData);

    // Send to error tracking service
    if (process.env.NODE_ENV === 'production') {
      // sendToErrorTracking(errorData);
    }
  }
}
```

### 2. Performance Monitoring

```typescript
// Performance monitoring wrapper
const withPerformanceMonitoring = <T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  operationName: string
) => {
  return async (...args: T): Promise<R> => {
    const startTime = performance.now();

    try {
      const result = await fn(...args);
      const duration = performance.now() - startTime;

      APILogger.logRequest(operationName, 'unknown', args[0], duration);

      // Alert if operation is slow
      if (duration > 5000) {
        console.warn(`Slow operation detected: ${operationName} took ${duration}ms`);
      }

      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      APILogger.logError(error as Error, { operationName, duration, args });
      throw error;
    }
  };
};

// Usage
const getResidentsWithMonitoring = withPerformanceMonitoring(
  (barangayCode: string) =>
    supabase.from('residents').select('*').eq('barangay_code', barangayCode),
  'getResidents'
);
```

## 🔧 Best Practices

### 1. Query Optimization

```typescript
// ✅ Good: Select only needed fields
const { data } = await supabase
  .from('residents')
  .select('id, first_name, last_name, barangay_code')
  .eq('barangay_code', code);

// ❌ Bad: Select all fields when not needed
const { data } = await supabase.from('residents').select('*').eq('barangay_code', code);
```

### 2. Connection Management

```typescript
// Create single client instance
const supabase = createClient(url, key);

// Reuse client throughout application
export { supabase };
```

### 3. Error Handling

```typescript
// ✅ Good: Always handle both data and error
const { data, error } = await supabase.from('residents').select('*');
if (error) {
  console.error('Database error:', error);
  return;
}

// ❌ Bad: Ignore error handling
const { data } = await supabase.from('residents').select('*');
```

### 4. Security

```typescript
// ✅ Good: Use RLS policies for authorization
// Policies defined in database

// ✅ Good: Validate user input
const validateResidentData = (data: any) => {
  if (!data.first_name || data.first_name.length < 2) {
    throw new Error('First name must be at least 2 characters');
  }
  // ... other validations
};
```

## 📚 Additional Resources

- **[Supabase API Reference](https://supabase.com/docs/reference/javascript)** - Complete API documentation
- **[PostgreSQL Error Codes](https://www.postgresql.org/docs/current/errcodes-appendix.html)** - Database error codes
- **[Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)** - Security implementation
- **[Real-time](https://supabase.com/docs/guides/realtime)** - Real-time subscriptions

---

This API documentation covers the essential patterns for working with the RBI System's Supabase-based backend. For additional details, refer to the complete database schema in `src/lib/supabase.ts`.
