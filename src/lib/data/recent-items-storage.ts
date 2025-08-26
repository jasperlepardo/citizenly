/**
 * Recent Items Storage
 * Manages recent search and navigation history in localStorage
 */

export interface RecentItem {
  id: string;
  title: string;
  description: string;
  type: 'resident' | 'household' | 'search' | 'action';
  href?: string;
  action?: () => void;
  timestamp: number;
  searchQuery?: string; // Track what user searched for
}

const RECENT_ITEMS_KEY = 'command-menu-recent-items';
const MAX_RECENT_ITEMS = 10;

/**
 * Get recent items from localStorage
 */
export function getStoredRecentItems(): RecentItem[] {
  if (typeof window === 'undefined') return [];

  try {
    const stored = localStorage.getItem(RECENT_ITEMS_KEY);
    if (!stored) return [];

    const items: RecentItem[] = JSON.parse(stored);

    // Filter out items older than 7 days
    const cutoffTime = Date.now() - 7 * 24 * 60 * 60 * 1000;
    return items
      .filter(item => item.timestamp > cutoffTime)
      .sort((a, b) => b.timestamp - a.timestamp) // Most recent first
      .slice(0, MAX_RECENT_ITEMS);
  } catch (error) {
    console.error('Error loading recent items:', error);
    return [];
  }
}

/**
 * Add an item to recent history
 */
export function addRecentItem(item: Omit<RecentItem, 'timestamp'>): void {
  if (typeof window === 'undefined') return;

  try {
    // Input validation
    if (!item.id || !item.title || !item.type) {
      console.warn('Invalid recent item data:', item);
      return;
    }

    // Sanitize input to prevent XSS
    const sanitizedItem = {
      ...item,
      id: String(item.id).slice(0, 100), // Limit length
      title: String(item.title).slice(0, 200),
      description: item.description ? String(item.description).slice(0, 300) : item.description,
      href: item.href ? String(item.href).slice(0, 500) : item.href,
      searchQuery: item.searchQuery ? String(item.searchQuery).slice(0, 100) : item.searchQuery,
    };

    const existingItems = getStoredRecentItems();

    // Remove duplicate if it exists (based on id and type)
    const filteredItems = existingItems.filter(
      existing => !(existing.id === sanitizedItem.id && existing.type === sanitizedItem.type)
    );

    // Add new item with timestamp
    const newItem: RecentItem = {
      ...sanitizedItem,
      timestamp: Date.now(),
    };

    // Keep only the most recent items
    const updatedItems = [newItem, ...filteredItems].slice(0, MAX_RECENT_ITEMS);

    // Check localStorage quota before saving
    const dataString = JSON.stringify(updatedItems);
    if (dataString.length > 50000) {
      // 50KB limit for recent items
      console.warn('Recent items data too large, trimming...');
      const trimmedItems = updatedItems.slice(0, 5); // Keep only 5 items
      localStorage.setItem(RECENT_ITEMS_KEY, JSON.stringify(trimmedItems));
    } else {
      localStorage.setItem(RECENT_ITEMS_KEY, dataString);
    }
  } catch (error) {
    console.error('Error saving recent item:', error);
    // Fallback: clear corrupted data
    try {
      localStorage.removeItem(RECENT_ITEMS_KEY);
    } catch (clearError) {
      console.error('Failed to clear corrupted recent items:', clearError);
    }
  }
}

/**
 * Track a search query
 */
export function trackSearch(query: string): void {
  if (!query.trim()) return;

  addRecentItem({
    id: `search-${query}`,
    title: `Search: "${query}"`,
    description: 'Recent search',
    type: 'search',
    searchQuery: query,
  });
}

/**
 * Track navigation to a page/item
 */
export function trackNavigation(
  id: string,
  title: string,
  description: string,
  type: 'resident' | 'household',
  href: string
): void {
  addRecentItem({
    id,
    title,
    description,
    type,
    href,
  });
}

/**
 * Track an action execution
 */
export function trackAction(id: string, title: string, description: string): void {
  addRecentItem({
    id,
    title,
    description,
    type: 'action',
  });
}

/**
 * Clear all recent items
 */
export function clearRecentItems(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(RECENT_ITEMS_KEY);
}
