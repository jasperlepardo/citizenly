'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { getCompleteAddress, type AddressHierarchy } from '@/lib/database';

export interface UserBarangayInfo {
  barangayCode: string | null;
  address: AddressHierarchy | null;
  loading: boolean;
  error: string | null;
}

/**
 * Hook to get the current user's primary barangay assignment and address hierarchy
 * This is used for auto-populating address fields in forms
 */
export function useUserBarangay(): UserBarangayInfo {
  const { userProfile, loading: authLoading, user } = useAuth();
  const [address, setAddress] = useState<AddressHierarchy | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadBarangayAddress = async () => {
      // Wait for auth to load
      if (authLoading) {
        return;
      }

      // User must be authenticated
      if (!user) {
        setError(null); // Don't show error for unauthenticated users - let ProtectedRoute handle it
        setLoading(false);
        return;
      }

      // User must have a barangay assignment
      if (!userProfile?.barangay_code) {
        setError('No barangay assignment found. Please contact your administrator.');
        setLoading(false);
        setAddress(null);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Get complete address hierarchy for the user's barangay
        const addressData = await getCompleteAddress(userProfile.barangay_code);

        if (addressData) {
          setAddress(addressData);
        } else {
          setError('Unable to load barangay address information');
        }
      } catch (err) {
        // Error already handled by setting error state
        setError('Failed to load barangay information');
      } finally {
        setLoading(false);
      }
    };

    loadBarangayAddress();
  }, [authLoading, user, userProfile]);

  return {
    barangayCode: userProfile?.barangay_code || null,
    address,
    loading: authLoading || loading,
    error,
  };
}

/**
 * Hook to check if current user can access a specific barangay
 */
export function useBarangayAccess(barangayCode: string): boolean {
  const { canAccessBarangay } = useAuth();
  return canAccessBarangay(barangayCode);
}

/**
 * Hook to get all barangays the current user can access
 */
export function useUserBarangays() {
  const { userProfile, loading } = useAuth();

  // For now, return the user's single barangay assignment
  // In the future, this could support multiple barangay access
  const barangayAccounts = userProfile?.barangay_code
    ? [
        {
          barangay_code: userProfile.barangay_code,
          is_primary: true,
        },
      ]
    : [];

  return {
    barangayAccounts,
    barangayCodes: barangayAccounts.map(account => account.barangay_code),
    loading,
  };
}
