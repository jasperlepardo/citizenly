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
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-300 dark:border-gray-600 p-6 shadow-xs transition-shadow hover:shadow-md">
      <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-gray-600 dark:text-gray-400">
        👥 Section 4: Sectoral Information
      </h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Labor Force / Employed:</span>
          <span className="text-gray-600 dark:text-gray-400">{sectoralInfo.is_labor_force_employed ? 'Yes' : 'No'}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Unemployed:</span>
          <span className="text-gray-600 dark:text-gray-400">{sectoralInfo.is_unemployed ? 'Yes' : 'No'}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Overseas Filipino Worker:</span>
          <span className="text-gray-600 dark:text-gray-400">
            {sectoralInfo.is_overseas_filipino_worker ? 'Yes' : 'No'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Persons with Disability:</span>
          <span className="text-gray-600 dark:text-gray-400">
            {sectoralInfo.is_person_with_disability ? 'Yes' : 'No'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Out of School Children:</span>
          <span className="text-gray-600 dark:text-gray-400">
            {sectoralInfo.is_out_of_school_children ? 'Yes' : 'No'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Out of School Youth:</span>
          <span className="text-gray-600 dark:text-gray-400">{sectoralInfo.is_out_of_school_youth ? 'Yes' : 'No'}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Senior Citizen:</span>
          <span className="text-gray-600 dark:text-gray-400">{sectoralInfo.is_senior_citizen ? 'Yes' : 'No'}</span>
        </div>
        {sectoralInfo.is_registered_senior_citizen !== undefined && (
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Please specify if registered SC:</span>
            <span className="text-gray-600 dark:text-gray-400">{sectoralInfo.is_registered_senior_citizen ? 'Yes' : 'No'}</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Solo Parent:</span>
          <span className="text-gray-600 dark:text-gray-400">{sectoralInfo.is_solo_parent ? 'Yes' : 'No'}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Indigenous People:</span>
          <span className="text-gray-600 dark:text-gray-400">{sectoralInfo.is_indigenous_people ? 'Yes' : 'No'}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Migrant:</span>
          <span className="text-gray-600 dark:text-gray-400">{sectoralInfo.is_migrant ? 'Yes' : 'No'}</span>
        </div>
      </div>
    </div>
  );
}
