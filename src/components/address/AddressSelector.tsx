'use client'

/**
 * Cascading Address Selector Component
 * Complete Philippine address selection with Region → Province → City → Barangay cascade
 * Leverages 91% nationwide coverage (38,372 barangays, 1,637 cities)
 */

import React, { useState, useEffect } from 'react'
import { DropdownSelect } from '../molecules'
import {
  getRegions,
  getProvincesByRegion,
  getCitiesByProvince,
  getBarangaysByCity,
  getMetroManilaCities,
  type Region,
  type Province,
  type City,
  type Barangay
} from '@/lib/database'

// Address selection state
export interface AddressSelection {
  region: string
  province: string
  city: string
  barangay: string
}

interface AddressSelectorProps {
  value: AddressSelection
  onChange: (address: AddressSelection) => void
  disabled?: boolean
  required?: boolean
  className?: string
  showLabels?: boolean
  compact?: boolean
}

export default function AddressSelector({
  value,
  onChange,
  disabled = false,
  required = false,
  className = "",
  showLabels = true,
  compact = false
}: AddressSelectorProps) {
  // Data states
  const [regions, setRegions] = useState<Region[]>([])
  const [provinces, setProvinces] = useState<Province[]>([])
  const [cities, setCities] = useState<City[]>([])
  const [barangays, setBarangays] = useState<Barangay[]>([])

  // Loading states
  const [loadingRegions, setLoadingRegions] = useState(true)
  const [loadingProvinces, setLoadingProvinces] = useState(false)
  const [loadingCities, setLoadingCities] = useState(false)
  const [loadingBarangays, setLoadingBarangays] = useState(false)

  // Error states
  const [errors, setErrors] = useState({
    region: '',
    province: '', 
    city: '',
    barangay: ''
  })

  // Load regions on component mount
  useEffect(() => {
    async function loadRegions() {
      try {
        setLoadingRegions(true)
        const regionsData = await getRegions()
        setRegions(regionsData)
        setErrors(prev => ({ ...prev, region: '' }))
      } catch (error) {
        console.error('Error loading regions:', error)
        setErrors(prev => ({ ...prev, region: 'Failed to load regions' }))
      } finally {
        setLoadingRegions(false)
      }
    }

    loadRegions()
  }, [])

  // Load provinces when region changes
  useEffect(() => {
    async function loadProvinces() {
      if (!value.region) {
        setProvinces([])
        return
      }

      try {
        setLoadingProvinces(true)
        const provincesData = await getProvincesByRegion(value.region)
        setProvinces(provincesData)
        setErrors(prev => ({ ...prev, province: '' }))

        // Special handling for NCR (Metro Manila)
        if (value.region === '13' || value.region === 'NCR') {
          const metroManilaCities = await getMetroManilaCities()
          if (metroManilaCities.length > 0) {
            // For NCR, we can directly load cities since they're independent
            setCities(metroManilaCities)
          }
        }
      } catch (error) {
        console.error('Error loading provinces:', error)
        setErrors(prev => ({ ...prev, province: 'Failed to load provinces' }))
      } finally {
        setLoadingProvinces(false)
      }
    }

    loadProvinces()
  }, [value.region])

  // Load cities when province changes
  useEffect(() => {
    async function loadCities() {
      if (!value.province) {
        setCities([])
        return
      }

      try {
        setLoadingCities(true)
        const citiesData = await getCitiesByProvince(value.province)
        setCities(citiesData)
        setErrors(prev => ({ ...prev, city: '' }))
      } catch (error) {
        console.error('Error loading cities:', error)
        setErrors(prev => ({ ...prev, city: 'Failed to load cities' }))
      } finally {
        setLoadingCities(false)
      }
    }

    loadCities()
  }, [value.province])

  // Load barangays when city changes
  useEffect(() => {
    async function loadBarangays() {
      if (!value.city) {
        setBarangays([])
        return
      }

      try {
        setLoadingBarangays(true)
        const barangaysData = await getBarangaysByCity(value.city)
        setBarangays(barangaysData)
        setErrors(prev => ({ ...prev, barangay: '' }))
      } catch (error) {
        console.error('Error loading barangays:', error)
        setErrors(prev => ({ ...prev, barangay: 'Failed to load barangays' }))
      } finally {
        setLoadingBarangays(false)
      }
    }

    loadBarangays()
  }, [value.city])

  // Handle selection changes with cascade reset
  const handleRegionChange = (regionCode: string) => {
    onChange({
      region: regionCode,
      province: '',
      city: '',
      barangay: ''
    })
    setProvinces([])
    setCities([])
    setBarangays([])
  }

  const handleProvinceChange = (provinceCode: string) => {
    onChange({
      ...value,
      province: provinceCode,
      city: '',
      barangay: ''
    })
    setCities([])
    setBarangays([])
  }

  const handleCityChange = (cityCode: string) => {
    onChange({
      ...value,
      city: cityCode,
      barangay: ''
    })
    setBarangays([])
  }

  const handleBarangayChange = (barangayCode: string) => {
    onChange({
      ...value,
      barangay: barangayCode
    })
  }

  // Convert data to select options
  const regionOptions = regions.map(region => ({
    value: region.code,
    label: region.name
  }))

  const provinceOptions = provinces.map(province => ({
    value: province.code,
    label: province.name
  }))

  const cityOptions = cities.map(city => ({
    value: city.code,
    label: `${city.name} (${city.type})`
  }))

  const barangayOptions = barangays.map(barangay => ({
    value: barangay.code,
    label: barangay.name
  }))

  // Check if NCR (independent cities, no provinces)
  const isNCR = value.region === '13' || value.region === 'NCR'
  const showProvinceSelect = !isNCR || provinces.length > 0

  const containerClass = compact 
    ? "grid grid-cols-2 md:grid-cols-4 gap-3"
    : "space-y-4"

  return (
    <div className={`${className}`}>
      {showLabels && !compact && (
        <h3 className="text-lg font-medium text-primary mb-4">
          <span className="text-base">📍</span> Address Selection
        </h3>
      )}

      <div className={containerClass}>
        {/* Region Selection */}
        <DropdownSelect
          label={showLabels ? "Region" : undefined}
          options={regionOptions}
          value={value.region}
          onChange={(val) => handleRegionChange(val)}
          placeholder="Select Region"
          disabled={disabled}
          loading={loadingRegions}
          errorMessage={errors.region}
        />

        {/* Province Selection */}
        {showProvinceSelect && (
          <DropdownSelect
            label={showLabels ? "Province" : undefined}
            options={provinceOptions}
            value={value.province}
            onChange={(val) => handleProvinceChange(val)}
            placeholder={isNCR ? "Metro Manila" : "Select Province"}
            disabled={disabled || !value.region}
            loading={loadingProvinces}
            errorMessage={errors.province}
          />
        )}

        {/* City Selection */}
        <DropdownSelect
          label={showLabels ? "City/Municipality" : undefined}
          options={cityOptions}
          value={value.city}
          onChange={(val) => handleCityChange(val)}
          placeholder="Select City/Municipality"
          disabled={disabled || (!isNCR ? !value.province : !value.region)}
          loading={loadingCities}
          errorMessage={errors.city}
        />

        {/* Barangay Selection */}
        <DropdownSelect
          label={showLabels ? "Barangay" : undefined}
          options={barangayOptions}
          value={value.barangay}
          onChange={(val) => handleBarangayChange(val)}
          placeholder="Select Barangay"
          disabled={disabled || !value.city}
          loading={loadingBarangays}
          errorMessage={errors.barangay}
        />
      </div>

      {/* Address Summary */}
      {!compact && (value.region || value.province || value.city || value.barangay) && (
        <div className="mt-4 p-3 bg-background-muted rounded-md">
          <h4 className="text-sm font-medium text-primary mb-2">Selected Address:</h4>
          <div className="text-sm text-secondary">
            {[
              regions.find(r => r.code === value.region)?.name,
              provinces.find(p => p.code === value.province)?.name,
              cities.find(c => c.code === value.city)?.name,
              barangays.find(b => b.code === value.barangay)?.name
            ].filter(Boolean).join(', ') || 'Incomplete address'}
          </div>
        </div>
      )}

      {/* Coverage Info */}
      {!compact && (
        <div className="mt-4 text-xs text-muted">
          <span className="text-xs">🗺️</span> Coverage: 17 regions, 86 provinces, 1,637 cities, 38,372 barangays (91% nationwide)
        </div>
      )}
    </div>
  )
}