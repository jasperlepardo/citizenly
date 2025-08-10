# Server-Side API Documentation

## Overview

The RBI System now implements a **server-side API layer** using Next.js API routes that sit between the frontend and Supabase. This architecture provides enhanced security, centralized data access control, and bypasses Row Level Security (RLS) limitations through service role authentication.

## 🏗️ Architecture

```
Frontend (Next.js) → Next.js API Routes → Supabase (Service Role) → PostgreSQL Database
                    ↓
            Bearer Token Authentication
                    ↓
        Centralized Authorization & Validation
                    ↓
            Service Role bypasses RLS
```

**Key Components:**

- **Next.js API Routes**: Server-side endpoints with service role access
- **Bearer Token Authentication**: JWT token validation from client sessions
- **Service Role Authentication**: Bypasses RLS for controlled data access
- **Centralized Validation**: Input validation and business logic
- **Error Handling**: Consistent error responses across all endpoints

## 🔐 Authentication Flow

### Client Authentication

```typescript
// Client-side: Get session token
const {
  data: { session },
} = await supabase.auth.getSession();

// Make authenticated API request
const response = await fetch('/api/residents', {
  method: 'GET',
  headers: {
    Authorization: `Bearer ${session.access_token}`,
    'Content-Type': 'application/json',
  },
});
```

### Server-side Token Validation

```typescript
// API route: Validate JWT token
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY! // Service role key
);

// Extract and validate token
const token = request.headers.get('authorization')?.replace('Bearer ', '');
const {
  data: { user },
  error,
} = await supabaseAdmin.auth.getUser(token);

if (error || !user) {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}
```

## 📊 API Endpoints

### Base URL

All API endpoints are available at: `${NEXT_PUBLIC_URL}/api/`

### 1. Authentication APIs

#### Get User Profile

```http
GET /api/auth/profile
Authorization: Bearer <jwt_token>
```

**Response:**

```json
{
  "profile": {
    "id": "uuid",
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "barangay_code": "137404001",
    "role_id": "role-uuid",
    "is_active": true,
    "created_at": "2024-01-01T00:00:00Z"
  },
  "role": {
    "id": "role-uuid",
    "name": "barangay_staff",
    "permissions": {
      "residents": "crud",
      "households": "read",
      "dashboard": "read"
    }
  }
}
```

### 2. Residents API

#### Get All Residents

```http
GET /api/residents?page=1&pageSize=20&search=juan
Authorization: Bearer <jwt_token>
```

**Query Parameters:**

- `page` (optional): Page number for pagination (default: 1)
- `pageSize` (optional): Number of records per page (default: 20)
- `search` (optional): Search term for name/email filtering

**Response:**

```json
{
  "data": [
    {
      "id": "uuid",
      "first_name": "Juan",
      "middle_name": "Santos",
      "last_name": "Dela Cruz",
      "birthdate": "1990-01-15",
      "sex": "male",
      "civil_status": "married",
      "barangay_code": "137404001",
      "household": {
        "code": "HH-2024-001",
        "address": "123 Main St"
      },
      "geographic_info": {
        "region_name": "Caraga",
        "province_name": "Surigao del Norte",
        "city_name": "Surigao City",
        "barangay_name": "Washington"
      }
    }
  ],
  "total": 150,
  "page": 1,
  "pageSize": 20,
  "totalPages": 8
}
```

#### Get Resident by ID

```http
GET /api/residents/{id}
Authorization: Bearer <jwt_token>
```

**Response:**

```json
{
  "resident": {
    "id": "uuid",
    "first_name": "Juan",
    "last_name": "Dela Cruz",
    "household": {
      "code": "HH-2024-001",
      "address": "123 Main St",
      "total_members": 4
    },
    "geographic_info": {
      "region_name": "Caraga",
      "province_name": "Surigao del Norte"
    }
  }
}
```

#### Create New Resident

```http
POST /api/residents
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "first_name": "Maria",
  "middle_name": "Garcia",
  "last_name": "Santos",
  "birthdate": "1985-05-20",
  "sex": "female",
  "civil_status": "single",
  "citizenship": "filipino",
  "mobile_number": "09171234567",
  "barangay_code": "137404001",
  "education_level": "college",
  "employment_status": "employed"
}
```

**Response:**

```json
{
  "resident": {
    "id": "new-uuid",
    "first_name": "Maria",
    "last_name": "Santos",
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

#### Update Resident

```http
PUT /api/residents/{id}
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "mobile_number": "09187654321",
  "email": "maria.santos@email.com"
}
```

### 3. Households API

#### Get All Households

```http
GET /api/households?search=main
Authorization: Bearer <jwt_token>
```

**Response:**

```json
{
  "data": [
    {
      "id": "uuid",
      "code": "HH-2024-001",
      "address": "123 Main Street",
      "barangay_code": "137404001",
      "total_members": 4,
      "household_head": {
        "id": "uuid",
        "first_name": "Juan",
        "last_name": "Dela Cruz"
      },
      "geographic_info": {
        "region_name": "Caraga",
        "province_name": "Surigao del Norte",
        "city_name": "Surigao City",
        "barangay_name": "Washington"
      }
    }
  ],
  "total": 45
}
```

#### Get Household by ID

```http
GET /api/households/{id}
Authorization: Bearer <jwt_token>
```

**Response:**

```json
{
  "household": {
    "id": "uuid",
    "code": "HH-2024-001",
    "address": "123 Main Street",
    "total_members": 4,
    "members": [
      {
        "id": "uuid",
        "first_name": "Juan",
        "last_name": "Dela Cruz",
        "relationship_to_head": "head",
        "age": 34
      },
      {
        "id": "uuid",
        "first_name": "Maria",
        "last_name": "Dela Cruz",
        "relationship_to_head": "spouse",
        "age": 32
      }
    ]
  }
}
```

#### Create New Household

```http
POST /api/households
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "household": {
    "household_type": "nuclear",
    "monthly_income": 25000,
    "address": "456 Oak Street",
    "barangay_code": "137404001",
    "contact_number": "09171234567",
    "email": "household@email.com"
  },
  "residents": [
    {
      "first_name": "Pedro",
      "last_name": "Santos",
      "relationship_to_head": "head",
      "birthdate": "1980-03-15",
      "sex": "male",
      "civil_status": "married"
    }
  ]
}
```

#### Update Household

```http
PUT /api/households/{id}
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "address": "789 New Address",
  "contact_number": "09187654321"
}
```

### 4. Dashboard API

#### Get Dashboard Statistics

```http
GET /api/dashboard/stats
Authorization: Bearer <jwt_token>
```

**Response:**

```json
{
  "stats": {
    "residents": 1250,
    "households": 320,
    "senior_citizens": 145,
    "pwd": 78,
    "voters": 890,
    "labor_force": 650,
    "employed": 580,
    "unemployed": 70,
    "out_of_school_youth": 25
  },
  "residentsData": [
    {
      "age": 25,
      "sex": "male",
      "civil_status": "single",
      "employment_status": "employed"
    }
  ]
}
```

### 5. Address Hierarchy APIs

#### Get Regions

```http
GET /api/addresses/regions
Authorization: Bearer <jwt_token>
```

#### Get Provinces by Region

```http
GET /api/addresses/provinces?region_code=13
Authorization: Bearer <jwt_token>
```

#### Get Cities by Province

```http
GET /api/addresses/cities?province_code=1374
Authorization: Bearer <jwt_token>
```

#### Search Barangays

```http
GET /api/addresses/barangays?search=washington
Authorization: Bearer <jwt_token>
```

**Response:**

```json
{
  "barangays": [
    {
      "code": "137404001",
      "name": "Washington",
      "city_name": "Surigao City",
      "province_name": "Surigao del Norte",
      "region_name": "Caraga"
    }
  ]
}
```

### 6. Admin APIs

#### Create Admin User

```http
POST /api/admin/users
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "securepassword",
  "firstName": "Admin",
  "lastName": "User",
  "barangayCode": "137404001",
  "roleId": "admin-role-uuid"
}
```

**Response:**

```json
{
  "user": {
    "id": "new-uuid",
    "email": "admin@example.com",
    "created_at": "2024-01-01T00:00:00Z"
  },
  "profile": {
    "id": "profile-uuid",
    "user_id": "new-uuid",
    "first_name": "Admin",
    "last_name": "User",
    "barangay_code": "137404001"
  }
}
```

## 🚨 Error Handling

### Standard Error Response Format

```json
{
  "error": "Error message",
  "code": "ERROR_CODE",
  "details": "Additional error details"
}
```

### Common HTTP Status Codes

- **200**: Success
- **201**: Created successfully
- **400**: Bad request (validation error)
- **401**: Unauthorized (invalid/missing token)
- **403**: Forbidden (insufficient permissions)
- **404**: Not found
- **500**: Internal server error

### Error Examples

#### Validation Error (400)

```json
{
  "error": "Validation failed",
  "details": "First name is required"
}
```

#### Unauthorized (401)

```json
{
  "error": "Unauthorized",
  "details": "Invalid or expired token"
}
```

#### Not Found (404)

```json
{
  "error": "Resident not found",
  "details": "No resident found with ID: xyz"
}
```

## 🔧 Implementation Details

### Service Role Configuration

API routes use the Supabase service role key for database access:

```typescript
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY! // Service role - bypasses RLS
);
```

### Request Validation

All endpoints validate the JWT token from the Authorization header:

```typescript
// Extract token
const authHeader = request.headers.get('authorization');
const token = authHeader?.replace('Bearer ', '');

if (!token) {
  return NextResponse.json({ error: 'Authorization required' }, { status: 401 });
}

// Validate token
const {
  data: { user },
  error,
} = await supabaseAdmin.auth.getUser(token);
if (error || !user) {
  return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
}
```

### Geographic Data Enrichment

Most endpoints automatically include geographic information:

```typescript
// Enrich with geographic data
const enrichWithGeographicInfo = (data: any[], userBarangayCode: string) => {
  return data.map(item => ({
    ...item,
    geographic_info: {
      region_name: item.psgc_regions?.name || 'Unknown Region',
      province_name: item.psgc_provinces?.name || 'Unknown Province',
      city_name: item.psgc_cities?.name || 'Unknown City',
      barangay_name: item.psgc_barangays?.name || 'Unknown Barangay',
    },
  }));
};
```

### Pagination Support

List endpoints support pagination with consistent parameters:

```typescript
// Extract pagination parameters
const url = new URL(request.url);
const page = parseInt(url.searchParams.get('page') || '1', 10);
const pageSize = Math.min(parseInt(url.searchParams.get('pageSize') || '20', 10), 100);
const offset = (page - 1) * pageSize;

// Apply to query
query = query.range(offset, offset + pageSize - 1);
```

## 🔒 Security Features

### 1. Service Role Access Control

- API routes use service role to bypass RLS
- User authentication still required via JWT validation
- Barangay-level filtering applied in application logic

### 2. Input Validation

```typescript
// Example validation middleware
const validateResidentData = (data: any) => {
  if (!data.first_name || data.first_name.length < 2) {
    throw new Error('First name must be at least 2 characters');
  }
  if (!data.birthdate || !isValidDate(data.birthdate)) {
    throw new Error('Valid birthdate is required');
  }
  // Additional validations...
};
```

### 3. Barangay Access Control

```typescript
// Ensure users can only access their barangay's data
const userProfile = await getUserProfile(user.id);
const userBarangayCode = userProfile.barangay_code;

// Filter queries by user's barangay
query = query.eq('barangay_code', userBarangayCode);
```

## 🚀 Performance Optimizations

### 1. Database Query Optimization

- Select only required fields
- Use joins for related data
- Apply filters early in the query chain

### 2. Response Caching

```typescript
// Cache headers for static data
if (request.method === 'GET' && isStaticData) {
  return new NextResponse(JSON.stringify(data), {
    headers: {
      'Cache-Control': 'public, max-age=300', // 5 minutes
      'Content-Type': 'application/json',
    },
  });
}
```

### 3. Connection Pooling

- Single Supabase client instance per API route
- Reuse connections across requests

## 📊 Monitoring & Logging

### Request Logging

```typescript
console.log(`[${new Date().toISOString()}] ${request.method} ${pathname}`, {
  userId: user.id,
  userBarangayCode,
  queryParams: Object.fromEntries(url.searchParams),
});
```

### Error Logging

```typescript
console.error('API Error:', {
  endpoint: pathname,
  method: request.method,
  error: error.message,
  userId: user?.id,
  timestamp: new Date().toISOString(),
});
```

## 🔄 Migration from Direct Supabase Queries

### Before (Direct Supabase)

```typescript
// Client-side direct query (problematic with RLS)
const { data: residents, error } = await supabase
  .from('residents')
  .select('*')
  .eq('barangay_code', userBarangayCode);
```

### After (Server-side API)

```typescript
// Client-side API call
const response = await fetch('/api/residents', {
  headers: {
    Authorization: `Bearer ${session.access_token}`,
  },
});
const { data: residents } = await response.json();
```

## 📚 Best Practices

### 1. Error Handling

- Always return consistent error formats
- Log errors with sufficient context
- Use appropriate HTTP status codes

### 2. Security

- Validate all input parameters
- Use service role judiciously
- Apply barangay-level filtering consistently

### 3. Performance

- Implement pagination for list endpoints
- Select only required fields
- Use database joins instead of multiple queries

### 4. Maintainability

- Extract common validation logic
- Use TypeScript for type safety
- Document endpoint requirements clearly

---

This server-side API architecture provides a secure, scalable foundation for the RBI System while maintaining compatibility with the existing frontend components.
