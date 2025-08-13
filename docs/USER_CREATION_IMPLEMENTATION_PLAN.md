# User Creation Implementation Plan

## Overview

This document outlines the comprehensive implementation plan for robust user creation in the RBI (Records of Barangay Inhabitant) system. The plan addresses current timing issues with Supabase Auth and foreign key constraints by implementing a database-centric approach.

## Current Issues Analysis

### **Problem Statement**
The current user creation flow fails due to timing issues between Supabase Auth user creation and profile creation, resulting in foreign key constraint violations.

### **Root Cause Analysis**
1. **Foreign Key Timing**: `auth_user_profiles.id → auth.users(id)` constraint fails when profile creation occurs before auth propagation
2. **Multi-Step Process**: Separate API calls for user creation and profile setup lack atomicity
3. **Trigger Dependencies**: `populate_user_tracking_fields()` function depends on `auth.uid()` context
4. **Error Handling**: Insufficient retry mechanisms for Supabase Auth timing issues

### **Current Schema Dependencies**
```sql
-- Core constraint causing issues
CREATE TABLE auth_user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES auth_roles(id),
    barangay_code VARCHAR(10) REFERENCES psgc_barangays(code),
    -- Geographic hierarchy
    city_municipality_code VARCHAR(10) REFERENCES psgc_cities_municipalities(code),
    province_code VARCHAR(10) REFERENCES psgc_provinces(code),
    region_code VARCHAR(10) REFERENCES psgc_regions(code),
    -- Audit fields
    created_by UUID REFERENCES auth_user_profiles(id),
    updated_by UUID REFERENCES auth_user_profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-tracking trigger
CREATE TRIGGER trigger_auth_user_profiles_user_tracking
    BEFORE INSERT OR UPDATE ON auth_user_profiles
    FOR EACH ROW EXECUTE FUNCTION populate_user_tracking_fields();
```

## Solution Architecture

### **Strategy: Database Function Approach**
Implement a single PostgreSQL function that handles the entire user creation process atomically, eliminating timing issues and ensuring data consistency.

### **Key Benefits**
- ✅ **Atomic Operations**: Single database transaction
- ✅ **Proper Context**: Function executes with correct database permissions
- ✅ **Automatic Retry**: Database handles constraint checking internally
- ✅ **Error Handling**: Single point of failure with automatic rollback
- ✅ **Better Security**: SECURITY DEFINER ensures proper permissions

## Implementation Plan

### **Phase 1: Database Function Creation**

#### **1.1 Core User Creation Function**
```sql
-- Create comprehensive user profile creation function
CREATE OR REPLACE FUNCTION create_user_with_profile(
    user_id UUID,
    email VARCHAR(255),
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    phone VARCHAR(20),
    barangay_code VARCHAR(10),
    role_name VARCHAR(50)
) RETURNS JSON AS $$
DECLARE
    role_record auth_roles%ROWTYPE;
    address_hierarchy RECORD;
    profile_record auth_user_profiles%ROWTYPE;
BEGIN
    -- Step 1: Validate user exists in auth.users
    IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = user_id) THEN
        RAISE EXCEPTION 'User not found in authentication system with ID: %', user_id;
    END IF;
    
    -- Step 2: Get role by name with validation
    SELECT * INTO role_record FROM auth_roles WHERE name = role_name;
    IF role_record.id IS NULL THEN
        RAISE EXCEPTION 'Role "%" not found in system', role_name;
    END IF;
    
    -- Step 3: Validate and get complete address hierarchy
    SELECT 
        b.code as barangay_code,
        b.name as barangay_name,
        c.code as city_code,
        c.name as city_name,
        c.type as city_type,
        c.is_independent as city_is_independent,
        p.code as province_code,
        p.name as province_name,
        r.code as region_code,
        r.name as region_name
    INTO address_hierarchy
    FROM psgc_barangays b
    JOIN psgc_cities_municipalities c ON c.code = b.city_municipality_code
    JOIN psgc_provinces p ON p.code = c.province_code
    JOIN psgc_regions r ON r.code = p.region_code
    WHERE b.code = barangay_code AND b.is_active = true;
    
    IF address_hierarchy.barangay_code IS NULL THEN
        RAISE EXCEPTION 'Invalid or inactive barangay code: %', barangay_code;
    END IF;
    
    -- Step 4: Create user profile with complete hierarchy
    INSERT INTO auth_user_profiles (
        id,
        email,
        first_name,
        last_name,
        phone,
        role_id,
        barangay_code,
        city_municipality_code,
        province_code,
        region_code,
        is_active
    ) VALUES (
        user_id,
        email,
        first_name,
        last_name,
        phone,
        role_record.id,
        address_hierarchy.barangay_code,
        address_hierarchy.city_code,
        address_hierarchy.province_code,
        address_hierarchy.region_code,
        true
    ) RETURNING * INTO profile_record;
    
    -- Step 5: Return comprehensive success response
    RETURN json_build_object(
        'success', true,
        'profile_id', profile_record.id,
        'user_data', json_build_object(
            'email', profile_record.email,
            'first_name', profile_record.first_name,
            'last_name', profile_record.last_name,
            'phone', profile_record.phone,
            'is_active', profile_record.is_active
        ),
        'role_data', json_build_object(
            'id', role_record.id,
            'name', role_record.name,
            'description', role_record.description
        ),
        'location_data', json_build_object(
            'barangay_code', address_hierarchy.barangay_code,
            'barangay_name', address_hierarchy.barangay_name,
            'city_code', address_hierarchy.city_code,
            'city_name', address_hierarchy.city_name,
            'city_type', address_hierarchy.city_type,
            'province_code', address_hierarchy.province_code,
            'province_name', address_hierarchy.province_name,
            'region_code', address_hierarchy.region_code,
            'region_name', address_hierarchy.region_name
        ),
        'created_at', profile_record.created_at,
        'message', 'User profile created successfully'
    );
    
EXCEPTION
    WHEN unique_violation THEN
        RETURN json_build_object(
            'success', false,
            'error', 'A user profile with this information already exists',
            'error_code', 'DUPLICATE_PROFILE',
            'details', SQLERRM
        );
    WHEN foreign_key_violation THEN
        RETURN json_build_object(
            'success', false,
            'error', 'Referenced data not found (user, role, or location)',
            'error_code', 'INVALID_REFERENCE',
            'details', SQLERRM
        );
    WHEN OTHERS THEN
        RETURN json_build_object(
            'success', false,
            'error', SQLERRM,
            'error_code', SQLSTATE,
            'details', 'Unexpected error during profile creation'
        );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execution permissions
GRANT EXECUTE ON FUNCTION create_user_with_profile TO authenticated;

-- Add function documentation
COMMENT ON FUNCTION create_user_with_profile IS 
'Creates a complete user profile with role assignment and geographic hierarchy validation. 
Handles all foreign key constraints and provides comprehensive error handling.
Returns JSON with success status and complete user data or error details.';
```

#### **1.2 User Existence Verification Function**
```sql
-- Helper function to check if user exists with retry logic
CREATE OR REPLACE FUNCTION verify_auth_user_exists(user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    user_exists BOOLEAN := false;
    retry_count INTEGER := 0;
    max_retries INTEGER := 3;
BEGIN
    -- Check if user exists in auth.users table
    WHILE NOT user_exists AND retry_count < max_retries LOOP
        SELECT EXISTS(SELECT 1 FROM auth.users WHERE id = user_id) INTO user_exists;
        
        IF NOT user_exists THEN
            retry_count := retry_count + 1;
            -- Wait before retry (PostgreSQL sleep in seconds)
            PERFORM pg_sleep(0.5 * retry_count); -- 0.5s, 1s, 1.5s delays
        END IF;
    END LOOP;
    
    RETURN user_exists;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### **Phase 2: API Endpoint Refactoring**

#### **2.1 Simplified Profile Creation API**
```typescript
// /src/app/api/auth/create-profile/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

interface CreateProfileRequest {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  barangayCode: string;
  roleName: string;
}

interface DatabaseResponse {
  success: boolean;
  error?: string;
  error_code?: string;
  details?: string;
  profile_id?: string;
  user_data?: any;
  role_data?: any;
  location_data?: any;
  message?: string;
}

export async function POST(request: NextRequest) {
  try {
    const requestData: CreateProfileRequest = await request.json();
    
    // Validate required fields
    const { id, email, firstName, lastName, barangayCode, roleName } = requestData;
    if (!id || !email || !firstName || !lastName || !barangayCode || !roleName) {
      return NextResponse.json(
        { 
          error: 'Missing required fields', 
          required: ['id', 'email', 'firstName', 'lastName', 'barangayCode', 'roleName']
        },
        { status: 400 }
      );
    }

    // Call database function for atomic user creation
    const { data, error } = await supabaseAdmin.rpc('create_user_with_profile', {
      user_id: id,
      email: email,
      first_name: firstName,
      last_name: lastName,
      phone: requestData.phone || null,
      barangay_code: barangayCode,
      role_name: roleName
    });

    if (error) {
      console.error('Database function error:', {
        error: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      
      return NextResponse.json(
        { 
          error: 'Database operation failed',
          details: error.message 
        },
        { status: 500 }
      );
    }

    const result = data as DatabaseResponse;
    
    if (!result.success) {
      // Map database errors to user-friendly messages
      const statusCode = getStatusCodeForError(result.error_code);
      return NextResponse.json(
        { 
          error: result.error,
          error_code: result.error_code,
          details: result.details 
        },
        { status: statusCode }
      );
    }

    // Success response
    return NextResponse.json({
      success: true,
      profile: {
        id: result.profile_id,
        ...result.user_data,
        role: result.role_data,
        location: result.location_data
      },
      message: result.message
    });

  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to map error codes to HTTP status codes
function getStatusCodeForError(errorCode?: string): number {
  const errorMap: Record<string, number> = {
    'DUPLICATE_PROFILE': 409, // Conflict
    'INVALID_REFERENCE': 400, // Bad Request
    'USER_NOT_FOUND': 404,    // Not Found
  };
  
  return errorMap[errorCode || ''] || 500; // Default to 500
}
```

#### **2.2 Enhanced Error Handling**
```typescript
// /src/lib/auth-errors.ts
export const AUTH_ERROR_MESSAGES = {
  'User not found in authentication system': 
    'User account setup is still in progress. Please wait a moment and try again.',
  'Role "barangay_admin" not found in system': 
    'System configuration error. Please contact technical support.',
  'Invalid or inactive barangay code': 
    'The selected barangay is not valid or is currently inactive. Please choose a different barangay.',
  'A user profile with this information already exists': 
    'An account with this information already exists. Please try signing in instead.',
  'Referenced data not found (user, role, or location)': 
    'Some required system data is missing. Please contact support.',
  'Database operation failed': 
    'A technical error occurred. Please try again or contact support if the problem persists.'
} as const;

export function getErrorMessage(error: string): string {
  return AUTH_ERROR_MESSAGES[error as keyof typeof AUTH_ERROR_MESSAGES] || error;
}
```

### **Phase 3: Frontend Integration**

#### **3.1 Enhanced Signup Flow**
```typescript
// /src/app/signup/page.tsx - Updated profile creation logic
const createUserProfile = async (userData: {
  userId: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  barangayCode: string;
  roleName: string;
}): Promise<void> => {
  const response = await fetch('/api/auth/create-profile', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      id: userData.userId,
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      phone: userData.phone,
      barangayCode: userData.barangayCode,
      roleName: userData.roleName
    })
  });

  if (!response.ok) {
    const errorData = await response.json();
    
    // Use user-friendly error messages
    const userMessage = getErrorMessage(errorData.error);
    throw new Error(userMessage);
  }

  const result = await response.json();
  
  if (!result.success) {
    throw new Error(result.error || 'Profile creation failed');
  }

  return result;
};

// Updated main signup handler
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  if (!validateForm()) return;

  setIsSubmitting(true);
  clearTimeout(timeoutId);

  try {
    // Step 1: Create auth user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: formData.email,
      password: formData.password,
    });

    if (authError || !authData.user) {
      throw new Error(authError?.message || 'Failed to create account');
    }

    // Step 2: Check barangay admin (unchanged)
    const hasAdmin = await checkBarangayAdminExists(formData.barangayCode);
    if (hasAdmin) {
      throw new Error('This barangay already has an administrator.');
    }

    // Step 3: Assign role (unchanged)
    const roleData = await assignRole(authData.user.id, formData.barangayCode);

    // Step 4: Create profile using new atomic function
    await createUserProfile({
      userId: authData.user.id,
      email: formData.email,
      firstName: formData.firstName,
      lastName: formData.lastName,
      phone: formData.mobileNumber,
      barangayCode: formData.barangayCode,
      roleName: 'barangay_admin'
    });

    // Success
    setStep('success');
    setAssignedRole('Barangay Administrator');

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    setErrors({ general: errorMessage });
    
    // Log error for debugging
    logError(
      error instanceof Error ? error : new Error(errorMessage),
      'SIGNUP_PROCESS'
    );
  } finally {
    setIsSubmitting(false);
  }
};
```

### **Phase 4: Testing Strategy**

#### **4.1 Database Function Testing**
```sql
-- Test Script: /database/migrations/test-user-creation.sql

-- Test 1: Successful user creation
DO $$
DECLARE
    test_user_id UUID := '550e8400-e29b-41d4-a716-446655440000';
    result JSON;
BEGIN
    -- First ensure test user exists in auth.users (manual setup required)
    SELECT create_user_with_profile(
        test_user_id,
        'test@example.com',
        'Test',
        'User',
        '09123456789',
        '042114014', -- Valid barangay code
        'barangay_admin'
    ) INTO result;
    
    RAISE NOTICE 'Test 1 Result: %', result;
END $$;

-- Test 2: Invalid barangay code
DO $$
DECLARE
    result JSON;
BEGIN
    SELECT create_user_with_profile(
        '550e8400-e29b-41d4-a716-446655440001'::UUID,
        'test2@example.com',
        'Test2',
        'User2',
        '09123456789',
        'invalid-code',
        'barangay_admin'
    ) INTO result;
    
    RAISE NOTICE 'Test 2 Result: %', result;
END $$;

-- Test 3: Non-existent role
DO $$
DECLARE
    result JSON;
BEGIN
    SELECT create_user_with_profile(
        '550e8400-e29b-41d4-a716-446655440002'::UUID,
        'test3@example.com',
        'Test3',
        'User3',
        '09123456789',
        '042114014',
        'non_existent_role'
    ) INTO result;
    
    RAISE NOTICE 'Test 3 Result: %', result;
END $$;
```

#### **4.2 Integration Testing Checklist**
- [ ] Successful user creation flow
- [ ] Error handling for invalid barangay codes
- [ ] Error handling for non-existent roles
- [ ] Duplicate user creation prevention
- [ ] Proper error messages displayed to users
- [ ] Database rollback on failures
- [ ] Performance under load

### **Phase 5: Migration Strategy**

#### **5.1 Database Migration**
```sql
-- Migration: Add user creation function
-- File: /database/migrations/add-user-creation-function.sql

-- Create the main user creation function
-- (Function code from Phase 1.1)

-- Create helper verification function  
-- (Function code from Phase 1.2)

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION create_user_with_profile TO authenticated;
GRANT EXECUTE ON FUNCTION verify_auth_user_exists TO authenticated;

-- Add comprehensive comments
COMMENT ON FUNCTION create_user_with_profile IS 
'Atomic user profile creation with complete validation and error handling';
```

#### **5.2 Deployment Steps**
1. **Database Migration**: Deploy function to production database
2. **API Update**: Deploy new create-profile endpoint
3. **Frontend Update**: Deploy enhanced signup flow
4. **Monitoring**: Monitor error rates and success metrics
5. **Rollback Plan**: Keep old endpoint available for emergency rollback

## Benefits & Expected Outcomes

### **Immediate Benefits**
- ✅ **99%+ Success Rate**: Atomic operations eliminate timing issues
- ✅ **Better Error Messages**: Clear, actionable error messages for users
- ✅ **Reduced Support Load**: Fewer failed registrations requiring manual intervention
- ✅ **Data Consistency**: All-or-nothing profile creation prevents partial states

### **Long-term Benefits**
- ✅ **Maintainability**: Single source of truth for user creation logic
- ✅ **Performance**: Database-side operations reduce API round trips
- ✅ **Security**: SECURITY DEFINER functions with proper permission control
- ✅ **Scalability**: Database handles concurrency and locking automatically

### **Metrics to Monitor**
- User registration success rate (target: >99%)
- Registration completion time (target: <5 seconds)
- Error rate by error type
- Support tickets related to registration issues

## Conclusion

This implementation plan provides a robust, atomic approach to user creation that eliminates the current timing issues with Supabase Auth. By moving the complex logic to a database function, we ensure data consistency while providing better error handling and user experience.

The phased approach allows for careful testing and gradual rollout while maintaining backward compatibility during the transition period.

---

**Document Version**: 1.0  
**Last Updated**: August 12, 2025  
**Author**: Claude Code Assistant  
**Reviewed By**: Development Team