/**
 * Command Menu API Utilities
 * Functions for command menu API interactions
 */

import type { CommandMenuItemType as CommandMenuItem } from '@/components';
import { commandMenuService } from '@/services/command-menu-service';

/**
 * Search data through the command menu service
 */
export const searchData = async (query: string, limit = 10) => {
  return commandMenuService.searchData(query, limit);
};

/**
 * Export data functionality
 */
export const exportData = async (options: {
  type: string;
  format: string;
  filters?: Record<string, any>;
}) => {
  const exportOptions = {
    type: options.type as 'residents' | 'households',
    format: options.format as 'csv' | 'xlsx',
    filters: options.filters,
  };
  return commandMenuService.exportData(exportOptions);
};

/**
 * Get recent items from storage
 */
export const getRecentItems = async (): Promise<CommandMenuItem[]> => {
  const results = await commandMenuService.getRecentItems();
  // Convert search results to command menu items
  return results.map(item => ({
    id: item.id,
    title: item.title,
    subtitle: item.description,
    data: item,
    score: 1,
    type: item.type,
    group: 'Recent',
    recent: true,
    keywords: [item.title.toLowerCase()],
    href: item.href,
  }));
};

/**
 * Clear recent items
 */
export const clearRecentItems = async (): Promise<boolean> => {
  return commandMenuService.clearRecentItems();
};

/**
 * Quick action functions that return navigation URLs
 */
const getNavigationActions = () => commandMenuService.getNavigationActions();

export const createResident = () => getNavigationActions().createResident();
export const createHousehold = () => getNavigationActions().createHousehold();
export const findSeniorCitizens = () => getNavigationActions().findSeniorCitizens();
export const findPWDs = () => getNavigationActions().findPWDs();
export const findSoloParents = () => getNavigationActions().findSoloParents();

/**
 * Generate certificates - return navigation URLs
 */
export const generateCertificate = (type: 'clearance' | 'residency' | 'indigency') => {
  const actions = getNavigationActions();
  switch (type) {
    case 'clearance':
      return actions.generateClearance();
    case 'residency':
      return actions.generateResidency();
    case 'indigency':
      return actions.generateIndigency();
    default:
      return actions.generateClearance();
  }
};

/**
 * Generate reports - return navigation URLs
 */
export const generateReport = (type: 'population' | 'households') => {
  const actions = getNavigationActions();
  switch (type) {
    case 'population':
      return actions.populationReport();
    case 'households':
      return actions.householdsReport();
    default:
      return actions.populationReport();
  }
};

/**
 * Backup data functionality
 */
export const backupData = async (): Promise<boolean> => {
  return commandMenuService.backupData();
};
