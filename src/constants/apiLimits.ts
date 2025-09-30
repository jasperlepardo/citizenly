/**
 * API Rate Limits and Configuration Constants
 * @deprecated This file is deprecated. Use consolidated constants from @/types/shared/constants
 */

// Simple API limits constants
const RATE_LIMITS = {
  defaultPerMinute: 60,
  searchPerMinute: 30,
  authPerMinute: 10
};

const CACHE_TTL = {
  default: 300,
  short: 60,
  long: 3600
};

const API_TIMEOUTS = {
  default: 30000,
  long: 60000
};

export {
  RATE_LIMITS,
  CACHE_TTL,
  API_TIMEOUTS,
};
