'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/lib';
import type { User, Session } from '@supabase/supabase-js';

// User profile types - EXACTLY matching auth_user_profiles table (23 fields)
export interface UserProfile {
  // Core identification fields
  id: string;
  first_name: string;
  middle_name?: string | null;
  last_name: string;
  email: string;
  phone?: string | null;
  
  // Role and access control
  role_id: string;
  
  // Geographic assignment
  barangay_code?: string | null;
  city_municipality_code?: string | null;
  province_code?: string | null;
  region_code?: string | null;
  
  // Status and activity
  is_active: boolean;
  last_login?: string | null;
  
  // Email verification
  email_verified: boolean;
  email_verified_at?: string | null;
  
  // Welcome email tracking
  welcome_email_sent: boolean;
  welcome_email_sent_at?: string | null;
  
  // Onboarding tracking
  onboarding_completed: boolean;
  onboarding_completed_at?: string | null;
  
  // Audit fields
  created_by?: string | null;
  updated_by?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Role {
  id: string;
  name: string;
  permissions: Record<string, boolean | string>;
}

// Simplified for original schema - no barangay_accounts needed

interface AuthContextType {
  // Authentication state
  session: Session | null;
  user: User | null;
  userProfile: UserProfile | null;
  role: Role | null;

  // Loading states
  loading: boolean;
  profileLoading: boolean;
  profileError: string | null;

  // Methods
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  loadProfile: () => Promise<void>;
  refreshProfile: () => Promise<void>;

  // Helper methods
  hasPermission: (permission: string) => boolean;
  isInRole: (roleName: string) => boolean;
  canAccessBarangay: (barangayCode: string) => boolean;
  isBarangayAdmin: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { readonly children: React.ReactNode }) {
  // Core auth state
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Profile state
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileCache, setProfileCache] = useState<
    Map<string, { profile: UserProfile; role: Role; timestamp: number }>
  >(new Map());
  const [lastProfileLoad, setLastProfileLoad] = useState<number>(0);

  // Retry helper with exponential backoff
  const retryWithBackoff = async <T,>(
    operation: () => Promise<T>,
    maxRetries = 3,
    baseDelay = 1000
  ): Promise<T> => {
    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        if (attempt === maxRetries) throw error;

        const delay = baseDelay * Math.pow(2, attempt);
        console.log(`Retry attempt ${attempt + 1}/${maxRetries + 1} in ${delay}ms`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    throw new Error('Max retries exceeded');
  };

  // Load user profile and related data (simplified for original schema)
  const loadUserProfile = useCallback(
    async (userId: string, force = false) => {
      try {
        // Check cache first (cache for 5 minutes)
        const cacheKey = userId;
        const cached = profileCache.get(cacheKey);
        const now = Date.now();
        const cacheTimeout = 5 * 60 * 1000; // 5 minutes

        if (!force && cached && now - cached.timestamp < cacheTimeout) {
          console.log('Using cached profile data');
          setUserProfile(cached.profile);
          setRole(cached.role);
          return;
        }

        // Prevent multiple simultaneous requests for the same user
        if (profileLoading && now - lastProfileLoad < 1000) {
          console.log('Profile already loading, skipping duplicate request');
          return;
        }

        setProfileLoading(true);
        setProfileError(null);
        setLastProfileLoad(now);
        console.log('Loading user profile for:', userId);

        // Try real database query first
        console.log('Attempting real database query...');
        const startTime = Date.now();

        // Set a shorter timeout for this specific query
        const timeoutPromise = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Profile query timeout')), 15000); // 15 second timeout
        });

        try {
          // Get the current session to pass the auth token
          const {
            data: { session },
          } = await supabase.auth.getSession();

          if (!session?.access_token) {
            throw new Error('No valid authentication session. Please log in again.');
          }

          // Use server-side API to fetch profile data (bypasses RLS issues)
          const response = (await retryWithBackoff(async () => {
            const result = await Promise.race([
              fetch('/api/auth/profile', {
                method: 'GET',
                headers: {
                  'Content-Type': 'application/json',
                  Authorization: `Bearer ${session.access_token}`,
                },
              }),
              timeoutPromise,
            ]);
            console.log('Profile API response status:', (result as Response).status);
            return result;
          })) as Response;

          const queryTime = Date.now() - startTime;
          console.log(`Profile query completed successfully in ${queryTime}ms`);

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            console.error('Profile API error:', {
              status: response.status,
              statusText: response.statusText,
              error: errorData.error || 'Unknown error',
              fullError: JSON.stringify(errorData, null, 2),
            });
            throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
          }

          const data = await response.json();
          // The API returns { data: { profile, role }, message, metadata }
          const { profile: profileData, role } = data.data || data;

          if (!profileData) {
            console.error('No profile found for user:', userId);
            throw new Error('Profile not found');
          }

          // Log the actual data structure to understand what fields exist
          console.log('Raw profile data from API:', profileData);
          console.log('Profile barangay_code:', profileData?.barangay_code);
          console.log('Profile role_id:', profileData?.role_id);

          // Map the database fields to our interface, using defaults for missing fields
          const profile: UserProfile = {
            id: profileData.id || userId,
            email: profileData.email || '',
            first_name: profileData.first_name || '',
            middle_name: profileData.middle_name || null,
            last_name: profileData.last_name || '',
            phone: profileData.phone || null,
            role_id: profileData.role_id || '',
            barangay_code: profileData.barangay_code || null,
            city_municipality_code: profileData.city_municipality_code || null,
            province_code: profileData.province_code || null,
            region_code: profileData.region_code || null,
            is_active: profileData.is_active !== undefined ? profileData.is_active : true,
            last_login: profileData.last_login || null,
            email_verified: profileData.email_verified || false,
            email_verified_at: profileData.email_verified_at || null,
            welcome_email_sent: profileData.welcome_email_sent || false,
            welcome_email_sent_at: profileData.welcome_email_sent_at || null,
            onboarding_completed: profileData.onboarding_completed || false,
            onboarding_completed_at: profileData.onboarding_completed_at || null,
            created_by: profileData.created_by || null,
            updated_by: profileData.updated_by || null,
            created_at: profileData.created_at || new Date().toISOString(),
            updated_at: profileData.updated_at || new Date().toISOString(),
          };

          console.log('Profile loaded successfully:', profile);
          console.log('Role loaded:', role);

          const finalRole = role || {
            id: 'default-role',
            name: 'User',
            permissions: { residents_view: true },
          };

          // Cache the results
          const newCache = new Map(profileCache);
          newCache.set(cacheKey, {
            profile,
            role: finalRole,
            timestamp: Date.now(),
          });
          setProfileCache(newCache);

          setUserProfile(profile);
          setRole(finalRole);
        } catch (dbError) {
          console.error('Database query failed and no fallback available:', {
            message: (dbError as any)?.message || 'Unknown error',
            code: (dbError as any)?.code,
            details: (dbError as any)?.details,
            hint: (dbError as any)?.hint,
            fullError: JSON.stringify(dbError, null, 2),
          });
          console.error('User must have a valid profile in the database to use the system');

          // Don't use mock data - require real database profile
          setUserProfile(null);
          setRole(null);
          throw new Error('Failed to load user profile from database');
        }
      } catch (error) {
        console.error('Error in loadUserProfile:', error);
        setProfileError(error instanceof Error ? error.message : 'Failed to load profile');
        setUserProfile(null);
        setRole(null);
      } finally {
        setProfileLoading(false);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [profileCache, profileLoading, lastProfileLoad]
  );

  // Initialize auth state
  useEffect(() => {
    // Get initial session with timeout
    const initAuth = async () => {
      try {
        console.log('Starting auth initialization...');
        
        // First try to get session
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error('Session error:', {
            message: error.message || 'Unknown error',
            code: error.code,
            details: (error as any).details,
            hint: (error as any).hint,
            fullError: JSON.stringify(error, null, 2),
          });
          
          // If session fails, try to refresh from storage
          try {
            console.log('Attempting session recovery from storage...');
            await supabase.auth.refreshSession();
            const { data: { session: refreshedSession } } = await supabase.auth.getSession();
            
            if (refreshedSession) {
              console.log('Session recovered successfully');
              setSession(refreshedSession);
              setUser(refreshedSession.user);
            }
          } catch (refreshError) {
            console.warn('Session recovery failed:', refreshError);
          }
          
          setLoading(false);
          return;
        }

        console.log('Session retrieved:', session?.user?.id ? 'User found' : 'No user');
        setSession(session);
        setUser(session?.user ?? null);

        console.log('Auth initialization complete');
        setLoading(false);
      } catch (error) {
        console.error('Auth initialization error:', {
          message: (error as any)?.message || 'Unknown error',
          code: (error as any)?.code,
          details: (error as any)?.details,
          hint: (error as any)?.hint,
          fullError: JSON.stringify(error, null, 2),
        });
        setLoading(false);
      }
    };

    // Add timeout to prevent infinite loading - only if page is visible
    let timeoutId: NodeJS.Timeout | null = null;

    if (!document.hidden) {
      timeoutId = setTimeout(() => {
        console.warn('Auth initialization timeout - forcing completion');
        setLoading(false);
        // Don't clear the session if user was found
        if (user) {
          console.log('User was authenticated but initialization timed out - continuing');
        }
      }, 10000); // 10 seconds timeout - shorter for incognito mode
    }

    initAuth().then(() => {
      if (timeoutId) clearTimeout(timeoutId);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state change:', event, session?.user?.id);
      setSession(session);
      setUser(session?.user ?? null);

      if (event === 'SIGNED_OUT') {
        setUserProfile(null);
        setRole(null);
        setProfileError(null);
      }

      // Always ensure loading is false after auth state change
      setLoading(false);
    });

    return () => {
      if (timeoutId) clearTimeout(timeoutId);
      subscription.unsubscribe();
    };
  }, []);

  // Sign in method
  const signIn = useCallback(
    async (email: string, password: string) => {
      const { error, data } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      // Preload profile data immediately after successful sign-in (but skip on public routes)
      if (!error && data.user) {
        const publicRoutes = ['/signup', '/login', '/'];
        const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
        const isPublicRoute = publicRoutes.includes(currentPath);

        if (!isPublicRoute) {
          loadUserProfile(data.user.id).catch(err => {
            console.error('Profile preloading failed:', err);
          });
        }
      }

      return { error };
    },
    [loadUserProfile]
  );

  // Sign out method
  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
    }
  }, []);

  // Load profile method (separate from auth)
  const loadProfile = useCallback(async () => {
    if (user?.id) {
      await loadUserProfile(user.id);
    }
  }, [user?.id, loadUserProfile]);

  // Refresh profile method
  const refreshProfile = useCallback(async () => {
    if (user) {
      await loadUserProfile(user.id);
    }
  }, [user, loadUserProfile]);

  // Auto-load profile when user is authenticated (but skip on public routes)
  useEffect(() => {
    // Skip profile loading on public routes
    const publicRoutes = ['/signup', '/login', '/'];
    const currentPath = typeof window !== 'undefined' ? window.location.pathname : '';
    const isPublicRoute = publicRoutes.includes(currentPath);

    if (user?.id && !userProfile && !profileLoading && !isPublicRoute) {
      loadProfile();
    }
  }, [user?.id, userProfile, profileLoading, loadProfile]);

  // Permission helpers
  const checkCrudPermission = useCallback((action: string, permissionValue: string): boolean => {
    if (permissionValue === 'crud' || permissionValue === 'manage') return true;
    if (action === 'view' && (permissionValue === 'read' || permissionValue === 'crud'))
      return true;
    if (action === 'create' && (permissionValue === 'write' || permissionValue === 'crud'))
      return true;
    if (action === 'update' && (permissionValue === 'write' || permissionValue === 'crud'))
      return true;
    if (action === 'delete' && (permissionValue === 'write' || permissionValue === 'crud'))
      return true;
    return false;
  }, []);

  const hasPermission = useCallback(
    (permission: string): boolean => {
      if (!role?.permissions) return false;

      // Super admin has all permissions
      if (role.permissions.all === true) return true;

      // Check specific permission (boolean style)
      if (role.permissions[permission] === true) return true;

      // Check CRUD-style permissions (e.g., "residents_view")
      const [resource, action] = permission.split('_');
      if (resource && action && role.permissions[resource]) {
        const resourcePermission = role.permissions[resource];
        // If permission is boolean true, user has full access
        if (resourcePermission === true) return true;
        // If permission is a string, check CRUD permissions
        if (typeof resourcePermission === 'string') {
          return checkCrudPermission(action, resourcePermission);
        }
      }

      return false;
    },
    [role, checkCrudPermission]
  );

  const isInRole = useCallback(
    (roleName: string): boolean => {
      return role?.name === roleName;
    },
    [role]
  );

  const canAccessBarangay = useCallback(
    (barangayCode: string): boolean => {
      return userProfile?.barangay_code === barangayCode;
    },
    [userProfile]
  );

  const isBarangayAdmin = useCallback((): boolean => {
    return role?.name === 'barangay_admin';
  }, [role]);

  const value: AuthContextType = useMemo(
    () => ({
      // State
      session,
      user,
      userProfile,
      role,
      loading,
      profileLoading,
      profileError,

      // Methods
      signIn,
      signOut,
      loadProfile,
      refreshProfile,

      // Helpers
      hasPermission,
      isInRole,
      canAccessBarangay,
      isBarangayAdmin,
    }),
    [
      session,
      user,
      userProfile,
      role,
      loading,
      profileLoading,
      profileError,
      signIn,
      signOut,
      loadProfile,
      refreshProfile,
      hasPermission,
      isInRole,
      canAccessBarangay,
      isBarangayAdmin,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook to use auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    // Provide a fallback during SSR or if used outside provider
    return {
      user: null,
      session: null,
      userProfile: null,
      role: null,
      loading: true,
      profileLoading: true,
      profileError: null,
      signIn: async () => ({ error: new Error('AuthProvider not available') }),
      signOut: async () => {},
      loadProfile: async () => {},
      refreshProfile: async () => {},
      hasPermission: () => false,
      isInRole: () => false,
      canAccessBarangay: () => false,
      isBarangayAdmin: () => false,
    };
  }
  return context;
}

// Hook for protected routes
export function useRequireAuth() {
  const auth = useAuth();

  useEffect(() => {
    if (!auth.loading && !auth.user) {
      // Redirect to login - but give more time for auth to settle during navigation
      const timer = setTimeout(() => {
        window.location.href = '/login';
      }, 500); // Small delay to prevent race conditions during navigation

      return () => clearTimeout(timer);
    }
  }, [auth.loading, auth.user]);

  return auth;
}

// Hook for role-based access
export function useRequireRole(requiredRole: string) {
  const auth = useRequireAuth();

  useEffect(() => {
    if (!auth.loading && !auth.profileLoading && auth.user && !auth.isInRole(requiredRole)) {
      // Redirect to unauthorized page
      window.location.href = '/unauthorized';
    }
  }, [auth, requiredRole]);

  return auth;
}

// Hook for permission-based access
export function useRequirePermission(permission: string) {
  const auth = useRequireAuth();

  useEffect(() => {
    if (!auth.loading && !auth.profileLoading && auth.user && !auth.hasPermission(permission)) {
      // Redirect to unauthorized page
      window.location.href = '/unauthorized';
    }
  }, [auth, permission]);

  return auth;
}
