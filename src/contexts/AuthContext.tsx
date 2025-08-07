'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

// User profile types based on database schema
export interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  barangay_code: string;
  role_id: string;
  is_active: boolean;
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
  const loadUserProfile = async (userId: string, force = false) => {
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
        // Use retry logic for optimized combined query
        const response = await retryWithBackoff(async () => {
          const result = await Promise.race([
            supabase
              .from('user_profiles')
              .select(
                `
                *,
                roles!inner(
                  *
                )
              `
              )
              .eq('id', userId)
              .single(),
            timeoutPromise,
          ]);
          return result;
        });

        const { data: profileWithRole, error: queryError } = response as any;
        const queryTime = Date.now() - startTime;
        console.log(`Profile query completed successfully in ${queryTime}ms`);

        if (queryError) {
          console.error('Profile query error:', queryError);
          throw queryError;
        }

        if (!profileWithRole) {
          console.error('No profile found for user:', userId);
          throw new Error('Profile not found');
        }

        // Log the actual data structure to understand what fields exist
        console.log('Raw profile data from database:', profileWithRole);

        // Map the database fields to our interface, using defaults for missing fields
        const profile: UserProfile = {
          id: profileWithRole.id || userId,
          email: profileWithRole.email || '',
          first_name: profileWithRole.first_name || '',
          last_name: profileWithRole.last_name || '',
          barangay_code: profileWithRole.barangay_code || '',
          role_id: profileWithRole.role_id || '',
          is_active: profileWithRole.is_active !== undefined ? profileWithRole.is_active : true,
          created_at: profileWithRole.created_at || new Date().toISOString(),
          updated_at: profileWithRole.updated_at || new Date().toISOString(),
        };

        const role = profileWithRole.roles || null;

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
        console.error('Database query failed and no fallback available:', dbError);
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
  };

  // Initialize auth state
  useEffect(() => {
    // Get initial session with timeout
    const initAuth = async () => {
      try {
        console.log('Starting auth initialization...');
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        if (error) {
          console.error('Session error:', error);
          setLoading(false);
          return;
        }

        console.log('Session retrieved:', session?.user?.id ? 'User found' : 'No user');
        setSession(session);
        setUser(session?.user ?? null);

        console.log('Auth initialization complete');
        setLoading(false);
      } catch (error) {
        console.error('Auth initialization error:', error);
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
  const signIn = async (email: string, password: string) => {
    const { error, data } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    // Preload profile data immediately after successful sign-in
    if (!error && data.user) {
      loadUserProfile(data.user.id).catch(err => {
        console.error('Profile preloading failed:', err);
      });
    }

    return { error };
  };

  // Sign out method
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
    }
  };

  // Load profile method (separate from auth)
  const loadProfile = useCallback(async () => {
    if (user?.id) {
      await loadUserProfile(user.id);
    }
  }, [user?.id, loadUserProfile]);

  // Refresh profile method
  const refreshProfile = async () => {
    if (user) {
      await loadUserProfile(user.id);
    }
  };

  // Auto-load profile when user is authenticated
  useEffect(() => {
    if (user?.id && !userProfile && !profileLoading) {
      loadProfile();
    }
  }, [user?.id, userProfile, profileLoading, loadProfile]);

  // Permission helpers
  const hasPermission = (permission: string): boolean => {
    if (!role?.permissions) return false;

    // Super admin has all permissions
    if (role.permissions.all === true) return true;

    // Check specific permission (boolean style)
    if (role.permissions[permission] === true) return true;

    // Check CRUD-style permissions (e.g., "residents": "crud")
    const [resource, action] = permission.split('_');
    if (resource && action && role.permissions[resource]) {
      const permissionValue = role.permissions[resource];
      if (permissionValue === 'crud' || permissionValue === 'manage') return true;
      if (action === 'view' && (permissionValue === 'read' || permissionValue === 'crud'))
        return true;
      if (action === 'create' && (permissionValue === 'write' || permissionValue === 'crud'))
        return true;
      if (action === 'update' && (permissionValue === 'write' || permissionValue === 'crud'))
        return true;
      if (action === 'delete' && (permissionValue === 'write' || permissionValue === 'crud'))
        return true;
    }

    return false;
  };

  const isInRole = (roleName: string): boolean => {
    return role?.name === roleName;
  };

  const canAccessBarangay = (barangayCode: string): boolean => {
    return userProfile?.barangay_code === barangayCode;
  };

  const isBarangayAdmin = (): boolean => {
    return role?.name === 'barangay_admin';
  };

  const value: AuthContextType = useMemo(() => ({
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
  }), [
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
  ]);

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
