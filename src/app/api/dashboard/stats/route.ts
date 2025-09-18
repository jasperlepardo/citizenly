import { NextRequest, NextResponse } from 'next/server';

// REMOVED: @/lib barrel import - replace with specific module;
import { withResponseCache, CachePresets } from '@/lib/caching/responseCache';
import { isProduction } from '@/lib/config/environment';
import { getPooledConnection, releasePooledConnection } from '@/lib/database/connectionPool';
import { queryOptimizer } from '@/lib/database/queryOptimizer';
import { logger } from '@/lib/logging/secure-logger';

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 30; // 30 requests per minute
const requestCounts = new Map<string, { count: number; resetTime: number }>();

// Rate limiting function
function checkRateLimit(userAgent: string, ip: string): boolean {
  const key = `${ip}-${userAgent?.substring(0, 50) || 'unknown'}`;
  const now = Date.now();
  const current = requestCounts.get(key);

  if (!current || now > current.resetTime) {
    requestCounts.set(key, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (current.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false;
  }

  current.count++;
  return true;
}

// Pagination configuration
const MAX_RESIDENTS_PER_PAGE = 1000;
const DEFAULT_PAGE_SIZE = 500;

async function dashboardStatsHandler(request: NextRequest): Promise<NextResponse> {
  try {
    // Environment validation for production
    if (isProduction()) {
      if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
        return NextResponse.json(
          { error: 'SERVER_001', message: 'Service configuration error' },
          { status: 500 }
        );
      }
    }

    // Rate limiting
    const userAgent = request.headers.get('user-agent') || '';
    const ip =
      request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';

    if (!checkRateLimit(userAgent, ip)) {
      return NextResponse.json(
        { error: 'RATE_001', message: 'Rate limit exceeded. Please try again later.' },
        { status: 429 }
      );
    }

    // Get auth header from the request
    const authHeader = request.headers.get('Authorization') || request.headers.get('authorization');

    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'AUTH_001', message: 'No authentication token provided' },
        { status: 401 }
      );
    }

    const token = authHeader.split(' ')[1];

    // Get optimized connection for user verification
    const supabase = await getPooledConnection('anon');

    // Verify the user token
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return NextResponse.json(
        { error: 'AUTH_002', message: 'Invalid or expired authentication token' },
        { status: 401 }
      );
    }

    // Get optimized service role connection
    const supabaseAdmin = await getPooledConnection('service');

    // Get user profile to get barangay_code
    const { data: userProfile, error: profileError } = await supabaseAdmin
      .from('auth_user_profiles')
      .select('barangay_code')
      .eq('id', user.id)
      .single();

    if (profileError) {
      logger.error('Profile query error:', profileError);
      return NextResponse.json(
        { error: 'USER_001', message: 'User profile could not be retrieved' },
        { status: 400 }
      );
    }

    if (!userProfile?.barangay_code) {
      return NextResponse.json(
        { error: 'USER_002', message: 'No barangay assignment found for user' },
        { status: 400 }
      );
    }

    const barangayCode = userProfile.barangay_code;

    // Get dashboard stats using query optimizer
    const {
      data: dashboardStats,
      error: statsError,
      fromCache,
    } = await queryOptimizer.getDashboardStats(
      supabaseAdmin,
      barangayCode,
      { cacheTTL: 2 * 60 * 1000 } // 2 minutes cache
    );

    if (statsError) {
      logger.error('Dashboard stats query error:', statsError);
      return NextResponse.json(
        { error: 'DATA_002', message: 'Unable to retrieve dashboard statistics' },
        { status: 500 }
      );
    }

    // If no stats data exists for this barangay, provide defaults
    const statsData = dashboardStats || {
      total_residents: 0,
      total_households: 0,
      seniors: 0,
      employed: 0,
    };

    // Parse pagination parameters
    const url = new URL(request.url);
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
    const limit = Math.min(
      MAX_RESIDENTS_PER_PAGE,
      parseInt(url.searchParams.get('limit') || DEFAULT_PAGE_SIZE.toString())
    );
    const offset = (page - 1) * limit;

    // Get individual residents data using optimized query
    const {
      data: residentsData,
      error: residentsError,
      fromCache: residentsFromCache,
    } = await queryOptimizer.executeQuery(
      supabaseAdmin,
      `residents_sectoral_${barangayCode}_${page}_${limit}`,
      async () => {
        return await supabaseAdmin
          .from('residents')
          .select(
            `
            birthdate, 
            sex, 
            civil_status, 
            employment_status,
            household_code,
            households!inner(barangay_code),
            resident_sectoral_info(
              is_labor_force_employed,
              is_unemployed,
              is_overseas_filipino_worker,
              is_person_with_disability,
              is_out_of_school_children,
              is_out_of_school_youth,
              is_senior_citizen,
              is_registered_senior_citizen,
              is_solo_parent,
              is_indigenous_people,
              is_migrant
            )
          `
          )
          .eq('households.barangay_code', barangayCode)
          .eq('is_active', true)
          .range(offset, offset + limit - 1);
      },
      {
        cacheTTL: 1 * 60 * 1000, // 1 minute cache for residents
        enableCache: true,
      }
    );

    if (residentsError) {
      logger.error('Residents query error:', residentsError);
      return NextResponse.json(
        { error: 'DATA_002', message: 'Unable to retrieve resident data' },
        { status: 500 }
      );
    }

    // Calculate real sectoral statistics from residents data
    const sectoralStats = {
      laborForce: 0,
      employed: 0,
      unemployed: 0,
      ofw: 0,
      pwd: 0,
      outOfSchoolChildren: 0,
      outOfSchoolYouth: 0,
      seniorCitizens: 0,
      registeredSeniorCitizens: 0,
      soloParents: 0,
      indigenous: 0,
      migrants: 0,
    };

    if (residentsData && residentsData.length > 0) {
      residentsData.forEach(resident => {
        const sectoral = resident.resident_sectoral_info?.[0];
        if (sectoral) {
          // Labor force includes employed and unemployed
          if (sectoral.is_labor_force_employed || sectoral.is_unemployed)
            sectoralStats.laborForce++;
          if (sectoral.is_labor_force_employed) sectoralStats.employed++;
          if (sectoral.is_unemployed) sectoralStats.unemployed++;
          if (sectoral.is_overseas_filipino_worker) sectoralStats.ofw++;
          if (sectoral.is_person_with_disability) sectoralStats.pwd++;
          if (sectoral.is_out_of_school_children) sectoralStats.outOfSchoolChildren++;
          if (sectoral.is_out_of_school_youth) sectoralStats.outOfSchoolYouth++;
          if (sectoral.is_senior_citizen) sectoralStats.seniorCitizens++;
          if (sectoral.is_registered_senior_citizen) sectoralStats.registeredSeniorCitizens++;
          if (sectoral.is_solo_parent) sectoralStats.soloParents++;
          if (sectoral.is_indigenous_people) sectoralStats.indigenous++;
          if (sectoral.is_migrant) sectoralStats.migrants++;
        }
      });
    }

    // Calculate actual counts from the data we retrieved
    const actualResidentCount = residentsData?.length || 0;
    const uniqueHouseholds = new Set(
      residentsData?.map(r => r.household_code).filter(Boolean) || []
    );
    const actualHouseholdCount = uniqueHouseholds.size;

    const response = {
      stats: {
        residents: actualResidentCount,
        households: actualHouseholdCount,
        businesses: 0, // TODO: Add when businesses table exists
        certifications: 0, // TODO: Add when certifications table exists
        seniorCitizens: sectoralStats.seniorCitizens || statsData?.age_65_plus || 0,
        employedResidents: sectoralStats.employed || statsData?.employed_count || 0,
      },
      // Additional demographic data for charts
      demographics: {
        ageGroups: {
          youngDependents: statsData?.age_0_14 || 0,
          workingAge: statsData?.age_15_64 || 0,
          oldDependents: statsData?.age_65_plus || 0,
        },
        sexDistribution: {
          male: statsData?.male_count || 0,
          female: statsData?.female_count || 0,
        },
        civilStatus: {
          single: statsData?.single_count || 0,
          married: statsData?.married_count || 0,
          widowed: statsData?.widowed_count || 0,
          divorced: statsData?.divorced_separated_count || 0,
        },
        employment: {
          laborForce:
            sectoralStats.laborForce ||
            (statsData?.employed_count || 0) + (statsData?.unemployed_count || 0),
          employed: sectoralStats.employed || statsData?.employed_count || 0,
          unemployed: sectoralStats.unemployed || statsData?.unemployed_count || 0,
        },
        specialCategories: {
          pwd: sectoralStats.pwd,
          soloParents: sectoralStats.soloParents,
          ofw: sectoralStats.ofw,
          indigenous: sectoralStats.indigenous,
          outOfSchoolChildren: sectoralStats.outOfSchoolChildren,
          outOfSchoolYouth: sectoralStats.outOfSchoolYouth,
          registeredSeniorCitizens: sectoralStats.registeredSeniorCitizens,
          migrants: sectoralStats.migrants,
        },
      },
      residentsData: residentsData || [],
      pagination: {
        page,
        limit,
        total: actualResidentCount,
        hasNextPage: residentsData?.length === limit,
      },
      // Performance metadata
      performance: {
        dashboardStatsFromCache: fromCache,
        residentsDataFromCache: residentsFromCache,
        queryOptimizationEnabled: true,
      },
    };

    // Release pooled connections
    releasePooledConnection(supabase);
    releasePooledConnection(supabaseAdmin);

    return NextResponse.json(response);
  } catch (error) {
    logger.error('Dashboard stats API error:', error);
    return NextResponse.json(
      { error: 'SERVER_001', message: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}

// Wrap the handler with response caching
export async function GET(request: NextRequest): Promise<NextResponse> {
  return withResponseCache(CachePresets.dashboard)(request, () => dashboardStatsHandler(request));
}
