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
    philsys_card_number?: string;
    first_name: string;
    middle_name?: string;
    last_name: string;
    extension_name?: string;
    sex: 'male' | 'female';
    birthdate: string;
    civil_status: string;
    citizenship?: string;
    birth_place_name?: string;
    education_attainment?: string;
    is_graduate?: boolean;
    employment_status?: string;
    occupation_title?: string;
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
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-300 dark:border-gray-600 p-6 shadow-xs transition-shadow hover:shadow-md">
      <h2 className="mb-4 flex items-center gap-2 text-xl font-semibold text-gray-600 dark:text-gray-400">
        📋 Section 1: Personal Information
      </h2>
      <div className="space-y-3">
        {/* PhilSys Card Number */}
        {resident.philsys_card_number && (
          <div>
            <span className="block text-sm font-medium text-gray-600 dark:text-gray-400">PhilSys Card Number</span>
            <span className="text-gray-600 dark:text-gray-400">{resident.philsys_card_number}</span>
          </div>
        )}
        
        {/* Name Information */}
        <div>
          <span className="block text-sm font-medium text-gray-600 dark:text-gray-400">Full Name</span>
          <span className="text-gray-600 dark:text-gray-400">{formatFullName(resident)}</span>
        </div>
        
        {/* Date of Birth & Age */}
        <div>
          <span className="block text-sm font-medium text-gray-600 dark:text-gray-400">Date of Birth (Age)</span>
          <span className="text-gray-600 dark:text-gray-400">
            {formatDate(resident.birthdate)} (Age: {calculateAge(resident.birthdate)})
          </span>
        </div>
        
        {/* Birth Place */}
        <div>
          <span className="block text-sm font-medium text-gray-600 dark:text-gray-400">Birth Place</span>
          <span className="text-gray-600 dark:text-gray-400">{resident.birth_place_name || '-'}</span>
        </div>
        
        {/* Sex */}
        <div>
          <span className="block text-sm font-medium text-gray-600 dark:text-gray-400">Sex</span>
          <span className="text-gray-600 dark:text-gray-400">
            {resident.sex ? resident.sex.charAt(0).toUpperCase() + resident.sex.slice(1) : '-'}
          </span>
        </div>
        
        {/* Civil Status */}
        <div>
          <span className="block text-sm font-medium text-gray-600 dark:text-gray-400">Civil Status</span>
          <span className="text-gray-600 dark:text-gray-400">{resident.civil_status || '-'}</span>
        </div>
        
        {/* Highest Educational Attainment */}
        <div>
          <span className="block text-sm font-medium text-gray-600 dark:text-gray-400">Highest Educational Attainment</span>
          <span className="text-gray-600 dark:text-gray-400">{resident.education_attainment || '-'}</span>
        </div>
        
        {/* Graduate */}
        <div>
          <span className="block text-sm font-medium text-gray-600 dark:text-gray-400">Graduate (Y/N)</span>
          <span className="text-gray-600 dark:text-gray-400">
            {resident.is_graduate !== undefined ? (resident.is_graduate ? 'Yes' : 'No') : '-'}
          </span>
        </div>
        
        {/* Employment Status */}
        <div>
          <span className="block text-sm font-medium text-gray-600 dark:text-gray-400">Employment Status</span>
          <span className="text-gray-600 dark:text-gray-400">{resident.employment_status || '-'}</span>
        </div>
        
        {/* Occupation Name */}
        <div>
          <span className="block text-sm font-medium text-gray-600 dark:text-gray-400">Occupation Name</span>
          <span className="text-gray-600 dark:text-gray-400">{resident.occupation_title || '-'}</span>
        </div>
      </div>
    </div>
  );
}
