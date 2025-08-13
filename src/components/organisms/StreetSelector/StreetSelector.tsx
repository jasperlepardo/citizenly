'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { logger, logError } from '@/lib/secure-logger';

interface Street {
  id: string;
  name: string;
  barangay_code: string;
  subdivision_id?: string;
  subdivision_name?: string;
  description?: string;
}

interface StreetSelectorProps {
  value: string;
  onSelect: (streetId: string | null) => void;
  error?: string;
  placeholder?: string;
  subdivisionId?: string | null; // Filter streets by subdivision
}

export default function StreetSelector({
  value,
  onSelect,
  error,
  placeholder = '🛣️ Search streets or create new',
  subdivisionId = null,
}: StreetSelectorProps) {
  const { userProfile } = useAuth();
  const [streets, setStreets] = useState<Street[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [newStreetName, setNewStreetName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  // Load streets for the user's barangay
  const loadStreets = useCallback(async () => {
    if (!userProfile?.barangay_code) {
      logger.debug('No barangay_code available, cannot load streets');
      return;
    }

    logger.debug('Loading streets for barangay', {
      barangayCode: userProfile.barangay_code,
      subdivisionId,
    });
    setLoading(true);
    try {
      let query = supabase
        .from('geo_streets')
        .select(
          `
          id,
          name,
          barangay_code,
          subdivision_id,
          description,
          geo_subdivisions (
            name
          )
        `
        )
        .eq('barangay_code', userProfile.barangay_code)
        .eq('is_active', true)
        .order('name', { ascending: true });

      // Filter by subdivision if provided
      if (subdivisionId) {
        query = query.eq('subdivision_id', subdivisionId);
      } else {
        // Show streets without subdivision or null subdivision
        query = query.is('subdivision_id', null);
      }

      const { data: streetsData, error } = await query;

      if (error) {
        logger.error('Error loading streets', { error });
        return;
      }

      // Format the data
      const formattedStreets = (streetsData || []).map(street => ({
        id: street.id,
        name: street.name,
        barangay_code: street.barangay_code,
        subdivision_id: street.subdivision_id,
        subdivision_name: (street.geo_subdivisions as any)?.name || null,
        description: street.description,
      }));

      logger.debug('Loaded streets', { count: formattedStreets.length });
      setStreets(formattedStreets);
    } catch (error) {
      logError(error as Error, 'STREET_LOAD_ERROR');
    } finally {
      setLoading(false);
    }
  }, [userProfile?.barangay_code, subdivisionId]);

  // Load streets when barangay or subdivision changes
  useEffect(() => {
    loadStreets();
  }, [loadStreets]);

  // Create new street
  const createStreet = async () => {
    if (!newStreetName.trim() || !userProfile?.barangay_code) return;

    setIsCreating(true);
    try {
      logger.info('Creating new street', { name: newStreetName.trim() });

      // Derive geographic codes from barangay code
      const barangayCode = userProfile.barangay_code;
      const regionCode = barangayCode.substring(0, 2);
      const provinceCode = barangayCode.substring(0, 4);
      const cityMunicipalityCode = barangayCode.substring(0, 6);

      const { data: newStreet, error } = await supabase
        .from('geo_streets')
        .insert([
          {
            name: newStreetName.trim(),
            subdivision_id: subdivisionId,
            barangay_code: barangayCode,
            city_municipality_code: cityMunicipalityCode,
            province_code: provinceCode,
            region_code: regionCode,
            created_by: userProfile.id,
          },
        ])
        .select('id, name')
        .single();

      if (error) {
        logger.error('Error creating street', { error });
        alert(`Failed to create street: ${error.message}`);
        return;
      }

      logger.info('Created new street', { streetId: newStreet.id, name: newStreet.name });

      // Select the newly created street
      onSelect(newStreet.id);
      setNewStreetName('');
      setShowCreateForm(false);
      setIsOpen(false);

      // Refresh streets list
      setTimeout(() => {
        loadStreets();
      }, 500);
    } catch (error) {
      logError(error as Error, 'STREET_CREATION_ERROR');
      alert('An unexpected error occurred while creating the street.');
    } finally {
      setIsCreating(false);
    }
  };

  // Filter streets based on search term
  const filteredStreets = streets.filter(street => {
    const searchLower = searchTerm.toLowerCase();
    return (
      street.name.toLowerCase().includes(searchLower) ||
      street.subdivision_name?.toLowerCase().includes(searchLower)
    );
  });

  const selectedStreet = streets.find(s => s.id === value);

  // Helper function to format display name
  const formatDisplayName = (street: Street) => {
    if (street.subdivision_name) {
      return `${street.name} (${street.subdivision_name})`;
    }
    return street.name;
  };

  return (
    <div className="relative">
      <div
        className={`font-montserrat relative rounded border text-base focus-within:border-transparent focus-within:ring-2 ${
          error
            ? 'border-red-500 focus-within:ring-red-500'
            : 'border-neutral-300 focus-within:ring-blue-500'
        }`}
      >
        <input
          type="text"
          value={selectedStreet ? formatDisplayName(selectedStreet) : searchTerm}
          onChange={e => {
            setSearchTerm(e.target.value);
            setIsOpen(true);
            if (!e.target.value) {
              onSelect(null);
            }
          }}
          onFocus={() => setIsOpen(true)}
          className="w-full bg-transparent px-3 py-2 outline-none"
          placeholder={placeholder}
        />

        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-neutral-500 hover:text-neutral-700"
        >
          <svg className="size-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d={isOpen ? 'M5 15l7-7 7 7' : 'M19 9l-7 7-7-7'}
            />
          </svg>
        </button>
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-10 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-neutral-300 bg-white shadow-lg">
          {loading ? (
            <div className="p-3 text-center text-neutral-500">
              <div className="animate-pulse">Loading streets...</div>
            </div>
          ) : (
            <div>
              {/* Create new street option */}
              {!showCreateForm ? (
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(true);
                    setNewStreetName(searchTerm);
                  }}
                  className="w-full border-b border-neutral-100 p-3 text-left hover:bg-blue-50"
                >
                  <div className="font-medium text-blue-600">+ Create New Street</div>
                  <div className="text-xs text-blue-500">
                    {searchTerm ? `Create "${searchTerm}"` : 'Add a new street to this area'}
                  </div>
                </button>
              ) : (
                <div className="border-b border-neutral-100 p-3">
                  <div className="mb-2 font-medium text-blue-600">Create New Street</div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newStreetName}
                      onChange={e => setNewStreetName(e.target.value)}
                      placeholder="Enter street name"
                      className="flex-1 rounded border border-neutral-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none"
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          createStreet();
                        } else if (e.key === 'Escape') {
                          setShowCreateForm(false);
                          setNewStreetName('');
                        }
                      }}
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={createStreet}
                      disabled={!newStreetName.trim() || isCreating}
                      className="rounded bg-blue-600 px-3 py-1 text-xs text-white hover:bg-blue-700 disabled:bg-neutral-400"
                    >
                      {isCreating ? '...' : 'Add'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowCreateForm(false);
                        setNewStreetName('');
                      }}
                      className="rounded bg-neutral-400 px-2 py-1 text-xs text-white hover:bg-neutral-500"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )}

              {/* Show message when no existing streets */}
              {filteredStreets.length === 0 && !searchTerm && (
                <div className="p-3 text-center text-neutral-500">
                  <div className="text-sm">No streets found in this area</div>
                  <div className="mt-1 text-xs text-green-600">✓ Create the first street above</div>
                </div>
              )}

              {/* Show "no search results" when searching */}
              {filteredStreets.length === 0 && searchTerm && !showCreateForm && (
                <div className="p-3 text-center text-neutral-500">
                  <div className="text-sm">No streets match your search</div>
                </div>
              )}

              {/* Existing streets */}
              {filteredStreets.map(street => (
                <button
                  key={street.id}
                  type="button"
                  onClick={() => {
                    onSelect(street.id);
                    setSearchTerm('');
                    setIsOpen(false);
                    setShowCreateForm(false);
                  }}
                  className="w-full border-b border-neutral-100 p-3 text-left last:border-b-0 hover:bg-neutral-50"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-neutral-900">{street.name}</div>
                      {street.subdivision_name && (
                        <div className="text-sm text-neutral-600">in {street.subdivision_name}</div>
                      )}
                      {street.description && (
                        <div className="text-xs text-neutral-500">{street.description}</div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => {
            setIsOpen(false);
            setShowCreateForm(false);
          }}
        />
      )}

      {/* Error message */}
      {error && (
        <p className="mt-2 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
