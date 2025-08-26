/**
 * Session Utility Functions
 * Handles session retrieval with fallback mechanisms
 */

import { supabase } from '@/lib';

/**
 * Get session with fallback to localStorage
 * This handles cases where supabase.auth.getSession() fails but session is stored
 */
export const getSessionWithFallback = async () => {
  try {
    // Try the standard Supabase method first
    const { data: { session }, error } = await supabase.auth.getSession();
    
    if (session?.access_token && !error) {
      console.log('✅ [SessionUtils] Session retrieved via Supabase client');
      return session;
    }
    
    console.log('⚠️ [SessionUtils] Supabase client session failed, trying localStorage fallback');
    console.log('🔍 [SessionUtils] Supabase error:', error);
    
    // Fallback: Read directly from localStorage
    const storageKey = 'sb-cdtcbelaimyftpxmzkjf-auth-token';
    const sessionData = localStorage.getItem(storageKey);
    
    if (!sessionData) {
      console.log('❌ [SessionUtils] No session data in localStorage');
      return null;
    }
    
    const parsedSession = JSON.parse(sessionData);
    
    // Check if session is expired
    const now = Math.floor(Date.now() / 1000);
    if (parsedSession.expires_at && parsedSession.expires_at < now) {
      console.log('❌ [SessionUtils] Session in localStorage is expired');
      return null;
    }
    
    console.log('✅ [SessionUtils] Session retrieved from localStorage fallback');
    return parsedSession;
    
  } catch (error) {
    console.error('❌ [SessionUtils] Session retrieval failed:', error);
    return null;
  }
};

/**
 * Make authenticated API request with session fallback
 */
export const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
  const session = await getSessionWithFallback();
  
  if (!session?.access_token) {
    console.error('❌ [FetchWithAuth] No valid authentication session found');
    throw new Error('No valid authentication session found');
  }
  
  const authHeaders = {
    'Authorization': `Bearer ${session.access_token}`,
    'Content-Type': 'application/json',
    ...options.headers,
  };
  
  const response = await fetch(url, {
    ...options,
    headers: authHeaders,
  });
  
  return response;
};