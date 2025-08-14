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
    height?: number;
    weight?: number;
    complexion?: string;
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
    <div className="bg-surface border-default rounded-xl border p-6 shadow-sm transition-shadow hover:shadow-md">
      <h2 className="text-primary mb-4 flex items-center gap-2 text-xl font-semibold">
        🏥 Health & Physical
      </h2>
      <div className="space-y-3">
        <div>
          <span className="text-secondary block text-sm font-medium">Blood Type</span>
          <span className="text-primary">{resident.blood_type || '-'}</span>
        </div>
        <div>
          <span className="text-secondary block text-sm font-medium">Height</span>
          <span className="text-primary">{resident.height ? `${resident.height} cm` : '-'}</span>
        </div>
        <div>
          <span className="text-secondary block text-sm font-medium">Weight</span>
          <span className="text-primary">{resident.weight ? `${resident.weight} kg` : '-'}</span>
        </div>
        <div>
          <span className="text-secondary block text-sm font-medium">Complexion</span>
          <span className="text-primary">{resident.complexion || '-'}</span>
        </div>
      </div>
    </div>
  );
}
