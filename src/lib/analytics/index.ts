/**
 * Analytics Module
 * Centralized analytics utilities for user behavior tracking and PWA metrics
 */

// Re-export user behavior analytics
export * from './user-behavior';

// Re-export PWA performance utilities from performance module
export { trackPWAEvents, pwaPerformance } from '../performance/pwaPerformanceUtils';
