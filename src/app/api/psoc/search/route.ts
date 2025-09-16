import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

import type { PsocMajorGroup, PsocSubMajorGroup, PsocUnitGroup, PsocUnitSubGroup } from '@/types/infrastructure/database/database';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const levels = searchParams.get('levels')?.split(',') || ['occupation']; // Default to occupations only

    if (!query || query.trim().length < 2) {
      // Return empty results instead of error for graceful handling
      return NextResponse.json({ data: [], count: 0 });
    }

    // Create public client for PSOC data search
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { error: 'Database configuration missing', data: [], count: 0 },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    const searchTerm = `%${query.trim()}%`;
    const allResults: any[] = [];
    
    // Check if the query looks like a code (numeric)
    const isNumericCode = /^\d+$/.test(query.trim());

    // Search major groups if requested
    if (levels.includes('major_group')) {
      let majorGroupsQuery = supabase.from('psoc_major_groups').select('*');
      
      if (isNumericCode) {
        majorGroupsQuery = majorGroupsQuery.eq('code', query.trim());
      } else {
        majorGroupsQuery = majorGroupsQuery.ilike('title', searchTerm);
      }
      
      const { data: majorGroups } = await majorGroupsQuery.limit(Math.min(limit, 5));

      if (majorGroups) {
        majorGroups.forEach((item: PsocMajorGroup) => {
          allResults.push({
            code: item.code,
            title: item.title,
            level: 'major_group',
            hierarchy: `Major Group: ${item.title}`,
            match_score: 1,
          });
        });
      }
    }

    // Search sub major groups if requested
    if (levels.includes('sub_major_group')) {
      const { data: subMajorGroups } = await supabase
        .from('psoc_sub_major_groups')
        .select('*')
        .ilike('title', searchTerm)
        .limit(Math.min(limit, 10));

      if (subMajorGroups) {
        subMajorGroups.forEach((item: PsocSubMajorGroup) => {
          allResults.push({
            code: item.code,
            title: item.title,
            level: 'sub_major_group',
            hierarchy: `Sub Major Group: ${item.title}`,
            match_score: 2,
          });
        });
      }
    }

    // Search unit groups if requested
    if (levels.includes('unit_group')) {
      let unitGroupsQuery = supabase.from('psoc_unit_groups').select('*');
      
      if (isNumericCode) {
        unitGroupsQuery = unitGroupsQuery.eq('code', query.trim());
      } else {
        unitGroupsQuery = unitGroupsQuery.ilike('title', searchTerm);
      }
      
      const { data: unitGroups } = await unitGroupsQuery.limit(Math.min(limit, 10));

      if (unitGroups) {
        unitGroups.forEach((item: PsocUnitGroup) => {
          allResults.push({
            code: item.code,
            title: item.title,
            level: 'unit_group',
            hierarchy: `Unit Group: ${item.title}`,
            match_score: 3,
          });
        });
      }
    }

    // Search unit sub groups if requested
    if (levels.includes('unit_sub_group')) {
      const { data: unitSubGroups } = await supabase
        .from('psoc_unit_sub_groups')
        .select('*')
        .ilike('title', searchTerm)
        .limit(Math.min(limit, 10));

      if (unitSubGroups) {
        unitSubGroups.forEach((item: PsocUnitSubGroup) => {
          allResults.push({
            code: item.code,
            title: item.title,
            level: 'unit_sub_group',
            hierarchy: `Unit Sub Group: ${item.title}`,
            match_score: 4,
          });
        });
      }
    }

    // Search occupations if requested (most specific)
    if (levels.includes('occupation')) {
      let occupationsQuery = supabase.from('psoc_occupation_search').select('*');
      
      if (isNumericCode) {
        occupationsQuery = occupationsQuery.eq('occupation_code', query.trim());
      } else {
        occupationsQuery = occupationsQuery.ilike('occupation_title', searchTerm);
      }
      
      const { data: occupations } = await occupationsQuery.limit(Math.min(limit, 15));

      if (occupations) {
        occupations.forEach((item: any) => {
          allResults.push({
            code: item.occupation_code,
            title: item.occupation_title,
            level: 'occupation',
            hierarchy: item.full_hierarchy || item.occupation_title,
            match_score: 5, // Highest priority for specific occupations
          });
        });
      }
    }

    // Remove duplicates based on code
    const uniqueResults = allResults.reduce((acc, current) => {
      const exists = acc.find((item: any) => item.code === current.code);
      if (!exists) {
        acc.push(current);
      }
      return acc;
    }, [] as any[]);

    // Sort by level hierarchy (major_group -> occupation) and then by match score
    const levelOrder: Record<string, number> = {
      major_group: 1,
      sub_major_group: 2,
      unit_group: 3,
      unit_sub_group: 4,
      occupation: 5,
    };

    const sortedResults = uniqueResults
      .sort((a: any, b: any) => {
        const levelDiff = (levelOrder[a.level] || 0) - (levelOrder[b.level] || 0);
        if (levelDiff !== 0) return levelDiff;
        return (b.match_score || 0) - (a.match_score || 0);
      })
      .slice(0, limit);

    return NextResponse.json({
      data: sortedResults,
      count: sortedResults.length,
      total_found: uniqueResults.length,
    });
  } catch (error) {
    console.error('PSOC search error:', error);
    return NextResponse.json(
      {
        error: 'Failed to search PSOC data',
        data: [],
        count: 0,
      },
      { status: 500 }
    );
  }
}
