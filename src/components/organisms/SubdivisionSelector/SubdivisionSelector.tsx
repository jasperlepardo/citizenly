'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { logger, logError } from '@/lib/secure-logger';

interface Subdivision {
  id: string;
  name: string;
  type: string;
  barangay_code: string;
  description?: string;
}

interface SubdivisionSelectorProps {
  value: string;
  onSelect: (subdivisionId: string | null) => void;
  error?: string;
  placeholder?: string;
}

export default function SubdivisionSelector({
  value,
  onSelect,
  error,
  placeholder = '🏘️ Search subdivisions or create new',
}: SubdivisionSelectorProps) {
  const { userProfile } = useAuth();
  const [subdivisions, setSubdivisions] = useState<Subdivision[]>([]);
  const [loading, setLoading] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [newSubdivisionData, setNewSubdivisionData] = useState({
    name: '',
    type: 'Subdivision' as 'Subdivision' | 'Zone' | 'Sitio' | 'Purok',
  });
  const [isCreating, setIsCreating] = useState(false);

  // Load subdivisions for the user's barangay
  const loadSubdivisions = useCallback(async () => {
    if (!userProfile?.barangay_code) {
      logger.debug('No barangay_code available, cannot load subdivisions');
      return;
    }

    logger.debug('Loading subdivisions for barangay', { barangayCode: userProfile.barangay_code });
    setLoading(true);
    try {
      const { data: subdivisionsData, error } = await supabase
        .from('geo_subdivisions')
        .select('id, name, type, barangay_code, description')
        .eq('barangay_code', userProfile.barangay_code)
        .eq('is_active', true)
        .order('name', { ascending: true });

      if (error) {
        logger.error('Error loading subdivisions', { error });
        return;
      }

      logger.debug('Loaded subdivisions', { count: subdivisionsData?.length || 0 });
      setSubdivisions(subdivisionsData || []);
    } catch (error) {
      logError(error as Error, 'SUBDIVISION_LOAD_ERROR');
    } finally {
      setLoading(false);
    }
  }, [userProfile?.barangay_code]);

  // Load subdivisions when barangay changes
  useEffect(() => {
    loadSubdivisions();
  }, [loadSubdivisions]);

  // Create new subdivision
  const createSubdivision = async () => {
    if (!newSubdivisionData.name.trim() || !userProfile?.barangay_code) return;

    setIsCreating(true);
    try {
      logger.info('Creating new subdivision', {
        name: newSubdivisionData.name.trim(),
        type: newSubdivisionData.type,
      });

      // Derive geographic codes from barangay code
      const barangayCode = userProfile.barangay_code;
      const regionCode = barangayCode.substring(0, 2);
      const provinceCode = barangayCode.substring(0, 4);
      const cityMunicipalityCode = barangayCode.substring(0, 6);

      const { data: newSubdivision, error } = await supabase
        .from('geo_subdivisions')
        .insert([
          {
            name: newSubdivisionData.name.trim(),
            type: newSubdivisionData.type,
            barangay_code: barangayCode,
            city_municipality_code: cityMunicipalityCode,
            province_code: provinceCode,
            region_code: regionCode,
            created_by: userProfile.id,
          },
        ])
        .select('id, name, type')
        .single();

      if (error) {
        logger.error('Error creating subdivision', { error });
        alert(`Failed to create subdivision: ${error.message}`);
        return;
      }

      logger.info('Created new subdivision', {
        subdivisionId: newSubdivision.id,
        name: newSubdivision.name,
        type: newSubdivision.type,
      });

      // Select the newly created subdivision
      onSelect(newSubdivision.id);
      setNewSubdivisionData({ name: '', type: 'Subdivision' });
      setShowCreateForm(false);
      setIsOpen(false);

      // Refresh subdivisions list
      setTimeout(() => {
        loadSubdivisions();
      }, 500);
    } catch (error) {
      logError(error as Error, 'SUBDIVISION_CREATION_ERROR');
      alert('An unexpected error occurred while creating the subdivision.');
    } finally {
      setIsCreating(false);
    }
  };

  // Filter subdivisions based on search term
  const filteredSubdivisions = subdivisions.filter(subdivision => {
    const searchLower = searchTerm.toLowerCase();
    return (
      subdivision.name.toLowerCase().includes(searchLower) ||
      subdivision.type.toLowerCase().includes(searchLower)
    );
  });

  const selectedSubdivision = subdivisions.find(s => s.id === value);

  // Helper function to format display name
  const formatDisplayName = (subdivision: Subdivision) => {
    return `${subdivision.name} (${subdivision.type})`;
  };

  const subdivisionTypes = ['Subdivision', 'Zone', 'Sitio', 'Purok'] as const;

  return (
    <div className="relative">
      <div
        className={`font-montserrat relative rounded border text-base focus-within:border-transparent focus-within:ring-2 ${
          error
            ? 'border-red-500 focus-within:ring-red-500'
            : 'border-gray-300 focus-within:ring-blue-500'
        }`}
      >
        <input
          type="text"
          value={selectedSubdivision ? formatDisplayName(selectedSubdivision) : searchTerm}
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
          className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
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
        <div className="absolute z-10 mt-1 max-h-60 w-full overflow-y-auto rounded-lg border border-gray-300 bg-white shadow-lg">
          {loading ? (
            <div className="p-3 text-center text-gray-500">
              <div className="animate-pulse">Loading subdivisions...</div>
            </div>
          ) : (
            <div>
              {/* Create new subdivision option */}
              {!showCreateForm ? (
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(true);
                    setNewSubdivisionData(prev => ({ ...prev, name: searchTerm }));
                  }}
                  className="w-full border-b border-gray-100 p-3 text-left hover:bg-blue-50"
                >
                  <div className="font-medium text-gray-600">+ Create New Subdivision</div>
                  <div className="text-xs text-gray-500">
                    {searchTerm
                      ? `Create "${searchTerm}"`
                      : 'Add a new subdivision/zone/sitio/purok'}
                  </div>
                </button>
              ) : (
                <div className="border-b border-gray-100 p-3">
                  <div className="mb-2 font-medium text-gray-600">Create New Subdivision</div>
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={newSubdivisionData.name}
                      onChange={e =>
                        setNewSubdivisionData(prev => ({ ...prev, name: e.target.value }))
                      }
                      placeholder="Enter subdivision name"
                      className="w-full rounded border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none"
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          createSubdivision();
                        } else if (e.key === 'Escape') {
                          setShowCreateForm(false);
                          setNewSubdivisionData({ name: '', type: 'Subdivision' });
                        }
                      }}
                      autoFocus
                    />
                    <div className="flex items-center gap-2">
                      <select
                        value={newSubdivisionData.type}
                        onChange={e =>
                          setNewSubdivisionData(prev => ({
                            ...prev,
                            type: e.target.value as typeof prev.type,
                          }))
                        }
                        className="flex-1 rounded border border-gray-300 px-2 py-1 text-sm focus:border-blue-500 focus:outline-none"
                      >
                        {subdivisionTypes.map(type => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={createSubdivision}
                        disabled={!newSubdivisionData.name.trim() || isCreating}
                        className="rounded bg-blue-600 px-3 py-1 text-xs text-white hover:bg-blue-700 disabled:bg-gray-400"
                      >
                        {isCreating ? '...' : 'Add'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setShowCreateForm(false);
                          setNewSubdivisionData({ name: '', type: 'Subdivision' });
                        }}
                        className="rounded bg-gray-400 px-2 py-1 text-xs text-white hover:bg-gray-500"
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Show message when no existing subdivisions */}
              {filteredSubdivisions.length === 0 && !searchTerm && (
                <div className="p-3 text-center text-gray-500">
                  <div className="text-sm">No subdivisions found in this barangay</div>
                  <div className="mt-1 text-xs text-green-600">
                    ✓ Create the first subdivision above
                  </div>
                </div>
              )}

              {/* Show "no search results" when searching */}
              {filteredSubdivisions.length === 0 && searchTerm && !showCreateForm && (
                <div className="p-3 text-center text-gray-500">
                  <div className="text-sm">No subdivisions match your search</div>
                </div>
              )}

              {/* Existing subdivisions */}
              {filteredSubdivisions.map(subdivision => (
                <button
                  key={subdivision.id}
                  type="button"
                  onClick={() => {
                    onSelect(subdivision.id);
                    setSearchTerm('');
                    setIsOpen(false);
                    setShowCreateForm(false);
                  }}
                  className="w-full border-b border-gray-100 p-3 text-left last:border-b-0 hover:bg-gray-50"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">{subdivision.name}</div>
                      <div className="text-sm text-gray-600">Type: {subdivision.type}</div>
                      {subdivision.description && (
                        <div className="text-xs text-gray-500">{subdivision.description}</div>
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
