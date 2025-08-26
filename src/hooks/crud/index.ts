/**
 * CRUD Operations Hooks Module
 *
 * @description Hooks for Create, Read, Update, Delete operations
 * on residents, households, and other entities.
 */

// Primary CRUD hooks
export { useResidentOperations } from './useResidentOperations';
export { useHouseholdCrud } from './useHouseholdCrud';

// Legacy CRUD hooks (to be deprecated)
export { useResidents } from './useResidents';
export { useHouseholds } from './useHouseholds';

// Export types
export type { UseResidentOperationsOptions } from './useResidentOperations';
