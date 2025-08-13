'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { ChevronDown, MapPin, Building2, Home, Users } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface GeographicOption {
  code: string;
  name: string;
  type?: string;
  is_independent?: boolean;
}

export interface CascadingGeographicSelectorProps {
  onSelectionChange: (selection: {
    regionCode: string | null;
    regionName: string | null;
    provinceCode: string | null;
    provinceName: string | null;
    cityCode: string | null;
    cityName: string | null;
    barangayCode: string | null;
    barangayName: string | null;
  }) => void;
  initialValues?: {
    regionCode?: string;
    provinceCode?: string;
    cityCode?: string;
    barangayCode?: string;
  };
  disabled?: boolean;
  required?: boolean;
  autoPopulateFromUser?: boolean;
}

export function CascadingGeographicSelector({
  onSelectionChange,
  initialValues,
  disabled = false,
  required = false,
  autoPopulateFromUser = false,
}: CascadingGeographicSelectorProps) {
  // State for each level
  const [regions, setRegions] = useState<GeographicOption[]>([]);
  const [provinces, setProvinces] = useState<GeographicOption[]>([]);
  const [cities, setCities] = useState<GeographicOption[]>([]);
  const [barangays, setBarangays] = useState<GeographicOption[]>([]);

  // Selected values
  const [selectedRegion, setSelectedRegion] = useState<GeographicOption | null>(null);
  const [selectedProvince, setSelectedProvince] = useState<GeographicOption | null>(null);
  const [selectedCity, setSelectedCity] = useState<GeographicOption | null>(null);
  const [selectedBarangay, setSelectedBarangay] = useState<GeographicOption | null>(null);

  // Search states
  const [regionSearch, setRegionSearch] = useState('');
  const [provinceSearch, setProvinceSearch] = useState('');
  const [citySearch, setCitySearch] = useState('');
  const [barangaySearch, setBarangaySearch] = useState('');

  // Loading states
  const [loadingRegions, setLoadingRegions] = useState(false);
  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingBarangays, setLoadingBarangays] = useState(false);
  const [initialHierarchyLoaded, setInitialHierarchyLoaded] = useState(false);

  // Note: Auth headers helper available for future authenticated endpoints
  // const getAuthHeaders = useCallback(async (): Promise<HeadersInit> => {
  //   const { data: { session } } = await supabase.auth.getSession();
  //   return session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {};
  // }, []);

  // API calls
  const fetchRegions = useCallback(async () => {
    setLoadingRegions(true);
    try {
      const response = await fetch('/api/addresses/regions/public');
      if (response.ok) {
        const data = await response.json();
        setRegions(data.data || []);
      } else {
        console.error('Failed to fetch regions:', response.status);
      }
    } catch (error) {
      console.error('Error fetching regions:', error);
    } finally {
      setLoadingRegions(false);
    }
  }, []);

  const fetchProvinces = useCallback(
    async (regionCode: string) => {
      if (!regionCode) return;
      setLoadingProvinces(true);
      try {
        const response = await fetch(`/api/addresses/provinces/public?regionCode=${regionCode}`);
        if (response.ok) {
          const data = await response.json();
          setProvinces(data.data || []);
        } else {
          console.error('Failed to fetch provinces:', response.status);
        }
      } catch (error) {
        console.error('Error fetching provinces:', error);
      } finally {
        setLoadingProvinces(false);
      }
    },
    []
  );

  const fetchCities = useCallback(
    async (provinceCode: string) => {
      if (!provinceCode) return;
      setLoadingCities(true);
      try {
        const response = await fetch(`/api/addresses/cities/public?provinceCode=${provinceCode}`);
        if (response.ok) {
          const data = await response.json();
          setCities(data.data || []);
        } else {
          console.error('Failed to fetch cities:', response.status);
        }
      } catch (error) {
        console.error('Error fetching cities:', error);
      } finally {
        setLoadingCities(false);
      }
    },
    []
  );

  const fetchBarangays = useCallback(
    async (cityCode: string) => {
      if (!cityCode) return;
      setLoadingBarangays(true);
      try {
        const response = await fetch(`/api/addresses/barangays/public?cityCode=${cityCode}`);
        if (response.ok) {
          const data = await response.json();
          setBarangays(data.data || []);
        } else {
          console.error('Failed to fetch barangays:', response.status);
        }
      } catch (error) {
        console.error('Error fetching barangays:', error);
      } finally {
        setLoadingBarangays(false);
      }
    },
    []
  );

  // Auto-populate from logged-in user's location using dedicated API
  const autoPopulateFromUserLocation = useCallback(async () => {
    if (!autoPopulateFromUser) return;
    
    console.log('🔄 Auto-populating from user location...');
    
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        console.log('❌ No user session found');
        return;
      }
      
      console.log('✅ User session found:', session.user.email);

      // Use dedicated API endpoint for secure multi-tenant auto-populate
      const response = await fetch('/api/user/geographic-location', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Auto-populate API error:', response.status, errorText);
        return;
      }

      const hierarchy = await response.json();
      console.log('✅ Geographic hierarchy received:', hierarchy);

      // Set region and load provinces
      if (hierarchy.region) {
        setSelectedRegion(hierarchy.region);
        setRegionSearch(hierarchy.region.name);
        await fetchProvinces(hierarchy.region.code);

        // Set province and load cities
        if (hierarchy.province) {
          setSelectedProvince(hierarchy.province);
          setProvinceSearch(hierarchy.province.name);
          await fetchCities(hierarchy.province.code);

          // Set city and load barangays
          if (hierarchy.city) {
            setSelectedCity(hierarchy.city);
            setCitySearch(hierarchy.city.name);
            await fetchBarangays(hierarchy.city.code);

            // Set barangay
            if (hierarchy.barangay) {
              setSelectedBarangay(hierarchy.barangay);
              setBarangaySearch(hierarchy.barangay.name);
            }
          }
        }
      }

      console.log('🎉 Auto-population completed successfully');
    } catch (error) {
      console.error('❌ Error auto-populating user location:', error);
    }
  }, [autoPopulateFromUser, fetchProvinces, fetchCities, fetchBarangays]);

  // Load initial data
  useEffect(() => {
    fetchRegions();
  }, [fetchRegions]);

  // Handle initialValues - load the full hierarchy if codes are provided (only once)
  useEffect(() => {
    const loadInitialHierarchy = async () => {
      if (!initialValues?.regionCode || !regions.length || initialHierarchyLoaded) return;
      
      console.log('🔧 Loading initial hierarchy from form data:', initialValues);
      setInitialHierarchyLoaded(true); // Prevent re-runs
      
      try {
        // Find and set region
        const region = regions.find(r => r.code === initialValues.regionCode);
        if (region) {
          setSelectedRegion(region);
          setRegionSearch(region.name);
          
          // Load provinces and find the selected one
          if (initialValues.provinceCode) {
            const provinceResponse = await fetch(`/api/addresses/provinces/public?regionCode=${initialValues.regionCode}`);
            if (provinceResponse.ok) {
              const provinceResult = await provinceResponse.json();
              setProvinces(provinceResult.data || []);
              const province = provinceResult.data?.find((p: any) => p.code === initialValues.provinceCode);
              
              if (province) {
                setSelectedProvince(province);
                setProvinceSearch(province.name);
                
                // Load cities and find the selected one
                if (initialValues.cityCode) {
                  const cityResponse = await fetch(`/api/addresses/cities/public?provinceCode=${initialValues.provinceCode}`);
                  if (cityResponse.ok) {
                    const cityResult = await cityResponse.json();
                    setCities(cityResult.data || []);
                    const city = cityResult.data?.find((c: any) => c.code === initialValues.cityCode);
                    
                    if (city) {
                      setSelectedCity(city);
                      setCitySearch(city.name);
                      
                      // Load barangays and find the selected one
                      if (initialValues.barangayCode) {
                        const barangayResponse = await fetch(`/api/addresses/barangays/public?cityCode=${initialValues.cityCode}`);
                        if (barangayResponse.ok) {
                          const barangayResult = await barangayResponse.json();
                          setBarangays(barangayResult.data || []);
                          const barangay = barangayResult.data?.find((b: any) => b.code === initialValues.barangayCode);
                          
                          if (barangay) {
                            setSelectedBarangay(barangay);
                            setBarangaySearch(barangay.name);
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
        
        console.log('✅ Initial hierarchy loaded successfully');
      } catch (error) {
        console.error('❌ Error loading initial hierarchy:', error);
      }
    };
    
    loadInitialHierarchy();
  }, [initialValues, regions, initialHierarchyLoaded]);

  // Auto-populate after regions are loaded (only if no initial values provided)
  useEffect(() => {
    if (regions.length > 0 && autoPopulateFromUser && !initialValues?.regionCode) {
      autoPopulateFromUserLocation();
    }
  }, [regions, autoPopulateFromUser, autoPopulateFromUserLocation, initialValues?.regionCode]);

  // Handle selection changes
  const handleRegionSelect = useCallback(
    (region: GeographicOption) => {
      setSelectedRegion(region);
      setSelectedProvince(null);
      setSelectedCity(null);
      setSelectedBarangay(null);
      setProvinces([]);
      setCities([]);
      setBarangays([]);
      setRegionSearch(region.name);
      setProvinceSearch('');
      setCitySearch('');
      setBarangaySearch('');
      fetchProvinces(region.code);
    },
    [fetchProvinces]
  );

  const handleProvinceSelect = useCallback(
    (province: GeographicOption) => {
      setSelectedProvince(province);
      setSelectedCity(null);
      setSelectedBarangay(null);
      setCities([]);
      setBarangays([]);
      setProvinceSearch(province.name);
      setCitySearch('');
      setBarangaySearch('');
      fetchCities(province.code);
    },
    [fetchCities]
  );

  const handleCitySelect = useCallback(
    (city: GeographicOption) => {
      setSelectedCity(city);
      setSelectedBarangay(null);
      setBarangays([]);
      setCitySearch(`${city.name}${city.type ? ` (${city.type})` : ''}`);
      setBarangaySearch('');
      fetchBarangays(city.code);
    },
    [fetchBarangays]
  );

  const handleBarangaySelect = useCallback((barangay: GeographicOption) => {
    setSelectedBarangay(barangay);
    setBarangaySearch(barangay.name);
  }, []);

  // Update parent component when selection changes
  useEffect(() => {
    onSelectionChange({
      regionCode: selectedRegion?.code || null,
      regionName: selectedRegion?.name || null,
      provinceCode: selectedProvince?.code || null,
      provinceName: selectedProvince?.name || null,
      cityCode: selectedCity?.code || null,
      cityName: selectedCity?.name || null,
      barangayCode: selectedBarangay?.code || null,
      barangayName: selectedBarangay?.name || null,
    });
  }, [selectedRegion, selectedProvince, selectedCity, selectedBarangay, onSelectionChange]);

  // Filter functions
  const filterOptions = (options: GeographicOption[], searchTerm: string) => {
    if (!searchTerm) return options.slice(0, 10); // Limit to 10 for performance
    return options
      .filter(
        option =>
          option.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          option.code.includes(searchTerm)
      )
      .slice(0, 10);
  };

  // Dropdown component
  const DropdownSelector = ({
    label,
    icon: Icon,
    value: _value,
    searchValue,
    onSearchChange,
    options,
    onSelect,
    loading,
    disabled: fieldDisabled,
    placeholder,
    required: fieldRequired,
  }: {
    label: string;
    icon: any;
    value: string;
    searchValue: string;
    onSearchChange: (value: string) => void;
    options: GeographicOption[];
    onSelect: (option: GeographicOption) => void;
    loading: boolean;
    disabled: boolean;
    placeholder: string;
    required?: boolean;
  }) => {
    const [isOpen, setIsOpen] = useState(false);
    const filteredOptions = filterOptions(options, searchValue);

    return (
      <div className="relative">
        <label className="mb-1 block text-sm font-medium text-gray-700">
          {label}
          {fieldRequired && <span className="ml-1 text-red-500">*</span>}
        </label>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Icon className="h-4 w-4 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchValue}
            onChange={e => {
              onSearchChange(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            disabled={fieldDisabled || disabled}
            placeholder={placeholder}
            className="block w-full rounded-lg border border-gray-300 py-2 pl-10 pr-10 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 disabled:cursor-not-allowed disabled:bg-gray-100"
          />
          <div className="absolute inset-y-0 right-0 flex items-center pr-3">
            {loading ? (
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
            ) : (
              <ChevronDown
                className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180 transform' : ''}`}
                onClick={() => !fieldDisabled && !disabled && setIsOpen(!isOpen)}
              />
            )}
          </div>
        </div>

        {isOpen && !fieldDisabled && !disabled && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
            <div className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-gray-300 bg-white shadow-lg">
              {loading ? (
                <div className="px-4 py-3 text-sm text-gray-500">Loading...</div>
              ) : filteredOptions.length > 0 ? (
                filteredOptions.map(option => (
                  <button
                    key={option.code}
                    type="button"
                    onClick={() => {
                      onSelect(option);
                      setIsOpen(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm first:rounded-t-lg last:rounded-b-lg hover:bg-blue-50 focus:bg-blue-50 focus:outline-none"
                  >
                    <div className="font-medium text-gray-900">
                      {option.name}
                      {option.type && <span className="text-gray-500"> ({option.type})</span>}
                    </div>
                    <div className="text-xs text-gray-500">Code: {option.code}</div>
                  </button>
                ))
              ) : (
                <div className="px-4 py-3 text-sm text-gray-500">
                  {searchValue ? 'No matches found' : 'Start typing to search...'}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-lg font-semibold text-gray-800">
        <MapPin className="h-5 w-5 text-blue-600" />
        Geographic Location
      </div>

      {/* Region Selector */}
      <DropdownSelector
        label="Region"
        icon={Users}
        value={selectedRegion?.name || ''}
        searchValue={regionSearch}
        onSearchChange={setRegionSearch}
        options={regions}
        onSelect={handleRegionSelect}
        loading={loadingRegions}
        disabled={disabled}
        placeholder="Search for a region..."
        required={required}
      />

      {/* Province Selector */}
      <DropdownSelector
        label="Province"
        icon={Building2}
        value={selectedProvince?.name || ''}
        searchValue={provinceSearch}
        onSearchChange={setProvinceSearch}
        options={provinces}
        onSelect={handleProvinceSelect}
        loading={loadingProvinces}
        disabled={!selectedRegion || disabled}
        placeholder={selectedRegion ? 'Search for a province...' : 'Select a region first'}
        required={required}
      />

      {/* City/Municipality Selector */}
      <DropdownSelector
        label="City/Municipality"
        icon={Building2}
        value={
          selectedCity
            ? `${selectedCity.name}${selectedCity.type ? ` (${selectedCity.type})` : ''}`
            : ''
        }
        searchValue={citySearch}
        onSearchChange={setCitySearch}
        options={cities}
        onSelect={handleCitySelect}
        loading={loadingCities}
        disabled={!selectedProvince || disabled}
        placeholder={
          selectedProvince ? 'Search for a city/municipality...' : 'Select a province first'
        }
        required={required}
      />

      {/* Barangay Selector */}
      <DropdownSelector
        label="Barangay"
        icon={Home}
        value={selectedBarangay?.name || ''}
        searchValue={barangaySearch}
        onSearchChange={setBarangaySearch}
        options={barangays}
        onSelect={handleBarangaySelect}
        loading={loadingBarangays}
        disabled={!selectedCity || disabled}
        placeholder={selectedCity ? 'Search for a barangay...' : 'Select a city/municipality first'}
        required={required}
      />

      {/* Selection Summary */}
      {selectedBarangay && (
        <div className="mt-4 rounded-lg border border-green-200 bg-green-50 p-4">
          <h4 className="mb-2 text-sm font-medium text-green-800">Selected Location:</h4>
          <div className="space-y-1 text-sm text-green-700">
            <div>
              Region: {selectedRegion?.name} ({selectedRegion?.code})
            </div>
            <div>
              Province: {selectedProvince?.name} ({selectedProvince?.code})
            </div>
            <div>
              City/Municipality: {selectedCity?.name} ({selectedCity?.code})
            </div>
            <div>
              Barangay: {selectedBarangay?.name} ({selectedBarangay?.code})
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
