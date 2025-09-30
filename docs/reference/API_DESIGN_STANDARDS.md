# API Design Standards

> **RESTful API patterns and standards for the Citizenly project**
> 
> This document defines the standards and best practices for designing and implementing APIs in the Citizenly platform.

## 📖 Table of Contents

1. [🎯 API Design Principles](#-api-design-principles)
2. [🔗 URL Structure](#-url-structure)
3. [📨 HTTP Methods](#-http-methods)
4. [📦 Request & Response Format](#-request--response-format)
5. [🔢 Status Codes](#-status-codes)
6. [📄 Pagination](#-pagination)
7. [🔍 Filtering & Sorting](#-filtering--sorting)
8. [❌ Error Handling](#-error-handling)
9. [🔐 Authentication](#-authentication)
10. [📚 API Documentation](#-api-documentation)

---

## 🎯 API Design Principles

### **Core Principles**
- **Consistent**: Uniform patterns across all endpoints
- **Predictable**: Intuitive resource naming and behavior
- **Versioned**: Clear versioning strategy (when needed)
- **Secure**: Authentication and authorization built-in
- **Documented**: Self-documenting with TypeScript
- **Performant**: Optimized queries and response times

### **RESTful Guidelines**
- Use nouns for resources, not verbs
- Use HTTP methods to indicate actions
- Maintain statelessness
- Return appropriate status codes
- Support content negotiation
- Implement HATEOAS where beneficial

---

## 🔗 URL Structure

### **URL Patterns**
```
/api/{resource}              # Collection
/api/{resource}/{id}         # Specific resource
/api/{resource}/{id}/{sub}   # Sub-resource
```

### **Examples**
```typescript
// ✅ Good URL patterns
GET    /api/residents                 # List all residents
GET    /api/residents/123             # Get specific resident
POST   /api/residents                 # Create resident
PUT    /api/residents/123             # Update resident
DELETE /api/residents/123             # Delete resident
GET    /api/residents/123/household   # Get resident's household

// ❌ Avoid
GET    /api/getResidents              # Don't use verbs
POST   /api/residents/create          # Method already indicates action
GET    /api/resident-list             # Use plural for collections
```

### **Nested Resources**
```typescript
// When relationship is clear and bounded
GET /api/households/123/members       # Household members
GET /api/barangays/456/residents      # Barangay residents

// When relationship is complex or unbounded
GET /api/residents?household_id=123   # Filter by household
GET /api/residents?barangay_code=456  # Filter by barangay
```

---

## 📨 HTTP Methods

### **Method Usage**
| Method | Purpose | Idempotent | Safe |
|--------|---------|------------|------|
| GET | Retrieve resource(s) | Yes | Yes |
| POST | Create new resource | No | No |
| PUT | Full update/replace | Yes | No |
| PATCH | Partial update | No | No |
| DELETE | Remove resource | Yes | No |
| HEAD | Get headers only | Yes | Yes |
| OPTIONS | Get allowed methods | Yes | Yes |

### **Implementation Examples**
```typescript
// GET - Retrieve resources
export async function GET(request: Request) {
  const residents = await db.residents.findMany();
  return Response.json({ data: residents });
}

// POST - Create resource
export async function POST(request: Request) {
  const body = await request.json();
  const validated = residentSchema.parse(body);
  const resident = await db.residents.create(validated);
  return Response.json({ data: resident }, { status: 201 });
}

// PUT - Full update
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const body = await request.json();
  const validated = residentSchema.parse(body);
  const updated = await db.residents.update(params.id, validated);
  return Response.json({ data: updated });
}

// PATCH - Partial update
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  const body = await request.json();
  const validated = partialResidentSchema.parse(body);
  const updated = await db.residents.update(params.id, validated);
  return Response.json({ data: updated });
}

// DELETE - Remove resource
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  await db.residents.delete(params.id);
  return new Response(null, { status: 204 });
}
```

---

## 📦 Request & Response Format

### **Request Format**
```typescript
// Request headers
{
  "Content-Type": "application/json",
  "Authorization": "Bearer {token}",
  "X-Request-ID": "uuid-v4"
}

// Request body (POST/PUT/PATCH)
{
  "firstName": "Juan",
  "lastName": "Dela Cruz",
  "email": "juan@example.com",
  "barangayCode": "123456"
}
```

### **Response Format**
```typescript
// Success response
interface ApiResponse<T> {
  data: T;
  message?: string;
  metadata?: {
    timestamp: string;
    version: string;
  };
}

// Paginated response
interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Error response
interface ErrorResponse {
  error: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
  path: string;
}
```

### **Response Examples**
```typescript
// Single resource
{
  "data": {
    "id": "123",
    "firstName": "Juan",
    "lastName": "Dela Cruz",
    "email": "juan@example.com",
    "createdAt": "2024-01-15T10:00:00Z",
    "updatedAt": "2024-01-15T10:00:00Z"
  },
  "message": "Resident retrieved successfully"
}

// Collection with pagination
{
  "data": [
    { "id": "1", "name": "Resident 1" },
    { "id": "2", "name": "Resident 2" }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}

// Error response
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "firstName": "First name is required",
      "email": "Invalid email format"
    }
  },
  "timestamp": "2024-01-15T10:00:00Z",
  "path": "/api/residents"
}
```

---

## 🔢 Status Codes

### **Success Codes**
| Code | Meaning | Usage |
|------|---------|-------|
| 200 | OK | Successful GET, PUT, PATCH |
| 201 | Created | Successful POST |
| 204 | No Content | Successful DELETE |
| 206 | Partial Content | Paginated results |

### **Client Error Codes**
| Code | Meaning | Usage |
|------|---------|-------|
| 400 | Bad Request | Invalid request data |
| 401 | Unauthorized | Missing/invalid auth |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate or conflict |
| 422 | Unprocessable | Validation errors |
| 429 | Too Many Requests | Rate limit exceeded |

### **Server Error Codes**
| Code | Meaning | Usage |
|------|---------|-------|
| 500 | Internal Error | Server error |
| 502 | Bad Gateway | Upstream error |
| 503 | Service Unavailable | Maintenance/overload |
| 504 | Gateway Timeout | Upstream timeout |

### **Implementation**
```typescript
// Status code usage examples
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Validation error - 422
    const validation = residentSchema.safeParse(body);
    if (!validation.success) {
      return Response.json(
        { error: { code: 'VALIDATION_ERROR', details: validation.error } },
        { status: 422 }
      );
    }
    
    // Check for duplicates - 409
    const existing = await db.residents.findByEmail(body.email);
    if (existing) {
      return Response.json(
        { error: { code: 'DUPLICATE_EMAIL', message: 'Email already exists' } },
        { status: 409 }
      );
    }
    
    // Success - 201
    const resident = await db.residents.create(validation.data);
    return Response.json(
      { data: resident, message: 'Resident created successfully' },
      { status: 201 }
    );
    
  } catch (error) {
    // Server error - 500
    return Response.json(
      { error: { code: 'SERVER_ERROR', message: 'Internal server error' } },
      { status: 500 }
    );
  }
}
```

---

## 📄 Pagination

### **Query Parameters**
```typescript
// Pagination parameters
interface PaginationParams {
  page?: number;    // Page number (default: 1)
  limit?: number;   // Items per page (default: 20, max: 100)
  cursor?: string;  // Cursor for cursor-based pagination
}

// Usage
GET /api/residents?page=2&limit=20
GET /api/residents?cursor=eyJpZCI6MTIzfQ==
```

### **Implementation**
```typescript
export async function GET(request: Request) {
  const url = new URL(request.url);
  const page = parseInt(url.searchParams.get('page') || '1');
  const limit = Math.min(
    parseInt(url.searchParams.get('limit') || '20'),
    100 // Max limit
  );
  const offset = (page - 1) * limit;
  
  // Get total count
  const total = await db.residents.count();
  
  // Get paginated data
  const residents = await db.residents.findMany({
    skip: offset,
    take: limit,
    orderBy: { createdAt: 'desc' }
  });
  
  return Response.json({
    data: residents,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1
    }
  });
}
```

---

## 🔍 Filtering & Sorting

### **Filter Parameters**
```typescript
// Filter syntax
GET /api/residents?status=active
GET /api/residents?age_gte=18&age_lte=65
GET /api/residents?barangay_code=123456
GET /api/residents?search=juan

// Multiple values
GET /api/residents?status=active,pending
GET /api/residents?barangay_code=123456,789012
```

### **Sort Parameters**
```typescript
// Sort syntax
GET /api/residents?sort=lastName         // Ascending
GET /api/residents?sort=-createdAt       // Descending
GET /api/residents?sort=lastName,-age    // Multiple fields
```

### **Implementation**
```typescript
export async function GET(request: Request) {
  const url = new URL(request.url);
  
  // Build filter object
  const filters: any = {};
  
  // Status filter
  const status = url.searchParams.get('status');
  if (status) {
    filters.status = { in: status.split(',') };
  }
  
  // Age range filter
  const ageGte = url.searchParams.get('age_gte');
  const ageLte = url.searchParams.get('age_lte');
  if (ageGte || ageLte) {
    filters.age = {};
    if (ageGte) filters.age.gte = parseInt(ageGte);
    if (ageLte) filters.age.lte = parseInt(ageLte);
  }
  
  // Search filter
  const search = url.searchParams.get('search');
  if (search) {
    filters.OR = [
      { firstName: { contains: search, mode: 'insensitive' } },
      { lastName: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } }
    ];
  }
  
  // Build sort object
  const sort = url.searchParams.get('sort');
  const orderBy = sort ? 
    sort.split(',').map(field => ({
      [field.replace('-', '')]: field.startsWith('-') ? 'desc' : 'asc'
    })) : 
    [{ createdAt: 'desc' }];
  
  // Query with filters and sorting
  const residents = await db.residents.findMany({
    where: filters,
    orderBy
  });
  
  return Response.json({ data: residents });
}
```

---

## ❌ Error Handling

### **Error Response Structure**
```typescript
interface ApiError {
  error: {
    code: string;           // Machine-readable error code
    message: string;        // Human-readable message
    details?: any;          // Additional error details
    field?: string;         // Field that caused error
    timestamp: string;      // When error occurred
    requestId?: string;     // Request tracking ID
  };
}
```

### **Error Codes**
```typescript
enum ErrorCode {
  // Validation errors
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  REQUIRED_FIELD = 'REQUIRED_FIELD',
  INVALID_FORMAT = 'INVALID_FORMAT',
  
  // Authentication errors
  UNAUTHORIZED = 'UNAUTHORIZED',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  INVALID_TOKEN = 'INVALID_TOKEN',
  
  // Authorization errors
  FORBIDDEN = 'FORBIDDEN',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  
  // Resource errors
  NOT_FOUND = 'NOT_FOUND',
  ALREADY_EXISTS = 'ALREADY_EXISTS',
  CONFLICT = 'CONFLICT',
  
  // Server errors
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  EXTERNAL_SERVICE_ERROR = 'EXTERNAL_SERVICE_ERROR'
}
```

### **Error Handler**
```typescript
export function handleApiError(error: unknown): Response {
  console.error('API Error:', error);
  
  // Zod validation error
  if (error instanceof z.ZodError) {
    return Response.json(
      {
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid input data',
          details: error.errors.map(e => ({
            field: e.path.join('.'),
            message: e.message
          }))
        }
      },
      { status: 422 }
    );
  }
  
  // Database error
  if (error instanceof PrismaError) {
    if (error.code === 'P2002') {
      return Response.json(
        {
          error: {
            code: 'ALREADY_EXISTS',
            message: 'Resource already exists',
            field: error.meta?.target
          }
        },
        { status: 409 }
      );
    }
  }
  
  // Default error
  return Response.json(
    {
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred'
      }
    },
    { status: 500 }
  );
}
```

---

## 🔐 Authentication

### **Authentication Headers**
```typescript
// Bearer token authentication
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

// API key authentication (for external services)
{
  "X-API-Key": "sk_live_..."
}
```

### **Protected Route Implementation**
```typescript
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  // Get authentication
  const supabase = createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  
  // Check authentication
  if (!user || error) {
    return Response.json(
      { error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
      { status: 401 }
    );
  }
  
  // Check authorization
  const userProfile = await getUserProfile(user.id);
  if (userProfile.role !== 'barangay_admin') {
    return Response.json(
      { error: { code: 'FORBIDDEN', message: 'Insufficient permissions' } },
      { status: 403 }
    );
  }
  
  // Process authorized request
  const residents = await getResidentsByBarangay(userProfile.barangayCode);
  return Response.json({ data: residents });
}
```

---

## 📚 API Documentation

### **TypeScript Types as Documentation**
```typescript
// API route types
export interface ResidentAPI {
  // GET /api/residents
  list(params: {
    page?: number;
    limit?: number;
    status?: string;
    barangayCode?: string;
  }): Promise<PaginatedResponse<Resident>>;
  
  // GET /api/residents/:id
  get(id: string): Promise<ApiResponse<Resident>>;
  
  // POST /api/residents
  create(data: CreateResidentDto): Promise<ApiResponse<Resident>>;
  
  // PUT /api/residents/:id
  update(id: string, data: UpdateResidentDto): Promise<ApiResponse<Resident>>;
  
  // DELETE /api/residents/:id
  delete(id: string): Promise<void>;
}
```

### **OpenAPI Specification**
```yaml
openapi: 3.0.0
info:
  title: Citizenly API
  version: 1.0.0
  description: Barangay management system API

paths:
  /api/residents:
    get:
      summary: List residents
      parameters:
        - name: page
          in: query
          schema:
            type: integer
            default: 1
        - name: limit
          in: query
          schema:
            type: integer
            default: 20
            maximum: 100
      responses:
        200:
          description: Successful response
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/ResidentList'
        401:
          $ref: '#/components/responses/Unauthorized'
```

### **API Route Comments**
```typescript
/**
 * @route GET /api/residents
 * @description Get paginated list of residents
 * @access Protected - Barangay Admin
 * @query {number} [page=1] - Page number
 * @query {number} [limit=20] - Items per page
 * @query {string} [status] - Filter by status
 * @returns {PaginatedResponse<Resident>} Paginated residents
 */
export async function GET(request: Request) {
  // Implementation
}
```

---

## 🎯 Best Practices

### **Do's**
- ✅ Use consistent naming conventions
- ✅ Return appropriate status codes
- ✅ Implement proper error handling
- ✅ Validate all input data
- ✅ Use pagination for large datasets
- ✅ Include request IDs for tracking
- ✅ Document all endpoints
- ✅ Version APIs when breaking changes occur

### **Don'ts**
- ❌ Don't expose internal errors to clients
- ❌ Don't return sensitive data in errors
- ❌ Don't use verbs in resource URLs
- ❌ Don't ignore HTTP method semantics
- ❌ Don't skip input validation
- ❌ Don't return large unpaginated datasets
- ❌ Don't break existing APIs without versioning

---

💡 **Remember**: Good API design makes integration easy for consumers and maintenance simple for developers. Consistency is key.

🔗 **Related Documentation**: 
- [Architecture Overview](./ARCHITECTURE_OVERVIEW.md) for system design
- [Security Guidelines](./SECURITY_GUIDELINES.md) for API security
- [Testing Strategy](./TESTING_STRATEGY.md) for API testing approaches