/**
 * Health & Physical Information Card for Resident Detail View
 *
 * @description Displays health and physical characteristics
 * @author Citizenly Development Team
 * @version 1.0.0
 */

import React from 'react';

interface HealthPhysicalCardProps {
  resident: {
    blood_type?: string;
    complexion?: string;
    height?: number;
    weight?: number;
    citizenship?: string;
    ethnicity?: string;
    religion?: string;
    is_voter?: boolean;
    is_resident_voter?: boolean;
    last_voted_date?: string;
    mother_maiden_first?: string;
    mother_maiden_middle?: string;
    mother_maiden_last?: string;
  };
}

/**
 * Health & Physical Card Component
 *
 * @description Renders health and physical information section for resident detail view
 * @param props - Component props containing resident health/physical data
 * @returns JSX element for health and physical information display
 *
 * @example
 * ```typescript
 * <HealthPhysicalCard resident={resident} />
 * ```
 */
export default function HealthPhysicalCard({ resident }: HealthPhysicalCardProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-300 dark:border-gray-600 p-6 shadow-xs transition-shadow hover:shadow-md">
      <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-gray-600 dark:text-gray-400">
        🏥 Section 3: Physical & Personal Details
      </h2>
      <div className="space-y-3">
        {/* Blood Type */}
        <div>
          <span className="block text-sm font-medium text-gray-600 dark:text-gray-400">Blood Type</span>
          <span className="text-gray-600 dark:text-gray-400">{resident.blood_type || '-'}</span>
        </div>
        
        {/* Complexion */}
        <div>
          <span className="block text-sm font-medium text-gray-600 dark:text-gray-400">Complexion</span>
          <span className="text-gray-600 dark:text-gray-400">{resident.complexion || '-'}</span>
        </div>
        
        {/* Height */}
        <div>
          <span className="block text-sm font-medium text-gray-600 dark:text-gray-400">Height</span>
          <span className="text-gray-600 dark:text-gray-400">{resident.height ? `${resident.height} cm` : '-'}</span>
        </div>
        
        {/* Weight */}
        <div>
          <span className="block text-sm font-medium text-gray-600 dark:text-gray-400">Weight</span>
          <span className="text-gray-600 dark:text-gray-400">{resident.weight ? `${resident.weight} kg` : '-'}</span>
        </div>
        
        {/* Citizenship */}
        <div>
          <span className="block text-sm font-medium text-gray-600 dark:text-gray-400">Citizenship</span>
          <span className="text-gray-600 dark:text-gray-400">{resident.citizenship || '-'}</span>
        </div>
        
        {/* Ethnicity */}
        <div>
          <span className="block text-sm font-medium text-gray-600 dark:text-gray-400">Ethnicity</span>
          <span className="text-gray-600 dark:text-gray-400">{resident.ethnicity || '-'}</span>
        </div>
        
        {/* Religion */}
        <div>
          <span className="block text-sm font-medium text-gray-600 dark:text-gray-400">Religion</span>
          <span className="text-gray-600 dark:text-gray-400">{resident.religion || '-'}</span>
        </div>
        
        {/* Is Voter */}
        <div>
          <span className="block text-sm font-medium text-gray-600 dark:text-gray-400">Is Voter</span>
          <span className="text-gray-600 dark:text-gray-400">
            {resident.is_voter !== undefined ? (resident.is_voter ? 'Yes' : 'No') : '-'}
          </span>
        </div>
        
        {/* Resident Voter */}
        <div>
          <span className="block text-sm font-medium text-gray-600 dark:text-gray-400">Resident Voter (Y/N)</span>
          <span className="text-gray-600 dark:text-gray-400">
            {resident.is_resident_voter !== undefined ? (resident.is_resident_voter ? 'Yes' : 'No') : '-'}
          </span>
        </div>
        
        {/* Last Voted Year */}
        {resident.last_voted_date && (
          <div>
            <span className="block text-sm font-medium text-gray-600 dark:text-gray-400">Last Voted Year</span>
            <span className="text-gray-600 dark:text-gray-400">{resident.last_voted_date}</span>
          </div>
        )}
        
        {/* Mother's Maiden Name */}
        <div>
          <span className="block text-sm font-medium text-gray-600 dark:text-gray-400">Mother's Maiden Name</span>
          <span className="text-gray-600 dark:text-gray-400">
            {[resident.mother_maiden_first, resident.mother_maiden_middle, resident.mother_maiden_last]
              .filter(Boolean)
              .join(' ') || '-'}
          </span>
        </div>
      </div>
    </div>
  );
}
