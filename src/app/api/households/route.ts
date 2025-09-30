/**
 * Households API Route
 * Fetches household records from database
 */

import { NextRequest, NextResponse } from 'next/server';

// Simple logger
const logger = {
  info: (msg: string, data?: any) => console.info(`[HouseholdsAPI] ${msg}`, data),
  error: (msg: string, data?: any) => console.error(`[HouseholdsAPI] ${msg}`, data),
};

// GET /api/households - List households with pagination and search
export async function GET(request: NextRequest) {
  try {
    // Check authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        {
          error: {
            message: 'Authentication required',
            code: 'UNAUTHORIZED',
          },
        },
        { status: 401 }
      );
    }

    // Extract search parameters
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');
    const search = searchParams.get('search') || '';

    logger.info('Households search request', { page, pageSize, search });

    // Use existing household repository - create instance directly for production
    const { SupabaseHouseholdRepository } = await import('@/services/infrastructure/repositories/SupabaseHouseholdRepository');
    const householdRepo = new SupabaseHouseholdRepository();
    
    // Calculate offset for pagination
    const offset = (page - 1) * pageSize;
    
    // Build search options
    const searchOptions = {
      limit: pageSize,
      offset,
      searchTerm: search || undefined,
    };

    // Fetch households from database
    const result = await householdRepo.findAll(searchOptions);
    
    if (!result.success) {
      logger.error('Failed to fetch households', result.error);
      return NextResponse.json(
        {
          error: {
            message: 'Failed to fetch households',
            code: 'DATABASE_ERROR',
          },
        },
        { status: 500 }
      );
    }

    const households = result.data || [];
    const total = result.total || 0;
    const totalPages = Math.ceil(total / pageSize);

    const response = {
      data: households,
      pagination: {
        page,
        pageSize,
        total,
        totalPages,
      },
      message: households.length > 0 
        ? `Found ${households.length} household${households.length !== 1 ? 's' : ''}`
        : search 
          ? `No households found matching "${search}"` 
          : 'No households available',
      metadata: {
        timestamp: new Date().toISOString(),
        searchTerm: search,
      },
    };

    return NextResponse.json(response, { 
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    logger.error('Households API error', error);
    
    return NextResponse.json(
      {
        error: {
          message: 'Internal server error in households API',
          code: 'INTERNAL_SERVER_ERROR',
        },
      },
      { status: 500 }
    );
  }
}

// POST /api/households - Create new household (stub)
export async function POST(request: NextRequest) {
  try {
    logger.info('Create household request');

    return NextResponse.json(
      {
        error: {
          message: 'Household creation temporarily disabled',
          code: 'NOT_IMPLEMENTED',
        },
      },
      { status: 501 }
    );
  } catch (error) {
    logger.error('Create household error', error);
    
    return NextResponse.json(
      {
        error: {
          message: 'Internal server error',
          code: 'INTERNAL_SERVER_ERROR',
        },
      },
      { status: 500 }
    );
  }
}