'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

// User profile types based on database schema
export interface UserProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  middle_name?: string;
  phone?: string;
  mobile_number?: string;
  barangay_code: string;
  role_id: string;
  is_active: boolean;
  last_login?: string;
  created_at: string;
  updated_at: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: Record<string, any>;
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

  // Methods
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;

  // Helper methods
  hasPermission: (permission: string) => boolean;
  isInRole: (roleName: string) => boolean;
  canAccessBarangay: (barangayCode: string) => boolean;
  isBarangayAdmin: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  // Core auth state
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Profile state
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  // Load user profile and related data (simplified for original schema)
  const loadUserProfile = async (userId: string) => {
    try {
      setProfileLoading(true);
      console.log('Loading user profile for:', userId);

      // Try real database query first
      console.log('Attempting real database query...');
      const startTime = Date.now();

      // Set a shorter timeout for this specific query
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Profile query timeout')), 5000); // 5 second timeout
      });

      const profilePromise = supabase.from('user_profiles').select('*').eq('id', userId).single();

      try {
        // Race between the query and timeout
        const { data: profile, error: profileError } = (await Promise.race([
          profilePromise,
          timeoutPromise,
        ])) as any;

        const queryTime = Date.now() - startTime;
        console.log(`Profile query completed successfully in ${queryTime}ms`);

        if (profileError) {
          console.error('Profile query error:', profileError);
          throw profileError;
        }

        if (!profile) {
          console.error('No profile found for user:', userId);
          throw new Error('Profile not found');
        }

        // Now get the role separately
        console.log('Loading role for role_id:', profile.role_id);
        const { data: role, error: roleError } = await supabase
          .from('roles')
          .select('*')
          .eq('id', profile.role_id)
          .single();

        if (roleError) {
          console.warn('Role query error (using default permissions):', roleError);
          // Continue with profile but default permissions
        }

        console.log('Profile loaded successfully:', profile);
        console.log('Role loaded:', role);

        setUserProfile(profile);
        setRole(
          role || {
            id: 'default-role',
            name: 'User',
            description: 'Default role',
            permissions: { residents_view: true },
          }
        );
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

        if (session?.user) {
          // Load profile in background, don't block main loading
          loadUserProfile(session.user.id).catch(err => {
            console.error('Profile loading failed:', err);
          });
        }

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

      if (event === 'SIGNED_IN' && session?.user) {
        await loadUserProfile(session.user.id);
      } else if (event === 'SIGNED_OUT') {
        setUserProfile(null);
        setRole(null);
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
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    return { error };
  };

  // Sign out method
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
    }
  };

  // Refresh profile method
  const refreshProfile = async () => {
    if (user) {
      await loadUserProfile(user.id);
    }
  };

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

  const value: AuthContextType = {
    // State
    session,
    user,
    userProfile,
    role,
    loading,
    profileLoading,

    // Methods
    signIn,
    signOut,
    refreshProfile,

    // Helpers
    hasPermission,
    isInRole,
    canAccessBarangay,
    isBarangayAdmin,
  };

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
      signIn: async () => ({ error: new Error('AuthProvider not available') }),
      signOut: async () => {},
      signUp: async () => ({ error: new Error('AuthProvider not available') }),
      updateProfile: async () => ({ error: new Error('AuthProvider not available') }),
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
  }, [auth.loading, auth.profileLoading, auth.user, auth.role, requiredRole]);

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
  }, [auth.loading, auth.profileLoading, auth.user, auth.role, permission]);

  return auth;
}
