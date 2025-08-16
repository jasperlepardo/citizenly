import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const levels = searchParams.get('levels')?.split(',') || ['occupation']; // Default to occupations only
    const maxLevel = searchParams.get('maxLevel') || 'occupation';
    const minLevel = searchParams.get('minLevel') || 'major_group';

    if (!query || query.trim().length < 2) {
      // Return empty results instead of error for graceful handling
      return NextResponse.json({ data: [], count: 0 });
    }

    // Use service role client to bypass RLS
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const searchTerm = `%${query.trim()}%`;
    const allResults: any[] = [];

    // Search major groups if requested
    if (levels.includes('major_group')) {
      const { data: majorGroups } = await supabase
        .from('psoc_major_groups')
        .select('*')
        .ilike('title', searchTerm)
        .limit(Math.min(limit, 5));
      
      if (majorGroups) {
        majorGroups.forEach(item => {
          allResults.push({
            code: item.code,
            title: item.title,
            level: 'major_group',
            hierarchy: `Major Group: ${item.title}`,
            match_score: 1
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
        subMajorGroups.forEach(item => {
          allResults.push({
            code: item.code,
            title: item.title,
            level: 'sub_major_group',
            hierarchy: `Sub Major Group: ${item.title}`,
            match_score: 2
          });
        });
      }
    }

    // Search unit groups if requested
    if (levels.includes('unit_group')) {
      const { data: unitGroups } = await supabase
        .from('psoc_unit_groups')
        .select('*')
        .ilike('title', searchTerm)
        .limit(Math.min(limit, 10));
      
      if (unitGroups) {
        unitGroups.forEach(item => {
          allResults.push({
            code: item.code,
            title: item.title,
            level: 'unit_group',
            hierarchy: `Unit Group: ${item.title}`,
            match_score: 3
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
        unitSubGroups.forEach(item => {
          allResults.push({
            code: item.code,
            title: item.title,
            level: 'unit_sub_group',
            hierarchy: `Unit Sub Group: ${item.title}`,
            match_score: 4
          });
        });
      }
    }

    // Search occupations if requested (most specific)
    if (levels.includes('occupation')) {
      const { data: occupations } = await supabase
        .from('psoc_occupation_search')
        .select('*')
        .ilike('occupation_title', searchTerm)
        .limit(Math.min(limit, 15));
      
      if (occupations) {
        occupations.forEach(item => {
          allResults.push({
            code: item.occupation_code,
            title: item.occupation_title,
            level: 'occupation',
            hierarchy: item.full_hierarchy || item.occupation_title,
            match_score: 5 // Highest priority for specific occupations
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
    const levelOrder = { major_group: 1, sub_major_group: 2, unit_group: 3, unit_sub_group: 4, occupation: 5 };
    uniqueResults.sort((a, b) => {
      const levelDiff = levelOrder[a.level as keyof typeof levelOrder] - levelOrder[b.level as keyof typeof levelOrder];
      if (levelDiff !== 0) return levelDiff;
      return b.match_score - a.match_score;
    });

    const finalResults = uniqueResults.slice(0, Math.min(limit, 50));
    
    return NextResponse.json({
      data: finalResults,
      count: finalResults.length
    });
  } catch (error) {
    console.error('PSOC search API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}