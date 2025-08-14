/**
 * Sectoral Information Card for Resident Detail View
 *
 * @description Displays sectoral information including employment sectors and demographics
 * @author Citizenly Development Team
 * @version 1.0.0
 */

import React from 'react';

interface SectoralInfoCardProps {
  sectoralInfo: {
    is_labor_force?: boolean;
    is_labor_force_employed?: boolean;
    is_unemployed?: boolean;
    is_overseas_filipino_worker?: boolean;
    is_person_with_disability?: boolean;
    is_out_of_school_children?: boolean;
    is_out_of_school_youth?: boolean;
    is_senior_citizen?: boolean;
    is_registered_senior_citizen?: boolean;
    is_solo_parent?: boolean;
    is_indigenous_people?: boolean;
    is_migrant?: boolean;
  };
}

/**
 * Sectoral Information Card Component
 *
 * @description Renders sectoral information section for resident detail view
 * @param props - Component props containing sectoral information data
 * @returns JSX element for sectoral information display
 *
 * @example
 * ```typescript
 * <SectoralInfoCard sectoralInfo={resident.sectoral_info} />
 * ```
 */
export default function SectoralInfoCard({ sectoralInfo }: SectoralInfoCardProps) {
  if (!sectoralInfo) return null;

  return (
    <div className="bg-default rounded-xl border border-default p-6 shadow-sm transition-shadow hover:shadow-md">
      <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-gray-600">
        🎯 Sectoral Information
      </h2>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-600">Labor Force:</span>
          <span className="text-gray-600">{sectoralInfo.is_labor_force ? 'Yes' : 'No'}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-600">Employed:</span>
          <span className="text-gray-600">
            {sectoralInfo.is_labor_force_employed ? 'Yes' : 'No'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-600">Unemployed:</span>
          <span className="text-gray-600">{sectoralInfo.is_unemployed ? 'Yes' : 'No'}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-600">OFW:</span>
          <span className="text-gray-600">
            {sectoralInfo.is_overseas_filipino_worker ? 'Yes' : 'No'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-600">PWD:</span>
          <span className="text-gray-600">
            {sectoralInfo.is_person_with_disability ? 'Yes' : 'No'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-600">OSC:</span>
          <span className="text-gray-600">
            {sectoralInfo.is_out_of_school_children ? 'Yes' : 'No'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-600">OSY:</span>
          <span className="text-gray-600">{sectoralInfo.is_out_of_school_youth ? 'Yes' : 'No'}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-600">Senior Citizen:</span>
          <span className="text-gray-600">{sectoralInfo.is_senior_citizen ? 'Yes' : 'No'}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-600">Solo Parent:</span>
          <span className="text-gray-600">{sectoralInfo.is_solo_parent ? 'Yes' : 'No'}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-600">Indigenous People:</span>
          <span className="text-gray-600">{sectoralInfo.is_indigenous_people ? 'Yes' : 'No'}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-600">Migrant:</span>
          <span className="text-gray-600">{sectoralInfo.is_migrant ? 'Yes' : 'No'}</span>
        </div>
      </div>
    </div>
  );
}
