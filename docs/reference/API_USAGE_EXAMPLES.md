# API Usage Examples

## Quick Reference

This document provides practical examples for common API operations in the RBI System. All examples use the Supabase client with TypeScript.

## 🚀 Setup

```typescript
import { supabase } from '@/lib/supabase';
import type { Database } from '@/lib/supabase';

type Resident = Database['public']['Tables']['residents']['Row'];
type Household = Database['public']['Tables']['households']['Row'];
```

## 👥 Residents API Examples

### Create New Resident

```typescript
const createResident = async (residentData: {
  first_name: string;
  last_name: string;
  birthdate: string;
  sex: 'male' | 'female';
  mobile_number: string;
  barangay_code: string;
  // ... other required fields
}) => {
  const { data, error } = await supabase
    .from('residents')
    .insert({
      ...residentData,
      // Auto-generated fields
      id: crypto.randomUUID(),
      created_at: new Date().toISOString(),
      is_active: true,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating resident:', error);
    throw new Error(`Failed to create resident: ${error.message}`);
  }

  return data;
};

// Usage
try {
  const newResident = await createResident({
    first_name: 'Maria',
    last_name: 'Santos',
    middle_name: 'Garcia',
    birthdate: '1990-05-15',
    sex: 'female',
    civil_status: 'Single',
    citizenship: 'Filipino',
    mobile_number: '09171234567',
    barangay_code: '137404001',
    education_level: 'College Graduate',
    education_status: 'Completed',
    employment_status: 'Employed',
    blood_type: 'A+',
    ethnicity: 'Filipino',
    religion: 'Roman Catholic',
  });

  console.log('Created resident:', newResident);
} catch (error) {
  console.error('Failed to create resident:', error);
}
```

### Search Residents

```typescript
const searchResidents = async (searchParams: {
  barangay_code: string;
  search_term?: string;
  age_min?: number;
  age_max?: number;
  sex?: 'male' | 'female';
  employment_status?: string;
  page?: number;
  limit?: number;
}) => {
  let query = supabase
    .from('residents')
    .select(
      `
      id,
      first_name,
      middle_name,
      last_name,
      birthdate,
      sex,
      mobile_number,
      employment_status,
      education_level,
      created_at
    `
    )
    .eq('barangay_code', searchParams.barangay_code)
    .eq('is_active', true);

  // Text search in name fields
  if (searchParams.search_term) {
    query = query.or(`
      first_name.ilike.%${searchParams.search_term}%,
      last_name.ilike.%${searchParams.search_term}%,
      middle_name.ilike.%${searchParams.search_term}%
    `);
  }

  // Age filtering (requires calculated field or function)
  if (searchParams.age_min || searchParams.age_max) {
    if (searchParams.age_min) {
      query = query.lte(
        'birthdate',
        new Date(Date.now() - searchParams.age_min * 365.25 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0]
      );
    }
    if (searchParams.age_max) {
      query = query.gte(
        'birthdate',
        new Date(Date.now() - searchParams.age_max * 365.25 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0]
      );
    }
  }

  // Other filters
  if (searchParams.sex) {
    query = query.eq('sex', searchParams.sex);
  }

  if (searchParams.employment_status) {
    query = query.eq('employment_status', searchParams.employment_status);
  }

  // Pagination
  const page = searchParams.page || 0;
  const limit = searchParams.limit || 50;
  query = query.range(page * limit, (page + 1) * limit - 1);

  // Sorting
  query = query.order('last_name', { ascending: true });

  const { data, error, count } = await query;

  if (error) {
    throw new Error(`Search failed: ${error.message}`);
  }

  return { residents: data || [], total: count || 0 };
};

// Usage
const results = await searchResidents({
  barangay_code: '137404001',
  search_term: 'santos',
  age_min: 18,
  age_max: 65,
  sex: 'female',
  page: 0,
  limit: 20,
});
```

### Update Resident Profile

```typescript
const updateResidentProfile = async (residentId: string, updates: Partial<Resident>) => {
  // Add updated timestamp
  const updateData = {
    ...updates,
    updated_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('residents')
    .update(updateData)
    .eq('id', residentId)
    .select()
    .single();

  if (error) {
    throw new Error(`Update failed: ${error.message}`);
  }

  return data;
};

// Usage - Update contact information
const updatedResident = await updateResidentProfile('uuid-string', {
  mobile_number: '09187654321',
  email: 'maria.santos@email.com',
  workplace: 'City Hall',
});
```

### Get Resident with Address

```typescript
const getResidentWithAddress = async (residentId: string) => {
  const { data, error } = await supabase
    .from('residents')
    .select(
      `
      *,
      household:households(
        code,
        street_name,
        house_number,
        subdivision
      ),
      address:psgc_address_hierarchy(
        region_name,
        province_name,
        city_municipality_name,
        barangay_name,
        full_address
      )
    `
    )
    .eq('id', residentId)
    .single();

  if (error) {
    throw new Error(`Failed to fetch resident: ${error.message}`);
  }

  return data;
};
```

## 🏠 Households API Examples

### Create Household with Members

```typescript
const createHouseholdWithMembers = async (householdData: {
  code: string;
  barangay_code: string;
  street_name?: string;
  house_number?: string;
  members: Partial<Resident>[];
}) => {
  // Start transaction-like operation
  const { data: household, error: householdError } = await supabase
    .from('households')
    .insert({
      code: householdData.code,
      barangay_code: householdData.barangay_code,
      street_name: householdData.street_name,
      house_number: householdData.house_number,
      total_members: householdData.members.length,
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (householdError) {
    throw new Error(`Failed to create household: ${householdError.message}`);
  }

  // Add members
  const membersWithHousehold = householdData.members.map(member => ({
    ...member,
    household_code: household.code,
    barangay_code: householdData.barangay_code,
    id: crypto.randomUUID(),
    created_at: new Date().toISOString(),
    is_active: true,
  }));

  const { data: members, error: membersError } = await supabase
    .from('residents')
    .insert(membersWithHousehold)
    .select();

  if (membersError) {
    // Rollback household creation if members fail
    await supabase.from('households').delete().eq('code', household.code);
    throw new Error(`Failed to add household members: ${membersError.message}`);
  }

  // Update household head if specified
  const householdHead = members.find(member => member.id === householdData.members[0].id);
  if (householdHead) {
    await supabase
      .from('households')
      .update({ household_head_id: householdHead.id })
      .eq('code', household.code);
  }

  return { household, members };
};
```

### Get Household Details

```typescript
const getHouseholdDetails = async (householdCode: string) => {
  const { data, error } = await supabase
    .from('households')
    .select(
      `
      *,
      household_head:residents!households_household_head_id_fkey(
        id,
        first_name,
        last_name,
        mobile_number
      ),
      members:residents!residents_household_code_fkey(
        id,
        first_name,
        middle_name,
        last_name,
        birthdate,
        sex,
        employment_status,
        is_active
      ),
      address:psgc_address_hierarchy(
        region_name,
        province_name,
        city_municipality_name,
        barangay_name
      )
    `
    )
    .eq('code', householdCode)
    .single();

  if (error) {
    throw new Error(`Failed to fetch household: ${error.message}`);
  }

  // Filter active members
  data.members = data.members?.filter(member => member.is_active) || [];

  return data;
};
```

## 📍 Address/PSGC API Examples

### Get Address Hierarchy

```typescript
const getAddressHierarchy = async (
  level: 'region' | 'province' | 'city' | 'barangay',
  parentCode?: string
) => {
  let query = supabase.from('psgc_address_hierarchy').select('*');

  switch (level) {
    case 'region':
      query = query.select('region_code, region_name').order('region_name');
      break;

    case 'province':
      if (parentCode) {
        query = query
          .select('province_code, province_name')
          .eq('region_code', parentCode)
          .not('province_code', 'is', null)
          .order('province_name');
      }
      break;

    case 'city':
      if (parentCode) {
        query = query
          .select('city_municipality_code, city_municipality_name, city_municipality_type')
          .eq('province_code', parentCode)
          .order('city_municipality_name');
      }
      break;

    case 'barangay':
      if (parentCode) {
        query = query
          .select('barangay_code, barangay_name')
          .eq('city_municipality_code', parentCode)
          .order('barangay_name');
      }
      break;
  }

  const { data, error } = await query;

  if (error) {
    throw new Error(`Failed to fetch ${level} data: ${error.message}`);
  }

  // Remove duplicates
  const unique = data?.filter(
    (item, index, self) =>
      index ===
      self.findIndex(i =>
        level === 'region'
          ? i.region_code === item.region_code
          : level === 'province'
            ? i.province_code === item.province_code
            : level === 'city'
              ? i.city_municipality_code === item.city_municipality_code
              : i.barangay_code === item.barangay_code
      )
  );

  return unique || [];
};

// Usage
const regions = await getAddressHierarchy('region');
const provinces = await getAddressHierarchy('province', '13'); // Region 13
const cities = await getAddressHierarchy('city', '1374'); // Rizal Province
const barangays = await getAddressHierarchy('barangay', '137404'); // Antipolo City
```

## 📊 Statistics and Reports

### Get Barangay Statistics

```typescript
const getBarangayStatistics = async (barangayCode: string) => {
  // Get resident counts by demographics
  const { data: demographics, error: demoError } = await supabase.rpc('get_barangay_demographics', {
    p_barangay_code: barangayCode,
  });

  // Get household statistics
  const { count: totalHouseholds, error: householdError } = await supabase
    .from('households')
    .select('*', { count: 'exact', head: true })
    .eq('barangay_code', barangayCode);

  // Get age group statistics
  const { data: ageGroups, error: ageError } = await supabase.rpc('get_age_group_statistics', {
    p_barangay_code: barangayCode,
  });

  if (demoError || householdError || ageError) {
    throw new Error('Failed to fetch statistics');
  }

  return {
    demographics: demographics || [],
    totalHouseholds: totalHouseholds || 0,
    ageGroups: ageGroups || [],
  };
};
```

### Generate Monthly Report

```typescript
const generateMonthlyReport = async (barangayCode: string, month: number, year: number) => {
  const startDate = new Date(year, month - 1, 1).toISOString();
  const endDate = new Date(year, month, 0, 23, 59, 59).toISOString();

  // New residents registered
  const { count: newResidents } = await supabase
    .from('residents')
    .select('*', { count: 'exact', head: true })
    .eq('barangay_code', barangayCode)
    .gte('created_at', startDate)
    .lte('created_at', endDate);

  // New households created
  const { count: newHouseholds } = await supabase
    .from('households')
    .select('*', { count: 'exact', head: true })
    .eq('barangay_code', barangayCode)
    .gte('created_at', startDate)
    .lte('created_at', endDate);

  // Updates made
  const { count: updatedResidents } = await supabase
    .from('residents')
    .select('*', { count: 'exact', head: true })
    .eq('barangay_code', barangayCode)
    .gte('updated_at', startDate)
    .lte('updated_at', endDate)
    .not('updated_at', 'is', null);

  return {
    period: { month, year },
    newResidents: newResidents || 0,
    newHouseholds: newHouseholds || 0,
    updatedResidents: updatedResidents || 0,
    generatedAt: new Date().toISOString(),
  };
};
```

## 🔄 Real-time Features

### Live Resident Counter

```typescript
const useRealtimeResidentCount = (barangayCode: string) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    // Initial count
    const getInitialCount = async () => {
      const { count } = await supabase
        .from('residents')
        .select('*', { count: 'exact', head: true })
        .eq('barangay_code', barangayCode)
        .eq('is_active', true);
      setCount(count || 0);
    };

    getInitialCount();

    // Subscribe to changes
    const subscription = supabase
      .channel(`residents_${barangayCode}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'residents',
          filter: `barangay_code=eq.${barangayCode}`,
        },
        payload => {
          if (payload.eventType === 'INSERT') {
            setCount(prev => prev + 1);
          } else if (payload.eventType === 'DELETE') {
            setCount(prev => prev - 1);
          } else if (payload.eventType === 'UPDATE') {
            // Handle active/inactive status changes
            const oldRecord = payload.old as Resident;
            const newRecord = payload.new as Resident;

            if (oldRecord.is_active && !newRecord.is_active) {
              setCount(prev => prev - 1);
            } else if (!oldRecord.is_active && newRecord.is_active) {
              setCount(prev => prev + 1);
            }
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [barangayCode]);

  return count;
};
```

### Activity Feed

```typescript
const useActivityFeed = (barangayCode: string, limit: number = 10) => {
  const [activities, setActivities] = useState<any[]>([]);

  useEffect(() => {
    const subscription = supabase
      .channel(`activity_${barangayCode}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'residents',
          filter: `barangay_code=eq.${barangayCode}`,
        },
        payload => {
          const activity = {
            id: crypto.randomUUID(),
            type: payload.eventType,
            table: 'residents',
            timestamp: new Date().toISOString(),
            data: payload.new || payload.old,
          };

          setActivities(prev => [activity, ...prev].slice(0, limit));
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'households',
          filter: `barangay_code=eq.${barangayCode}`,
        },
        payload => {
          const activity = {
            id: crypto.randomUUID(),
            type: payload.eventType,
            table: 'households',
            timestamp: new Date().toISOString(),
            data: payload.new || payload.old,
          };

          setActivities(prev => [activity, ...prev].slice(0, limit));
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [barangayCode, limit]);

  return activities;
};
```

## 🔐 Authentication Examples

### Protected Route Wrapper

```typescript
const withAuth = <P extends object>(
  WrappedComponent: React.ComponentType<P>,
  requiredRole?: string
) => {
  return (props: P) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
      const checkAuth = async () => {
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
          router.push('/login');
          return;
        }

        // Check role if required
        if (requiredRole) {
          const userRole = session.user.user_metadata?.role;
          const hasPermission = checkRolePermission(userRole, requiredRole);

          if (!hasPermission) {
            router.push('/unauthorized');
            return;
          }
        }

        setUser(session.user);
        setLoading(false);
      };

      checkAuth();

      const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_OUT') {
          router.push('/login');
        }
      });

      return () => subscription.unsubscribe();
    }, []);

    if (loading) return <LoadingSpinner />;
    if (!user) return null;

    return <WrappedComponent {...props} />;
  };
};

// Usage
const ProtectedDashboard = withAuth(Dashboard, 'barangay_staff');
```

## 🧪 Testing Examples

### API Call Testing

```typescript
// __tests__/api/residents.test.ts
import { createMockSupabaseClient } from '../mocks/supabase';
import { createResident } from '@/lib/api/residents';

// Mock Supabase
jest.mock('@/lib/supabase', () => ({
  supabase: createMockSupabaseClient(),
}));

describe('Residents API', () => {
  it('should create a new resident', async () => {
    const mockResident = {
      first_name: 'John',
      last_name: 'Doe',
      birthdate: '1990-01-01',
      sex: 'male' as const,
      mobile_number: '09171234567',
      barangay_code: '137404001',
    };

    const result = await createResident(mockResident);

    expect(result).toHaveProperty('id');
    expect(result.first_name).toBe('John');
    expect(result.last_name).toBe('Doe');
  });

  it('should handle creation errors', async () => {
    // Configure mock to return error
    const mockSupabase = require('@/lib/supabase').supabase;
    mockSupabase
      .from()
      .insert()
      .select()
      .single.mockResolvedValue({
        data: null,
        error: { message: 'Duplicate key value' },
      });

    await expect(
      createResident({
        /* ... */
      })
    ).rejects.toThrow('Failed to create resident');
  });
});
```

This comprehensive API documentation provides practical examples for all common operations in the RBI System. Use these patterns as starting points for your specific implementation needs.
