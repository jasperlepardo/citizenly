/**
 * Command Menu Hook Types
 *
 * @fileoverview TypeScript interfaces for command menu React hooks
 * in the Citizenly RBI system.
 */

// =============================================================================
// COMMAND MENU HOOKS
// =============================================================================

/**
 * Command menu search result
 */
export interface CommandMenuSearchResult<T = any> {
  id: string;
  title: string;
  subtitle?: string;
  icon?: string | React.ComponentType<{ className?: string }>;
  data: T;
  score: number;
  type: 'resident' | 'household' | 'action' | 'navigation';
  disabled?: boolean;
  shortcut?: string[];
  avatar?: string | { src: string; alt: string; fallback?: string };
  label?: string;
  recent?: boolean;
  group?: string;
  description?: string;
  keywords?: string[];
  href?: string;
  onClick?: () => void;
}

/**
 * Command menu hook result
 */
export interface CommandMenuHookResult<T = any> {
  query: string;
  results: CommandMenuSearchResult<T>[];
  isSearching: boolean;
  isOpen: boolean;
  selectedIndex: number;
  setQuery: (query: string) => void;
  open: () => void;
  close: () => void;
  selectNext: () => void;
  selectPrevious: () => void;
  execute: (result?: CommandMenuSearchResult<T>) => void;
}

/**
 * Command menu hook props interface
 * Consolidates from src/hooks/command-menu/useCommandMenu.ts
 */
export interface UseCommandMenuProps {
  items: CommandMenuSearchResult[];
  maxResults?: number;
}

/**
 * Command menu hook return interface
 * Consolidates from src/hooks/command-menu/useCommandMenu.ts
 */
export interface UseCommandMenuReturn {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filteredItems: CommandMenuSearchResult[];
  selectedIndex: number;
  setSelectedIndex: (index: number) => void;
  executeCommand: (item: CommandMenuSearchResult) => void;
}

/**
 * Command menu with API props interface
 * Consolidates from src/hooks/command-menu/useCommandMenuWithApi.ts
 */
export interface UseCommandMenuWithApiProps {
  /** Maximum number of results */
  maxResults?: number;
}

/**
 * Command menu search options interface
 * Consolidates from src/hooks/command-menu/useCommandMenuSearch.ts
 */
export interface CommandMenuSearchOptions {
  /** Maximum number of results */
  maxResults?: number;
  /** Debounce delay in milliseconds */
  debounceDelay?: number;
}

/**
 * Search result from API interface
 * Consolidates from src/hooks/command-menu/useCommandMenuSearch.ts
 */
export interface SearchResult {
  id: string;
  title: string;
  description: string;
  href: string;
  type: 'resident' | 'household';
}

/**
 * Command menu search hook return interface
 * Consolidates from src/hooks/command-menu/useCommandMenuSearch.ts
 */
export interface UseCommandMenuSearchReturn {
  /** Current search query */
  searchQuery: string;
  /** Set search query */
  setSearchQuery: (query: string) => void;
  /** Search results */
  results: CommandMenuSearchResult[];
  /** Loading state */
  isLoading: boolean;
  /** Error state */
  error: string | null;
  /** Clear search */
  clearSearch: () => void;
  /** Dynamic search results */
  dynamicResults: CommandMenuSearchResult[];
}

/**
 * Command menu recents hook return interface
 * Consolidates from src/hooks/command-menu/useCommandMenuRecents.ts
 */
export interface UseCommandMenuRecentsReturn {
  /** Recent menu items */
  recentItems: CommandMenuSearchResult[];
  /** Loading state */
  isLoading: boolean;
  /** Load recent items */
  loadRecentItems: () => Promise<void>;
  /** Clear all recent items */
  handleClearRecentItems: () => Promise<void>;
  /** Number of recent items */
  recentItemsCount: number;
}

/**
 * Command menu actions hook return interface
 * Consolidates from src/hooks/command-menu/useCommandMenuActions.ts
 */
export interface UseCommandMenuActionsReturn {
  /** Execute a command */
  executeCommand: (item: CommandMenuSearchResult) => void;
  /** Handle export data action */
  handleExportData: (type: 'residents' | 'households', format: 'csv' | 'xlsx') => Promise<void>;
  /** Handle backup data action */
  handleBackupData: () => Promise<void>;
  /** Handle quick action */
  handleQuickAction: (actionFn: () => Promise<string>) => Promise<void>;
  /** Get enhanced menu items with actions */
  getEnhancedMenuItems: (baseItems: CommandMenuSearchResult[]) => CommandMenuSearchResult[];
}

// Using the comprehensive UseCommandMenuWithApiReturn interface below (line 236)

/**
 * Command menu actions hook return interface
 */
export interface UseCommandMenuActionsReturn {
  executeCommand: (command: CommandMenuSearchResult) => void;
  handleExportData: (type: 'residents' | 'households', format: 'csv' | 'xlsx') => Promise<void>;
  handleBackupData: () => Promise<void>;
  handleQuickAction: (actionFn: () => Promise<string>) => Promise<void>;
  getEnhancedMenuItems: (items: CommandMenuSearchResult[]) => CommandMenuSearchResult[];
}

/**
 * Command menu recents hook return interface
 */
export interface UseCommandMenuRecentsReturn {
  recentItems: CommandMenuSearchResult[];
  isLoading: boolean;
  loadRecentItems: () => Promise<void>;
  handleClearRecentItems: () => Promise<void>;
  recentItemsCount: number;
}

// Using the first CommandMenuSearchOptions interface above (line 91)

/**
 * Command menu search hook return interface
 */
export interface UseCommandMenuSearchReturn {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isLoading: boolean;
  dynamicResults: CommandMenuSearchResult[];
  clearSearch: () => void;
  results: CommandMenuSearchResult[];
  error: string | null;
}

/**
 * Command menu with API props interface
 */
export interface UseCommandMenuWithApiProps {
  maxResults?: number;
}

/**
 * Command menu with API return interface
 */
export interface UseCommandMenuWithApiReturn {
  // Menu state
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;

  // Search functionality
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isLoading: boolean;

  // Items and selection
  filteredItems: CommandMenuSearchResult[];
  selectedIndex: number;
  setSelectedIndex: (index: number) => void;

  // Actions
  executeCommand: (command: CommandMenuSearchResult) => void;

  // Statistics
  dynamicResults: CommandMenuSearchResult[];
  recentItemsCount: number;

  // Recent items management
  handleClearRecentItems: () => Promise<void>;
}