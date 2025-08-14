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
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        <h1 className="mb-6 text-2xl font-bold text-gray-900">Geographic Selector Example</h1>

        <CascadingGeographicSelector onSelectionChange={handleSelectionChange} required />

        <div className="mt-6">
          <button
            onClick={handleSubmit}
            disabled={!formData.barangayCode}
            className="w-full rounded-lg bg-blue-600 px-4 py-2 text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-gray-300"
          >
            Submit (Check Console)
          </button>
        </div>
      </div>

      {/* Current Selection Display */}
      <div className="rounded-lg bg-gray-50 p-4">
        <h3 className="mb-3 font-semibold text-gray-800">Current Selection Data:</h3>
        <pre className="overflow-auto text-sm text-gray-600">
          {JSON.stringify(formData, null, 2)}
        </pre>
      </div>

      {/* API Data Preview */}
      {formData.barangayCode && (
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <h3 className="mb-3 font-semibold text-gray-800">Data sent to API (codes only):</h3>
          <pre className="text-sm text-gray-700">
            {JSON.stringify(
              {
                regionCode: formData.regionCode,
                provinceCode: formData.provinceCode,
                cityMunicipalityCode: formData.cityCode,
                barangayCode: formData.barangayCode,
              },
              null,
              2
            )}
          </pre>
        </div>
      )}
    </div>
  );
}
