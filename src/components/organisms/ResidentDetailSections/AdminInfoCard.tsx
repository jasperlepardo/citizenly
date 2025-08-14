/**
 * System Metadata Card for Resident Detail View
 *
 * @description Displays system administrative data including barangay code, status, and creation timestamp
 * @author Citizenly Development Team
 * @version 1.0.0
 */

import React from 'react';

interface AdminInfoCardProps {
  resident: {
    barangay_code: string;
    is_active?: boolean;
    created_at: string;
  };
  formatDate: (dateString: string) => string;
}

/**
 * Administrative Information Card Component
 *
 * @description Renders administrative information section for resident detail view
 * @param props - Component props containing administrative data and utility functions
 * @returns JSX element for administrative information display
 *
 * @example
 * ```typescript
 * <AdminInfoCard
 *   resident={resident}
 *   formatDate={formatDate}
 * />
 * ```
 */
export default function AdminInfoCard({ resident, formatDate }: AdminInfoCardProps) {
  return (
    <div className="bg-surface border-default rounded-xl border p-6 shadow-sm transition-shadow hover:shadow-md">
      <h2 className="text-primary mb-4 flex items-center gap-2 text-xl font-semibold">
        ⚙️ Administrative Information
      </h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div>
          <span className="text-secondary block text-sm font-medium">Barangay Code</span>
          <span className="text-primary">{resident.barangay_code}</span>
        </div>
        <div>
          <span className="text-secondary block text-sm font-medium">Status</span>
          <span className="text-primary">{resident.is_active ? 'Active' : 'Inactive'}</span>
        </div>
        <div>
          <span className="text-secondary block text-sm font-medium">Created</span>
          <span className="text-primary">{formatDate(resident.created_at)}</span>
        </div>
      </div>
    </div>
  );
}
