# Fix API Repository Authentication Issue

## Problem:
The resident API returns "404 Not Found" because:
1. The SupabaseResidentRepository uses the shared singleton Supabase client
2. In API routes, this client has no user authentication context  
3. RLS policies block access, causing queries to return empty results
4. Empty results are interpreted as "not found"

## Root Cause:
```typescript
// In SupabaseResidentRepository.ts line 86-90:
const { data: resident, error } = await this.supabase  // <- No auth context
  .from('residents')
  .select('*')
  .eq('id', id)
  .single();
```

## Solution Options:

### Option 1: Pass authenticated client to repository (Recommended)
Modify the API route to create an authenticated Supabase client and pass it to the repository:

```typescript
// In /api/residents/[id]/route.ts
import { createPublicSupabaseClient } from '@/lib/data/client-factory';

// Create authenticated client from user token
const token = extractToken(request);
const authenticatedSupabase = createPublicSupabaseClient();
await authenticatedSupabase.auth.setSession({
  access_token: token,
  refresh_token: '' // Not needed for API calls
});

// Pass authenticated client to repository
const repository = new SupabaseResidentRepository(authenticatedSupabase);
const service = new ResidentDomainService(repository);
```

### Option 2: Use service role with user impersonation
Create a service that can impersonate the user for RLS:

```typescript
// Use service role client but set RLS context
const serviceSupabase = createAdminSupabaseClient();
await serviceSupabase.rpc('set_current_user_id', { user_id: user.id });
```

### Option 3: Fix repository to handle auth context
Modify SupabaseResidentRepository to detect API context and handle authentication properly.

## Immediate Fix:
The fastest solution is Option 1 - modify the API route to pass an authenticated Supabase client to the repository.

## Files to modify:
1. `/src/app/api/residents/[id]/route.ts` - Add authenticated client creation
2. Test with the permission diagnostic page to confirm fix