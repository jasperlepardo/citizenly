# Citizenly API Documentation

![API Version](https://img.shields.io/badge/API%20Version-1.0-blue)
![Status](https://img.shields.io/badge/Status-Production%20Ready-green)
![Auth](https://img.shields.io/badge/Auth-Bearer%20Token-orange)

## Overview

The Citizenly API provides comprehensive barangay management capabilities including resident registration, household management, geographic data services, and administrative functions. Built with Next.js App Router, TypeScript, and Supabase.

**Base URL**: `https://your-domain.com/api`

## Quick Start

```bash
# Authentication required for most endpoints
curl -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     https://your-domain.com/api/residents
```

## Table of Contents

- [Authentication & Security](#authentication--security)
- [Authentication & User Management](#authentication--user-management)
- [Geographic Data (PSGC)](#geographic-data-psgc)
- [Residents Management](#residents-management)
- [Households Management](#households-management)
- [Admin Operations](#admin-operations)
- [Dashboard & Analytics](#dashboard--analytics)
- [Utility & Health Checks](#utility--health-checks)
- [Occupation Search (PSOC)](#occupation-search-psoc)
- [User Location Services](#user-location-services)
- [Error Handling](#error-handling)
- [Rate Limiting](#rate-limiting)

---

## Authentication & Security

### Authentication Methods

| Method | Usage | Format |
|--------|-------|--------|
| **Bearer Token** | Most endpoints | `Authorization: Bearer <jwt_token>` |
| **Service Role** | Internal operations | Supabase service role key |
| **Webhook Signatures** | Webhook endpoints | HMAC signature verification |
| **Admin Role** | Admin operations | Role-based access control |

### Geographic Access Control

The API implements hierarchical geographic access control:

- **Barangay Level**: Users access only their assigned barangay
- **City/Province/Region**: Higher-level users have broader access
- **National Level**: Full system access
- **RLS (Row Level Security)**: Automatic data filtering based on user permissions

### Rate Limiting

| Endpoint Category | Limit | Window |
|-------------------|-------|---------|
| Dashboard APIs | 30 requests | 1 minute |
| Logging APIs | 100 entries | 1 minute per IP |
| General APIs | Variable | Based on endpoint |

---

## Authentication & User Management

### Assign Role
```http
POST /api/auth/assign-role
```

Assigns barangay admin role to users.

**Authentication**: Service role (admin only)

**Request Body**:
```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "barangayCode": "097332001"
}
```

**Response**:
```json
{
  "success": true,
  "roleId": "uuid",
  "message": "Role assigned successfully"
}
```

---

### Check Barangay Admin
```http
POST /api/auth/check-barangay-admin
```

Checks if a barangay already has an administrator.

**Request Body**:
```json
{
  "barangayCode": "097332001"
}
```

**Response**:
```json
{
  "hasAdmin": false
}
```

---

### Create Profile
```http
POST /api/auth/create-profile
```

Creates user profile after account creation.

**Request Body**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "first_name": "Juan",
  "last_name": "Cruz",
  "role_id": "role-uuid",
  "barangay_code": "097332001"
}
```

---

### Get User Profile
```http
GET /api/auth/profile
```

Retrieves authenticated user's complete profile.

**Headers**:
```http
Authorization: Bearer your_jwt_token
```

**Response**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "first_name": "Juan",
  "last_name": "Cruz",
  "barangay_code": "097332001",
  "role": {
    "name": "barangay_admin",
    "permissions": {
      "residents": ["create", "read", "update", "delete"],
      "households": ["create", "read", "update"]
    }
  }
}
```

---

### Authentication Webhook
```http
POST /api/auth/webhook
```

Handles Supabase authentication webhooks for user lifecycle management.

**Features**:
- Email confirmation handling
- Address hierarchy completion
- Welcome notification queuing
- User lifecycle management

---

## Geographic Data (PSGC)

### List Regions
```http
GET /api/addresses/regions
```

Lists all Philippine regions.

**Authentication**: None (public data)

**Response**:
```json
[
  {
    "value": "130000000",
    "label": "National Capital Region (NCR)"
  },
  {
    "value": "010000000", 
    "label": "Region I (Ilocos Region)"
  }
]
```

---

### List Provinces
```http
GET /api/addresses/provinces?region=130000000
```

Lists provinces, optionally filtered by region.

**Query Parameters**:
- `region` (optional): Filter by region code

**Response**:
```json
[
  {
    "code": "137500000",
    "name": "Metro Manila",
    "region_code": "130000000"
  }
]
```

---

### List Cities/Municipalities
```http
GET /api/addresses/cities?province=137500000
```

Lists cities and municipalities.

**Query Parameters**:
- `province` (optional): Filter by province code

**Response**:
```json
[
  {
    "code": "137404000",
    "name": "Pasig City",
    "type": "City",
    "province_code": "137500000"
  }
]
```

---

### List Barangays
```http
GET /api/addresses/barangays?city=137404000
```

Lists barangays within a city.

**Query Parameters**:
- `city` (optional): Filter by city code

**Response**:
```json
[
  {
    "code": "137404001",
    "name": "Bagong Ilog",
    "city_municipality_code": "137404000"
  }
]
```

---

### PSGC Lookup
```http
GET /api/psgc/lookup?code=137404001
```

Looks up complete geographic hierarchy by PSGC code.

**Query Parameters**:
- `code` (required): PSGC code (2-9+ digits)

**Features**:
- Auto-detects geographic level by code format
- Returns complete hierarchy with parent relationships

**Response**:
```json
{
  "level": "barangay",
  "data": {
    "barangay": {
      "code": "137404001", 
      "name": "Bagong Ilog"
    },
    "city": {
      "code": "137404000",
      "name": "Pasig City",
      "type": "City"
    },
    "province": {
      "code": "137500000", 
      "name": "Metro Manila"
    },
    "region": {
      "code": "130000000",
      "name": "National Capital Region (NCR)"
    }
  },
  "full_address": "Bagong Ilog, Pasig City, Metro Manila, NCR"
}
```

---

### PSGC Search
```http
GET /api/psgc/search?q=pasig&levels=city,barangay&limit=10
```

Advanced fuzzy search across all geographic levels.

**Query Parameters**:
- `q` (required): Search query (min 2 characters)
- `levels` (optional): Comma-separated levels or 'all' (region, province, city, barangay)
- `limit` (optional): Max results (default 20, max 100)
- `offset` (optional): Pagination offset

**Features**:
- Fuzzy matching with variations
- Common abbreviation handling (QC → Quezon City)
- Hierarchical search (find barangays by province name)
- Intelligent relevance sorting

**Response**:
```json
{
  "results": [
    {
      "level": "city",
      "match_type": "exact",
      "score": 1.0,
      "data": {
        "code": "137404000",
        "name": "Pasig City",
        "type": "City",
        "hierarchy": {
          "region": "National Capital Region (NCR)",
          "province": "Metro Manila"
        }
      }
    }
  ],
  "pagination": {
    "total": 1,
    "limit": 10,
    "offset": 0,
    "has_more": false
  }
}
```

---

## Residents Management

### List Residents
```http
GET /api/residents?page=1&pageSize=20&search=juan
```

Lists residents with pagination, search, and filtering.

**Headers**:
```http
Authorization: Bearer your_jwt_token
```

**Query Parameters**:
- `page` (optional): Page number (default: 1)
- `pageSize` (optional): Results per page (default: 20, max: 100)
- `search` (optional): Search by name or email

**Response**:
```json
{
  "residents": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "first_name": "Juan",
      "last_name": "Cruz", 
      "email": "juan@example.com",
      "household": {
        "code": "HHLD-001",
        "address": "123 Main St"
      },
      "sectoral": {
        "is_senior_citizen": false,
        "is_person_with_disability": false,
        "is_solo_parent": false
      },
      "geography": {
        "barangay_name": "Bagong Ilog",
        "city_name": "Pasig City"
      }
    }
  ],
  "pagination": {
    "total": 150,
    "page": 1,
    "pageSize": 20,
    "totalPages": 8,
    "hasNext": true,
    "hasPrev": false
  }
}
```

---

### Create Resident
```http
POST /api/residents
```

Creates a new resident with complete profile.

**Headers**:
```http
Authorization: Bearer your_jwt_token
Content-Type: application/json
```

**Request Body**:
```json
{
  "first_name": "Maria",
  "middle_name": "Santos",
  "last_name": "Cruz",
  "extension_name": null,
  "birthdate": "1990-05-15",
  "sex": "female",
  "civil_status": "single",
  "mobile_number": "09171234567",
  "email": "maria@example.com",
  "household_code": "HHLD-001",
  "sectoral_info": {
    "is_senior_citizen": false,
    "is_person_with_disability": false,
    "is_solo_parent": false,
    "is_indigenous_people": false,
    "is_overseas_filipino_worker": false,
    "is_migrant": false
  },
  "migration_info": {
    "previous_barangay_code": "097332002",
    "date_of_transfer": "2023-01-15",
    "reason_for_migration": "Family relocation"
  }
}
```

**Response**:
```json
{
  "success": true,
  "resident": {
    "id": "550e8400-e29b-41d4-a716-446655440001",
    "first_name": "Maria",
    "last_name": "Cruz",
    "created_at": "2024-01-15T10:30:00Z"
  }
}
```

---

### Get Resident Details
```http
GET /api/residents/550e8400-e29b-41d4-a716-446655440000
```

Gets complete resident profile with all related data.

**Response**:
```json
{
  "resident": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "first_name": "Juan",
    "middle_name": "Santos", 
    "last_name": "Cruz",
    "birthdate": "1985-03-20",
    "sex": "male",
    "civil_status": "married",
    "mobile_number": "09171234567",
    "email": "juan@example.com",
    "household": {
      "code": "HHLD-001",
      "house_number": "123",
      "street_name": "Main Street",
      "full_address": "123 Main St, Bagong Ilog, Pasig City"
    },
    "geography": {
      "barangay": {"code": "137404001", "name": "Bagong Ilog"},
      "city": {"code": "137404000", "name": "Pasig City"},
      "province": {"code": "137500000", "name": "Metro Manila"},
      "region": {"code": "130000000", "name": "NCR"}
    },
    "sectoral": {
      "is_senior_citizen": false,
      "is_person_with_disability": false,
      "is_solo_parent": false,
      "is_indigenous_people": false,
      "is_overseas_filipino_worker": false,
      "is_migrant": true
    },
    "migration": {
      "previous_barangay": "San Antonio",
      "date_of_transfer": "2023-01-15",
      "reason": "Family relocation"
    },
    "birth_place": {
      "name": "Manila City",
      "full_name": "Manila City, Metro Manila, NCR"
    },
    "occupation": {
      "title": "Software Engineer",
      "unit_group": "Information and Communications Technology Professionals"
    }
  }
}
```

---

### Update Resident
```http
PUT /api/residents/550e8400-e29b-41d4-a716-446655440000
```

Updates resident information including sectoral data.

**Request Body**: Same structure as create, with updated fields

**Features**:
- Separate handling of resident data vs sectoral information
- Upsert logic for sectoral information
- Complete record return after update

---

### Delete Resident
```http
DELETE /api/residents/550e8400-e29b-41d4-a716-446655440000
```

Soft delete resident (sets is_active = false).

**Response**:
```json
{
  "success": true,
  "message": "Resident deactivated successfully",
  "resident": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "full_name": "Juan Santos Cruz",
    "is_active": false
  }
}
```

---

### Bulk Operations
```http
POST /api/residents/bulk
```

Performs bulk operations on multiple residents.

**Request Body**:
```json
{
  "operation": "delete",
  "resident_ids": [
    "550e8400-e29b-41d4-a716-446655440000",
    "550e8400-e29b-41d4-a716-446655440001"
  ],
  "data": {}
}
```

**Supported Operations**:
- `delete`: Bulk soft delete
- `activate`: Bulk activate
- `deactivate`: Bulk deactivate  
- `update_sectoral`: Bulk sectoral updates

**Limits**: Maximum 100 residents per operation

**Response**:
```json
{
  "success": true,
  "operation": "delete",
  "affected_count": 2,
  "results": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "success": true
    }
  ]
}
```

---

## Households Management

### List Households
```http
GET /api/households?page=1&pageSize=20
```

Lists households with pagination and search.

**Response**:
```json
{
  "households": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "code": "HHLD-001",
      "house_number": "123",
      "street_name": "Main Street",
      "full_address": "123 Main St, Bagong Ilog, Pasig City",
      "household_head": "Juan Santos Cruz",
      "no_of_household_members": 4,
      "monthly_income": 50000,
      "income_class": "middle_class",
      "geography": {
        "barangay_name": "Bagong Ilog",
        "city_name": "Pasig City"
      }
    }
  ],
  "pagination": {
    "total": 75,
    "page": 1,
    "pageSize": 20
  }
}
```

---

### Create Household
```http
POST /api/households
```

Creates a new household record.

**Request Body**:
```json
{
  "house_number": "456",
  "street_name": "Oak Avenue",
  "subdivision_id": "550e8400-e29b-41d4-a716-446655440002",
  "household_type": "nuclear",
  "tenure_status": "owned",
  "monthly_income": 45000,
  "no_of_families": 1,
  "no_of_household_members": 3
}
```

---

### Get Household Details
```http
GET /api/households/550e8400-e29b-41d4-a716-446655440000
```

Gets complete household information with members.

**Response**:
```json
{
  "household": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "code": "HHLD-001",
    "house_number": "123",
    "full_address": "123 Main St, Bagong Ilog, Pasig City",
    "monthly_income": 50000,
    "income_class": "middle_class",
    "members": [
      {
        "id": "550e8400-e29b-41d4-a716-446655440001",
        "first_name": "Juan",
        "last_name": "Cruz",
        "family_position": "father",
        "is_household_head": true
      }
    ],
    "geography": {
      "barangay": {"code": "137404001", "name": "Bagong Ilog"},
      "city": {"code": "137404000", "name": "Pasig City"}
    }
  }
}
```

---

## Admin Operations

### List Users (Admin Only)
```http
GET /api/admin/users?page=1&pageSize=20
```

Lists all users with pagination (admin only).

**Headers**:
```http
Authorization: Bearer admin_jwt_token
```

**Response**:
```json
{
  "users": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "email": "admin@example.com",
      "first_name": "Admin",
      "last_name": "User",
      "role": "super_admin",
      "barangay_code": null,
      "is_active": true,
      "created_at": "2024-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "total": 10,
    "page": 1,
    "pageSize": 20
  }
}
```

---

### Create User (Admin Only)
```http
POST /api/admin/users
```

Admin-only user creation with profile setup.

**Request Body**:
```json
{
  "email": "newuser@example.com",
  "first_name": "New",
  "last_name": "User",
  "phone": "09171234567",
  "role_name": "barangay_admin",
  "barangay_code": "137404001"
}
```

---

## Dashboard & Analytics

### Dashboard Statistics
```http
GET /api/dashboard/stats
```

Comprehensive dashboard statistics with caching.

**Headers**:
```http
Authorization: Bearer your_jwt_token
```

**Features**:
- Performance optimizations with connection pooling
- Query optimization and caching (2-minute TTL)
- Rate limiting (30 requests/minute)

**Response**:
```json
{
  "basic_stats": {
    "total_residents": 1250,
    "total_households": 320,
    "total_seniors": 125,
    "total_employed": 890
  },
  "demographics": {
    "age_groups": {
      "0-17": 245,
      "18-59": 850,
      "60+": 155
    },
    "sex_distribution": {
      "male": 625,
      "female": 625
    },
    "civil_status": {
      "single": 450,
      "married": 650,
      "widowed": 100,
      "others": 50
    }
  },
  "employment": {
    "employed": 890,
    "unemployed": 180,
    "not_in_labor_force": 180,
    "employment_rate": 71.2
  },
  "special_categories": {
    "persons_with_disability": 45,
    "solo_parents": 78,
    "overseas_filipino_workers": 123,
    "indigenous_people": 12,
    "migrants": 234
  },
  "performance": {
    "query_time_ms": 145,
    "cached": true,
    "cache_age_seconds": 45
  }
}
```

---

## Utility & Health Checks

### Basic Health Check
```http
GET /api/health
```

System health monitoring endpoint.

**Response**:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:30:00Z",
  "uptime": "2 days, 14:32:18",
  "environment": "production",
  "components": {
    "database": "healthy",
    "cache": "healthy",
    "memory": "healthy"
  },
  "system": {
    "memory_usage": "245MB / 512MB",
    "cpu_load": "15%"
  }
}
```

---

### Detailed Health Check
```http
POST /api/health
```

Comprehensive system diagnostics (requires authentication).

**Headers**:
```http
Authorization: Bearer your_jwt_token
```

**Response**:
```json
{
  "status": "healthy",
  "database": {
    "connection": "healthy",
    "query_time_ms": 12,
    "active_connections": 8
  },
  "performance": {
    "avg_response_time_ms": 145,
    "error_rate_percent": 0.1
  },
  "environment": {
    "node_version": "18.17.0",
    "next_version": "14.0.0"
  }
}
```

---

### Cache Statistics
```http
GET /api/cache/stats
```

Cache performance monitoring.

**Response**:
```json
{
  "cache_stats": {
    "hit_rate": 0.85,
    "miss_rate": 0.15,
    "total_requests": 10000,
    "cache_size": "12MB"
  },
  "query_optimizer": {
    "queries_optimized": 245,
    "avg_optimization_ms": 5.2
  },
  "warnings": []
}
```

---

## Occupation Search (PSOC)

### Search Occupations
```http
GET /api/psoc/search?q=engineer&levels=unit_group&limit=10
```

Search Philippine Standard Occupation Classification.

**Query Parameters**:
- `q` (required): Search query (min 2 characters)
- `levels` (optional): Comma-separated levels (major_group, sub_major_group, unit_group, etc.)
- `limit` (optional): Max results (default 20)

**Response**:
```json
{
  "results": [
    {
      "level": "unit_group",
      "code": "2511",
      "title": "Systems Analysts",
      "hierarchy": {
        "major_group": "Professionals",
        "sub_major_group": "Science and Engineering Professionals",
        "minor_group": "Information and Communications Technology Professionals"
      },
      "match_score": 0.95
    }
  ],
  "pagination": {
    "total": 1,
    "limit": 10
  }
}
```

---

## User Location Services

### Get User Geographic Location
```http
GET /api/user/geographic-location
```

Gets user's complete geographic hierarchy.

**Headers**:
```http
Authorization: Bearer your_jwt_token
```

**Response**:
```json
{
  "region": {
    "code": "130000000",
    "name": "National Capital Region (NCR)"
  },
  "province": {
    "code": "137500000", 
    "name": "Metro Manila"
  },
  "city": {
    "code": "137404000",
    "name": "Pasig City"
  },
  "barangay": {
    "code": "137404001",
    "name": "Bagong Ilog"
  }
}
```

---

## Error Handling

### Standard Error Format

All API endpoints return errors in a consistent format:

```json
{
  "error": true,
  "message": "Detailed error message",
  "code": "ERROR_CODE",
  "details": {
    "field": "validation error details"
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Missing or invalid authentication |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | Request validation failed |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Server error |
| `GEOGRAPHIC_ACCESS_DENIED` | 403 | Geographic permission denied |

### Validation Errors

Field-level validation errors include specific details:

```json
{
  "error": true,
  "message": "Validation failed",
  "code": "VALIDATION_ERROR",
  "details": {
    "first_name": "First name is required",
    "email": "Invalid email format",
    "birthdate": "Date must be in the past"
  }
}
```

---

## Rate Limiting

### Rate Limit Headers

API responses include rate limiting information:

```http
X-RateLimit-Limit: 30
X-RateLimit-Remaining: 25
X-RateLimit-Reset: 1642256400
X-RateLimit-Window: 60
```

### Rate Limit Exceeded Response

```json
{
  "error": true,
  "message": "Rate limit exceeded",
  "code": "RATE_LIMIT_EXCEEDED",
  "retry_after": 45,
  "limit": 30,
  "window": 60
}
```

---

## Caching

### Cache Headers

Cached responses include cache information:

```http
X-Cache: HIT
X-Cache-Age: 45
X-Cache-TTL: 120
Cache-Control: public, max-age=120
```

### Cache Control

| Endpoint Category | TTL | Strategy |
|-------------------|-----|----------|
| Geographic Data | 24 hours | Long-term cache |
| Dashboard Stats | 2 minutes | Short-term cache |
| User Profiles | 5 minutes | Medium-term cache |

---

## SDK Examples

### JavaScript/TypeScript

```typescript
import { ApiClient } from '@/lib/api-client';

const api = new ApiClient({
  baseUrl: 'https://your-domain.com/api',
  token: 'your-jwt-token'
});

// List residents
const residents = await api.residents.list({
  page: 1,
  pageSize: 20,
  search: 'juan'
});

// Create resident
const newResident = await api.residents.create({
  first_name: 'Maria',
  last_name: 'Cruz',
  // ... other fields
});

// Get dashboard stats
const stats = await api.dashboard.getStats();
```

### cURL Examples

```bash
# List residents
curl -H "Authorization: Bearer YOUR_TOKEN" \
     "https://your-domain.com/api/residents?page=1&pageSize=20"

# Create resident
curl -X POST \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"first_name":"Maria","last_name":"Cruz"}' \
     "https://your-domain.com/api/residents"

# Search barangays
curl "https://your-domain.com/api/psgc/search?q=pasig&levels=barangay"
```

---

## Changelog

### Version 1.0.0
- Initial API documentation
- All core endpoints documented
- Authentication and security patterns defined
- Geographic access control implemented
- Rate limiting and caching strategies documented

---

## Support

For API support and questions:

- **Documentation Issues**: Create an issue in the repository
- **API Questions**: Contact the development team
- **Bug Reports**: Use the issue tracker with the `api` label

---

**Last Updated**: December 2024  
**API Version**: 1.0.0  
**Status**: Production Ready