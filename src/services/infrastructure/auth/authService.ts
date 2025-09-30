/**
 * Authentication Service
 * 
 * @description Infrastructure service for authentication operations,
 * session management, and secure API communication.
 * 
 * Extracted from utils/auth to maintain proper architectural boundaries.
 * Business logic belongs in services, not utils.
 */

import { supabase } from '@/lib/data/supabase';
import { logger } from '@/lib/logging/secure-logger';
import { auditError, auditSecurityViolation, AuditEventType } from '@/lib/security/auditStorage';

/**
 * Session management service
 */
export class AuthService {
  /**
   * Get session with fallback to localStorage
   * This handles cases where supabase.auth.getSession() fails but session is stored
   */
  public static async getSessionWithFallback() {
    try {
      // Try the standard Supabase method first
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (session?.access_token && !error) {
        logger.info('Session retrieved via Supabase client');
        return session;
      }

      logger.warn('Supabase client session failed, trying localStorage fallback', { error });

      // Fallback: Read directly from localStorage
      const storageKey = 'sb-cdtcbelaimyftpxmzkjf-auth-token';
      const sessionData = localStorage.getItem(storageKey);

      if (!sessionData) {
        logger.warn('No session data in localStorage');
        return null;
      }

      const parsedSession = JSON.parse(sessionData);

      // Check if session is expired
      const now = Math.floor(Date.now() / 1000);
      if (parsedSession.expires_at && parsedSession.expires_at < now) {
        logger.warn('Session in localStorage is expired');
        return null;
      }

      logger.info('Session retrieved from localStorage fallback');
      return parsedSession;
    } catch (error) {
      logger.error('Session retrieval failed', { error });
      return null;
    }
  }

  /**
   * Make authenticated API request with session fallback
   */
  public static async fetchWithAuth(url: string, options: RequestInit = {}) {
    const session = await this.getSessionWithFallback();

    if (!session?.access_token) {
      const error = new Error('No valid authentication session found');
      logger.error('Authentication required for API request', { url, error });
      throw error;
    }

    const authHeaders = {
      Authorization: `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers: authHeaders,
    });

    return response;
  }

  /**
   * Validate session token
   */
  public static async validateSession(token: string): Promise<boolean> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser(token);
      return !error && !!user;
    } catch (error) {
      logger.error('Session validation failed', { error });
      return false;
    }
  }

  /**
   * Refresh session token
   */
  public static async refreshSession(): Promise<any> {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        logger.error('Session refresh failed', { error });
        throw error;
      }

      logger.info('Session refreshed successfully');
      return data.session;
    } catch (error) {
      logger.error('Session refresh error', { error });
      throw error;
    }
  }

  /**
   * Sign out user and clear session
   */
  public static async signOut(): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        logger.error('Sign out failed', { error });
        throw error;
      }

      logger.info('User signed out successfully');
    } catch (error) {
      logger.error('Sign out error', { error });
      throw error;
    }
  }

  /**
   * Get current user information
   */
  public static async getCurrentUser() {
    try {
      const session = await this.getSessionWithFallback();
      
      if (!session) {
        return null;
      }

      const { data: { user }, error } = await supabase.auth.getUser(session.access_token);
      
      if (error) {
        logger.error('Failed to get current user', { error });
        return null;
      }

      return user;
    } catch (error) {
      logger.error('Get current user error', { error });
      return null;
    }
  }

  /**
   * Check if user has specific role or permission
   */
  public static async hasPermission(permission: string): Promise<boolean> {
    try {
      const user = await this.getCurrentUser();
      
      if (!user?.user_metadata) {
        return false;
      }

      // Simple permission check - can be expanded based on your permission system
      const userPermissions = user.user_metadata.permissions || [];
      return userPermissions.includes(permission);
    } catch (error) {
      logger.error('Permission check failed', { error, permission });
      return false;
    }
  }

  /**
   * Audit authentication events
   */
  public static async auditAuthEvent(
    eventType: string,
    context: {
      userId?: string;
      userAgent?: string;
      ip?: string;
      requestId?: string;
    },
    additionalData?: Record<string, any>
  ): Promise<void> {
    try {
      await auditSecurityViolation(
        eventType as AuditEventType,
        context,
        additionalData
      );
    } catch (error) {
      logger.error('Failed to audit auth event', { error, eventType, context });
    }
  }
}

// Export individual methods for backward compatibility
export const getSessionWithFallback = AuthService.getSessionWithFallback.bind(AuthService);
export const fetchWithAuth = AuthService.fetchWithAuth.bind(AuthService);
export const validateSession = AuthService.validateSession.bind(AuthService);
export const refreshSession = AuthService.refreshSession.bind(AuthService);
export const signOut = AuthService.signOut.bind(AuthService);
export const getCurrentUser = AuthService.getCurrentUser.bind(AuthService);
export const hasPermission = AuthService.hasPermission.bind(AuthService);
export const auditAuthEvent = AuthService.auditAuthEvent.bind(AuthService);