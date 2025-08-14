/**
 * Migration Information Card for Resident Detail View
 *
 * @description Displays migration information for residents who have migrated
 * @author Citizenly Development Team
 * @version 1.0.0
 */

import React from 'react';

interface MigrationInfoCardProps {
  migrantInfo: {
    previous_barangay_code?: string;
    previous_city_municipality_code?: string;
    previous_province_code?: string;
    previous_region_code?: string;
    reason_for_leaving?: string;
    date_of_transfer?: string;
    reason_for_transferring?: string;
    duration_of_stay_current_months?: number;
    is_intending_to_return?: boolean;
    migration_type?: string;
  };
  formatDate: (dateString: string) => string;
}

/**
 * Migration Information Card Component
 *
 * @description Renders migration information section for resident detail view
 * @param props - Component props containing migration data and utility functions
 * @returns JSX element for migration information display
 *
 * @example
 * ```typescript
 * <MigrationInfoCard
 *   migrantInfo={resident.migrant_info}
 *   formatDate={formatDate}
 * />
 * ```
 */
export default function MigrationInfoCard({ migrantInfo, formatDate }: MigrationInfoCardProps) {
  if (!migrantInfo) return null;

  return (
    <div className="bg-default rounded-xl border border-default p-6 shadow-sm transition-shadow hover:shadow-md">
      <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-gray-600">
        🏃‍♂️ Migration Information
      </h2>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="space-y-3">
          <div>
            <span className="block text-sm font-medium text-gray-600">Previous Location</span>
            <span className="text-gray-600">
              {[
                migrantInfo.previous_barangay_code,
                migrantInfo.previous_city_municipality_code,
                migrantInfo.previous_province_code,
                migrantInfo.previous_region_code,
              ]
                .filter(Boolean)
                .join(', ') || '-'}
            </span>
          </div>
          <div>
            <span className="block text-sm font-medium text-gray-600">Reason for Leaving</span>
            <span className="text-gray-600">{migrantInfo.reason_for_leaving || '-'}</span>
          </div>
          <div>
            <span className="block text-sm font-medium text-gray-600">Date of Transfer</span>
            <span className="text-gray-600">{formatDate(migrantInfo.date_of_transfer || '')}</span>
          </div>
        </div>
        <div className="space-y-3">
          <div>
            <span className="block text-sm font-medium text-gray-600">
              Reason for Transferring
            </span>
            <span className="text-gray-600">{migrantInfo.reason_for_transferring || '-'}</span>
          </div>
          <div>
            <span className="block text-sm font-medium text-gray-600">
              Duration of Stay (months)
            </span>
            <span className="text-gray-600">
              {migrantInfo.duration_of_stay_current_months || '-'}
            </span>
          </div>
          <div>
            <span className="block text-sm font-medium text-gray-600">Intending to Return</span>
            <span className="text-gray-600">
              {migrantInfo.is_intending_to_return ? 'Yes' : 'No'}
            </span>
          </div>
          <div>
            <span className="block text-sm font-medium text-gray-600">Migration Type</span>
            <span className="text-gray-600">{migrantInfo.migration_type || '-'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
