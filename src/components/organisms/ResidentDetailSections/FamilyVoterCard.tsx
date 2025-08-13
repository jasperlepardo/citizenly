/**
 * Mother's Maiden Name & Voter Information Card for Resident Detail View
 * 
 * @description Displays mother's maiden name and voter registration information
 * @author Citizenly Development Team
 * @version 1.0.0
 */

import React from 'react';

interface FamilyVoterCardProps {
  resident: {
    mother_maiden_first?: string;
    mother_maiden_middle?: string;
    mother_maiden_last?: string;
    is_voter?: boolean;
    is_resident_voter?: boolean;
    last_voted_date?: string;
  };
  formatDate: (dateString: string) => string;
}

/**
 * Family & Voter Card Component
 * 
 * @description Renders family and voter information section for resident detail view
 * @param props - Component props containing resident family/voter data and utility functions
 * @returns JSX element for family and voter information display
 * 
 * @example
 * ```typescript
 * <FamilyVoterCard
 *   resident={resident}
 *   formatDate={formatDate}
 * />
 * ```
 */
export default function FamilyVoterCard({ resident, formatDate }: FamilyVoterCardProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Family Information */}
      <div className="bg-surface rounded-xl shadow-sm border border-default p-6 hover:shadow-md transition-shadow">
        <h2 className="text-xl font-semibold text-primary mb-4 flex items-center gap-2">
          👨‍👩‍👧‍👦 Family Information
        </h2>
        <div className="space-y-3">
          <div>
            <span className="text-sm font-medium text-secondary block">Mother&rsquo;s Maiden Name</span>
            <span className="text-primary">
              {[resident.mother_maiden_first, resident.mother_maiden_middle, resident.mother_maiden_last]
                .filter(Boolean).join(' ') || '-'}
            </span>
          </div>
        </div>
      </div>

      {/* Voter Information */}
      <div className="bg-surface rounded-xl shadow-sm border border-default p-6 hover:shadow-md transition-shadow">
        <h2 className="text-xl font-semibold text-primary mb-4 flex items-center gap-2">
          🗳️ Voter Information
        </h2>
        <div className="space-y-3">
          <div>
            <span className="text-sm font-medium text-secondary block">Registered Voter</span>
            <span className="text-primary">{resident.is_voter ? 'Yes' : 'No'}</span>
          </div>
          <div>
            <span className="text-sm font-medium text-secondary block">Resident Voter</span>
            <span className="text-primary">{resident.is_resident_voter ? 'Yes' : 'No'}</span>
          </div>
          <div>
            <span className="text-sm font-medium text-secondary block">Last Voted Date</span>
            <span className="text-primary">{formatDate(resident.last_voted_date || '')}</span>
          </div>
        </div>
      </div>
    </div>
  );
}