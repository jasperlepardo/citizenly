'use client';

/**
 * Addresses Page
 * Philippine address management with location services and mapping
 */

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/templates';
import { AddressSearch } from '@/components/organisms';
import { testDatabaseConnection, type AddressHierarchy } from '@/lib/database';
import { logger, logError } from '@/lib/secure-logger';

export default function AddressesPage() {
  const [addressResults, setAddressResults] = useState<AddressHierarchy[]>([]);
  const [dbStats, setDbStats] = useState({
    regions: 0,
    provinces: 0,
    cities: 0,
    barangays: 0,
    connected: false,
  });
  const [loading, setLoading] = useState(true);

  // Test database connection and get real stats
  useEffect(() => {
    async function loadDatabaseStats() {
      try {
        setLoading(true);
        const result = await testDatabaseConnection();
        if (result.success && result.data) {
          setDbStats({
            regions: result.data.regions,
            provinces: result.data.provinces,
            cities: result.data.cities,
            barangays: result.data.barangays,
            connected: true,
          });
        } else {
          logger.warn('Database connection failed', {
            errors: result.errors,
            context: 'addresses_db_connection',
          });
          // Fallback to estimated values if DB is not available
          setDbStats({
            regions: 17,
            provinces: 86,
            cities: 1637,
            barangays: 38372,
            connected: false,
          });
        }
      } catch (error) {
        const err = error instanceof Error ? error : new Error(String(error));
        logError(err, 'DATABASE_CONNECTION_ERROR');
        logger.error('Database connection failed on addresses page');
        setDbStats({
          regions: 17,
          provinces: 86,
          cities: 1637,
          barangays: 38372,
          connected: false,
        });
      } finally {
        setLoading(false);
      }
    }

    loadDatabaseStats();
  }, []);

  // Calculate coverage percentage
  const calculateCoverage = (current: number, total: number) => {
    if (total === 0) return '0%';
    return `${Math.round((current / total) * 100)}%`;
  };

  // Address hierarchy statistics (dynamic based on real data)
  const addressStats = [
    {
      name: 'Regions',
      value: loading ? '...' : dbStats.regions.toLocaleString(),
      description: 'Administrative regions',
      gradient: 'from-blue-500 to-indigo-600',
      coverage: dbStats.connected ? '100%' : 'Offline',
    },
    {
      name: 'Provinces',
      value: loading ? '...' : dbStats.provinces.toLocaleString(),
      description: 'Provinces and NCR',
      gradient: 'from-emerald-500 to-green-600',
      coverage: dbStats.connected ? '100%' : 'Offline',
    },
    {
      name: 'Cities/Municipalities',
      value: loading ? '...' : dbStats.cities.toLocaleString(),
      description: 'Cities and municipalities',
      gradient: 'from-purple-500 to-pink-600',
      coverage: dbStats.connected ? '100%' : 'Offline',
    },
    {
      name: 'Barangays',
      value: loading ? '...' : dbStats.barangays.toLocaleString(),
      description: 'Barangay coverage',
      gradient: 'from-orange-500 to-red-600',
      coverage: dbStats.connected ? calculateCoverage(dbStats.barangays, 42028) : 'Offline',
    },
  ];

  // Handle address selection
  const handleAddressSelect = (address: AddressHierarchy) => {
    logger.debug('Address selected', {
      barangayCode: address.barangay_code,
      barangayName: address.barangay_name,
      context: 'address_selection',
    });
    // Add the selected address to results for display
    setAddressResults(prev => {
      // Check if already exists
      const exists = prev.some(addr => addr.barangay_code === address.barangay_code);
      if (exists) return prev;
      return [address, ...prev.slice(0, 9)]; // Keep only 10 results
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-montserrat text-2xl font-semibold text-primary">
            Address Management
          </h1>
          <p className="font-montserrat mt-1 text-secondary">
            Complete Philippine administrative address hierarchy and location services
          </p>
        </div>

        {/* Address Statistics Cards - Dashboard Style */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {addressStats.map(stat => (
            <div key={stat.name} className="rounded-lg border p-6 bg-surface border-default">
              <div className="font-montserrat mb-2 text-sm font-medium text-secondary">
                {stat.name}
              </div>
              <div className="font-montserrat mb-1 text-4xl font-bold text-primary">
                {stat.value}
              </div>
              <div className="flex items-center text-sm">
                <div className="mr-2 size-2 rounded-full bg-emerald-500"></div>
                <span className="font-medium text-emerald-600 dark:text-emerald-400">
                  {stat.coverage}
                </span>
              </div>
              <p className="mt-2 text-xs text-muted">{stat.description}</p>
            </div>
          ))}
        </div>

        {/* Address Search Section */}
        <div className="rounded-lg border p-6 bg-surface border-default">
          <div className="mb-6 border-b pb-4 border-default">
            <h3 className="font-montserrat text-lg font-semibold text-primary">
              Search Philippine Addresses
            </h3>
            <p className="font-montserrat mt-1 text-sm text-secondary">
              Search across {loading ? '...' : dbStats.barangays.toLocaleString()} barangays
              nationwide
            </p>
          </div>
          <AddressSearch
            onSelect={handleAddressSelect}
            placeholder="Search for region, province, city, or barangay..."
            maxResults={50}
            className="w-full"
          />
        </div>

        {/* Search Results */}
        {addressResults.length > 0 && (
          <div className="rounded-lg border bg-surface border-default">
            <div className="p-6">
              <div className="mb-6 border-b pb-4 border-default">
                <h3 className="font-montserrat text-lg font-semibold text-primary">
                  Recent Selections
                </h3>
                <p className="font-montserrat mt-1 text-sm text-secondary">
                  Recently selected {addressResults.length} address
                  {addressResults.length !== 1 ? 'es' : ''}
                </p>
              </div>
              <div className="flow-root">
                <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                  <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                    <table className="min-w-full">
                      <thead>
                        <tr className="border-b border-default">
                          <th
                            scope="col"
                            className="py-4 pl-4 pr-3 text-left text-sm font-semibold text-primary sm:pl-0"
                          >
                            Region
                          </th>
                          <th
                            scope="col"
                            className="px-3 py-4 text-left text-sm font-semibold text-primary"
                          >
                            Province
                          </th>
                          <th
                            scope="col"
                            className="px-3 py-4 text-left text-sm font-semibold text-primary"
                          >
                            City/Municipality
                          </th>
                          <th
                            scope="col"
                            className="px-3 py-4 text-left text-sm font-semibold text-primary"
                          >
                            Barangay
                          </th>
                          <th
                            scope="col"
                            className="px-3 py-4 text-left text-sm font-semibold text-primary"
                          >
                            Type
                          </th>
                          <th
                            scope="col"
                            className="px-3 py-4 text-left text-sm font-semibold text-primary"
                          >
                            Status
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-default divide-y">
                        {addressResults.map((address, index) => {
                          const status = (address as any).urban_rural_status ? 'complete' : 'partial';

                          return (
                            <tr
                              key={`${address.barangay_code}-${index}`}
                              className="transition-colors duration-200 hover:bg-surface-hover"
                            >
                              <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-primary sm:pl-0">
                                {address.region_name}
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-secondary">
                                {address.province_name || 'Metro Manila'}
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-secondary">
                                {address.city_municipality_name}
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-secondary">
                                {address.barangay_name}
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-secondary">
                                {address.city_municipality_type}
                              </td>
                              <td className="whitespace-nowrap px-3 py-4 text-sm text-secondary">
                                <span
                                  className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ring-inset ${
                                    status === 'complete'
                                      ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:bg-emerald-900/20 dark:text-emerald-400'
                                      : 'bg-amber-50 text-amber-700 ring-amber-600/20 dark:bg-amber-900/20 dark:text-amber-400'
                                  }`}
                                >
                                  {status === 'complete' ? 'Complete' : 'Partial'}
                                </span>
                                {address.is_independent && (
                                  <span className="ml-2 inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/20 dark:text-blue-400">
                                    Independent
                                  </span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Coverage Summary */}
        <div className="rounded-lg border p-6 bg-surface border-default">
          <div className="mb-6 border-b pb-4 border-default">
            <h3 className="font-montserrat text-lg font-semibold text-primary">
              Philippine Address Coverage
            </h3>
            <p className="font-montserrat mt-1 text-sm text-secondary">
              Comprehensive nationwide coverage with real-time data integration
            </p>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-lg border p-4 bg-background border-default">
              <div className="text-2xl font-bold text-emerald-600">
                {loading ? '...' : calculateCoverage(dbStats.barangays, 42028)}
              </div>
              <div className="mt-1 text-sm font-medium text-secondary">
                Nationwide Coverage {dbStats.connected ? '(Live)' : '(Offline)'}
              </div>
            </div>
            <div className="rounded-lg border p-4 bg-background border-default">
              <div className="text-2xl font-bold text-blue-600">
                {loading ? '...' : dbStats.barangays.toLocaleString()}
              </div>
              <div className="mt-1 text-sm font-medium text-secondary">
                Barangays {dbStats.connected ? 'Available' : 'Cached'}
              </div>
            </div>
            <div className="rounded-lg border p-4 bg-background border-default">
              <div className="text-2xl font-bold text-purple-600">{loading ? '...' : '17'}</div>
              <div className="mt-1 text-sm font-medium text-secondary">Regions Covered</div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
