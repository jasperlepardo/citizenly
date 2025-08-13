'use client';

import React, { useState } from 'react';
import { CascadingGeographicSelector } from '@/components/molecules/CascadingGeographicSelector';

export function GeographicSelectorExample() {
  const [formData, setFormData] = useState({
    regionCode: null,
    regionName: null,
    provinceCode: null,
    provinceName: null,
    cityCode: null,
    cityName: null,
    barangayCode: null,
    barangayName: null,
  });

  const handleSelectionChange = (selection: any) => {
    setFormData(selection);
    console.log('Geographic Selection Updated:', selection);
  };

  const handleSubmit = () => {
    // This is what gets sent to the API - only the codes
    const dataToSubmit = {
      regionCode: formData.regionCode,
      provinceCode: formData.provinceCode,
      cityMunicipalityCode: formData.cityCode,
      barangayCode: formData.barangayCode,
      // Names are stored locally for display but not submitted
    };
    
    console.log('Data to submit to API:', dataToSubmit);
    alert('Check console for submitted data');
  };

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Geographic Selector Example
        </h1>
        
        <CascadingGeographicSelector
          onSelectionChange={handleSelectionChange}
          required
        />
        
        <div className="mt-6">
          <button
            onClick={handleSubmit}
            disabled={!formData.barangayCode}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
          >
            Submit (Check Console)
          </button>
        </div>
      </div>

      {/* Current Selection Display */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-semibold text-gray-800 mb-3">Current Selection Data:</h3>
        <pre className="text-sm text-gray-600 overflow-auto">
          {JSON.stringify(formData, null, 2)}
        </pre>
      </div>

      {/* API Data Preview */}
      {formData.barangayCode && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-3">Data sent to API (codes only):</h3>
          <pre className="text-sm text-blue-700">
            {JSON.stringify({
              regionCode: formData.regionCode,
              provinceCode: formData.provinceCode,
              cityMunicipalityCode: formData.cityCode,
              barangayCode: formData.barangayCode,
            }, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}