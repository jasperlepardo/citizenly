import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

// RBI v3 Required fields for resident creation
const REQUIRED_FIELDS = ['firstName', 'lastName', 'birthdate', 'sex'];
const VALID_SEX_VALUES = ['male', 'female'];
const MAX_REQUEST_SIZE = 1024 * 100; // 100KB

// Input validation for RBI v3 spec
function validateResidentInput(data: any): { valid: boolean; errors: string[] } {
  const toDateOnly = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const parseDateOnly = (isoYmd: string) => {
    const [y, m, d] = (isoYmd || '').split('-').map(Number);
    if (!y || !m || !d) return new Date('invalid');
    return new Date(y, m - 1, d);
  };
  const errors: string[] = [];

  // Check required fields
  for (const field of REQUIRED_FIELDS) {
    if (!data[field]) {
      errors.push(`Missing required field: ${field}`);
    }
  }

  // Validate sex field (RBI v3 enum)
  if (data.sex && !VALID_SEX_VALUES.includes(data.sex)) {
    errors.push('Sex must be "male" or "female"');
  }

  // Validate birthdate (RBI v3 range: 1900-01-01 to today)
  if (data.birthdate) {
    const date = parseDateOnly(data.birthdate);
    if (isNaN(date.getTime())) {
      errors.push('Invalid birthdate format. Use YYYY-MM-DD');
    }
    const minDate = toDateOnly(new Date(1900, 0, 1));
    const today = toDateOnly(new Date());
    if (date < minDate || date > today) {
      errors.push('Birthdate must be between 1900-01-01 and today');
    }
  }

  // Validate email format if provided
  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push('Invalid email format');
  }

  // Validate mobile number format if provided (Philippine format)
  if (data.mobileNumber && data.mobileNumber.trim() !== '') {
    const cleanNumber = data.mobileNumber.replace(/[\s-]/g, '');
    if (!/^(\+63|0)?9\d{9}$/.test(cleanNumber)) {
      console.log('[DEBUG] Mobile number validation failed for:', cleanNumber, 'length:', cleanNumber.length);
      errors.push('Invalid mobile number format. Use Philippine format: +639XXXXXXXXX, 09XXXXXXXXX, or 9XXXXXXXXX');
    }
  }

  // Validate barangay_code format if provided (PSGC codes: 9 digits for barangay)
  if (data.barangayCode && !/^\d+$/.test(data.barangayCode)) {
    console.log('[DEBUG] Barangay code validation failed for:', data.barangayCode, 'length:', data.barangayCode?.length);
    errors.push('Barangay code must contain only digits');
  }

  return { valid: errors.length === 0, errors };
}

// Normalize incoming payload (accept both camelCase and snake_case; return canonical camelCase)
function normalizeIncomingData(input: any) {
  const pick = (camel: string, snake: string) => input?.[camel] ?? input?.[snake];
  const toDigits = (val: any, maxLen = 10) => (val ? String(val).replace(/\D/g, '').slice(0, maxLen) : undefined);
  const trimLower = (val: any) => (val ? String(val).trim().toLowerCase() : undefined);
  const trimStr = (val: any) => (val ? String(val).trim() : undefined);
  return {
    // Required
    firstName: trimStr(pick('firstName', 'first_name')),
    middleName: trimStr(pick('middleName', 'middle_name')),
    lastName: trimStr(pick('lastName', 'last_name')),
    extensionName: trimStr(pick('extensionName', 'extension_name')),
    birthdate: trimStr(pick('birthdate', 'birthdate')),
    sex: trimLower(pick('sex', 'sex')),

    // Personal
    civilStatus: trimLower(pick('civilStatus', 'civil_status')),
    citizenship: trimLower(pick('citizenship', 'citizenship')),

    // Contact
    email: trimLower(pick('email', 'email')),
    mobileNumber: trimStr(pick('mobileNumber', 'mobile_number'))?.replace(/[\s-]/g, ''),
    telephoneNumber: trimStr(pick('telephoneNumber', 'telephone_number')),

    // Family
    motherMaidenFirstName: trimStr(pick('motherMaidenFirstName', 'mother_maiden_first')),
    motherMaidenMiddleName: trimStr(pick('motherMaidenMiddleName', 'mother_maiden_middle')),
    motherMaidenLastName: trimStr(pick('motherMaidenLastName', 'mother_maiden_last')),

    // Education/Employment
    educationAttainment: trimLower(pick('educationAttainment', 'education_attainment')),
    isGraduate: !!pick('isGraduate', 'is_graduate'),
    employmentStatus: trimLower(pick('employmentStatus', 'employment_status')),
    psocCode: trimStr(pick('psocCode', 'psoc_code')),
    psocLevel: pick('psocLevel', 'psoc_level'),
    occupationTitle: trimStr(pick('occupationTitle', 'occupation_title')),
    workplace: trimStr(pick('workplace', 'workplace')),

    // Misc
    bloodType: trimStr(pick('bloodType', 'blood_type')),
    ethnicity: trimLower(pick('ethnicity', 'ethnicity')),
    religion: trimLower(pick('religion', 'religion')),
    isVoter: pick('isVoter', 'is_voter'),
    isResidentVoter: pick('isResidentVoter', 'is_resident_voter'),

    // Geography
    barangayCode: toDigits(pick('barangayCode', 'barangay_code')),
    cityMunicipalityCode: toDigits(pick('cityMunicipalityCode', 'city_municipality_code')),
    provinceCode: toDigits(pick('provinceCode', 'province_code')),
    regionCode: toDigits(pick('regionCode', 'region_code')),

    // Household
    household_code: pick('householdCode', 'household_code'),
  } as any;
}

// Error mapping for RBI v3 specification
function mapDatabaseError(error: any): { message: string; status: number } {
  const errorMessage = error?.message?.toLowerCase() || '';
  
  // Map specific RBI v3 errors to user-friendly messages
  if (errorMessage.includes('no active encryption key')) {
    return { message: 'Activate pii_master_key.', status: 500 };
  }
  if (errorMessage.includes('rls') || errorMessage.includes('policy')) {
    return { message: 'Your account lacks jurisdiction for this barangay.', status: 403 };
  }
  if (errorMessage.includes('birthdate')) {
    return { message: 'Birthdate must be between 1900-01-01 and today.', status: 400 };
  }
  if (errorMessage.includes('function') && errorMessage.includes('does not exist')) {
    return { message: 'Required database functions not available. Contact administrator.', status: 500 };
  }
  
  // Default error mapping
  return { message: 'Failed to create resident. Please try again.', status: 500 };
}

// Helper to create error response following RBI v3 spec
function createErrorResponse(message: string, status: number) {
  console.error(`[RBI v3 API Error] ${message}`);
  return NextResponse.json({ error: message }, { status });
}

// Helper to determine access level from role name
function getAccessLevelFromRole(roleName: string): string {
  const roleAccessLevels: Record<string, string> = {
    'super_admin': 'national',
    'region_admin': 'region', 
    'province_admin': 'province',
    'city_admin': 'city',
    'barangay_admin': 'barangay',
    'barangay_staff': 'barangay',
  };
  
  return roleAccessLevels[roleName] || 'barangay'; // Default to barangay level
}

export async function POST(request: NextRequest) {
  try {
    // Check request size
    const contentLength = request.headers.get('content-length');
    if (contentLength && parseInt(contentLength) > MAX_REQUEST_SIZE) {
      return createErrorResponse('Request too large', 413);
    }

    // Authenticate early before parsing body
    const authHeaderEarly = request.headers.get('Authorization');
    if (!authHeaderEarly?.startsWith('Bearer ')) {
      return createErrorResponse('Unauthorized', 401);
    }

    const requestData = await request.json();
    const { create_household, resident_data: residentData, ...directResidentData } = requestData;
    const rawData = residentData || directResidentData;
    const effectiveData = normalizeIncomingData(rawData);
    
    console.log('[RBI v3] Processing resident creation request');
    console.log('[RBI v3] Required fields:', REQUIRED_FIELDS.map(f => ({ field: f, provided: !!effectiveData[f] })));

    // Validate input according to RBI v3 specification
    const validation = validateResidentInput(effectiveData);
    if (!validation.valid) {
      console.error('[RBI v3] Validation failed:', validation.errors);
      console.error('[RBI v3] Raw input data:', rawData);
      return NextResponse.json({ error: 'Validation failed', details: validation.errors }, { status: 400 });
    }
    console.log('[RBI v3] Input validation passed');

    // Extract token (already verified)
    const token = authHeaderEarly.split(' ')[1];

    // Create Supabase client for user verification
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return createErrorResponse('Unauthorized', 401);
    }

    // Use service role for RBI v3 operations
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // RBI v3 Preflight Check 1: Use barangay code from form or user profile (no auto-population)
    const { data: userProfile, error: profileError } = await supabaseAdmin
      .from('auth_user_profiles')
      .select('barangay_code')
      .eq('id', user.id)
      .single();

    // Use barangay code from form if provided, otherwise from user profile
    const effectiveBarangayCode = effectiveData.barangayCode || userProfile?.barangay_code || null;
    if (!effectiveBarangayCode) {
      return createErrorResponse('Barangay code is required.', 400);
    }
    console.log('[RBI v3] Using barangay code:', effectiveBarangayCode);

    // RBI v3 Preflight Check 2: Encryption removed - skip key verification
    console.log('[RBI v3] Encryption disabled - proceeding without key check');

    // RBI v3 Preflight Check 3: Verify required functions exist
    // Note: We'll proceed with RPC call and let it fail if functions don't exist
    console.log('[RBI v3] Proceeding with RPC call - functions will be verified during execution');

    // RBI v3: Direct insert (RPC functions removed)
    console.log('[RBI v3] Using direct insert with plain text fields');
    
    const { data: insertedResident, error: createError } = await supabaseAdmin
      .from('residents')
      .insert([{
        // Required fields
        first_name: effectiveData.firstName,
        last_name: effectiveData.lastName,
        birthdate: effectiveData.birthdate,
        sex: effectiveData.sex,
        barangay_code: effectiveBarangayCode,
        
        // Optional fields
        middle_name: effectiveData.middleName || null,
        mobile_number: effectiveData.mobileNumber || null,
        telephone_number: effectiveData.telephoneNumber || null,
        email: effectiveData.email || null,
        mother_maiden_first: effectiveData.motherMaidenFirstName || null,
        mother_maiden_middle: effectiveData.motherMaidenMiddleName || null,
        mother_maiden_last: effectiveData.motherMaidenLastName || null,
        household_code: effectiveData.household_code || null,
        city_municipality_code: effectiveData.cityMunicipalityCode || null,
        province_code: effectiveData.provinceCode || null,
        region_code: effectiveData.regionCode || null,
        
        // Additional fields
        civil_status: effectiveData.civilStatus || 'single',
        citizenship: effectiveData.citizenship || 'filipino',
        blood_type: effectiveData.bloodType || 'unknown',
        ethnicity: effectiveData.ethnicity || 'not_reported',
        religion: effectiveData.religion || 'prefer_not_to_say',
        employment_status: effectiveData.employmentStatus || 'not_in_labor_force',
        education_attainment: effectiveData.educationAttainment || null,
        is_graduate: effectiveData.isGraduate || false,
        psoc_code: effectiveData.psocCode || null,
        psoc_level: effectiveData.psocLevel || null,
        occupation_title: effectiveData.occupationTitle || null,
        is_voter: effectiveData.isVoter || false,
        is_resident_voter: effectiveData.isResidentVoter || false,
        is_active: true,
        created_by: user.id,
        updated_by: user.id
      }])
      .select('id')
      .single();
    
    const residentId = insertedResident?.id;
    
    if (createError) {
      console.error('[RBI v3] RPC call failed:');
      console.error('RPC Error:', { 
        message: createError.message, 
        details: createError.details, 
        hint: createError.hint, 
        code: createError.code 
      });
      
      // Direct insert failed - return error
      
      // Other RPC errors - return detailed debug info in development
      console.error('[RBI v3] RPC parameters sent:', rpcParams);
      const { message, status } = mapDatabaseError(createError);
      if (process.env.NODE_ENV !== 'production') {
        return NextResponse.json({
          error: message,
          details: [
            `db_message: ${createError.message}`,
            `db_details: ${createError.details ?? 'n/a'}`,
            `db_hint: ${createError.hint ?? 'n/a'}`,
            `db_code: ${createError.code ?? 'n/a'}`,
          ],
        }, { status });
      }
      return createErrorResponse(message, status);
    }
    
    if (!residentId) {
      return createErrorResponse('Failed to create resident - no ID returned', 500);
    }
    
    console.log('[RBI v3] Resident created successfully with ID:', residentId);
    
    // RBI v3 Post-insert: Fetch basic confirmation data
    const { data: confirmation, error: confirmError } = await supabaseAdmin
      .from('residents')
      .select('first_name, last_name, birthdate, sex, barangay_code, created_at')
      .eq('id', residentId)
      .single();
    
    if (confirmError) {
      console.warn('[RBI v3] Failed to fetch confirmation data:', confirmError);
      // Still return success since resident was created
      return NextResponse.json({ 
        resident_id: residentId,
        message: 'Resident created successfully'
      });
    }
    
    // Return RBI v3 compliant response (no PII)
    // Return both the new API shape and a backwards-compatible "resident" object expected by some clients
    return NextResponse.json({ 
      resident_id: residentId,
      resident: { id: residentId },
      confirmation,
      message: 'Resident created successfully'
    });

  } catch (error) {
    console.error('[RBI v3] Unexpected error:', error);
    const { message, status } = mapDatabaseError(error);
    return createErrorResponse(message, status);
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = Math.min(parseInt(searchParams.get('pageSize') || '20'), 100); // Max 100 per page
    const searchTerm = searchParams.get('search') || '';

    // Validate pagination parameters
    if (page < 1 || pageSize < 1) {
      return NextResponse.json({ error: 'Invalid pagination parameters' }, { status: 400 });
    }

    // Get auth header
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return createErrorResponse('Unauthorized', 401);
    }

    const token = authHeader.split(' ')[1];

    // Create client and verify user
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return createErrorResponse('Unauthorized', 401);
    }

    // Use service role for queries
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Get user profile with geographic access info
    const { data: userProfile, error: profileError } = await supabaseAdmin
      .from('auth_user_profiles')
      .select('barangay_code, city_municipality_code, province_code, region_code, role_id')
      .eq('id', user.id)
      .single();

    if (profileError || !userProfile) {
      return createErrorResponse('User profile not found', 400);
    }

    // Get user role 
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from('auth_roles')
      .select('name, permissions')
      .eq('id', userProfile.role_id)
      .single();

    if (roleError || !roleData) {
      return createErrorResponse('User role not found', 400);
    }

    // Build query with geographic filtering
    let query: any = supabaseAdmin
      .from('residents')
      .select('id, first_name, middle_name, last_name, birthdate, sex, barangay_code, city_municipality_code, province_code, region_code, created_at', { count: 'exact' })
      .order('created_at', { ascending: false });

    // Apply geographic filtering based on role name
    const accessLevel = getAccessLevelFromRole(roleData.name);
    const geoFilters: Record<string, any> = {
      barangay: { field: 'barangay_code', value: userProfile.barangay_code },
      city: { field: 'city_municipality_code', value: userProfile.city_municipality_code },
      province: { field: 'province_code', value: userProfile.province_code },
      region: { field: 'region_code', value: userProfile.region_code },
      national: null, // No filter for national access
    };

    const filter = geoFilters[accessLevel] || geoFilters.barangay; // Default to barangay
    if (filter && filter.value) {
      query = query.eq(filter.field, filter.value);
    }

    // Add search if provided
    if (searchTerm.trim()) {
      const sanitizedSearch = searchTerm.replace(/[%_]/g, '\\\\\\\\$&'); // Escape special chars
      query = query.or(
        `first_name.ilike.%${sanitizedSearch}%,middle_name.ilike.%${sanitizedSearch}%,last_name.ilike.%${sanitizedSearch}%,email.ilike.%${sanitizedSearch}%`
      );
    }

    // Add pagination
    query = query.range((page - 1) * pageSize, page * pageSize - 1);

    const { data: residents, error: residentsError, count } = await query;

    if (residentsError) {
      console.error('[DEBUG] Residents fetch error:', residentsError);
      return createErrorResponse('Failed to fetch residents', 500);
    }

    return NextResponse.json({
      data: residents || [],
      total: count || 0,
      page,
      pageSize,
      totalPages: Math.ceil((count || 0) / pageSize),
    });
  } catch (error) {
    console.error('[Residents API] Unexpected error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}