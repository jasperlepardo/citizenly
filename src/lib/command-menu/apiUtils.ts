/**
 * Command Menu API Integration
 * Provides real API functionality for command menu actions
 */

import { supabase } from '@/lib/supabase';
import { logger } from '@/lib/logging/secureLogger';
import { startCommandMenuSearchTimer, endCommandMenuSearchTimer } from '@/lib/command-menu/analyticsUtils';

// Types for API responses
interface SearchResult {
  id: string;
  title: string;
  description: string;
  type: 'resident' | 'household';
  href: string;
}

interface ExportOptions {
  type: 'residents' | 'households';
  format: 'csv' | 'xlsx';
  filters?: Record<string, any>;
}

// Rate limiting for search to prevent abuse
const searchCache = new Map<string, { results: SearchResult[], timestamp: number }>();
const SEARCH_CACHE_TTL = 30000; // 30 seconds
const MAX_SEARCH_LENGTH = 100;

// Search residents and households
export async function searchData(query: string, limit = 10): Promise<SearchResult[]> {
  if (!query.trim()) return [];
  
  // Input validation and sanitization
  const sanitizedQuery = query.trim().slice(0, MAX_SEARCH_LENGTH);
  if (sanitizedQuery.length < 1) return [];
  
  // Start performance tracking
  const searchId = startCommandMenuSearchTimer(sanitizedQuery);
  
  // Check cache first
  const cacheKey = `${sanitizedQuery}-${limit}`;
  const cached = searchCache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp) < SEARCH_CACHE_TTL) {
    endCommandMenuSearchTimer(searchId, sanitizedQuery, cached.results.length, true);
    return cached.results;
  }

  try {
    const results: SearchResult[] = [];

    // Search residents
    const { data: residents, error: residentsError } = await supabase
      .from('residents')
      .select('id, first_name, middle_name, last_name, barangay_code')
      .or(`first_name.ilike.%${query}%,middle_name.ilike.%${query}%,last_name.ilike.%${query}%`)
      .limit(Math.floor(limit / 2));

    if (!residentsError && residents) {
      results.push(
        ...residents.map(resident => ({
          id: resident.id,
          title: `${resident.first_name} ${resident.middle_name ? resident.middle_name + ' ' : ''}${resident.last_name}`,
          description: `Resident • Barangay ${resident.barangay_code}`,
          type: 'resident' as const,
          href: `/residents/${resident.id}`,
        }))
      );
    }

    // Search households - temporarily disabled due to RLS issues
    // The RLS policy references non-existent functions (user_access_level, user_barangay_code, etc.)
    // causing household queries to fail silently
    logger.info('Household search temporarily disabled due to RLS policy issues', {
      query: sanitizedQuery,
      reason: 'Missing RLS functions: user_access_level(), user_barangay_code(), etc.'
    });

    // Cache the results
    searchCache.set(cacheKey, {
      results,
      timestamp: Date.now(),
    });

    // Clean up old cache entries to prevent memory leaks
    cleanupCache();

    // Track search completion
    endCommandMenuSearchTimer(searchId, sanitizedQuery, results.length, false);

    return results;
  } catch (error) {
    logger.error('Command menu search error:', error);
    endCommandMenuSearchTimer(searchId, sanitizedQuery, 0, false);
    return [];
  }
}

// Cache cleanup to prevent memory leaks
function cleanupCache(): void {
  const now = Date.now();
  const entriesToDelete: string[] = [];
  
  searchCache.forEach((value, key) => {
    if ((now - value.timestamp) > SEARCH_CACHE_TTL) {
      entriesToDelete.push(key);
    }
  });
  
  entriesToDelete.forEach(key => searchCache.delete(key));
  
  // Limit cache size to prevent excessive memory usage
  if (searchCache.size > 100) {
    const oldestEntries = Array.from(searchCache.entries())
      .sort(([, a], [, b]) => a.timestamp - b.timestamp)
      .slice(0, searchCache.size - 50); // Keep newest 50 entries
    
    oldestEntries.forEach(([key]) => searchCache.delete(key));
  }
}

// Export data functionality
export async function exportData(options: ExportOptions): Promise<boolean> {
  try {
    const response = await fetch(`/api/${options.type}/export`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        format: options.format,
        filters: options.filters || {},
      }),
    });

    if (response.ok) {
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      a.download = `${options.type}-export.${options.format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      return true;
    }

    throw new Error(`Export failed: ${response.statusText}`);
  } catch (error) {
    logger.error('Export error:', error);
    return false;
  }
}

// Get recent items from user activity
export async function getRecentItems(): Promise<SearchResult[]> {
  try {
    const { getStoredRecentItems } = await import('../storage/recentItemsStorage');
    const recentItems = getStoredRecentItems();
    
    return recentItems.map(item => ({
      id: item.id,
      title: item.title,
      description: item.description,
      type: item.type as 'resident' | 'household',
      href: item.href || '#',
    }));
  } catch (error) {
    logger.error('Recent items error:', error);
    return [];
  }
}

// Clear recent items history
export async function clearRecentItems(): Promise<boolean> {
  try {
    const { clearRecentItems: clearStored } = await import('../storage/recentItemsStorage');
    clearStored();
    logger.info('Recent items cleared');
    return true;
  } catch (error) {
    logger.error('Clear recent items error:', error);
    return false;
  }
}

// Quick actions
export async function createResident(): Promise<string> {
  // Navigate to create resident page
  return '/residents/create';
}

export async function createHousehold(): Promise<string> {
  // Navigate to create household page
  return '/households/create';
}

// Filter shortcuts
export async function findSeniorCitizens(): Promise<string> {
  return '/residents?filter=seniors&age_min=60';
}

export async function findPWDs(): Promise<string> {
  return '/residents?filter=pwd&sectoral=pwd';
}

export async function findSoloParents(): Promise<string> {
  return '/residents?filter=solo_parent&sectoral=solo_parent';
}

// System actions
export async function backupData(): Promise<boolean> {
  try {
    const response = await fetch('/api/admin/backup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (response.ok) {
      const result = await response.json();
      return result.success;
    }

    return false;
  } catch (error) {
    logger.error('Backup error:', error);
    return false;
  }
}

// Certificate generation
export async function generateCertificate(type: 'clearance' | 'residency' | 'indigency'): Promise<string> {
  return `/certification?type=${type}`;
}

// Analytics and reports
export async function generateReport(type: 'population' | 'households'): Promise<string> {
  return `/reports/${type}`;
}