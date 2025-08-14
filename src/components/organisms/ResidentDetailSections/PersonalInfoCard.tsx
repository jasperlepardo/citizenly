/**
 * Personal Information Card for Resident Detail View
 *
 * @description Displays personal information including name, birthdate, civil status, etc.
 * @author Citizenly Development Team
 * @version 1.0.0
 */

import React from 'react';

interface PersonalInfoCardProps {
  resident: {
    first_name: string;
    middle_name?: string;
    last_name: string;
    extension_name?: string;
    sex: 'male' | 'female';
    birthdate: string;
    civil_status: string;
    citizenship?: string;
    religion?: string;
    ethnicity?: string;
    birth_place_name?: string;
  };
  formatFullName: (resident: any) => string;
  formatDate: (dateString: string) => string;
  calculateAge: (birthdate: string) => string | number;
}

/**
 * Personal Information Card Component
 *
 * @description Renders personal information section for resident detail view
 * @param props - Component props containing resident data and utility functions
 * @returns JSX element for personal information display
 *
 * @example
 * ```typescript
 * <PersonalInfoCard
 *   resident={resident}
 *   formatFullName={formatFullName}
 *   formatDate={formatDate}
 *   calculateAge={calculateAge}
 * />
 * ```
 */
export default function PersonalInfoCard({
  resident,
  formatFullName,
  formatDate,
  calculateAge,
}: PersonalInfoCardProps) {
  return (
    <div className="bg-surface rounded-xl border border-default p-6 shadow-sm transition-shadow hover:shadow-md">
      <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-primary">
        👤 Personal Information
      </h2>
      <div className="space-y-3">
        <div>
          <span className="block text-sm font-medium text-secondary">Full Name</span>
          <span className="text-primary">{formatFullName(resident)}</span>
        </div>
        <div>
          <span className="block text-sm font-medium text-secondary">Sex</span>
          <span className="text-primary">
            {resident.sex ? resident.sex.charAt(0).toUpperCase() + resident.sex.slice(1) : '-'}
          </span>
        </div>
        <div>
          <span className="block text-sm font-medium text-secondary">Date of Birth</span>
          <span className="text-primary">
            {formatDate(resident.birthdate)} (Age: {calculateAge(resident.birthdate)})
          </span>
        </div>
        <div>
          <span className="block text-sm font-medium text-secondary">Civil Status</span>
          <span className="text-primary">{resident.civil_status || '-'}</span>
        </div>
        <div>
          <span className="block text-sm font-medium text-secondary">Citizenship</span>
          <span className="text-primary">{resident.citizenship || '-'}</span>
        </div>
        <div>
          <span className="block text-sm font-medium text-secondary">Religion</span>
          <span className="text-primary">{resident.religion || '-'}</span>
        </div>
        <div>
          <span className="block text-sm font-medium text-secondary">Ethnicity</span>
          <span className="text-primary">{resident.ethnicity || '-'}</span>
        </div>
        <div>
          <span className="block text-sm font-medium text-secondary">Birth Place</span>
          <span className="text-primary">{resident.birth_place_name || '-'}</span>
        </div>
      </div>
    </div>
  );
}
