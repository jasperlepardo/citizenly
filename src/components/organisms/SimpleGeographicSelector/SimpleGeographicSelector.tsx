'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { DropdownSelect, DropdownOption } from '@/components/molecules/DropdownSelect';
import { supabase } from '@/lib/supabase';

interface SimpleGeographicSelectorProps {
  regionCode?: string;
  provinceCode?: string;
  cityCode?: string;
  barangayCode?: string;
  onRegionChange?: (code: string) => void;
  onProvinceChange?: (code: string) => void;
  onCityChange?: (code: string) => void;
  onBarangayChange?: (code: string) => void;
  required?: boolean;
  disabled?: boolean;
  autoPopulateFromUser?: boolean;
}

export function SimpleGeographicSelector({
  regionCode = '',
  provinceCode = '',
  cityCode = '',
  barangayCode = '',
  onRegionChange,
  onProvinceChange,
  onCityChange,
  onBarangayChange,
  required = false,
  disabled = false,
  autoPopulateFromUser = false,
}: SimpleGeographicSelectorProps) {
  // Options state
  const [regionOptions, setRegionOptions] = useState<DropdownOption[]>([]);
  const [provinceOptions, setProvinceOptions] = useState<DropdownOption[]>([]);
  const [cityOptions, setCityOptions] = useState<DropdownOption[]>([]);
  const [barangayOptions, setBarangayOptions] = useState<DropdownOption[]>([]);

  // Loading states
  const [loadingRegions, setLoadingRegions] = useState(false);
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingBarangays, setLoadingBarangays] = useState(false);

  // Fetch functions using public APIs
  const fetchRegions = useCallback(async () => {
    setLoadingRegions(true);
    try {
      const response = await fetch('/api/addresses/regions/public');
      if (response.ok) {
        const result = await response.json();
        const options = (result.data || []).map((region: any) => ({
          value: region.code,
          label: region.name,
        }));
        setRegionOptions(options);
      }
    } catch (error) {
      console.error('Error fetching regions:', error);
    } finally {
      setLoadingRegions(false);
    }
  }, []);

  const fetchProvinces = useCallback(async (regionCode: string) => {
    if (!regionCode) {
      setProvinceOptions([]);
      return;
    }

    setLoadingProvinces(true);
    try {
      const response = await fetch(`/api/addresses/provinces/public?regionCode=${regionCode}`);
      if (response.ok) {
        const result = await response.json();
        const options = (result.data || []).map((province: any) => ({
          value: province.code,
          label: province.name,
        }));
        setProvinceOptions(options);
      }
    } catch (error) {
      console.error('Error fetching provinces:', error);
    } finally {
      setLoadingProvinces(false);
    }
  }, []);

  const fetchCities = useCallback(async (provinceCode: string) => {
    if (!provinceCode) {
      setCityOptions([]);
      return;
    }

    setLoadingCities(true);
    try {
      const response = await fetch(`/api/addresses/cities/public?provinceCode=${provinceCode}`);
      if (response.ok) {
        const result = await response.json();
        const options = (result.data || []).map((city: any) => ({
          value: city.code,
          label: city.name,
        }));
        setCityOptions(options);
      }
    } catch (error) {
      console.error('Error fetching cities:', error);
    } finally {
      setLoadingCities(false);
    }
  }, []);

  const fetchBarangays = useCallback(async (cityCode: string) => {
    if (!cityCode) {
      setBarangayOptions([]);
      return;
    }

    setLoadingBarangays(true);
    try {
      const response = await fetch(`/api/addresses/barangays/public?cityCode=${cityCode}`);
      if (response.ok) {
        const result = await response.json();
        const options = (result.data || []).map((barangay: any) => ({
          value: barangay.code,
          label: barangay.name,
        }));
        setBarangayOptions(options);
      }
    } catch (error) {
      console.error('Error fetching barangays:', error);
    } finally {
      setLoadingBarangays(false);
    }
  }, []);

  // Auto-populate from user profile
  const autoPopulateFromUserProfile = useCallback(async () => {
    if (!autoPopulateFromUser) return;

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session?.user) return;

      console.log('🚀 Auto-populating geographic data...');

      const response = await fetch('/api/user/geographic-location', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) return;

      const hierarchy = await response.json();
      console.log('✅ Geographic data loaded:', hierarchy);

      // Trigger changes for each level
      if (hierarchy.region && onRegionChange) {
        onRegionChange(hierarchy.region.code);
      }
      if (hierarchy.province && onProvinceChange) {
        onProvinceChange(hierarchy.province.code);
      }
      if (hierarchy.city && onCityChange) {
        onCityChange(hierarchy.city.code);
      }
      if (hierarchy.barangay && onBarangayChange) {
        onBarangayChange(hierarchy.barangay.code);
      }
    } catch (error) {
      console.error('❌ Error auto-populating:', error);
    }
  }, [autoPopulateFromUser, onRegionChange, onProvinceChange, onCityChange, onBarangayChange]);

  // Load initial data
  useEffect(() => {
    fetchRegions();
  }, [fetchRegions]);

  // Auto-populate on mount
  useEffect(() => {
    if (regionOptions.length > 0) {
      autoPopulateFromUserProfile();
    }
  }, [regionOptions.length, autoPopulateFromUserProfile]);

  // Load cascading data when parent selections change
  useEffect(() => {
    if (regionCode) {
      fetchProvinces(regionCode);
    } else {
      setProvinceOptions([]);
      setCityOptions([]);
      setBarangayOptions([]);
    }
  }, [regionCode, fetchProvinces]);

  useEffect(() => {
    if (provinceCode) {
      fetchCities(provinceCode);
    } else {
      setCityOptions([]);
      setBarangayOptions([]);
    }
  }, [provinceCode, fetchCities]);

  useEffect(() => {
    if (cityCode) {
      fetchBarangays(cityCode);
    } else {
      setBarangayOptions([]);
    }
  }, [cityCode, fetchBarangays]);

  // Handle changes
  const handleRegionChange = (value: string) => {
    onRegionChange?.(value);
    // Clear dependent selections
    onProvinceChange?.('');
    onCityChange?.('');
    onBarangayChange?.('');
  };

  const handleProvinceChange = (value: string) => {
    onProvinceChange?.(value);
    // Clear dependent selections
    onCityChange?.('');
    onBarangayChange?.('');
  };

  const handleCityChange = (value: string) => {
    onCityChange?.(value);
    // Clear dependent selections
    onBarangayChange?.('');
  };

  return (
    <div className="space-y-4">
      <DropdownSelect
        label="Region"
        placeholder={loadingRegions ? 'Loading regions...' : 'Select a region'}
        options={regionOptions}
        value={regionCode}
        onChange={handleRegionChange}
        disabled={disabled || loadingRegions}
        variant={required && !regionCode ? 'error' : 'default'}
      />

      <DropdownSelect
        label="Province"
        placeholder={
          loadingProvinces
            ? 'Loading provinces...'
            : regionCode
              ? 'Select a province'
              : 'Select a region first'
        }
        options={provinceOptions}
        value={provinceCode}
        onChange={handleProvinceChange}
        disabled={disabled || !regionCode || loadingProvinces}
        variant={required && regionCode && !provinceCode ? 'error' : 'default'}
      />

      <DropdownSelect
        label="City/Municipality"
        placeholder={
          loadingCities
            ? 'Loading cities...'
            : provinceCode
              ? 'Select a city/municipality'
              : 'Select a province first'
        }
        options={cityOptions}
        value={cityCode}
        onChange={handleCityChange}
        disabled={disabled || !provinceCode || loadingCities}
        variant={required && provinceCode && !cityCode ? 'error' : 'default'}
      />

      <DropdownSelect
        label="Barangay"
        placeholder={
          loadingBarangays
            ? 'Loading barangays...'
            : cityCode
              ? 'Select a barangay'
              : 'Select a city/municipality first'
        }
        options={barangayOptions}
        value={barangayCode}
        onChange={onBarangayChange}
        disabled={disabled || !cityCode || loadingBarangays}
        variant={required && cityCode && !barangayCode ? 'error' : 'default'}
      />
    </div>
  );
}
