/**
 * Custom hook for memoized URL parameter extraction
 * Philippine compliance standards and input sanitization.
 */

import { useSearchParams } from 'next/navigation';
import { useMemo } from 'react';

import { sanitizeInput, sanitizeNameInput } from '@/utils/input-sanitizer';

export interface URLParameterConfig {
  key: string;
  sanitizationType?: 'text' | 'name' | 'none';
  defaultValue?: string;
}

/**
 * Hook for extracting and memoizing URL parameters with automatic sanitization
 * @param parameterKeys - Array of parameter keys to extract
 * @returns Memoized object with sanitized parameter values
 */
export function useURLParameters(parameterKeys: string[]): Record<string, string | null> {
  const searchParams = useSearchParams();
  
  return useMemo(() => {
    const result: Record<string, string | null> = {};
    
    parameterKeys.forEach(key => {
      const rawValue = searchParams.get(key);
      result[key] = rawValue ? sanitizeInput(rawValue) : null;
    });
    
    return result;
  }, [searchParams, parameterKeys]);
}

/**
 * Hook for URL parameters with custom sanitization configuration
 * @param configurations - Array of parameter configurations
 * @returns Memoized object with sanitized parameter values
 */
export function useURLParametersWithConfig(
  configurations: URLParameterConfig[]
): Record<string, string | null> {
  const searchParams = useSearchParams();
  
  return useMemo(() => {
    const result: Record<string, string | null> = {};
    
    configurations.forEach(config => {
      const rawValue = searchParams.get(config.key);
      
      if (!rawValue) {
        result[config.key] = config.defaultValue || null;
        return;
      }
      
      switch (config.sanitizationType) {
        case 'name':
          result[config.key] = sanitizeNameInput(rawValue);
          break;
        case 'text':
          result[config.key] = sanitizeInput(rawValue);
          break;
        case 'none':
          result[config.key] = rawValue;
          break;
        default:
          result[config.key] = sanitizeInput(rawValue);
      }
    });
    
    return result;
  }, [searchParams, configurations]);
}

/**
 * Hook for resident form URL parameters
 * @returns Object with suggestedName, suggestedId, and isPreFilled status
 */
export function useResidentFormURLParameters(): {
  suggestedName: string | null;
  suggestedId: string | null;
  isPreFilled: boolean;
} {
  const searchParams = useSearchParams();
  
  return useMemo(() => {
    const suggestedName = searchParams.get('suggested_name');
    const suggestedId = searchParams.get('suggested_id');
    
    return {
      suggestedName: suggestedName ? sanitizeNameInput(suggestedName) : null,
      suggestedId: suggestedId ? sanitizeInput(suggestedId) : null,
      isPreFilled: Boolean(suggestedName || suggestedId)
    };
  }, [searchParams]);
}