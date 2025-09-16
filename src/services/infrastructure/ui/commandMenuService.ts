/**
 * Command Menu Service
 * Consolidated command menu functionality following coding standards
 */

import { createLogger } from '@/lib/config/environment';
import type {
  CommandMenuSearchResult,
  CommandMenuExportOptions,
} from '@/types/infrastructure/services/services';
import type { CacheService } from '@/services/shared/cache/cacheService';
import { supabase } from '@/lib/data/supabase';

const logger = createLogger('CommandMenuService');

/**
 * Command Menu Service Class
 * Handles search, actions, and exports for command menu
 * Uses shared singleton Supabase client to prevent multiple auth instances
 */
export class CommandMenuService {
  private readonly MAX_SEARCH_LENGTH = 100;
  private readonly SEARCH_CACHE_TTL = 30000; // 30 seconds
  private readonly supabase = supabase;
  private cacheService: CacheService;

  constructor(cacheService: CacheService) {
    this.cacheService = cacheService;
  }

  /**
   * Search residents and households
   */
  async searchData(query: string, limit = 10): Promise<CommandMenuSearchResult[]> {
    if (!query.trim()) return [];

    // Input validation and sanitization
    const sanitizedQuery = query.trim().slice(0, this.MAX_SEARCH_LENGTH);
    if (sanitizedQuery.length < 1) return [];

    // Check cache first
    const cacheKey = `search:${sanitizedQuery}-${limit}`;
    const cached = this.cacheService.get<CommandMenuSearchResult[]>(cacheKey);
    if (cached !== null) {
      return cached;
    }

    try {
      const results: CommandMenuSearchResult[] = [];

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

      // Cache the results with TTL and tags
      this.cacheService.set(cacheKey, results, {
        ttl: this.SEARCH_CACHE_TTL,
        tags: ['search', 'residents', 'households'],
      });

      return results;
    } catch (error) {
      logger.error('Command menu search error:', error);
      return [];
    }
  }

  /**
   * Export data functionality
   */
  async exportData(options: CommandMenuExportOptions): Promise<boolean> {
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

  /**
   * Get recent items from user activity
   */
  async getRecentItems(): Promise<CommandMenuSearchResult[]> {
    try {
      const cacheKey = 'recent-items';
      const cached = this.cacheService.get<CommandMenuSearchResult[]>(cacheKey);

      if (cached !== null) {
        return cached;
      }

      // If no cache, return empty array
      // In a real implementation, this would fetch from storage or API
      return [];
    } catch (error) {
      logger.error('Recent items error:', error);
      return [];
    }
  }

  /**
   * Add item to recent items
   */
  async addRecentItem(item: CommandMenuSearchResult): Promise<void> {
    try {
      const recentItems = await this.getRecentItems();

      // Remove if already exists
      const filtered = recentItems.filter(recent => recent.id !== item.id);

      // Add to beginning and limit to 10
      const updated = [item, ...filtered].slice(0, 10);

      this.cacheService.set('recent-items', updated, {
        ttl: 24 * 60 * 60 * 1000, // 24 hours
        tags: ['recent', 'user-activity'],
      });
    } catch (error) {
      logger.error('Add recent item error:', error);
    }
  }

  /**
   * Clear recent items history
   */
  async clearRecentItems(): Promise<boolean> {
    try {
      this.cacheService.delete('recent-items');
      logger.info('Recent items cleared');
      return true;
    } catch (error) {
      logger.error('Clear recent items error:', error);
      return false;
    }
  }

  /**
   * Quick navigation actions
   */
  getNavigationActions(): Record<string, () => string> {
    return {
      createResident: () => '/residents/create',
      createHousehold: () => '/households/create',
      findSeniorCitizens: () => '/residents?filter=seniors&age_min=60',
      findPWDs: () => '/residents?filter=pwd&sectoral=pwd',
      findSoloParents: () => '/residents?filter=solo_parent&sectoral=solo_parent',
      generateClearance: () => '/certification?type=clearance',
      generateResidency: () => '/certification?type=residency',
      generateIndigency: () => '/certification?type=indigency',
      populationReport: () => '/reports/population',
      householdsReport: () => '/reports/households',
    };
  }

  /**
   * System actions
   */
  async backupData(): Promise<boolean> {
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

  /**
   * Clear search cache
   */
  clearSearchCache(): void {
    this.cacheService.invalidateByTag('search');
  }
}

// Note: CommandMenuService is now managed by the service container
// Import from container: container.getCommandMenuService()
