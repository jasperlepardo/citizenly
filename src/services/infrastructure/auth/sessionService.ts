/**
 * Session Service
 * Infrastructure service for session and authentication operations
 */

import type { Session } from '@supabase/supabase-js';
import { supabase } from '@/lib/data/supabase';

/**
 * Validate and get authentication session
 * Centralized auth validation for infrastructure operations
 * Uses shared singleton Supabase client to prevent multiple auth instances
 */
export const getAuthSession = async (): Promise<Session> => {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  
  if (!session?.access_token) {
    throw new Error('No valid session found');
  }
  
  return session;
};

/**
 * Fetch resident data from API with proper error handling
 * Infrastructure utility for authenticated API calls
 */
export const fetchResidentData = async (residentId: string, session: Session) => {
  const response = await fetch(`/api/residents/${residentId}`, {
    headers: {
      Authorization: `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
};