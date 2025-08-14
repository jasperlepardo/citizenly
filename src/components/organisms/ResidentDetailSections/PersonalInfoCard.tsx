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
    <div className="bg-default rounded-xl border border-default p-6 shadow-sm transition-shadow hover:shadow-md">
      <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-gray-600">
        👤 Personal Information
      </h2>
      <div className="space-y-3">
        <div>
          <span className="block text-sm font-medium text-gray-600">Full Name</span>
          <span className="text-gray-600">{formatFullName(resident)}</span>
        </div>
        <div>
          <span className="block text-sm font-medium text-gray-600">Sex</span>
          <span className="text-gray-600">
            {resident.sex ? resident.sex.charAt(0).toUpperCase() + resident.sex.slice(1) : '-'}
          </span>
        </div>
        <div>
          <span className="block text-sm font-medium text-gray-600">Date of Birth</span>
          <span className="text-gray-600">
            {formatDate(resident.birthdate)} (Age: {calculateAge(resident.birthdate)})
          </span>
        </div>
        <div>
          <span className="block text-sm font-medium text-gray-600">Civil Status</span>
          <span className="text-gray-600">{resident.civil_status || '-'}</span>
        </div>
        <div>
          <span className="block text-sm font-medium text-gray-600">Citizenship</span>
          <span className="text-gray-600">{resident.citizenship || '-'}</span>
        </div>
        <div>
          <span className="block text-sm font-medium text-gray-600">Religion</span>
          <span className="text-gray-600">{resident.religion || '-'}</span>
        </div>
        <div>
          <span className="block text-sm font-medium text-gray-600">Ethnicity</span>
          <span className="text-gray-600">{resident.ethnicity || '-'}</span>
        </div>
        <div>
          <span className="block text-sm font-medium text-gray-600">Birth Place</span>
          <span className="text-gray-600">{resident.birth_place_name || '-'}</span>
        </div>
      </div>
    </div>
  );
}
